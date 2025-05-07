
import { SEOProps } from './types';
import { DEFAULT_TITLE, DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE } from './constants';

/**
 * Utility for generating discipline-specific metadata
 */
export const generateDisciplineMetadata = (discipline: 'Dressage' | 'Jumping', customProps: Partial<SEOProps> = {}): SEOProps => {
  switch(discipline) {
    case 'Dressage':
      return {
        title: 'AI Dressage | Advanced Dressage Training Analysis',
        description: 'Elevate your dressage performance with AI-powered movement analysis, personalized feedback, and training recommendations.',
        canonicalUrl: '/dressage',
        ogImage: '/lovable-uploads/42930ec1-2f55-429f-aaa5-4aac1791a729.png',
        ogType: 'website',
        keywords: ['dressage AI', 'dressage training', 'dressage analysis', 'dressage improvement', 'AI equestrian', 'dressage technology'],
        discipline: 'Dressage',
        ...customProps
      };
    case 'Jumping':
      return {
        title: 'AI Jump | Advanced Jumping Training Analysis',
        description: 'Perfect your jumping technique with AI-powered analysis of approach, takeoff, and landing. Get personalized feedback to improve your results.',
        canonicalUrl: '/jumping',
        ogImage: '/lovable-uploads/09bde514-1caf-42e9-9093-d5bd869dda06.png',
        ogType: 'website',
        keywords: ['jumping AI', 'show jumping analysis', 'equestrian jumping', 'jumping technique', 'AI equestrian', 'jumping technology'],
        discipline: 'Jumping',
        ...customProps
      };
    default:
      return {
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        ogImage: DEFAULT_OG_IMAGE,
        ...customProps
      };
  }
};
