// Fully procedural Indian-classical-flavoured soundtrack (Raag Yaman) — no audio files needed.
const SA = 261.63, hz = (s, o = 0) => SA * Math.pow(2, (s + o) / 12);
const PHRASES = [[-1, 2, 4, 6, 7], [7, 6, 4, 2, 0], [4, 6, 7, 9, 11, 12], [12, 11, 9, 7, 6, 4, 2], [-1, 0, 2, 4], [9, 7, 6, 4, 2, 4, 0], [4, 7, 6, 4, 2, 0]];

export class Sound {
  constructor() { this.ctx = null; this.scene = 0; this.muted = false; }
  async start() {
    if (this.ctx) { this.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    const c = (this.ctx = new AC());
    this.master = c.createGain(); this.master.gain.value = 0;
    const comp = c.createDynamicsCompressor(); this.master.connect(comp); comp.connect(c.destination);
    const len = c.sampleRate * 3.4, buf = c.createBuffer(2, len, c.sampleRate);
    for (let ch = 0; ch < 2; ch++) { const d = buf.getChannelData(ch); for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6); }
    const rev = c.createConvolver(); rev.buffer = buf; const rg = c.createGain(); rg.gain.value = .55; rev.connect(rg); rg.connect(this.master);
    this.bus = c.createGain(); this.bus.connect(this.master); this.bus.connect(rev);
    const nl = c.sampleRate * 2, nb = c.createBuffer(1, nl, c.sampleRate), nd = nb.getChannelData(0); for (let i = 0; i < nl; i++) nd[i] = Math.random() * 2 - 1; this.noise = nb;
    this.master.gain.linearRampToValueAtTime(this.muted ? 0 : .85, c.currentTime + 2.5);
    const t0 = c.currentTime + .2; this.nt = { tan: t0, flute: t0 + 5, bell: t0 + 3, piano: t0, perc: t0 }; this.ti = 0; this.pi = 0;
    this.timer = setInterval(() => this.tick(), 200); this.pad(0);
  }
  setMuted(m) { this.muted = m; if (this.ctx) this.master.gain.cancelScheduledValues(this.ctx.currentTime), this.master.gain.linearRampToValueAtTime(m ? 0 : .85, this.ctx.currentTime + .4); }
  setScene(i) { this.scene = i; if (this.ctx) { this.pad(i); if (i >= 1) this.nt.flute = Math.min(this.nt.flute, this.ctx.currentTime + 1.5); } }
  tick() {
    const c = this.ctx, la = c.currentTime + .9, s = this.scene, n = this.nt;
    while (n.tan < la) { const seq = [hz(7, -12), hz(0), hz(0), hz(0, -12)][this.ti++ % 4]; this.tanpura(seq, n.tan); n.tan += 1.25; }
    if (s >= 1) while (n.flute < la) { this.flutePhrase(n.flute); n.flute += (s >= 3 ? 7 : 10) + Math.random() * 4; }
    if (s >= 2) while (n.bell < la) { this.bell(hz([0, 4, 7, 12][Math.random() * 4 | 0], 12), n.bell, .5); n.bell += 3 + Math.random() * 3; }
    if (s >= 3) while (n.piano < la) { const arp = [0, 4, 7, 12, 11, 7, 6, 4]; this.piano(hz(arp[this.pi++ % 8]), n.piano, s >= 5 ? .5 : .7); n.piano += .62; }
    if (s === 4) while (n.perc < la) { const p = [1, 0, 0, .5, 1, 0, .5, 0][this.pi % 8]; if (p) this.drum(n.perc, p); n.perc += .31; this.pi++; }
    if (s !== 4) n.perc = Math.max(n.perc, c.currentTime);
    if (s < 3) n.piano = Math.max(n.piano, c.currentTime);
  }
  env(g, t, a, peak, d, end = 0.0001) { g.gain.cancelScheduledValues(t); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(end, t + a + d); }
  tanpura(f, t) {
    const c = this.ctx, out = c.createGain(), lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(1800, t); lp.frequency.exponentialRampToValueAtTime(500, t + 3);
    this.env(out, t, .01, .09, 4.2); lp.connect(out); out.connect(this.bus);
    for (const dt of [0, 3, -3]) { const o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = f; o.detune.value = dt; o.connect(lp); o.start(t); o.stop(t + 4.5); }
    const j = c.createOscillator(), jg = c.createGain(), jf = c.createBiquadFilter(); j.type = 'sawtooth'; j.frequency.value = f * 4; jf.type = 'bandpass'; jf.frequency.value = f * 5; jf.Q.value = 4;
    this.env(jg, t, .5, .02, 2.5); j.connect(jf); jf.connect(jg); jg.connect(this.bus); j.start(t); j.stop(t + 3.5);
  }
  pad(i) {
    const c = this.ctx, t = c.currentTime, chords = [[0, 7, 12], [0, 7, 16], [0, 7, 12, 16], [-5, 4, 11], [0, 7, 12, 19], [0, 7, 16, 23]][i] || [0, 7, 12];
    for (const s of chords) { const o = c.createOscillator(), g = c.createGain(), lp = c.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 1100; o.type = 'triangle'; o.frequency.value = hz(s, -12); this.env(g, t, 3, .035, 9, .0005); o.connect(lp); lp.connect(g); g.connect(this.bus); o.start(t); o.stop(t + 13); }
  }
  flutePhrase(t0) {
    const ph = PHRASES[Math.random() * PHRASES.length | 0]; let t = t0;
    ph.forEach((s, i) => { const last = i === ph.length - 1, d = last ? 2.6 : .55 + Math.random() * .6; this.flute(hz(s), t, d); t += d * .92; });
  }
  flute(f, t, d) {
    const c = this.ctx, g = c.createGain(), lfo = c.createOscillator(), lg = c.createGain();
    lfo.frequency.value = 5.2; lg.gain.value = f * .007; lfo.connect(lg);
    g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.075, t + .12); g.gain.setValueAtTime(.065, t + d * .7); g.gain.exponentialRampToValueAtTime(.0001, t + d + .35);
    const o = c.createOscillator(), o2 = c.createOscillator(), g2 = c.createGain(); o.type = 'sine'; o2.type = 'triangle'; g2.gain.value = .22;
    o.frequency.setValueAtTime(f * .97, t); o.frequency.exponentialRampToValueAtTime(f, t + .09); o2.frequency.value = f * 2; lg.connect(o.frequency); lg.connect(o2.frequency);
    o.connect(g); o2.connect(g2); g2.connect(g); g.connect(this.bus);
    const nz = c.createBufferSource(), bp = c.createBiquadFilter(), ng = c.createGain(); nz.buffer = this.noise; bp.type = 'bandpass'; bp.frequency.value = f * 2; bp.Q.value = 2.5;
    ng.gain.setValueAtTime(.0001, t); ng.gain.linearRampToValueAtTime(.03, t + .05); ng.gain.exponentialRampToValueAtTime(.0001, t + d + .2); nz.connect(bp); bp.connect(ng); ng.connect(this.bus);
    const e = t + d + .5; o.start(t); o2.start(t); lfo.start(t + .25); nz.start(t); o.stop(e); o2.stop(e); lfo.stop(e); nz.stop(Math.min(e, t + 2));
  }
  bell(f, t, v = 1) {
    const c = this.ctx; t = t || c.currentTime;
    [[1, 1, 4], [2.76, .5, 2.6], [5.4, .25, 1.6], [8.93, .12, .9]].forEach(([r, a, dec]) => {
      const o = c.createOscillator(), g = c.createGain(); o.frequency.value = f * r; this.env(g, t, .004, .07 * a * v, dec); o.connect(g); g.connect(this.bus); o.start(t); o.stop(t + dec + .2);
    });
  }
  piano(f, t, v) {
    const c = this.ctx, g = c.createGain(), o = c.createOscillator(), o2 = c.createOscillator(), g2 = c.createGain(); o.type = 'triangle'; o2.type = 'sine'; o.frequency.value = f; o2.frequency.value = f * 2; g2.gain.value = .25;
    this.env(g, t, .006, .05 * v, 2.2); o.connect(g); o2.connect(g2); g2.connect(g); g.connect(this.bus); o.start(t); o2.start(t); o.stop(t + 2.5); o2.stop(t + 2.5);
  }
  drum(t, v) {
    const c = this.ctx, o = c.createOscillator(), g = c.createGain(); o.frequency.setValueAtTime(130, t); o.frequency.exponentialRampToValueAtTime(48, t + .18); this.env(g, t, .004, .22 * v, .35); o.connect(g); g.connect(this.master); o.start(t); o.stop(t + .5);
  }
  nzBurst(t, dur, type, f, peak, f2) {
    const c = this.ctx, s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain(); s.buffer = this.noise; fl.type = type; fl.frequency.setValueAtTime(f, t); if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur);
    this.env(g, t, .01, peak, dur); s.connect(fl); fl.connect(g); g.connect(this.bus); s.start(t); s.stop(t + dur + .1);
  }
  ignite() { if (!this.ctx) return; const t = this.ctx.currentTime; this.nzBurst(t, .9, 'bandpass', 900, .16, 3500); this.bell(hz(12), t + .1, .8); this.bell(hz(19), t + .25, .4); }
  conch() { if (!this.ctx) return; const c = this.ctx, t = c.currentTime, o = c.createOscillator(), g = c.createGain(), lp = c.createBiquadFilter(); o.type = 'sawtooth'; o.frequency.setValueAtTime(hz(0, -12), t); lp.type = 'lowpass'; lp.frequency.value = 700; g.gain.setValueAtTime(.0001, t); g.gain.linearRampToValueAtTime(.09, t + 1); g.gain.linearRampToValueAtTime(.0001, t + 3.6); o.connect(lp); lp.connect(g); g.connect(this.bus); o.start(t); o.stop(t + 4); }
  bloom() { if (!this.ctx) return; const t = this.ctx.currentTime; [0, 4, 7, 12, 16].forEach((s, i) => this.bell(hz(s, 12), t + i * .18, .6)); }
  coin() { if (!this.ctx) return; this.bell(hz([0, 2, 4, 7, 9, 12][Math.random() * 6 | 0], 24), this.ctx.currentTime, .22); }
  chime() { if (!this.ctx) return; const t = this.ctx.currentTime; this.bell(hz([4, 7, 9, 12][Math.random() * 4 | 0], 12), t, .55); }
  whoosh() { if (!this.ctx) return; this.nzBurst(this.ctx.currentTime, .8, 'bandpass', 300, .05, 2200); }
  boom(crack) {
    if (!this.ctx) return; const c = this.ctx, t = c.currentTime + .02, o = c.createOscillator(), g = c.createGain();
    o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(38, t + .5); this.env(g, t, .005, .3, .9); o.connect(g); g.connect(this.master); o.start(t); o.stop(t + 1);
    this.nzBurst(t, .5, 'lowpass', 900, .22, 120);
    if (crack) for (let i = 0; i < 7; i++) this.nzBurst(t + .15 + Math.random() * 1.2, .06, 'highpass', 4000, .06);
  }
}
