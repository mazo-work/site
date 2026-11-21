import puppeteer from 'puppeteer-core';
const sleep = ms => new Promise(r => setTimeout(r, ms));
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome', headless: true,
  args: ['--no-sandbox', '--no-proxy-server', '--disable-background-networking', '--disable-component-update', '--disable-sync', '--no-first-run', '--disable-features=OptimizationHints,MediaRouter', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
const page = await browser.newPage();
const errors = [];
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()); });
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
await page.setViewport({ width: 1280, height: 800 });
await page.goto('http://127.0.0.1:8765/index.html', { waitUntil: 'load', timeout: 60000 });
await sleep(1500);
await page.screenshot({ path: 'shot-0-start.png' });
const st = () => page.evaluate(() => window.__mazo.state());
console.log('start', await st());

async function findView(L) {
  for (const yaw of [-0.6, 0.2, 1.0, 1.8, 2.6, 3.4, 4.2, 5.0]) for (const pitch of [0.3, -0.3, 0.7]) {
    await page.evaluate((y, p) => window.__mazo.setView(y, p), yaw, pitch); await sleep(60);
    let w = await page.evaluate(L => window.__mazo.where(L), L);
    if (L === 'O') w = await page.evaluate(() => window.__mazo.cell('O', 0));
    const hit = await page.evaluate((x, y) => window.__mazo.pick(x, y), w.x, w.y);
    const ax = await page.evaluate(L => window.__mazo.axis(L), L);
    if (hit === L && ax.ppu > 25) return { w, ax, yaw, pitch };
  }
  return null;
}
async function drag(x, y, segs) {          // segs: list of [dx, dy] legs
  await page.mouse.move(x, y); await page.mouse.down();
  let cx = x, cy = y;
  for (const [dx, dy] of segs) {
    const n = 16;
    for (let i = 1; i <= n; i++) { await page.mouse.move(cx + dx * i / n, cy + dy * i / n); await sleep(12); }
    cx += dx; cy += dy;
  }
  await page.mouse.up();
}
async function pullLetter(L) {
  const v = await findView(L);
  if (!v) { console.log('no clear view for', L); return false; }
  if (L === 'O') { await drag(v.w.x, v.w.y, [[70, 0]]); return true; }
  // walk the path leg by leg, re-reading the axis on screen after each detent
  let x = v.w.x, y = v.w.y;
  await page.mouse.move(x, y); await page.mouse.down();
  for (let leg = 0; leg < 3; leg++) {
    const ax = await page.evaluate(L => window.__mazo.axis(L), L);
    const segBefore = await page.evaluate(L => window.__mazo.seg(L), L);
    const dist = ax.ppu * 6;
    for (let i = 1; i <= 20; i++) { x += ax.dx * dist / 20; y += ax.dy * dist / 20; await page.mouse.move(x, y); await sleep(12); }
    const segAfter = await page.evaluate(L => window.__mazo.seg(L), L);
    if (segAfter === segBefore) break;
  }
  await page.mouse.up();
  return true;
}
// 1) a locked letter must not move the stage
{
  const v = await findView('A');
  if (v) { await drag(v.w.x, v.w.y, [[0, 80]]); await sleep(500); console.log('after tugging locked A', await st()); }
}
// 2) solve in order
for (const L of ['M', 'A', 'Z', 'O']) {
  const ok = await pullLetter(L);
  await sleep(1700);
  console.log('pulled', L, ok, await st());
  await page.screenshot({ path: `shot-1-${L}.png` });
}
await sleep(4500);
console.log('end', await st());
await page.screenshot({ path: 'shot-2-end.png' });
// 3) second shape, skip, mobile size
await page.click('#replay'); await sleep(400);
await page.click('#design'); await sleep(800);
console.log('switched', await st());
await page.screenshot({ path: 'shot-3-upright.png' });
await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await sleep(800);
await page.screenshot({ path: 'shot-4-mobile.png' });
await page.click('#skip'); await sleep(5000);
console.log('after skip', await st());
await page.screenshot({ path: 'shot-5-mobile-skip.png' });
console.log('errors:', errors.length ? errors : 'none');
await browser.close();
