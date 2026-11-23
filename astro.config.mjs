// Astro config for the v3 site: static output, zero JavaScript by default.
// See BRIEF.md §3 (Stack, Security) for why each setting is here.
import { defineConfig } from 'astro/config';

// The public origin. Jon's domain is not in this repository: set SITE_URL when building for real.
// `.invalid` is a reserved TLD (RFC 2606), so the placeholder can never resolve. [JON: domain]
const site = process.env.SITE_URL || 'https://mazo.invalid';

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
  markdown: { syntaxHighlight: false },
  devToolbar: { enabled: false },
  prefetch: false,
  vite: {
    build: {
      // Astro inlines script chunks under this size; 0 keeps every script a file (`script-src 'self'`).
      assetsInlineLimit: 0,
    },
  },
});
