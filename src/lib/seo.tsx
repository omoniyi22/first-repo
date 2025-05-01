
import { Helmet } from 'react-helmet-async';
import React from 'react';

export interface SEOProps {
  title?: string;
  description?: string;
  canonicalUrl?: string;
  ogType?: 'website' | 'article' | 'product';
  ogImage?: string;
  ogImageAlt?: string;
  keywords?: string[];
  discipline?: 'Dressage' | 'Jumping' | null;
  noIndex?: boolean;
}

// Base values
export const BASE_URL = 'https://aiequestrian.com';
export const DEFAULT_TITLE = 'AI Equestrian | Advanced Dressage & Jumping Analysis with Artificial Intelligence';
export const DEFAULT_DESCRIPTION = 'Transform your riding with AI-powered analysis for dressage and jumping. Upload test sheets and videos for instant feedback and personalized training recommendations.';
export const DEFAULT_OG_IMAGE = '/lovable-uploads/7c32e2d9-4fce-4ed5-abba-0fb12abe96eb.png';

// Generate disciplinary-specific metadata
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

// Create JSON-LD schema markup based on page type
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

// React component for SEO
export const SEO: React.FC<SEOProps> = ({
  title = DEFAULT_TITLE,
  description = DEFAULT_DESCRIPTION,
  canonicalUrl,
  ogType = 'website',
  ogImage = DEFAULT_OG_IMAGE,
  ogImageAlt = 'AI Equestrian - Advanced equestrian analytics',
  keywords = [],
  discipline = null,
  noIndex = false
}) => {
  const fullCanonicalUrl = canonicalUrl ? `${BASE_URL}${canonicalUrl}` : BASE_URL;
  const formattedKeywords = keywords.join(', ');
  
  let schemaMarkup;
  
  if (discipline) {
    schemaMarkup = createProductSchema(discipline);
  } else {
    schemaMarkup = createOrganizationSchema();
  }
  
  return (
    <Helmet>
      {/* Basic Metadata */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={fullCanonicalUrl} />
      {keywords.length > 0 && <meta name="keywords" content={formattedKeywords} />}
      
      {/* Indexing control */}
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Open Graph Tags */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={`${BASE_URL}${ogImage}`} />
      <meta property="og:image:alt" content={ogImageAlt} />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${BASE_URL}${ogImage}`} />
      
      {/* Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify(schemaMarkup)}
      </script>
    </Helmet>
  );
};

// Utility for generating page-specific metadata
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
        description: 'Discover how AI Equestrian's technology analyzes your riding, identifies areas for improvement, and provides personalized training recommendations.',
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
