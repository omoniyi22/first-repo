
import { useState, useEffect } from 'react';

/**
 * A custom hook that tracks whether the user has scrolled past a certain threshold
 * @param threshold The scroll threshold in pixels
 * @returns boolean indicating if user has scrolled past the threshold
 */
export function useScroll(threshold: number = 10): boolean {
  const [isAtTop, setIsAtTop] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      setIsAtTop(window.scrollY <= threshold);
    };

    // Set initial value
    handleScroll();
    
    // Add event listener
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Clean up
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [threshold]);

  return isAtTop;
}
