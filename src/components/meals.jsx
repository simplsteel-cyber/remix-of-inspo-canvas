import React, { useState } from 'react';
import { C, serif, rating, reviews, macros, waLink, inr, DISHES, MENU_CHIPS, POPULAR_SEARCHES } from '../lib/core.js';
import { DietDot, Img, Btn, Stars, Sheet } from './ui.jsx';
import { Heart, X, Search } from 'lucide-react';

export function MealCard({ dish, onOpen, favs, setFavs }) {
  const fav = favs.has(dish.name);
  return (
    <div onClick={() => onOpen(dish)} className="rounded-3xl overflow-hidden cursor-pointer transition-transform hover:-translate-y-0.5"
      style={{ background: '#fff', border: `1px solid ${C.line}`, boxShadow: '0 4px 18px rgba(45,45,45,0.05)' }}>
      <div className="relative">
        <Img dish={dish} className="w-full" style={{ height: 168 }} />
        <button aria-label={fav ? 'Remove favourite' : 'Add favourite'}
          onClick={(e) => { e.stopPropagation(); setFavs((f) => { const n = new Set(f); fav ? n.delete(dish.name) : n.add(dish.name); return n; }); }}
          className="absolute top-3 right-3 rounded-full p-2" style={{ background: 'rgba(255,255,255,0.92)' }}>
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

export function MealDetail({ dish, onClose }) {
  if (!dish) return null;
  const m = macros(dish);
  return (
    <Sheet onClose={onClose} label={dish.name}>
      <div className="relative">
        <Img dish={dish} className="w-full" style={{ height: 224 }} />
        <button onClick={onClose} aria-label="Close" className="absolute top-4 right-4 rounded-full p-2" style={{ background: 'rgba(255,255,255,0.95)' }}>
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
        <div className="rounded-2xl p-3.5 mt-4 text-xs leading-relaxed" style={{ background: C.grey, color: C.mute }}>
          Keto and dairy-free versions are available as customisations — ask us on WhatsApp when you subscribe.
        </div>

        <h3 className="mt-5 mb-2 text-sm font-semibold" style={{ color: C.ink }}>Reviews</h3>
        <div className="grid gap-2">
          {[['“Perfect portion after training days.”', 'Verified subscriber'], ['“Fresh, light, and actually flavourful.”', 'Verified subscriber']].map(([q, w]) => (
            <div key={q} className="rounded-2xl p-3.5 text-sm" style={{ background: '#fff', border: `1px solid ${C.line}`, color: '#565b54' }}>
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

export function SearchOverlay({ onClose, onPick, recent }) {
  const [q, setQ] = useState('');
  const results = q ? DISHES.filter((d) => (d.name + ' ' + d.desc + ' ' + d.cuisine).toLowerCase().includes(q.toLowerCase())).slice(0, 12) : [];
  return (
    <div className="fixed inset-0 z-50 flex justify-center overflow-y-auto" role="dialog" aria-modal="true" aria-label="Search meals">
      <div className="w-full max-w-md min-h-full px-5 pt-6 pb-10" style={{ background: C.warm }}>
        <div className="flex items-center gap-2.5">
          <label className="flex items-center gap-2 rounded-full px-4 py-3 flex-1" style={{ background: '#fff', border: `1px solid ${C.line}` }}>
            <Search size={16} color={C.mute} strokeWidth={1.8} />
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search meals..." className="w-full text-sm bg-transparent focus:outline-none" style={{ color: C.ink }} />
          </label>
          <button onClick={onClose} className="text-sm font-medium" style={{ color: C.mute }}>Cancel</button>
        </div>
        {!q && (<>
          {recent.length > 0 && (<>
            <h3 className="text-xs font-semibold mt-6 mb-2" style={{ color: C.mute }}>RECENT</h3>
            <div className="flex flex-wrap gap-2">{recent.map((r) => <button key={r} onClick={() => setQ(r)} className="text-sm px-3.5 py-1.5 rounded-full" style={{ background: '#fff', border: `1px solid ${C.line}`, color: C.ink }}>{r}</button>)}</div>
          </>)}
          <h3 className="text-xs font-semibold mt-6 mb-2" style={{ color: C.mute }}>POPULAR</h3>
          <div className="flex flex-wrap gap-2">{POPULAR_SEARCHES.map((r) => <button key={r} onClick={() => setQ(r)} className="text-sm px-3.5 py-1.5 rounded-full" style={{ background: C.mint, color: '#3e6b2f' }}>{r}</button>)}</div>
          <h3 className="text-xs font-semibold mt-6 mb-2" style={{ color: C.mute }}>CATEGORIES</h3>
          <div className="flex flex-wrap gap-2">{MENU_CHIPS.map((r) => <button key={r} onClick={() => { onPick(null, r); }} className="text-sm px-3.5 py-1.5 rounded-full" style={{ background: '#fff', border: `1px solid ${C.line}`, color: C.ink }}>{r}</button>)}</div>
        </>)}
        <div className="grid gap-2 mt-5">
          {results.map((d) => (
            <button key={d.name} onClick={() => onPick(d)} className="flex items-center gap-3 rounded-2xl p-2.5 text-left" style={{ background: '#fff', border: `1px solid ${C.line}` }}>
              <Img dish={d} className="rounded-xl flex-none" style={{ width: 52, height: 52 }} />
              <div className="min-w-0">
                <div className="text-sm font-medium truncate" style={{ color: C.ink }}>{d.name}</div>
                <div className="text-xs" style={{ color: C.mute }}>{d.kcal} kcal · {inr(+d.price)}</div>
              </div>
            </button>
          ))}
          {q && results.length === 0 && <div className="text-sm text-center py-8" style={{ color: C.mute }}>No meals match “{q}”. Try a broader term.</div>}
        </div>
      </div>
    </div>
  );
}
