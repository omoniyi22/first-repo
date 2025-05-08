
import { useEffect } from 'react';

/**
 * Analytics component to add tracking scripts
 */
export const Analytics = () => {
  useEffect(() => {
    // Add analytics script to head
    const script = document.createElement('script');
    script.defer = true;
    script.setAttribute('data-domain', 'equestrianaintelligence.com');
    script.src = 'https://analytics.appetitecreative.com/js/script.js';
    document.head.appendChild(script);
    
    return () => {
      // Clean up on unmount
      const existingScript = document.querySelector('script[data-domain="equestrianaintelligence.com"]');
      if (existingScript && existingScript.parentNode) {
        existingScript.parentNode.removeChild(existingScript);
      }
    };
  }, []);
  
  return null; // Renders nothing
};

export default Analytics;
