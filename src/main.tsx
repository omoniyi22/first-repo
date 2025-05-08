
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { HelmetProvider } from 'react-helmet-async';
import Analytics from './components/layout/Analytics.tsx';

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Failed to find the root element');

createRoot(rootElement).render(
  <React.StrictMode>
    <HelmetProvider>
      <Analytics />
      <App />
    </HelmetProvider>
  </React.StrictMode>
);
