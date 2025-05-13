
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const Analytics = () => {
  const location = useLocation();

  useEffect(() => {
    // This adds the tracking script to the header
    const script = document.createElement('script');
    script.defer = true;
    script.setAttribute('data-domain', 'equestrianaintelligence.com');
    script.src = 'https://analytics.appetitecreative.com/js/script.js';
    document.head.appendChild(script);
    
    return () => {
      // Clean up
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  useEffect(() => {
    // Track page views
    if (window.location.pathname) {
      console.log(`Page view: ${location.pathname}`);
      // Here you would normally call your analytics tracking function
    }
  }, [location]);

  return null;
};

export default Analytics;
