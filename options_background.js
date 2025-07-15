// --- Helper function for noise generation ---
const noise = (() => {
    let p = new Uint8Array(512);
    for (let i = 0; i < 256; i++) p[i] = p[i + 256] = i;
    for (let i = 255; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [p[i], p[j]] = [p[j], p[i]];
    }

    const fade = t => t * t * t * (t * (t * 6 - 15) + 10);
    const lerp = (t, a, b) => a + t * (b - a);
    const grad = (hash, x, y) => {
        const h = hash & 15;
        const u = h < 8 ? x : y;
        const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
        return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
    };

    return (x, y) => {
        const X = Math.floor(x) & 255, Y = Math.floor(y) & 255;
        x -= Math.floor(x); y -= Math.floor(y);
        const u = fade(x), v = fade(y);
        const A = p[X] + Y, B = p[X + 1] + Y;
        return lerp(v, lerp(u, grad(p[A], x, y), grad(p[B], x - 1, y)),
                       lerp(u, grad(p[A + 1], x, y - 1), grad(p[B + 1], x - 1, y - 1)));
    };
})();

// --- Particle Class ---
class Particle {
    constructor(x, y, w, h) {
        this.w = w; this.h = h;
        this.x = x || Math.random() * this.w;
        this.y = y || Math.random() * this.h;
        this.vx = (Math.random() - 0.5) * 0.5;
        this.vy = (Math.random() - 0.5) * 0.5;
        this.life = this.initialLife = Math.random() * 100 + 50;
        this.radius = Math.random() * 1.5 + 0.5;
    }

    update() {
        this.x += this.vx; this.y += this.vy; this.life--;
        if (this.x < 0 || this.x > this.w || this.y < 0 || this.y > this.h || this.life <= 0) {
            this.reset();
        }
    }

    reset() {
        this.x = Math.random() * this.w; this.y = Math.random() * this.h;
        this.vx = (Math.random() - 0.5) * 0.5; this.vy = (Math.random() - 0.5) * 0.5;
        this.life = this.initialLife = Math.random() * 100 + 50;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.fillStyle = `hsla(0, 0%, 100%, ${this.life / this.initialLife * 0.5})`;
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}

// --- Metaball Class ---
class Metaball {
    constructor(w, h) {
        this.w = w; this.h = h;
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.r = Math.random() * 120 + 100; // Larger blobs
        this.hue = Math.random() * 360;
        this.noiseStep = 0;
    }

    update() {
        this.x += this.vx; this.y += this.vy; this.hue = (this.hue + 0.05) % 360; // Even slower color transition
        this.noiseStep += 0.005;

        if (this.x > this.w + this.r) this.x = -this.r;
        if (this.x < -this.r) this.x = this.w + this.r;
        if (this.y > this.h + this.r) this.y = -this.r;
        if (this.y < -this.r) this.y = this.h + this.r;
    }

    draw(ctx) {
        const segments = 32;
        ctx.beginPath();
        ctx.fillStyle = `hsl(${this.hue}, 100%, 60%)`;
        for (let i = 0; i < segments; i++) {
            const angle = (i / segments) * Math.PI * 2;
            const noiseFactor = (noise(Math.cos(angle) + this.noiseStep, Math.sin(angle) + this.noiseStep) + 1) * 0.5;
            const radius = this.r * (0.7 + noiseFactor * 0.6); // More shape distortion
            const x = this.x + Math.cos(angle) * radius;
            const y = this.y + Math.sin(angle) * radius;
            i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
    }
}

// --- Main Animation Class ---
class GradientAnimation {
    constructor() {
        this.cnv = document.querySelector('#gradient-canvas');
        this.ctx = this.cnv.getContext('2d');
        this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
        this.mouseBall = { x: this.mouse.x, y: this.mouse.y, r: 100, hue: 210 };

        this.metaballs = [];
        this.particles = [];
        this.numMetaballs = 8;
        this.numParticles = 100;

        (window.onresize = this.setCanvasSize.bind(this))();
        this.init();
        this.animate();

        window.addEventListener('mousemove', e => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });
    }

    setCanvasSize() {
        this.w = this.cnv.width = window.innerWidth;
        this.h = this.cnv.height = window.innerHeight;
    }

    init() {
        this.metaballs = [];
        for (let i = 0; i < this.numMetaballs; i++) {
            this.metaballs.push(new Metaball(this.w, this.h));
        }
        this.particles = [];
        for (let i = 0; i < this.numParticles; i++) {
            this.particles.push(new Particle(null, null, this.w, this.h));
        }
    }

    update() {
        // Smoother mouse follow
        this.mouseBall.x += (this.mouse.x - this.mouseBall.x) * 0.08;
        this.mouseBall.y += (this.mouse.y - this.mouseBall.y) * 0.08;

        this.metaballs.forEach(ball => ball.update());
        this.particles.forEach(p => p.update());
        this.draw();
    }

    draw() {
        this.ctx.clearRect(0, 0, this.w, this.h);

        // Draw particles first, without the metaball filter
        this.particles.forEach(p => p.draw(this.ctx));

        this.ctx.filter = 'blur(30px) contrast(35)'; // More gooey/slimy effect
        this.ctx.globalCompositeOperation = 'lighter';

        // Draw mouse ball as a special metaball
        const mouseMetaBall = new Metaball(this.w, this.h);
        mouseMetaBall.x = this.mouseBall.x; mouseMetaBall.y = this.mouseBall.y;
        mouseMetaBall.r = this.mouseBall.r; mouseMetaBall.hue = this.mouseBall.hue;
        mouseMetaBall.draw(this.ctx);

        this.metaballs.forEach(ball => ball.draw(this.ctx));

        this.ctx.filter = 'none';
        this.ctx.globalCompositeOperation = 'source-over';
    }

    animate() {
        this.update();
        requestAnimationFrame(this.animate.bind(this));
    }
}

window.addEventListener('load', () => new GradientAnimation());
