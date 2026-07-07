// Supabase Edge Function: notify-meal-plan
//
// Sends an email to the kitchen whenever a customer selects or edits
// their meals / plan. The client calls this via supabase.functions.invoke.
//
// Deploy (dashboard, no CLI needed):
//   1. Supabase Dashboard → Edge Functions → Deploy a new function
//      → name it exactly "notify-meal-plan", paste this file, deploy.
//   2. Edge Functions → Secrets, add:
//        RESEND_API_KEY = <your Resend API key>   (resend.com, free tier)
//        NOTIFY_TO      = saporifer@gmail.com      (optional; this is the default)
//        NOTIFY_FROM    = onboarding@resend.dev    (optional; use a verified
//                         sender once your domain is set up in Resend)
//   3. Settings → keep "Verify JWT" ON (the app sends its anon key).
//
// Until deployed, the app still logs every change to meal_plan_events;
// no email is sent and the UI is unaffected.

Deno.serve(async (req) => {
  const cors = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  try {
    const body = await req.json();
    const { event = 'meal_plan_updated', customer = {}, items = [], plan = null, subtotal = 0, overage = null } = body;

    const apiKey = Deno.env.get('RESEND_API_KEY');
    const to = Deno.env.get('NOTIFY_TO') || 'saporifer@gmail.com';
    const from = Deno.env.get('NOTIFY_FROM') || 'Lean Kitchen <onboarding@resend.dev>';

    const inr = (n: number) => '₹' + Number(n || 0).toLocaleString('en-IN');
    const rows = (items as any[]).map((i) =>
      `<tr><td style="padding:4px 10px 4px 0">${i.name} × ${i.qty}</td><td style="padding:4px 0;color:#666">${i.kcal ?? '?'} kcal · ${i.protein ?? '?'}g protein${i.notes ? ` · ${i.notes}` : ''}</td></tr>`
    ).join('');

    const html = `
      <div style="font-family:Inter,Arial,sans-serif;color:#2D2D2D">
        <h2 style="margin:0 0 4px">Meal plan ${event === 'plan_selected' ? 'plan selected' : 'updated'}</h2>
        <p style="margin:0 0 12px;color:#666">${new Date().toLocaleString('en-IN')}</p>
        <p><strong>Customer:</strong> ${customer.name || '(guest)'}${customer.email ? ` · ${customer.email}` : ''}${customer.phone ? ` · ${customer.phone}` : ''}</p>
        ${customer.goal ? `<p><strong>Goal:</strong> ${customer.goal} · ${customer.dietPref || ''}</p>` : ''}
        ${plan ? `<p><strong>Plan:</strong> ${plan.name} — ${plan.meals} meals at ${inr(plan.perMeal)}/meal</p>` : '<p><strong>Plan:</strong> none selected</p>'}
        ${overage ? `<p style="color:#b06c22"><strong>Over plan by ${overage.extra} meal(s)</strong> — ${overage.payExtras ? 'customer agreed to pay for extras' : 'not yet resolved'}</p>` : ''}
        <table style="border-collapse:collapse;margin-top:8px">${rows || '<tr><td>(no individual meals)</td></tr>'}</table>
        <p style="margin-top:10px"><strong>Meals subtotal (est.):</strong> ${inr(subtotal)}</p>
      </div>`;

    if (!apiKey) {
      // Not configured yet — acknowledge so the client doesn't error.
      return new Response(JSON.stringify({ ok: false, reason: 'RESEND_API_KEY not set' }), {
        status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
      });
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to, subject: `Lean Kitchen — meal plan ${event === 'plan_selected' ? 'plan selected' : 'updated'} (${customer.name || 'guest'})`, html }),
    });
    const out = await res.json();
    return new Response(JSON.stringify({ ok: res.ok, out }), {
      status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ ok: false, error: String(err) }), {
      status: 200, headers: { ...cors, 'Content-Type': 'application/json' },
    });
  }
});
