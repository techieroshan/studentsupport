import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Generates sitemap.xml dynamically from application routes
 * 
 * This script automatically generates sitemap.xml for all site routes.
 * 
 * To add a new route:
 * 1. Add the route to the ROUTES array below with appropriate SEO metadata
 * 2. The sitemap will be automatically regenerated on the next build
 * 
 * The sitemap is generated:
 * - Automatically before each build (via prebuild script)
 * - During build (via Vite plugin as backup)
 * - Manually via: npm run sitemap
 * 
 * Base URL can be overridden via SITEMAP_BASE_URL environment variable
 */

interface SitemapRoute {
  path: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  lastmod?: string;
}

// Base URL from the application
const BASE_URL = process.env.SITEMAP_BASE_URL || 'https://studentsupport.newabilities.org';

// Define all public routes with their SEO metadata
const ROUTES: SitemapRoute[] = [
  {
    path: '/',
    changefreq: 'daily',
    priority: 1.0,
  },
  {
    path: '/browse',
    changefreq: 'hourly',
    priority: 0.9,
  },
  {
    path: '/donors',
    changefreq: 'weekly',
    priority: 0.8,
  },
  {
    path: '/how-it-works',
    changefreq: 'monthly',
    priority: 0.8,
  },
  {
    path: '/terms',
    changefreq: 'yearly',
    priority: 0.5,
  },
  {
    path: '/privacy',
    changefreq: 'yearly',
    priority: 0.5,
  },
  // Protected routes - included but with lower priority
  {
    path: '/dashboard-seeker',
    changefreq: 'daily',
    priority: 0.7,
  },
  {
    path: '/dashboard-donor',
    changefreq: 'daily',
    priority: 0.7,
  },
  {
    path: '/post-request',
    changefreq: 'weekly',
    priority: 0.6,
  },
  {
    path: '/post-offer',
    changefreq: 'weekly',
    priority: 0.6,
  },
  {
    path: '/admin',
    changefreq: 'daily',
    priority: 0.5,
  },
];

/**
 * Generates the sitemap.xml content
 */
function generateSitemap(): string {
  const now = new Date().toISOString().split('T')[0];
  
  const urls = ROUTES.map((route) => {
    const url = `${BASE_URL}${route.path}`;
    const lastmod = route.lastmod || now;
    
    return `  <url>
    <loc>${escapeXml(url)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

/**
 * Escapes XML special characters
 */
function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Main function to generate and write sitemap.xml
 */
function main(): void {
  const outputPath = join(process.cwd(), 'public', 'sitemap.xml');
  const sitemapContent = generateSitemap();
  
  writeFileSync(outputPath, sitemapContent, 'utf-8');
  console.log(`✅ Sitemap generated successfully at: ${outputPath}`);
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Routes included: ${ROUTES.length}`);
}

// Always run main when script is executed directly
main();

export { generateSitemap, ROUTES, BASE_URL };

