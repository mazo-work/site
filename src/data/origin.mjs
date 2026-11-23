// The site's public origin, shared by astro.config.mjs and the checks in tools/check.
// Jon's domain is not in this repository: set SITE_URL when building for real. `.invalid` is a reserved
// TLD (RFC 2606), so the placeholder can never resolve. [JON: domain]
export const SITE = (process.env.SITE_URL || 'https://mazo.invalid').replace(/\/$/, '');
