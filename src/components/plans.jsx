import React from 'react';
import { C, serif, inr, PLANS } from '../lib/core.js';
import { Btn, Sheet } from './ui.jsx';
import { useUser } from '../context/UserContext.jsx';
import { Check, Minus } from 'lucide-react';

// Side-by-side comparison of all plans, highlighting differences.
export function PlanCompareSheet({ onClose }) {
  const { choosePlan } = useUser();
  const rows = [
    ['Per meal', (p) => inr(p.perMeal)],
    ['Meals', (p) => String(p.meals)],
    ['Duration', (p) => p.duration],
    ['Dietitian consult', (p) => (p.dietitian ? 'yes' : 'no')],
    ['Pause or swap', (p) => (p.id === 'starter' ? 'no' : 'yes')],
    ['Best for', (p) => p.bestFor],
  ];
  const mark = (v) => v === 'yes'
    ? <Check size={15} color={C.sage} strokeWidth={2.5} className="mx-auto" aria-label="Included" />
    : v === 'no'
      ? <Minus size={15} color={C.line} className="mx-auto" aria-label="Not included" />
      : v;

  return (
    <Sheet onClose={onClose} label="Compare plans">
      <div className="p-5 pb-8">
        <h2 style={{ ...serif, fontSize: 24, fontWeight: 700, color: C.ink }}>Compare plans</h2>
        <div className="grid mt-4 text-xs rounded-2xl overflow-hidden" style={{ gridTemplateColumns: '1.2fr 1fr 1fr 1fr', border: `1px solid ${C.line}` }}>
          <div className="px-2.5 py-3" style={{ background: C.grey }} />
          {PLANS.map((p) => (
            <div key={p.id} className="px-1 py-3 text-center font-semibold" style={{ background: p.popular ? C.mint : C.grey, color: p.popular ? '#3e6b2f' : C.ink }}>
              {p.name.replace(' Plan', '').replace(' Week', '')}
              {p.popular && <div className="font-normal" style={{ fontSize: 10 }}>Most popular</div>}
            </div>
          ))}
          {rows.map(([label, get], i) => (
            <React.Fragment key={label}>
              <div className="px-2.5 py-3 font-medium" style={{ color: C.mute, background: i % 2 ? C.grey : '#fff' }}>{label}</div>
              {PLANS.map((p) => (
                <div key={p.id} className="px-1 py-3 text-center font-medium" style={{ color: C.ink, background: i % 2 ? C.grey : '#fff' }}>
                  {mark(get(p))}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
        <div className="grid gap-2 mt-4">
          {PLANS.map((p) => (
            <Btn key={p.id} small kind={p.popular ? 'primary' : 'ghost'} onClick={() => { onClose(); choosePlan(p); }}>
              Choose {p.name} · {inr(p.perMeal)}/meal
            </Btn>
          ))}
        </div>
      </div>
    </Sheet>
  );
}
