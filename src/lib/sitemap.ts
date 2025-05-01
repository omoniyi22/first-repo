
// Sitemap generator utility

interface SitemapEntry {
  loc: string; // URL path (without domain)
  lastmod?: string; // ISO date string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number; // 0.0 to 1.0
}

export const SITE_URL = 'https://aiequestrian.com';

// Core site pages with SEO priority
export const coreSitePages: SitemapEntry[] = [
  { loc: '/', lastmod: new Date().toISOString(), changefreq: 'weekly', priority: 1.0 },
  { loc: '/dressage', lastmod: new Date().toISOString(), changefreq: 'weekly', priority: 0.9 },
  { loc: '/jumping', lastmod: new Date().toISOString(), changefreq: 'weekly', priority: 0.9 },
  { loc: '/how-it-works', lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.8 },
  { loc: '/pricing', lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.8 },
  { loc: '/about', lastmod: new Date().toISOString(), changefreq: 'monthly', priority: 0.7 },
  { loc: '/blog', lastmod: new Date().toISOString(), changefreq: 'weekly', priority: 0.7 },
  { loc: '/terms', lastmod: new Date().toISOString(), changefreq: 'yearly', priority: 0.4 },
  { loc: '/privacy', lastmod: new Date().toISOString(), changefreq: 'yearly', priority: 0.4 },
];

// Generate XML sitemap content based on entries
export const generateSitemapXml = (entries: SitemapEntry[]): string => {
  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  entries.forEach(entry => {
    xml += '  <url>\n';
    xml += `    <loc>${SITE_URL}${entry.loc}</loc>\n`;
    if (entry.lastmod) {
      xml += `    <lastmod>${entry.lastmod}</lastmod>\n`;
    }
    if (entry.changefreq) {
      xml += `    <changefreq>${entry.changefreq}</changefreq>\n`;
    }
    if (entry.priority !== undefined) {
      xml += `    <priority>${entry.priority.toFixed(1)}</priority>\n`;
    }
    xml += '  </url>\n';
  });

  xml += '</urlset>';
  return xml;
};

// Generate dynamic sitemap entries from blog posts
export const generateBlogSitemapEntries = (blogPosts: any[]): SitemapEntry[] => {
  return blogPosts.map(post => ({
    loc: `/blog/${post.slug}`,
    lastmod: post.date ? new Date(post.date).toISOString() : new Date().toISOString(),
    changefreq: 'monthly' as const,
    priority: 0.6
  }));
};
