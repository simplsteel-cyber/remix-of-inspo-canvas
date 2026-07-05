import React, { useEffect, useMemo, useRef, useState } from 'react';
import { C, serif, inr, DISHES, PLANS, TRENDING, HOME_TILES, TESTIMONIALS, recommendDishes } from '../lib/core.js';
import { HERO } from '../data/images.js';
import { KITCHEN } from '../lib/delivery.js';
import { Btn, Sheet, SectionTitle, cardStyle } from '../components/ui.jsx';
import { MiniMealCard } from '../components/meals.jsx';
import { DeliveryForm, DeliveryStatus } from '../components/delivery.jsx';
import { PlanCompareSheet } from '../components/plans.jsx';
import { useUser } from '../context/UserContext.jsx';
import { BadgeCheck, Sun, Leaf, Recycle, ChevronRight, Star, CheckCircle2, Sparkles } from 'lucide-react';

export function PlanCard({ plan, onChoose, active }) {
  return (
    <div className="rounded-3xl p-5 relative" style={{ ...cardStyle, border: plan.popular ? `1.5px solid ${C.sage}` : cardStyle.border, boxShadow: '0 4px 18px rgba(45,45,45,0.04)' }}>
      {plan.popular && <span className="absolute -top-2.5 left-5 text-xs font-semibold px-3 py-1 rounded-full" style={{ background: C.mint, color: '#3e6b2f' }}>Most popular</span>}
      <div className="flex items-start justify-between gap-2">
        <h3 style={{ ...serif, fontSize: 22, fontWeight: 700, color: C.ink }}>{plan.name}</h3>
        <span className="text-xs px-2.5 py-1 rounded-full flex-none mt-1" style={{ background: C.grey, color: C.mute }}>{plan.bestFor}</span>
      </div>
      <p className="text-sm mt-1" style={{ color: C.mute }}>{plan.desc}</p>
      <div className="flex items-baseline gap-1 mt-3">
        <span className="text-xl font-semibold" style={{ color: C.ink }}>{inr(plan.perMeal)}</span>
        <span className="text-xs" style={{ color: C.mute }}>/ meal · {plan.meals} meals · {plan.duration}</span>
      </div>
      <ul className="grid gap-1.5 mt-3 text-sm" style={{ color: '#565b54' }}>
        {plan.benefits.map((b) => (
          <li key={b} className="flex gap-2 items-start"><CheckCircle2 size={15} color={C.sage} className="flex-none mt-0.5" strokeWidth={1.8} />{b}</li>
        ))}
      </ul>
      <div className="mt-4"><Btn small kind={active ? 'secondary' : 'primary'} onClick={() => onChoose(plan)}>{active ? 'View my plan' : 'View plan details'}</Btn></div>
    </div>
  );
}

export function HomeScreen({ openDish }) {
  const { go, choosePlan, plan, profile, delivery, user, setStage, route, clearAnchor } = useUser();
  const [checkingDelivery, setCheckingDelivery] = useState(false);
  const [comparing, setComparing] = useState(false);
  const plansRef = useRef(null);

  // "Explore plans" from anywhere scrolls reliably to the Plans section.
  useEffect(() => {
    if (route.anchor === 'plans' && plansRef.current) {
      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      plansRef.current.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
      clearAnchor();
    }
  }, [route.anchor, clearAnchor]);

  const recommended = useMemo(
    () => (profile.goal || profile.dietPref !== 'No preference' ? recommendDishes(profile) : []),
    [profile]
  );
  const loved = useMemo(
    () => TRENDING.slice(0, 6).map((n) => DISHES.find((d) => d.name === n)).filter(Boolean)
      .filter((d) => profile.dietPref !== 'Vegetarian' || d.diet === 'Veg'),
    [profile.dietPref]
  );

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

        {!user && (
          <div className="mt-4">
            <Btn className="w-full" onClick={() => setStage('welcome')}>Sign in or create account</Btn>
          </div>
        )}

        <div className="mt-4">
          <DeliveryStatus delivery={delivery} onEdit={() => setCheckingDelivery(true)} />
        </div>

        <div className="grid grid-cols-2 gap-2 mt-3">
          {[[BadgeCheck, 'Nutritionist approved'], [Sun, 'Fresh daily'], [Leaf, 'No preservatives'], [Recycle, 'Sustainable packaging']].map(([I, t]) => (
            <div key={t} className="flex items-center gap-2 rounded-2xl px-3.5 py-3 text-xs font-medium" style={{ ...cardStyle, color: C.ink }}>
              <I size={16} color={C.sage} strokeWidth={1.8} /> {t}
            </div>
          ))}
        </div>
      </div>

      {recommended.length > 0 && (
        <div className="mt-8">
          <div className="px-5 flex items-center gap-2">
            <Sparkles size={18} color={C.sage} strokeWidth={1.8} />
            <SectionTitle>Recommended for you</SectionTitle>
          </div>
          <div className="px-5 text-xs mt-0.5" style={{ color: C.mute }}>
            Based on {[profile.goal, profile.dietPref !== 'No preference' ? profile.dietPref.toLowerCase() : null].filter(Boolean).join(' · ')}
          </div>
          <div className="flex gap-3 overflow-x-auto px-5 mt-3 pb-2 no-scrollbar">
            {recommended.map((d) => <MiniMealCard key={d.name + d.diet} dish={d} onOpen={openDish} />)}
          </div>
        </div>
      )}

      <div ref={plansRef} className="px-5 mt-8" id="plans" style={{ scrollMarginTop: 12 }}>
        <div className="flex items-center justify-between">
          <SectionTitle>Plans</SectionTitle>
          <button type="button" onClick={() => setComparing(true)} className="text-sm font-medium" style={{ color: '#3e6b2f' }}>
            Compare plans
          </button>
        </div>
        <div className="grid gap-3.5 mt-3">
          {PLANS.map((p) => <PlanCard key={p.id} plan={p} onChoose={choosePlan} active={plan?.id === p.id} />)}
        </div>
      </div>

      <div className="mt-8">
        <SectionTitle className="px-5">Most loved meals</SectionTitle>
        <div className="flex gap-3 overflow-x-auto px-5 mt-3 pb-2 no-scrollbar">
          {loved.map((d) => <MiniMealCard key={d.name + d.diet} dish={d} onOpen={openDish} />)}
        </div>
      </div>

      <div className="px-5 mt-8">
        <SectionTitle>Categories</SectionTitle>
        <div className="grid grid-cols-2 gap-2.5 mt-3">
          {HOME_TILES.map((c) => (
            <button key={c} type="button" onClick={() => go('meals', c)} className="flex items-center justify-between rounded-2xl px-4 py-4 text-sm font-medium text-left"
              style={{ ...cardStyle, color: C.ink }}>
              {c} <ChevronRight size={15} color={C.sage} />
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-8">
        <div className="rounded-3xl p-5" style={cardStyle}>
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
        <div className="rounded-3xl p-5" style={{ ...cardStyle, border: `1.5px dashed ${C.orange}` }}>
          <div className="text-xs font-bold" style={{ color: C.orange }}>20% OFF · FIRST WEEK</div>
          <div className="text-sm mt-0.5" style={{ color: C.ink }}>Mention code <span className="font-semibold">NOURISH20</span> when you message us on WhatsApp.</div>
        </div>
      </div>

      <div className="px-5 mt-8 pb-2">
        <SectionTitle>Why subscribe</SectionTitle>
        <div className="grid gap-2 mt-3 text-sm" style={{ color: '#565b54' }}>
          {['Meals matched to your goal, not a generic diet', 'A rotating menu of 60 chef-crafted dishes', 'Fresh from our kitchen — never frozen, no preservatives', 'Pause, swap, or adjust any week'].map((b) => (
            <div key={b} className="flex gap-2.5 items-start"><CheckCircle2 size={17} color={C.sage} className="flex-none mt-0.5" strokeWidth={1.8} />{b}</div>
          ))}
        </div>
      </div>

      {checkingDelivery && (
        <Sheet onClose={() => setCheckingDelivery(false)} label="Check delivery availability">
          <div className="p-5 pb-8">
            <h2 style={{ ...serif, fontSize: 24, fontWeight: 700, color: C.ink }}>Delivery availability</h2>
            <p className="text-sm mt-1 mb-5" style={{ color: C.mute }}>We deliver fresh from {KITCHEN.area} ({KITCHEN.pincode}).</p>
            <DeliveryForm onDone={() => setCheckingDelivery(false)} />
          </div>
        </Sheet>
      )}

      {comparing && <PlanCompareSheet onClose={() => setComparing(false)} />}
    </div>
  );
}
