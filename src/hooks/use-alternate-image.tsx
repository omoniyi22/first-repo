
import { useState, useEffect } from 'react';

/**
 * Hook to alternate between two images based on a specified interval
 * @param firstImageSrc First image source URL
 * @param secondImageSrc Second image source URL
 * @param intervalMs Interval in milliseconds for switching images (default: 5000ms)
 * @returns The current image source URL
 */
export function useAlternateImage(
  firstImageSrc: string,
  secondImageSrc: string,
  intervalMs = 5000
) {
  const [currentImageSrc, setCurrentImageSrc] = useState(firstImageSrc);
  
  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentImageSrc(current => 
        current === firstImageSrc ? secondImageSrc : firstImageSrc
      );
    }, intervalMs);
    
    return () => clearInterval(intervalId);
  }, [firstImageSrc, secondImageSrc, intervalMs]);
  
  return currentImageSrc;
}
