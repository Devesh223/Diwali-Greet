// Shared drawing helpers: math, glow sprites, flame, diya, fireworks
export const TAU = Math.PI * 2;
export const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
export const lerp = (a, b, t) => a + (b - a) * t;
export const eio = (t) => { t = clamp(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const eo = (t) => 1 - Math.pow(1 - clamp(t), 3);
export const ei = (t) => { t = clamp(t); return t * t * t; };
export const sm = (a, b, x) => clamp((x - a) / (b - a));
export const mod = (v, m) => ((v % m) + m) % m;
export function mk(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const nz = (x) => (Math.sin(x * 1.7) + Math.sin(x * 2.9 + 1.3) * .6 + Math.sin(x * 5.3 + .7) * .3) / 1.9;

const COLS = { warm: '255,140,40', gold: '255,184,70', white: '255,240,214', pink: '255,90,150', blue: '130,160,255' };
const sprites = {};
function sprite(name) {
  if (sprites[name]) return sprites[name];
  const s = 128, cv = document.createElement('canvas'); cv.width = cv.height = s;
  const c = cv.getContext('2d'), rgb = COLS[name];
  const g = c.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  g.addColorStop(0, `rgba(${rgb},1)`); g.addColorStop(.22, `rgba(${rgb},.5)`);
  g.addColorStop(.55, `rgba(${rgb},.12)`); g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g; c.fillRect(0, 0, s, s);
  return (sprites[name] = cv);
}
// additive radial glow (alpha-safe: multiplies current alpha)
export function glow(c, x, y, r, a = 1, name = 'warm', sy = 1) {
  if (r < .5 || a <= 0) return;
  const pa = c.globalAlpha, po = c.globalCompositeOperation;
  c.globalCompositeOperation = 'lighter'; c.globalAlpha = pa * Math.min(1, a);
  c.drawImage(sprite(name), x - r, y - r * sy, r * 2, r * 2 * sy);
  c.globalAlpha = pa; c.globalCompositeOperation = po;
}

function drop(c, x, y, w, h, s) {
  c.beginPath(); c.moveTo(x, y);
  c.bezierCurveTo(x - w * 1.25, y - h * .02, x - w * .85 + s * .2, y - h * .55, x + s, y - h);
  c.bezierCurveTo(x + w * .85 + s * .2, y - h * .55, x + w * 1.25, y - h * .02, x, y);
  c.closePath();
}
// realistic layered flame, base at (x,y), height h
export function flame(c, x, y, h, t, seed = 0, a = 1) {
  if (h < 1.5 || a <= 0) return;
  const w = h * .24, sway = nz(t * 5 + seed) * w * .6, hh = h * (1 + nz(t * 8.3 + seed * 3) * .07);
  const pa = c.globalAlpha, po = c.globalCompositeOperation;
  const L = [
    [1, 1, [[0, 'rgba(255,110,10,0)'], [.2, 'rgba(255,120,20,.8)'], [.65, 'rgba(255,170,50,.75)'], [1, 'rgba(255,215,120,0)']]],
    [.72, .78, [[0, 'rgba(255,170,40,0)'], [.2, 'rgba(255,205,75,.95)'], [.75, 'rgba(255,232,150,.8)'], [1, 'rgba(255,245,200,0)']]],
    [.38, .5, [[0, 'rgba(255,240,190,0)'], [.25, 'rgba(255,253,238,.98)'], [1, 'rgba(255,248,215,0)']]],
  ];
  c.globalCompositeOperation = 'lighter';
  for (const [ws, hs, stops] of L) {
    const g = c.createLinearGradient(0, y, 0, y - hh * hs);
    for (const [o, col] of stops) g.addColorStop(o, col);
    c.fillStyle = g; c.globalAlpha = pa * a; drop(c, x, y, w * ws, hh * hs, sway * hs); c.fill();
  }
  const bg = c.createRadialGradient(x, y - h * .05, 0, x, y - h * .05, w * .8);
  bg.addColorStop(0, 'rgba(110,140,255,.7)'); bg.addColorStop(1, 'rgba(110,140,255,0)');
  c.globalAlpha = pa * a * .55; c.fillStyle = bg; c.fillRect(x - w, y - h * .35, w * 2, h * .6);
  c.globalAlpha = pa; c.globalCompositeOperation = po;
}
// clay diya (side view). (x,y) = rim centre. returns wick tip.
export function diya(c, x, y, d, lit = 0) {
  c.save();
  c.fillStyle = 'rgba(0,0,0,.45)'; c.beginPath(); c.ellipse(x, y + d * .36, d * .6, d * .09, 0, 0, TAU); c.fill();
  const g = c.createLinearGradient(x - d / 2, y, x + d / 2, y + d * .35);
  g.addColorStop(0, '#4d2012'); g.addColorStop(.5, '#9a4a22'); g.addColorStop(1, '#5a2614');
  c.fillStyle = g; c.beginPath(); c.moveTo(x - d * .5, y);
  c.bezierCurveTo(x - d * .5, y + d * .34, x - d * .22, y + d * .4, x, y + d * .4);
  c.bezierCurveTo(x + d * .22, y + d * .4, x + d * .5, y + d * .34, x + d * .5, y); c.closePath(); c.fill();
  // spout
  c.beginPath(); c.moveTo(x - d * .46, y - d * .01); c.quadraticCurveTo(x - d * .62, y - d * .04, x - d * .68, y - d * .1);
  c.quadraticCurveTo(x - d * .55, y + d * .07, x - d * .4, y + d * .12); c.fillStyle = '#7d3a1c'; c.fill();
  if (lit > 0) { // lamp-light on bowl
    const lg = c.createRadialGradient(x, y, 0, x, y, d * .55);
    lg.addColorStop(0, `rgba(255,170,70,${.75 * lit})`); lg.addColorStop(1, 'rgba(255,120,40,0)');
    c.fillStyle = lg; c.beginPath(); c.moveTo(x - d * .5, y);
    c.bezierCurveTo(x - d * .5, y + d * .34, x - d * .22, y + d * .4, x, y + d * .4);
    c.bezierCurveTo(x + d * .22, y + d * .4, x + d * .5, y + d * .34, x + d * .5, y); c.closePath(); c.fill();
  }
  c.fillStyle = `rgba(232,170,80,${.35 + .55 * lit})`; // gold band dots
  for (let i = 0; i < 9; i++) { const a = (i + .5) / 9, px = x - d * .36 + a * d * .72; c.beginPath(); c.arc(px, y + d * .17 + Math.sin(a * Math.PI) * d * .06, d * .014, 0, TAU); c.fill(); }
  c.fillStyle = '#b9622c'; c.beginPath(); c.ellipse(x, y, d * .5, d * .095, 0, 0, TAU); c.fill();
  c.fillStyle = '#1f0d05'; c.beginPath(); c.ellipse(x, y + d * .005, d * .44, d * .07, 0, 0, TAU); c.fill();
  if (lit > 0) { c.fillStyle = `rgba(255,190,90,${.5 * lit})`; c.beginPath(); c.ellipse(x, y + d * .01, d * .3, d * .035, 0, 0, TAU); c.fill(); }
  c.strokeStyle = '#150a05'; c.lineWidth = Math.max(1, d * .028); c.lineCap = 'round';
  c.beginPath(); c.moveTo(x, y); c.lineTo(x + d * .012, y - d * .1); c.stroke();
  c.restore();
  return { x: x + d * .012, y: y - d * .1 };
}
export function stars(c, list, t, a = 1) {
  c.fillStyle = '#fff';
  for (const s of list) { c.globalAlpha = a * (.35 + .65 * (.5 + .5 * Math.sin(t * 1.3 + s.p))) * s.b; c.fillRect(s.x, s.y, s.r, s.r); }
  c.globalAlpha = 1;
}
export const mkStars = (n, w, h, seed = 3) => { const R = mk(seed); return Array.from({ length: n }, () => ({ x: R() * w, y: R() * h, r: R() * 1.4 + .4, p: R() * TAU, b: .4 + R() * .6 })); };
export function motes(c, w, h, t, n, rgb = '255,200,120', seed = 5, a = .5) {
  const R = mk(seed); c.save(); c.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const x = mod(R() * w + Math.sin(t * .2 + i) * 30, w), y = mod(R() * h - t * (6 + R() * 14), h), r = .8 + R() * 1.8;
    c.fillStyle = `rgba(${rgb},${a * (.3 + .7 * Math.abs(Math.sin(t * .8 + i * 1.7)))})`; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  }
  c.restore();
}

const PAL = [[255, 205, 100], [255, 150, 60], [255, 95, 150], [120, 205, 255], [255, 255, 255], [190, 130, 255], [140, 255, 190]];
export class Fireworks {
  constructor(w, h, fx) { this.w = w; this.h = h; this.fx = fx; this.r = []; this.p = []; this.flash = 0; this.fp = null; this.sc = clamp(Math.min(w, h) / 650, .55, 1.5); }
  launch(tx, ty, kind) {
    this.r.push({ x0: tx + (Math.random() - .5) * this.w * .08, tx, ty, t: 0, dur: .8 + Math.random() * .35, kind: kind ?? (Math.random() * 4) | 0, hist: [] });
    this.fx.audio && this.fx.audio.whoosh();
  }
  sparkle(x, y, n = 26) {
    for (let i = 0; i < n; i++) { const a = Math.random() * TAU, s = 30 + Math.random() * 90 * this.sc; this.p.push({ x, y, px: x, py: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 20, l: .8 + Math.random() * .8, m: 1.4, col: [255, 215, 120], g: 60, dr: .96, tw: 0 }); }
  }
  burst(x, y, kind) {
    const c1 = PAL[(Math.random() * PAL.length) | 0], c2 = PAL[(Math.random() * PAL.length) | 0], sc = this.sc;
    const n = kind === 2 ? 70 : 110, gold = [255, 200, 95];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU + Math.random() * .1; let s, g = 70, l = 1.5 + Math.random() * .8, col = i % 3 ? c1 : c2, dr = .975, tw = 0;
      if (kind === 0) s = (60 + Math.random() * 140) * sc;
      else if (kind === 1) { s = 175 * sc; col = c1; }
      else if (kind === 2) { s = (50 + Math.random() * 110) * sc; col = gold; g = 120; l = 2.4 + Math.random(); dr = .985; }
      else { s = (40 + Math.random() * 150) * sc; tw = 1; l = 1.2 + Math.random(); }
      this.p.push({ x, y, px: x, py: y, vx: Math.cos(a) * s, vy: Math.sin(a) * s, l, m: l, col, g, dr, tw });
    }
    this.flash = Math.min(.9, this.flash + .35); this.fp = { x, y, col: c1 };
    this.fx.audio && this.fx.audio.boom(kind === 3);
  }
  update(dt) {
    for (let i = this.r.length - 1; i >= 0; i--) {
      const r = this.r[i]; r.t += dt; const k = clamp(r.t / r.dur), e = 1 - (1 - k) * (1 - k);
      const x = lerp(r.x0, r.tx, e) + Math.sin(r.t * 25) * 1.5, y = lerp(this.h + 12, r.ty, e);
      r.hist.push([x, y]); if (r.hist.length > 12) r.hist.shift();
      if (k >= 1) { this.burst(r.tx, r.ty, r.kind); this.r.splice(i, 1); }
    }
    for (let i = this.p.length - 1; i >= 0; i--) {
      const q = this.p[i]; q.l -= dt; if (q.l <= 0) { this.p.splice(i, 1); continue; }
      q.px = q.x; q.py = q.y; q.vy += q.g * dt; q.vx *= Math.pow(q.dr, dt * 60); q.vy *= Math.pow(q.dr, dt * 60);
      q.x += q.vx * dt; q.y += q.vy * dt;
    }
    this.flash = Math.max(0, this.flash - dt * 1.6);
  }
  draw(c) {
    c.save(); c.globalCompositeOperation = 'lighter'; c.lineCap = 'round';
    for (const r of this.r) {
      for (let i = 1; i < r.hist.length; i++) { c.strokeStyle = `rgba(255,210,130,${i / r.hist.length * .7})`; c.lineWidth = 2; c.beginPath(); c.moveTo(r.hist[i - 1][0], r.hist[i - 1][1]); c.lineTo(r.hist[i][0], r.hist[i][1]); c.stroke(); }
    }
    for (const q of this.p) {
      let a = clamp(q.l / q.m); if (q.tw) a *= Math.random() < .5 ? 1 : .25;
      c.strokeStyle = `rgba(${q.col[0]},${q.col[1]},${q.col[2]},${a})`; c.lineWidth = 1 + a * 1.6;
      c.beginPath(); c.moveTo(q.px, q.py); c.lineTo(q.x, q.y); c.stroke();
    }
    c.restore();
    if (this.fp && this.flash > 0.01) glow(c, this.fp.x, this.fp.y, Math.min(this.w, this.h) * .7, this.flash * .35, 'warm');
  }
}
