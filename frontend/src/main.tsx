import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from '@/app/App';
import '@/assets/index.css';

import { configureApiClient } from '@/utils/api';

// 🚀 Sett opp global API-klient — sørger for at Authorization-header ALLTID sendes
configureApiClient({
  getToken: () => localStorage.getItem('token'),
  onUnauthorized: () => {
    console.warn("User unauthorized – redirecting to login");
    localStorage.removeItem('token');
    window.location.href = '/login';
  },
});

// GitHub Pages krever HashRouter (ellers 404 ved refresh)
const isGithubPages = window.location.hostname.includes('github.io');
const Router = isGithubPages ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);

// 🔥 Disable service worker (caused 404 and caching issues)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((regs) => regs.forEach((reg) => reg.unregister()))
    .catch(() => {});
}
