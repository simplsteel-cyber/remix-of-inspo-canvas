import React, { useState } from 'react';
import { C, serif, waLink } from '../lib/core.js';
import { Btn, Field, inputStyle } from '../components/ui.jsx';
import { MessageCircle, Droplets, ChevronRight } from 'lucide-react';

export function NutritionScreen({ profile }) {
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
            <button key={i} aria-label={`Glass ${i + 1}`} onClick={() => setGlasses(i + 1 === glasses ? i : i + 1)} className="flex-1 h-9 rounded-lg transition-all"
              style={{ background: i < glasses ? C.sage : C.grey }} />
          ))}
        </div>
        <div className="text-xs mt-2" style={{ color: C.mute }}>{glasses}/8 glasses</div>
      </div>
      <div className="rounded-3xl p-5" style={{ background: '#fff', border: `1px solid ${C.line}` }}>
        <div className="text-sm font-semibold" style={{ color: C.ink }}>Talk to a dietitian</div>
        <p className="text-sm mt-1" style={{ color: C.mute }}>Book a consultation to match your plan to your goal, allergies, and routine.</p>
        <a href={waLink(`Hi Lean Kitchen! I'd like to book a dietitian consultation.${profile.name ? ' I\'m ' + profile.name + '.' : ''}${profile.goal ? ' Goal: ' + profile.goal + '.' : ''}`)}
          target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 mt-3 text-sm font-semibold" style={{ color: C.wa }}>
          <MessageCircle size={16} /> Book on WhatsApp
        </a>
      </div>
      <div className="text-xs" style={{ color: C.mute }}>Full tracking — food log, weight, progress — arrives in the next release.</div>
    </div>
  );
}

export function AccountScreen({ profile, setProfile, signOut }) {
  const set = (k) => (e) => setProfile({ ...profile, [k]: e.target.value });
  return (
    <div className="px-5 pt-6 pb-6 grid gap-4">
      <h2 style={{ ...serif, fontSize: 26, fontWeight: 700, color: C.ink }}>Account</h2>
      <div className="text-sm -mt-2" style={{ color: C.mute }}>{profile.name ? `Signed in as ${profile.name}` : 'Browsing as guest'}</div>
      <Field label="Name"><input style={inputStyle} value={profile.name} onChange={set('name')} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Height (cm)"><input style={inputStyle} inputMode="numeric" value={profile.height} onChange={set('height')} /></Field>
        <Field label="Weight (kg)"><input style={inputStyle} inputMode="numeric" value={profile.weight} onChange={set('weight')} /></Field>
      </div>
      <Field label="Goal">
        <select style={inputStyle} value={profile.goal} onChange={set('goal')}>
          <option value="">Select</option>
          {['Weight loss', 'Muscle gain', 'Everyday wellness', 'Athletic performance'].map((g) => <option key={g}>{g}</option>)}
        </select>
      </Field>
      <Field label="Allergies"><input style={inputStyle} value={profile.allergies} onChange={set('allergies')} /></Field>
      <div className="rounded-3xl p-5 grid gap-3" style={{ background: '#fff', border: `1px solid ${C.line}` }}>
        <div className="text-sm font-semibold" style={{ color: C.ink }}>Help & support</div>
        {[['Customer support', 'Hi Lean Kitchen! I need help with my order.'], ['Ask a question', 'Hi Lean Kitchen! I have a question.'], ['Dietitian consultation', "Hi Lean Kitchen! I'd like to book a dietitian consultation."]].map(([label, msg]) => (
          <a key={label} href={waLink(msg + (profile.name ? ` — ${profile.name}` : ''))} target="_blank" rel="noreferrer"
            className="flex items-center justify-between text-sm" style={{ color: C.ink }}>
            <span className="flex items-center gap-2"><MessageCircle size={15} color={C.wa} /> {label}</span>
            <ChevronRight size={15} color={C.mute} />
          </a>
        ))}
      </div>
      <Btn kind="ghost" onClick={signOut}>Sign out</Btn>
      <div className="text-xs text-center" style={{ color: C.mute }}>Profile is saved for this session only in the prototype.</div>
    </div>
  );
}
