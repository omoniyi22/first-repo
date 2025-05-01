
// SEO related type definitions
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
