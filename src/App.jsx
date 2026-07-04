import React, { useState } from 'react';
import { C, sans } from './lib/core.js';
import { Welcome, Register, Onboarding } from './screens/Onboarding.jsx';
import { HomeScreen } from './screens/Home.jsx';
import { MealsScreen } from './screens/Meals.jsx';
import { SubscriptionScreen } from './screens/Orders.jsx';
import { NutritionScreen, AccountScreen } from './screens/Extras.jsx';
import { MealDetail, SearchOverlay } from './components/meals.jsx';
import { Home, UtensilsCrossed, CreditCard, HeartPulse, CircleUser } from 'lucide-react';

export default function App() {
  const [stage, setStage] = useState('welcome'); // welcome | register | onboard | app
  const [tab, setTab] = useState('home');
  const [cat, setCat] = useState(null);
  const [profile, setProfile] = useState({ name: '', age: '', gender: '', height: '', weight: '', goal: '', dietPref: 'No preference', allergies: '', mealsPerWeek: 12, nutritionistRef: '', deliveryAddress: '' });
  const [favs, setFavs] = useState(new Set());
  const [plan, setPlan] = useState(null);
  const [promo, setPromo] = useState(false);
  const [detail, setDetail] = useState(null);
  const [searching, setSearching] = useState(false);
  const [recent, setRecent] = useState([]);

  const go = (t, c) => {
    if (t === 'plans') { setTab('home'); return; }
    setTab(t); if (c !== undefined) setCat(c);
  };
  const choosePlan = (p) => { setPlan(p); setStage('app'); setTab('orders'); setCat(null); };

  const tabs = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'meals', label: 'Meals', icon: UtensilsCrossed },
    { id: 'orders', label: 'Subscription', icon: CreditCard },
    { id: 'nutrition', label: 'Nutrition', icon: HeartPulse },
    { id: 'account', label: 'Account', icon: CircleUser },
  ];

  return (
    <div className="min-h-screen flex justify-center" style={{ background: '#EFEFEC', ...sans }}>
      <div className="w-full max-w-md min-h-screen relative" style={{ background: C.warm }}>
        {stage === 'welcome' && <Welcome onNext={() => setStage('register')} />}
        {stage === 'register' && <Register profile={profile} setProfile={setProfile} onNext={() => setStage('onboard')} onBack={() => setStage('welcome')} />}
        {stage === 'onboard' && <Onboarding profile={profile} setProfile={setProfile} onDone={() => setStage('app')} choosePlan={choosePlan} onBack={() => setStage('register')} />}
        {stage === 'app' && (<>
          <main className="pb-24">
            {tab === 'home' && <HomeScreen go={go} openDish={setDetail} choosePlan={(p) => { setPlan(p); setTab('orders'); }} plan={plan} applyPromo={() => setPromo(true)} profile={profile} />}
            {tab === 'meals' && <MealsScreen cat={cat} setCat={setCat} openDish={setDetail} favs={favs} setFavs={setFavs} openSearch={() => setSearching(true)} promo={promo} />}
            {tab === 'orders' && <SubscriptionScreen plan={plan} go={go} />}
            {tab === 'nutrition' && <NutritionScreen profile={profile} />}
            {tab === 'account' && <AccountScreen profile={profile} setProfile={setProfile} signOut={() => { setStage('welcome'); setTab('home'); }} />}
          </main>

          <nav className="fixed bottom-0 w-full max-w-md grid grid-cols-5" aria-label="Main" style={{ background: 'rgba(255,255,255,0.96)', borderTop: `1px solid ${C.line}`, backdropFilter: 'blur(8px)' }}>
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setTab(id)} aria-current={tab === id ? 'page' : undefined}
                className="relative flex flex-col items-center gap-1 py-2.5 text-xs font-medium" style={{ color: tab === id ? '#3e6b2f' : C.mute }}>
                <Icon size={20} strokeWidth={1.8} />
                {label}
              </button>
            ))}
          </nav>

          {detail && <MealDetail dish={detail} onClose={() => setDetail(null)} />}
          {searching && <SearchOverlay recent={recent} onClose={() => setSearching(false)}
            onPick={(d, c) => { setSearching(false); if (d) { setDetail(d); setRecent((r) => [d.name, ...r.filter((x) => x !== d.name)].slice(0, 5)); } if (c) { setTab('meals'); setCat(c); } }} />}
        </>)}
      </div>
    </div>
  );
}
