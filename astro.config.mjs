// Learning Crumbs — site configuration.
// Change SITE to the real address once the domain is registered.
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export const SITE = 'https://learningcrumbs.org';

export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  build: { assets: 'assets' },
  integrations: [sitemap()],
});
