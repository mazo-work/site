// Astro config for the v3 site: static output, zero JavaScript by default.
// See BRIEF.md §3 (Stack, Security) for why each setting is here.
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import { glyphs } from './src/lib/markdown-glyphs.mjs';
import agentFiles from './src/integrations/agent-files.mjs';
import measure from './src/integrations/measure.mjs';
import { SITE } from './src/data/origin.mjs';
import { SITE_NAME, DESCRIPTIONS } from './src/data/site.ts';

// The public origin. Jon's domain is not in this repository: set SITE_URL when building for real.
// `.invalid` is a reserved TLD (RFC 2606), so the placeholder can never resolve. [JON: domain]
const site = SITE;

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory',
    // Every stylesheet is a file, so the CSP can say `style-src 'self'` with no hashes.
    inlineStylesheets: 'never',
  },
  // No dev toolbar, no client prefetching: nothing the site did not ask for.
  // No syntax highlighting: Shiki writes inline style attributes, which the CSP (style-src 'self') blocks.
  markdown: { syntaxHighlight: false, processor: satteri({ mdastPlugins: [glyphs] }) },
  integrations: [measure({ fontsManifest: './tools/fonts/fonts.json' }), agentFiles({ site: SITE, siteName: SITE_NAME, summary: DESCRIPTIONS.home, extras: [
    { title: 'Lab notes feed (RSS)', href: '/notes/rss.xml' },
  ] })],
  devToolbar: { enabled: false },
  prefetch: false,
  vite: {
    build: {
      // Astro inlines script chunks under this size; 0 keeps every script a file (`script-src 'self'`).
      assetsInlineLimit: 0,
    },
  },
});
