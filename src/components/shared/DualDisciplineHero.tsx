
import React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

interface DualDisciplineHeroProps {
  jumpingImageSrc: string;
  dressageImageSrc: string;
  jumpingAlt: string;
  dressageAlt: string;
  className?: string;
  overlayClassName?: string;
}

const DualDisciplineHero: React.FC<DualDisciplineHeroProps> = ({
  jumpingImageSrc,
  dressageImageSrc,
  jumpingAlt,
  dressageAlt,
  className = "w-full h-96 md:h-[500px]",
  overlayClassName = "bg-gradient-to-r from-blue-900/70 to-blue-800/40"
}) => {
  const isMobile = useIsMobile();
  
  if (!isMobile) {
    // On desktop, just show the jumping image
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <img 
          src={jumpingImageSrc} 
          alt={jumpingAlt}
          className="w-full h-full object-cover object-center"
        />
        <div className={`absolute inset-0 ${overlayClassName}`}></div>
      </div>
    );
  }
  
  // On mobile, show a split view of both disciplines
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="flex h-full">
        {/* Left half - Jumping */}
        <div className="w-1/2 h-full relative">
          <img 
            src={jumpingImageSrc} 
            alt={jumpingAlt}
            className="w-full h-full object-cover"
            style={{ objectPosition: '70% center' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/70 to-blue-800/40"></div>
          <div className="absolute bottom-4 left-4 text-white font-serif text-lg font-medium">
            <span className="bg-blue-800/70 px-2 py-1 rounded">Jumping</span>
          </div>
        </div>
        
        {/* Right half - Dressage */}
        <div className="w-1/2 h-full relative">
          <img 
            src={dressageImageSrc} 
            alt={dressageAlt}
            className="w-full h-full object-cover"
            style={{ objectPosition: '30% center' }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/70 to-purple-800/40"></div>
          <div className="absolute bottom-4 right-4 text-white font-serif text-lg font-medium">
            <span className="bg-purple-800/70 px-2 py-1 rounded">Dressage</span>
          </div>
        </div>
      </div>
      
      {/* Optional overlay that spans both images for text content */}
      <div className="absolute inset-0 bg-black/20"></div>
    </div>
  );
};

export default DualDisciplineHero;
