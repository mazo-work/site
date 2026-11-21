// Plays the P0 preview in headless Chrome: a locked letter, the solve by real drags, every finale phase,
// the hold cut short by a tap, the hold running out on its own, Skip, and a phone-sized screen.
// Usage: serve this folder (python3 -m http.server 8765), then  CHROME_PATH=/path/to/chrome node test.mjs [url]
import puppeteer from 'puppeteer-core';
const URL = process.argv[2] || 'http://127.0.0.1:8765/index.html';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', headless: true,
  args: ['--no-sandbox', '--no-proxy-server', '--disable-background-networking', '--disable-component-update', '--disable-sync',
    '--no-first-run', '--disable-features=OptimizationHints,MediaRouter', '--use-gl=angle', '--use-angle=swiftshader',
    '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
const page = await browser.newPage();
const errors = [];
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
let failures = 0;
const check = (ok, what) => { console.log((ok ? 'ok   ' : 'FAIL ') + what); if (!ok) failures++; };
const st = () => page.evaluate(() => window.__mazo.state());
async function until(pred, ms, what) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) { const s = await st(); if (pred(s)) return s; await sleep(100); }
  const s = await st(); check(false, `${what} (timed out; state ${JSON.stringify(s)})`); return s;
}
async function findView(L) {
  for (const yaw of [-0.6, 0.2, 1.0, 1.8, 2.6, 3.4, 4.2, 5.0]) for (const pitch of [0.3, -0.3, 0.7]) {
    await page.evaluate((y, p) => window.__mazo.setView(y, p), yaw, pitch); await sleep(60);
    let w = await page.evaluate(L => window.__mazo.where(L), L);
    if (L === 'O') w = await page.evaluate(() => window.__mazo.cell('O', 0));
    const hit = await page.evaluate((x, y) => window.__mazo.pick(x, y), w.x, w.y);
    const ax = await page.evaluate(L => window.__mazo.axis(L), L);
    if (hit === L && ax.ppu > 25) return { w, ax };
  }
  return null;
}
async function drag(x, y, legs) {
  await page.mouse.move(x, y); await page.mouse.down();
  let cx = x, cy = y;
  for (const [dx, dy] of legs) { for (let i = 1; i <= 16; i++) { await page.mouse.move(cx + dx * i / 16, cy + dy * i / 16); await sleep(12); } cx += dx; cy += dy; }
  await page.mouse.up();
}
async function pullLetter(L) {
  const v = await findView(L);
  if (!v) return false;
  if (L === 'O') { await drag(v.w.x, v.w.y, [[70, 0]]); return true; }
  let x = v.w.x, y = v.w.y;
  await page.mouse.move(x, y); await page.mouse.down();
  for (let leg = 0; leg < 3; leg++) {
    const ax = await page.evaluate(L => window.__mazo.axis(L), L);
    const before = await page.evaluate(L => window.__mazo.seg(L), L);
    for (let i = 1; i <= 20; i++) { x += ax.dx * ax.ppu * 6 / 20; y += ax.dy * ax.ppu * 6 / 20; await page.mouse.move(x, y); await sleep(12); }
    if (await page.evaluate(L => window.__mazo.seg(L), L) === before) break;
  }
  await page.mouse.up();
  return true;
}

await page.setViewport({ width: 1280, height: 800 });
await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
await sleep(1500);
await page.screenshot({ path: 'shot-0-start.png' });

// 1) a locked letter stays put
{ const v = await findView('A'); if (v) await drag(v.w.x, v.w.y, [[0, 80]]); await sleep(500);
  check((await st()).stage === 0, 'tugging the locked A changes nothing'); }
// 2) the solve, by real drags
for (const L of ['M', 'A', 'Z', 'O']) {
  check(await pullLetter(L), `found a clear view of ${L}`);
  await until(s => s.stage === ['M', 'A', 'Z', 'O'].indexOf(L) + 1, 4000, `${L} comes out`);
  await page.screenshot({ path: `shot-1-${L}.png` });
}
// 3) the finale: sweep, click-in, dim back, hold; a tap ends the hold early; the fall; the word
await until(s => s.phase === 'sweep', 2000, 'the sweep starts');
await until(s => s.phase === 'dimback' || s.phase === 'hold', 6000, 'the light clicks into the O');
await page.screenshot({ path: 'shot-2-clicked.png' });
await until(s => s.phase === 'hold', 3000, 'the hold starts');
await sleep(1200);
await page.screenshot({ path: 'shot-3-hold.png' });
check((await st()).phase === 'hold', 'still holding after 1.2 s');
await page.mouse.click(640, 400);
await sleep(80);
check(['fall', 'done'].includes((await st()).phase), 'a tap during the hold starts the fall');
await sleep(450);
await page.screenshot({ path: 'shot-4-falling.png' });
let s = await until(s => s.done, 6000, 'the card appears');
check(s.blocks === 64 && s.landed === 64, `64 blocks in the line (${s.landed}/${s.blocks})`);
check(s.reveal >= 2.5, `the word is fully revealed (${s.reveal})`);
await page.screenshot({ path: 'shot-5-end.png' });
// 4) the hold runs out by itself
await page.click('#replay'); await sleep(600);
for (let i = 0; i < 4; i++) { await page.evaluate(() => window.__mazo.showMe()); await until(s => s.stage === i + 1, 5000, `Show me pulls letter ${i + 1}`); }
await until(s => s.phase === 'hold', 9000, 'the hold starts (second run)');
const t0 = Date.now();
await until(s => s.phase === 'fall' || s.phase === 'done', 6000, 'the hold ends by itself');
const held = Date.now() - t0;
check(held > 3000 && held < 5200, `the hold lasted about 4 s (${held} ms after it was first seen)`);
s = await until(s => s.done, 6000, 'the card appears (second run)');
check(s.landed === 64, 'all 64 land (second run)');
// 5) the other shape, a phone-sized screen, Skip
await page.click('#replay'); await sleep(400);
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await sleep(1200);
await page.click('#design'); await sleep(800);
check((await st()).design === 'Upright M', 'the shape switch works');
await page.screenshot({ path: 'shot-6-mobile-start.png' });
await page.click('#skip');
s = await until(s => s.done, 3000, 'Skip reaches the end');
check(s.landed === 64 && s.reveal >= 2.5, 'Skip leaves the line and the word in place');
await page.screenshot({ path: 'shot-7-mobile-end.png' });
const real = errors.filter(e => !/AudioContext was not allowed/.test(e));
check(real.length === 0, 'no console errors' + (real.length ? ': ' + real.join(' | ') : ''));
await browser.close();
console.log(failures ? `${failures} FAILED` : 'ALL PASSED');
process.exit(failures ? 1 : 0);
