import React, { useMemo, useState } from 'react';
import { C, DISHES, CATS, MENU_CHIPS } from '../lib/core.js';
import { MealCard } from '../components/meals.jsx';
import { MapPin, Search } from 'lucide-react';

export function MealsScreen({ cat, setCat, openDish, favs, setFavs, openSearch, promo }) {
  const [diet, setDiet] = useState('All');
  const filtered = useMemo(() => DISHES.filter((d) => {
    if (diet === 'Veg' && d.diet !== 'Veg') return false;
    if (diet === 'Non-Veg' && d.diet !== 'Non-Veg') return false;
    if (diet === 'Vegan' && !d.vegan) return false;
    if (cat && CATS[cat] && !CATS[cat](d)) return false;
    return true;
  }), [diet, cat]);

  return (
    <div className="pb-4">
      <div className="sticky top-0 z-10 px-5 pt-4 pb-3" style={{ background: C.warm }}>
        <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: C.mute }}>
          <MapPin size={13} color={C.sage} strokeWidth={1.8} /> Delivering from Lower Oshiwara · 5 km radius
        </div>
        <button onClick={openSearch} className="flex items-center gap-2 rounded-full px-4 py-3 w-full mt-3 text-left" style={{ background: '#fff', border: `1px solid ${C.line}` }}>
          <Search size={16} color={C.mute} strokeWidth={1.8} /><span className="text-sm" style={{ color: C.mute }}>Search meals...</span>
        </button>
        {!promo && (
          <div className="rounded-2xl px-4 py-2.5 mt-3 text-xs font-medium" style={{ background: '#FDF3E7', color: '#b06c22', border: '1px solid #F8DCB8' }}>
            20% off your first week with code NOURISH20
          </div>
        )}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 no-scrollbar">
          {MENU_CHIPS.map((c) => (
            <button key={c} onClick={() => setCat(cat === c ? null : c)} className="flex-none text-xs font-medium px-3.5 py-2 rounded-full transition-all"
              style={cat === c ? { background: C.sage, color: '#fff' } : { background: '#fff', color: C.ink, border: `1px solid ${C.line}` }}>
              {c}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 mt-2.5" role="tablist" aria-label="Diet filter">
          {['All', 'Veg', 'Non-Veg', 'Vegan'].map((d) => (
            <button key={d} onClick={() => setDiet(d)} className="flex-1 text-xs font-medium py-2 rounded-full"
              style={diet === d ? { background: C.mint, color: '#3e6b2f', border: `1px solid ${C.sage}` } : { background: '#fff', color: C.mute, border: `1px solid ${C.line}` }}>
              {d}
            </button>
          ))}
        </div>
      </div>
      <div className="px-5 grid gap-4 mt-2">
        <div className="text-xs" style={{ color: C.mute }}>{filtered.length} meals{cat ? ` · ${cat}` : ''}</div>
        {filtered.map((d) => <MealCard key={d.name + d.diet} dish={d} onOpen={openDish} favs={favs} setFavs={setFavs} />)}
        {filtered.length === 0 && <div className="rounded-3xl p-8 text-center text-sm" style={{ background: '#fff', border: `1px dashed ${C.line}`, color: C.mute }}>No meals in this combination yet. Clear a filter to see more.</div>}
      </div>
    </div>
  );
}
