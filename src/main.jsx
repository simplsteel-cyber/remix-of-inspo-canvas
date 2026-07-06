import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { MenuProvider } from './context/MenuContext.jsx';
import { UserProvider } from './context/UserContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MenuProvider>
      <UserProvider>
        <App />
      </UserProvider>
    </MenuProvider>
  </React.StrictMode>
);

// PWA: register the service worker in production builds only.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch(() => { /* offline support is best-effort */ });
  });
}
