
import React, { useEffect } from 'react';

const Analytics = () => {
  useEffect(() => {
    // This creates the script element and adds it to the document
    const script = document.createElement('script');
    script.src = "https://analytics.appetitecreative.com/js/script.js";
    script.defer = true;
    script.setAttribute('data-domain', 'aiequestrian.com'); // Fixed domain name
    document.head.appendChild(script);

    // Clean up
    return () => {
      const existingScript = document.querySelector('script[data-domain="aiequestrian.com"]');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, []);

  return null; // This component doesn't render anything
};

export default Analytics;
