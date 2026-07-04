import React, { useState } from 'react';
import { C, serif, inr, PLANS } from '../lib/core.js';
import { HERO } from '../data/images.js';
import { Btn, Field, inputStyle } from '../components/ui.jsx';
import { ChevronLeft } from 'lucide-react';

export function Welcome({ onNext }) {
  return (
    <div className="flex flex-col min-h-screen" style={{ background: C.warm }}>
      <img src={HERO} alt="Fresh chef-crafted bowl" className="w-full" style={{ height: 300, objectFit: 'cover' }} />
      <div className="flex-1 px-6 pt-8 pb-10 flex flex-col">
        <h1 style={{ ...serif, fontSize: 40, fontWeight: 700, color: C.ink, lineHeight: 1.05 }}>Lean Kitchen</h1>
        <div className="text-sm mt-1" style={{ color: C.mute }}>by Black Olive · Chef Ali</div>
        <p className="mt-4 text-base leading-relaxed" style={{ color: '#565b54' }}>
          Healthy eating, made effortless. Chef-crafted meals tailored to your goals, delivered fresh every week.
        </p>
        <div className="mt-auto grid gap-2.5 pt-8">
          <Btn kind="ghost" onClick={onNext}>Continue with Google</Btn>
          <Btn kind="ghost" onClick={onNext}>Continue with Apple</Btn>
          <Btn onClick={onNext}>Proceed as guest</Btn>
          <div className="text-center text-xs mt-1" style={{ color: C.mute }}>Prototype — sign-in is simulated</div>
        </div>
      </div>
    </div>
  );
}

export function Register({ profile, setProfile, onNext }) {
  const set = (k) => (e) => setProfile({ ...profile, [k]: e.target.value });
  const h = parseFloat(profile.height), w = parseFloat(profile.weight);
  const bmi = h > 0 && w > 0 ? w / Math.pow(h / 100, 2) : null;
  return (
    <div className="min-h-screen px-6 pt-10 pb-10" style={{ background: C.warm }}>
      <h1 style={{ ...serif, fontSize: 32, fontWeight: 700, color: C.ink }}>Tell us about you</h1>
      <p className="text-sm mt-1 mb-6" style={{ color: C.mute }}>This shapes your recommendations. You can edit it anytime.</p>
      <div className="grid gap-4">
        <Field label="Name"><input style={inputStyle} value={profile.name} onChange={set('name')} placeholder="Your name" /></Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Age"><input style={inputStyle} inputMode="numeric" value={profile.age} onChange={set('age')} placeholder="30" /></Field>
          <Field label="Gender">
            <select style={inputStyle} value={profile.gender} onChange={set('gender')}>
              <option value="">Select</option><option>Female</option><option>Male</option><option>Other</option>
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Height (cm)"><input style={inputStyle} inputMode="numeric" value={profile.height} onChange={set('height')} placeholder="170" /></Field>
          <Field label="Weight (kg)"><input style={inputStyle} inputMode="numeric" value={profile.weight} onChange={set('weight')} placeholder="70" /></Field>
        </div>
        <div className="rounded-2xl p-4 flex items-center justify-between" style={{ background: C.mint }}>
          <div>
            <div className="text-xs font-medium" style={{ color: '#3e6b2f' }}>Your BMI</div>
            <div className="text-2xl font-semibold" style={{ color: C.ink }}>{bmi ? bmi.toFixed(1) : '—'}</div>
          </div>
          <div className="text-xs text-right" style={{ color: '#3e6b2f' }}>A guide, not a diagnosis</div>
        </div>
        <Field label="Allergies (if any)"><input style={inputStyle} value={profile.allergies} onChange={set('allergies')} placeholder="e.g. peanuts, shellfish" /></Field>
      </div>
      <div className="mt-8"><Btn className="w-full" onClick={onNext}>Continue</Btn></div>
    </div>
  );
}

export function Onboarding({ profile, setProfile, onDone, choosePlan }) {
  const [step, setStep] = useState(0);
  const goals = ['Weight loss', 'Muscle gain', 'Everyday wellness', 'Athletic performance'];
  const weeks = [6, 12, 18, 24];
  const diets = ['No preference', 'Vegetarian', 'Non-vegetarian', 'Vegan'];
  const rec = profile.mealsPerWeek >= 20 ? PLANS[2] : profile.mealsPerWeek >= 10 ? PLANS[1] : PLANS[0];

  const Chip = ({ active, children, onClick }) => (
    <button onClick={onClick} className="rounded-2xl px-4 py-4 text-sm font-medium text-left transition-all"
      style={active ? { background: C.mint, border: `1.5px solid ${C.sage}`, color: '#3e6b2f' } : { background: '#fff', border: `1px solid ${C.line}`, color: C.ink }}>
      {children}
    </button>
  );

  return (
    <div className="min-h-screen px-6 pt-10 pb-10 flex flex-col" style={{ background: C.warm }}>
      <div className="flex items-center gap-3 mb-8">
        {step > 0 && <button aria-label="Back" onClick={() => setStep(step - 1)}><ChevronLeft size={20} color={C.mute} /></button>}
        <div className="flex gap-1.5 flex-1">
          {[0, 1, 2, 3].map((i) => <span key={i} className="h-1 flex-1 rounded-full" style={{ background: i <= step ? C.sage : C.line }} />)}
        </div>
      </div>

      {step === 0 && (<>
        <h1 style={{ ...serif, fontSize: 30, fontWeight: 700, color: C.ink }}>What's your goal?</h1>
        <div className="grid gap-2.5 mt-6">
          {goals.map((g) => <Chip key={g} active={profile.goal === g} onClick={() => { setProfile({ ...profile, goal: g }); setStep(1); }}>{g}</Chip>)}
        </div>
      </>)}
      {step === 1 && (<>
        <h1 style={{ ...serif, fontSize: 30, fontWeight: 700, color: C.ink }}>Meals per week?</h1>
        <div className="grid grid-cols-2 gap-2.5 mt-6">
          {weeks.map((n) => <Chip key={n} active={profile.mealsPerWeek === n} onClick={() => { setProfile({ ...profile, mealsPerWeek: n }); setStep(2); }}>{n} meals</Chip>)}
        </div>
      </>)}
      {step === 2 && (<>
        <h1 style={{ ...serif, fontSize: 30, fontWeight: 700, color: C.ink }}>Dietary preference?</h1>
        <div className="grid gap-2.5 mt-6">
          {diets.map((g) => <Chip key={g} active={profile.dietPref === g} onClick={() => { setProfile({ ...profile, dietPref: g }); setStep(3); }}>{g}</Chip>)}
        </div>
      </>)}
      {step === 3 && (<>
        <h1 style={{ ...serif, fontSize: 30, fontWeight: 700, color: C.ink }}>Made for you</h1>
        <p className="text-sm mt-1" style={{ color: C.mute }}>Based on your goal and week, we recommend:</p>
        <div className="rounded-3xl p-5 mt-6" style={{ background: '#fff', border: `1.5px solid ${C.sage}`, boxShadow: '0 6px 24px rgba(141,187,116,0.18)' }}>
          <div className="text-xs font-semibold px-2.5 py-1 rounded-full inline-block" style={{ background: C.mint, color: '#3e6b2f' }}>Recommended</div>
          <h2 className="mt-2" style={{ ...serif, fontSize: 26, fontWeight: 700, color: C.ink }}>{rec.name}</h2>
          <p className="text-sm mt-1" style={{ color: C.mute }}>{rec.desc}</p>
          <div className="text-sm mt-3 font-semibold" style={{ color: C.ink }}>{rec.meals} meals · {inr(rec.perMeal)} per meal</div>
          <div className="mt-4 grid gap-2">
            <Btn onClick={() => choosePlan(rec)}>Create my meal plan</Btn>
            <Btn kind="ghost" onClick={onDone}>Explore first</Btn>
          </div>
        </div>
      </>)}
    </div>
  );
}
