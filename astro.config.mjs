// Learning Crumbs — site configuration.
// Change SITE to the real address once the domain is registered.
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { readFileSync, readdirSync } from 'node:fs';
import { execSync } from 'node:child_process';

export const SITE = 'https://learningcrumbs.org';

const tagSlug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// How many visible exhibits use each topic. Topics with fewer than three are kept
// out of search results and the sitemap (see src/pages/topics/[tag].astro).
const exhibitDir = new URL('./src/content/exhibits/', import.meta.url);
const tagCounts = new Map();
for (const file of readdirSync(exhibitDir)) {
  if (!file.endsWith('.md')) continue;
  const text = readFileSync(new URL(file, exhibitDir), 'utf8');
  if (/^hidden:\s*true/m.test(text)) continue;
  const m = text.match(/^tags:\s*\[(.*)\]/m);
  if (!m) continue;
  const tags = m[1].split(',').map((t) => t.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
  for (const t of new Set(tags.map(tagSlug))) tagCounts.set(t, (tagCounts.get(t) ?? 0) + 1);
}

// Last-changed date for each exhibit, from git history, for the sitemap.
const lastmod = new Map();
try {
  const log = execSync('git log --format=%cI --name-only -- src/content/exhibits', { encoding: 'utf8' });
  let date;
  for (const line of log.split('\n')) {
    if (/^\d{4}-\d{2}-\d{2}T/.test(line)) date = line;
    else if (line.startsWith('src/content/exhibits/') && date) {
      const slug = line.split('/').pop().replace(/\.md$/, '');
      if (!lastmod.has(slug)) lastmod.set(slug, date);
    }
  }
} catch {
  // No git history available (for example, a download without .git): skip lastmod.
}

export default defineConfig({
  site: SITE,
  trailingSlash: 'always',
  build: { assets: 'assets' },
  integrations: [
    sitemap({
      filter: (page) => {
        if (/\/(search|add-yours|suggest)\//.test(page)) return false;
        const topic = page.match(/\/topics\/([^/]+)\/$/);
        if (topic && (tagCounts.get(topic[1]) ?? 0) < 3) return false;
        return true;
      },
      serialize: (item) => {
        const exhibit = item.url.match(/\/exhibits\/([^/]+)\/$/);
        if (exhibit && lastmod.has(exhibit[1])) item.lastmod = lastmod.get(exhibit[1]);
        return item;
      },
    }),
  ],
});
