const Intro = {
  canvas: null,
  ctx: null,
  particles: [],
  W: 0,
  H: 0,
  dpr: 1,
  startTime: 0,
  currentPhase: 0,
  phaseStart: 0,
  done: false,
  rafId: null,

  phaseConfig: [
    { name: 'scatter', dur: 450 },
    { name: 'exclaim', dur: 2500 },
    { name: 'amrina', dur: 2800 },
    { name: 'portfolio', dur: 2800 },
    { name: 'fade', dur: 800 }
  ],

  init() {
    this.canvas = document.getElementById('intro-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.resize();
    this.createParticles();
    this.startTime = performance.now();
    this.currentPhase = 0;
    this.phaseStart = this.startTime;
    this.setPhase(0);
    this.animate();
  },

  resize() {
    this.W = window.innerWidth;
    this.H = window.innerHeight;
    this.canvas.width = this.W * this.dpr;
    this.canvas.height = this.H * this.dpr;
    this.canvas.style.width = this.W + 'px';
    this.canvas.style.height = this.H + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
  },

  createParticles() {
    const count = this.W < 768 ? 5500 : 9500;
    this.particles = [];
    for (let i = 0; i < count; i++) {
      const isPink = Math.random() > 0.65;
      const isCyan = Math.random() > 0.4;
      let color = '255,255,255';
      if (isPink) color = '244,114,182';
      else if (isCyan) color = '147,197,253';

      this.particles.push({
        x: Math.random() * this.W,
        y: Math.random() * this.H,
        tx: Math.random() * this.W,
        ty: Math.random() * this.H,
        size: Math.random() * 1.3 + 0.8,
        brightness: 0.75 + Math.random() * 0.25,
        alpha: 0.75 + Math.random() * 0.25,
        rgb: color,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        jitter: Math.random() * 0.8 + 0.2
      });
    }
  },

  getTextTargets(text, fontSize) {
    const off = document.createElement('canvas');
    off.width = this.W;
    off.height = this.H;
    const octx = off.getContext('2d');
    octx.fillStyle = '#ffffff';
    octx.font = '900 ' + fontSize + 'px "Archivo Black", "Inter", sans-serif';
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    octx.fillText(text, this.W / 2, this.H / 2);
    const data = octx.getImageData(0, 0, this.W, this.H).data;
    const targets = [];
    const step = Math.max(3, Math.floor(this.W / 400));
    for (let y = 0; y < this.H; y += step) {
      for (let x = 0; x < this.W; x += step) {
        const idx = (y * this.W + x) * 4;
        if (data[idx + 3] > 128) {
          targets.push({ x: x, y: y, b: 1 });
        }
      }
    }
    return targets;
  },

  getExclaimTargets() {
    const off = document.createElement('canvas');
    off.width = this.W;
    off.height = this.H;
    const octx = off.getContext('2d');
    octx.fillStyle = '#ffffff';
    const cx = this.W / 2;
    const barW = Math.max(26, this.W * 0.055);
    const barH = this.H * 0.38;
    const barY = this.H * 0.24;
    octx.fillRect(cx - barW / 2, barY, barW, barH);
    const dotSize = Math.max(26, this.W * 0.058);
    const dotY = barY + barH + this.H * 0.08;
    octx.fillRect(cx - dotSize / 2, dotY, dotSize, dotSize);
    const data = octx.getImageData(0, 0, this.W, this.H).data;
    const targets = [];
    const step = Math.max(3, Math.floor(this.W / 400));
    for (let y = 0; y < this.H; y += step) {
      for (let x = 0; x < this.W; x += step) {
        const idx = (y * this.W + x) * 4;
        if (data[idx + 3] > 128) {
          targets.push({ x: x, y: y, b: 1 });
        }
      }
    }
    return targets;
  },

  shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = arr[i];
      arr[i] = arr[j];
      arr[j] = tmp;
    }
    return arr;
  },

  setPhase(idx) {
    const phase = this.phaseConfig[idx];
    if (!phase) return;
    let targets = [];

    if (phase.name === 'scatter') {
      this.particles.forEach(p => {
        p.tx = Math.random() * this.W;
        p.ty = Math.random() * this.H;
        p.brightness = 0.5 + Math.random() * 0.4;
        p.vx = (Math.random() - 0.5) * 0.5;
        p.vy = (Math.random() - 0.5) * 0.5;
      });
      return;
    }

    if (phase.name === 'exclaim') {
      targets = this.getExclaimTargets();
    } else if (phase.name === 'amrina') {
      const fs = Math.min(this.W * 0.14, 180);
      targets = this.getTextTargets('AMRINA', fs);
    } else if (phase.name === 'portfolio') {
      const fs = Math.min(this.W * 0.11, 140);
      targets = this.getTextTargets('PORTOFOLIO', fs);
    } else if (phase.name === 'fade') {
      return;
    }

    if (targets.length > 0) {
      this.shuffle(targets);
      const tCount = targets.length;
      this.particles.forEach((p, i) => {
        const t = targets[i % tCount];
        p.tx = t.x + (Math.random() - 0.5) * 2;
        p.ty = t.y + (Math.random() - 0.5) * 2;
        p.brightness = t.b;
      });
    }
  },

  animate() {
    if (this.done) return;
    const now = performance.now();
    const phase = this.phaseConfig[this.currentPhase];
    if (!phase) {
      this.finish();
      return;
    }
    const phaseElapsed = now - this.phaseStart;
    if (phaseElapsed > phase.dur) {
      this.currentPhase++;
      this.phaseStart = now;
      if (this.currentPhase < this.phaseConfig.length) {
        this.setPhase(this.currentPhase);
      } else {
        this.finish();
        return;
      }
    }

    const currentPhase = this.phaseConfig[this.currentPhase];
    const phaseElapsedNow = now - this.phaseStart;
    const phaseProgress = Math.min(phaseElapsedNow / currentPhase.dur, 1);

    let globalAlpha = 1;
    if (currentPhase.name === 'fade') {
      globalAlpha = 1 - phaseProgress;
    } else if (currentPhase.name === 'scatter' && phaseProgress < 0.3) {
      globalAlpha = 0.4 + (phaseProgress / 0.3) * 0.6;
    }

    this.ctx.clearRect(0, 0, this.W, this.H);
    this.ctx.globalCompositeOperation = 'lighter';

    const isScatter = currentPhase.name === 'scatter';
    const ease = isScatter ? 0 : 0.085;
    const jitterAmt = currentPhase.name === 'portfolio' ? 0.35 : 0.6;

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];

      if (isScatter) {
        p.x += p.vx;
        p.y += p.vy;
        p.vx += (Math.random() - 0.5) * 0.06;
        p.vy += (Math.random() - 0.5) * 0.06;
        p.vx *= 0.97;
        p.vy *= 0.97;
        if (p.x < -10) p.x = this.W + 10;
        if (p.x > this.W + 10) p.x = -10;
        if (p.y < -10) p.y = this.H + 10;
        if (p.y > this.H + 10) p.y = -10;
      } else {
        const dx = p.tx - p.x;
        const dy = p.ty - p.y;
        p.x += dx * ease;
        p.y += dy * ease;
        p.x += (Math.random() - 0.5) * jitterAmt * p.jitter;
        p.y += (Math.random() - 0.5) * jitterAmt * p.jitter;
      }

      const a = p.alpha * p.brightness * globalAlpha;
      if (a < 0.02) continue;
      this.ctx.fillStyle = 'rgba(' + p.rgb + ',' + a + ')';
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      this.ctx.fill();
    }

    this.ctx.globalCompositeOperation = 'source-over';

    if (currentPhase.name === 'portfolio' || currentPhase.name === 'fade') {
      const glowAlpha = currentPhase.name === 'fade' ? globalAlpha * 0.12 : 0.1;
      const grad = this.ctx.createRadialGradient(this.W / 2, this.H / 2, 0, this.W / 2, this.H / 2, Math.max(this.W, this.H) * 0.45);
      grad.addColorStop(0, 'rgba(56,189,248,' + glowAlpha + ')');
      grad.addColorStop(0.5, 'rgba(236,72,153,' + (glowAlpha * 0.6) + ')');
      grad.addColorStop(1, 'rgba(7,14,38,0)');
      this.ctx.fillStyle = grad;
      this.ctx.fillRect(0, 0, this.W, this.H);
    }

    this.rafId = requestAnimationFrame(() => this.animate());
  },

  finish() {
    if (this.done) return;
    this.done = true;
    if (this.rafId) cancelAnimationFrame(this.rafId);
    const overlay = document.getElementById('intro-overlay');
    if (overlay) {
      overlay.classList.add('intro-hidden');
      setTimeout(() => {
        overlay.style.display = 'none';
        document.body.classList.remove('intro-lock');
        const heroRevealEls = document.querySelectorAll('#hero .reveal, #hero .reveal-left, #hero .reveal-right, #hero .reveal-scale, #hero .reveal-blur, #hero .reveal-rotate');
        heroRevealEls.forEach((el, i) => {
          setTimeout(() => { el.classList.add('visible'); }, i * 110);
        });
      }, 500);
    }
  },

  skip() {
    if (this.done) return;
    this.finish();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('intro-overlay');
  if (!overlay) {
    document.body.classList.remove('intro-lock');
    document.querySelectorAll('#hero .reveal, #hero .reveal-left, #hero .reveal-right, #hero .reveal-scale, #hero .reveal-blur, #hero .reveal-rotate').forEach(el => el.classList.add('visible'));
    return;
  }
  document.body.classList.add('intro-lock');
  overlay.addEventListener('click', () => Intro.skip());
  const skipBtn = document.querySelector('.intro-skip');
  if (skipBtn) {
    skipBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      Intro.skip();
    });
  }
  const startIntro = () => {
    setTimeout(() => Intro.init(), 80);
  };
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(startIntro).catch(startIntro);
  } else {
    setTimeout(startIntro, 400);
  }
  setTimeout(() => {
    if (!Intro.done && !Intro.canvas) {
      Intro.init();
    }
  }, 2000);
});
