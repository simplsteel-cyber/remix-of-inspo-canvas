import React, { useMemo, useState } from 'react';
import { C, serif, inr, waLink, orderEnquiry, priceOf } from '../lib/core.js';
import { BackBtn, Btn, Img, SectionTitle, cardStyle, inputStyle } from '../components/ui.jsx';
import { DeliveryStatus } from '../components/delivery.jsx';
import { PlanCompareSheet } from '../components/plans.jsx';
import { useUser } from '../context/UserContext.jsx';
import { useMenu } from '../context/MenuContext.jsx';
import { useCart } from '../stores/cart.js';
import { ShoppingBag, CheckCircle2, MessageCircle, Trash2, Plus, Minus } from 'lucide-react';

function CartLine({ item, dish }) {
  const setQty = useCart((s) => s.setQty);
  const setNotes = useCart((s) => s.setNotes);
  const remove = useCart((s) => s.remove);
  const price = dish ? priceOf(dish) : null;
  return (
    <div className="rounded-2xl p-3" style={cardStyle}>
      <div className="flex items-start gap-3">
        {dish && <Img dish={dish} className="rounded-xl flex-none" style={{ width: 56, height: 56 }} />}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="text-sm font-medium truncate" style={{ color: C.ink }}>{dish?.title || item.name}</div>
              <div className="text-xs mt-0.5" style={{ color: C.mute }}>
                {price ? inr(price) : 'Price on request'}{dish?.kcal ? ` · ${dish.kcal} kcal · ${dish.protein}g protein` : ''}
              </div>
            </div>
            <button type="button" aria-label={`Remove ${item.name} from order`} onClick={() => remove(item.name)} className="p-1.5 flex-none -mt-0.5 -mr-1">
              <Trash2 size={15} color={C.mute} />
            </button>
          </div>
          <span className="inline-flex items-center gap-3 rounded-full px-2.5 py-1 mt-2" style={{ background: C.mint }}>
            <button type="button" aria-label={`Remove one ${item.name}`} onClick={() => setQty(item.name, item.qty - 1)} className="p-1"><Minus size={14} color="#3e6b2f" /></button>
            <span className="text-sm font-semibold min-w-4 text-center" style={{ color: '#3e6b2f' }}>{item.qty}</span>
            <button type="button" aria-label={`Add one ${item.name}`} onClick={() => setQty(item.name, item.qty + 1)} className="p-1"><Plus size={14} color="#3e6b2f" /></button>
          </span>
        </div>
      </div>
      <input style={{ ...inputStyle, padding: '8px 12px', fontSize: 13 }} className="mt-2" value={item.notes}
        onChange={(e) => setNotes(item.name, e.target.value)} placeholder="Note — e.g. less spicy, no onion" aria-label={`Note for ${item.name}`} />
    </div>
  );
}

export function SubscriptionScreen() {
  const { plan, profile, delivery, choosePlan, clearPlan, go, goBack, user, setStage, payExtras, acknowledgeExtras } = useUser();
  const { dishes, plans } = useMenu();
  const items = useCart((s) => s.items);
  const clearCart = useCart((s) => s.clear);
  const [comparing, setComparing] = useState(false);
  const needsRegistration = !user || !profile.name.trim();

  const lines = useMemo(
    () => items.map((item) => ({ item, dish: dishes.find((d) => d.name === item.name) })),
    [items, dishes]
  );
  const subtotal = useMemo(
    () => lines.reduce((s, { item, dish }) => s + (dish ? (priceOf(dish) || 0) : 0) * item.qty, 0),
    [lines]
  );
  const mealCount = items.reduce((s, i) => s + i.qty, 0);
  const overage = plan && mealCount > plan.meals ? mealCount - plan.meals : 0;
  const message = orderEnquiry({
    profile, plan, delivery, payExtras,
    items: lines.filter(({ dish }) => dish).map(({ item, dish }) => ({ dish, qty: item.qty, notes: item.notes })),
  });
  const empty = !plan && items.length === 0;

  if (empty) {
    return (
      <div className="px-5 pt-6 pb-6">
        <BackBtn onClick={goBack} />
        <div className="text-center mt-8">
          <ShoppingBag size={44} color={C.sage} strokeWidth={1.5} className="mx-auto" />
          <h2 className="mt-4" style={{ ...serif, fontSize: 26, fontWeight: 700, color: C.ink }}>Your order is empty</h2>
          <p className="text-sm mt-2" style={{ color: C.mute }}>Add meals from the menu or pick a plan — we confirm everything personally on WhatsApp. No payment in the app.</p>
          <div className="mt-6 grid gap-2">
            <Btn onClick={() => go('meals', null)}>Browse meals</Btn>
            <Btn kind="ghost" onClick={() => go('plans')}>See plans</Btn>
          </div>
        </div>
        <div className="grid gap-2.5 mt-8">
          {plans.map((p) => (
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

  return (
    <div className="px-5 pt-6 pb-6">
      <div className="flex items-center justify-between gap-3">
        <BackBtn onClick={goBack} />
        <SectionTitle>Your order</SectionTitle>
      </div>

      {plan ? (
        <div className="rounded-3xl p-5 mt-4" style={{ ...cardStyle, border: `1.5px solid ${C.sage}` }}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-xs font-semibold px-2.5 py-1 rounded-full inline-block" style={{ background: C.mint, color: '#3e6b2f' }}>Subscription plan</div>
              <h3 className="mt-2" style={{ ...serif, fontSize: 22, fontWeight: 700, color: C.ink }}>{plan.name}</h3>
              <div className="text-xs mt-1" style={{ color: C.mute }}>{plan.meals} meals · {inr(plan.perMeal)}/meal · est. {inr(plan.meals * plan.perMeal)}</div>
            </div>
            <button type="button" onClick={clearPlan} aria-label="Remove plan" className="p-1.5 flex-none"><Trash2 size={15} color={C.mute} /></button>
          </div>
          <ul className="grid gap-1.5 mt-3 text-sm" style={{ color: '#565b54' }}>
            {plan.benefits.slice(0, 2).map((b) => (
              <li key={b} className="flex gap-2 items-start"><CheckCircle2 size={15} color={C.sage} className="flex-none mt-0.5" strokeWidth={1.8} />{b}</li>
            ))}
          </ul>
        </div>
      ) : (
        <button type="button" onClick={() => go('plans')} className="rounded-2xl px-4 py-3.5 mt-4 w-full text-left text-sm font-medium"
          style={{ background: '#fff', border: `1px dashed ${C.sage}`, color: '#3e6b2f' }}>
          + Add a subscription plan (optional)
        </button>
      )}

      {lines.length > 0 && (
        <div className="mt-5">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold" style={{ color: C.ink }}>Meals ({items.reduce((s, i) => s + i.qty, 0)})</div>
            <button type="button" onClick={clearCart} className="text-xs font-medium" style={{ color: C.mute }}>Clear all</button>
          </div>
          <div className="grid gap-2.5 mt-3">
            {lines.map(({ item, dish }) => <CartLine key={item.name} item={item} dish={dish} />)}
          </div>
          <div className="rounded-2xl p-4 mt-3 text-sm grid gap-1.5" style={cardStyle}>
            <div className="flex justify-between" style={{ color: C.mute }}><span>Meals subtotal</span><span className="font-semibold" style={{ color: C.ink }}>{inr(subtotal)}</span></div>
            {plan && <div className="flex justify-between" style={{ color: C.mute }}><span>{plan.name} (est.)</span><span>{inr(plan.meals * plan.perMeal)}</span></div>}
            <div className="text-xs" style={{ color: C.mute }}>Final pricing, delivery, and offers are confirmed on WhatsApp.</div>
          </div>
        </div>
      )}

      {lines.length === 0 && (
        <button type="button" onClick={() => go('meals', null)} className="rounded-2xl px-4 py-3.5 mt-3 w-full text-left text-sm font-medium"
          style={{ background: '#fff', border: `1px dashed ${C.line}`, color: C.mute }}>
          + Add individual meals (optional)
        </button>
      )}

      {overage > 0 && (
        <div className="rounded-2xl p-4 mt-4" role="alert" style={{ background: '#FDF3E7', border: '1px solid #F8DCB8' }}>
          <div className="text-sm font-semibold" style={{ color: '#b06c22' }}>{overage} meal{overage > 1 ? 's' : ''} over your {plan.name}</div>
          <p className="text-xs mt-1" style={{ color: '#b06c22' }}>Your plan includes {plan.meals} meals. Choose a bigger plan, or keep these and pay for the extras.</p>
          <div className="grid grid-cols-2 gap-2 mt-3">
            <Btn small kind="ghost" onClick={() => go('plans')}>Change plan</Btn>
            {payExtras
              ? <span className="inline-flex items-center justify-center gap-1 text-xs font-semibold rounded-full px-3 py-2" style={{ background: C.mint, color: '#3e6b2f' }}><CheckCircle2 size={13} /> Paying for extras</span>
              : <Btn small onClick={acknowledgeExtras}>Pay for extras</Btn>}
          </div>
        </div>
      )}

      {delivery && <div className="mt-4"><DeliveryStatus delivery={delivery} /></div>}

      {needsRegistration && (
        <div className="rounded-3xl p-5 mt-4" style={{ background: C.mint }}>
          <div className="text-sm font-semibold" style={{ color: '#3e6b2f' }}>Create your account first</div>
          <p className="text-sm mt-1" style={{ color: '#3e6b2f' }}>
            Register so we can match your order to your goal, diet preference, and delivery area — your enquiry arrives pre-filled.
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
          <MessageCircle size={17} /> {needsRegistration ? 'Order on WhatsApp without an account' : 'Order on WhatsApp'}
        </a>
      </div>
      <div className="text-xs mt-3 text-center leading-relaxed" style={{ color: C.mute }}>
        We confirm your order, meals, and delivery personally on WhatsApp — there's no payment in the app.
      </div>
    </div>
  );
}
