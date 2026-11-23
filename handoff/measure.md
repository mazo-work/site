# Measurements (U15)

Lighthouse 13.6.0 on Chromium build 1243, 2026-11-23T04:25 UTC, this sandbox (4 CPUs), against the
built site served locally with its `_headers` applied. The analytics beacon is blocked (it cannot load here). Reproduce:

```bash
npm run build && node tools/measure.mjs --lighthouse
```

## Mobile (Lighthouse default: Moto G Power, simulated slow 4G, 4x CPU slowdown)

| Page | Perf | LCP ms | FCP ms | CLS | TBT ms | Speed index ms | Weight KB | A11y | Best practices | SEO |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | 60 | 1053 | 1053 | 0.002 | 160499 | 19336 | 556.7 | 100 | 100 | 100 |
| /404.html | 100 | 907 | 907 | 0.001 | 0 | 907 | 115 | 100 | 100 | 63 |
| /about/ | 99 | 1957 | 904 | 0.001 | 0 | 904 | 127.1 | 100 | 100 | 100 |
| /colophon/ | 100 | 1054 | 1054 | 0.003 | 0 | 1054 | 155 | 100 | 100 | 100 |
| /home/ | 100 | 913 | 913 | 0.001 | 0 | 913 | 116.4 | 100 | 100 | 100 |
| /notes/ | 100 | 904 | 904 | 0.002 | 0 | 904 | 115.3 | 100 | 100 | 100 |
| /notes/note-template/ | 100 | 904 | 904 | 0.001 | 0 | 904 | 116 | 100 | 100 | 100 |
| /now/ | 100 | 903 | 903 | 0.013 | 0 | 903 | 115 | 100 | 100 | 100 |
| /projects/ | 100 | 904 | 904 | 0.045 | 0 | 904 | 115.2 | 100 | 100 | 100 |
| /projects/case-study-2/ | 100 | 902 | 902 | 0.001 | 0 | 902 | 115.1 | 100 | 100 | 66 |
| /projects/mazo/ | 100 | 1053 | 1053 | 0.009 | 0 | 1053 | 150.3 | 100 | 100 | 100 |
| /recruiters/ | 100 | 903 | 903 | 0.017 | 0 | 903 | 152.7 | 100 | 100 | 100 |
| /uses/ | 100 | 903 | 903 | 0.001 | 0 | 903 | 115.5 | 100 | 100 | 100 |

## Desktop (Lighthouse desktop preset)

| Page | Perf | LCP ms | FCP ms | CLS | TBT ms | Speed index ms | Weight KB | A11y | Best practices | SEO |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| / | 60 | 247 | 247 | 0 | 31677 | 6140 | 556.7 | 100 | 100 | 100 |
| /404.html | 100 | 245 | 245 | 0.004 | 0 | 245 | 115 | 100 | 100 | 63 |
| /about/ | 100 | 488 | 245 | 0.024 | 0 | 245 | 127.1 | 100 | 100 | 100 |
| /colophon/ | 100 | 290 | 290 | 0.039 | 0 | 290 | 155 | 100 | 100 | 100 |
| /home/ | 100 | 258 | 258 | 0.004 | 0 | 258 | 116.4 | 100 | 100 | 100 |
| /notes/ | 100 | 242 | 242 | 0.002 | 0 | 242 | 115.3 | 100 | 100 | 100 |
| /notes/note-template/ | 100 | 246 | 246 | 0.013 | 0 | 246 | 116 | 100 | 100 | 100 |
| /now/ | 100 | 246 | 246 | 0.002 | 0 | 246 | 115 | 100 | 100 | 100 |
| /projects/ | 100 | 246 | 246 | 0.002 | 0 | 246 | 115.2 | 100 | 100 | 100 |
| /projects/case-study-2/ | 100 | 248 | 248 | 0.002 | 0 | 248 | 115.1 | 100 | 100 | 66 |
| /projects/mazo/ | 100 | 288 | 288 | 0.003 | 0 | 288 | 150.3 | 100 | 100 | 100 |
| /recruiters/ | 100 | 250 | 250 | 0.021 | 0 | 250 | 152.7 | 100 | 100 | 100 |
| /uses/ | 100 | 249 | 249 | 0.012 | 0 | 249 | 115.5 | 100 | 100 | 100 |

## Download size per page (first visit, brotli, before fonts)

| Page | HTML | CSS | JS | Images | Total KB | Total KB, gzip |
| --- | --- | --- | --- | --- | --- | --- |
| / | 1.6 | 7 | 0.9 | 0 | 9.5 | 10.9 |
| /404.html | 1.6 | 5.9 | 1.3 | 0 | 8.7 | 10.1 |
| /about/ | 2.2 | 5.9 | 1.3 | 8.2 | 17.6 | 19.1 |
| /colophon/ | 5.5 | 5.9 | 1.3 | 0 | 12.7 | 14.8 |
| /home/ | 2 | 5.9 | 1.3 | 0 | 9.1 | 10.6 |
| /notes/ | 1.8 | 5.9 | 1.3 | 0 | 8.9 | 10.3 |
| /notes/note-template/ | 2 | 5.9 | 1.3 | 0 | 9.1 | 10.5 |
| /now/ | 1.7 | 5.9 | 1.3 | 0 | 8.8 | 10.2 |
| /projects/ | 1.8 | 5.9 | 1.3 | 0 | 8.9 | 10.3 |
| /projects/case-study-2/ | 1.7 | 5.9 | 1.3 | 0 | 8.8 | 10.1 |
| /projects/mazo/ | 4.7 | 5.9 | 1.3 | 0 | 11.9 | 13.8 |
| /recruiters/ | 2.8 | 5.9 | 1.3 | 8.2 | 18.2 | 19.9 |
| /uses/ | 1.9 | 5.9 | 1.3 | 0 | 9 | 10.4 |
