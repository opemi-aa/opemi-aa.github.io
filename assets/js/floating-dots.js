// Particle Network Background
(function () {
    const canvas = document.createElement('canvas');
    canvas.id = 'bg-canvas';
    canvas.style.cssText = [
        'position:fixed', 'top:0', 'left:0',
        'width:100%', 'height:100%',
        'z-index:-5', 'pointer-events:none'
    ].join(';');
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const COUNT     = 72;
    const LINK_DIST = 145;
    const MOUSE_R   = 170;
    const GRN = [0, 220, 130];
    const PNK = [255, 62, 136];

    let W, H, particles = [];
    const mouse = { x: -9999, y: -9999 };

    function Particle() {
        this.x     = Math.random() * (W || window.innerWidth);
        this.y     = Math.random() * (H || window.innerHeight);
        const spd  = 0.1 + Math.random() * 0.22;
        const ang  = Math.random() * Math.PI * 2;
        this.vx    = Math.cos(ang) * spd;
        this.vy    = Math.sin(ang) * spd;
        this.r     = 1.0 + Math.random() * 2.0;
        this.phase = Math.random() * Math.PI * 2;
        this.base  = 0.25 + Math.random() * 0.45;
        this.col   = Math.random() > 0.88 ? PNK : GRN;
    }

    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
        if (!particles.length) {
            particles = Array.from({ length: COUNT }, () => new Particle());
        }
    }

    function draw() {
        ctx.clearRect(0, 0, W, H);

        // Update
        particles.forEach(p => {
            p.x = (p.x + p.vx + W) % W;
            p.y = (p.y + p.vy + H) % H;
            p.phase += 0.015;
        });

        // Links
        for (let i = 0; i < COUNT; i++) {
            const a = particles[i];
            for (let j = i + 1; j < COUNT; j++) {
                const b  = particles[j];
                const dx = a.x - b.x, dy = a.y - b.y;
                const d2 = dx * dx + dy * dy;
                if (d2 > LINK_DIST * LINK_DIST) continue;

                const t  = 1 - Math.sqrt(d2) / LINK_DIST;
                const ma = Math.hypot(a.x - mouse.x, a.y - mouse.y);
                const mb = Math.hypot(b.x - mouse.x, b.y - mouse.y);
                const mboost = Math.max(0, 1 - Math.min(ma, mb) / MOUSE_R) * 0.55;

                const [r, g, bl] = (a.col === PNK || b.col === PNK) ? PNK : GRN;
                ctx.globalAlpha = Math.min(0.55, t * 0.18 + mboost * 0.38);
                ctx.strokeStyle = `rgb(${r},${g},${bl})`;
                ctx.lineWidth   = 0.4 + t * 1.1;
                ctx.beginPath();
                ctx.moveTo(a.x, a.y);
                ctx.lineTo(b.x, b.y);
                ctx.stroke();
            }
        }

        // Particles
        particles.forEach(p => {
            const pulse  = 0.75 + 0.25 * Math.sin(p.phase);
            const md     = Math.hypot(p.x - mouse.x, p.y - mouse.y);
            const mboost = Math.max(0, 1 - md / MOUSE_R) * 0.65;
            const alpha  = Math.min(1, p.base * pulse + mboost);
            const [r, g, b] = p.col;

            // Soft glow halo (drawn large + transparent — avoids costly shadowBlur)
            ctx.globalAlpha = alpha * 0.18;
            ctx.fillStyle   = `rgb(${r},${g},${b})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r * 4.5, 0, Math.PI * 2);
            ctx.fill();

            // Bright core
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        });

        ctx.globalAlpha = 1;
        requestAnimationFrame(draw);
    }

    window.addEventListener('resize',    resize);
    window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
    window.addEventListener('mouseleave', () => { mouse.x = -9999;    mouse.y = -9999; });

    resize();
    draw();
})();

// Scroll to top button
const scrollToTopBtn = document.getElementById('scrollToTopBtn');
window.onscroll = function () {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        scrollToTopBtn.style.display = 'block';
    } else {
        scrollToTopBtn.style.display = 'none';
    }
};
scrollToTopBtn.addEventListener('click', function () {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
});
