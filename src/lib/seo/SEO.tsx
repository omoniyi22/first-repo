
import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SEOProps } from './types.ts';
import { BASE_URL, DEFAULT_TITLE, DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE } from './constants.ts';
import { createOrganizationSchema, createProductSchema } from './schemaMarkup.ts';

/**
 * React component for adding SEO metadata to pages
 */
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
