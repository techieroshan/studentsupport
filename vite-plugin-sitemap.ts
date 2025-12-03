import type { Plugin } from 'vite';
import { execSync } from 'child_process';

/**
 * Vite plugin that automatically generates sitemap.xml
 * Runs on build to ensure sitemap is always up-to-date
 * Note: This is a backup - the prebuild script also generates the sitemap
 */
export function sitemapPlugin(): Plugin {
  return {
    name: 'vite-plugin-sitemap',
    apply: 'build',
    buildStart() {
      try {
        // Run the sitemap generation script
        execSync('npm run sitemap', { stdio: 'inherit' });
      } catch (error) {
        // Non-fatal: sitemap generation failed, but build can continue
        console.warn('⚠️  Sitemap generation failed (non-fatal):', error instanceof Error ? error.message : String(error));
      }
    },
  };
}

