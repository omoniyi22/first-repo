
import { SEOProps } from './types';
import { DEFAULT_TITLE, DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE } from './constants';

/**
 * Utility for generating page-specific metadata based on the page type
 */
export const getPageMetadata = (page: string, customProps: Partial<SEOProps> = {}): SEOProps => {
  switch (page) {
    case 'home':
      return {
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        ogImage: DEFAULT_OG_IMAGE,
        ogType: 'website',
        canonicalUrl: '/',
        keywords: ['AI equestrian', 'riding analysis', 'dressage AI', 'jumping AI', 'equestrian technology', 'horse training technology'],
        ...customProps
      };
    case 'about':
      return {
        title: 'About Us | AI Equestrian',
        description: 'Learn about the team behind AI Equestrian and our mission to transform equestrian sports through artificial intelligence and data-driven training.',
        canonicalUrl: '/about',
        ogType: 'website',
        keywords: ['equestrian technology company', 'AI equestrian team', 'horse AI developers', 'equestrian innovation'],
        ...customProps
      };
    case 'pricing':
      return {
        title: 'Pricing Plans | AI Equestrian',
        description: 'Choose the perfect plan for your equestrian goals. We offer flexible subscription options for amateur riders, professionals, and trainers.',
        canonicalUrl: '/pricing',
        ogType: 'website',
        keywords: ['equestrian AI subscription', 'dressage analysis pricing', 'jumping analysis cost', 'horse training technology pricing'],
        ...customProps
      };
    case 'how-it-works':
      return {
        title: 'How It Works | AI Equestrian',
        description: "Discover how AI Equestrian\'s technology analyzes your riding, identifies areas for improvement, and provides personalized training recommendations.",
        canonicalUrl: '/how-it-works',
        ogType: 'website',
        keywords: ['equestrian AI process', 'dressage analysis technology', 'jumping analysis system', 'horse training AI method'],
        ...customProps
      };
    case 'blog':
      return {
        title: 'Equestrian Blog | Training Tips & Technology | AI Equestrian',
        description: 'Read the latest articles on equestrian training techniques, technology innovations, and success stories from riders using AI to improve their performance.',
        canonicalUrl: '/blog',
        ogType: 'website',
        keywords: ['equestrian blog', 'horse training articles', 'dressage tips', 'jumping technique blog', 'equestrian technology news'],
        ...customProps
      };
    case 'dashboard':
      return {
        title: 'Rider Dashboard | AI Equestrian',
        description: 'Access your personalized training dashboard, view analysis history, and track your progress over time.',
        canonicalUrl: '/dashboard',
        ogType: 'website',
        noIndex: true, // Private page, don't index
        keywords: ['equestrian dashboard', 'rider progress tracking', 'dressage improvement metrics', 'jumping analytics'],
        ...customProps
      };
    default:
      return {
        title: DEFAULT_TITLE,
        description: DEFAULT_DESCRIPTION,
        ...customProps
      };
  }
};
