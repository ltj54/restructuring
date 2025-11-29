import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, HashRouter } from 'react-router-dom';
import App from './App';
import '../assets/index.css';

// GitHub Pages trenger HashRouter (unngår 404 ved refresh).
// Ellers bruker vi BrowserRouter (lokalt, Render, prod).
const isGithubPages = window.location.hostname.includes('github.io');
const Router = isGithubPages ? HashRouter : BrowserRouter;

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.error('Service worker registration failed', err);
    });
  });
}
