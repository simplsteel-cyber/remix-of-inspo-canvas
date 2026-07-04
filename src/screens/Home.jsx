import React from 'react';
import { C, serif, rating, inr, DISHES, PLANS, TRENDING, HOME_TILES, TESTIMONIALS } from '../lib/core.js';
import { HERO } from '../data/images.js';
import { Btn, Img, Stars } from '../components/ui.jsx';
import { BadgeCheck, Sun, Leaf, Recycle, ChevronRight, Star, CheckCircle2 } from 'lucide-react';

export function PlanCard({ plan, onChoose, active }) {
  return (
    <div className="rounded-3xl p-5 relative" style={{ background: '#fff', border: plan.popular ? `1.5px solid ${C.sage}` : `1px solid ${C.line}`, boxShadow: '0 4px 18px rgba(45,45,45,0.04)' }}>
      {plan.popular && <span className="absolute -top-2.5 left-5 text-xs font-semibold px-3 py-1 rounded-full" style={{ background: C.mint, color: '#3e6b2f' }}>Most popular</span>}
      <h3 style={{ ...serif, fontSize: 22, fontWeight: 700, color: C.ink }}>{plan.name}</h3>
      <p className="text-sm mt-1" style={{ color: C.mute }}>{plan.desc}</p>
      <div className="flex items-baseline gap-1 mt-3">
        <span className="text-xl font-semibold" style={{ color: C.ink }}>{inr(plan.perMeal)}</span>
        <span className="text-xs" style={{ color: C.mute }}>/ meal · {plan.meals} meals</span>
      </div>
      <div className="mt-4"><Btn small kind={active ? 'secondary' : 'primary'} onClick={() => onChoose(plan)}>{active ? 'Selected ✓' : 'Create your meal plan'}</Btn></div>
    </div>
  );
}

export function HomeScreen({ go, openDish, choosePlan, plan, applyPromo }) {
  const loved = TRENDING.slice(0, 6).map((n) => DISHES.find((d) => d.name === n)).filter(Boolean);
  return (
    <div className="pb-6">
      <div className="px-5 pt-6">
        <div className="rounded-3xl overflow-hidden" style={{ boxShadow: '0 8px 30px rgba(45,45,45,0.08)' }}>
          <img src={HERO} alt="Overhead bowl of fresh food" className="w-full" style={{ height: 200, objectFit: 'cover' }} />
          <div className="p-5" style={{ background: '#fff' }}>
            <h1 style={{ ...serif, fontSize: 30, fontWeight: 700, color: C.ink, lineHeight: 1.1 }}>Healthy eating, made effortless.</h1>
            <p className="text-sm mt-2" style={{ color: C.mute }}>Chef-crafted meals tailored to your goals. Delivered fresh every week.</p>
            <div className="flex gap-2.5 mt-4">
              <Btn small onClick={() => go('plans')}>Explore plans</Btn>
              <Btn small kind="ghost" onClick={() => go('meals')}>Browse meals</Btn>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 mt-4">
          {[[BadgeCheck, 'Nutritionist approved'], [Sun, 'Fresh daily'], [Leaf, 'No preservatives'], [Recycle, 'Sustainable packaging']].map(([I, t]) => (
            <div key={t} className="flex items-center gap-2 rounded-2xl px-3.5 py-3 text-xs font-medium" style={{ background: '#fff', border: `1px solid ${C.line}`, color: C.ink }}>
              <I size={16} color={C.sage} strokeWidth={1.8} /> {t}
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 mt-8" id="plans">
        <h2 style={{ ...serif, fontSize: 24, fontWeight: 700, color: C.ink }}>Plans</h2>
        <div className="grid gap-3.5 mt-3">
          {PLANS.map((p) => <PlanCard key={p.id} plan={p} onChoose={choosePlan} active={plan?.id === p.id} />)}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="px-5" style={{ ...serif, fontSize: 24, fontWeight: 700, color: C.ink }}>Most loved meals</h2>
        <div className="flex gap-3 overflow-x-auto px-5 mt-3 pb-2 no-scrollbar">
          {loved.map((d) => (
            <div key={d.name} onClick={() => openDish(d)} className="flex-none w-44 rounded-3xl overflow-hidden cursor-pointer" style={{ background: '#fff', border: `1px solid ${C.line}` }}>
              <Img dish={d} className="w-full" style={{ height: 112 }} />
              <div className="p-3">
                <div className="text-sm font-semibold truncate" style={{ color: C.ink }}>{d.name}</div>
                <div className="flex items-center justify-between mt-1.5 text-xs" style={{ color: C.mute }}>
                  <span>{d.protein}g protein</span><Stars value={rating(d)} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="px-5 mt-8">
        <h2 style={{ ...serif, fontSize: 24, fontWeight: 700, color: C.ink }}>Categories</h2>
        <div className="grid grid-cols-2 gap-2.5 mt-3">
          {HOME_TILES.map((c) => (
            <button key={c} onClick={() => go('meals', c)} className="flex items-center justify-between rounded-2xl px-4 py-4 text-sm font-medium text-left"
              style={{ background: '#fff', border: `1px solid ${C.line}`, color: C.ink }}>
              {c} <ChevronRight size={15} color={C.sage} />
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-8">
        <div className="rounded-3xl p-5" style={{ background: '#fff', border: `1px solid ${C.line}` }}>
          <div className="flex items-center gap-1">{[...Array(5)].map((_, i) => <Star key={i} size={15} fill={C.orange} color={C.orange} />)}</div>
          <div className="text-sm font-semibold mt-2" style={{ color: C.ink }}>Loved by 4,800+ customers</div>
          <div className="text-xs" style={{ color: C.mute }}>95% monthly renewal rate</div>
          <div className="grid gap-2.5 mt-4">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="rounded-2xl p-3.5 text-sm" style={{ background: C.grey, color: '#565b54' }}>
                “{t.text}”<div className="text-xs mt-1.5 font-medium" style={{ color: C.mute }}>— {t.name}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5 mt-6">
        <div className="rounded-3xl p-5 flex items-center justify-between" style={{ background: '#fff', border: `1.5px dashed ${C.orange}` }}>
          <div>
            <div className="text-xs font-bold" style={{ color: C.orange }}>20% OFF · FIRST WEEK</div>
            <div className="text-sm mt-0.5" style={{ color: C.ink }}>Code: <span className="font-semibold">NOURISH20</span></div>
          </div>
          <Btn small kind="ghost" onClick={applyPromo}>Apply</Btn>
        </div>
      </div>

      <div className="px-5 mt-8 pb-2">
        <h2 style={{ ...serif, fontSize: 24, fontWeight: 700, color: C.ink }}>Why subscribe</h2>
        <div className="grid gap-2 mt-3 text-sm" style={{ color: '#565b54' }}>
          {['Meals matched to your goal, not a generic diet', 'A rotating menu of 60 chef-crafted dishes', 'Fresh from our kitchen — never frozen, no preservatives', 'Pause, swap, or adjust any week'].map((b) => (
            <div key={b} className="flex gap-2.5 items-start"><CheckCircle2 size={17} color={C.sage} className="flex-none mt-0.5" strokeWidth={1.8} />{b}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
