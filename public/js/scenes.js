import { TAU, clamp, lerp, eio, eo, ei, sm, mod, mk, nz, glow, flame, diya, stars, mkStars, motes, Fireworks } from './fx.js';

/* ───────── Scene 1 · The First Flame ───────── */
export function scene1(w, h, fx) {
  const cx = w / 2, U = Math.min(w, h * 1.1), d = U * .36, dy = h * .6;
  const embers = []; let cued = false, last = 0;
  return {
    draw(c, t, dt) {
      c.fillStyle = '#030204'; c.fillRect(0, 0, w, h);
      const lit = eio((t - 3.5) / 2.8), wick = { x: cx + d * .012, y: dy - d * .1 };
      const gg = c.createLinearGradient(0, dy + d * .3, 0, h);
      gg.addColorStop(0, `rgb(${30 + lit * 70 | 0},${16 + lit * 34 | 0},${10 + lit * 12 | 0})`); gg.addColorStop(1, '#030204');
      c.fillStyle = gg; c.fillRect(0, dy + d * .3, w, h);
      glow(c, cx, dy + d * .32, U * .9, .5 * lit, 'warm', .22);
      glow(c, cx, wick.y, U * (.15 + .8 * lit), .55 * lit, 'warm');
      glow(c, cx, wick.y, U * .35 * lit, .8 * lit, 'gold');
      diya(c, cx, dy, d, lit);
      // the descending spark
      if (t > .6 && t < 3.6) {
        const f = (p) => ({ x: cx + Math.sin(p * 11) * U * .07 * (1 - p), y: lerp(-30, wick.y, p * p) });
        const p = clamp((t - .8) / 2.7);
        for (let k = 0; k < 18; k++) { const pp = p - k * .014; if (pp < 0) continue; const q = f(pp); glow(c, q.x, q.y, U * .02 * (1 - k / 20) + 2, (1 - k / 18) * .9, 'white'); }
        const q = f(p); glow(c, q.x, q.y, U * .06, 1, 'gold'); glow(c, q.x, q.y, U * .018, 1, 'white');
      }
      if (t > 3.45 && t < 4.4) { const k = (t - 3.45) / .95; glow(c, wick.x, wick.y, U * (.1 + .6 * k), (1 - k) * .9, 'white'); }
      if (t >= 3.4 && !cued) { cued = true; fx.audio && fx.audio.ignite(); }
      flame(c, wick.x, wick.y + 1, d * .62 * lit, t, 1);
      // embers
      if (lit > .3 && Math.random() < dt * 22) embers.push({ x: wick.x + (Math.random() - .5) * d * .1, y: wick.y - d * .3, vy: 25 + Math.random() * 55, a: 0, l: 0, m: 2 + Math.random() * 3, ph: Math.random() * 9 });
      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i]; e.l += dt; if (e.l > e.m) { embers.splice(i, 1); continue; }
        e.y -= e.vy * dt; e.x += nz(e.l * 2 + e.ph) * 24 * dt;
        glow(c, e.x, e.y, 5 + 3 * Math.sin(e.l * 9 + e.ph), (1 - e.l / e.m) * .9, 'gold');
      }
      motes(c, w, h, t, 40, '255,190,110', 8, .5 * lit);
      const b = sm(6.6, 9, t);
      if (b > 0) { glow(c, cx, wick.y, Math.max(w, h) * (.3 + 1.7 * b), b, 'white'); c.fillStyle = `rgba(255,205,120,${b * .55})`; c.fillRect(0, 0, w, h); }
    },
  };
}

/* ───────── Scene 2 · The Homecoming (Ayodhya) ───────── */
function shikhara(c, cx, by, W, H, col, lit, t) {
  c.fillStyle = col;
  c.fillRect(cx - W * .62, by - H * .1, W * 1.24, H * .1);
  c.fillRect(cx - W * .5, by - H * .3, W, H * .2);
  c.fillRect(cx - W * .56, by - H * .32, W * 1.12, H * .03);
  c.beginPath(); c.moveTo(cx - W * .34, by - H * .3);
  c.bezierCurveTo(cx - W * .38, by - H * .6, cx - W * .21, by - H * .86, cx, by - H * .93);
  c.bezierCurveTo(cx + W * .21, by - H * .86, cx + W * .38, by - H * .6, cx + W * .34, by - H * .3); c.fill();
  for (const s of [-1, 1]) { // side spires
    c.beginPath(); c.moveTo(cx + s * W * .2, by - H * .3);
    c.bezierCurveTo(cx + s * W * .5, by - H * .42, cx + s * W * .46, by - H * .58, cx + s * W * .38, by - H * .62);
    c.bezierCurveTo(cx + s * W * .3, by - H * .55, cx + s * W * .22, by - H * .45, cx + s * W * .2, by - H * .3); c.fill();
  }
  c.beginPath(); c.ellipse(cx, by - H * .93, W * .1, H * .025, 0, 0, TAU); c.fill();
  c.fillRect(cx - W * .012, by - H * 1.03, W * .024, H * .1);
  c.beginPath(); c.arc(cx, by - H * 1.04, W * .03, 0, TAU); c.fill();
  c.beginPath(); c.moveTo(cx + W * .012, by - H * 1.07); c.lineTo(cx + W * .2, by - H * 1.03); c.lineTo(cx + W * .012, by - H * 1.0); c.fill(); // flag
  c.strokeStyle = 'rgba(255,170,90,.09)'; c.lineWidth = 1;
  for (let i = 1; i < 11; i++) { const y = by - H * (.3 + i * .058), hw = W * .36 * Math.pow(1 - i / 11.5, .55); c.beginPath(); c.moveTo(cx - hw, y); c.lineTo(cx + hw, y); c.stroke(); }
  if (lit > 0) { // lit arches in mandapa
    for (let i = -2; i <= 2; i++) {
      const ax = cx + i * W * .17, ah = H * .11, aw = W * .055, f = .75 + .25 * nz(t * 6 + i * 3);
      c.fillStyle = `rgba(255,${170 + 30 * f | 0},80,${lit * f})`; c.beginPath(); c.rect(ax - aw, by - H * .26, aw * 2, ah); c.arc(ax, by - H * .26, aw, Math.PI, 0); c.fill();
    }
  }
}
export function scene2(w, h, fx) {
  const hz = h * .54, U = Math.min(w, h * .95), cx = w / 2, R = mk(7), st = mkStars(150, w, hz * .85, 4);
  const TH = Math.min(U * .6, hz * .78), TW = TH * .55;
  const lamps = [];
  for (let i = 0; i < 270; i++) { const dep = Math.pow(R(), 1.5), y = hz + h * .035 + dep * (h - hz - h * .06), sc = .4 + dep * 1.5, x = (R() * 1.3 - .15) * w; lamps.push({ x, y, sc, ph: R() * TAU, on: 1.5 + Math.hypot((x - cx) / w * 1.5, (y - hz) / h) * 8 + R(), dr: (R() - .5) * 8 * sc }); }
  lamps.sort((a, b) => a.y - b.y);
  const bank = Array.from({ length: 100 }, (_, i) => ({ x: i / 99 * w, on: 1.8 + Math.abs(i / 99 - .5) * 6 + R() * .6, ph: R() * TAU }));
  const petals = Array.from({ length: 70 }, () => ({ x: R(), y: R(), vx: (R() - .5) * 30, vy: 28 + R() * 50, s: 3 + R() * 4, ph: R() * TAU, k: R() }));
  const far = []; for (let x = -40; x < w + 60; x += U * .085) far.push({ x, hh: U * (.05 + R() * .1), ww: U * (.04 + R() * .04), dome: R() > .5 });
  let cued = false;
  function skyline(c, t, lit, refl) {
    c.fillStyle = refl ? '#1c1530' : '#171230';
    for (const b of far) { c.fillRect(b.x, hz - b.hh, b.ww, b.hh); if (b.dome) { c.beginPath(); c.arc(b.x + b.ww / 2, hz - b.hh, b.ww * .5, Math.PI, 0); c.fill(); c.fillRect(b.x + b.ww / 2 - 1, hz - b.hh - b.ww * .8, 2, b.ww * .4); } }
    const g = c.createLinearGradient(0, hz, 0, hz - TH);
    g.addColorStop(0, '#3d1d12'); g.addColorStop(.5, '#170c16'); g.addColorStop(1, '#0a0612');
    const dark = '#0a0612';
    // palace wall
    c.fillStyle = g; c.fillRect(0, hz - U * .075, w, U * .075);
    c.fillStyle = dark; for (let x = 0; x < w; x += U * .03) c.fillRect(x, hz - U * .075 - U * .012, U * .018, U * .012);
    for (let x = U * .02; x < w; x += U * .055) { const f = .7 + .3 * nz(t * 5 + x); c.fillStyle = `rgba(255,${160 + 40 * f | 0},70,${lit * f * .85})`; c.beginPath(); c.rect(x, hz - U * .055, U * .016, U * .02); c.arc(x + U * .008, hz - U * .055, U * .008, Math.PI, 0); c.fill(); }
    for (const [o, s] of [[-.98, .42], [-.52, .6], [.52, .6], [.98, .42]]) shikhara(c, cx + o * TW * 1.35, hz - U * .005, TW * s, TH * s, g, lit, t);
    shikhara(c, cx, hz - U * .005, TW, TH, g, lit, t);
  }
  return {
    draw(c, t, dt) {
      if (!cued && t > 1.5) { cued = true; fx.audio && fx.audio.conch(); }
      const ln = sm(1.5, 11, t);
      c.save(); const zs = 1 + .06 * sm(0, 14, t); c.translate(cx, h * .62); c.scale(zs, zs); c.translate(-cx, -h * .62);
      const sg = c.createLinearGradient(0, 0, 0, hz);
      sg.addColorStop(0, '#02030b'); sg.addColorStop(.5, '#0c1236'); sg.addColorStop(.85, '#2c1a3e'); sg.addColorStop(1, '#6b3328');
      c.fillStyle = sg; c.fillRect(-w * .1, -h * .1, w * 1.2, hz + h * .1);
      stars(c, st, t, 1 - .5 * ln);
      glow(c, cx, hz, U * 1.3, .55 * ln, 'gold', .55);
      const rg = c.createLinearGradient(0, hz, 0, h); rg.addColorStop(0, '#231a3a'); rg.addColorStop(.3, '#0d0d24'); rg.addColorStop(1, '#03040b');
      c.fillStyle = rg; c.fillRect(-w * .1, hz, w * 1.2, h);
      c.save(); c.beginPath(); c.rect(0, hz, w, h - hz); c.clip(); c.translate(0, 2 * hz); c.scale(1, -1); c.globalAlpha = .28; skyline(c, t, ln, true); c.restore();
      glow(c, cx, hz + h * .06, U * 1.1, .38 * ln, 'gold', .3);
      for (let i = 0; i < 46; i++) { const y = hz + Math.pow(i / 46, 1.7) * (h - hz); c.fillStyle = `rgba(6,8,22,${.28 + .2 * Math.sin(i * 3.1 + t)})`; c.fillRect(0, y + Math.sin(t * .8 + i) * 2, w, 1.5 + i * .09); }
      skyline(c, t, ln, false);
      c.save(); c.globalCompositeOperation = 'lighter';
      for (const b of bank) { const o = sm(b.on, b.on + 1, t); if (o <= 0) continue; glow(c, b.x, hz + 2, 9, o * (.7 + .3 * nz(t * 6 + b.ph * 4)), 'warm'); }
      for (const l of lamps) {
        const o = sm(l.on, l.on + 1.3, t); if (o <= 0) continue;
        const x = l.x + Math.sin(t * .4 + l.ph) * l.dr, y = l.y + Math.sin(t * .7 + l.ph) * 1.2 * l.sc, f = .8 + .2 * nz(t * 7 + l.ph * 5);
        glow(c, x, y - 2 * l.sc, 17 * l.sc * f, .85 * o, 'warm');
        glow(c, x, y + 9 * l.sc, 5 * l.sc, .3 * o * f, 'gold', 2.4);
        c.fillStyle = `rgba(255,244,200,${o})`; c.fillRect(x - l.sc, y - 3 * l.sc, 2 * l.sc, 2.5 * l.sc);
      }
      c.restore();
      c.restore();
      // marigold petals (Ram, Sita & Lakshman return)
      const pa = sm(4.5, 7, t);
      if (pa > 0) for (const p of petals) {
        const x = mod(p.x * w + t * p.vx + Math.sin(t * 1.3 + p.ph) * 24, w), y = mod(p.y * h + t * p.vy, h);
        c.save(); c.translate(x, y); c.rotate(t * (1 + p.k) + p.ph); c.globalAlpha = pa * (.55 + .4 * p.k);
        c.fillStyle = p.k > .5 ? '#ffb01f' : '#ff7a12'; c.beginPath(); c.ellipse(0, 0, p.s, p.s * .5, 0, 0, TAU); c.fill(); c.restore();
      }
      const vg = c.createRadialGradient(cx, h * .5, Math.min(w, h) * .4, cx, h * .5, Math.max(w, h) * .8);
      vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.6)'); c.fillStyle = vg; c.fillRect(0, 0, w, h);
    },
  };
}

/* ───────── Scene 3 · The Lotus & Blessings ───────── */
export function scene3(w, h, fx) {
  const cx = w / 2, U = Math.min(w, h * 1.05), R0 = U * .36, by = h * .62;
  const rows = [
    { n: 9, sp: 80, L: 1, W: .3, s: 1.0, c: ['#fff1e8', '#f4a3c0', '#cf3170'] },
    { n: 8, sp: 62, L: .93, W: .32, s: 1.7, c: ['#fff4ee', '#f9b4cc', '#dc4880'] },
    { n: 6, sp: 42, L: .84, W: .34, s: 2.4, c: ['#fff7f2', '#fcc5d7', '#e8639a'] },
    { n: 4, sp: 20, L: .72, W: .36, s: 3.1, c: ['#fffaf5', '#ffd3e0', '#f07ba8'] },
  ];
  const coins = Array.from({ length: 38 }, (_, i) => ({ x: mod(i * .618, 1), v: 45 + (i * 37) % 55, o: (i * 83) % 997, r: U * .016 * (.7 + (i % 4) * .22), k: 1 + (i % 3), ph: i }));
  let cued = false, chimeAt = 5;
  function petal(c, len, wd) { c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-wd, -len * .3, -wd * .85, -len * .8, 0, -len); c.bezierCurveTo(wd * .85, -len * .8, wd, -len * .3, 0, 0); c.closePath(); }
  return {
    draw(c, t, dt) {
      const bg = c.createRadialGradient(cx, by - R0 * .4, 0, cx, by - R0 * .4, Math.max(w, h) * .8);
      bg.addColorStop(0, '#4a1130'); bg.addColorStop(.45, '#1c0618'); bg.addColorStop(1, '#050108'); c.fillStyle = bg; c.fillRect(0, 0, w, h);
      const wg = c.createLinearGradient(0, by, 0, h); wg.addColorStop(0, '#190a1d'); wg.addColorStop(1, '#030106'); c.fillStyle = wg; c.fillRect(0, by, w, h - by);
      const open = (i) => eio((t - rows[i].s) / 2.6), o0 = open(0), all = open(3);
      glow(c, cx, by - R0 * .3, R0 * (1 + 1.4 * all), .7 * Math.max(sm(0, 1.6, t) * .5, all), 'gold');
      glow(c, cx, by + U * .04, U * .9, .35 * all, 'pink', .22);
      for (let i = 0; i < 4; i++) { const ph = mod(t * .22 + i / 4, 1), rx = U * (.12 + .55 * ph); c.strokeStyle = `rgba(255,190,120,${(1 - ph) * .3 * sm(1, 3, t)})`; c.lineWidth = 1.4; c.beginPath(); c.ellipse(cx, by + U * .03, rx, rx * .11, 0, 0, TAU); c.stroke(); }
      for (const s of [-1, 1]) { c.fillStyle = '#0a2218'; c.beginPath(); c.ellipse(cx + s * U * .52, by + U * .05, U * .2, U * .04, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(120,200,140,.25)'; c.stroke(); }
      if (all > 0) { // god-rays
        c.save(); c.globalCompositeOperation = 'lighter';
        for (let i = 0; i < 28; i++) { const a = i / 28 * TAU + t * .05 + Math.sin(i * 2.3) * .05, L = U * 1.3, wd = .028 + .02 * Math.sin(i * 1.7 + t * .6); c.fillStyle = `rgba(255,205,130,${.06 * all})`; c.beginPath(); c.moveTo(cx, by - R0 * .3); c.lineTo(cx + Math.cos(a - wd) * L, by - R0 * .3 + Math.sin(a - wd) * L); c.lineTo(cx + Math.cos(a + wd) * L, by - R0 * .3 + Math.sin(a + wd) * L); c.fill(); }
        c.restore();
      }
      // lotus: back row → front row
      for (let r = 0; r < 4; r++) {
        const row = rows[r], op = open(r);
        for (let i = 0; i < row.n; i++) {
          const f = row.n === 1 ? 0 : (i / (row.n - 1)) * 2 - 1, ang = f * row.sp * op * Math.PI / 180, len = R0 * row.L * (.82 + .18 * op), wd = R0 * row.W * (.5 + .5 * op);
          c.save(); c.translate(cx, by); c.rotate(ang + Math.sin(t * .8 + i + r) * .008);
          const g = c.createLinearGradient(0, 0, 0, -len); g.addColorStop(0, row.c[0]); g.addColorStop(.55, row.c[1]); g.addColorStop(1, row.c[2]);
          c.fillStyle = g; petal(c, len, wd); c.fill();
          c.strokeStyle = `rgba(255,214,150,${.35 + .3 * op})`; c.lineWidth = 1.2; c.stroke();
          c.strokeStyle = 'rgba(180,40,90,.18)'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, -len * .1); c.lineTo(0, -len * .85); c.stroke();
          c.restore();
        }
        glow(c, cx, by - R0 * .15, R0 * .6, .22 * op, 'gold');
      }
      glow(c, cx, by - R0 * .12 - R0 * .12 * all, R0 * .5 * all, .95 * all, 'white');
      if (!cued && t > 1.3) { cued = true; fx.audio && fx.audio.bloom(); }
      // coins of prosperity
      const ca = sm(4, 5.5, t);
      if (ca > 0) {
        c.save();
        for (const k of coins) {
          const y = mod((t - 4) * k.v + k.o, h + 80) - 40, x = k.x * w + Math.sin(t * k.k * .6 + k.ph) * 18, cs = Math.cos(t * (2 + k.k) + k.ph), rx = Math.max(.6, k.r * Math.abs(cs));
          glow(c, x, y, k.r * 3.5, .3 * ca, 'gold');
          c.globalAlpha = ca; const g = c.createLinearGradient(x - rx, y - k.r, x + rx, y + k.r);
          g.addColorStop(0, '#fff0a0'); g.addColorStop(.5, '#e8ad2b'); g.addColorStop(1, '#a8680c'); c.fillStyle = g;
          c.beginPath(); c.ellipse(x, y, rx, k.r, 0, 0, TAU); c.fill();
          c.strokeStyle = '#8a540a'; c.lineWidth = 1; c.beginPath(); c.ellipse(x, y, rx * .72, k.r * .72, 0, 0, TAU); c.stroke();
          if (Math.abs(cs) < .12) glow(c, x, y, k.r * 5, .9 * ca, 'white');
        }
        c.restore();
        if (fx.audio && t > chimeAt) { fx.audio.coin(); chimeAt = t + .5 + Math.random() * 1.3; }
      }
      motes(c, w, h, t, 60, '255,205,140', 12, .55);
    },
  };
}

/* ───────── Scene 4 · Across Generations (Rangoli) ───────── */
export function scene4(w, h, fx) {
  const cx = w / 2, cy = h * .5, U = Math.min(w, h), R = U * .29, R2 = mk(11);
  const bits = Array.from({ length: 110 }, () => { const a = R2() * TAU, r = R * (1.05 + R2() * .55); return { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r * .98, s: 3 + R2() * 4, a: R2() * TAU, k: R2() }; });
  function pet(c, len, wd) { c.beginPath(); c.moveTo(0, 0); c.bezierCurveTo(-wd, -len * .35, -wd * .7, -len * .85, 0, -len); c.bezierCurveTo(wd * .7, -len * .85, wd, -len * .35, 0, 0); c.closePath(); }
  function ring(c, p, n, rad, len, wd, cols, rot, line = 'rgba(255,255,255,.55)') {
    for (let i = 0; i < n; i++) {
      const e = clamp(p * 1.7 - i / n * .7); if (e <= 0) continue;
      c.save(); c.translate(cx, cy); c.rotate(i / n * TAU + rot); c.translate(0, -rad * e);
      c.fillStyle = cols[i % cols.length]; pet(c, len * e, wd * e); c.fill(); c.strokeStyle = line; c.lineWidth = 1.2; c.stroke(); c.restore();
    }
  }
  function dots(c, p, n, rad, r, col) { c.fillStyle = col; for (let i = 0; i < n; i++) { const e = clamp(p * 1.5 - i / n * .5); if (e <= 0) continue; const a = i / n * TAU; c.beginPath(); c.arc(cx + Math.cos(a) * rad, cy + Math.sin(a) * rad, r * e, 0, TAU); c.fill(); } }
  const dsz = U * .075;
  return {
    draw(c, t, dt) {
      c.fillStyle = '#120806'; c.fillRect(0, 0, w, h);
      c.save(); const zs = 1 + .05 * sm(0, 9, t); c.translate(cx, cy); c.scale(zs, zs); c.translate(-cx, -cy);
      const fl = c.createRadialGradient(cx, cy, 0, cx, cy, Math.max(w, h) * .75); fl.addColorStop(0, '#3a1c10'); fl.addColorStop(1, '#0b0504'); c.fillStyle = fl; c.fillRect(-w, -h, w * 3, h * 3);
      const rev = (s, d) => eo(sm(s, s + d, t)), rot = t * .01;
      dots(c, rev(.2, 2.5), 72, R * 1.0, 3, '#fff2d6');
      for (let i = 0; i < 36; i++) { const e = rev(.4, 2.5), a = i / 36 * TAU, ea = clamp(e * 1.5 - i / 36 * .5); if (ea > 0) { c.strokeStyle = `rgba(255,236,200,${ea * .8})`; c.lineWidth = 1.6; c.beginPath(); c.arc(cx + Math.cos(a + TAU / 72) * R * .92, cy + Math.sin(a + TAU / 72) * R * .92, R * .075, a + TAU / 4 - 1.2, a + TAU / 4 + 1.2); c.stroke(); } }
      ring(c, rev(.8, 2.2), 24, R * .5, R * .5, R * .1, ['#e8318a', '#ff8a1f'], rot);
      ring(c, rev(1.4, 2.4), 12, R * .22, R * .55, R * .15, ['#14b8a6', '#fff2d6'], -rot);
      ring(c, rev(2, 2.2), 16, R * .1, R * .36, R * .11, ['#ffb81f', '#d9267d'], rot * 2);
      ring(c, rev(2.6, 2), 8, R * .02, R * .26, R * .09, ['#ff5a1f', '#fff'], -rot * 2);
      dots(c, rev(2.8, 1.4), 48, R * .62, 2.4, '#ffd24d');
      const ce = rev(3.2, 1.2); if (ce > 0) { c.fillStyle = '#fff6e2'; c.beginPath(); c.arc(cx, cy, R * .07 * ce, 0, TAU); c.fill(); c.fillStyle = '#d9267d'; c.beginPath(); c.arc(cx, cy, R * .035 * ce, 0, TAU); c.fill(); }
      const pa = sm(2.5, 4.5, t);
      for (const b of bits) { c.save(); c.translate(b.x, b.y); c.rotate(b.a); c.globalAlpha = pa; c.fillStyle = b.k > .5 ? '#ffae1a' : '#ff6a10'; c.beginPath(); c.ellipse(0, 0, b.s, b.s * .5, 0, 0, TAU); c.fill(); c.restore(); }
      // warm light on the rangoli
      const mx = sm(4, 8, t);
      glow(c, cx, cy, R * 2.2, .4 * mx, 'warm');
      const N = 12;
      for (let i = 0; i < N; i++) {
        const a = i / N * TAU - Math.PI / 2, x = cx + Math.cos(a) * R * 1.24, y = cy + Math.sin(a) * R * 1.24, on = sm(3.6 + i * .28, 4.5 + i * .28, t);
        glow(c, x, y, U * .26 * on, .55 * on, 'warm');
        c.fillStyle = '#7a3418'; c.beginPath(); c.arc(x, y, dsz * .5, 0, TAU); c.fill();
        c.fillStyle = '#c0682e'; c.beginPath(); c.arc(x, y, dsz * .42, 0, TAU); c.fill();
        c.fillStyle = '#220e06'; c.beginPath(); c.arc(x, y, dsz * .3, 0, TAU); c.fill();
        if (on > 0) { flame(c, x, y, dsz * 1.2 * on, t, i * 2.1); }
      }
      c.restore();
      motes(c, w, h, t, 50, '255,190,110', 14, .45 * mx);
      const vg = c.createRadialGradient(cx, cy, U * .45, cx, cy, Math.max(w, h) * .75); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.65)'); c.fillStyle = vg; c.fillRect(0, 0, w, h);
    },
  };
}

/* ───────── Scene 5 · City of Lights ───────── */
export function scene5(w, h, fx) {
  const R = mk(21), U = Math.min(w, h * 1.2), base = h * .86, st = mkStars(120, w, h * .5, 9), fw = new Fireworks(w, h, fx);
  const layers = [0, 1, 2].map((l) => {
    const arr = []; let x = -20; const sc = [.5, .75, 1][l];
    while (x < w + 20) {
      const bw = U * (.06 + R() * .07) * (.8 + sc * .4), bh = h * (.12 + R() * .2) * (.6 + sc * .6) + (l ? 0 : h * .06), top = base - bh;
      const wins = []; if (l > 0) { const cw = U * .016, gap = U * .028; for (let wx = x + gap * .5; wx < x + bw - cw; wx += gap) for (let wy = top + gap; wy < base - gap; wy += gap) if (R() < .62) wins.push({ x: wx, y: wy, w: cw, h: cw * 1.3, on: 1 + R() * 9, col: R() < .8 ? '255,200,110' : '255,236,180', ph: R() * 9 }); }
      arr.push({ x, bw, top, wins, roof: l === 2 && R() < .7 }); x += bw + U * .004;
    }
    return { arr, col: ['#12112b', '#0b0a1d', '#06050f'][l] };
  });
  let nextAuto = 1.2;
  return {
    pointer(x, y) { fw.launch(x, Math.min(y, h * .6)); },
    draw(c, t, dt) {
      const sg = c.createLinearGradient(0, 0, 0, base); sg.addColorStop(0, '#02030a'); sg.addColorStop(.55, '#0b1030'); sg.addColorStop(.9, '#3a1d3c'); sg.addColorStop(1, '#8a4328');
      c.fillStyle = sg; c.fillRect(0, 0, w, h);
      stars(c, st, t, .8);
      if (t > nextAuto + 3) nextAuto = t;
      while (t > nextAuto) { fw.launch(w * (.12 + R() * .76), h * (.1 + R() * .3)); nextAuto += .5 + R() * .85; }
      fw.update(dt); fw.draw(c);
      c.save(); const rise = 1 - eio(t / 6); c.translate(0, h * .14 * rise); const zs = 1 + .06 * rise; c.translate(w / 2, base); c.scale(zs, zs); c.translate(-w / 2, -base);
      glow(c, w / 2, base - h * .05, Math.max(w, h) * .9, .5, 'warm', .5);
      for (let l = 0; l < 3; l++) {
        const L = layers[l]; c.fillStyle = L.col; c.fillRect(-w * .2, base - 2, w * 1.4, h);
        for (const b of L.arr) {
          c.fillStyle = L.col; c.fillRect(b.x, b.top, b.bw, base - b.top);
          for (const wd of b.wins) { const o = sm(wd.on, wd.on + 1, t); if (o <= 0) continue; c.fillStyle = `rgba(${wd.col},${o * (.55 + .35 * nz(t * 3 + wd.ph))})`; c.fillRect(wd.x, wd.y, wd.w, wd.h); }
          if (b.roof) { const o = sm(3, 5, t); c.save(); c.globalCompositeOperation = 'lighter'; for (let x = b.x + 3; x < b.x + b.bw - 2; x += 8) glow(c, x, b.top - 3, 7, o * (.6 + .4 * nz(t * 6 + x)), 'warm'); c.restore(); }
        }
      }
      c.restore();
      const vg = c.createRadialGradient(w / 2, h * .55, U * .5, w / 2, h * .55, Math.max(w, h) * .85); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.5)'); c.fillStyle = vg; c.fillRect(0, 0, w, h);
    },
  };
}

/* ───────── Scene 6 · A Wish For You ───────── */
export function scene6(w, h, fx) {
  const R = mk(31), cx = w / 2, U = Math.min(w, h * 1.2), st = mkStars(170, w, h, 13), fw = new Fireworks(w, h, fx);
  const short = h < 500, dd = short ? h * .11 : Math.min(w * .3, h * .17, 170), dyy = short ? h * .74 : h * (h > w ? .6 : .68), dx = short ? w * .1 : cx, lanterns = []; let nextL = .6, nextF = 2.5;
  function spawn(x, y) { lanterns.push({ x, y, vy: 22 + Math.random() * 22, s: U * (.028 + Math.random() * .02), ph: Math.random() * 9, l: 0 }); }
  return {
    pointer(x, y) { spawn(x, y); fw.sparkle(x, y); fx.audio && fx.audio.chime(); },
    draw(c, t, dt) {
      const sg = c.createLinearGradient(0, 0, 0, h); sg.addColorStop(0, '#02030a'); sg.addColorStop(.6, '#0a0e2b'); sg.addColorStop(1, '#2b1730'); c.fillStyle = sg; c.fillRect(0, 0, w, h);
      stars(c, st, t, 1);
      glow(c, cx, h * .4, U * 1.1, .22, 'pink', .8); glow(c, dx, dyy, U * 1.1, .55, 'warm', .6);
      if (t > nextF) { fw.launch(w * (.15 + R() * .7), h * (.08 + R() * .22)); nextF = t + 2.4 + R() * 2.2; }
      fw.update(dt); fw.draw(c);
      if (t > nextL) { spawn(w * (.08 + R() * .84), h + 30); nextL = t + 1.4 + R() * 1.6; }
      for (let i = lanterns.length - 1; i >= 0; i--) {
        const q = lanterns[i]; q.l += dt; q.y -= q.vy * dt; const x = q.x + Math.sin(q.l * .7 + q.ph) * 14;
        if (q.y < -60) { lanterns.splice(i, 1); continue; }
        const s = q.s * (1 - q.l * .008), f = .85 + .15 * nz(q.l * 5 + q.ph), a = clamp(q.l / 1) * clamp((q.y + 60) / 200);
        glow(c, x, q.y, s * 4.2, .55 * a * f, 'warm');
        c.save(); c.globalAlpha = a; const g = c.createLinearGradient(0, q.y - s, 0, q.y + s * 1.1); g.addColorStop(0, '#d8641a'); g.addColorStop(.6, '#ffc062'); g.addColorStop(1, '#ffe4a0'); c.fillStyle = g;
        c.beginPath(); c.moveTo(x - s * .55, q.y - s * .7); c.quadraticCurveTo(x, q.y - s * 1.05, x + s * .55, q.y - s * .7); c.lineTo(x + s * .38, q.y + s * .8); c.lineTo(x - s * .38, q.y + s * .8); c.closePath(); c.fill(); c.restore();
        glow(c, x, q.y + s * .6, s * 1.2, .9 * a * f, 'white');
      }
      const d0 = diya(c, dx, dyy, dd, 1);
      flame(c, d0.x, d0.y + 1, dd * .7, t, 4);
      glow(c, d0.x, d0.y - dd * .2, dd * 1.2, .5, 'gold');
      motes(c, w, h, t, 45, '255,200,130', 17, .5);
    },
  };
}

export const CHAPTERS = [
  { id: 1, roman: 'I', name: 'The First Flame', dur: 10, make: scene1, lines: [{ at: 1.2, d: 4, t: 'Every light begins with a single spark…' }, { at: 5.6, d: 3.6, t: 'and one small flame can end the darkest night.' }] },
  { id: 2, roman: 'II', name: 'The Homecoming', dur: 15, make: scene2, lines: [{ at: 1.6, d: 5.2, t: 'After fourteen years in exile, Shri Ram returned to Ayodhya.' }, { at: 7.6, d: 5.6, t: 'And a kingdom lit a million lamps to welcome him home.' }] },
  { id: 3, roman: 'III', name: 'The Blessing', dur: 13, make: scene3, lines: [{ at: 1.8, d: 4.2, t: 'Maa Lakshmi arrives on a blooming lotus…' }, { at: 6.5, d: 5.8, t: 'May every home be blessed with abundance, happiness and prosperity.' }] },
  { id: 4, roman: 'IV', name: 'Across Generations', dur: 11, make: scene4, lines: [{ at: 1.4, d: 4.6, t: 'In every home, hands still draw the same rangoli…' }, { at: 6.4, d: 4.2, t: 'and light the same diyas their grandmothers did.' }] },
  { id: 5, roman: 'V', name: 'The City of Lights', dur: 12, make: scene5, hint: 'Tap anywhere to launch fireworks', lines: [{ at: 1.6, d: 5, t: 'Centuries may pass, but the light lives on in every heart.' }, { at: 7.2, d: 4.4, t: 'Tonight, the whole world glows together.' }] },
  { id: 6, roman: 'VI', name: 'A Wish For You', dur: Infinity, make: scene6, final: true, hint: 'Tap the sky to release a lantern', lines: [] },
];
