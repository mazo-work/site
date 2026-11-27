// The MAZO puzzle: prototype/p0/index.src.html's script, ported to the site (U5). Its logic and finale are P0's,
// unchanged; every v3 edit is marked "v3" and only touches an integration point: the bundled data, the site being
// Home, the warm-up, the curtain as a page change, the skip link, and the word's stand-in font. Loaded only by the
// entrance, after first paint (src/pages/index.astro). Every v4 edit is marked "v4" and changes colours only.
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { DESIGNS } from './designs.js';                 // v3: the data is bundled, not pasted in by build.py

const ORDER = ['M', 'A', 'Z', 'O'];
const DIR = { '+x': [1,0,0], '-x': [-1,0,0], '+y': [0,1,0], '-y': [0,-1,0], '+z': [0,0,1], '-z': [0,0,-1] };
// v4: the puzzle wears the mask (v4 BRIEF §3): the same puzzle in the colours of the mask in force when it starts.
// The rule: its ink and light match the mark's, so the word lands in Home's mark without changing colour. Night is
// P0's look recoloured: M orange, A green, Z purple, and O the text colour (amber has no Night match); its light
// effects stay, in orange. Paper prints: the paper and its grain show through (a transparent canvas), the letters are
// ink and riso red with a tint of each, the light is red, the word ink, and a glow, which cannot show on cream, is
// printed as red halftone dots instead (the glow behind the word) or a flat red wash (the light's halo).
const PALETTES = {
  night: { name: 'night', stage: '#07060b', base: '#b9b4d6', colors: { M: '#ff6a2b', A: '#46d98a', Z: '#8b5cff', O: '#dad6f0' },
    sky: 0xf2f0ff, ground: 0x15111f, core: 0xffb08f, halo: 0xff6a2b, haloOpacity: 0.22, haloAdd: true, point: 0xff8a57,
    hint: '#ff8a57', flash: '#ffffff', emissive: '#f1edff', settled: '#ece8ff', light: '#ff6a2b', lightEmissive: '#ff6a2b',
    word: '#ece8ff', glow: [[0, 'rgba(255,106,43,1)'], [0.4, 'rgba(255,106,43,0.45)'], [1, 'rgba(255,106,43,0)']] },
  paper: { name: 'paper', stage: null, base: '#8c847a', colors: { M: '#1b1816', A: '#e5484d', Z: '#9c948a', O: '#f2a19c' },
    sky: 0xfffaf0, ground: 0xb8ae9e, core: 0xe5484d, halo: 0xe5484d, haloOpacity: 0.16, haloAdd: false, point: 0xff8f8f,
    hint: '#e5484d', flash: '#e5484d', emissive: '#000000', settled: '#1b1816', light: '#e5484d', lightEmissive: '#000000',
    word: '#1b1816', glow: 'halftone', dots: '#e5484d' },
};
const PAL = document.documentElement.dataset.theme === 'night' ? PALETTES.night : PALETTES.paper;   // v4
const BASE = PAL.base, COLORS = PAL.colors;                                                        // v4: was P0's
const OS_RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
const HONOR_RM = false;         // the full intro plays for everyone (owner's choice); true restores the reduced-motion version
const RM = HONOR_RM && OS_RM;
const $ = id => document.getElementById(id);
const stageEl = $('stage'), hintEl = $('hint'), arrowEl = $('arrow'), liveEl = $('live'), dbgEl = $('debug');
const SITE = '/home/';          // v3: the site is Home, a page of its own (the CSP allows no frames)
function openSiteNow() {        // no 3D, or 3D was lost: open the site straight away, without the curtain
  location.assign(SITE);        // v3: #fbskip is a plain link to Home, so it needs no handler
}

// ---------- renderer ----------
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: !PAL.stage });   // v4: Paper's canvas lets the paper show
  if (!renderer.getContext()) throw new Error('no context');
} catch (e) {
  $('fallback').style.display = 'flex'; $('top').style.display = 'none'; $('bottom').style.display = 'none'; hintEl.style.display = 'none';
  throw e;
}
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
if (!PAL.stage) renderer.setClearColor(0x000000, 0);   // v4
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.localClippingEnabled = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
stageEl.appendChild(renderer.domElement);
document.body.classList.add('puzzle-ready');            // v3: the still picture of the mark gives way to the puzzle
renderer.domElement.addEventListener('webglcontextlost', e => { e.preventDefault(); dlog('3D context lost'); paused = true; $('fallback').style.display = 'flex'; });

const scene = new THREE.Scene();
scene.background = PAL.stage ? new THREE.Color(PAL.stage) : null;   // v4: was #0e1014
const pmrem = new THREE.PMREMGenerator(renderer);
const room = new RoomEnvironment();
scene.environment = pmrem.fromScene(room, 0.04).texture;
room.dispose(); pmrem.dispose();   // s109 (C3): the generator and the temporary room are freed; the map they made stays
scene.environmentIntensity = 0.55;
const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 400);
scene.add(camera);
const hemi = new THREE.HemisphereLight(PAL.sky, PAL.ground, 0.9); scene.add(hemi);   // v4: was 0xfff2dc, 0x1c2230
const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(6, 10, 9); scene.add(key);
const puzzle = new THREE.Group(); scene.add(puzzle);
const title = new THREE.Group(); camera.add(title);
const slots = ORDER.map((L, k) => { const o = new THREE.Object3D(); o.position.set(k * 6.5 - 9.75, 0, 0); title.add(o); return o; });
const voxGeo = new RoundedBoxGeometry(0.94, 0.94, 0.94, 3, 0.11);

// light core: an orb and a point light, sitting inside the O's ring
const orb = new THREE.Group();
const orbCore = new THREE.Mesh(new THREE.SphereGeometry(0.3, 24, 16), new THREE.MeshBasicMaterial({ color: PAL.core }));   // v4: colours
const orbHalo = new THREE.Mesh(new THREE.SphereGeometry(0.62, 24, 16),
  new THREE.MeshBasicMaterial({ color: PAL.halo, transparent: true, opacity: PAL.haloOpacity, blending: PAL.haloAdd ? THREE.AdditiveBlending : THREE.NormalBlending, depthWrite: false }));
const orbLight = new THREE.PointLight(PAL.point, 14, 0, 2);
orb.add(orbCore, orbHalo, orbLight);

// ---------- state ----------
let design = 0, D, pieces = {}, stage = 0, busy = false, colors = true, debug = location.hash === '#debug';
const dlogLines = []; let dbgLive = '';
function renderDbg() { dbgEl.textContent = dbgLive + (dlogLines.length ? (dbgLive ? '\n' : '') + dlogLines.join('\n') : ''); }
function dlog(m) { dlogLines.push(`${(performance.now() / 1000).toFixed(1)}s ${m}`); if (dlogLines.length > 10) dlogLines.shift(); if (debug) renderDbg(); }
addEventListener('error', e => dlog('error: ' + (e.message || e.type)));
addEventListener('unhandledrejection', e => dlog('rejected: ' + (e.reason && e.reason.message || e.reason)));
document.addEventListener('visibilitychange', () => dlog('page ' + document.visibilityState));
if (debug) { dbgEl.style.display = 'block'; $('dbg').setAttribute('aria-pressed', 'true'); dlog('debug on' + (OS_RM ? ', reduce motion is on (' + (RM ? 'honoured' : 'full intro plays') + ')' : '')); }
let yaw = -0.62, pitch = 0.3, vyaw = 0, vpitch = 0, touched = false;
let W = 1, H = 1, titleScale = 0.3;
let lastProgress = performance.now(), hintLevel = 0, lockedTold = 0;
const tweens = [];
const tween = (ms, fn, done) => { tweens.push({ t0: performance.now(), ms: Math.max(1, ms), fn, done }); };
const easeIO = k => k < 0.5 ? 2*k*k : 1 - Math.pow(-2*k + 2, 2) / 2;
const easeOut = k => 1 - Math.pow(1 - k, 3);
const say = t => { liveEl.textContent = ''; setTimeout(() => { liveEl.textContent = t; }, 30); };

// ---------- sound: synthesized, silent until the first tap or key, with a toggle ----------
let audio = null, master = null, noiseBuf = null, soundOn = true;
try { soundOn = localStorage.getItem('mazo-sound') !== 'off'; } catch (e) {}
function wakeAudio() {
  if (!soundOn) return;
  try {
    if (!audio) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      audio = new AC(); audio.onstatechange = () => { setSoundButton(); dlog('sound ' + audio.state); }; master = audio.createGain(); master.gain.value = 0.7; master.connect(audio.destination);
    }
    if (audio.state !== 'running') {
      // iOS only starts audio inside a tap's touchend or click, and wants a sound started in the same moment
      const b = audio.createBufferSource(); b.buffer = audio.createBuffer(1, 1, 22050); b.connect(audio.destination); b.start(0);
      const r = audio.resume(); if (r && r.then) r.catch(err => dlog('sound blocked: ' + (err && err.name)));
    }
  } catch (e) { audio = null; dlog('sound failed: ' + e.message); }
}
function envGain(t, a, d, peak) {
  const g = audio.createGain();
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + a + d);
  g.connect(master); return g;
}
function tone(f0, f1, dur, type, peak, delay = 0) {
  const t = audio.currentTime + delay, o = audio.createOscillator();
  o.type = type; o.frequency.setValueAtTime(f0, t); if (f1) o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  o.connect(envGain(t, 0.004, dur, peak)); o.start(t); o.stop(t + dur + 0.06);
}
function noise(dur, fc, q, peak, delay = 0) {
  if (!noiseBuf) { const n = audio.sampleRate; noiseBuf = audio.createBuffer(1, n, n); const d = noiseBuf.getChannelData(0); for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1; }
  const t = audio.currentTime + delay, s = audio.createBufferSource(), f = audio.createBiquadFilter();
  s.buffer = noiseBuf; f.type = 'bandpass'; f.frequency.value = fc; f.Q.value = q;
  s.connect(f).connect(envGain(t, 0.002, dur, peak)); s.start(t, Math.random() * 0.5, dur + 0.06);
}
const SFX = {
  tick: () => tone(2600, 1700, 0.03, 'triangle', 0.035),                                   // a pull reaches a corner
  thud: () => { tone(150, 80, 0.13, 'sine', 0.12); noise(0.05, 320, 0.8, 0.04); },        // a locked letter
  slide: () => noise(0.28, 1100, 0.6, 0.035),                                              // a letter comes free
  land: k => { const f = [392, 440, 523.25, 587.33][k] ?? 440;                              // lands in the title, rising M A Z O
    tone(f, f * 0.97, 0.2, 'sine', 0.09); tone(f * 2, null, 0.07, 'triangle', 0.025); noise(0.02, 2600, 1, 0.03); },
  chime: k => tone([659.25, 783.99, 880, 1046.5][k] ?? 880, null, 1.0, 'sine', 0.045),   // the sweep lights a letter
  click: () => { noise(0.018, 3600, 2, 0.08); tone(120, 70, 0.18, 'sine', 0.13); tone(1318.5, null, 1.2, 'sine', 0.035, 0.03); },
  row: () => noise(0.14, 520, 0.6, 0.05),                                                  // a row lets go
  pip: () => tone(2300 + Math.random() * 1000, null, 0.035, 'triangle', 0.014),            // a block lands in the line
};
function sfx(name, arg) { if (!soundOn || !audio || audio.state !== 'running') return; try { SFX[name](arg); } catch (e) {} }
// s109 (P1): whether the sound was already running when this press began, read before the wake below can start it,
// so the first press on "Click for sound" only starts the sound instead of starting it and then turning it off
let pressFoundSound = false;
['pointerdown', 'keydown'].forEach(t => addEventListener(t, () => { pressFoundSound = !!audio && audio.state === 'running'; }, { capture: true, passive: true }));
['pointerdown', 'pointerup', 'touchend', 'click', 'keydown'].forEach(t => addEventListener(t, wakeAudio, { capture: true, passive: true }));

function glyphPixels(rows) {
  const out = [];
  rows.forEach((row, k) => [...row].forEach((ch, i) => { if (ch === 'X') out.push([i, rows.length - 1 - k]); }));
  return out;
}
function buildPiece(L, d) {
  const g = new THREE.Group(); g.name = L;
  const mat = new THREE.MeshStandardMaterial({ color: colors ? COLORS[L] : BASE, roughness: 0.52, metalness: 0,
    emissive: new THREE.Color(PAL.hint), emissiveIntensity: 0 });   // v4: was #ffbf73
  const pix = glyphPixels(d.glyph);
  const mesh = new THREE.InstancedMesh(voxGeo, mat, pix.length);
  const m4 = new THREE.Matrix4();
  pix.forEach(([i, r], n) => { m4.makeTranslation(i - 2, r - 2, 0); mesh.setMatrixAt(n, m4); });
  mesh.instanceMatrix.needsUpdate = true; mesh.computeBoundingSphere(); mesh.userData.L = L;
  g.add(mesh);
  const R = d.R;
  const rot = new THREE.Matrix4().set(R[0][0], R[0][1], R[0][2], 0, R[1][0], R[1][1], R[1][2], 0, R[2][0], R[2][1], R[2][2], 0, 0, 0, 0, 1);
  g.quaternion.setFromRotationMatrix(rot);
  const c = new THREE.Vector3(2, 2, 0).applyMatrix4(rot);
  g.position.set(c.x + d.off[0], c.y + d.off[1], c.z + d.off[2]);
  const segs = []; let start = 0;
  for (const name of d.path) {
    const last = segs[segs.length - 1];
    if (last && last.name === name) last.len += 1;
    else segs.push({ name, dir: new THREE.Vector3(...DIR[name]), start, len: 1 });
    start += 1;
  }
  segs.forEach((s, k) => { if (k) s.start = segs[k - 1].start + segs[k - 1].len; });
  g.userData = { L, mat, mesh, home: g.position.clone(), segs, total: d.path.length, s: 0, seg: 0,
    shake: null, breathe: 0, gone: false };
  return g;
}
function applyS(p) {
  const u = p.userData, pos = u.home.clone();
  if (u.s < 0 && u.segs.length) pos.addScaledVector(u.segs[0].dir, u.s);
  for (const s of u.segs) pos.addScaledVector(s.dir, Math.min(Math.max(u.s - s.start, 0), s.len));
  if (u.s > u.total && u.segs.length) pos.addScaledVector(u.segs[u.segs.length - 1].dir, u.s - u.total);
  if (u.breathe && u.segs.length) pos.addScaledVector(u.segs[0].dir, u.breathe);
  if (u.shake) pos.addScaledVector(u.shake.dir, u.shake.amp);
  p.position.copy(pos);
}
function setColors(on) {
  colors = on; $('colors').setAttribute('aria-pressed', String(on));
  for (const L of ORDER) pieces[L]?.userData.mat.color.set(on ? COLORS[L] : BASE);
}

function load(k) {
  tweens.length = 0; clearTimers(); phase = 'none'; revealLocal = -9;   // s109 (P2): every pending puzzle timer
  if (fallers) { fallers.removeFromParent(); fallers.material.dispose(); fallers.dispose(); fallers = null; } fallData = [];
  disposeMesh(lightBlock); lightBlock = null; disposeMesh(glow); glow = null; disposeMesh(word); word = null;
  orb.visible = true; $('bottom').style.visibility = '';
  for (const L of ORDER) if (pieces[L]) { const u = pieces[L].userData; pieces[L].removeFromParent(); u.mat.dispose(); u.mesh.dispose(); }   // s109 (C2): voxGeo stays
  pieces = {}; design = k; D = DESIGNS[k]; stage = 0; busy = false; hintLevel = 0; lastProgress = performance.now();
  for (const L of ORDER) { pieces[L] = buildPiece(L, D.pieces[L]); puzzle.add(pieces[L]); }
  orb.removeFromParent(); puzzle.add(orb); orb.position.set(...D.core); orb.scale.setScalar(1); orbLight.intensity = 14;
  orbHalo.material.opacity = PAL.haloOpacity;   // s109 (C4): the mask's halo (was P0's 0.22, which overwrote Paper's 0.16)
  hemi.intensity = 0.9; key.intensity = 2.2; scene.environmentIntensity = 0.55;
  $('design').textContent = 'Shape: ' + D.name; $('done').classList.remove('on'); $('showme').hidden = true;
  hintEl.textContent = 'Drag to turn it. Pull a letter out.'; hintEl.style.opacity = 1; arrowEl.style.opacity = 0;
  layout();
  say(`Puzzle ready, shape ${D.name}. Four letters. Find the one that moves.`);
}

// ---------- layout ----------
function layout() {
  W = stageEl.clientWidth || innerWidth; H = stageEl.clientHeight || innerHeight;
  renderer.setSize(W, H, false);
  camera.aspect = W / H;
  const tanH = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  const r = 0.5 * Math.hypot(...D.dims) + 0.4;
  const vh = (2 * r) / (0.92 * Math.min(camera.aspect, 0.86));
  const dist = vh / (2 * tanH);
  camera.position.set(0, 0, dist); camera.lookAt(0, 0, 0); camera.updateProjectionMatrix();
  puzzle.position.set(0, -vh * (camera.aspect < 1 ? 0.02 : 0.07), 0);
  const vw = vh * camera.aspect;
  titleScale = Math.min(0.36, (vw * 0.8) / 24.5);
  title.position.set(0, vh * 0.34, -dist);
  title.scale.setScalar(titleScale);
}
addEventListener('resize', () => { if (D) layout(); });

// ---------- screen helpers ----------
const _a = new THREE.Vector3(), _b = new THREE.Vector3();
function toScreen(v) { const p = v.clone().project(camera); return [(p.x + 1) / 2 * W, (1 - p.y) / 2 * H]; }
function axisScreen(p, dirLocal) {
  p.getWorldPosition(_a);
  _b.copy(dirLocal).applyQuaternion(puzzle.quaternion).add(_a);
  const [x1, y1] = toScreen(_a), [x2, y2] = toScreen(_b);
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1e-6;
  return { dx: dx / len, dy: dy / len, ppu: len, x: x1, y: y1 };
}
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
function pick(e) {
  const r = stageEl.getBoundingClientRect();
  ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const meshes = ORDER.filter(L => !pieces[L].userData.gone).map(L => pieces[L].userData.mesh);
  const hit = ray.intersectObjects(meshes, false)[0];
  return hit ? hit.object.userData.L : null;
}

// ---------- gestures ----------
let ptr = null;
stageEl.addEventListener('pointerdown', e => {
  if (phase === 'hold') { startFall(false); return; }
  if (ptr) return;
  stageEl.setPointerCapture(e.pointerId);
  touched = true; vyaw = vpitch = 0;
  ptr = { id: e.pointerId, x0: e.clientX, y0: e.clientY, x: e.clientX, y: e.clientY, mode: null,
    target: busy ? null : pick(e), hist: [] };
});
stageEl.addEventListener('pointermove', e => {
  if (!ptr || e.pointerId !== ptr.id) return;
  const dx = e.clientX - ptr.x, dy = e.clientY - ptr.y; ptr.x = e.clientX; ptr.y = e.clientY;
  const now = performance.now(); ptr.hist.push([now, dx, dy]); while (ptr.hist.length && now - ptr.hist[0][0] > 90) ptr.hist.shift();
  if (!ptr.mode) {
    const tx = ptr.x - ptr.x0, ty = ptr.y - ptr.y0;
    if (Math.hypot(tx, ty) < 9) return;
    decide(tx, ty);
    if (ptr.mode === 'rotate') { rotateBy(tx, ty); return; }
    if (ptr.mode === 'pull') { pullBy(tx, ty); return; }
  }
  if (ptr.mode === 'rotate') rotateBy(dx, dy);
  else if (ptr.mode === 'pull') pullBy(dx, dy);
  else if (ptr.mode === 'pullO') { if (Math.hypot(ptr.x - ptr.x0, ptr.y - ptr.y0) > 44) { const p = pieces.O; ptr.mode = 'done'; complete(p); } }
});
const endPtr = e => {
  if (!ptr || e.pointerId !== ptr.id) return;
  if (ptr.mode === 'rotate') {
    const sum = ptr.hist.reduce((a, h) => [a[0] + h[1], a[1] + h[2]], [0, 0]); const span = Math.max(16, performance.now() - (ptr.hist[0]?.[0] ?? 0));
    vyaw = RM ? 0 : (sum[0] / span) * 0.008 * 16; vpitch = RM ? 0 : (sum[1] / span) * 0.006 * 16;
  } else if (ptr.mode === 'pull') release();
  else if (!ptr.mode && ptr.target) {   // a tap
    const L = ptr.target;
    if (L === ORDER[stage] && L === 'O') complete(pieces.O);
    else if (L !== ORDER[stage]) shake(L, 1, 0);
    else nudgeHint(L);
  }
  ptr = null;
};
stageEl.addEventListener('pointerup', endPtr); stageEl.addEventListener('pointercancel', endPtr);

function decide(tx, ty) {
  const L = ptr.target, free = ORDER[stage];
  if (L && L === free && !busy) {
    if (L === 'O') { ptr.mode = 'pullO'; return; }
    const p = pieces[L], u = p.userData, seg = u.segs[u.seg];
    const ax = axisScreen(p, seg.dir);
    const cos = (tx * ax.dx + ty * ax.dy) / Math.hypot(tx, ty);
    if (ax.ppu > 10 && Math.abs(cos) > Math.cos(THREE.MathUtils.degToRad(38))) {
      ptr.mode = 'pull'; u.breathe = 0; return;
    }
  } else if (L && !busy) {
    shake(L, tx, ty);
  }
  ptr.mode = 'rotate';
}
function rotateBy(dx, dy) {
  yaw += dx * 0.008; pitch = THREE.MathUtils.clamp(pitch + dy * 0.006, -0.55, 0.85);
}
function pullBy(dx, dy) {
  const p = pieces[ORDER[stage]], u = p.userData;
  let seg = u.segs[u.seg];
  const ax = axisScreen(p, seg.dir);
  let s = u.s + (dx * ax.dx + dy * ax.dy) / Math.max(ax.ppu, 10);
  const a = seg.start, b = seg.start + seg.len, last = u.seg === u.segs.length - 1;
  if (s > b && !last) { s = b; u.seg += 1; click(); }
  else if (s > b + 0.8 && last) s = b + 0.8;
  if (s < a) { if (u.seg > 0) { s = a; u.seg -= 1; } else s = Math.max(s, -0.14); }
  u.s = s; applyS(p);
}
function release() {
  const p = pieces[ORDER[stage]], u = p.userData, last = u.segs.length - 1, ls = u.segs[last];
  const sum = ptr.hist.reduce((a, h) => [a[0] + h[1], a[1] + h[2]], [0, 0]);
  const ax = axisScreen(p, u.segs[u.seg].dir);
  const span = Math.max(16, performance.now() - (ptr.hist[0]?.[0] ?? 0));
  const vel = ((sum[0] * ax.dx + sum[1] * ax.dy) / Math.max(ax.ppu, 10)) / span;   // units per ms
  const far = u.seg === last && (u.s >= ls.start + ls.len * 0.45 || vel > 0.0045);
  if (far || u.s >= u.total - 0.3) complete(p);
  else springBack(p);
}
function springBack(p) {
  const u = p.userData, s0 = u.s;
  tween(RM ? 120 : 320, k => { u.s = s0 * (1 - easeOut(k)); u.seg = segAt(u, u.s); applyS(p); }, () => { u.s = 0; u.seg = 0; applyS(p); });
}
function segAt(u, s) { let k = 0; for (let i = 0; i < u.segs.length; i++) if (s >= u.segs[i].start) k = i; return k; }
function click() { sfx('tick'); if (navigator.vibrate) try { navigator.vibrate(8); } catch (e) {} }
function shake(L, tx, ty) {
  const p = pieces[L], u = p.userData; if (u.gone || u.shake) return;
  let best = null;
  for (const n of Object.keys(DIR)) {
    const v = new THREE.Vector3(...DIR[n]); const ax = axisScreen(p, v);
    const c = (tx * ax.dx + ty * ax.dy) / (Math.hypot(tx, ty) || 1) * Math.min(1, ax.ppu / 20);
    if (!best || c > best.c) best = { c, v };
  }
  u.shake = { dir: best.v, amp: 0 }; sfx('thud');
  tween(RM ? 150 : 340, k => { u.shake.amp = Math.sin(k * Math.PI * 4) * 0.1 * (1 - k); applyS(p); }, () => { u.shake = null; applyS(p); });
  if (lockedTold < 2) { lockedTold++; hintEl.textContent = `${L} is held by the others. Another letter comes out first.`; }
}
function nudgeHint(L) {
  const u = pieces[L].userData; if (!u.segs.length) return;
  tween(RM ? 150 : 600, k => { u.breathe = Math.sin(k * Math.PI) * 0.35; applyS(pieces[L]); }, () => { u.breathe = 0; applyS(pieces[L]); });
}

// ---------- completing a letter ----------
function complete(p) {
  const u = p.userData; if (u.gone) return;
  u.gone = true; busy = true; u.breathe = 0; arrowEl.style.opacity = 0; $('showme').hidden = true; sfx('slide');
  const s0 = u.s, s1 = u.total + 1.4;
  tween(RM ? 80 : Math.max(180, (s1 - s0) * 70), k => { u.s = s0 + (s1 - s0) * easeIO(k); u.seg = segAt(u, Math.min(u.s, u.total)); applyS(p); }, () => fly(p));
}
function fly(p) {
  const u = p.userData, idx = ORDER.indexOf(u.L), slot = slots[idx];
  scene.attach(p);
  const p0 = p.position.clone(), q0 = p.quaternion.clone(), s0 = p.scale.x;
  const tp = new THREE.Vector3(), tq = new THREE.Quaternion(), ts = new THREE.Vector3();
  tween(RM ? 200 : 950, k => {
    slot.getWorldPosition(tp); slot.getWorldQuaternion(tq); slot.getWorldScale(ts);
    const e = easeIO(k);
    const mid = p0.clone().lerp(tp, 0.5); mid.z += 3.5; mid.y += 1.5;
    const a = p0.clone().lerp(mid, e), b = mid.clone().lerp(tp, e);
    p.position.copy(a.lerp(b, e));
    p.quaternion.copy(q0).slerp(tq, e);
    p.scale.setScalar(s0 + (ts.x - s0) * e);
  }, () => {
    slot.attach(p); p.position.set(0, 0, 0); p.quaternion.identity(); p.scale.setScalar(1);
    stage += 1; busy = false; lastProgress = performance.now(); hintLevel = 0; arrowEl.style.opacity = 0; sfx('land', idx);
    if (stage === 1) ensureSite();
    if (stage < 4) {
      hintEl.textContent = `${u.L} is out. ${4 - stage} to go.`;
      say(`${u.L} unlocked. ${4 - stage} letters left.`);
    } else finale();
  });
}
// ---------- finale: sweep, the light completes the O, a hold, the fall, the word ----------
const HOLD_MS = 2000, ROW_GAP = 160, FALL_MS = 900;
// v4: the names stay P0's; the colours are the mask's (Paper: the flash is red, the settled letters ink, no glow)
const WHITE = new THREE.Color(PAL.flash), DIM_WHITE = new THREE.Color(PAL.settled), GLOW_WHITE = new THREE.Color(PAL.emissive), LIT = 0.95, DIM = 0.2;
const LIGHT = new THREE.Color(PAL.light), LIGHT_GLOW = new THREE.Color(PAL.lightEmissive);   // v4: the light settles in the mark's light colour
const FONT = 'ui-sans-serif, system-ui, sans-serif';   // v3: the same stand-in, without named families (BRIEF §3 bans one)
let phase = 'none', lightBlock = null, glow = null, word = null, fallers = null, fallData = [], holdTimer = null, revealLocal = -9, lastPip = 0;
// s109 (P2): the timers that act on puzzle state (the hold, the rows, the curtain's wait) are tracked, so load() and
// jumpToEnd() clear them all; the live region's, the site's warm-up and the curtain's own stay untracked
const timers = new Set();
function later(fn, ms) { const id = setTimeout(() => { timers.delete(id); fn(); }, ms); timers.add(id); return id; }
function clearTimers() { timers.forEach(clearTimeout); timers.clear(); holdTimer = null; }
const revealPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), -1e6);   // the word shows only below this height

function gapLocal() {           // the stencil O's missing ring cell, in the O's own frame
  const pix = new Set(glyphPixels(D.pieces.O.glyph).map(([i, r]) => i + ',' + r));
  for (let r = 0; r < 5; r++) for (let i = 0; i < 5; i++)
    if ((r === 0 || r === 4 || i === 0 || i === 4) && !pix.has(i + ',' + r)) return new THREE.Vector3(i - 2, r - 2, 0);
  return new THREE.Vector3(0, -2, 0);
}
// s109 (C1): voxGeo is shared by every letter, the light block and the fallers, so it is never disposed here
function disposeMesh(m) { if (!m) return; m.removeFromParent(); if (m.geometry !== voxGeo) m.geometry?.dispose?.(); m.material?.map?.dispose?.(); m.material?.dispose?.(); }
function makeGlow() {           // a soft warm light behind the word, so the letters stand out against it
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  if (PAL.glow === 'halftone') {   // v4: Paper prints its glow: red dots that shrink from the centre outwards
    g.fillStyle = PAL.dots;
    for (let y = 4; y < 256; y += 8) for (let x = 4; x < 256; x += 8) {
      const d = Math.hypot(x - 128, y - 128) / 128, k = Math.max(0, 1 - d), r = 4.4 * Math.sqrt(k * (0.35 + 0.65 * k));
      if (r > 0.3) { g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); }
    }
  } else {
    const grd = g.createRadialGradient(128, 128, 0, 128, 128, 128);
    PAL.glow.forEach(([at, col]) => grd.addColorStop(at, col));   // v4: was P0's amber
    g.fillStyle = grd; g.fillRect(0, 0, 256, 256);
  }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(30, 9),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0, depthWrite: false, blending: PAL.glow === 'halftone' ? THREE.NormalBlending : THREE.AdditiveBlending }));
  m.position.set(0, 0, -2.4); m.scale.set(0.001, 0.001, 1); return m;
}
const GLOW_MAX = 0.32, GLOW_MS = 2800;   // the glow starts as a point at the word's centre and spreads out
function setGlow(k) { if (!glow) return; glow.scale.set(Math.max(0.001, k), Math.max(0.001, 0.35 + 0.65 * k), 1); glow.material.opacity = GLOW_MAX * k; }
function makeWord() {           // MAZO in a plain font, capitals, the same height and places as the block letters
  const Wc = 2048, px = Wc / 24.5, c = document.createElement('canvas'); c.width = Wc; c.height = Math.round(6 * px);
  const g = c.getContext('2d');
  g.font = `800 100px ${FONT}`;
  const asc = g.measureText('M').actualBoundingBoxAscent || 72;
  g.font = `800 ${(5 * px) * 100 / asc}px ${FONT}`;
  g.fillStyle = PAL.word; g.textAlign = 'center'; g.textBaseline = 'alphabetic';   // v4: the mark's ink (was #f4eee2)
  ORDER.forEach((L, k) => g.fillText(L, (k * 6.5 - 9.75 + 12.25) * px, 5.5 * px));
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
  const m = new THREE.Mesh(new THREE.PlaneGeometry(24.5, 6),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, clippingPlanes: [revealPlane] }));
  m.position.set(0, 0, -0.6); return m;
}
function finale() {
  busy = true; phase = 'sweep'; hintEl.style.opacity = 0; $('bottom').style.visibility = 'hidden';
  say('All four letters unlocked: M A Z O.');
  scene.attach(orb);
  const o0 = orb.position.clone();
  const w = new THREE.Vector3(), lit = [false, false, false, false];
  const slotX = slots.map(s => s.getWorldPosition(new THREE.Vector3()));
  const start = slotX[0].clone().add(new THREE.Vector3(-1.4 * titleScale * 6, 0, 1.2));
  const end = slotX[3].clone().add(new THREE.Vector3(1.4 * titleScale * 6, 0, 1.2));
  const light = (i, ms) => { const m = pieces[ORDER[i]].userData.mat, c0 = m.color.clone(); sfx('chime', i); m.emissive.copy(GLOW_WHITE);
    tween(ms, k => { const e = easeOut(k); m.color.copy(c0).lerp(WHITE, e); m.emissiveIntensity = LIT * e; }); };
  glow = makeGlow(); title.add(glow); word = makeWord(); title.add(word); revealLocal = -9;
  if (RM) { ORDER.forEach((L, i) => light(i, 200)); tween(300, () => {}, () => clickIn(true)); return; }
  tween(650, k => { hemi.intensity = 0.9 - 0.6 * k; key.intensity = 2.2 - 1.6 * k; scene.environmentIntensity = 0.55 - 0.35 * k; });
  tween(800, k => { orb.position.copy(o0).lerp(start, easeIO(k)); }, () => {
    tween(1700, k => {
      orb.position.copy(start).lerp(end, easeIO(k));
      orb.getWorldPosition(w);
      slotX.forEach((sx, i) => { if (!lit[i] && w.x >= sx.x - 0.2) { lit[i] = true; light(i, 320); } });
    }, () => clickIn(false));
  });
}
function clickIn(instant) {     // the light turns into a block and clicks into the O's gap
  phase = 'click';
  const gl = gapLocal(), O = pieces.O;
  lightBlock = new THREE.Mesh(voxGeo, new THREE.MeshStandardMaterial({ color: LIGHT.clone(), roughness: 0.4,   // v4: the light's colour (was white)
    emissive: LIGHT_GLOW.clone(), emissiveIntensity: 2.4 }));
  const seat = () => { O.add(lightBlock); lightBlock.position.copy(gl); lightBlock.quaternion.identity(); lightBlock.scale.setScalar(1); orb.visible = false; orbLight.intensity = 0; };
  if (instant) { seat(); sfx('click'); dimBack(true); return; }
  scene.add(lightBlock);
  const from = orb.position.clone(), target = new THREE.Vector3();
  lightBlock.position.copy(from); lightBlock.scale.setScalar(0.0001);
  tween(950, k => {
    O.localToWorld(target.copy(gl));
    const e = easeIO(k), p = from.clone().lerp(target, e);
    p.y -= Math.sin(e * Math.PI) * titleScale * 3; p.z += Math.sin(e * Math.PI) * titleScale * 2;
    orb.position.copy(p); lightBlock.position.copy(p);
    orb.scale.setScalar(Math.max(0.0001, 1 - e * 1.1));
    lightBlock.scale.setScalar(titleScale * Math.min(1, e * 1.4));
    lightBlock.rotation.set(0, (1 - e) * Math.PI, 0);
  }, () => {
    seat(); sfx('click');
    tween(240, k => { lightBlock.scale.setScalar(1 + 0.28 * Math.sin(k * Math.PI)); lightBlock.material.emissiveIntensity = 2.4 + 2 * Math.sin(k * Math.PI); },
      () => { lightBlock.scale.setScalar(1); dimBack(false); });
  });
}
function dimBack(instant) {     // the white dims slightly, the O's new block with it, as a glow rises behind
  phase = 'dimback';
  const mats = ORDER.map(L => pieces[L].userData.mat).concat(lightBlock.material);
  const from = mats.map(m => ({ c: m.color.clone(), e: m.emissiveIntensity }));
  const to = mats.map(m => (m === lightBlock.material ? LIGHT : DIM_WHITE));   // v4: the letters settle in ink, the light in its colour
  mats.forEach(m => m.emissive.copy(m === lightBlock.material ? LIGHT_GLOW : GLOW_WHITE));
  tween(instant ? 1 : 850, k => { const e = easeOut(k);
    mats.forEach((m, i) => { m.color.copy(from[i].c).lerp(to[i], e); m.emissiveIntensity = from[i].e + (DIM - from[i].e) * e; }); });
  tween(instant ? 1 : 850, () => {}, () => startHold(instant));
  tween(instant ? 1 : GLOW_MS, k => setGlow(easeIO(k)));
}
function startHold(instant) {
  phase = 'hold';
  holdTimer = later(() => startFall(false), instant ? 0 : (RM ? 1500 : HOLD_MS));
}
function startFall(instant) {   // rows let go bottom first; every block shrinks into one line along the bottom
  if (phase !== 'hold') return;
  phase = 'fall'; clearTimeout(holdTimer); timers.delete(holdTimer);
  const blocks = [], m4 = new THREE.Matrix4(), loc = new THREE.Vector3(), wp = new THREE.Vector3(), wq = new THREE.Quaternion(), ws = new THREE.Vector3();
  scene.updateMatrixWorld(true);
  for (const L of ORDER) {
    const u = pieces[L].userData, mesh = u.mesh;
    for (let n = 0; n < mesh.count; n++) {
      mesh.getMatrixAt(n, m4); loc.setFromMatrixPosition(m4);
      m4.premultiply(mesh.matrixWorld); m4.decompose(wp, wq, ws);
      blocks.push({ row: Math.round(loc.y + 2), cam: camera.worldToLocal(wp.clone()), scale: ws.x, color: u.mat.color.clone() });
    }
  }
  lightBlock.getWorldPosition(wp); lightBlock.getWorldScale(ws);
  blocks.push({ row: Math.round(lightBlock.position.y + 2), cam: camera.worldToLocal(wp.clone()), scale: ws.x, color: lightBlock.material.color.clone() });
  blocks.sort((a, b) => a.cam.x - b.cam.x || a.cam.y - b.cam.y);
  const t0 = performance.now();
  blocks.forEach((b, j) => { b.j = j; b.t0 = instant ? t0 - FALL_MS - 400 : t0 + b.row * ROW_GAP + Math.random() * 70; b.landed = instant; b.landT = 0; });
  fallData = blocks;
  fallers = new THREE.InstancedMesh(voxGeo, new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.52, emissive: GLOW_WHITE, emissiveIntensity: DIM }), blocks.length);
  blocks.forEach((b, i) => fallers.setColorAt(i, b.color));
  fallers.instanceColor.needsUpdate = true; fallers.frustumCulled = false;
  camera.add(fallers);
  ORDER.forEach(L => { pieces[L].visible = false; });
  if (instant) { revealLocal = 2.6; updateFall(performance.now()); return; }
  tween(900, k => { hemi.intensity = 0.3 + 0.3 * k; key.intensity = 0.6 + 0.6 * k; });
  for (let r = 0; r < 5; r++) later(() => {
    if (phase !== 'fall') return;
    sfx('row');
    const s0 = Math.max(revealLocal, -2.55), to = r - 2 + 0.52;
    tween(300, k => { revealLocal = Math.max(revealLocal, s0 + (to - s0) * easeOut(k)); });
  }, r * ROW_GAP);
}
function lineSlot(j, n) {       // block j's place in the bottom line, in camera space
  const dist = -title.position.z, vh = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)), vw = vh * camera.aspect;
  const s = (vw * 0.96) / n, perPx = vh / H;
  return { x: -vw * 0.48 + (j + 0.5) * s, y: -vh / 2 + s / 2 + 12 * perPx, z: -dist, size: (s * 0.9) / 0.94 };
}
function updateFall(now) {
  if (!fallers) return;
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), sc = new THREE.Vector3();
  let landed = 0;
  fallData.forEach((b, i) => {
    const T = lineSlot(b.j, fallData.length), k = Math.min(1, Math.max(0, (now - b.t0) / FALL_MS));
    const kx = easeIO(k), ky = k * k;                      // sideways eases; downward accelerates like a drop
    p.set(b.cam.x + (T.x - b.cam.x) * kx, b.cam.y + (T.y - b.cam.y) * ky, b.cam.z + (T.z - b.cam.z) * kx);
    const size = b.scale + (T.size - b.scale) * kx; sc.set(size, size, size);
    if (k >= 1) {
      if (!b.landed) { b.landed = true; b.landT = now; if (now - lastPip > 35) { lastPip = now; sfx('pip'); } }
      const tt = (now - b.landT) / 180;
      if (tt < 1) { sc.y = size * (1 - 0.22 * Math.sin(tt * Math.PI)); p.y -= (size - sc.y) * 0.47; }
      landed++;
    }
    m4.compose(p, q, sc); fallers.setMatrixAt(i, m4);
  });
  fallers.instanceMatrix.needsUpdate = true;
  if (phase === 'fall' && landed === fallData.length) finishUp();
}
function finishUp() {
  phase = 'done'; revealLocal = 2.6;
  if (SITE) { later(() => { if (phase === 'done') liftCurtain(); }, 650); return; }
  later(() => { if (phase === 'done') { $('done').classList.add('on'); $('replay').focus({ preventScroll: true }); } }, 500);
}
// ---------- the curtain: the line is its hem; it rises and the current site is underneath ----------
let siteReady = null, paused = false, rafId = 0;
function ensureSite() {         // v3: warms Home (its page and this theme's fonts) well before the curtain needs it
  if (siteReady) return siteReady;
  dlog('site loading');
  siteReady = Promise.race([
    fetch(SITE, { credentials: 'same-origin' }).then(r => r.text()).then(() => { dlog('site loaded'); return true; }),
    new Promise(res => setTimeout(() => res(false), 10000)),
  ]).catch(() => false);
  const cs = getComputedStyle(document.documentElement);
  for (const v of ['--font-text', '--font-display', '--font-ui']) {
    const fam = cs.getPropertyValue(v).trim();
    if (fam && document.fonts) document.fonts.load('400 1em ' + fam).catch(() => {});
  }
  return siteReady;
}
function snapshot() {            // the scene as a still picture: phones move a picture smoothly, a live 3D view less reliably
  renderer.render(scene, camera);
  const c = $('snap'), g = renderer.domElement; c.width = g.width; c.height = g.height;
  c.getContext('2d').drawImage(g, 0, 0); c.style.display = 'block'; g.style.visibility = 'hidden';
}
function liveAgain() { $('snap').style.display = 'none'; renderer.domElement.style.visibility = ''; }
function moveStage(y, o, ms, done) {   // a CSS transition, run by the browser's compositor
  let fin = false;
  const end = e => { if ((e && e.target !== stageEl) || fin) return; fin = true; stageEl.removeEventListener('transitionend', end); stageEl.style.transition = ''; done(); };
  stageEl.style.transition = `transform ${ms}ms cubic-bezier(0.45, 0, 0.55, 1), opacity ${ms}ms ease`;
  void stageEl.offsetHeight;
  stageEl.style.transform = y ? `translate3d(0, ${y}%, 0)` : ''; stageEl.style.opacity = o === 1 ? '' : String(o);
  stageEl.addEventListener('transitionend', end); setTimeout(end, ms + 300);
}
const CURTAIN_FADE = false;     // the curtain rises for everyone, Reduce Motion included (owner's choice); true gives a 0.45 s fade
// v3: the curtain is the page change itself. Where the browser has cross-document view transitions, Home's
// stylesheet raises this page's last frame (a still picture) over 1.4 s with Home underneath, and the word, placed
// as an image over the 3D word, travels into Home's mark (BRIEF §3: MAZO resolves into the header). Elsewhere the
// stage rises here as in P0, then Home opens. Replay is the site's "Replay the intro" link, back to this page.
const CROSS_DOC_VT = 'onpagereveal' in window;
function liftCurtain() {
  phase = 'lift';
  Promise.race([ensureSite(), new Promise(r => setTimeout(r, 3000))]).then(() => {
    $('top').style.visibility = 'hidden'; placeWord(); snapshot(); paused = true; dlog(CURTAIN_FADE ? 'curtain: fade' : 'curtain: rising');
    const opened = () => {
      phase = 'site'; say('The site is open.'); dlog('curtain up');
      try { sessionStorage.setItem('mazo-curtain', CURTAIN_FADE ? 'fade' : 'rise'); } catch (e) {}
      location.assign(SITE);
    };
    if (CROSS_DOC_VT) opened();
    else if (CURTAIN_FADE) moveStage(0, 0, 450, opened); else moveStage(-100, 1, 1400, opened);
  });
}
function placeWord() {          // the word as a still image exactly over the 3D word; the 3D word steps aside
  if (!word) return;
  const a = new THREE.Vector3(-12.25, 3, 0), b = new THREE.Vector3(12.25, -3, 0);
  word.updateMatrixWorld(true); word.localToWorld(a); word.localToWorld(b);
  const [x1, y1] = toScreen(a), [x2, y2] = toScreen(b);
  const img = document.createElement('img');
  img.id = 'word'; img.alt = ''; img.src = word.material.map.image.toDataURL('image/png');
  img.style.left = x1 + 'px'; img.style.top = y1 + 'px'; img.style.width = (x2 - x1) + 'px'; img.style.height = (y2 - y1) + 'px';
  document.body.append(img); word.visible = false;
}
addEventListener('pageshow', e => { if (e.persisted && (phase === 'site' || phase === 'lift')) location.reload(); });   // back from Home: a fresh puzzle
function jumpToEnd() {          // Skip: straight to the finished state from anywhere
  tweens.length = 0; clearTimers();   // s109 (P2)
  for (let i = stage; i < 4; i++) {
    const p = pieces[ORDER[i]], u = p.userData; u.gone = true; u.breathe = 0;
    slots[i].attach(p); p.position.set(0, 0, 0); p.quaternion.identity(); p.scale.setScalar(1);
  }
  stage = 4; busy = true; arrowEl.style.opacity = 0; $('showme').hidden = true; hintEl.style.opacity = 0; $('bottom').style.visibility = 'hidden';
  ORDER.forEach(L => { const m = pieces[L].userData.mat; m.color.copy(DIM_WHITE); m.emissive.copy(GLOW_WHITE); m.emissiveIntensity = DIM; });
  ensureSite();
  hemi.intensity = 0.6; key.intensity = 1.2; scene.environmentIntensity = 0.2; orb.visible = false; orbLight.intensity = 0;
  if (!glow) { glow = makeGlow(); title.add(glow); } setGlow(1);
  if (!word) { word = makeWord(); title.add(word); }
  if (fallers) {
    const now = performance.now(); fallData.forEach(b => { b.t0 = now - FALL_MS - 400; });
    phase = 'fall'; revealLocal = 2.6; updateFall(now); return;
  }
  if (!lightBlock || lightBlock.parent !== pieces.O) {
    disposeMesh(lightBlock);
    lightBlock = new THREE.Mesh(voxGeo, new THREE.MeshStandardMaterial({ color: LIGHT.clone(), roughness: 0.52, emissive: LIGHT_GLOW.clone(), emissiveIntensity: DIM }));   // v4: the light's colour
    pieces.O.add(lightBlock); lightBlock.position.copy(gapLocal());
  } else { lightBlock.material.color.copy(LIGHT); lightBlock.material.emissive.copy(LIGHT_GLOW); lightBlock.material.emissiveIntensity = DIM; lightBlock.scale.setScalar(1); }   // v4
  phase = 'hold'; startFall(true);
}
addEventListener('keydown', () => { if (phase === 'hold') startFall(false); });
addEventListener('wheel', () => { if (phase === 'hold') startFall(false); }, { passive: true });

// ---------- hints, buttons, keys ----------
function showMe() {
  if (busy || stage > 3) return;
  const p = pieces[ORDER[stage]], u = p.userData;
  if (u.L === 'O') { complete(p); return; }
  busy = true; u.breathe = 0;
  const s0 = u.s;
  tween(RM ? 200 : 1100, k => { u.s = s0 + (u.total - s0) * easeIO(k); u.seg = segAt(u, u.s); applyS(p); }, () => { busy = false; complete(p); });
}
function skip() {
  if (phase === 'done' || phase === 'lift' || phase === 'site') return;   // s109 (C10): not once the curtain is going up
  jumpToEnd(); say('Skipped to the end: M A Z O.');
}
$('skip').addEventListener('click', e => {   // v3: Skip intro is a link to Home; with the puzzle running it plays P0's skip
  if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  e.preventDefault(); skip();
});
$('showme').onclick = showMe;
$('replay').onclick = e => { orb.visible = true; load(design); if (e.detail === 0) stageEl.focus(); };
$('design').onclick = () => { orb.visible = true; load((design + 1) % DESIGNS.length); };
$('colors').onclick = () => setColors(!colors);
const COARSE = matchMedia('(pointer: coarse)').matches;
function setSoundButton() { $('sound').textContent = !soundOn ? 'Sound off' : (audio && audio.state === 'running') ? 'Sound on' : (COARSE ? 'Tap for sound' : 'Click for sound'); $('sound').setAttribute('aria-pressed', String(soundOn)); }
$('sound').onclick = () => {
  if (soundOn && !pressFoundSound) { wakeAudio(); return; }   // this tap only starts the sound (s109, P1: as it began)
  soundOn = !soundOn; try { localStorage.setItem('mazo-sound', soundOn ? 'on' : 'off'); } catch (e) {}
  setSoundButton(); if (soundOn) wakeAudio(); else if (audio) audio.suspend();
};
setSoundButton();
$('dbg').onclick = () => { debug = !debug; $('dbg').setAttribute('aria-pressed', String(debug)); dbgEl.style.display = debug ? 'block' : 'none'; };
stageEl.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft') yaw -= 0.26; else if (e.key === 'ArrowRight') yaw += 0.26;
  else if (e.key === 'ArrowUp') pitch = Math.max(-0.55, pitch - 0.2); else if (e.key === 'ArrowDown') pitch = Math.min(0.85, pitch + 0.2);
  else if (e.key === 'Enter' || e.key === ' ') { showMe(); } else return;
  touched = true; e.preventDefault();
});

// ---------- loop ----------
let tPrev = performance.now(), fps = 60, lastPhase = '';
function frame(now) {
  if (paused) { rafId = 0; return; }
  const dt = Math.min(0.05, (now - tPrev) / 1000); tPrev = now; fps = fps * 0.95 + (1 / Math.max(dt, 1e-3)) * 0.05;
  for (let i = tweens.length - 1; i >= 0; i--) {
    const t = tweens[i], k = Math.min(1, (now - t.t0) / t.ms);
    t.fn(k); if (k >= 1) { tweens.splice(i, 1); t.done && t.done(); }
  }
  if (fallers) updateFall(now);
  revealPlane.constant = title.position.y + titleScale * revealLocal;   // camera sits at y = 0, unrotated
  if (!touched && !RM && stage === 0) yaw += dt * 0.22;
  if (!ptr) { yaw += vyaw * dt * 60; pitch = THREE.MathUtils.clamp(pitch + vpitch * dt * 60, -0.55, 0.85); vyaw *= 0.92; vpitch *= 0.9; }
  puzzle.rotation.set(pitch, yaw, 0);

  // hints for a visitor who is stuck
  if (stage < 4 && !busy && D) {
    const idle = (now - lastProgress) / 1000, p = pieces[ORDER[stage]], u = p.userData;
    const lvl = idle > 40 ? 3 : idle > 20 ? 2 : idle > 8 ? 1 : 0;
    if (lvl !== hintLevel) {
      hintLevel = lvl;
      if (lvl >= 1) hintEl.textContent = 'One letter is loose. Look for the one that glows.';
      if (lvl >= 2) hintEl.textContent = `Try ${u.L}. Turn the puzzle until the arrow is easy to follow.`;
      $('showme').hidden = lvl < 3;
    }
    const pulling = ptr && ptr.mode === 'pull';
    u.mat.emissiveIntensity = lvl >= 1 && !pulling ? 0.1 + 0.08 * Math.sin(now / 260) : 0;
    if (lvl >= 1 && !pulling && u.s === 0 && !RM && u.segs.length) { u.breathe = 0.09 * (0.5 + 0.5 * Math.sin(now / 300)); applyS(p); }
    if (lvl >= 2 && u.segs.length && !pulling) {
      const ax = axisScreen(p, u.segs[u.seg].dir);
      arrowEl.style.transform = `translate(${ax.x + ax.dx * 70}px, ${ax.y + ax.dy * 70}px) rotate(${Math.atan2(ax.dy, ax.dx)}rad)`;
      arrowEl.style.opacity = ax.ppu > 10 ? 1 : 0.35;
    } else if (!pulling) arrowEl.style.opacity = 0;
  }
  if (debug && D) {
    const free = ORDER[stage], u = stage < 4 ? pieces[free].userData : null;
    const ax = u && u.segs.length ? axisScreen(pieces[free], u.segs[u.seg].dir) : null;
    dbgLive = `shape ${D.name}  stage ${stage}  free ${stage < 4 ? free : '-'}\n` +
      (u ? `s ${u.s.toFixed(2)}/${u.total}  seg ${u.seg + 1}/${u.segs.length}  path ${u.segs.map(s => s.name + 'x' + s.len).join(' ')}\n` : '') +
      (ax ? `axis on screen ${ax.ppu.toFixed(0)} px/unit\n` : '') + `mode ${ptr?.mode ?? '-'}  fps ${fps.toFixed(0)}  phase ${phase}  sound ${audio ? audio.state : 'none'}`;
    renderDbg();
  }
  if (phase !== lastPhase) { dlog('phase ' + phase); lastPhase = phase; }
  renderer.render(scene, camera);
  rafId = requestAnimationFrame(frame);
}
let voxDisposed = 0; voxGeo.addEventListener('dispose', () => { voxDisposed++; });   // s109: for the check (C1)
window.__mazo = {   // test hook: read-only state plus the same helpers the page uses
  gpu: () => ({ geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures,   // s109: the lifecycle
    calls: renderer.info.render.calls, triangles: renderer.info.render.triangles, voxDisposed }),
  state: () => ({ halo: Math.round(orbHalo.material.opacity * 100) / 100, stage, busy, design: D.name, s: stage < 4 ? pieces[ORDER[stage]].userData.s : null,
    done: $('done').classList.contains('on'), phase, blocks: fallData.length, landed: fallData.filter(b => b.landed).length,
    reveal: Math.round(revealLocal * 100) / 100, sound: !!audio && audio.state, hasSite: !!SITE,
    lineColors: new Set(fallData.map(b => b.color.getHexString())).size,
    mask: PAL.name, letters: ORDER.map(L => '#' + pieces[L].userData.mat.color.getHexString()),          // v4: which colours it wears
    word: word ? PAL.word : null, light: lightBlock ? '#' + lightBlock.material.color.getHexString() : null }),
  showMe: () => showMe(),
  axis: L => { const p = pieces[L], u = p.userData; return u.segs.length ? axisScreen(p, u.segs[u.seg].dir) : { dx: 1, dy: 0, ppu: 99, x: 0, y: 0 }; },
  cell: (L, n) => { const u = pieces[L].userData, m = new THREE.Matrix4(); u.mesh.getMatrixAt(n, m);
    const v = new THREE.Vector3().setFromMatrixPosition(m); u.mesh.localToWorld(v); const [x, y] = toScreen(v); return { x, y }; },
  where: L => { const v = new THREE.Vector3(); pieces[L].getWorldPosition(v); const [x, y] = toScreen(v); return { x, y }; },
  seg: L => pieces[L].userData.seg, setView: (y, p) => { yaw = y; pitch = p; touched = true; vyaw = vpitch = 0; },
  pick: (x, y) => pick({ clientX: x, clientY: y })
};
load(0);
rafId = requestAnimationFrame(frame);
