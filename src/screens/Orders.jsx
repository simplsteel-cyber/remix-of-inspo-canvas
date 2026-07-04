import React from 'react';
import { C, serif, inr } from '../lib/core.js';
import { Btn } from '../components/ui.jsx';
import { CreditCard } from 'lucide-react';

export function SubscriptionScreen({ plan, go }) {
  if (!plan) {
    return (
      <div className="px-5 pt-16 text-center">
        <CreditCard size={44} color={C.sage} strokeWidth={1.5} className="mx-auto" />
        <h2 className="mt-4" style={{ ...serif, fontSize: 26, fontWeight: 700, color: C.ink }}>No plan yet</h2>
        <p className="text-sm mt-2" style={{ color: C.mute }}>Choose a plan to start your subscription.</p>
        <div className="mt-6"><Btn onClick={() => go('home')}>Browse plans</Btn></div>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-6">
      <h2 style={{ ...serif, fontSize: 26, fontWeight: 700, color: C.ink }}>Your subscription</h2>
      <div className="rounded-3xl p-5 mt-4" style={{ background: '#fff', border: `1.5px solid ${C.sage}`, boxShadow: '0 6px 24px rgba(141,187,116,0.18)' }}>
        <div className="text-xs font-semibold px-2.5 py-1 rounded-full inline-block" style={{ background: C.mint, color: '#3e6b2f' }}>Active plan</div>
        <h3 className="mt-2" style={{ ...serif, fontSize: 24, fontWeight: 700, color: C.ink }}>{plan.name}</h3>
        <p className="text-sm mt-1" style={{ color: C.mute }}>{plan.desc}</p>
        <div className="text-sm mt-3 font-semibold" style={{ color: C.ink }}>{plan.meals} meals · {inr(plan.perMeal)} per meal</div>
      </div>
      <div className="mt-4"><Btn className="w-full" kind="ghost" onClick={() => go('home')}>Change plan</Btn></div>
      <div className="text-xs mt-4 text-center" style={{ color: C.mute }}>Prototype — subscription is simulated.</div>
    </div>
  );
}
