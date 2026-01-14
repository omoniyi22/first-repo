
import React, { useEffect } from 'react';

const Analytics: React.FC = () => {
  useEffect(() => {
    // This is a client-side only effect, so it won't run during SSR
    const script = document.createElement('script');
    script.defer = true;
    script.setAttribute('data-domain', 'equestrianaintelligence.com');
    script.src = 'https://analytics.appetitecreative.com/js/script.js';
    
    document.head.appendChild(script);
    
    return () => {
      // Clean up the script when the component unmounts
      document.head.removeChild(script);
    };
  }, []);

  return null; // This component doesn't render anything
};

export default Analytics;
