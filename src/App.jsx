import React, { Suspense, lazy, useState } from 'react';
import { C, sans, waLink } from './lib/core.js';
import { useUser } from './context/UserContext.jsx';
import { useCart, cartCount } from './stores/cart.js';
import { Welcome, Register, RegisterSuccess, Onboarding } from './screens/Onboarding.jsx';
import { HomeScreen } from './screens/Home.jsx';
import { MealsScreen } from './screens/Meals.jsx';
import { SubscriptionScreen } from './screens/Subscription.jsx';
import { NutritionScreen, AccountScreen } from './screens/Extras.jsx';
import { MealDetail } from './components/meals.jsx';
import { Skeleton } from './components/ui.jsx';
import { Home, UtensilsCrossed, ShoppingBag, HeartPulse, CircleUser, MessageCircle } from 'lucide-react';

// The admin surface (and its Excel parser) loads only when visited.
const AdminScreen = lazy(() => import('./screens/Admin.jsx').then((m) => ({ default: m.AdminScreen })));

const TABS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'meals', label: 'Meals', icon: UtensilsCrossed },
  { id: 'orders', label: 'Order', icon: ShoppingBag },
  { id: 'nutrition', label: 'Nutrition', icon: HeartPulse },
  { id: 'account', label: 'Account', icon: CircleUser },
];

function BootScreen() {
  return (
    <div className="px-6 pt-16 grid gap-4" aria-busy="true" aria-label="Loading Lean Kitchen">
      <Skeleton style={{ height: 200, borderRadius: 24 }} />
      <Skeleton style={{ height: 28, width: '60%' }} />
      <Skeleton style={{ height: 16, width: '80%' }} />
      <Skeleton style={{ height: 48, borderRadius: 999 }} />
    </div>
  );
}

export default function App() {
  const { booting, route, go, trackViewed } = useUser();
  const items = useCart((s) => s.items);
  const { stage, tab } = route;

  // Transient UI state — deliberately not persisted.
  const [detail, setDetail] = useState(null);
  const openDish = (dish) => { trackViewed(dish.name); setDetail(dish); };

  // /admin is its own surface, outside the customer shell.
  if (window.location.pathname.replace(/\/+$/, '') === '/admin') {
    return <Suspense fallback={<BootScreen />}><AdminScreen /></Suspense>;
  }

  const badge = cartCount(items);

  return (
    <div className="min-h-screen flex justify-center" style={{ background: '#EFEFEC', ...sans }}>
      <div className="w-full max-w-md min-h-screen relative" style={{ background: C.warm }}>
        {booting ? <BootScreen /> : (<>
          {stage === 'welcome' && <Welcome />}
          {stage === 'register' && <Register />}
          {stage === 'registered' && <RegisterSuccess />}
          {stage === 'onboard' && <Onboarding />}
          {stage === 'app' && (<>
            <main className="pb-28">
              {tab === 'home' && <HomeScreen openDish={openDish} />}
              {tab === 'meals' && <MealsScreen openDish={openDish} />}
              {tab === 'orders' && <SubscriptionScreen />}
              {tab === 'nutrition' && <NutritionScreen />}
              {tab === 'account' && <AccountScreen />}
            </main>

            {/* Persistent WhatsApp support — the CTA follows the user everywhere. */}
            <a href={waLink('Hi Lean Kitchen! I have a question about your meal plans.')} target="_blank" rel="noreferrer"
              aria-label="Chat with us on WhatsApp"
              className="fixed z-40 rounded-full p-3.5 shadow-lg"
              style={{ background: C.wa, color: '#fff', bottom: '5.5rem', right: 'max(1rem, calc(50vw - 208px))' }}>
              <MessageCircle size={22} strokeWidth={2} />
            </a>

            <nav className="fixed bottom-0 w-full max-w-md grid grid-cols-5 z-30" aria-label="Main" style={{ background: 'rgba(255,255,255,0.96)', borderTop: `1px solid ${C.line}`, backdropFilter: 'blur(8px)' }}>
              {TABS.map(({ id, label, icon: Icon }) => (
                <button key={id} type="button" onClick={() => go(id, null)} aria-current={tab === id ? 'page' : undefined}
                  className="relative flex flex-col items-center gap-1 py-3 text-xs font-medium" style={{ color: tab === id ? '#3e6b2f' : C.mute }}>
                  <Icon size={20} strokeWidth={1.8} />
                  {label}
                  {id === 'orders' && badge > 0 && (
                    <span aria-label={`${badge} items in order`} className="absolute top-1.5 right-1/2 translate-x-4 rounded-full px-1.5 font-semibold"
                      style={{ background: C.orange, color: '#fff', fontSize: 10 }}>{badge}</span>
                  )}
                </button>
              ))}
            </nav>

            {detail && <MealDetail dish={detail} onClose={() => setDetail(null)} />}
          </>)}
        </>)}
      </div>
    </div>
  );
}
