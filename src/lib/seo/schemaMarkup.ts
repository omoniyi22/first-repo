
import { BASE_URL } from './constants';

/**
 * Creates JSON-LD schema markup for the organization
 */
export const createOrganizationSchema = () => {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AI Equestrian',
    url: BASE_URL,
    logo: `${BASE_URL}/og-image.png`,
    description: 'AI-powered equestrian training and analysis platform for dressage and jumping riders',
    sameAs: [
      'https://www.facebook.com/AIEquestrian',
      'https://www.instagram.com/aiequestrian',
      'https://www.youtube.com/c/AIEquestrian'
    ]
  };
};

/**
 * Creates JSON-LD schema markup for discipline-specific products
 */
export const createProductSchema = (discipline: 'Dressage' | 'Jumping') => {
  const baseSchema = {
    '@context': 'https://schema.org',
    '@type': 'SportsApplication',
    name: discipline === 'Dressage' ? 'AI Dressage Trainer' : 'AI Jumping Trainer',
    applicationCategory: 'SportsApplication',
    offers: {
      '@type': 'Offer',
      price: '29.99',
      priceCurrency: 'USD',
      availability: 'https://schema.org/InStock'
    },
    operatingSystem: 'Web browser'
  };
  
  if (discipline === 'Dressage') {
    return {
      ...baseSchema,
      description: 'AI-powered dressage test analysis and personalized training recommendations',
      featureList: 'Test sheet analysis, Score improvement, Personalized feedback, Movement detection',
    };
  } else {
    return {
      ...baseSchema,
      description: 'AI-powered jumping course analysis and technique improvement',
      featureList: 'Jump technique analysis, Course optimization, Fault detection, Training recommendations',
    };
  }
};
