
import { useEffect } from 'react';

const Analytics = () => {
  useEffect(() => {
    // Create and append analytics script
    const script = document.createElement('script');
    script.src = 'https://analytics.appetitecreative.com/js/script.js';
    script.defer = true;
    script.setAttribute('data-domain', 'equestrianaintelligence.com');
    
    // Add script to head
    document.head.appendChild(script);
    
    // Cleanup on unmount
    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);
  
  return null; // This component doesn't render anything visible
};

export default Analytics;
