
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import './styles/content.css';
import './styles/global.css'; // Add our new global styles

// Import font CSS
const playfairLink = document.createElement('link');
playfairLink.href = 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap';
playfairLink.rel = 'stylesheet';
document.head.appendChild(playfairLink);

const varelaLink = document.createElement('link');
varelaLink.href = 'https://fonts.googleapis.com/css2?family=Varela+Round&display=swap';
varelaLink.rel = 'stylesheet';
document.head.appendChild(varelaLink);

// Add analytics tracking script
const analyticsScript = document.createElement('script');
analyticsScript.defer = true;
analyticsScript.dataset.domain = "equestrianaintelligence.com";
analyticsScript.src = "https://analytics.appetitecreative.com/js/script.js";
document.head.appendChild(analyticsScript);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
