
import { useEffect, useRef, ReactNode } from 'react';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  animation?: 'fade-in' | 'fade-in-right' | 'fade-in-left' | 'slide-in-bottom' | 'scale-in';
  delay?: 'delay-100' | 'delay-200' | 'delay-300' | 'delay-400' | 'delay-500' | 'delay-600' | 'delay-700' | 'delay-800';
  threshold?: number;
  once?: boolean;
}

const AnimatedSection = ({
  children,
  className = '',
  animation = 'fade-in',
  delay,
  threshold = 0.1,
  once = true,
}: AnimatedSectionProps) => {
  const ref = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: threshold,
    };
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add(`animate-${animation}`);
          if (delay) {
            entry.target.classList.add(delay);
          }
          if (once) {
            observer.unobserve(entry.target);
          }
        } else if (!once) {
          entry.target.classList.remove(`animate-${animation}`);
          if (delay) {
            entry.target.classList.remove(delay);
          }
        }
      });
    }, observerOptions);
    
    if (ref.current) {
      observer.observe(ref.current);
    }
    
    return () => {
      if (ref.current) {
        observer.unobserve(ref.current);
      }
    };
  }, [animation, delay, threshold, once]);
  
  return (
    <div ref={ref} className={`opacity-0 ${className}`}>
      {children}
    </div>
  );
};

export default AnimatedSection;
