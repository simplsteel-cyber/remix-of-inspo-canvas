import React from 'react';
import { C, serif, rating, reviews, macros, waLink, inr, plansForDish } from '../lib/core.js';
import { DietDot, Img, Stars, Sheet, cardStyle } from './ui.jsx';
import { useUser } from '../context/UserContext.jsx';
import { Heart, X } from 'lucide-react';

export function MealCard({ dish, onOpen }) {
  const { favs, toggleFav } = useUser();
  const fav = favs.includes(dish.name);
  return (
    <div onClick={() => onOpen(dish)} className="rounded-3xl overflow-hidden cursor-pointer transition-transform hover:-translate-y-0.5"
      style={{ ...cardStyle, boxShadow: '0 4px 18px rgba(45,45,45,0.05)' }}>
      <div className="relative">
        <Img dish={dish} className="w-full" style={{ height: 168 }} />
        <button type="button" aria-label={fav ? 'Remove favourite' : 'Add favourite'} aria-pressed={fav}
          onClick={(e) => { e.stopPropagation(); toggleFav(dish.name); }}
          className="absolute top-3 right-3 rounded-full p-2.5" style={{ background: 'rgba(255,255,255,0.92)' }}>
          <Heart size={16} color={fav ? C.orange : C.mute} fill={fav ? C.orange : 'none'} />
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <DietDot diet={dish.diet} vegan={dish.vegan} />
            <h3 className="truncate" style={{ ...serif, fontSize: 19, fontWeight: 700, color: C.ink }}>{dish.name}</h3>
          </div>
          <Stars value={rating(dish)} />
        </div>
        <div className="text-xs mt-1.5" style={{ color: C.mute }}>{dish.kcal} kcal · {dish.protein}g protein</div>
        <div className="mt-3">
          <span className="font-semibold" style={{ color: C.ink }}>{inr(+dish.price)}</span>
        </div>
      </div>
    </div>
  );
}

// Compact horizontal-scroll card used by Home rows, favourites,
// and recently viewed — one definition everywhere.
export function MiniMealCard({ dish, onOpen }) {
  return (
    <button type="button" onClick={() => onOpen(dish)} className="flex-none w-44 rounded-3xl overflow-hidden text-left" style={cardStyle}>
      <Img dish={dish} className="w-full" style={{ height: 112 }} />
      <div className="p-3">
        <div className="flex items-center gap-1.5 min-w-0">
          <DietDot diet={dish.diet} vegan={dish.vegan} />
          <span className="text-sm font-semibold truncate" style={{ color: C.ink }}>{dish.name}</span>
        </div>
        <div className="flex items-center justify-between mt-1.5 text-xs" style={{ color: C.mute }}>
          <span>{dish.protein}g protein</span><Stars value={rating(dish)} />
        </div>
      </div>
    </button>
  );
}

export function MealDetail({ dish, onClose }) {
  const { choosePlan } = useUser();
  if (!dish) return null;
  const m = macros(dish);
  return (
    <Sheet onClose={onClose} label={dish.name}>
      <div className="relative">
        <Img dish={dish} className="w-full" style={{ height: 224 }} />
        <button type="button" onClick={onClose} aria-label="Close" className="absolute top-4 right-4 rounded-full p-2.5" style={{ background: 'rgba(255,255,255,0.95)' }}>
          <X size={16} color={C.ink} />
        </button>
      </div>
      <div className="p-5 pb-8">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <DietDot diet={dish.diet} vegan={dish.vegan} />
            <h2 style={{ ...serif, fontSize: 26, fontWeight: 700, color: C.ink, lineHeight: 1.1 }}>{dish.name}</h2>
          </div>
          <Stars value={rating(dish)} />
        </div>
        <div className="text-xs mt-1" style={{ color: C.mute }}>{reviews(dish)} reviews · {dish.cuisine}</div>
        <p className="text-sm mt-3 leading-relaxed" style={{ color: '#565b54' }}>{dish.desc}</p>

        <div className="grid grid-cols-4 gap-2 mt-5">
          {[['Calories', dish.kcal], ['Protein', dish.protein + 'g'], ['Carbs', m.carbs ? '~' + m.carbs + 'g' : '—'], ['Fat', m.fat ? '~' + m.fat + 'g' : '—']].map(([k, v]) => (
            <div key={k} className="rounded-2xl py-3 text-center" style={{ background: C.grey }}>
              <div className="font-semibold text-sm" style={{ color: C.ink }}>{v}</div>
              <div className="text-xs mt-0.5" style={{ color: C.mute }}>{k}</div>
            </div>
          ))}
        </div>
        <div className="text-xs mt-2" style={{ color: C.mute }}>Approximate values — finalised per ingredient grammage.</div>

        <h3 className="mt-5 mb-2 text-sm font-semibold" style={{ color: C.ink }}>What's on the plate</h3>
        <div className="text-sm" style={{ color: '#565b54' }}>{dish.base}{dish.side ? ` · ${dish.side}` : ''}</div>
        <div className="flex flex-wrap gap-1.5 mt-3">
          {dish.tags.map((t) => <span key={t} className="text-xs px-3 py-1 rounded-full" style={{ background: C.mint, color: '#3e6b2f' }}>{t}</span>)}
        </div>

        <h3 className="mt-5 mb-2 text-sm font-semibold" style={{ color: C.ink }}>Included in</h3>
        <div className="flex flex-wrap gap-2">
          {plansForDish(dish).map((p) => (
            <button key={p.id} type="button" onClick={() => { onClose(); choosePlan(p); }}
              className="text-xs px-3.5 py-2 rounded-full font-medium"
              style={{ background: '#fff', border: `1px solid ${C.sage}`, color: '#3e6b2f' }}>
              {p.name} · {inr(p.perMeal)}/meal
            </button>
          ))}
        </div>

        <div className="rounded-2xl p-3.5 mt-4 text-xs leading-relaxed" style={{ background: C.grey, color: C.mute }}>
          Keto and dairy-free versions are available as customisations — ask us on WhatsApp when you subscribe.
        </div>

        <h3 className="mt-5 mb-2 text-sm font-semibold" style={{ color: C.ink }}>Reviews</h3>
        <div className="grid gap-2">
          {[['“Perfect portion after training days.”', 'Verified subscriber'], ['“Fresh, light, and actually flavourful.”', 'Verified subscriber']].map(([q, w]) => (
            <div key={q} className="rounded-2xl p-3.5 text-sm" style={{ ...cardStyle, color: '#565b54' }}>
              {q}<div className="text-xs mt-1" style={{ color: C.mute }}>{w}</div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <a href={waLink(`Hi Lean Kitchen! Quick question about ${dish.name}.`)} target="_blank" rel="noreferrer"
            className="text-center text-xs py-2 block" style={{ color: C.mute }}>
            Have a question? Chat with us
          </a>
        </div>
      </div>
    </Sheet>
  );
}
