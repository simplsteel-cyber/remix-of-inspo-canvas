import React, { useState } from 'react';
import { C, serif, inr, DISHES } from '../lib/core.js';
import { Btn, Img, QtyOrAdd, Field, inputStyle } from '../components/ui.jsx';
import { ShoppingBag, CheckCircle2 } from 'lucide-react';

export function OrdersScreen({ cart, setCart, plan, promo, setPromo, orders, placeOrder, go }) {
  const [code, setCode] = useState('');
  const [stage, setStage] = useState('cart'); // cart | checkout | done
  const [address, setAddress] = useState('');
  const [pay, setPay] = useState('UPI');
  const items = Object.entries(cart).map(([name, qty]) => ({ dish: DISHES.find((d) => d.name === name), qty }));
  const subtotal = items.reduce((s, { dish, qty }) => s + (+dish.price) * qty, 0);
  const discount = promo ? Math.round(subtotal * 0.2) : 0;
  const total = subtotal - discount;
  const count = items.reduce((s, i) => s + i.qty, 0);

  if (stage === 'done') {
    const last = orders[orders.length - 1];
    return (
      <div className="px-5 pt-16 pb-6 text-center">
        <CheckCircle2 size={56} color={C.cta} strokeWidth={1.5} className="mx-auto" />
        <h2 className="mt-4" style={{ ...serif, fontSize: 28, fontWeight: 700, color: C.ink }}>Order confirmed</h2>
        <p className="text-sm mt-2" style={{ color: C.mute }}>Order {last?.id} · {last ? inr(last.total) : ''}<br />We'll send delivery updates shortly.</p>
        <div className="mt-8 grid gap-2"><Btn onClick={() => { setStage('cart'); go('home'); }}>Back to home</Btn></div>
        <div className="text-xs mt-4" style={{ color: C.mute }}>Prototype — no payment was taken.</div>
      </div>
    );
  }

  if (count === 0 && orders.length === 0) {
    return (
      <div className="px-5 pt-16 text-center">
        <ShoppingBag size={44} color={C.sage} strokeWidth={1.5} className="mx-auto" />
        <h2 className="mt-4" style={{ ...serif, fontSize: 26, fontWeight: 700, color: C.ink }}>Nothing here yet</h2>
        <p className="text-sm mt-2" style={{ color: C.mute }}>Choose a plan or add meals to get started.</p>
        <div className="mt-6"><Btn onClick={() => go('meals')}>Browse meals</Btn></div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-6">
      <h2 style={{ ...serif, fontSize: 26, fontWeight: 700, color: C.ink }}>{stage === 'cart' ? 'Your meals' : 'Checkout'}</h2>
      {plan && <div className="text-xs mt-1 font-medium" style={{ color: '#3e6b2f' }}>{plan.name} · pick up to {plan.meals} meals ({count}/{plan.meals} selected)</div>}

      {stage === 'cart' && (<>
        <div className="grid gap-2.5 mt-4">
          {items.map(({ dish, qty }) => (
            <div key={dish.name} className="flex items-center gap-3 rounded-2xl p-2.5" style={{ background: '#fff', border: `1px solid ${C.line}` }}>
              <Img dish={dish} className="rounded-xl flex-none" style={{ width: 56, height: 56 }} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate" style={{ color: C.ink }}>{dish.name}</div>
                <div className="text-xs" style={{ color: C.mute }}>{inr(+dish.price)}</div>
              </div>
              <QtyOrAdd dish={dish} cart={cart} setCart={setCart} small />
            </div>
          ))}
        </div>
        {count > 0 && (<>
          {!promo ? (
            <div className="flex gap-2 mt-4">
              <input style={{ ...inputStyle, flex: 1 }} value={code} onChange={(e) => setCode(e.target.value)} placeholder="Promo code" />
              <Btn small kind="ghost" onClick={() => { if (code.trim().toUpperCase() === 'NOURISH20') setPromo(true); }}>Apply</Btn>
            </div>
          ) : (
            <div className="rounded-2xl px-4 py-2.5 mt-4 text-xs font-semibold" style={{ background: '#FDF3E7', color: '#b06c22' }}>NOURISH20 applied — 20% off</div>
          )}
          <div className="rounded-2xl p-4 mt-4 text-sm grid gap-1.5" style={{ background: '#fff', border: `1px solid ${C.line}` }}>
            <div className="flex justify-between" style={{ color: C.mute }}><span>Subtotal</span><span>{inr(subtotal)}</span></div>
            {discount > 0 && <div className="flex justify-between" style={{ color: '#b06c22' }}><span>First-week offer</span><span>−{inr(discount)}</span></div>}
            <div className="flex justify-between" style={{ color: C.mute }}><span>Delivery (within 5 km)</span><span>Free</span></div>
            <div className="flex justify-between font-semibold pt-1" style={{ color: C.ink, borderTop: `1px solid ${C.line}` }}><span>Total</span><span>{inr(total)}</span></div>
          </div>
          <div className="mt-4"><Btn className="w-full" onClick={() => setStage('checkout')}>Continue to checkout</Btn></div>
        </>)}
        {orders.length > 0 && (<>
          <h3 className="text-sm font-semibold mt-8 mb-2" style={{ color: C.ink }}>Past orders</h3>
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl p-3.5 text-sm flex justify-between mb-2" style={{ background: '#fff', border: `1px solid ${C.line}`, color: C.mute }}>
              <span>{o.id} · {o.items} meals</span><span className="font-medium" style={{ color: C.ink }}>{inr(o.total)}</span>
            </div>
          ))}
        </>)}
      </>)}

      {stage === 'checkout' && (<>
        <div className="grid gap-4 mt-5">
          <Field label="Delivery address (within 5 km of Lower Oshiwara)">
            <textarea style={{ ...inputStyle, minHeight: 76 }} value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Flat, building, street, area" />
          </Field>
          <Field label="Payment method">
            <div className="grid gap-2">
              {['UPI', 'Card', 'Cash on delivery'].map((p) => (
                <button key={p} onClick={() => setPay(p)} className="rounded-2xl px-4 py-3.5 text-sm font-medium text-left"
                  style={pay === p ? { background: C.mint, border: `1.5px solid ${C.sage}`, color: '#3e6b2f' } : { background: '#fff', border: `1px solid ${C.line}`, color: C.ink }}>
                  {p}
                </button>
              ))}
            </div>
          </Field>
          <div className="rounded-2xl p-3.5 text-xs" style={{ background: C.grey, color: C.mute }}>
            Keto or dairy-free customisations? Add a note when we confirm your order.
          </div>
          <div className="flex justify-between text-sm font-semibold" style={{ color: C.ink }}><span>Total</span><span>{inr(total)}</span></div>
          <Btn onClick={() => { placeOrder({ id: 'LK-' + String(1000 + orders.length + 1), items: count, total }); setStage('done'); }}>
            Pay {inr(total)}
          </Btn>
          <Btn kind="ghost" onClick={() => setStage('cart')}>Back</Btn>
          <div className="text-xs text-center" style={{ color: C.mute }}>Prototype — payment is simulated.</div>
        </div>
      </>)}
    </div>
  );
}
