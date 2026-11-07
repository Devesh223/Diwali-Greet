// Classical soundtrack player + procedural sound effects
const SA = 261.63, hz = (s, o = 0) => SA * Math.pow(2, (s + o) / 12);

export class Sound {
  constructor() {
    this.ctx = null;
    this.scene = 0;
    this.muted = false;
    this.bgm = new Audio('bgm.mp3');
    this.bgm.loop = true;
    this.bgm.preload = 'auto';
  }

  async start() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC && !this.ctx) {
      const c = (this.ctx = new AC());
      this.master = c.createGain();
      this.master.gain.value = this.muted ? 0 : 0.85;

      const comp = c.createDynamicsCompressor();
      this.master.connect(comp);
      comp.connect(c.destination);

      const len = c.sampleRate * 2.5, buf = c.createBuffer(2, len, c.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const d = buf.getChannelData(ch);
        for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
      }
      const rev = c.createConvolver();
      rev.buffer = buf;
      const rg = c.createGain();
      rg.gain.value = 0.45;
      rev.connect(rg);
      rg.connect(this.master);

      this.bus = c.createGain();
      this.bus.connect(this.master);
      this.bus.connect(rev);

      const nl = c.sampleRate * 2, nb = c.createBuffer(1, nl, c.sampleRate), nd = nb.getChannelData(0);
      for (let i = 0; i < nl; i++) nd[i] = Math.random() * 2 - 1;
      this.noise = nb;
    } else if (this.ctx && this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    if (this.bgm) {
      this.bgm.muted = this.muted;
      this.bgm.volume = 0.8;
      try {
        await this.bgm.play();
      } catch (err) {
        console.warn('Audio play prevented:', err);
      }
    }
  }

  setMuted(m) {
    this.muted = m;
    if (this.bgm) this.bgm.muted = m;
    if (this.ctx) {
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.linearRampToValueAtTime(m ? 0 : 0.85, this.ctx.currentTime + 0.3);
    }
  }

  setScene(i) {
    this.scene = i;
  }

  replay() {
    if (this.bgm) {
      this.bgm.currentTime = 0;
      if (!this.muted) this.bgm.play().catch(() => {});
    }
  }

  pause() {
    if (this.bgm) this.bgm.pause();
    if (this.ctx && this.ctx.state === 'running') this.ctx.suspend();
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume();
    if (this.bgm && !this.muted) this.bgm.play().catch(() => {});
  }

  env(g, t, a, peak, d, end = 0.0001) {
    g.gain.cancelScheduledValues(t);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(end, t + a + d);
  }

  bell(f, t, v = 1) {
    if (!this.ctx) return;
    const c = this.ctx;
    t = t || c.currentTime;
    [[1, 1, 4], [2.76, 0.5, 2.6], [5.4, 0.25, 1.6], [8.93, 0.12, 0.9]].forEach(([r, a, dec]) => {
      const o = c.createOscillator(), g = c.createGain();
      o.frequency.value = f * r;
      this.env(g, t, 0.004, 0.07 * a * v, dec);
      o.connect(g);
      g.connect(this.bus);
      o.start(t);
      o.stop(t + dec + 0.2);
    });
  }

  nzBurst(t, dur, type, f, peak, f2) {
    if (!this.ctx) return;
    const c = this.ctx, s = c.createBufferSource(), fl = c.createBiquadFilter(), g = c.createGain();
    s.buffer = this.noise;
    fl.type = type;
    fl.frequency.setValueAtTime(f, t);
    if (f2) fl.frequency.exponentialRampToValueAtTime(f2, t + dur);
    this.env(g, t, 0.01, peak, dur);
    s.connect(fl);
    fl.connect(g);
    g.connect(this.bus);
    s.start(t);
    s.stop(t + dur + 0.1);
  }

  ignite() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.nzBurst(t, 0.9, 'bandpass', 900, 0.16, 3500);
    this.bell(hz(12), t + 0.1, 0.8);
    this.bell(hz(19), t + 0.25, 0.4);
  }

  conch() {
    if (!this.ctx) return;
    const c = this.ctx, t = c.currentTime, o = c.createOscillator(), g = c.createGain(), lp = c.createBiquadFilter();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(hz(0, -12), t);
    lp.type = 'lowpass';
    lp.frequency.value = 700;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.linearRampToValueAtTime(0.09, t + 1);
    g.gain.linearRampToValueAtTime(0.0001, t + 3.6);
    o.connect(lp);
    lp.connect(g);
    g.connect(this.bus);
    o.start(t);
    o.stop(t + 4);
  }

  bloom() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    [0, 4, 7, 12, 16].forEach((s, i) => this.bell(hz(s, 12), t + i * 0.18, 0.6));
  }

  coin() {
    if (!this.ctx) return;
    this.bell(hz([0, 2, 4, 7, 9, 12][Math.random() * 6 | 0], 24), this.ctx.currentTime, 0.22);
  }

  chime() {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    this.bell(hz([4, 7, 9, 12][Math.random() * 4 | 0], 12), t, 0.55);
  }

  whoosh() {
    if (!this.ctx) return;
    this.nzBurst(this.ctx.currentTime, 0.8, 'bandpass', 300, 0.05, 2200);
  }

  boom(crack) {
    if (!this.ctx) return;
    const c = this.ctx, t = c.currentTime + 0.02, o = c.createOscillator(), g = c.createGain();
    o.frequency.setValueAtTime(110, t);
    o.frequency.exponentialRampToValueAtTime(38, t + 0.5);
    this.env(g, t, 0.005, 0.3, 0.9);
    o.connect(g);
    g.connect(this.master);
    o.start(t);
    o.stop(t + 1);
    this.nzBurst(t, 0.5, 'lowpass', 900, 0.22, 120);
    if (crack) {
      for (let i = 0; i < 7; i++) this.nzBurst(t + 0.15 + Math.random() * 1.2, 0.06, 'highpass', 4000, 0.06);
    }
  }
}
