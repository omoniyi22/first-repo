// Barrel exports for SEO utilities
export { type SEOProps } from './types.ts';
export { DEFAULT_TITLE, DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE, BASE_URL } from './constants.ts';
export { SEO } from './SEO.tsx';
export { generateDisciplineMetadata } from './disciplineMetadata.ts';
export { getPageMetadata } from './pageMetadata.ts';
export { createOrganizationSchema, createProductSchema } from './schemaMarkup.ts';