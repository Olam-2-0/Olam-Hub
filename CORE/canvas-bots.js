/**
 * AURA LIQUID — Interactive Canvas Engine
 * Liquid Glass Effect Dots with Cursor Fluid Physics
 * High-DPI / Retina Crisp Rendering with Spring Physics
 * Supports:
 * - Liquid Alabaster White (White background with glass refraction dots)
 * - Antigravity Dark Mode (Minimal obsidian glass with luminous starlight dots)
 * - Liquid Monochrome (High-contrast Apple black & white)
 */

(function () {
  'use strict';

  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let dpr = window.devicePixelRatio || 1;
  let width = window.innerWidth;
  let height = window.innerHeight;

  function resizeCanvas() {
    dpr = window.devicePixelRatio || 1;
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  resizeCanvas();

  // Mouse & interaction state (Starts off-screen to prevent phantom center repulsion)
  const mouse = {
    x: -2000,
    y: -2000,
    targetX: -2000,
    targetY: -2000,
    vx: 0,
    vy: 0,
    radius: 170,
    isHovered: false
  };

  function updateBodyClasses(theme) {
    if (theme === 'liquid-white') {
      document.body.classList.remove('theme-dark', 'theme-monochrome');
      document.body.classList.add('theme-white');
    } else if (theme === 'antigravity-dark') {
      document.body.classList.remove('theme-white', 'theme-monochrome');
      document.body.classList.add('theme-dark');
    } else {
      document.body.classList.remove('theme-white', 'theme-dark');
      document.body.classList.add('theme-monochrome');
    }
  }

  // Global Background Controller
  window.AuraBackground = {
    theme: 'liquid-white', // 'liquid-white' | 'antigravity-dark' | 'liquid-monochrome'
    dotSpacing: 36,
    dotBaseRadius: 2.2,
    repulsionStrength: 0.24,
    friction: 0.86,
    spring: 0.06,
    connectionLines: true,

    setTheme(newTheme) {
      this.theme = newTheme;
      document.documentElement.setAttribute('data-theme', newTheme);
      updateBodyClasses(newTheme);
    },

    setDensity(spacing) {
      this.dotSpacing = Math.max(24, Math.min(65, spacing));
      initDots();
    },

    setRepulsion(val) {
      this.repulsionStrength = parseFloat(val) || 0.24;
    }
  };

  let dots = [];
  let ripples = [];

  class GlassDot {
    constructor(originX, originY) {
      this.originX = originX;
      this.originY = originY;
      this.x = originX + (Math.random() - 0.5) * 2;
      this.y = originY + (Math.random() - 0.5) * 2;
      this.vx = 0;
      this.vy = 0;
      this.baseRadius = window.AuraBackground.dotBaseRadius + (Math.random() * 0.6 - 0.3);
      this.radius = this.baseRadius;
      this.alpha = 0.32 + Math.random() * 0.25;
      this.baseAlpha = this.alpha;
      this.glow = 0;
      this.phase = Math.random() * Math.PI * 2;
    }

    update(time) {
      // Natural organic gentle float
      this.phase += 0.018;
      const floatX = Math.sin(this.phase) * 1.5;
      const floatY = Math.cos(this.phase * 0.8) * 1.5;
      const targetOriginX = this.originX + floatX;
      const targetOriginY = this.originY + floatY;

      // Distance to cursor (ONLY if cursor is actually inside the window)
      if (mouse.isHovered) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Cursor repulsion & glass displacement
        if (dist < mouse.radius && dist > 0) {
          const force = (1 - dist / mouse.radius) * 38 * window.AuraBackground.repulsionStrength;
          const angle = Math.atan2(dy, dx);
          this.vx += Math.cos(angle) * force;
          this.vy += Math.sin(angle) * force;

          // Glow & magnify when cursor is near
          this.glow = Math.min(1, this.glow + (1 - dist / mouse.radius) * 0.3);
          this.radius = this.baseRadius + (1 - dist / mouse.radius) * 3.2;
        } else {
          this.glow *= 0.92;
          this.radius = this.baseRadius + (this.radius - this.baseRadius) * 0.88;
        }
      } else {
        this.glow *= 0.9;
        this.radius = this.baseRadius + (this.radius - this.baseRadius) * 0.85;
      }

      // Handle click ripples
      for (let i = 0; i < ripples.length; i++) {
        const rip = ripples[i];
        const rdx = this.x - rip.x;
        const rdy = this.y - rip.y;
        const rdist = Math.sqrt(rdx * rdx + rdy * rdy);
        const waveDist = Math.abs(rdist - rip.radius);

        if (waveDist < rip.width) {
          const waveForce = (1 - waveDist / rip.width) * rip.strength * (1 - rip.radius / rip.maxRadius);
          const angle = Math.atan2(rdy, rdx);
          this.vx += Math.cos(angle) * waveForce * 4.5;
          this.vy += Math.sin(angle) * waveForce * 4.5;
          this.glow = Math.min(1, this.glow + waveForce * 0.9);
        }
      }

      // Spring force returning to origin
      const springX = (targetOriginX - this.x) * window.AuraBackground.spring;
      const springY = (targetOriginY - this.y) * window.AuraBackground.spring;

      this.vx = (this.vx + springX) * window.AuraBackground.friction;
      this.vy = (this.vy + springY) * window.AuraBackground.friction;

      this.x += this.vx;
      this.y += this.vy;

      // Dynamic alpha based on cursor proximity
      this.alpha = this.baseAlpha + this.glow * 0.5;
    }

    draw(ctx, isDarkTheme) {
      const isGlowing = this.glow > 0.05;

      if (isDarkTheme) {
        // --- ANTIGRAVITY DARK MODE ---
        if (isGlowing) {
          // Specular luminous glass halo
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius * 3.6, 0, Math.PI * 2);
          const grad = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius * 3.6
          );
          grad.addColorStop(0, `rgba(255, 255, 255, ${0.4 * this.glow})`);
          grad.addColorStop(0.5, `rgba(200, 210, 230, ${0.12 * this.glow})`);
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = grad;
          ctx.fill();
        }

        // Dark theme dot body
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

        if (isGlowing) {
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1, this.alpha + 0.45)})`;
          ctx.shadowColor = 'rgba(255, 255, 255, 0.85)';
          ctx.shadowBlur = 8 * this.glow;
        } else {
          ctx.fillStyle = `rgba(255, 255, 255, ${this.alpha * 0.75})`;
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

      } else {
        // --- LIQUID ALABASTER WHITE (White background with glass effect dots) ---
        if (isGlowing) {
          // Soft liquid glass lens refraction aura
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius * 3.8, 0, Math.PI * 2);
          const grad = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, this.radius * 3.8
          );
          grad.addColorStop(0, `rgba(15, 23, 42, ${0.16 * this.glow})`);
          grad.addColorStop(0.5, `rgba(148, 163, 184, ${0.08 * this.glow})`);
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = grad;
          ctx.fill();
        }

        // Frosted Glass Dot Body on White Background
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);

        if (isGlowing) {
          // Active high-contrast liquid bead
          ctx.fillStyle = `rgba(10, 15, 26, ${Math.min(0.92, this.alpha + 0.5)})`;
          ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
          ctx.shadowBlur = 7 * this.glow;
        } else {
          // Distinct crisp translucent frosted bead
          ctx.fillStyle = `rgba(20, 28, 44, ${Math.max(0.28, this.alpha * 0.8)})`;
          ctx.shadowBlur = 0;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        // Specular micro-reflection glint on top-left of glass dot
        if (this.radius >= 2.0) {
          ctx.beginPath();
          ctx.arc(this.x - this.radius * 0.32, this.y - this.radius * 0.32, Math.max(0.7, this.radius * 0.35), 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.fill();
        }
      }
    }
  }

  function initDots() {
    dots = [];
    const spacing = window.AuraBackground.dotSpacing;
    const cols = Math.ceil(width / spacing) + 2;
    const rows = Math.ceil(height / spacing) + 2;

    const startX = (width - (cols - 1) * spacing) / 2;
    const startY = (height - (rows - 1) * spacing) / 2;

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        // Hexagonal staggered arrangement for luxury Apple feel
        const offsetX = (r % 2 === 0) ? 0 : spacing * 0.5;
        const x = startX + c * spacing + offsetX;
        const y = startY + r * spacing;
        dots.push(new GlassDot(x, y));
      }
    }
  }

  function onResize() {
    resizeCanvas();
    initDots();
  }

  // Mouse move listener with smoothed interpolation
  window.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
    if (!mouse.isHovered) {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.isHovered = true;
    }
  });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      mouse.targetX = e.touches[0].clientX;
      mouse.targetY = e.touches[0].clientY;
      if (!mouse.isHovered) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.isHovered = true;
      }
    }
  }, { passive: true });

  window.addEventListener('click', (e) => {
    // Add liquid glass ripple on click
    ripples.push({
      x: e.clientX,
      y: e.clientY,
      radius: 0,
      maxRadius: 220,
      width: 55,
      strength: 1.5,
      speed: 5.2
    });
  });

  window.addEventListener('mouseleave', () => {
    mouse.isHovered = false;
    mouse.targetX = -2000;
    mouse.targetY = -2000;
  });

  window.addEventListener('resize', onResize);

  let animationFrameId;

  function render(time) {
    // Smooth cursor interpolation
    if (mouse.isHovered) {
      mouse.x += (mouse.targetX - mouse.x) * 0.18;
      mouse.y += (mouse.targetY - mouse.y) * 0.18;
    }

    const isDark = window.AuraBackground.theme === 'antigravity-dark';

    // Clear background
    ctx.clearRect(0, 0, width, height);

    if (isDark) {
      // Deep Antigravity Obsidian Ambient
      const bgGradient = ctx.createRadialGradient(
        mouse.isHovered ? mouse.x : width / 2, mouse.isHovered ? mouse.y : height / 2, 10,
        mouse.isHovered ? mouse.x : width / 2, mouse.isHovered ? mouse.y : height / 2, Math.max(width, height) * 0.8
      );
      bgGradient.addColorStop(0, 'rgba(255, 255, 255, 0.05)');
      bgGradient.addColorStop(0.35, 'rgba(25, 28, 36, 0.4)');
      bgGradient.addColorStop(0.85, 'rgba(8, 8, 11, 0.98)');
      bgGradient.addColorStop(1, '#050608');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);
    } else {
      // White Liquid Glass (Pristine Apple White with subtle radial ambient glow)
      const bgGradient = ctx.createRadialGradient(
        mouse.isHovered ? mouse.x : width / 2, mouse.isHovered ? mouse.y : height / 2, 20,
        mouse.isHovered ? mouse.x : width / 2, mouse.isHovered ? mouse.y : height / 2, Math.max(width, height) * 0.85
      );
      bgGradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      bgGradient.addColorStop(0.45, 'rgba(248, 249, 253, 0.98)');
      bgGradient.addColorStop(0.85, 'rgba(240, 243, 249, 0.96)');
      bgGradient.addColorStop(1, '#e8ebf3');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);
    }

    // Update and draw ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rip = ripples[i];
      rip.radius += rip.speed;

      // Render subtle refractive wave ring
      ctx.beginPath();
      ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
      const waveAlpha = (1 - rip.radius / rip.maxRadius) * 0.22;
      ctx.strokeStyle = isDark
        ? `rgba(255, 255, 255, ${waveAlpha})`
        : `rgba(15, 23, 42, ${waveAlpha * 0.85})`;
      ctx.lineWidth = 2.5;
      ctx.stroke();

      if (rip.radius > rip.maxRadius) {
        ripples.splice(i, 1);
      }
    }

    // Connect dots near cursor with fine glass strands
    if (window.AuraBackground.connectionLines && mouse.isHovered) {
      ctx.beginPath();
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.14)' : 'rgba(15, 23, 42, 0.12)';
      ctx.lineWidth = 0.85;
      const nearDots = [];

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        const dist = Math.hypot(d.x - mouse.x, d.y - mouse.y);
        if (dist < 115) {
          nearDots.push(d);
        }
      }

      for (let i = 0; i < nearDots.length; i++) {
        for (let j = i + 1; j < nearDots.length; j++) {
          const d1 = nearDots[i];
          const d2 = nearDots[j];
          const lineDist = Math.hypot(d1.x - d2.x, d1.y - d2.y);
          if (lineDist < 58) {
            ctx.moveTo(d1.x, d1.y);
            ctx.lineTo(d2.x, d2.y);
          }
        }
      }
      ctx.stroke();
    }

    // Update and draw dots
    for (let i = 0; i < dots.length; i++) {
      dots[i].update(time);
      dots[i].draw(ctx, isDark);
    }

    // Subtle Liquid Glass Specular Lens under cursor
    if (mouse.isHovered) {
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 8, 0, Math.PI * 2);
      if (isDark) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
      } else {
        ctx.fillStyle = 'rgba(15, 23, 42, 0.08)';
        ctx.strokeStyle = 'rgba(15, 23, 42, 0.25)';
      }
      ctx.lineWidth = 1;
      ctx.fill();
      ctx.stroke();
    }

    animationFrameId = requestAnimationFrame(render);
  }

  // Initialize
  initDots();
  window.AuraBackground.setTheme(window.AuraBackground.theme);
  animationFrameId = requestAnimationFrame(render);
})();
