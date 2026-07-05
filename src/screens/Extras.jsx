import React, { useState } from 'react';
import { C, serif, waLink } from '../lib/core.js';
import { Btn, Field, inputStyle, Required } from '../components/ui.jsx';
import { DeliveryForm } from '../components/delivery.jsx';
import { useUser } from '../context/UserContext.jsx';
import { MessageCircle, Droplets, ChevronRight, CheckCircle2 } from 'lucide-react';

export function NutritionScreen() {
  const { profile } = useUser();
  const h = parseFloat(profile.height), w = parseFloat(profile.weight);
  const bmi = h > 0 && w > 0 ? w / Math.pow(h / 100, 2) : null;
  const bmiLabel = bmi == null ? 'Add height and weight in Account' : bmi < 18.5 ? 'Underweight range' : bmi < 25 ? 'Healthy range' : bmi < 30 ? 'Overweight range' : 'Obese range';
  const [glasses, setGlasses] = useState(0);
  return (
    <div className="px-5 pt-6 pb-6 grid gap-4">
      <h2 style={{ ...serif, fontSize: 26, fontWeight: 700, color: C.ink }}>Nutrition</h2>
      <div className="rounded-3xl p-5 flex items-center justify-between" style={{ background: C.mint }}>
        <div>
          <div className="text-xs font-medium" style={{ color: '#3e6b2f' }}>Your BMI</div>
          <div className="text-3xl font-semibold" style={{ color: C.ink }}>{bmi ? bmi.toFixed(1) : '—'}</div>
        </div>
        <div className="text-xs text-right" style={{ color: '#3e6b2f' }}>{bmiLabel}<br />A guide, not a diagnosis</div>
      </div>
      <div className="rounded-3xl p-5" style={{ background: '#fff', border: `1px solid ${C.line}` }}>
        <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: C.ink }}><Droplets size={17} color={C.sage} strokeWidth={1.8} /> Water today</div>
        <div className="flex gap-1.5 mt-3">
          {[...Array(8)].map((_, i) => (
            <button key={i} type="button" aria-label={`Glass ${i + 1}`} aria-pressed={i < glasses} onClick={() => setGlasses(i + 1 === glasses ? i : i + 1)} className="flex-1 h-9 rounded-lg transition-all"
              style={{ background: i < glasses ? C.sage : C.grey }} />
          ))}
        </div>
        <div className="text-xs mt-2" style={{ color: C.mute }}>{glasses}/8 glasses</div>
      </div>
      <div className="rounded-3xl p-5" style={{ background: '#fff', border: `1px solid ${C.line}` }}>
        <div className="text-sm font-semibold" style={{ color: C.ink }}>Talk to a dietitian</div>
        <p className="text-sm mt-1" style={{ color: C.mute }}>Book a consultation to match your plan to your goal, allergies, and routine.</p>
        <a href={waLink(`Hi Lean Kitchen! I'd like to book a dietitian consultation.${profile.name ? ' I\'m ' + profile.name + '.' : ''}${profile.goal ? ' Goal: ' + profile.goal + '.' : ''}`)}
          target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-3 text-sm font-semibold py-1" style={{ color: C.wa }}>
          <MessageCircle size={16} /> Book on WhatsApp
        </a>
      </div>
      <div className="text-xs" style={{ color: C.mute }}>Full tracking — food log, weight, progress — arrives in the next release.</div>
    </div>
  );
}

const GOALS = ['Weight loss', 'Muscle gain', 'Everyday wellness', 'Athletic performance'];
const DIET_PREFS = ['No preference', 'Vegetarian', 'Non-vegetarian', 'Vegan'];

export function AccountScreen() {
  const { user, profile, updateProfile, signOut } = useUser();
  const [draft, setDraft] = useState({
    name: profile.name, height: profile.height, weight: profile.weight,
    goal: profile.goal, dietPref: profile.dietPref, allergies: profile.allergies,
    nutritionistRef: profile.nutritionistRef,
  });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const set = (k) => (e) => { setDraft((d) => ({ ...d, [k]: e.target.value })); setSaved(false); };

  const save = () => {
    const e = {};
    const h = parseFloat(draft.height), w = parseFloat(draft.weight);
    if (!draft.name.trim()) e.name = 'Please enter your name';
    if (!(h > 0) || h < 90 || h > 250) e.height = 'Enter a height between 90 and 250 cm';
    if (!(w > 0) || w < 25 || w > 250) e.weight = 'Enter a weight between 25 and 250 kg';
    setErrors(e);
    if (Object.keys(e).length) return;
    updateProfile(draft);
    setSaved(true);
  };

  const signedInAs = user
    ? user.method === 'google' ? `Google · ${user.email}` : user.method === 'email' ? user.email : user.phone
    : '';

  return (
    <div className="px-5 pt-6 pb-6 grid gap-4">
      <h2 style={{ ...serif, fontSize: 26, fontWeight: 700, color: C.ink }}>Account</h2>
      <div className="text-sm -mt-2" style={{ color: C.mute }}>Signed in{signedInAs ? ` · ${signedInAs}` : ''}</div>

      <Field label={<>Name<Required /></>} error={errors.name}>
        <input style={inputStyle} aria-required="true" autoComplete="name" value={draft.name} onChange={set('name')} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={<>Height (cm)<Required /></>} error={errors.height}>
          <input style={inputStyle} aria-required="true" inputMode="numeric" value={draft.height} onChange={set('height')} />
        </Field>
        <Field label={<>Weight (kg)<Required /></>} error={errors.weight}>
          <input style={inputStyle} aria-required="true" inputMode="numeric" value={draft.weight} onChange={set('weight')} />
        </Field>
      </div>
      <Field label="Goal">
        <select style={inputStyle} value={draft.goal} onChange={set('goal')}>
          <option value="">Select</option>
          {GOALS.map((g) => <option key={g}>{g}</option>)}
        </select>
      </Field>
      <Field label="Dietary preference">
        <select style={inputStyle} value={draft.dietPref} onChange={set('dietPref')}>
          {DIET_PREFS.map((g) => <option key={g}>{g}</option>)}
        </select>
      </Field>
      <Field label="Allergies"><input style={inputStyle} value={draft.allergies} onChange={set('allergies')} /></Field>
      <Field label="Nutritionist reference"><input style={inputStyle} value={draft.nutritionistRef} onChange={set('nutritionistRef')} placeholder="Referred by (optional)" /></Field>
      <div className="grid gap-2">
        <Btn onClick={save}>Save profile</Btn>
        {saved && (
          <div role="status" className="flex items-center justify-center gap-1.5 text-sm font-medium" style={{ color: '#3e6b2f' }}>
            <CheckCircle2 size={15} /> Profile saved
          </div>
        )}
      </div>

      <div className="rounded-3xl p-5 grid gap-4 mt-2" style={{ background: '#fff', border: `1px solid ${C.line}` }}>
        <div className="text-sm font-semibold" style={{ color: C.ink }}>Delivery</div>
        <DeliveryForm />
      </div>

      <div className="rounded-3xl p-5 grid gap-3" style={{ background: '#fff', border: `1px solid ${C.line}` }}>
        <div className="text-sm font-semibold" style={{ color: C.ink }}>Help & support</div>
        {[['Customer support', 'Hi Lean Kitchen! I need help with my subscription.'], ['Ask a question', 'Hi Lean Kitchen! I have a question.'], ['Dietitian consultation', "Hi Lean Kitchen! I'd like to book a dietitian consultation."]].map(([label, msg]) => (
          <a key={label} href={waLink(msg + (profile.name ? ` — ${profile.name}` : ''))} target="_blank" rel="noreferrer"
            className="flex items-center justify-between text-sm py-1" style={{ color: C.ink }}>
            <span className="flex items-center gap-2"><MessageCircle size={15} color={C.wa} /> {label}</span>
            <ChevronRight size={15} color={C.mute} />
          </a>
        ))}
      </div>

      <Btn kind="ghost" busy={signingOut} onClick={async () => { setSigningOut(true); await signOut(); }}>Sign out</Btn>
      <div className="text-xs text-center" style={{ color: C.mute }}>Your profile is saved on this device.</div>
    </div>
  );
}
