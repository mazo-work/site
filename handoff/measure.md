# Measurements (v4, U11)

Lighthouse 13.6.0 on Chromium build 1243, 2026-11-23T14:18 UTC, this sandbox (4 CPUs), against the
built site served locally with its `_headers` applied, once per mask (Paper: a light device; Night: a dark one). The analytics beacon is blocked (it cannot load here). Reproduce:

```bash
npm run build && node tools/measure.mjs --lighthouse
```

## Paper, mobile (Lighthouse default: Moto G Power, simulated slow 4G, 4x CPU slowdown)

| Page | Perf | LCP ms | FCP ms | CLS | TBT ms | Speed index ms | Weight KB | A11y | Best practices | SEO |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | 60 | 1053 | 1053 | 0.002 | 159648 | 19074 | 565.3 | 100 | 100 | 66 |
| /404.html | 99 | 905 | 905 | 0.076 | 0 | 905 | 252.9 | 100 | 100 | 63 |
| /about/ | 95 | 3004 | 903 | 0.002 | 0 | 903 | 332 | 100 | 100 | 69 |
| /colophon/ | 100 | 1054 | 1054 | 0.006 | 0 | 1054 | 287.9 | 100 | 100 | 66 |
| /home/ | 100 | 903 | 903 | 0.002 | 0 | 903 | 306.5 | 100 | 100 | 66 |
| /notes/ | 100 | 903 | 903 | 0.002 | 0 | 903 | 253.4 | 100 | 100 | 66 |
| /notes/note-template/ | 100 | 904 | 904 | 0.002 | 0 | 904 | 269.8 | 100 | 100 | 66 |
| /now/ | 100 | 905 | 905 | 0.033 | 0 | 905 | 253.8 | 100 | 100 | 66 |
| /projects/ | 100 | 903 | 903 | 0.016 | 0 | 903 | 253.3 | 100 | 100 | 66 |
| /projects/case-study-2/ | 100 | 903 | 903 | 0.002 | 0 | 903 | 253 | 100 | 100 | 66 |
| /projects/mazo/ | 100 | 1056 | 1056 | 0.002 | 0 | 1056 | 279.2 | 100 | 100 | 66 |
| /recruiters/ | 92 | 3306 | 1054 | 0.015 | 0 | 1054 | 348.2 | 100 | 100 | 69 |

## Paper, desktop (Lighthouse desktop preset)

| Page | Perf | LCP ms | FCP ms | CLS | TBT ms | Speed index ms | Weight KB | A11y | Best practices | SEO |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | 60 | 288 | 288 | 0 | 30709 | 6290 | 565.3 | 100 | 100 | 66 |
| /404.html | 100 | 245 | 245 | 0.004 | 0 | 245 | 252.9 | 100 | 100 | 63 |
| /about/ | 100 | 609 | 249 | 0.003 | 0 | 249 | 332 | 100 | 100 | 69 |
| /colophon/ | 100 | 287 | 287 | 0.004 | 0 | 287 | 287.9 | 100 | 100 | 66 |
| /home/ | 100 | 252 | 252 | 0 | 0 | 252 | 306.5 | 100 | 100 | 66 |
| /notes/ | 100 | 243 | 243 | 0.003 | 0 | 243 | 253.4 | 100 | 100 | 66 |
| /notes/note-template/ | 100 | 245 | 245 | 0.006 | 0 | 245 | 269.8 | 100 | 100 | 66 |
| /now/ | 100 | 247 | 247 | 0.004 | 0 | 247 | 253.8 | 100 | 100 | 66 |
| /projects/ | 100 | 244 | 244 | 0.003 | 0 | 244 | 253.3 | 100 | 100 | 66 |
| /projects/case-study-2/ | 100 | 284 | 284 | 0.002 | 0 | 284 | 253 | 100 | 100 | 66 |
| /projects/mazo/ | 100 | 284 | 284 | 0.009 | 0 | 284 | 279.2 | 100 | 100 | 66 |
| /recruiters/ | 100 | 685 | 288 | 0.004 | 0 | 288 | 348.2 | 100 | 100 | 69 |

## Night, mobile (Lighthouse default: Moto G Power, simulated slow 4G, 4x CPU slowdown)

| Page | Perf | LCP ms | FCP ms | CLS | TBT ms | Speed index ms | Weight KB | A11y | Best practices | SEO |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | 60 | 1064 | 1064 | 0.002 | 159923 | 20512 | 565.3 | 100 | 100 | 66 |
| /404.html | 100 | 903 | 903 | 0.004 | 0 | 903 | 94.2 | 100 | 100 | 63 |
| /about/ | 99 | 2107 | 907 | 0.001 | 0 | 907 | 203.4 | 100 | 100 | 69 |
| /colophon/ | 100 | 1055 | 1055 | 0.003 | 0 | 1055 | 143.6 | 100 | 100 | 66 |
| /home/ | 100 | 904 | 904 | 0.002 | 0 | 904 | 114.4 | 100 | 100 | 66 |
| /notes/ | 100 | 902 | 902 | 0 | 0 | 902 | 109 | 100 | 100 | 66 |
| /notes/note-template/ | 100 | 903 | 903 | 0.002 | 74 | 903 | 125.4 | 100 | 100 | 66 |
| /now/ | 100 | 914 | 914 | 0.028 | 0 | 914 | 109.4 | 100 | 100 | 66 |
| /projects/ | 100 | 903 | 903 | 0.002 | 0 | 903 | 108.9 | 100 | 100 | 66 |
| /projects/case-study-2/ | 100 | 903 | 903 | 0.002 | 0 | 903 | 94.3 | 100 | 100 | 66 |
| /projects/mazo/ | 100 | 1053 | 1053 | 0.001 | 0 | 1053 | 120.5 | 100 | 100 | 66 |
| /recruiters/ | 98 | 2405 | 1055 | 0.001 | 0 | 1055 | 189.5 | 100 | 100 | 69 |

## Night, desktop (Lighthouse desktop preset)

| Page | Perf | LCP ms | FCP ms | CLS | TBT ms | Speed index ms | Weight KB | A11y | Best practices | SEO |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | 60 | 287 | 287 | 0 | 30827 | 6253 | 565.3 | 100 | 100 | 66 |
| /404.html | 100 | 246 | 246 | 0.002 | 0 | 246 | 94.2 | 100 | 100 | 63 |
| /about/ | 100 | 529 | 246 | 0.002 | 0 | 246 | 203.4 | 100 | 100 | 69 |
| /colophon/ | 100 | 284 | 284 | 0.003 | 0 | 284 | 143.6 | 100 | 100 | 66 |
| /home/ | 100 | 246 | 246 | 0.001 | 0 | 246 | 114.4 | 100 | 100 | 66 |
| /notes/ | 100 | 245 | 245 | 0.004 | 0 | 245 | 109 | 100 | 100 | 66 |
| /notes/note-template/ | 100 | 246 | 246 | 0.004 | 0 | 246 | 125.4 | 100 | 100 | 66 |
| /now/ | 100 | 246 | 246 | 0.003 | 0 | 246 | 109.4 | 100 | 100 | 66 |
| /projects/ | 100 | 245 | 245 | 0.003 | 0 | 245 | 108.9 | 100 | 100 | 66 |
| /projects/case-study-2/ | 100 | 243 | 243 | 0.001 | 0 | 243 | 94.3 | 100 | 100 | 66 |
| /projects/mazo/ | 100 | 288 | 288 | 0.006 | 0 | 288 | 120.5 | 100 | 100 | 66 |
| /recruiters/ | 100 | 565 | 288 | 0.001 | 0 | 288 | 189.5 | 100 | 100 | 69 |

## Fonts per mask (WOFF2, loaded only by the mask that uses them)

- Paper: 208.7 KB
- Night: 52 KB

## Download size per page (first visit, brotli, before fonts)

| Page | HTML | CSS | JS | Images | Total KB | Total KB, gzip |
| --- | --- | --- | --- | --- | --- | --- |
| / | 1.9 | 8.7 | 0.8 | 0 | 11.4 | 13.1 |
| /404.html | 2 | 7.3 | 1.5 | 0 | 10.9 | 12.6 |
| /about/ | 3.1 | 7.3 | 1.8 | 71 | 83.2 | 85.2 |
| /colophon/ | 6.8 | 7.3 | 1.5 | 0 | 15.7 | 18.2 |
| /home/ | 2.6 | 7.3 | 1.8 | 0 | 11.8 | 13.6 |
| /notes/ | 2.3 | 7.3 | 1.5 | 0 | 11.1 | 12.8 |
| /notes/note-template/ | 2.4 | 7.3 | 1.5 | 0 | 11.3 | 13 |
| /now/ | 2.5 | 7.3 | 1.5 | 0 | 11.3 | 13.1 |
| /projects/ | 2.2 | 7.3 | 1.5 | 0 | 11.1 | 12.8 |
| /projects/case-study-2/ | 2.1 | 7.3 | 1.5 | 0 | 11 | 12.7 |
| /projects/mazo/ | 5.2 | 7.3 | 1.5 | 0 | 14 | 16.3 |
| /recruiters/ | 3.6 | 7.3 | 1.8 | 71 | 83.7 | 85.9 |
