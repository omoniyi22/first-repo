
import { SEOProps } from './types';
import { DEFAULT_OG_IMAGE } from './constants';

/**
 * Generates SEO metadata for discipline-specific pages
 */
export const generateDisciplineMetadata = (
  discipline: 'Dressage' | 'Jumping',
  customProps: Partial<SEOProps> = {}
): SEOProps => {
  // Base metadata
  const baseMetadata: SEOProps = {
    ogImage: DEFAULT_OG_IMAGE,
    discipline,
    ogType: 'website',
    keywords: [],
  };

  // Discipline specific metadata
  if (discipline === 'Dressage') {
    return {
      ...baseMetadata,
      title: 'AI Dressage Trainer | Advanced Analysis & Personalized Training',
      description: 'Transform your dressage performance with AI-powered analysis of test sheets, videos, and personalized training recommendations.',
      keywords: ['dressage AI', 'dressage test analysis', 'dressage score improvement', 'dressage training technology', 'AI dressage trainer'],
      ...customProps
    };
  } else {
    return {
      ...baseMetadata,
      title: 'AI Jumping Trainer | Advanced Analysis & Personalized Training',
      description: 'Elevate your jumping performance with AI-powered video analysis, course insights, and personalized training recommendations.',
      keywords: ['jumping AI', 'show jumping analysis', 'course analysis', 'jumping technique AI', 'equestrian jumping technology'],
      ...customProps
    };
  }
};
