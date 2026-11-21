# P0 preview

The MAZO puzzle with plain pieces: its shape, the order letters come out, the title, and the finale. It is not the site.

```
npm ci                  # three.js (and puppeteer-core for the test)
python3 build.py        # embeds docs/puzzle/mazo-burr.json and copies three.js into lib/
python3 -m http.server 8765
CHROME_PATH=/path/to/chrome node test.mjs   # plays the whole solve in headless Chrome
```

`index.src.html` is the source. `index.html` and `lib/` are build output and are not committed.
