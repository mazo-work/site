# Deploy runbook (U16)

How Jon puts v3 on Cloudflare Pages: first on a test subdomain that search engines are told not to index, then at
launch. Nothing here was done in this session (no Cloudflare access, by design). Dashboard menus change names often:
where a step depends on one, it says what to look for, and it is marked **[check the dashboard]**.

Throughout, `example.com` stands for Jon's domain and `test.example.com` for the test subdomain.

## 1. Connect Cloudflare Pages to `v3`, with access to this repository only

1. Cloudflare dashboard: **Workers & Pages → Create → Pages → Connect to Git** [check the dashboard: Cloudflare now
   steers new projects towards Workers; pick the Pages flow, which reads `_headers`].
2. Choose GitHub. When GitHub asks where to install the Cloudflare app, choose **Only select repositories** and pick
   `mazo-work/site` alone. (To check later: GitHub → Settings → Applications → Cloudflare Workers and Pages →
   Repository access.)
3. Project settings:
   - Production branch: `v3`.
   - Automatic deployments for other branches: off (preview branches: **None**), so no other branch is ever built.
   - Framework preset: Astro, or none. Build command: `npm run build`. Output directory: `dist`.
   - Environment variables (Production):
     - `NODE_VERSION` = `22.23.5` (Astro 7 needs Node 22.23.4 or later)
     - `SITE_URL` = `https://test.example.com` (the origin used in canonical links, the sitemap, robots.txt, RSS,
       JSON-LD and the Markdown twins; change it at launch, step 6)
     - `CF_BEACON_TOKEN` = the Web Analytics token (step 5)
   - Optional: `NPM_FLAGS` = `--omit=dev` to skip the check tools (Playwright, axe, html-validate, Lighthouse); the
     build needs only `dependencies` [check the dashboard: confirm the build image honours `NPM_FLAGS`].
4. Deploy. `dist/_headers` is applied by Pages automatically; the build log should end with
   `[agent-files] 12 Markdown twins, llms.txt, sitemap.xml (11 URLs)`.
5. CI: `.github/workflows/check.yml` builds and checks every push to `v3` on GitHub and never deploys. Keep it
   green before promoting anything.

## 2. The test subdomain, `noindex` until launch

1. Pages project → **Custom domains → Set up a domain** → `test.example.com` (Cloudflare adds the CNAME to
   `<project>.pages.dev` if the zone is on Cloudflare).
2. *(After review, 2026-11-23: `public/_headers` now sends `X-Robots-Tag: noindex` on every response until launch, so
   this step is already done for every host, the `pages.dev` preview included; step 6 removes it.)* Tell crawlers not
   to index it. Add this block to the **end** of `public/_headers` (a rule for one host; the
   rest of the file stays as it is), commit, push:

   ```text
   https://test.example.com/*
     X-Robots-Tag: noindex
   ```

   The `*.pages.dev` address gets `X-Robots-Tag: noindex` from Cloudflare by default [check the dashboard /
   Cloudflare's Pages docs]. A Transform Rule (Rules → Transform Rules → Modify response header, hostname equals
   `test.example.com`, set `X-Robots-Tag: noindex`) does the same without a commit.
3. To keep the test page private as well as unindexed, put it behind Cloudflare Access (Zero Trust → Access →
   Applications → Self-hosted → `test.example.com`). Optional; `noindex` only asks search engines not to list it.

## 3. Verify the headers

From any computer with Node 22 and a checkout of `v3` (after `npm ci && npm run build`, which the script reads for
the current asset name):

```bash
node tools/verify-live.mjs https://test.example.com
```

It fetches pages, a 404, a Markdown twin, a built asset and the well-known files, and compares every header with
`public/_headers`. It prints `x-robots-tag` where present (expect `noindex` on the test host).

The same by hand:

```bash
curl -sI https://test.example.com/
```

```bash
curl -sI https://test.example.com/no-such-page/
```

```bash
curl -s https://test.example.com/.well-known/security.txt
```

Expect on every response: `Content-Security-Policy` exactly as in `public/_headers` (one line, with the boot script's
hash and the two Cloudflare Insights hosts), `Strict-Transport-Security: max-age=63072000; includeSubDomains`,
`X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
`Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Resource-Policy: same-origin`, the long
`Permissions-Policy`, and `X-Frame-Options: DENY`. Two things this session could not verify:

- **The 404.** Whether Pages applies `_headers` to its 404 responses. If the second `curl` shows none of the headers,
  add a Transform Rule for the security headers on the whole hostname.
- **The beacon under Trusted Types.** Open the site with DevTools: the Console must show no
  `Content-Security-Policy` or `TrustedHTML` / `TrustedScriptURL` errors, and the Network panel should show
  `beacon.min.js` and a request to `cloudflareinsights.com/cdn-cgi/rum`. If the beacon trips Trusted Types, keep
  `require-trusted-types-for 'script'` (the brief: never drop it silently) and decide with a developer whether a named
  policy can serve it, or whether analytics waits.

## 4. Match Cloudflare's AI-crawler settings to `robots.txt`

The site's own policy is in `robots.txt` (generated from `src/data/crawlers.ts`, and explained on the colophon):
search and answer engines and user-requested fetches allowed; GPTBot, ClaudeBot, Applebot-Extended and
MistralAI-Training refused; Google-Extended, CCBot, Meta-ExternalAgent and Amazonbot allowed for now (they also serve
search or answers; Jon decides).

In the zone's bot settings [check the dashboard: look under Security → Bots, or AI Crawl Control]:

1. **Managed robots.txt** (Cloudflare can prepend its own rules to `robots.txt`): turn it off, so the file served is
   the site's. If you prefer it on, open `https://test.example.com/robots.txt` afterwards and make sure the site's
   groups are still there and nothing contradicts them.
2. **Block AI bots / AI Crawl Control**: if you block at the edge, block only the four training-only crawlers above
   (and anything Cloudflare lists as training-only that `robots.txt` does not name), and allow the search and
   user-fetch crawlers by name. Do not turn on a blanket "block all AI bots" switch: it would refuse the answer
   engines the site wants to be cited by.
3. **Bot Fight Mode**: leave off, or make sure verified bots stay allowed, so Googlebot and Bingbot are not
   challenged.
4. Recheck the crawler names against the vendors' pages listed on the colophon before launch; they change.

## 5. The analytics token

1. Cloudflare dashboard → **Analytics & Logs → Web Analytics → Add a site** → the hostname → choose the **manual
   JavaScript snippet** (not automatic injection: the site already includes the beacon, and the CSP allows exactly its
   two hosts).
2. Copy the token from the snippet (`data-cf-beacon='{"token": "…"}'`) into the Pages variable `CF_BEACON_TOKEN`
   (Production) and redeploy. The repository keeps the placeholder `[CF_BEACON_TOKEN]`; never commit the token
   (the secret scan flags a real one).
3. In the Pages project, leave its own "Web Analytics" toggle off, or the page gets a second beacon.
4. Verify as in step 3 (Network panel, no console errors); the dashboard shows visits within minutes.

## 6. Launch

1. Jon's slots: every `[JON: …]` (listed in `HANDOFF.md`), the resume PDF's email address
   (`handoff/resume-pdf.md`), `security.txt`'s `Contact` (an `https:` address works: the repository's private
   vulnerability reporting page is one option), and the domain.
2. `SITE_URL` = `https://example.com` (the real origin) in the Pages variables.
3. Custom domains: add `example.com` (and `www.example.com` with a redirect to it, if wanted).
4. HSTS check before going live: `includeSubDomains` tells browsers that **every** subdomain of the host is
   HTTPS-only for two years. If the site is on the apex, make sure every subdomain serves HTTPS first. (No `preload`,
   as the brief decided.)
5. Remove the test host's `X-Robots-Tag: noindex` block from `public/_headers` only if the test host is retired;
   otherwise keep it, since it applies to that host alone.
6. Deploy, then `node tools/verify-live.mjs https://example.com` and the console check from step 3.
7. Optional: submit `https://example.com/sitemap.xml` in Google Search Console and Bing Webmaster Tools.
8. Promoting: v3 is the production branch. Merging it into `main` (and pointing Pages at `main`) is Jon's call.
9. Calendar: renew `security.txt`'s `Expires` before 2027-11-22, and recheck the crawler names every few months.
