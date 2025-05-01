
import { SEOProps } from './types';

/**
 * Generates discipline-specific metadata for dressage or jumping pages
 */
export const generateDisciplineMetadata = (
  discipline: 'Dressage' | 'Jumping',
  customProps: Partial<SEOProps> = {}
): SEOProps => {
  const baseProps: SEOProps = {
    ogType: 'product',
    discipline,
  };
  
  if (discipline === 'Dressage') {
    return {
      ...baseProps,
      title: `AI Dressage Analysis | Test Score Improvement | AI Equestrian`,
      description: 'Upload your dressage test sheets for instant AI analysis. Get movement-by-movement feedback, identify patterns, and receive personalized training recommendations.',
      ogImage: '/lovable-uploads/7c32e2d9-4fce-4ed5-abba-0fb12abe96eb.png', 
      ogImageAlt: 'Dressage rider using AI Equestrian technology',
      keywords: ['dressage analysis', 'dressage test scores', 'dressage AI', 'dressage training technology', 'dressage movements', 'test sheet analysis'],
      ...customProps,
    };
  } else {
    // Jumping
    return {
      ...baseProps,
      title: `AI Jumping Analysis | Course Analysis | AI Equestrian`,
      description: 'Get AI-powered analysis of your jumping rounds. Improve technique, reduce faults, and create targeted training plans with video analysis and personalized feedback.',
      ogImage: '/lovable-uploads/987a3f3b-1917-439f-a3a9-8fabc609cffa.png',
      ogImageAlt: 'Show jumper using AI Equestrian technology',
      keywords: ['jump analysis', 'jumping course analysis', 'jumping AI', 'show jumping technology', 'fault analysis', 'jumping technique'],
      ...customProps,
    };
  }
};
