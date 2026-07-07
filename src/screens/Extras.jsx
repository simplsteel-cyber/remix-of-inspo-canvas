import React, { useEffect, useMemo, useRef, useState } from 'react';
import { C, serif, inr, priceOf, waLink, cartMealCount, planOverage } from '../lib/core.js';
import { BackBtn, Btn, DietDot, Field, Img, inputStyle, Required, SectionTitle, Sheet, cardStyle } from '../components/ui.jsx';
import { DeliveryForm } from '../components/delivery.jsx';
import { useUser } from '../context/UserContext.jsx';
import { useMenu } from '../context/MenuContext.jsx';
import { useCart } from '../stores/cart.js';
import { MessageCircle, ChevronRight, CheckCircle2, CircleUser, Plus, Minus, Trash2, RefreshCw, HeartPulse } from 'lucide-react';

const SECTION_ORDER = ['Lean & Light', 'Balanced Plates', 'High-Protein Power', 'Vegetarian Favourites', 'Plant-Based & Vegan', 'Other'];

// ── My Meal Plan — the week's chosen meals, plus BMI + dietitian ──
export function MealPlanScreen({ openDish }) {
  const { profile, plan, go, payExtras, acknowledgeExtras } = useUser();
  const { dishes } = useMenu();
  const items = useCart((s) => s.items);
  const setQty = useCart((s) => s.setQty);
  const removeItem = useCart((s) => s.remove);
  const addItem = useCart((s) => s.add);
  const [replacing, setReplacing] = useState(null);

  const h = parseFloat(profile.height), w = parseFloat(profile.weight);
  const bmi = h > 0 && w > 0 ? w / Math.pow(h / 100, 2) : null;
  const bmiLabel = bmi == null ? 'Add height & weight' : bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy range' : bmi < 30 ? 'Overweight' : 'Obese range';

  const lines = useMemo(
    () => items.map((i) => ({ item: i, dish: dishes.find((d) => d.name === i.name) })).filter((x) => x.dish),
    [items, dishes]
  );
  const count = cartMealCount(items);
  const overage = planOverage(plan, count);
  const groups = useMemo(() => {
    const m = {};
    for (const l of lines) { const s = l.dish.section || 'Other'; (m[s] = m[s] || []).push(l); }
    return Object.entries(m).sort((a, b) => SECTION_ORDER.indexOf(a[0]) - SECTION_ORDER.indexOf(b[0]));
  }, [lines]);

  return (
    <div className="px-5 pt-6 pb-6">
      <div className="flex items-center justify-between gap-3">
        <BackBtn onClick={() => go('home', null)} />
        <SectionTitle>My Meal Plan</SectionTitle>
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className="rounded-2xl p-4" style={{ background: C.mint }}>
          <div className="text-xs font-medium" style={{ color: '#3e6b2f' }}>Your BMI</div>
          <div className="text-2xl font-semibold" style={{ color: C.ink }}>{bmi ? bmi.toFixed(1) : '—'}</div>
          <div className="text-xs" style={{ color: '#3e6b2f' }}>{bmiLabel} · a guide, not a diagnosis</div>
        </div>
        <a href={waLink(`Hi Lean Kitchen! I'd like to book a dietitian consultation.${profile.name ? ' I\'m ' + profile.name + '.' : ''}${profile.goal ? ' Goal: ' + profile.goal + '.' : ''}`)}
          target="_blank" rel="noreferrer" className="rounded-2xl p-4 flex flex-col justify-between" style={cardStyle}>
          <div className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: C.ink }}><HeartPulse size={16} color={C.sage} strokeWidth={1.8} /> Dietitian</div>
          <span className="text-xs font-semibold inline-flex items-center gap-1 mt-2" style={{ color: C.wa }}><MessageCircle size={13} /> Book a consult</span>
        </a>
      </div>

      {plan ? (
        <div className="rounded-2xl px-4 py-3 mt-3 flex items-center justify-between gap-2" style={cardStyle}>
          <div>
            <div className="text-sm font-semibold" style={{ color: C.ink }}>{plan.name}</div>
            <div className="text-xs" style={{ color: overage ? '#b06c22' : C.mute }}>{count} of {plan.meals} meals selected{overage ? ` · ${overage} over plan` : ''}</div>
          </div>
          <button type="button" onClick={() => go('plans')} className="text-xs font-medium flex-none" style={{ color: '#3e6b2f' }}>Change plan</button>
        </div>
      ) : (
        <button type="button" onClick={() => go('plans')} className="rounded-2xl px-4 py-3 mt-3 w-full text-left text-sm font-medium"
          style={{ background: '#fff', border: `1px dashed ${C.sage}`, color: '#3e6b2f' }}>
          + Choose a subscription plan
        </button>
      )}

      {overage > 0 && (
        <OveragePrompt plan={plan} overage={overage} payExtras={payExtras} onAcknowledge={acknowledgeExtras} onChoosePlan={() => go('plans')} />
      )}

      {lines.length === 0 ? (
        <div className="rounded-3xl p-8 text-center text-sm mt-4" style={{ ...cardStyle, borderStyle: 'dashed', color: C.mute }}>
          No meals in your plan yet.
          <div className="mt-3"><Btn small onClick={() => go('meals', null)}>Browse meals</Btn></div>
        </div>
      ) : (
        <div className="mt-5 grid gap-5">
          {groups.map(([section, rows]) => (
            <div key={section}>
              <div className="mb-2" style={{ ...serif, fontSize: 18, fontWeight: 700, color: C.ink }}>{section}</div>
              <div className="grid gap-2.5">
                {rows.map(({ item, dish }) => (
                  <PlanMealRow key={dish.name} item={item} dish={dish} onOpen={() => openDish(dish)}
                    onInc={() => setQty(dish.name, item.qty + 1)} onDec={() => setQty(dish.name, item.qty - 1)}
                    onRemove={() => removeItem(dish.name)} onReplace={() => setReplacing(dish)} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-5 grid gap-2">
        <Btn kind="ghost" onClick={() => go('meals', null)}>+ Add more meals</Btn>
        {lines.length > 0 && <Btn onClick={() => go('orders')}>Review &amp; order</Btn>}
      </div>

      {replacing && (
        <ReplaceSheet dish={replacing} dishes={dishes} onClose={() => setReplacing(null)}
          onPick={(next) => { removeItem(replacing.name); addItem(next.name); setReplacing(null); }} />
      )}
    </div>
  );
}

function PlanMealRow({ item, dish, onOpen, onInc, onDec, onRemove, onReplace }) {
  return (
    <div className="rounded-2xl p-2.5 flex items-center gap-3" style={cardStyle}>
      <button type="button" onClick={onOpen} className="flex-none" aria-label={`Open ${dish.name}`}>
        <Img dish={dish} className="rounded-xl" style={{ width: 60, height: 60 }} />
      </button>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <DietDot diet={dish.diet} vegan={dish.vegan} />
          <span className="text-sm font-medium truncate" style={{ color: C.ink }}>{dish.name}</span>
        </div>
        <div className="text-xs mt-0.5" style={{ color: C.mute }}>{dish.protein ?? '—'}g protein · {priceOf(dish) ? inr(priceOf(dish)) : '—'}</div>
        <div className="flex items-center gap-3 mt-1.5">
          <span className="inline-flex items-center gap-2 rounded-full px-1.5 py-0.5" style={{ background: C.mint }}>
            <button type="button" aria-label={`Remove one ${dish.name}`} onClick={onDec} className="p-0.5"><Minus size={12} color="#3e6b2f" /></button>
            <span className="text-xs font-semibold" style={{ color: '#3e6b2f' }}>{item.qty}</span>
            <button type="button" aria-label={`Add one ${dish.name}`} onClick={onInc} className="p-0.5"><Plus size={12} color="#3e6b2f" /></button>
          </span>
          <button type="button" onClick={onReplace} className="text-xs font-medium inline-flex items-center gap-1" style={{ color: C.mute }}><RefreshCw size={12} /> Replace</button>
          <button type="button" onClick={onRemove} className="text-xs font-medium inline-flex items-center gap-1" style={{ color: C.mute }}><Trash2 size={12} /> Remove</button>
        </div>
      </div>
    </div>
  );
}

function OveragePrompt({ plan, overage, payExtras, onAcknowledge, onChoosePlan }) {
  return (
    <div className="rounded-2xl p-4 mt-3" role="alert" style={{ background: '#FDF3E7', border: '1px solid #F8DCB8' }}>
      <div className="text-sm font-semibold" style={{ color: '#b06c22' }}>Over your {plan.name} by {overage} meal{overage > 1 ? 's' : ''}</div>
      <p className="text-xs mt-1" style={{ color: '#b06c22' }}>
        Your plan includes {plan.meals} meals. Choose a bigger plan, or keep these and pay for the extra meals.
      </p>
      <div className="grid grid-cols-2 gap-2 mt-3">
        <Btn small kind="ghost" onClick={onChoosePlan}>Change plan</Btn>
        {payExtras
          ? <span className="inline-flex items-center justify-center gap-1 text-xs font-semibold rounded-full px-3 py-2" style={{ background: C.mint, color: '#3e6b2f' }}><CheckCircle2 size={13} /> Paying for extras</span>
          : <Btn small onClick={onAcknowledge}>Pay for extras</Btn>}
      </div>
    </div>
  );
}

function ReplaceSheet({ dish, dishes, onClose, onPick }) {
  const options = dishes.filter((d) => d.name !== dish.name && (d.section === dish.section || d.diet === dish.diet)).slice(0, 30);
  return (
    <Sheet onClose={onClose} label={`Replace ${dish.name}`}>
      <div className="p-5 pb-8">
        <h2 style={{ ...serif, fontSize: 22, fontWeight: 700, color: C.ink }}>Replace “{dish.name}”</h2>
        <p className="text-sm mt-1 mb-4" style={{ color: C.mute }}>Pick a similar meal to swap in.</p>
        <div className="grid gap-2">
          {options.map((d) => (
            <button key={d.name} type="button" onClick={() => onPick(d)} className="flex items-center gap-3 rounded-2xl p-2.5 text-left" style={cardStyle}>
              <Img dish={d} className="rounded-xl flex-none" style={{ width: 48, height: 48 }} />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5"><DietDot diet={d.diet} vegan={d.vegan} /><span className="text-sm font-medium truncate" style={{ color: C.ink }}>{d.name}</span></div>
                <div className="text-xs" style={{ color: C.mute }}>{d.protein ?? '—'}g protein · {priceOf(d) ? inr(priceOf(d)) : '—'}</div>
              </div>
            </button>
          ))}
          {options.length === 0 && <div className="text-sm text-center py-6" style={{ color: C.mute }}>No similar meals available.</div>}
        </div>
      </div>
    </Sheet>
  );
}

// ── Account — editable profile with auto-save ────────────────
const GOALS = ['Weight loss', 'Muscle gain', 'Everyday wellness', 'Athletic performance'];
const DIET_PREFS = ['No preference', 'Vegetarian', 'Non-vegetarian', 'Vegan'];

const validateProfile = (draft) => {
  const e = {};
  const h = parseFloat(draft.height), w = parseFloat(draft.weight);
  if (!draft.name.trim()) e.name = 'Please enter your name';
  if (!(h > 0) || h < 90 || h > 250) e.height = 'Enter a height between 90 and 250 cm';
  if (!(w > 0) || w < 25 || w > 250) e.weight = 'Enter a weight between 25 and 250 kg';
  return e;
};

export function AccountScreen() {
  const { user, profile, updateProfile, signOut, setStage, goBack } = useUser();
  const [draft, setDraft] = useState({
    name: profile.name, height: profile.height, weight: profile.weight,
    goal: profile.goal, dietPref: profile.dietPref, allergies: profile.allergies,
    nutritionistRef: profile.nutritionistRef,
  });
  const [errors, setErrors] = useState({});
  const [saved, setSaved] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const firstRun = useRef(true);
  const set = (k) => (e) => { setDraft((d) => ({ ...d, [k]: e.target.value })); setSaved(false); };

  // Auto-save: validate and persist 600ms after the user stops typing.
  useEffect(() => {
    if (firstRun.current) { firstRun.current = false; return; }
    const t = setTimeout(() => {
      const e = validateProfile(draft);
      setErrors(e);
      if (Object.keys(e).length === 0) {
        updateProfile(draft);
        setSaved(true);
      }
    }, 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft]);

  if (!user) {
    return (
      <div className="px-5 pt-6 pb-6">
        <BackBtn onClick={goBack} />
        <div className="text-center mt-10">
          <CircleUser size={44} color={C.sage} strokeWidth={1.5} className="mx-auto" />
          <h2 className="mt-4" style={{ ...serif, fontSize: 26, fontWeight: 700, color: C.ink }}>Browsing as a guest</h2>
          <p className="text-sm mt-2" style={{ color: C.mute }}>Sign in to save your profile, goals, and delivery details.</p>
          <div className="mt-6"><Btn onClick={() => setStage('welcome')}>Sign in or register</Btn></div>
        </div>
      </div>
    );
  }

  const signedInAs = user.method === 'google' ? `Google · ${user.email}` : user.method === 'email' ? user.email : user.phone;

  return (
    <div className="px-5 pt-6 pb-6 grid gap-4">
      <div className="flex items-center justify-between gap-3">
        <BackBtn onClick={goBack} />
        <SectionTitle>Account</SectionTitle>
      </div>
      <div className="text-sm -mt-2 flex items-center justify-between gap-2" style={{ color: C.mute }}>
        <span className="truncate">Signed in{signedInAs ? ` · ${signedInAs}` : ''}</span>
        <span role="status" className="flex-none inline-flex items-center gap-1 text-xs font-medium" style={{ color: saved ? '#3e6b2f' : C.mute }}>
          {saved ? <><CheckCircle2 size={13} /> Saved</> : 'Saving…'}
        </span>
      </div>

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
      <div className="text-xs -mt-1" style={{ color: C.mute }}>Changes save automatically.</div>

      <div className="rounded-3xl p-5 grid gap-4 mt-2" style={cardStyle}>
        <div className="text-sm font-semibold" style={{ color: C.ink }}>Delivery</div>
        <DeliveryForm />
      </div>

      <div className="rounded-3xl p-5 grid gap-3" style={cardStyle}>
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
      <div className="text-xs text-center" style={{ color: C.mute }}>Your profile is saved to your account.</div>
    </div>
  );
}
