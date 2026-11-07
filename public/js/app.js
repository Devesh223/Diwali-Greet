import { CHAPTERS } from './scenes.js';
import { Sound } from './audio.js';
import { eio, clamp } from './fx.js';

const $ = (s) => document.querySelector(s);
const canvas = $('#stage'), ctx = canvas.getContext('2d');
const off = document.createElement('canvas'), octx = off.getContext('2d');
const audio = new Sound(), fx = { audio };
const FADE = 1.8;
const params = new URLSearchParams(location.search);
const clean = (v) => (v || '').replace(/[<>\u0000-\u001f]/g, '').trim().slice(0, 24);
let TO = clean(params.get('to')), FROM = clean(params.get('from'));

// timeline
const starts = []; { let s = 0; for (const c of CHAPTERS) { starts.push(s); s += c.dur; } }
let W = 0, H = 0, scenes = [], T = 0, playing = false, last = performance.now(), cur = -1, capKey = '';

function resize() {
  const dpr = Math.min(window.devicePixelRatio || 1, W0() < 700 ? 1.5 : 2);
  W = window.innerWidth; H = window.innerHeight;
  for (const cv of [canvas, off]) { cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); }
  canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0); octx.setTransform(dpr, 0, 0, dpr, 0, 0);
  scenes = CHAPTERS.map((c) => c.make(W, H, fx));
}
const W0 = () => window.innerWidth;
window.addEventListener('resize', () => { clearTimeout(resize.t); resize.t = setTimeout(resize, 150); });
resize();

// chapters nav
const nav = $('#chapters');
CHAPTERS.forEach((c, i) => { const b = document.createElement('button'); b.setAttribute('aria-label', `${c.roman}. ${c.name}`); b.title = c.name; b.innerHTML = '<i><b></b></i>'; b.onclick = () => jump(i); nav.append(b); });
const segs = [...nav.querySelectorAll('button')];

function jump(i) { T = starts[i] + .01; scenes[i] = CHAPTERS[i].make(W, H, fx); if (i > 0) scenes[i - 1] = CHAPTERS[i - 1].make(W, H, fx); capKey = ''; }
window.__seek = (s) => { T = s; capKey = ''; }; // debug / testing helper

function sceneAt(t) { let i = 0; while (i + 1 < starts.length && t >= starts[i + 1]) i++; return i; }

function frame(now) {
  const dt = Math.min(.05, (now - last) / 1000); last = now;
  if (playing) T += dt;
  const i = sceneAt(T), local = T - starts[i], ch = CHAPTERS[i];
  if (i !== cur) { onChapter(i); cur = i; }
  const fade = i > 0 ? clamp(local / FADE) : 1;
  if (fade < 1) {
    scenes[i - 1].draw(ctx, T - starts[i - 1], dt);
    octx.save(); octx.globalAlpha = 1; scenes[i].draw(octx, local, dt); octx.restore();
    ctx.save(); ctx.globalAlpha = eio(fade); ctx.drawImage(off, 0, 0, W, H); ctx.restore();
  } else scenes[i].draw(ctx, local, dt);
  // captions
  let key = '', text = '';
  for (let k = 0; k < ch.lines.length; k++) { const L = ch.lines[k]; if (local >= L.at && local < L.at + L.d) { key = i + ':' + k; text = L.t; } }
  if (key !== capKey) { capKey = key; const cap = $('#caption'); if (text) { cap.textContent = text; cap.classList.add('on'); } else cap.classList.remove('on'); }
  // progress
  segs.forEach((b, k) => { b.classList.toggle('done', k < i); const bar = b.querySelector('b'); bar.style.width = k === i ? (ch.dur === Infinity ? 100 : clamp(local / ch.dur) * 100) + '%' : ''; });
  requestAnimationFrame(frame);
}

function onChapter(i) {
  const ch = CHAPTERS[i];
  $('#chRoman').textContent = ch.roman; $('#chName').textContent = ch.name;
  audio.setScene(i);
  const hint = $('#hint'); hint.textContent = ch.hint || ''; hint.classList.remove('on');
  if (ch.hint) setTimeout(() => cur === i && hint.classList.add('on'), ch.final ? 9000 : 3500);
  const fin = $('#final'); fin.hidden = !ch.final; document.body.classList.toggle('final', !!ch.final);
  if (ch.final) { requestAnimationFrame(() => fin.classList.add('on')); $('#caption').classList.remove('on'); } else fin.classList.remove('on');
  $('#btnSkip').hidden = !!ch.final;
}

// pointer → scene interaction
canvas.addEventListener('pointerdown', (e) => { if (!playing) return; const s = scenes[cur]; if (s && s.pointer) s.pointer(e.clientX, e.clientY); });

// ---- gate & personalisation ----
function personalise() {
  if (TO) { $('#gTo').textContent = `A Diwali journey for ${TO}`; $('#fTo').textContent = `For ${TO}`; document.title = `A Diwali wish for ${TO} · The Journey of Light`; }
  if (FROM) { $('#gSub').textContent = `${FROM} lit this lamp for you. Press play and follow the light.`; $('#fFrom').textContent = `With love, ${FROM}`; }
  else $('#fFrom').textContent = '';
  const link = buildLink(TO, FROM), msg = shareText(FROM);
  $('#btnWa').href = `https://wa.me/?text=${encodeURIComponent(msg + ' ' + link)}`;
}
function buildLink(to, from) { const u = new URL(location.origin + location.pathname); if (to) u.searchParams.set('to', to); if (from) u.searchParams.set('from', from); return u.toString(); }
function shareText(from) { return `${from ? from + ' has sent you' : 'Sending you'} a Diwali journey of light 🪔✨ Open it with sound on:`; }
function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('on'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('on'), 2200); }
async function copy(text) { try { await navigator.clipboard.writeText(text); toast('Link copied ✨'); } catch { const i = $('#outLink'); i.select(); document.execCommand('copy'); toast('Link copied ✨'); } }
async function nativeShare(link, from) { if (navigator.share) { try { await navigator.share({ title: 'The Journey of Light', text: shareText(from), url: link }); } catch {} } else copy(link); }

async function begin(sound) {
  if (sound) { await audio.start(); } else { audio.muted = true; $('#btnMute').classList.add('off'); await audio.start(); }
  $('#gate').classList.add('out'); $('#hud').hidden = false; nav.hidden = false;
  playing = true; last = performance.now();
}
$('#btnBegin').onclick = () => begin(true);
$('#btnQuiet').onclick = () => begin(false);
$('#btnMute').onclick = (e) => { audio.setMuted(!audio.muted); e.currentTarget.classList.toggle('off', audio.muted); };
$('#btnSkip').onclick = () => jump(CHAPTERS.length - 1);
$('#btnReplay').onclick = () => { T = 0; scenes = CHAPTERS.map((c) => c.make(W, H, fx)); cur = -1; capKey = ''; $('#final').classList.remove('on'); };
$('#btnShare').onclick = () => nativeShare(buildLink(TO, FROM), FROM);

// modal
const modal = $('#modal'), inTo = $('#inTo'), inFrom = $('#inFrom'), out = $('#outLink');
function refreshModal() { const l = buildLink(clean(inTo.value), clean(inFrom.value)); out.value = l; $('#mWa').href = `https://wa.me/?text=${encodeURIComponent(shareText(clean(inFrom.value)) + ' ' + l)}`; }
function openModal() { inTo.value = ''; inFrom.value = FROM; refreshModal(); modal.hidden = false; setTimeout(() => inTo.focus(), 50); }
$('#btnSend').onclick = openModal; $('#btnPers').onclick = openModal; $('#mClose').onclick = () => (modal.hidden = true);
modal.addEventListener('pointerdown', (e) => { if (e.target === modal) modal.hidden = true; });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') modal.hidden = true; });
inTo.oninput = inFrom.oninput = refreshModal;
$('#mCopy').onclick = () => copy(out.value);
$('#mShare').onclick = () => nativeShare(out.value, clean(inFrom.value));
document.addEventListener('visibilitychange', () => { if (audio.ctx) document.hidden ? audio.ctx.suspend() : audio.ctx.resume(); last = performance.now(); });

personalise();
if (params.has('autoplay')) begin(false).then(() => { const s = parseFloat(params.get('t')); if (s) T = s; });
requestAnimationFrame(frame);
