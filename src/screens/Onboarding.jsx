import React, { useState } from 'react';
import { C, serif, inr } from '../lib/core.js';
import { HERO } from '../data/images.js';
import { KITCHEN } from '../lib/delivery.js';
import { BackBtn, Btn, Field, inputStyle, Required } from '../components/ui.jsx';
import { DeliveryForm } from '../components/delivery.jsx';
import { useUser } from '../context/UserContext.jsx';
import { useMenu } from '../context/MenuContext.jsx';
import { ChevronLeft, CheckCircle2 } from 'lucide-react';

const TOTAL_STEPS = 5;

// ── Welcome — authentication (Supabase: Google + Email) ─────
export function Welcome() {
  const { signInWithEmail, signInWithGoogle, setStage } = useUser();
  const [method, setMethod] = useState(null); // null | 'email'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [confirmSent, setConfirmSent] = useState('');

  const run = async (fn) => {
    setBusy(true);
    setError('');
    setConfirmSent('');
    try {
      await fn();
    } catch (err) {
      setError(err.message || 'Sign-in failed. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const submitEmail = () => run(async () => {
    const res = await signInWithEmail(email, password);
    // If email confirmation is required, no session lands yet — show
    // a friendly "check your inbox" state instead of routing.
    if (res?.pendingConfirmation) setConfirmSent(res.email || email.trim());
    // Otherwise routing happens via the auth listener.
  });

  const reset = () => { setMethod(null); setError(''); setConfirmSent(''); };

  return (
    <div className="flex flex-col min-h-screen relative" style={{ background: C.warm }}>
      <button type="button" aria-label="Back to homepage" onClick={() => setStage('app')}
        className="absolute top-4 left-4 z-10 rounded-full p-2" style={{ background: 'rgba(255,255,255,0.92)' }}>
        <ChevronLeft size={18} color={C.ink} />
      </button>
      <img src={HERO} alt="Fresh chef-crafted bowl" className="w-full" style={{ height: 240, objectFit: 'cover' }} />
      <div className="flex-1 px-6 pt-8 pb-28 flex flex-col">
        <h1 style={{ ...serif, fontSize: 40, fontWeight: 700, color: C.ink, lineHeight: 1.05 }}>Lean Kitchen</h1>
        <div className="text-sm mt-1" style={{ color: C.mute }}>by Black Olive · Chef Ali Azan</div>
        <p className="mt-4 text-base leading-relaxed" style={{ color: '#565b54' }}>
          Healthy eating, made effortless. Chef-crafted meals tailored to your goals, delivered fresh every week.
        </p>
        {error && !method && (
          <div role="alert" className="text-sm mt-4 rounded-2xl px-4 py-3" style={{ background: '#FBEDEB', color: '#c0392b' }}>{error}</div>
        )}
        <div className="grid gap-2.5 pt-8">
          {confirmSent ? (
            <div className="rounded-2xl p-5 text-center" style={{ background: C.mint }}>
              <CheckCircle2 size={32} color={C.cta} strokeWidth={1.8} className="mx-auto" />
              <div className="text-sm font-semibold mt-2" style={{ color: '#3e6b2f' }}>Confirm your email</div>
              <p className="text-xs mt-1" style={{ color: '#3e6b2f' }}>
                We sent a confirmation link to <span className="font-semibold">{confirmSent}</span>. Click it to activate your account, then sign in.
              </p>
              <button type="button" className="text-xs font-medium mt-3 underline" style={{ color: '#3e6b2f' }} onClick={reset}>Back to sign-in</button>
            </div>
          ) : !method ? (<>
            <Btn kind="ghost" busy={busy} onClick={() => run(signInWithGoogle)}>Continue with Google</Btn>
            <Btn kind="ghost" disabled={busy} onClick={() => { reset(); setMethod('email'); }}>Continue with Email</Btn>
          </>) : (
            <form className="grid gap-2.5" onSubmit={(e) => { e.preventDefault(); submitEmail(); }}>
              <Field label="Email">
                <input style={inputStyle} type="email" autoComplete="email" autoFocus value={email}
                  onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
              </Field>
              <Field label="Password" error={error}>
                <input style={inputStyle} type="password" autoComplete="current-password" value={password}
                  onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" />
              </Field>
              <Btn type="submit" busy={busy}>Continue</Btn>
              <div className="text-xs text-center" style={{ color: C.mute }}>New here? The same form creates your account.</div>
              <button type="button" className="text-xs py-2 font-medium" style={{ color: C.mute }} onClick={reset}>All sign-in options</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Register — profile basics ───────────────────────────────
export function Register() {
  const { profile, updateProfile, setStage } = useUser();
  const [errors, setErrors] = useState({});
  const set = (k) => (e) => updateProfile({ [k]: e.target.value });
  const h = parseFloat(profile.height), w = parseFloat(profile.weight);
  const bmi = h > 0 && w > 0 ? w / Math.pow(h / 100, 2) : null;

  const handleContinue = () => {
    const e = {};
    if (!profile.name.trim()) e.name = 'Please enter your name';
    if (!profile.phone.trim()) e.phone = 'Please enter your phone or WhatsApp number';
    setErrors(e);
    if (Object.keys(e).length === 0) setStage('registered');
  };

  return (
    <div className="min-h-screen px-6 pt-10 pb-28" style={{ background: C.warm }}>
      <div className="mb-6">
        <BackBtn onClick={() => setStage('app')} />
      </div>
      <h1 style={{ ...serif, fontSize: 32, fontWeight: 700, color: C.ink }}>Tell us about you</h1>
      <p className="text-sm mt-1 mb-6" style={{ color: C.mute }}>Just your name and number to get started — the rest is optional and shapes your recommendations. You can edit it anytime.</p>
      <div className="grid gap-4">
        <Field label={<>Name<Required /></>} error={errors.name}>
          <input style={inputStyle} aria-required="true" autoComplete="name" value={profile.name} onChange={set('name')} placeholder="Your name" />
        </Field>
        <Field label={<>Phone / WhatsApp<Required /></>} error={errors.phone}>
          <input style={inputStyle} aria-required="true" type="tel" inputMode="tel" autoComplete="tel" value={profile.phone} onChange={set('phone')} placeholder="e.g. 98925 72408" />
        </Field>
        <div className="text-xs font-semibold mt-1" style={{ color: C.mute }}>Optional — helps us tailor your plan</div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Age"><input style={inputStyle} inputMode="numeric" value={profile.age} onChange={set('age')} placeholder="30" /></Field>
          <Field label="Gender">
            <select style={inputStyle} value={profile.gender} onChange={set('gender')}>
              <option value="">Select</option><option>Female</option><option>Male</option><option>Other</option>
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Height (cm)">
            <input style={inputStyle} inputMode="numeric" value={profile.height} onChange={set('height')} placeholder="170" />
          </Field>
          <Field label="Weight (kg)">
            <input style={inputStyle} inputMode="numeric" value={profile.weight} onChange={set('weight')} placeholder="70" />
          </Field>
        </div>
        {bmi && (
          <div className="rounded-2xl p-4 flex items-center justify-between" style={{ background: C.mint }}>
            <div>
              <div className="text-xs font-medium" style={{ color: '#3e6b2f' }}>Your BMI</div>
              <div className="text-2xl font-semibold" style={{ color: C.ink }}>{bmi.toFixed(1)}</div>
            </div>
            <div className="text-xs text-right" style={{ color: '#3e6b2f' }}>A guide, not a diagnosis</div>
          </div>
        )}
        <Field label="Allergies (if any)"><input style={inputStyle} value={profile.allergies} onChange={set('allergies')} placeholder="e.g. peanuts, shellfish" /></Field>
        <Field label="Nutritionist Reference (optional)"><input style={inputStyle} value={profile.nutritionistRef} onChange={set('nutritionistRef')} placeholder="Referred by (optional)" /></Field>
      </div>
      <div className="mt-8"><Btn className="w-full" onClick={handleContinue}>Continue</Btn></div>
    </div>
  );
}

// ── Registration success confirmation ───────────────────────
export function RegisterSuccess() {
  const { profile, setStage } = useUser();
  return (
    <div className="min-h-screen px-6 pt-24 pb-10 flex flex-col items-center text-center" style={{ background: C.warm }}>
      <CheckCircle2 size={56} color={C.cta} strokeWidth={1.5} />
      <h1 className="mt-5" style={{ ...serif, fontSize: 30, fontWeight: 700, color: C.ink }}>Account created</h1>
      <p className="text-sm mt-2 leading-relaxed" style={{ color: C.mute }}>
        Welcome{profile.name ? `, ${profile.name}` : ''}! Let's personalise your meal plan — a few quick questions.
      </p>
      <div className="mt-auto w-full"><Btn className="w-full" onClick={() => setStage('onboard')}>Personalise my plan</Btn></div>
    </div>
  );
}

// ── Onboarding — goal, meals, diet, delivery, recommendation ─
export function Onboarding() {
  const { profile, updateProfile, delivery, route, setStep, setStage, startWithPlan, completeOnboarding } = useUser();
  const { plans } = useMenu();
  const step = route.step ?? 0;
  const goals = ['Weight loss', 'Muscle gain', 'Everyday wellness', 'Athletic performance'];
  const weeks = [6, 12, 18, 24];
  const diets = ['No preference', 'Vegetarian', 'Non-vegetarian', 'Vegan'];
  const rec = (profile.mealsPerWeek >= 20 ? plans[2] : profile.mealsPerWeek >= 10 ? plans[1] : plans[0]) || plans[0];
  const next = () => setStep(Math.min(step + 1, TOTAL_STEPS - 1));

  const Chip = ({ active, children, onClick }) => (
    <button type="button" onClick={onClick} aria-pressed={active} className="rounded-2xl px-4 py-4 text-sm font-medium text-left transition-all"
      style={active ? { background: C.mint, border: `1.5px solid ${C.sage}`, color: '#3e6b2f' } : { background: '#fff', border: `1px solid ${C.line}`, color: C.ink }}>
      {children}
    </button>
  );

  return (
    <div className="min-h-screen px-6 pt-10 pb-10 flex flex-col" style={{ background: C.warm }}>
      <div className="flex items-center gap-3">
        <button type="button" aria-label="Back" className="p-1 -m-1" onClick={() => (step > 0 ? setStep(step - 1) : setStage('register'))}>
          <ChevronLeft size={20} color={C.mute} />
        </button>
        <div className="flex gap-1.5 flex-1" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={TOTAL_STEPS}
          aria-label={`Onboarding step ${step + 1} of ${TOTAL_STEPS}`}>
          {[...Array(TOTAL_STEPS)].map((_, i) => <span key={i} className="h-1 flex-1 rounded-full" style={{ background: i <= step ? C.sage : C.line }} />)}
        </div>
      </div>
      <div className="text-xs mt-2 mb-8 text-right" style={{ color: C.mute }}>Step {step + 1} of {TOTAL_STEPS}</div>

      {step === 0 && (<>
        <h1 style={{ ...serif, fontSize: 30, fontWeight: 700, color: C.ink }}>What's your goal?</h1>
        <div className="grid gap-2.5 mt-6">
          {goals.map((g) => <Chip key={g} active={profile.goal === g} onClick={() => { updateProfile({ goal: g }); next(); }}>{g}</Chip>)}
        </div>
      </>)}
      {step === 1 && (<>
        <h1 style={{ ...serif, fontSize: 30, fontWeight: 700, color: C.ink }}>Meals per week?</h1>
        <div className="grid grid-cols-2 gap-2.5 mt-6">
          {weeks.map((n) => <Chip key={n} active={profile.mealsPerWeek === n} onClick={() => { updateProfile({ mealsPerWeek: n }); next(); }}>{n} meals</Chip>)}
        </div>
      </>)}
      {step === 2 && (<>
        <h1 style={{ ...serif, fontSize: 30, fontWeight: 700, color: C.ink }}>Dietary preference?</h1>
        <div className="grid gap-2.5 mt-6">
          {diets.map((g) => <Chip key={g} active={profile.dietPref === g} onClick={() => { updateProfile({ dietPref: g }); next(); }}>{g}</Chip>)}
        </div>
      </>)}
      {step === 3 && (<>
        <h1 style={{ ...serif, fontSize: 30, fontWeight: 700, color: C.ink }}>Where should we deliver?</h1>
        <p className="text-sm mt-1" style={{ color: C.mute }}>Fresh from our {KITCHEN.area} kitchen ({KITCHEN.pincode}).</p>
        <div className="mt-6"><DeliveryForm /></div>
        {delivery && delivery.status !== 'unknown' && (
          <div className="mt-5"><Btn className="w-full" onClick={next}>Continue</Btn></div>
        )}
      </>)}
      {step === 4 && rec && (<>
        <h1 style={{ ...serif, fontSize: 30, fontWeight: 700, color: C.ink }}>Made for you</h1>
        <p className="text-sm mt-1" style={{ color: C.mute }}>Based on your goal and week, we recommend:</p>
        <div className="rounded-3xl p-5 mt-6" style={{ background: '#fff', border: `1.5px solid ${C.sage}`, boxShadow: '0 6px 24px rgba(141,187,116,0.18)' }}>
          <div className="text-xs font-semibold px-2.5 py-1 rounded-full inline-block" style={{ background: C.mint, color: '#3e6b2f' }}>Recommended</div>
          <h2 className="mt-2" style={{ ...serif, fontSize: 26, fontWeight: 700, color: C.ink }}>{rec.name}</h2>
          <p className="text-sm mt-1" style={{ color: C.mute }}>{rec.desc}</p>
          <div className="text-sm mt-3 font-semibold" style={{ color: C.ink }}>{rec.meals} meals · {inr(rec.perMeal)} per meal</div>
          <div className="mt-4 grid gap-2">
            <Btn onClick={() => startWithPlan(rec)}>Choose plan &amp; pick meals</Btn>
            <Btn kind="ghost" onClick={completeOnboarding}>Explore first</Btn>
          </div>
        </div>
      </>)}

      {step < TOTAL_STEPS - 1 && (
        <div className="mt-auto pt-8 text-center">
          <button type="button" onClick={next} className="text-sm font-medium px-4 py-2.5" style={{ color: C.mute }}>Skip</button>
        </div>
      )}
    </div>
  );
}
