import React, { useEffect, useMemo, useState } from 'react';
import { C, serif, CATS, MENU_CHIPS, FILTER_GROUPS, SORTS } from '../lib/core.js';
import { KITCHEN } from '../lib/delivery.js';
import { MealCard, MiniMealCard } from '../components/meals.jsx';
import { DeliveryForm, DeliveryStatus } from '../components/delivery.jsx';
import { BackBtn, Btn, SearchInput, SectionTitle, Sheet, Skeleton, cardStyle } from '../components/ui.jsx';
import { useUser } from '../context/UserContext.jsx';
import { useMenu } from '../context/MenuContext.jsx';
import { ChevronRight, SlidersHorizontal, Heart, History } from 'lucide-react';

const matchesQuery = (d, q) => (d.name + ' ' + d.desc + ' ' + d.cuisine).toLowerCase().includes(q.toLowerCase());

function ListSkeleton() {
  return (
    <div className="grid gap-4 mt-4">
      {[0, 1, 2].map((i) => <Skeleton key={i} className="rounded-3xl" style={{ height: 264 }} />)}
    </div>
  );
}

export function MealsScreen({ openDish }) {
  const { route } = useUser();
  // key resets the category page's local filters when switching categories
  return route.cat ? <CategoryScreen key={route.cat} openDish={openDish} /> : <MealsHub openDish={openDish} />;
}

// ── Meals hub — delivery first, then search, shortcuts, categories ──
function MealsHub({ openDish }) {
  const { go, goBack, delivery, deliverySkipped, skipDeliveryGate, favs, recent } = useUser();
  const { dishes, menuLoading } = useMenu();
  const [editingDelivery, setEditingDelivery] = useState(false);
  const [q, setQ] = useState('');

  const deliveryKnown = delivery && delivery.status !== 'unknown';
  const gated = (!deliveryKnown && !deliverySkipped) || editingDelivery;

  const results = useMemo(
    () => (q.trim() ? dishes.filter((d) => matchesQuery(d, q.trim())) : []),
    [q, dishes]
  );
  const dishByName = (name) => dishes.find((d) => d.name === name);
  const favDishes = useMemo(() => favs.map(dishByName).filter(Boolean), [favs, dishes]); // eslint-disable-line react-hooks/exhaustive-deps
  const recentDishes = useMemo(() => recent.map(dishByName).filter(Boolean), [recent, dishes]); // eslint-disable-line react-hooks/exhaustive-deps
  const tiles = useMemo(() => [
    ['All', dishes.length],
    ...MENU_CHIPS.map((c) => [c, dishes.filter(CATS[c]).length]),
  ], [dishes]);

  // Delivery gate: the first step before browsing meals.
  if (gated) {
    return (
      <div className="px-5 pt-6 pb-6">
        <BackBtn onClick={() => (editingDelivery ? setEditingDelivery(false) : goBack())} />
        <h1 className="mt-6" style={{ ...serif, fontSize: 30, fontWeight: 700, color: C.ink }}>First — do we deliver to you?</h1>
        <p className="text-sm mt-1 mb-6" style={{ color: C.mute }}>We cook fresh in {KITCHEN.area} ({KITCHEN.pincode}) and deliver nearby.</p>
        <DeliveryForm onDone={() => setEditingDelivery(false)} />
        {!deliveryKnown && (
          <div className="mt-6 text-center">
            <button type="button" onClick={skipDeliveryGate} className="text-sm font-medium px-4 py-2.5" style={{ color: C.mute }}>
              Skip for now — browse the menu
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-4">
      <div className="flex items-center justify-between gap-3">
        <BackBtn onClick={goBack} />
        <SectionTitle>Meals</SectionTitle>
      </div>

      <div className="mt-4">
        <DeliveryStatus delivery={delivery} onEdit={() => setEditingDelivery(true)} />
      </div>

      <div className="mt-4">
        <SearchInput value={q} onChange={setQ} />
      </div>

      {menuLoading ? <ListSkeleton /> : q.trim() ? (
        <div className="grid gap-4 mt-4">
          <div className="text-xs" role="status" style={{ color: C.mute }}>{results.length} meals for “{q.trim()}”</div>
          {results.map((d) => <MealCard key={d.name + d.diet} dish={d} onOpen={openDish} />)}
          {results.length === 0 && (
            <div className="rounded-3xl p-8 text-center text-sm" style={{ ...cardStyle, borderStyle: 'dashed', color: C.mute }}>
              No meals match “{q.trim()}”.
              <div className="mt-3"><Btn small kind="ghost" onClick={() => setQ('')}>Clear search</Btn></div>
            </div>
          )}
        </div>
      ) : (<>
        {favDishes.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: C.ink }}>
              <Heart size={15} color={C.orange} fill={C.orange} /> Favourites
            </div>
            <div className="flex gap-3 overflow-x-auto mt-3 pb-2 no-scrollbar">
              {favDishes.map((d) => <MiniMealCard key={d.name} dish={d} onOpen={openDish} />)}
            </div>
          </div>
        )}

        {recentDishes.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 text-sm font-semibold" style={{ color: C.ink }}>
              <History size={15} color={C.sage} /> Recently viewed
            </div>
            <div className="flex gap-3 overflow-x-auto mt-3 pb-2 no-scrollbar">
              {recentDishes.map((d) => <MiniMealCard key={d.name} dish={d} onOpen={openDish} />)}
            </div>
          </div>
        )}

        <div className="mt-6">
          <div className="text-sm font-semibold" style={{ color: C.ink }}>Browse by category</div>
          <div className="grid grid-cols-2 gap-2.5 mt-3">
            {tiles.map(([c, count]) => (
              <button key={c} type="button" onClick={() => go('meals', c)}
                className="flex items-center justify-between rounded-2xl px-4 py-4 text-sm font-medium text-left"
                style={{ ...cardStyle, color: C.ink }}>
                <span>{c === 'All' ? 'All meals' : c}<span className="block text-xs font-normal mt-0.5" style={{ color: C.mute }}>{count} dishes</span></span>
                <ChevronRight size={15} color={C.sage} />
              </button>
            ))}
          </div>
        </div>
      </>)}
    </div>
  );
}

// ── Dedicated category page — Swiggy/Zomato style ────────────
const EMPTY_FILTERS = { diet: 'All', cuisine: null, type: null, kcal: null, protein: null, price: null, sort: 'Menu order' };

function CategoryScreen({ openDish }) {
  const { route, goBack } = useUser();
  const { dishes, menuLoading } = useMenu();
  const cat = route.cat;
  const [q, setQ] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  // Collapse the filter rows while scrolling down; reveal on scroll up.
  // Small hysteresis so momentum-scroll jitter doesn't flap the bar.
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      if (y <= 140) setCollapsed(false);
      else if (y > lastY + 2) setCollapsed(true);
      else if (y < lastY - 2) setCollapsed(false);
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim();
    const list = dishes.filter((d) => {
      if (cat !== 'All' && CATS[cat] && !CATS[cat](d)) return false;
      if (filters.diet === 'Veg' && d.diet !== 'Veg') return false;
      if (filters.diet === 'Non-Veg' && d.diet !== 'Non-Veg') return false;
      if (filters.diet === 'Vegan' && !d.vegan) return false;
      for (const g of ['cuisine', 'type', 'kcal', 'protein', 'price']) {
        if (filters[g] && !FILTER_GROUPS[g].options[filters[g]](d)) return false;
      }
      if (query && !matchesQuery(d, query)) return false;
      return true;
    });
    return [...list].sort(SORTS[filters.sort]);
  }, [cat, filters, q, dishes]);

  const activeCount = ['cuisine', 'type', 'kcal', 'protein', 'price'].filter((g) => filters[g]).length
    + (filters.diet !== 'All' ? 1 : 0) + (filters.sort !== 'Menu order' ? 1 : 0);
  const clearAll = () => { setFilters(EMPTY_FILTERS); setQ(''); };

  return (
    <div className="pb-4">
      <div className="sticky top-0 z-10 px-5 pt-4 pb-3" style={{ background: C.warm }}>
        <div className="flex items-center justify-between gap-3">
          <BackBtn onClick={goBack} />
          <div className="text-right">
            <div className="text-sm font-semibold" style={{ color: C.ink }}>{cat === 'All' ? 'All meals' : cat}</div>
            <div className="text-xs" role="status" style={{ color: C.mute }}>{filtered.length} meals</div>
          </div>
        </div>

        <div className="overflow-hidden" style={{ maxHeight: collapsed ? 0 : 200, transition: 'max-height 0.25s ease' }}>
          <div className="flex gap-2 mt-3">
            <div className="flex-1"><SearchInput value={q} onChange={setQ} /></div>
            <button type="button" onClick={() => setSheetOpen(true)} aria-expanded={sheetOpen} aria-label="Open filters"
              className="relative flex-none flex items-center justify-center rounded-full px-4" style={cardStyle}>
              <SlidersHorizontal size={16} color={C.ink} strokeWidth={1.8} />
              {activeCount > 0 && (
                <span className="absolute -top-1 -right-1 rounded-full px-1.5 text-xs font-semibold" style={{ background: C.cta, color: '#fff', fontSize: 10 }}>{activeCount}</span>
              )}
            </button>
          </div>
          <div className="flex gap-1.5 mt-2.5" role="group" aria-label="Diet filter">
            {['All', 'Veg', 'Non-Veg', 'Vegan'].map((d) => (
              <button key={d} type="button" aria-pressed={filters.diet === d} onClick={() => setFilters((f) => ({ ...f, diet: d }))}
                className="flex-1 inline-flex items-center justify-center gap-1.5 text-xs font-medium py-2 rounded-full"
                style={filters.diet === d ? { background: C.mint, color: '#3e6b2f', border: `1px solid ${C.sage}` } : { ...cardStyle, color: C.mute }}>
                {d !== 'All' && <span className="rounded-full flex-none" style={{ width: 7, height: 7, background: d === 'Non-Veg' ? C.nonveg : C.veg }} />}
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="px-5">
        {menuLoading ? <ListSkeleton /> : (
          <div className="grid gap-4 mt-2">
            {filtered.map((d) => <MealCard key={d.name + d.diet} dish={d} onOpen={openDish} />)}
            {filtered.length === 0 && (
              <div className="rounded-3xl p-8 text-center text-sm" style={{ ...cardStyle, borderStyle: 'dashed', color: C.mute }}>
                No meals match this combination.
                <div className="mt-3"><Btn small kind="ghost" onClick={clearAll}>Clear filters</Btn></div>
              </div>
            )}
          </div>
        )}
      </div>

      {sheetOpen && (
        <FilterSheet filters={filters} setFilters={setFilters} onClose={() => setSheetOpen(false)} onClear={() => setFilters(EMPTY_FILTERS)} />
      )}
    </div>
  );
}

function FilterSheet({ filters, setFilters, onClose, onClear }) {
  const toggle = (group, option) => setFilters((f) => ({ ...f, [group]: f[group] === option ? null : option }));
  const Chip = ({ active, onClick, children }) => (
    <button type="button" aria-pressed={active} onClick={onClick} className="text-xs font-medium px-3.5 py-2 rounded-full"
      style={active ? { background: C.mint, color: '#3e6b2f', border: `1px solid ${C.sage}` } : { ...cardStyle, color: C.ink }}>
      {children}
    </button>
  );
  return (
    <Sheet onClose={onClose} label="Filters">
      <div className="p-5 pb-8">
        <div className="flex items-center justify-between">
          <h2 style={{ ...serif, fontSize: 24, fontWeight: 700, color: C.ink }}>Filters</h2>
          <button type="button" onClick={onClear} className="text-sm font-medium" style={{ color: C.mute }}>Clear all</button>
        </div>
        {Object.entries(FILTER_GROUPS).map(([group, def]) => (
          <div key={group} className="mt-5">
            <div className="text-xs font-semibold mb-2" style={{ color: C.mute }}>{def.label.toUpperCase()}</div>
            <div className="flex flex-wrap gap-2">
              {Object.keys(def.options).map((opt) => (
                <Chip key={opt} active={filters[group] === opt} onClick={() => toggle(group, opt)}>{opt}</Chip>
              ))}
            </div>
          </div>
        ))}
        <div className="mt-5">
          <div className="text-xs font-semibold mb-2" style={{ color: C.mute }}>SORT BY</div>
          <div className="flex flex-wrap gap-2">
            {Object.keys(SORTS).map((s) => (
              <Chip key={s} active={filters.sort === s} onClick={() => setFilters((f) => ({ ...f, sort: s }))}>{s}</Chip>
            ))}
          </div>
        </div>
        <div className="mt-6"><Btn className="w-full" onClick={onClose}>Show meals</Btn></div>
      </div>
    </Sheet>
  );
}
