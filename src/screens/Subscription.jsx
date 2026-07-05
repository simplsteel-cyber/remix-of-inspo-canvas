import React, { useState } from 'react';
import { C, serif, inr, waLink, subscriptionEnquiry, PLANS } from '../lib/core.js';
import { BackBtn, Btn, SectionTitle, cardStyle } from '../components/ui.jsx';
import { DeliveryStatus } from '../components/delivery.jsx';
import { PlanCompareSheet } from '../components/plans.jsx';
import { useUser } from '../context/UserContext.jsx';
import { CreditCard, CheckCircle2, MessageCircle } from 'lucide-react';

export function SubscriptionScreen() {
  const { plan, profile, delivery, choosePlan, go, goBack, user, setStage } = useUser();
  const [comparing, setComparing] = useState(false);
  const needsRegistration = !user || !profile.name.trim();

  if (!plan) {
    return (
      <div className="px-5 pt-6 pb-6">
        <BackBtn onClick={goBack} />
        <div className="text-center mt-8">
          <CreditCard size={44} color={C.sage} strokeWidth={1.5} className="mx-auto" />
          <h2 className="mt-4" style={{ ...serif, fontSize: 26, fontWeight: 700, color: C.ink }}>No plan selected yet</h2>
          <p className="text-sm mt-2" style={{ color: C.mute }}>Pick a plan below — we confirm everything personally on WhatsApp. No payment in the app.</p>
        </div>
        <div className="grid gap-2.5 mt-6">
          {PLANS.map((p) => (
            <button key={p.id} type="button" onClick={() => choosePlan(p)} className="rounded-2xl p-4 text-left"
              style={{ ...cardStyle, border: p.popular ? `1.5px solid ${C.sage}` : cardStyle.border }}>
              <div className="flex justify-between gap-2">
                <span className="text-sm font-semibold" style={{ color: C.ink }}>{p.name}</span>
                <span className="text-sm font-semibold" style={{ color: C.ink }}>{inr(p.perMeal)}/meal</span>
              </div>
              <div className="text-xs mt-1" style={{ color: C.mute }}>{p.meals} meals · {p.duration} · {p.bestFor}</div>
            </button>
          ))}
        </div>
        <div className="mt-4 text-center">
          <button type="button" onClick={() => setComparing(true)} className="text-sm font-medium py-2" style={{ color: '#3e6b2f' }}>Compare plans side by side</button>
        </div>
        {comparing && <PlanCompareSheet onClose={() => setComparing(false)} />}
      </div>
    );
  }

  const message = subscriptionEnquiry({ profile, plan, delivery });
  const rows = [
    ['Duration', plan.duration],
    ['Meals', `${plan.meals} meals`],
    ['Per meal', inr(plan.perMeal)],
    ['Estimated total', inr(plan.meals * plan.perMeal)],
  ];

  return (
    <div className="px-5 pt-6 pb-6">
      <div className="flex items-center justify-between gap-3">
        <BackBtn onClick={goBack} />
        <SectionTitle>Your subscription</SectionTitle>
      </div>

      <div className="rounded-3xl p-5 mt-4" style={{ ...cardStyle, border: `1.5px solid ${C.sage}`, boxShadow: '0 6px 24px rgba(141,187,116,0.18)' }}>
        <div className="flex items-start justify-between gap-2">
          <h3 style={{ ...serif, fontSize: 24, fontWeight: 700, color: C.ink }}>{plan.name}</h3>
          <span className="text-xs px-2.5 py-1 rounded-full flex-none mt-1" style={{ background: C.mint, color: '#3e6b2f' }}>{plan.bestFor}</span>
        </div>
        <p className="text-sm mt-1" style={{ color: C.mute }}>{plan.desc}</p>

        <div className="grid grid-cols-2 gap-2 mt-4">
          {rows.map(([k, v]) => (
            <div key={k} className="rounded-2xl px-3.5 py-3" style={{ background: C.grey }}>
              <div className="text-xs" style={{ color: C.mute }}>{k}</div>
              <div className="text-sm font-semibold mt-0.5" style={{ color: C.ink }}>{v}</div>
            </div>
          ))}
        </div>

        <h4 className="text-sm font-semibold mt-5" style={{ color: C.ink }}>Benefits</h4>
        <ul className="grid gap-1.5 mt-2 text-sm" style={{ color: '#565b54' }}>
          {plan.benefits.map((b) => (
            <li key={b} className="flex gap-2 items-start"><CheckCircle2 size={15} color={C.sage} className="flex-none mt-0.5" strokeWidth={1.8} />{b}</li>
          ))}
        </ul>

        <h4 className="text-sm font-semibold mt-5" style={{ color: C.ink }}>What's included</h4>
        <ul className="grid gap-1.5 mt-2 text-sm" style={{ color: '#565b54' }}>
          {plan.included.map((b) => (
            <li key={b} className="flex gap-2 items-start"><CheckCircle2 size={15} color={C.sage} className="flex-none mt-0.5" strokeWidth={1.8} />{b}</li>
          ))}
        </ul>
      </div>

      {delivery && <div className="mt-4"><DeliveryStatus delivery={delivery} /></div>}

      {needsRegistration && (
        <div className="rounded-3xl p-5 mt-4" style={{ background: C.mint }}>
          <div className="text-sm font-semibold" style={{ color: '#3e6b2f' }}>Create your account first</div>
          <p className="text-sm mt-1" style={{ color: '#3e6b2f' }}>
            Register so we can match this plan to your goal, diet preference, and delivery area — your enquiry arrives pre-filled.
          </p>
          <div className="mt-3"><Btn className="w-full" onClick={() => setStage(user ? 'register' : 'welcome')}>Register now</Btn></div>
        </div>
      )}

      <div className="mt-4 grid gap-2">
        <a href={waLink(message)} target="_blank" rel="noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-full font-semibold px-6 py-3.5 text-sm w-full"
          style={needsRegistration
            ? { ...cardStyle, color: C.wa }
            : { background: C.wa, color: '#fff', boxShadow: '0 2px 10px rgba(31,170,83,0.28)' }}>
          <MessageCircle size={17} /> {needsRegistration ? 'Or message us on WhatsApp without an account' : 'Message us on WhatsApp'}
        </a>
        <Btn kind="ghost" className="w-full" onClick={() => go('plans')}>Change plan</Btn>
      </div>
      <div className="text-xs mt-3 text-center leading-relaxed" style={{ color: C.mute }}>
        We confirm your plan, meals, and delivery personally on WhatsApp — there's no payment in the app.
      </div>
    </div>
  );
}
