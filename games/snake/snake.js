document.addEventListener('DOMContentLoaded', () => {

    // ─────────────────────────── SETUP ───────────────────────────────
    const canvas  = document.getElementById('gameCanvas');
    const ctx     = canvas.getContext('2d');
    const scoreEl = document.getElementById('score');
    const hsEl    = document.getElementById('highscore');

    const HS_KEY     = 'highscore_snake';
    const GRID       = 20;
    const COLS       = canvas.width  / GRID;   // 40
    const ROWS       = canvas.height / GRID;   // 30
    const BASE_SPEED = 130;   // ms per tick at score 0
    const MIN_SPEED  = 55;    // fastest possible tick

    // ─────────────────────────── STATE ───────────────────────────────
    let snake, food, score, dir, nextDir, gameOver, rafId;
    let lastTick = 0, gameSpeed = BASE_SPEED;
    let particles = [], scorePops = [];
    let foodPulse = 0;
    let goAnim = null;
    let countdown = 0, cdInterval = null;
    let gameOverHandled = false;

    // ─────────────────────────── AUDIO ───────────────────────────────
    let audioCtx = null;
    function getAudio() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        return audioCtx;
    }
    function playTone(freq, type, dur, vol = 0.1, freqEnd = null) {
        try {
            const ac   = getAudio();
            const osc  = ac.createOscillator();
            const gain = ac.createGain();
            osc.connect(gain); gain.connect(ac.destination);
            osc.type = type;
            osc.frequency.setValueAtTime(freq, ac.currentTime);
            if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, ac.currentTime + dur);
            gain.gain.setValueAtTime(vol, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
            osc.start(); osc.stop(ac.currentTime + dur);
        } catch(e) {}
    }
    function sfxEat()   { playTone(440, 'sine',     0.14, 0.09, 880); }
    function sfxDie()   { playTone(200, 'sawtooth', 0.40, 0.16, 55);  }
    function sfxLevel() { playTone(523, 'sine',     0.28, 0.07, 880); }

    // ─────────────────────────── HIGH SCORE ──────────────────────────
    function loadHS() {
        const hs = localStorage.getItem(HS_KEY);
        if (hsEl) hsEl.textContent = hs || '--';
    }
    function saveHS(s) {
        const cur = parseInt(localStorage.getItem(HS_KEY) || '0');
        if (s > cur) {
            localStorage.setItem(HS_KEY, s);
            if (hsEl) hsEl.textContent = s;
        }
    }

    // ─────────────────────────── PARTICLES ───────────────────────────
    function createEatParticles(gx, gy) {
        const cx = gx * GRID + GRID / 2;
        const cy = gy * GRID + GRID / 2;
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2 + Math.random() * 0.4;
            const speed = 1.5 + Math.random() * 4;
            particles.push({
                x: cx, y: cy,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0, decay: 0.04 + Math.random() * 0.03,
                size: 2 + Math.random() * 4,
                color: Math.random() > 0.5 ? '#ff3e88' : '#ffcc00'
            });
        }
    }

    function createDeathParticles() {
        snake.forEach(seg => {
            const cx = seg.x * GRID + GRID / 2;
            const cy = seg.y * GRID + GRID / 2;
            for (let i = 0; i < 3; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 1 + Math.random() * 4.5;
                particles.push({
                    x: cx, y: cy,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 1,
                    life: 1.0, decay: 0.022 + Math.random() * 0.025,
                    size: 3 + Math.random() * 4,
                    color: Math.random() > 0.4 ? '#00dc82' : '#00ff99'
                });
            }
        });
    }

    function updateParticles() {
        particles = particles.filter(p => p.life > 0);
        particles.forEach(p => {
            p.x += p.vx; p.y += p.vy;
            p.vy += 0.07;
            p.life -= p.decay;
            if (p.life <= 0) return; // guard: skip draw if life crossed zero this frame
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.shadowBlur = 8; ctx.shadowColor = p.color;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    // ─────────────────────────── SCORE POPS ──────────────────────────
    function createScorePop(gx, gy) {
        scorePops.push({ x: gx * GRID + GRID / 2, y: gy * GRID, life: 1.0 });
    }
    function updateScorePops() {
        scorePops = scorePops.filter(p => p.life > 0);
        scorePops.forEach(p => {
            p.y -= 1.2; p.life -= 0.025;
            ctx.save();
            ctx.globalAlpha = p.life;
            ctx.textAlign = 'center';
            ctx.font = 'bold 15px monospace';
            ctx.fillStyle = '#ff3e88';
            ctx.shadowBlur = 8; ctx.shadowColor = '#ff3e88';
            ctx.fillText('+1', p.x, p.y);
            ctx.restore();
        });
    }

    // ─────────────────────────── DRAW HELPERS ────────────────────────
    function drawBackground() {
        ctx.fillStyle = '#0d1117';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Rounded rectangle fill helper (cross-browser safe)
    function fillRR(x, y, w, h, r, color, glow = 0) {
        ctx.save();
        ctx.fillStyle = color;
        if (glow > 0) { ctx.shadowBlur = glow; ctx.shadowColor = color; }
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);   ctx.quadraticCurveTo(x + w, y,     x + w, y + r);
        ctx.lineTo(x + w, y + h - r); ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);   ctx.quadraticCurveTo(x,     y + h, x,     y + h - r);
        ctx.lineTo(x, y + r);       ctx.quadraticCurveTo(x,     y,     x + r, y);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    function drawSnake() {
        const len = snake.length;
        snake.forEach((seg, i) => {
            const t      = i / Math.max(len, 6);
            const isHead = i === 0;
            const pad    = isHead ? 1 : 2;
            const r      = isHead ? 7 : 3;

            let color, glow;
            if (isHead) {
                color = '#00ff9a'; glow = 20;
            } else {
                const g = Math.max(70, Math.floor(220 - t * 150));
                const b = Math.min(90, Math.floor(t * 90));
                color = `rgb(0, ${g}, ${b})`;
                glow = Math.max(3, Math.round(12 - t * 10));
            }

            fillRR(
                seg.x * GRID + pad, seg.y * GRID + pad,
                GRID - pad * 2,     GRID - pad * 2,
                r, color, glow
            );
        });

        // Directional eyes on head
        const hx = snake[0].x * GRID;
        const hy = snake[0].y * GRID;
        const G  = GRID;
        let e1, e2;
        switch (dir) {
            case 'right': e1 = { x: hx+G-6, y: hy+5   }; e2 = { x: hx+G-6, y: hy+G-9 }; break;
            case 'left':  e1 = { x: hx+3,   y: hy+5   }; e2 = { x: hx+3,   y: hy+G-9 }; break;
            case 'up':    e1 = { x: hx+5,   y: hy+3   }; e2 = { x: hx+G-9, y: hy+3   }; break;
            case 'down':  e1 = { x: hx+5,   y: hy+G-6 }; e2 = { x: hx+G-9, y: hy+G-6 }; break;
        }
        ctx.save();
        ctx.fillStyle = '#fff';
        ctx.shadowBlur = 4; ctx.shadowColor = '#fff';
        ctx.beginPath(); ctx.arc(e1.x, e1.y, 2.5, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(e2.x, e2.y, 2.5, 0, Math.PI*2); ctx.fill();
        ctx.fillStyle = '#000'; ctx.shadowBlur = 0;
        ctx.beginPath(); ctx.arc(e1.x+0.6, e1.y+0.6, 1.3, 0, Math.PI*2); ctx.fill();
        ctx.beginPath(); ctx.arc(e2.x+0.6, e2.y+0.6, 1.3, 0, Math.PI*2); ctx.fill();
        ctx.restore();
    }

    function drawFood() {
        foodPulse += 0.1;
        const pulse = Math.sin(foodPulse) * 1.5;
        const x = food.x * GRID + GRID / 2;
        const y = food.y * GRID + GRID / 2;
        const r = GRID / 2 - 3 + pulse;

        ctx.save();
        // Outer glow ring
        ctx.shadowBlur = 22 + pulse * 3; ctx.shadowColor = '#ff3e88';
        ctx.fillStyle  = '#ff3e88';
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
        // Inner specular highlight
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 0.65;
        ctx.fillStyle = '#ffaacc';
        ctx.beginPath(); ctx.arc(x - r*0.3, y - r*0.35, r*0.38, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    function drawScanlines() {
        ctx.save();
        ctx.globalAlpha = 0.04;
        ctx.fillStyle = '#000';
        for (let y = 0; y < canvas.height; y += 4) {
            ctx.fillRect(0, y, canvas.width, 2);
        }
        ctx.restore();
    }

    function drawHUD() {
        const level = Math.max(1, Math.floor((BASE_SPEED - gameSpeed) / 15) + 1);
        ctx.save();
        ctx.font        = 'bold 13px monospace';
        ctx.fillStyle   = '#00dc82';
        ctx.textAlign   = 'right';
        ctx.shadowBlur  = 8; ctx.shadowColor = '#00dc82';
        ctx.fillText(`LVL ${level}`, canvas.width - 10, 22);
        ctx.restore();
    }

    // ─────────────────────────── COUNTDOWN ───────────────────────────
    function drawCountdown() {
        drawBackground();
        drawFood();
        drawSnake();
        drawScanlines();

        ctx.save();
        // Semi-transparent overlay band
        ctx.fillStyle = 'rgba(0,0,0,0.55)';
        ctx.fillRect(0, canvas.height / 2 - 85, canvas.width, 130);

        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(180,200,210,0.8)';
        ctx.font = 'bold 18px monospace';
        ctx.fillText('GET READY', canvas.width / 2, canvas.height / 2 - 20);

        ctx.font        = 'bold 72px monospace';
        ctx.fillStyle   = '#00dc82';
        ctx.shadowBlur  = 32; ctx.shadowColor = '#00dc82';
        ctx.fillText(countdown > 0 ? countdown : 'GO!', canvas.width / 2, canvas.height / 2 + 48);
        ctx.restore();
    }

    function startCountdown() {
        countdown = 3;
        drawCountdown();
        cdInterval = setInterval(() => {
            countdown--;
            if (countdown <= 0) {
                clearInterval(cdInterval);
                drawCountdown();
                setTimeout(() => {
                    countdown = 0;
                    lastTick  = performance.now();
                    rafId     = requestAnimationFrame(gameLoop);
                }, 500);
            } else {
                drawCountdown();
            }
        }, 900);
    }

    // ─────────────────────────── GAME LOGIC ──────────────────────────
    function placeFood() {
        let pos;
        do {
            pos = {
                x: Math.floor(Math.random() * COLS),
                y: Math.floor(Math.random() * ROWS)
            };
        } while (snake.some(s => s.x === pos.x && s.y === pos.y));
        food = pos;
    }

    function setDir(d) {
        const opp = { up: 'down', down: 'up', left: 'right', right: 'left' };
        if (dir !== opp[d]) nextDir = d;
    }

    function updateGameLogic() {
        dir = nextDir;
        const head = { x: snake[0].x, y: snake[0].y };
        switch (dir) {
            case 'up':    head.y--; break;
            case 'down':  head.y++; break;
            case 'left':  head.x--; break;
            case 'right': head.x++; break;
        }

        // Wall collision
        if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
            gameOver = true; return;
        }
        // Self collision
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver = true; return;
            }
        }

        snake.unshift(head);

        if (head.x === food.x && head.y === food.y) {
            score++;
            scoreEl.innerText = score;
            createEatParticles(food.x, food.y);
            createScorePop(food.x, food.y);
            sfxEat();
            const prevSpeed = gameSpeed;
            gameSpeed = Math.max(MIN_SPEED, BASE_SPEED - score * 4);
            if (gameSpeed < prevSpeed && (BASE_SPEED - gameSpeed) % 40 === 0) sfxLevel();
            placeFood();
        } else {
            snake.pop();
        }
    }

    function draw() {
        drawBackground();
        updateParticles();
        drawFood();
        drawSnake();
        updateScorePops();
        drawHUD();
        drawScanlines();
    }

    function gameLoop(now) {
        rafId = requestAnimationFrame(gameLoop);

        // Game logic runs at the throttled tick rate (snake speed)
        if (now - lastTick >= gameSpeed) {
            lastTick = now;
            updateGameLogic();
        }

        // Detect game over in the same frame it was set — cancel pending loop immediately
        if (gameOver && !gameOverHandled) {
            gameOverHandled = true;
            cancelAnimationFrame(rafId);
            draw(); // render the final death frame
            sfxDie();
            createDeathParticles();
            showGameOver(); // reads prevBest before saveHS updates it
            saveHS(score);
            return;
        }

        // Render always runs at 60fps — smooth particles, food pulse, animations
        draw();
    }

    // ─────────────────────────── GAME OVER ───────────────────────────
    function showGameOver() {
        const prevBest = parseInt(localStorage.getItem(HS_KEY) || '0');
        goAnim = {
            frame: 0,
            displayScore: 0,
            isNewBest: score > prevBest,
            embers: Array.from({ length: 28 }, () => ({
                x:     Math.random() * canvas.width,
                y:     canvas.height * Math.random(),
                vx:    (Math.random() - 0.5) * 1.2,
                vy:    -(0.4 + Math.random() * 1.4),
                size:  1.5 + Math.random() * 3,
                alpha: 0.3 + Math.random() * 0.5,
                color: Math.random() > 0.5 ? '#00dc82' : '#00ff99'
            }))
        };
        requestAnimationFrame(animateGameOver);
    }

    function animateGameOver() {
        if (!goAnim) return;
        goAnim.frame++;
        const f  = goAnim.frame;
        const cx = canvas.width  / 2;
        const cy = canvas.height / 2;

        // Dark overlay — semi-transparent so particles show through briefly
        ctx.fillStyle = f < 10 ? `rgba(8,11,16,${0.6 + f * 0.04})` : '#080b10';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Death particles fly out
        updateParticles();

        // Floating green embers
        goAnim.embers.forEach(em => {
            em.x += em.vx; em.y += em.vy;
            em.vx += (Math.random() - 0.5) * 0.04;
            if (em.y < -10) { em.y = canvas.height + 5; em.x = Math.random() * canvas.width; }
            ctx.save();
            ctx.globalAlpha = em.alpha;
            ctx.fillStyle   = em.color;
            ctx.shadowBlur  = 6; ctx.shadowColor = em.color;
            ctx.beginPath(); ctx.arc(em.x, em.y, em.size, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        });

        // "GAME OVER" — visible immediately, fades in over 15 frames
        const titleFade = Math.min(1, f / 15);
        ctx.save();
        ctx.textAlign   = 'center';
        ctx.globalAlpha = titleFade;
        ctx.font        = 'bold 60px monospace';
        ctx.fillStyle   = '#ff3e88';
        ctx.shadowBlur  = 36; ctx.shadowColor = '#ff0044';
        ctx.fillText('GAME OVER', cx, cy - 80);
        ctx.restore();

        // Divider
        if (f > 8) {
            ctx.save();
            ctx.globalAlpha = Math.min(0.5, (f - 8) / 12);
            ctx.strokeStyle = '#ff3e88';
            ctx.lineWidth   = 1;
            ctx.beginPath();
            ctx.moveTo(cx - 140, cy - 42); ctx.lineTo(cx + 140, cy - 42);
            ctx.stroke();
            ctx.restore();
        }

        // Score count-up — appears after 12 frames
        if (f > 12) {
            const cs = Math.max(1, Math.ceil(score / 30));
            if (goAnim.displayScore < score)
                goAnim.displayScore = Math.min(score, goAnim.displayScore + cs);
            ctx.save();
            ctx.textAlign   = 'center';
            ctx.globalAlpha = Math.min(1, (f - 12) / 15);
            ctx.font        = '14px monospace';
            ctx.fillStyle   = 'rgba(180,200,215,0.75)';
            ctx.fillText('FINAL SCORE', cx, cy - 8);
            ctx.font        = 'bold 52px monospace';
            ctx.fillStyle   = '#00dc82';
            ctx.shadowBlur  = 20; ctx.shadowColor = '#00dc82';
            ctx.fillText(goAnim.displayScore, cx, cy + 52);
            ctx.restore();
        }

        // NEW BEST banner
        if (goAnim.isNewBest && goAnim.displayScore >= score && f > 30) {
            const pulse = 0.75 + Math.sin(f * 0.15) * 0.25;
            ctx.save();
            ctx.textAlign   = 'center';
            ctx.globalAlpha = pulse * Math.min(1, (f - 30) / 12);
            ctx.font        = 'bold 20px monospace';
            ctx.fillStyle   = '#ffd700';
            ctx.shadowBlur  = 22; ctx.shadowColor = '#ffaa00';
            ctx.fillText('★  NEW BEST!  ★', cx, cy + 95);
            ctx.restore();
        }

        // Restart prompt — blinks after 50 frames
        if (f > 50) {
            const blink = Math.floor(f / 22) % 2 === 0;
            ctx.save();
            ctx.textAlign   = 'center';
            ctx.globalAlpha = blink ? 0.9 : 0.2;
            ctx.font        = '13px monospace';
            ctx.fillStyle   = '#8899aa';
            ctx.fillText('[ ENTER ] or tap to play again', cx, cy + 130);
            ctx.restore();
        }

        drawScanlines();
        requestAnimationFrame(animateGameOver); // stopped by goAnim=null in init()
    }

    // ─────────────────────────── INIT ────────────────────────────────
    function init() {
        snake     = [{ x: 14, y: 15 }, { x: 13, y: 15 }, { x: 12, y: 15 }];
        dir       = 'right'; nextDir = 'right';
        score     = 0; gameOver = false; gameOverHandled = false;
        particles = []; scorePops = [];
        goAnim    = null; foodPulse = 0;
        gameSpeed = BASE_SPEED;
        scoreEl.innerText = 0;
        loadHS();
        placeFood();
        if (rafId)      cancelAnimationFrame(rafId);
        if (cdInterval) clearInterval(cdInterval);
        startCountdown();
    }

    // ─────────────────────────── CONTROLS ────────────────────────────
    document.addEventListener('keydown', e => {
        if (gameOver && e.key === 'Enter') { init(); return; }
        if (countdown > 0) return;
        switch (e.key) {
            case 'ArrowUp':    case 'w': case 'W': setDir('up');    break;
            case 'ArrowDown':  case 's': case 'S': setDir('down');  break;
            case 'ArrowLeft':  case 'a': case 'A': setDir('left');  break;
            case 'ArrowRight': case 'd': case 'D': setDir('right'); break;
        }
    });

    const dpadMap = { 'btn-up': 'up', 'btn-down': 'down', 'btn-left': 'left', 'btn-right': 'right' };
    Object.entries(dpadMap).forEach(([id, d]) => {
        const btn = document.getElementById(id);
        if (!btn) return;
        btn.addEventListener('touchstart', e => { e.preventDefault(); setDir(d); }, { passive: false });
        btn.addEventListener('click', () => setDir(d));
    });

    init();
});
