
import { useEffect, useState, useRef } from "react";

interface StatisticItemProps {
  value: number;
  label: string;
  suffix?: string;
}

const StatisticItem = ({ value, label, suffix = "" }: StatisticItemProps) => {
  const [count, setCount] = useState(0);
  const countRef = useRef(null);
  const duration = 2000; // ms
  const frameRate = 60;
  const totalFrames = Math.round(duration / (1000 / frameRate));
  
  useEffect(() => {
    let isMounted = true;
    let observer;
    
    if (countRef.current) {
      observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && isMounted) {
          let frame = 0;
          const increment = value / totalFrames;
          const timer = setInterval(() => {
            frame++;
            const newCount = Math.round(Math.min(frame * increment, value));
            setCount(newCount);
            
            if (frame === totalFrames) {
              clearInterval(timer);
            }
          }, 1000 / frameRate);
          
          return () => clearInterval(timer);
        }
      }, { threshold: 0.5 });
      
      observer.observe(countRef.current);
    }
    
    return () => {
      isMounted = false;
      if (observer && countRef.current) {
        observer.unobserve(countRef.current);
      }
    };
  }, [value]);
  
  return (
    <div ref={countRef} className="flex flex-col items-center p-6">
      <div className="text-5xl md:text-6xl font-bold text-purple-800 mb-2 font-serif">
        {count}{suffix}
      </div>
      <div className="text-lg font-medium text-gray-700">{label}</div>
    </div>
  );
};

const KeyStatistics = () => {
  return (
    <section className="py-16 bg-gradient-to-r from-purple-50 to-blue-50">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatisticItem value={500} label="Active Riders" suffix="+" />
          <StatisticItem value={10000} label="Tests Analyzed" suffix="+" />
          <StatisticItem value={98} label="User Satisfaction" suffix="%" />
        </div>
      </div>
    </section>
  );
};

export default KeyStatistics;
