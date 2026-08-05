/* ==========================================================================
   INTERACTIVE CANVAS PARTICLE ENGINE (Floating 3D Hearts, Bokeh, Mouse Trail)
   ========================================================================== */

export class ParticleEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');

    this.particles = [];
    this.mouseTrail = [];
    this.confetti = [];
    
    this.mouse = { x: -1000, y: -1000, active: false };

    this.initCanvas();
    this.createInitialParticles(60);
    this.bindEvents();
    this.animate();
  }

  initCanvas() {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
  }

  bindEvents() {
    window.addEventListener('resize', () => this.initCanvas());

    window.addEventListener('mousemove', (e) => {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
      this.mouse.active = true;
      this.addMouseTrailParticle(e.clientX, e.clientY);
    });

    window.addEventListener('touchmove', (e) => {
      if (e.touches.length > 0) {
        this.mouse.x = e.touches[0].clientX;
        this.mouse.y = e.touches[0].clientY;
        this.addMouseTrailParticle(this.mouse.x, this.mouse.y);
      }
    });
  }

  createInitialParticles(count) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        size: Math.random() * 14 + 6,
        speedY: Math.random() * 0.8 + 0.3,
        swaySpeed: Math.random() * 0.02 + 0.005,
        swayAngle: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.6 + 0.2,
        color: this.getRandomHeartColor(),
        type: Math.random() > 0.3 ? 'heart' : 'bokeh'
      });
    }
  }

  getRandomHeartColor() {
    const colors = [
      '#ff4d6d', '#ff758c', '#ffb3c1', '#ffe5a3', '#ff85a1', '#e0aaff'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  addMouseTrailParticle(x, y) {
    this.mouseTrail.push({
      x: x + (Math.random() - 0.5) * 10,
      y: y + (Math.random() - 0.5) * 10,
      size: Math.random() * 10 + 6,
      opacity: 1,
      life: 0.03,
      color: this.getRandomHeartColor()
    });
  }

  triggerConfettiBurst(x, y) {
    for (let i = 0; i < 120; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 12 + 4;
      this.confetti.push({
        x: x || this.width / 2,
        y: y || this.height / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 4,
        size: Math.random() * 8 + 4,
        color: this.getRandomHeartColor(),
        opacity: 1,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      });
    }
  }

  drawHeart(x, y, size, color, opacity) {
    this.ctx.save();
    this.ctx.globalAlpha = opacity;
    this.ctx.fillStyle = color;
    this.ctx.shadowColor = color;
    this.ctx.shadowBlur = size * 1.2;

    this.ctx.beginPath();
    const d = size;
    this.ctx.moveTo(x, y);
    this.ctx.bezierCurveTo(x - d / 2, y - d / 2, x - d, y + d / 3, x, y + d);
    this.ctx.bezierCurveTo(x + d, y + d / 3, x + d / 2, y - d / 2, x, y);
    this.ctx.fill();
    this.ctx.restore();
  }

  drawBokeh(x, y, size, color, opacity) {
    this.ctx.save();
    this.ctx.globalAlpha = opacity * 0.4;
    const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, size * 2);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'transparent');
    this.ctx.fillStyle = gradient;
    this.ctx.beginPath();
    this.ctx.arc(x, y, size * 2, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }

  animate() {
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Update Floating Particles
    this.particles.forEach((p) => {
      p.y -= p.speedY;
      p.swayAngle += p.swaySpeed;
      p.x += Math.sin(p.swayAngle) * 0.5;

      if (p.y < -30) {
        p.y = this.height + 20;
        p.x = Math.random() * this.width;
      }

      if (p.type === 'heart') {
        this.drawHeart(p.x, p.y, p.size, p.color, p.opacity);
      } else {
        this.drawBokeh(p.x, p.y, p.size, p.color, p.opacity);
      }
    });

    // Update Mouse Trail Particles
    for (let i = this.mouseTrail.length - 1; i >= 0; i--) {
      const trail = this.mouseTrail[i];
      trail.opacity -= trail.life;
      trail.y -= 1;
      this.drawHeart(trail.x, trail.y, trail.size, trail.color, trail.opacity);
      if (trail.opacity <= 0) {
        this.mouseTrail.splice(i, 1);
      }
    }

    // Update Confetti Burst Particles
    for (let i = this.confetti.length - 1; i >= 0; i--) {
      const c = this.confetti[i];
      c.x += c.vx;
      c.y += c.vy;
      c.vy += 0.2; // gravity
      c.opacity -= 0.015;
      c.rotation += c.rotationSpeed;

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(c.opacity, 0);
      this.ctx.translate(c.x, c.y);
      this.ctx.rotate((c.rotation * Math.PI) / 180);
      this.ctx.fillStyle = c.color;
      this.ctx.fillRect(-c.size / 2, -c.size / 2, c.size, c.size * 1.5);
      this.ctx.restore();

      if (c.opacity <= 0) {
        this.confetti.splice(i, 1);
      }
    }

    requestAnimationFrame(() => this.animate());
  }
}
