const Galaxy = {
  canvas: null,
  ctx: null,
  stars: [],
  shootingStars: [],
  nebula: [],
  particles: [],
  auroras: [],
  w: 0,
  h: 0,
  mouseX: 0,
  mouseY: 0,
  targetMouseX: 0,
  targetMouseY: 0,
  scrollY: 0,
  targetScrollY: 0,
  time: 0,
  init() {
    this.canvas = document.getElementById('galaxy-canvas');
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    this.resize();
    this.createStars();
    this.createNebula();
    this.createParticles();
    this.createAuroras();
    window.addEventListener('resize', () => {
      this.resize();
      this.createStars();
      this.createNebula();
      this.createParticles();
      this.createAuroras();
    });
    window.addEventListener('mousemove', (e) => {
      this.targetMouseX = e.clientX;
      this.targetMouseY = e.clientY;
    });
    window.addEventListener('scroll', () => {
      this.targetScrollY = window.scrollY;
    }, { passive: true });
    this.animate();
  },
  resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = window.innerWidth;
    this.h = window.innerHeight;
    this.canvas.width = this.w * dpr;
    this.canvas.height = this.h * dpr;
    this.canvas.style.width = this.w + 'px';
    this.canvas.style.height = this.h + 'px';
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
  },
  createStars() {
    this.stars = [];
    const count = Math.floor((this.w * this.h) / 3400);
    for (let i = 0; i < count; i++) {
      const r = Math.random();
      let col = '#ffffff';
      if (r > 0.75) col = '#f472b6';
      else if (r > 0.45) col = '#93c5fd';
      else if (r > 0.25) col = '#38bdf8';

      this.stars.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        z: Math.random() * 3 + 0.5,
        size: Math.random() * 1.5 + 0.4,
        baseOpacity: Math.random() * 0.6 + 0.3,
        twinkleSpeed: Math.random() * 0.025 + 0.006,
        twinklePhase: Math.random() * Math.PI * 2,
        color: col,
        baseX: 0,
        baseY: 0
      });
    }
    this.stars.forEach(s => { s.baseX = s.x; s.baseY = s.y; });
  },
  createNebula() {
    this.nebula = [];
    const palette = [
      'rgba(56, 189, 248, 0.09)',
      'rgba(37, 99, 235, 0.08)',
      'rgba(236, 72, 153, 0.08)',
      'rgba(147, 197, 253, 0.07)',
      'rgba(244, 114, 182, 0.07)'
    ];
    for (let i = 0; i < 6; i++) {
      this.nebula.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        radius: Math.max(220, Math.random() * 520 + 260),
        color: palette[i % palette.length],
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        pulse: Math.random() * Math.PI * 2,
        pulseSpeed: 0.004 + Math.random() * 0.005
      });
    }
  },
  createParticles() {
    this.particles = [];
    const count = Math.floor((this.w * this.h) / 10000);
    for (let i = 0; i < count; i++) {
      const isPink = Math.random() > 0.5;
      this.particles.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        size: Math.random() * 2 + 1.2,
        color: isPink ? 'rgba(244,114,182,' : 'rgba(56,189,248,',
        glowColor: isPink ? '#f472b6' : '#38bdf8',
        opacity: Math.random() * 0.45 + 0.3
      });
    }
  },
  createAuroras() {
    this.auroras = [];
    for (let i = 0; i < 3; i++) {
      const isPink = i === 1;
      this.auroras.push({
        y: this.h * (0.2 + i * 0.3),
        amp: 45 + Math.random() * 65,
        wavelength: 0.003 + Math.random() * 0.002,
        speed: 0.0006 + Math.random() * 0.0006,
        phase: Math.random() * Math.PI * 2,
        color: isPink ? 'rgba(236, 72, 153, 0.05)' : 'rgba(56, 189, 248, 0.055)',
        thickness: 90 + Math.random() * 70
      });
    }
  },
  createShootingStar() {
    if (Math.random() > 0.982 && this.shootingStars.length < 4) {
      const fromLeft = Math.random() > 0.5;
      const isPink = Math.random() > 0.5;
      this.shootingStars.push({
        x: fromLeft ? -50 : this.w + 50,
        y: Math.random() * this.h * 0.6,
        vx: (fromLeft ? 1 : -1) * (Math.random() * 10 + 7),
        vy: Math.random() * 5 + 2,
        length: Math.random() * 100 + 80,
        opacity: 1,
        life: 0,
        color: isPink ? '#f472b6' : '#38bdf8'
      });
    }
  },
  animate() {
    const ctx = this.ctx;
    this.time += 1;

    this.mouseX += (this.targetMouseX - this.mouseX) * 0.08;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.08;
    this.scrollY += (this.targetScrollY - this.scrollY) * 0.08;

    ctx.clearRect(0, 0, this.w, this.h);

    this.auroras.forEach(a => {
      a.phase += a.speed;
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';
      const grad = ctx.createLinearGradient(0, a.y - a.thickness, 0, a.y + a.thickness);
      grad.addColorStop(0, 'rgba(0,0,0,0)');
      grad.addColorStop(0.5, a.color);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(0, a.y);
      for (let x = 0; x <= this.w; x += 12) {
        const y = a.y + Math.sin(x * a.wavelength + a.phase) * a.amp
                       + Math.sin(x * a.wavelength * 0.4 + a.phase * 1.3) * a.amp * 0.4;
        ctx.lineTo(x, y);
      }
      ctx.lineTo(this.w, a.y + a.thickness);
      ctx.lineTo(0, a.y + a.thickness);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    this.nebula.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      n.pulse += n.pulseSpeed;
      if (n.x < -n.radius) n.x = this.w + n.radius;
      if (n.x > this.w + n.radius) n.x = -n.radius;
      if (n.y < -n.radius) n.y = this.h + n.radius;
      if (n.y > this.h + n.radius) n.y = -n.radius;

      const pulseFactor = 0.85 + 0.15 * Math.sin(n.pulse);
      const r = Math.max(20, n.radius * pulseFactor);
      const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, r);
      grad.addColorStop(0, n.color);
      grad.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(n.x - r, n.y - r, r * 2, r * 2);
    });

    const mx = (this.mouseX - this.w / 2);
    const my = (this.mouseY - this.h / 2);
    const scrollFactor = this.scrollY * 0.05;

    this.stars.forEach(s => {
      s.twinklePhase += s.twinkleSpeed;
      const opacity = s.baseOpacity * (0.5 + 0.5 * Math.sin(s.twinklePhase));
      const px = mx * s.z * 0.008;
      const py = my * s.z * 0.008 + scrollFactor * s.z * 0.3;
      const x = s.x + px;
      const y = s.y + py;

      ctx.shadowBlur = s.size > 1 ? 6 : 3;
      ctx.shadowColor = s.color;
      ctx.fillStyle = s.color;
      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.arc(x, y, s.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    const mouseRadius = 170;
    this.particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = this.w;
      if (p.x > this.w) p.x = 0;
      if (p.y < 0) p.y = this.h;
      if (p.y > this.h) p.y = 0;

      const dx = this.mouseX - p.x;
      const dy = this.mouseY - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < mouseRadius && dist > 0) {
        const force = (1 - dist / mouseRadius) * 0.4;
        p.x += dx / dist * force;
        p.y += dy / dist * force;
      }

      ctx.shadowBlur = 8;
      ctx.shadowColor = p.glowColor;
      ctx.fillStyle = p.color + p.opacity + ')';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;

    if (this.mouseX > 0 && this.mouseY > 0) {
      const linkRadius = 210;
      const linkDist = 115;
      const near = [];
      this.particles.forEach(p => {
        const dx = p.x - this.mouseX;
        const dy = p.y - this.mouseY;
        if (dx * dx + dy * dy < linkRadius * linkRadius) {
          near.push(p);
        }
      });

      const haloGrad = ctx.createRadialGradient(this.mouseX, this.mouseY, 0, this.mouseX, this.mouseY, linkRadius);
      haloGrad.addColorStop(0, 'rgba(56, 189, 248, 0.12)');
      haloGrad.addColorStop(0.6, 'rgba(236, 72, 153, 0.04)');
      haloGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = haloGrad;
      ctx.beginPath();
      ctx.arc(this.mouseX, this.mouseY, linkRadius, 0, Math.PI * 2);
      ctx.fill();

      ctx.lineWidth = 1.2;
      ctx.lineCap = 'round';
      near.forEach(p => {
        const dx = p.x - this.mouseX;
        const dy = p.y - this.mouseY;
        const d = Math.sqrt(dx * dx + dy * dy);
        if (d < linkDist) {
          const alpha = (1 - d / linkDist) * 0.55;
          ctx.strokeStyle = 'rgba(147, 197, 253, ' + alpha + ')';
          ctx.beginPath();
          ctx.moveTo(this.mouseX, this.mouseY);
          ctx.lineTo(p.x, p.y);
          ctx.stroke();
        }
      });
      for (let i = 0; i < near.length; i++) {
        for (let j = i + 1; j < near.length; j++) {
          const dx = near[i].x - near[j].x;
          const dy = near[i].y - near[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < linkDist) {
            const alpha = (1 - d / linkDist) * 0.35;
            ctx.strokeStyle = 'rgba(244, 114, 182, ' + alpha + ')';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(near[i].x, near[i].y);
            ctx.lineTo(near[j].x, near[j].y);
            ctx.stroke();
          }
        }
      }
    }

    this.createShootingStar();
    for (let i = this.shootingStars.length - 1; i >= 0; i--) {
      const ss = this.shootingStars[i];
      ss.x += ss.vx;
      ss.y += ss.vy;
      ss.life++;

      const grad = ctx.createLinearGradient(ss.x, ss.y, ss.x - ss.vx * (ss.length / 10), ss.y - ss.vy * (ss.length / 10));
      grad.addColorStop(0, ss.color);
      grad.addColorStop(0.3, ss.color === '#f472b6' ? 'rgba(244,114,182,0.6)' : 'rgba(56,189,248,0.6)');
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(ss.x, ss.y);
      ctx.lineTo(ss.x - ss.vx * (ss.length / 10), ss.y - ss.vy * (ss.length / 10));
      ctx.stroke();

      ctx.fillStyle = ss.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = ss.color;
      ctx.beginPath();
      ctx.arc(ss.x, ss.y, 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      if (ss.x < -100 || ss.x > this.w + 100 || ss.y > this.h + 100 || ss.life > 120) {
        this.shootingStars.splice(i, 1);
      }
    }

    requestAnimationFrame(() => this.animate());
  }
};

const Cursor = {
  dot: null,
  ring: null,
  x: -100,
  y: -100,
  targetX: -100,
  targetY: -100,
  init() {
    this.dot = document.querySelector('.cursor-dot');
    this.ring = document.querySelector('.cursor-ring');
    if (!this.dot || !this.ring) return;
    if (window.matchMedia('(hover:none)').matches) return;

    window.addEventListener('mousemove', (e) => {
      this.targetX = e.clientX;
      this.targetY = e.clientY;
      this.dot.style.transform = 'translate(' + (e.clientX - 3) + 'px, ' + (e.clientY - 3) + 'px)';
    });

    const hoverables = 'a, button, input, textarea, select, .project-card, .stack-card, .contact-card, .hobby-card, .repo-card, [data-tilt]';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverables)) {
        this.ring.classList.add('hover');
        this.dot.classList.add('hover');
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverables)) {
        this.ring.classList.remove('hover');
        this.dot.classList.remove('hover');
      }
    });

    this.animateRing();
  },
  animateRing() {
    this.x += (this.targetX - this.x) * 0.16;
    this.y += (this.targetY - this.y) * 0.16;
    if (this.ring) {
      this.ring.style.transform = 'translate(' + (this.x - 18) + 'px, ' + (this.y - 18) + 'px)';
    }
    requestAnimationFrame(() => this.animateRing());
  }
};

const Navbar = {
  nav: null,
  toggle: null,
  mobileMenu: null,
  links: [],
  init() {
    this.nav = document.getElementById('navbar');
    this.toggle = document.querySelector('.nav-toggle');
    this.mobileMenu = document.querySelector('.mobile-menu');
    this.links = document.querySelectorAll('.nav-link');
    if (!this.nav) return;

    window.addEventListener('scroll', () => {
      if (window.scrollY > 40) {
        this.nav.classList.add('scrolled');
      } else {
        this.nav.classList.remove('scrolled');
      }
      this.highlightActive();
    }, { passive: true });

    if (this.toggle && this.mobileMenu) {
      this.toggle.addEventListener('click', () => {
        this.nav.classList.toggle('nav-open');
        this.mobileMenu.classList.toggle('open');
      });
      this.mobileMenu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
          this.nav.classList.remove('nav-open');
          this.mobileMenu.classList.remove('open');
        });
      });
    }
  },
  highlightActive() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 200;
    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      const id = sec.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        this.links.forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === '#' + id);
        });
      }
    });
  }
};

const Reveal = {
  observer: null,
  init() {
    const selector = '.reveal, .reveal-left, .reveal-right, .reveal-scale, .reveal-blur, .reveal-rotate';
    const elements = document.querySelectorAll(selector);

    if (!('IntersectionObserver' in window)) {
      elements.forEach(el => el.classList.add('visible'));
      return;
    }

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const el = entry.target;
          const delay = parseInt(el.getAttribute('data-reveal-delay') || '0', 10);
          if (delay > 0) {
            setTimeout(() => {
              el.classList.add('visible');
            }, delay);
          } else {
            el.classList.add('visible');
          }
          this.observer.unobserve(el);
        }
      });
    }, {
      rootMargin: '0px 0px -50px 0px',
      threshold: 0.08
    });

    elements.forEach(el => this.observer.observe(el));
  }
};

const ScrollProgress = {
  init() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
    const update = () => {
      const scrollTop = window.scrollY;
      const docHeight = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      const pct = Math.min(100, (scrollTop / docHeight) * 100);
      bar.style.width = pct + '%';
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }
};

const Tilt = {
  init() {
    if (window.matchMedia('(hover:none)').matches) return;
    document.querySelectorAll('[data-tilt]').forEach(el => {
      let raf = null;
      el.addEventListener('mousemove', (e) => {
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          const rect = el.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const cx = rect.width / 2;
          const cy = rect.height / 2;
          const rotX = ((y - cy) / cy) * -9;
          const rotY = ((x - cx) / cx) * 9;
          el.style.transform = 'perspective(1000px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) translateZ(12px) translateY(-8px)';
        });
      });
      el.addEventListener('mouseleave', () => {
        if (raf) cancelAnimationFrame(raf);
        el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0) translateY(0)';
      });
    });
  }
};

const Magnetic = {
  init() {
    if (window.matchMedia('(hover:none)').matches) return;
    document.querySelectorAll('.magnetic').forEach(el => {
      el.addEventListener('mousemove', (e) => {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        const strength = 0.25;
        el.style.transform = 'translate(' + (x * strength) + 'px,' + (y * strength) + 'px)';
      });
      el.addEventListener('mouseleave', () => {
        el.style.transform = 'translate(0,0)';
      });
    });
  }
};

const Counter = {
  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
          entry.target.dataset.counted = '1';
          this.animate(entry.target);
        }
      });
    }, { threshold: 0.5 });
    document.querySelectorAll('[data-count]').forEach(el => observer.observe(el));
  },
  animate(el) {
    const target = parseInt(el.dataset.count, 10);
    const duration = 1800;
    const start = performance.now();
    const startVal = 0;
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const val = Math.floor(startVal + (target - startVal) * eased);
      el.textContent = val;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target;
    };
    requestAnimationFrame(step);
  }
};

const SmoothScroll = {
  init() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', (e) => {
        const href = a.getAttribute('href');
        if (href === '#' || href.length < 2) return;
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const top = target.getBoundingClientRect().top + window.scrollY - 70;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  }
};

const ProjectInteract = {
  init() {
    const cards = document.querySelectorAll('.project-card, .repo-card, .hobby-card, .contact-card, .education-card');
    cards.forEach(card => {
      const glow = card.querySelector('.card-glow');
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        if (glow) {
          glow.style.background = 'radial-gradient(circle at ' + x + '% ' + y + '%, rgba(56,189,248,0.22), rgba(236,72,153,0.15), transparent 60%)';
        }
      });
    });
  }
};

const GitHubSync = {
  username: 'Asya-Code2146',
  async init() {
    this.setupFilters();
    this.setupSearch();
    await this.fetchLiveStats();
  },
  setupFilters() {
    const btns = document.querySelectorAll('.repo-filter-btn');
    const cards = document.querySelectorAll('.repo-card');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');

        cards.forEach(c => {
          const category = c.getAttribute('data-category') || '';
          if (filter === 'all' || category.includes(filter)) {
            c.style.display = '';
            setTimeout(() => c.classList.add('visible'), 30);
          } else {
            c.style.display = 'none';
          }
        });
      });
    });
  },
  setupSearch() {
    const input = document.getElementById('repo-search-input');
    if (!input) return;
    const cards = document.querySelectorAll('.repo-card');
    input.addEventListener('input', (e) => {
      const q = e.target.value.toLowerCase().trim();
      cards.forEach(c => {
        const title = (c.querySelector('.repo-card-title')?.textContent || '').toLowerCase();
        const desc = (c.querySelector('.repo-card-desc')?.textContent || '').toLowerCase();
        const tags = (c.querySelector('.repo-card-tags')?.textContent || '').toLowerCase();
        if (!q || title.includes(q) || desc.includes(q) || tags.includes(q)) {
          c.style.display = '';
        } else {
          c.style.display = 'none';
        }
      });
    });
  },
  async fetchLiveStats() {
    try {
      const resp = await fetch('https://api.github.com/users/' + this.username + '/repos?per_page=100&sort=updated');
      if (!resp.ok) return;
      const repos = await resp.json();
      if (!Array.isArray(repos)) return;

      const totalCount = document.getElementById('github-repo-count');
      if (totalCount) totalCount.textContent = repos.length;

      const repoMap = new Map();
      repos.forEach(r => repoMap.set(r.name.toLowerCase(), r));

      document.querySelectorAll('.repo-card, .project-card').forEach(card => {
        const repoName = card.getAttribute('data-repo-name');
        if (!repoName) return;
        const data = repoMap.get(repoName.toLowerCase());
        if (data) {
          const starEl = card.querySelector('.repo-star-count');
          if (starEl) starEl.textContent = data.stargazers_count;
          const forkEl = card.querySelector('.repo-fork-count');
          if (forkEl) forkEl.textContent = data.forks_count;
          const langEl = card.querySelector('.repo-live-lang');
          if (langEl && data.language) langEl.textContent = data.language;
        }
      });
    } catch (e) {}
  }
};

document.addEventListener('DOMContentLoaded', () => {
  Galaxy.init();
  Cursor.init();
  Navbar.init();
  Reveal.init();
  ScrollProgress.init();
  Tilt.init();
  Magnetic.init();
  Counter.init();
  SmoothScroll.init();
  ProjectInteract.init();
  GitHubSync.init();
});
