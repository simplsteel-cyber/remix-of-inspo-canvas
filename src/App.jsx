import React, { useState } from 'react';
import { C, sans } from './lib/core.js';
import { Welcome, Register, Onboarding } from './screens/Onboarding.jsx';
import { HomeScreen } from './screens/Home.jsx';
import { MealsScreen } from './screens/Meals.jsx';
import { OrdersScreen } from './screens/Orders.jsx';
import { NutritionScreen, AccountScreen } from './screens/Extras.jsx';
import { MealDetail, SearchOverlay } from './components/meals.jsx';
import { Home, UtensilsCrossed, ShoppingBag, HeartPulse, CircleUser } from 'lucide-react';

export default function App() {
  const [stage, setStage] = useState('welcome'); // welcome | register | onboard | app
  const [tab, setTab] = useState('home');
  const [cat, setCat] = useState(null);
  const [profile, setProfile] = useState({ name: '', age: '', gender: '', height: '', weight: '', goal: '', dietPref: 'No preference', allergies: '', mealsPerWeek: 12 });
  const [cart, setCart] = useState({});
  const [favs, setFavs] = useState(new Set());
  const [plan, setPlan] = useState(null);
  const [promo, setPromo] = useState(false);
  const [orders, setOrders] = useState([]);
  const [detail, setDetail] = useState(null);
  const [searching, setSearching] = useState(false);
  const [recent, setRecent] = useState([]);

  const go = (t, c) => {
    if (t === 'plans') { setTab('home'); return; }
    setTab(t); if (c !== undefined) setCat(c);
  };
  const choosePlan = (p) => { setPlan(p); setStage('app'); setTab('meals'); setCat(null); };
  const cartCount = Object.values(cart).reduce((s, n) => s + n, 0);

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'meals', label: 'Meals', icon: UtensilsCrossed },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'nutrition', label: 'Nutrition', icon: HeartPulse },
    { id: 'account', label: 'Account', icon: CircleUser },
  ];

  return (
    <div className="min-h-screen flex justify-center" style={{ background: '#EFEFEC', ...sans }}>
      <div className="w-full max-w-md min-h-screen relative" style={{ background: C.warm }}>
        {stage === 'welcome' && <Welcome onNext={() => setStage('register')} />}
        {stage === 'register' && <Register profile={profile} setProfile={setProfile} onNext={() => setStage('onboard')} />}
        {stage === 'onboard' && <Onboarding profile={profile} setProfile={setProfile} onDone={() => setStage('app')} choosePlan={choosePlan} />}
        {stage === 'app' && (<>
          <main className="pb-24">
            {tab === 'home' && <HomeScreen go={go} openDish={setDetail} choosePlan={(p) => { setPlan(p); setTab('meals'); }} plan={plan} applyPromo={() => setPromo(true)} />}
            {tab === 'meals' && <MealsScreen cat={cat} setCat={setCat} openDish={setDetail} cart={cart} setCart={setCart} favs={favs} setFavs={setFavs} openSearch={() => setSearching(true)} promo={promo} />}
            {tab === 'orders' && <OrdersScreen cart={cart} setCart={setCart} plan={plan} promo={promo} setPromo={setPromo} orders={orders} placeOrder={(o) => { setOrders([...orders, o]); setCart({}); }} go={go} />}
            {tab === 'nutrition' && <NutritionScreen profile={profile} />}
            {tab === 'account' && <AccountScreen profile={profile} setProfile={setProfile} signOut={() => { setStage('welcome'); setTab('home'); }} />}
          </main>

          {cartCount > 0 && tab !== 'orders' && (
            <button onClick={() => setTab('orders')} className="fixed bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold shadow-lg"
              style={{ background: C.cta, color: '#fff' }}>
              <ShoppingBag size={16} /> {cartCount} meal{cartCount > 1 ? 's' : ''} · View order
            </button>
          )}

          <nav className="fixed bottom-0 w-full max-w-md grid grid-cols-5" aria-label="Main" style={{ background: 'rgba(255,255,255,0.96)', borderTop: `1px solid ${C.line}`, backdropFilter: 'blur(8px)' }}>
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)} aria-current={tab === id ? 'page' : undefined}
                className="relative flex flex-col items-center gap-1 py-2.5 text-xs font-medium" style={{ color: tab === id ? '#3e6b2f' : C.mute }}>
                <Icon size={20} strokeWidth={1.8} />
                {label}
                {id === 'orders' && cartCount > 0 && <span className="absolute top-1.5 right-1/2 translate-x-4 text-xs rounded-full px-1.5" style={{ background: C.orange, color: '#fff', fontSize: 10 }}>{cartCount}</span>}
              </button>
            ))}
          </nav>

          {detail && <MealDetail dish={detail} onClose={() => setDetail(null)} cart={cart} setCart={setCart} />}
          {searching && <SearchOverlay recent={recent} onClose={() => setSearching(false)}
            onPick={(d, c) => { setSearching(false); if (d) { setDetail(d); setRecent((r) => [d.name, ...r.filter((x) => x !== d.name)].slice(0, 5)); } if (c) { setTab('meals'); setCat(c); } }} />}
        </>)}
      </div>
    </div>
  );
}
