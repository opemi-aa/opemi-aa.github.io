document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');
    const highscoreElement = document.getElementById('highscore');

    const HS_KEY = 'highscore_spacewar';
    const PIXEL_UNIT = 12;
    const BASE_PLAYER_SPEED = 5;
    const BASE_BULLET_SPEED = 8;
    const BASE_ENEMY_SPEED = 2;
    const BASE_SPAWN_INTERVAL = 2000;

    let player, bullets, enemies, score, gameOver, enemyIntervalId;
    let particles = [];
    let scorePops = [];
    let impactFlashes = [];
    let deathAnim = null;
    let dying = false;
    let paused = false;
    let difficultyLevel = 1;
    let lastDifficultyScore = 0;
    let shakeTimer = 0;
    let shakeMag = 0;
    let levelUpFlash = 0;
    let lives = 3;
    let invincible = 0;      // frames of post-hit invincibility
    let exhaustParticles = [];
    let enemyBullets = [];
    let powerups = [];
    let activePowerup = null;   // { type, timer }
    let boss = null;
    let bossWarning = 0;
    let killCount = 0;          // total enemy kills (triggers boss every 15)
    let countdown = 0;
    let countdownId = null;
    let audioCtx = null;
    let fireHeld = false;
    let fireCooldown = 0;
    let warpCooldown = 0;        // frames until warp available again (180 = 3s)
    let lastTapKey = null;       // 'left' or 'right'
    let lastTapTime = 0;         // timestamp of first tap
    const WARP_DIST = 120;       // pixels per dash
    const WARP_COOLDOWN = 180;
    let combo = 0;
    let comboTimer = 0;       // frames until combo resets (120 = ~2 sec)
    let comboDisplay = null;  // { text, x, y, life }
    let bonusStars = [];
    let bonusStarTimer = 0;   // frames until next possible star spawn

    const pauseBtn = document.getElementById('pauseButton');

    function togglePause() {
        if (gameOver || dying) return;
        paused = !paused;
        if (pauseBtn) {
            pauseBtn.textContent = paused ? '▶ RESUME' : '⏸ PAUSE';
            pauseBtn.classList.toggle('paused', paused);
        }
        if (paused) {
            drawPauseOverlay();
        } else {
            requestAnimationFrame(update);
        }
    }

    if (pauseBtn) {
        pauseBtn.addEventListener('click', togglePause);
    }

    // ---- Starfield (3 layers) ----
    const stars = [
        ...Array.from({ length: 60 }, () => ({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, speed: 0.3, r: 1,   a: 0.3 })),
        ...Array.from({ length: 30 }, () => ({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, speed: 0.8, r: 1.5, a: 0.6 })),
        ...Array.from({ length: 15 }, () => ({ x: Math.random() * canvas.width, y: Math.random() * canvas.height, speed: 1.8, r: 2,   a: 0.95 }))
    ];

    // ---- Nebulae ----
    const nebulae = [
        { x: 0.15, y: 0.28, r: 200, color: '120, 40, 220' },   // purple
        { x: 0.80, y: 0.52, r: 170, color: '20,  80, 200' },   // blue
        { x: 0.48, y: 0.78, r: 140, color: '180, 20,  80' },   // deep pink
        { x: 0.62, y: 0.12, r: 120, color: '0,  100, 180' },   // teal-blue
    ];

    // ---- High Score ----
    function loadHighScore() {
        const hs = localStorage.getItem(HS_KEY);
        if (highscoreElement) highscoreElement.textContent = hs || '--';
    }

    function saveHighScore(s) {
        const current = parseInt(localStorage.getItem(HS_KEY) || '0');
        if (s > current) {
            localStorage.setItem(HS_KEY, s);
            if (highscoreElement) highscoreElement.textContent = s;
        }
    }

    // ---- Difficulty ----
    function getEnemyColor(level) {
        if (level >= 4) return '#ffff00';   // yellow — max danger
        if (level >= 3) return '#ff8c00';   // orange — danger
        if (level >= 2) return '#ff6060';   // red-ish
        return '#ff3e88';                   // default pink
    }

    function updateDifficulty() {
        const newLevel = 1 + Math.floor(score / 8);
        if (newLevel !== difficultyLevel) {
            difficultyLevel = newLevel;
            levelUpFlash = 40;
            sfxLevelUp();
            restartSpawnInterval();
        }
    }

    function restartSpawnInterval() {
        if (enemyIntervalId) clearInterval(enemyIntervalId);
        const interval = Math.max(600, BASE_SPAWN_INTERVAL - (score * 55));
        enemyIntervalId = setInterval(spawnEnemy, interval);
    }

    // ---- Pixel ship drawing (with optional glow) ----
    function drawPixelCharacter(x, y, color, orientation, glowColor = null) {
        ctx.save();
        if (glowColor) {
            ctx.shadowBlur = 14;
            ctx.shadowColor = glowColor;
        }
        ctx.fillStyle = color;
        const pixels = [[1,0],[0,1],[1,1],[2,1],[1,2],[0,3],[2,3]];
        pixels.forEach(([px, py]) => {
            const ry = orientation === 'up' ? y + py * PIXEL_UNIT : y + (3 - py) * PIXEL_UNIT;
            ctx.fillRect(x + px * PIXEL_UNIT, ry, PIXEL_UNIT, PIXEL_UNIT);
        });
        ctx.restore();
    }

    // ---- CRT Scanline overlay ----
    function drawScanlines() {
        ctx.save();
        ctx.globalAlpha = 0.04;
        ctx.fillStyle = '#000000';
        for (let y = 0; y < canvas.height; y += 4) {
            ctx.fillRect(0, y, canvas.width, 2);
        }
        ctx.restore();
    }

    // ---- Screen shake ----
    function triggerShake(mag, duration) {
        shakeMag = mag;
        shakeTimer = duration;
    }

    function applyShake() {
        if (shakeTimer <= 0) return;
        const dx = (Math.random() - 0.5) * shakeMag * 2;
        const dy = (Math.random() - 0.5) * shakeMag * 2;
        ctx.translate(dx, dy);
        shakeTimer--;
        if (shakeTimer <= 0) shakeMag = 0;
    }

    // ---- Impact flash ----
    function createImpactFlash(x, y) {
        impactFlashes.push({ x, y, life: 1.0 });
    }

    function updateImpactFlashes() {
        impactFlashes = impactFlashes.filter(f => f.life > 0);
        impactFlashes.forEach(f => {
            f.life -= 0.15;
            ctx.save();
            ctx.globalAlpha = f.life * 0.9;
            ctx.fillStyle = '#ffffff';
            const r = (1 - f.life) * 18 + 4;
            ctx.beginPath();
            ctx.arc(f.x, f.y, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = f.life * 0.5;
            ctx.fillStyle = '#00ffff';
            ctx.beginPath();
            ctx.arc(f.x, f.y, r * 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        });
    }

    // ---- Nebulae ----
    function drawNebulae() {
        nebulae.forEach(n => {
            const x = n.x * canvas.width;
            const y = n.y * canvas.height;
            const grad = ctx.createRadialGradient(x, y, 0, x, y, n.r);
            grad.addColorStop(0, `rgba(${n.color}, 0.13)`);
            grad.addColorStop(1, `rgba(${n.color}, 0)`);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, n.r, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    // ---- Starfield tint based on difficulty ----
    function getStarTint() {
        const t = Math.min(1, (difficultyLevel - 1) / 3); // 0 at level1, 1 at level4+
        const g = Math.round(255 - t * 105); // 255 → 150
        const b = Math.round(255 - t * 155); // 255 → 100
        return `rgb(255,${g},${b})`;
    }

    // ---- Starfield ----
    function drawStars() {
        const tint = getStarTint();
        stars.forEach(s => {
            s.y += s.speed;
            if (s.y > canvas.height) { s.y = 0; s.x = Math.random() * canvas.width; }
            ctx.globalAlpha = s.a;
            ctx.fillStyle = tint;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;
    }

    // ---- Particles / Explosions ----
    function createExplosion(x, y, big = false) {
        const count = big ? 22 : 14;
        const colors = ['#ff3e88', '#ff8c00', '#ffff55', '#ffffff'];
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + Math.random() * 0.4;
            const speed = (big ? 2 : 1.5) + Math.random() * (big ? 5 : 3);
            particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                decay: big ? 0.025 : 0.038,
                size: big ? 3 + Math.random() * 3 : 2 + Math.random() * 2,
                color: colors[Math.floor(Math.random() * colors.length)]
            });
        }
    }

    function updateParticles() {
        particles = particles.filter(p => p.life > 0);
        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.05; // slight gravity
            p.life -= p.decay;
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        });
        ctx.globalAlpha = 1;
    }

    // ---- Score Pops ----
    function createScorePop(x, y) {
        scorePops.push({ x, y, life: 1.0 });
    }

    function updateScorePops() {
        scorePops = scorePops.filter(p => p.life > 0);
        scorePops.forEach(p => {
            p.y -= 1.5;
            p.life -= 0.025;
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.gold ? '#ffd700' : '#00dc82';
            ctx.font = `bold ${p.gold ? 20 : 16}px monospace`;
            ctx.textAlign = 'center';
            if (p.gold) {
                ctx.shadowBlur = 10;
                ctx.shadowColor = '#ffd700';
            }
            ctx.fillText(p.gold ? '+3 ★' : '+1', p.x, p.y);
            ctx.shadowBlur = 0;
        });
        ctx.globalAlpha = 1;
        ctx.textAlign = 'left';
    }

    // ---- Game objects ----
    function init() {
        const cw = 3 * PIXEL_UNIT, ch = 4 * PIXEL_UNIT;
        player = { x: canvas.width / 2 - cw / 2, y: canvas.height - ch - 20, width: cw, height: ch, color: 'white', dx: 0 };
        bullets = [];
        enemies = [];
        enemyBullets = [];
        exhaustParticles = [];
        powerups = [];
        activePowerup = null;
        boss = null;
        bossWarning = 0;
        killCount = 0;
        fireHeld = false;
        fireCooldown = 0;
        warpCooldown = 0;
        lastTapKey = null;
        combo = 0;
        comboTimer = 0;
        comboDisplay = null;
        bonusStars = [];
        bonusStarTimer = 0;
        goAnim = null;
        particles = [];
        scorePops = [];
        impactFlashes = [];
        shakeTimer = 0;
        shakeMag = 0;
        levelUpFlash = 0;
        lives = 3;
        invincible = 0;
        countdown = 0;
        if (countdownId) clearInterval(countdownId);
        stopMusic();
        deathAnim = null;
        dying = false;
        paused = false;
        if (pauseBtn) { pauseBtn.textContent = '⏸ PAUSE'; pauseBtn.classList.remove('paused'); }
        score = 0;
        difficultyLevel = 1;
        lastDifficultyScore = 0;
        gameOver = false;
        scoreElement.innerText = score;
        loadHighScore();
        startCountdown();
    }

    function makeEnemy(x, y) {
        const w = 3 * PIXEL_UNIT, h = 4 * PIXEL_UNIT;
        return {
            x, y,
            width: w, height: h,
            color: getEnemyColor(difficultyLevel),
            speed: Math.min(6, BASE_ENEMY_SPEED * (1 + (difficultyLevel - 1) * 0.35)),
            swooshLife: 1.0
        };
    }

    function spawnEnemy() {
        const w = 3 * PIXEL_UNIT, h = 4 * PIXEL_UNIT;
        // Every ~8 kills after level 2, spawn a formation instead
        const doFormation = difficultyLevel >= 2 && killCount > 0 && killCount % 8 === 0;
        if (doFormation) {
            spawnFormation();
        } else {
            enemies.push(makeEnemy(Math.random() * (canvas.width - w), -h));
        }
    }

    function spawnFormation() {
        const w = 3 * PIXEL_UNIT, h = 4 * PIXEL_UNIT;
        const type = Math.random() < 0.5 ? 'V' : 'arrow';
        const cx = canvas.width / 2 - w / 2;

        if (type === 'V') {
            // V shape: 5 enemies fanning outward
            const offsets = [
                { dx: 0,    dy: 0   },
                { dx: -60,  dy: 40  },
                { dx: 60,   dy: 40  },
                { dx: -120, dy: 80  },
                { dx: 120,  dy: 80  },
            ];
            offsets.forEach(o => enemies.push(makeEnemy(cx + o.dx, -h + o.dy - 80)));
        } else {
            // Arrow: 5 enemies pointing down
            const offsets = [
                { dx: 0,    dy: 0   },
                { dx: -50,  dy: -40 },
                { dx: 50,   dy: -40 },
                { dx: -100, dy: -80 },
                { dx: 100,  dy: -80 },
            ];
            offsets.forEach(o => enemies.push(makeEnemy(cx + o.dx, -h + o.dy - 40)));
        }
    }

    function fireBullet() {
        const cx = player.x + player.width / 2;
        const type = activePowerup ? activePowerup.type : null;
        if (type === 'spread') {
            bullets.push({ x: cx - 2, y: player.y, angle: 0 });
            bullets.push({ x: cx - 2, y: player.y, angle: -0.25 });
            bullets.push({ x: cx - 2, y: player.y, angle: 0.25 });
        } else {
            bullets.push({ x: cx - 2, y: player.y, angle: 0 });
        }
        sfxShoot();
    }

    function movePlayer() {
        player.x += player.dx;
        if (player.x < 0) player.x = 0;
        if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    }

    function detectCollisions() {
        // Bullets vs enemies
        for (let i = bullets.length - 1; i >= 0; i--) {
            for (let j = enemies.length - 1; j >= 0; j--) {
                if (bullets[i] && enemies[j] &&
                    bullets[i].x < enemies[j].x + enemies[j].width &&
                    bullets[i].x + 4 > enemies[j].x &&
                    bullets[i].y < enemies[j].y + enemies[j].height &&
                    bullets[i].y + 14 > enemies[j].y) {
                    const ex = enemies[j].x + enemies[j].width / 2;
                    const ey = enemies[j].y + enemies[j].height / 2;
                    createExplosion(ex, ey);
                    createScorePop(ex, ey - 10);
                    createImpactFlash(ex, ey);
                    triggerShake(3, 6);
                    maybeDropPowerup(ex, ey);
                    sfxKill();
                    bullets.splice(i, 1);
                    enemies.splice(j, 1);
                    combo++;
                    comboTimer = 120;
                    const mult = Math.min(combo, 4);
                    score += mult;
                    killCount++;
                    scoreElement.innerText = score;
                    if (combo >= 2) {
                        comboDisplay = {
                            text: `×${mult} COMBO!`,
                            x: ex,
                            y: ey - 24,
                            life: 1.0,
                            color: mult >= 4 ? '#ffff00' : mult >= 3 ? '#ff8c00' : '#00dc82'
                        };
                    }
                    updateDifficulty();
                    // Spawn boss every 15 kills
                    if (!boss && killCount > 0 && killCount % 15 === 0) spawnBoss();
                    break;
                }
            }
        }

        // Player vs enemies (only if not already dying, not invincible, and not shielded)
        const shielded = activePowerup && activePowerup.type === 'shield';
        if (!dying && invincible <= 0 && !shielded) {
            for (let i = enemies.length - 1; i >= 0; i--) {
                if (player.x < enemies[i].x + enemies[i].width &&
                    player.x + player.width > enemies[i].x &&
                    player.y < enemies[i].y + enemies[i].height &&
                    player.y + player.height > enemies[i].y) {
                    lives--;
                    enemies.splice(i, 1);
                    createExplosion(player.x + player.width / 2, player.y + player.height / 2, lives <= 0);
                    triggerShake(lives <= 0 ? 10 : 6, lives <= 0 ? 20 : 12);
                    sfxHit();
                    if (lives <= 0) {
                        dying = true;
                        clearInterval(enemyIntervalId);
                        deathAnim = {
                            cx: player.x + player.width / 2,
                            cy: player.y + player.height / 2,
                            timer: 55
                        };
                    } else {
                        invincible = 120; // ~2 seconds of invincibility
                    }
                    return;
                }
            }
        }
    }

    function drawDeathAnim() {
        if (!deathAnim) return;
        const { cx, cy, timer } = deathAnim;
        const progress = 1 - (timer / 55);

        // 3 expanding rings at different phases
        [0, 0.25, 0.5].forEach(offset => {
            const r = (progress + offset) % 1;
            ctx.save();
            ctx.globalAlpha = (1 - r) * 0.8;
            ctx.strokeStyle = '#ff3e88';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cx, cy, r * 100, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        });

        // Flash screen briefly
        if (timer > 40) {
            ctx.fillStyle = `rgba(255, 62, 136, ${(55 - timer) / 80})`;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        deathAnim.timer--;
        if (deathAnim.timer <= 0) {
            gameOver = true;
            deathAnim = null;
            stopMusic();
            saveHighScore(score);
            showGameOver();
        }
    }

    // ---- Draw functions ----
    function drawBullets() {
        const isRapid = activePowerup && activePowerup.type === 'rapid';
        const isSpread = activePowerup && activePowerup.type === 'spread';
        ctx.save();
        ctx.shadowBlur = 18;
        ctx.shadowColor = isRapid ? '#ffff00' : isSpread ? '#ff8c00' : '#00ffff';
        ctx.fillStyle = '#ffffff';
        bullets.forEach(b => {
            b.y -= BASE_BULLET_SPEED * (isRapid ? 1.6 : 1);
            b.x += Math.sin(b.angle || 0) * BASE_BULLET_SPEED * (isRapid ? 1.6 : 1) * 0.5;
            if (b.y > 0) ctx.fillRect(b.x - 2, b.y, 4, 14);
        });
        bullets = bullets.filter(b => b.y > 0 && b.x > -20 && b.x < canvas.width + 20);
        ctx.restore();
    }

    function drawEnemies() {
        enemies.forEach(e => {
            e.y += e.speed;
            // Entry swoosh trail — fades out over first ~40 frames of life
            if (e.swooshLife > 0) {
                ctx.save();
                ctx.globalAlpha = e.swooshLife * 0.35;
                ctx.fillStyle = e.color;
                ctx.fillRect(e.x + e.width * 0.3, e.y - e.speed * 8, e.width * 0.4, e.speed * 8);
                ctx.restore();
                e.swooshLife -= 0.025;
            }
            drawPixelCharacter(e.x, e.y, e.color, 'down', e.color);
        });
        enemies = enemies.filter(e => e.y < canvas.height + 50);
    }

    // ---- Level-up flash ----
    function drawLevelUpFlash() {
        if (levelUpFlash <= 0) return;
        ctx.save();
        ctx.globalAlpha = (levelUpFlash / 40) * 0.35;
        ctx.fillStyle = '#00dc82';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        // Text fades in then out
        if (levelUpFlash > 20) {
            ctx.globalAlpha = ((levelUpFlash - 20) / 20) * 0.9;
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 36px monospace';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 20;
            ctx.shadowColor = '#00dc82';
            ctx.fillText(`LEVEL ${difficultyLevel}`, canvas.width / 2, canvas.height / 2);
            ctx.textAlign = 'left';
            ctx.shadowBlur = 0;
        }
        ctx.restore();
        levelUpFlash--;
    }

    function drawPlayer() {
        if (invincible > 0) {
            invincible--;
            // Blink: skip drawing every other 6 frames
            if (Math.floor(invincible / 6) % 2 === 0) return;
        }
        // Flash red if dying
        const color = dying ? (Math.floor(Date.now() / 80) % 2 === 0 ? '#ff3e88' : 'white') : 'white';
        const glow = dying ? '#ff3e88' : '#00ffff';
        drawPixelCharacter(player.x, player.y, color, 'up', glow);
    }

    // ---- Animated Game Over ----
    let goAnim = null; // { frame, displayScore, isNewBest }

    function showGameOver() {
        const prevBest = parseInt(localStorage.getItem(HS_KEY) || '0');
        goAnim = { frame: 0, displayScore: 0, isNewBest: score > prevBest };
        saveHighScore(score);
        requestAnimationFrame(animateGameOver);
    }

    function animateGameOver() {
        if (!goAnim) return;
        goAnim.frame++;

        // Keep drawing background particles for drama
        ctx.fillStyle = '#0d1117';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawNebulae();
        drawStars();
        updateParticles();
        drawScanlines();

        // Overlay fade in
        const overlayAlpha = Math.min(0.82, goAnim.frame / 40 * 0.82);
        ctx.fillStyle = `rgba(0,0,0,${overlayAlpha})`;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const cx = canvas.width / 2;
        const cy = canvas.height / 2;

        // GAME OVER text — slides down from above
        const titleY = Math.min(cy - 60, -40 + goAnim.frame * 6);
        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = 'bold 50px monospace';
        ctx.fillStyle = '#ff3e88';
        ctx.shadowBlur = 24;
        ctx.shadowColor = '#ff3e88';
        ctx.globalAlpha = Math.min(1, goAnim.frame / 15);
        ctx.fillText('GAME OVER', cx, titleY);
        ctx.restore();

        // Score count-up (starts after frame 20)
        if (goAnim.frame > 20) {
            const countSpeed = Math.max(1, Math.ceil(score / 40));
            if (goAnim.displayScore < score) {
                goAnim.displayScore = Math.min(score, goAnim.displayScore + countSpeed);
            }
        }
        if (goAnim.frame > 20) {
            ctx.save();
            ctx.textAlign = 'center';
            ctx.font = 'bold 30px monospace';
            ctx.fillStyle = '#00dc82';
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#00dc82';
            ctx.globalAlpha = Math.min(1, (goAnim.frame - 20) / 15);
            ctx.fillText(`Score: ${goAnim.displayScore}`, cx, cy + 5);
            ctx.restore();
        }

        // NEW BEST banner — appears with a pulse when score finishes counting
        if (goAnim.isNewBest && goAnim.displayScore >= score && goAnim.frame > 30) {
            const pulse = 0.75 + Math.sin(goAnim.frame * 0.15) * 0.25;
            ctx.save();
            ctx.textAlign = 'center';
            ctx.font = 'bold 22px monospace';
            ctx.fillStyle = '#ffd700';
            ctx.shadowBlur = 18;
            ctx.shadowColor = '#ffd700';
            ctx.globalAlpha = pulse;
            ctx.fillText('★ NEW BEST! ★', cx, cy + 44);
            ctx.restore();
        }

        // Restart prompt — appears after frame 50
        if (goAnim.frame > 50) {
            const blink = Math.floor(goAnim.frame / 28) % 2 === 0;
            ctx.save();
            ctx.textAlign = 'center';
            ctx.font = '18px monospace';
            ctx.fillStyle = 'rgba(201,209,217,0.7)';
            ctx.globalAlpha = blink ? 0.9 : 0.4;
            ctx.fillText('Press Enter to Restart', cx, cy + 90);
            ctx.restore();
        }

        if (!gameOver) return; // safety
        requestAnimationFrame(animateGameOver);
    }

    // ---- Engine exhaust trail ----
    function emitExhaust() {
        if (dying) return;
        const ex = player.x + player.width / 2;
        const ey = player.y + player.height;
        for (let i = 0; i < 2; i++) {
            exhaustParticles.push({
                x: ex + (Math.random() - 0.5) * 8,
                y: ey,
                vx: (Math.random() - 0.5) * 1.2,
                vy: 1.5 + Math.random() * 2,
                life: 0.7 + Math.random() * 0.3,
                decay: 0.055,
                size: 2 + Math.random() * 2,
                color: Math.random() > 0.5 ? '#00ffff' : '#00dc82'
            });
        }
    }

    function updateExhaust() {
        exhaustParticles = exhaustParticles.filter(p => p.life > 0);
        exhaustParticles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.life -= p.decay;
            ctx.globalAlpha = p.life * 0.7;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        });
        ctx.globalAlpha = 1;
    }

    // ---- Enemy bullets ----
    function enemyFireChance(e) {
        // Only enemies below level 2 don't shoot; harder enemies shoot more
        if (difficultyLevel < 2) return false;
        const chance = 0.002 + (difficultyLevel - 2) * 0.001;
        return Math.random() < chance;
    }

    function updateEnemyBullets() {
        // Spawn from enemies that get a chance this frame
        enemies.forEach(e => {
            if (e.y > 0 && enemyFireChance(e)) {
                enemyBullets.push({
                    x: e.x + e.width / 2 - 2,
                    y: e.y + e.height,
                    speed: 3 + difficultyLevel * 0.5
                });
            }
        });

        // Move + draw enemy bullets
        ctx.save();
        ctx.shadowBlur = 12;
        ctx.shadowColor = '#ff3e88';
        ctx.fillStyle = '#ff6060';
        enemyBullets.forEach(b => {
            if (b.angle !== undefined) {
                b.x += Math.cos(b.angle) * b.speed;
                b.y += Math.sin(b.angle) * b.speed;
            } else {
                b.y += b.speed;
            }
            ctx.fillRect(b.x, b.y, 4, 10);
        });
        ctx.restore();
        enemyBullets = enemyBullets.filter(b => b.y < canvas.height && b.y > -20 && b.x > -20 && b.x < canvas.width + 20);

        // Collision with player
        const shieldedFromBullets = activePowerup && activePowerup.type === 'shield';
        if (!dying && invincible <= 0 && !shieldedFromBullets) {
            for (let i = enemyBullets.length - 1; i >= 0; i--) {
                const b = enemyBullets[i];
                if (b.x < player.x + player.width &&
                    b.x + 4 > player.x &&
                    b.y < player.y + player.height &&
                    b.y + 10 > player.y) {
                    enemyBullets.splice(i, 1);
                    lives--;
                    createExplosion(player.x + player.width / 2, player.y + player.height / 2, lives <= 0);
                    triggerShake(lives <= 0 ? 10 : 5, lives <= 0 ? 20 : 10);
                    if (lives <= 0) {
                        dying = true;
                        clearInterval(enemyIntervalId);
                        deathAnim = {
                            cx: player.x + player.width / 2,
                            cy: player.y + player.height / 2,
                            timer: 55
                        };
                    } else {
                        invincible = 120;
                    }
                    break;
                }
            }
        }
    }

    // ---- Web Audio ----
    function getAudio() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        return audioCtx;
    }

    function playTone(freq, type, duration, vol = 0.15, startFreq = null) {
        try {
            const ac = getAudio();
            const osc = ac.createOscillator();
            const gain = ac.createGain();
            osc.connect(gain);
            gain.connect(ac.destination);
            osc.type = type;
            osc.frequency.setValueAtTime(startFreq || freq, ac.currentTime);
            if (startFreq) osc.frequency.exponentialRampToValueAtTime(freq, ac.currentTime + duration);
            gain.gain.setValueAtTime(vol, ac.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
            osc.start(ac.currentTime);
            osc.stop(ac.currentTime + duration);
        } catch(e) {}
    }

    function sfxShoot()    { playTone(880, 'square', 0.07, 0.08, 1200); }
    function sfxKill()     { playTone(220, 'sawtooth', 0.18, 0.12, 440); }
    function sfxHit()      { playTone(150, 'sawtooth', 0.25, 0.18, 80); }
    function sfxPowerup()  { playTone(660, 'sine', 0.3, 0.12, 330); }
    function sfxBoss()     { playTone(110, 'sawtooth', 0.6, 0.2, 55); }
    function sfxLevelUp()  { playTone(523, 'sine', 0.4, 0.1, 392); }

    // ---- Chiptune background music ----
    // Note frequencies (Hz)
    const NOTES = {
        C3:130.8, D3:146.8, E3:164.8, F3:174.6, G3:196.0, A3:220.0, B3:246.9,
        C4:261.6, D4:293.7, E4:329.6, F4:349.2, G4:392.0, A4:440.0, B4:493.9,
        C5:523.3, D5:587.3, E5:659.3, G5:784.0, REST:0
    };
    // Melody: 16-note loop, upbeat arcade feel
    const MELODY = [
        'C4','E4','G4','E4', 'C4','D4','E4','REST',
        'F4','A4','C5','A4', 'G4','F4','E4','REST'
    ];
    // Bass: 8-note loop
    const BASS = [
        'C3','REST','G3','REST', 'A3','REST','F3','REST'
    ];

    let musicPlaying = false;
    let musicStep = 0;
    let bassStep = 0;
    let musicIntervalId = null;

    function startMusic() {
        if (musicPlaying) return;
        musicPlaying = true;
        musicStep = 0;
        bassStep = 0;
        scheduleMusic();
    }

    function stopMusic() {
        musicPlaying = false;
        if (musicIntervalId) clearInterval(musicIntervalId);
        musicIntervalId = null;
    }

    function scheduleMusic() {
        const bpm = Math.min(200, 120 + (difficultyLevel - 1) * 20);
        const beat = 60000 / bpm;

        // Play melody note
        const mNote = MELODY[musicStep % MELODY.length];
        if (NOTES[mNote]) playTone(NOTES[mNote], 'square', beat / 1000 * 0.6, 0.04);

        // Play bass on every other melody step
        if (musicStep % 2 === 0) {
            const bNote = BASS[bassStep % BASS.length];
            if (NOTES[bNote]) playTone(NOTES[bNote], 'triangle', beat / 1000 * 0.9, 0.035);
            bassStep++;
        }

        musicStep++;
        if (musicPlaying) {
            musicIntervalId = setTimeout(scheduleMusic, beat);
        }
    }

    // ---- Boss ----
    const BOSS_PIXELS = [
        [0,0],[1,0],[2,0],[3,0],[4,0],
        [0,1],[2,1],[4,1],
        [0,2],[1,2],[2,2],[3,2],[4,2],
        [1,3],[3,3],
        [0,4],[1,4],[3,4],[4,4],
    ];
    const BOSS_PU = 14; // pixel unit for boss
    const BOSS_W = 5 * BOSS_PU;
    const BOSS_H = 5 * BOSS_PU;
    const BOSS_HP = 8;

    function spawnBoss() {
        boss = {
            x: canvas.width / 2 - BOSS_W / 2,
            y: -BOSS_H,
            width: BOSS_W, height: BOSS_H,
            hp: BOSS_HP,
            maxHp: BOSS_HP,
            dx: 1.5,
            fireTimer: 0,
            hitFlash: 0
        };
        bossWarning = 90;
        sfxBoss();
    }

    function drawBoss() {
        if (!boss) return;

        // Warning banner
        if (bossWarning > 0) {
            bossWarning--;
            ctx.save();
            ctx.globalAlpha = (bossWarning / 90) * 0.85;
            ctx.fillStyle = '#ff3e88';
            ctx.fillRect(0, canvas.height / 2 - 30, canvas.width, 60);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 30px monospace';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#ff3e88';
            ctx.fillText('⚠ BOSS INCOMING ⚠', canvas.width / 2, canvas.height / 2 + 10);
            ctx.textAlign = 'left';
            ctx.restore();
        }

        // Move boss
        boss.y = Math.min(boss.y + 1.2, 40);
        boss.x += boss.dx;
        if (boss.x <= 0 || boss.x + boss.width >= canvas.width) boss.dx *= -1;

        // Fire at player periodically
        boss.fireTimer++;
        const fireInterval = Math.max(30, 80 - difficultyLevel * 8);
        if (boss.fireTimer >= fireInterval) {
            boss.fireTimer = 0;
            const bx = boss.x + boss.width / 2;
            const by = boss.y + boss.height;
            const angle = Math.atan2(player.y - by, player.x + player.width / 2 - bx);
            enemyBullets.push({ x: bx - 2, y: by, speed: 4, angle });
        }

        // Draw boss ship
        const flash = boss.hitFlash > 0;
        if (boss.hitFlash > 0) boss.hitFlash--;
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = flash ? '#ffffff' : '#ff3e88';
        ctx.fillStyle = flash ? '#ffffff' : '#ff3e88';
        BOSS_PIXELS.forEach(([px, py]) => {
            ctx.fillRect(boss.x + px * BOSS_PU, boss.y + (4 - py) * BOSS_PU, BOSS_PU, BOSS_PU);
        });
        ctx.restore();

        // HP bar
        const barW = boss.width;
        const hpPct = boss.hp / boss.maxHp;
        ctx.fillStyle = '#333';
        ctx.fillRect(boss.x, boss.y - 10, barW, 6);
        ctx.fillStyle = hpPct > 0.5 ? '#00dc82' : hpPct > 0.25 ? '#ff8c00' : '#ff3e88';
        ctx.fillRect(boss.x, boss.y - 10, barW * hpPct, 6);

        // Collision with player bullets
        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i];
            if (b.x < boss.x + boss.width && b.x + 4 > boss.x &&
                b.y < boss.y + boss.height && b.y + 14 > boss.y) {
                boss.hp--;
                boss.hitFlash = 8;
                bullets.splice(i, 1);
                createImpactFlash(boss.x + boss.width / 2, boss.y + boss.height / 2);
                triggerShake(2, 4);
                if (boss.hp <= 0) {
                    createExplosion(boss.x + boss.width / 2, boss.y + boss.height / 2, true);
                    triggerShake(12, 25);
                    score += 5;
                    killCount += 5;
                    scoreElement.innerText = score;
                    updateDifficulty();
                    boss = null;
                    sfxBoss();
                    return;
                } else {
                    sfxKill();
                }
                break;
            }
        }

        // Collision with player
        if (!dying && invincible <= 0 && !(activePowerup && activePowerup.type === 'shield')) {
            if (player.x < boss.x + boss.width && player.x + player.width > boss.x &&
                player.y < boss.y + boss.height && player.y + player.height > boss.y) {
                lives--;
                createExplosion(player.x + player.width / 2, player.y + player.height / 2, lives <= 0);
                triggerShake(lives <= 0 ? 10 : 6, lives <= 0 ? 20 : 12);
                if (lives <= 0) {
                    dying = true;
                    clearInterval(enemyIntervalId);
                    deathAnim = { cx: player.x + player.width / 2, cy: player.y + player.height / 2, timer: 55 };
                } else {
                    invincible = 120;
                }
                sfxHit();
            }
        }
    }

    // ---- Power-ups ----
    const POWERUP_TYPES = [
        { type: 'rapid',  color: '#ffff00', label: '»»',  duration: 300 },
        { type: 'spread', color: '#ff8c00', label: '⫸',   duration: 240 },
        { type: 'shield', color: '#00ffff', label: '◈',   duration: 360 },
    ];

    function maybeDropPowerup(x, y) {
        if (Math.random() > 0.18) return; // ~18% drop chance
        const def = POWERUP_TYPES[Math.floor(Math.random() * POWERUP_TYPES.length)];
        powerups.push({ x, y, ...def, angle: 0 });
    }

    function updatePowerups() {
        powerups.forEach(p => {
            p.y += 1.2;
            p.angle += 0.06;
            // Draw spinning gem
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.angle);
            ctx.shadowBlur = 16;
            ctx.shadowColor = p.color;
            ctx.strokeStyle = p.color;
            ctx.lineWidth = 2;
            ctx.strokeRect(-10, -10, 20, 20);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = 0.25;
            ctx.fillRect(-10, -10, 20, 20);
            ctx.globalAlpha = 1;
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 11px monospace';
            ctx.textAlign = 'center';
            ctx.fillText(p.label, 0, 4);
            ctx.restore();
        });

        // Collect
        powerups = powerups.filter(p => {
            if (p.y > canvas.height) return false;
            if (!dying && invincible <= 0 &&
                Math.abs(p.x - (player.x + player.width / 2)) < 24 &&
                Math.abs(p.y - (player.y + player.height / 2)) < 24) {
                activePowerup = { type: p.type, timer: p.duration };
                createScorePop(p.x, p.y - 10);
                triggerShake(2, 4);
                sfxPowerup();
                return false;
            }
            return true;
        });

        // Draw active powerup indicator
        if (activePowerup) {
            activePowerup.timer--;
            const def = POWERUP_TYPES.find(d => d.type === activePowerup.type);
            const pct = activePowerup.timer / def.duration;
            ctx.save();
            ctx.fillStyle = def.color;
            ctx.globalAlpha = 0.7;
            ctx.font = 'bold 13px monospace';
            ctx.textAlign = 'right';
            ctx.fillText(`${def.label} ${activePowerup.type.toUpperCase()} ${Math.ceil(activePowerup.timer / 60)}s`, canvas.width - 12, 28);
            // Bar
            ctx.fillStyle = def.color;
            ctx.globalAlpha = 0.3;
            ctx.fillRect(canvas.width - 122, 32, 110, 5);
            ctx.globalAlpha = 0.8;
            ctx.fillRect(canvas.width - 122, 32, 110 * pct, 5);
            ctx.restore();
            if (activePowerup.timer <= 0) activePowerup = null;
        }

        // Shield bubble
        if (activePowerup && activePowerup.type === 'shield') {
            ctx.save();
            ctx.strokeStyle = '#00ffff';
            ctx.lineWidth = 2;
            ctx.shadowBlur = 12;
            ctx.shadowColor = '#00ffff';
            ctx.globalAlpha = 0.4 + Math.sin(Date.now() / 120) * 0.15;
            ctx.beginPath();
            ctx.arc(player.x + player.width / 2, player.y + player.height / 2, 34, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
    }

    // ---- Bonus stars ----
    function updateBonusStars() {
        // Spawn: one star every ~8-12 seconds, random chance each frame
        bonusStarTimer--;
        if (bonusStarTimer <= 0 && bonusStars.length < 2) {
            if (Math.random() < 0.004) {
                bonusStars.push({
                    x: 40 + Math.random() * (canvas.width - 80),
                    y: -20,
                    vy: 0.8 + Math.random() * 0.6,
                    vx: (Math.random() - 0.5) * 0.8,
                    angle: 0,
                    pulse: 0
                });
                bonusStarTimer = 300 + Math.random() * 200;
            }
        }

        bonusStars.forEach(s => {
            s.y += s.vy;
            s.x += s.vx;
            s.angle += 0.04;
            s.pulse += 0.1;

            // Draw 5-pointed star
            ctx.save();
            ctx.translate(s.x, s.y);
            ctx.rotate(s.angle);
            ctx.shadowBlur = 18 + Math.sin(s.pulse) * 6;
            ctx.shadowColor = '#ffd700';
            ctx.fillStyle = '#ffd700';
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 1;
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const outerA = (i * 4 * Math.PI) / 5 - Math.PI / 2;
                const innerA = outerA + (2 * Math.PI) / 10;
                const ox = Math.cos(outerA) * 14;
                const oy = Math.sin(outerA) * 14;
                const ix = Math.cos(innerA) * 6;
                const iy = Math.sin(innerA) * 6;
                i === 0 ? ctx.moveTo(ox, oy) : ctx.lineTo(ox, oy);
                ctx.lineTo(ix, iy);
            }
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            // +3 label
            ctx.globalAlpha = 0.85;
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 10px monospace';
            ctx.textAlign = 'center';
            ctx.shadowBlur = 0;
            ctx.fillText('+3', 0, 24);
            ctx.restore();
        });

        // Collect + out-of-bounds filter
        bonusStars = bonusStars.filter(s => {
            if (s.y > canvas.height + 30) return false;
            // Collection hit-box
            if (!dying && invincible <= 0 &&
                Math.abs(s.x - (player.x + player.width / 2)) < 26 &&
                Math.abs(s.y - (player.y + player.height / 2)) < 26) {
                score += 3;
                scoreElement.innerText = score;
                createScorePop(s.x, s.y - 10);
                createExplosion(s.x, s.y);
                triggerShake(2, 5);
                sfxPowerup();
                // Override score pop text colour with gold by pushing a special pop
                scorePops.push({ x: s.x, y: s.y - 30, life: 1.0, gold: true });
                return false;
            }
            return true;
        });
    }

    // ---- Combo multiplier ----
    function updateCombo() {
        // Tick down combo window
        if (comboTimer > 0) {
            comboTimer--;
            if (comboTimer <= 0) combo = 0;
        }
        // Draw floating combo banner
        if (comboDisplay) {
            comboDisplay.y -= 1.2;
            comboDisplay.life -= 0.022;
            if (comboDisplay.life <= 0) { comboDisplay = null; return; }
            ctx.save();
            ctx.globalAlpha = comboDisplay.life;
            ctx.font = `bold ${16 + Math.min(combo, 4) * 3}px monospace`;
            ctx.fillStyle = comboDisplay.color;
            ctx.shadowBlur = 14;
            ctx.shadowColor = comboDisplay.color;
            ctx.textAlign = 'center';
            ctx.fillText(comboDisplay.text, comboDisplay.x, comboDisplay.y);
            ctx.restore();
        }
        // Draw active combo streak in HUD (bottom-right)
        if (combo >= 2) {
            const mult = Math.min(combo, 4);
            const col = mult >= 4 ? '#ffff00' : mult >= 3 ? '#ff8c00' : '#00dc82';
            ctx.save();
            ctx.globalAlpha = 0.85;
            ctx.font = 'bold 14px monospace';
            ctx.fillStyle = col;
            ctx.shadowBlur = 10;
            ctx.shadowColor = col;
            ctx.textAlign = 'right';
            ctx.fillText(`COMBO ×${mult}`, canvas.width - 12, canvas.height - 14);
            // Timer bar
            const barW = 100;
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = col;
            ctx.fillRect(canvas.width - 12 - barW, canvas.height - 10, barW, 4);
            ctx.globalAlpha = 0.85;
            ctx.fillRect(canvas.width - 12 - barW, canvas.height - 10, barW * (comboTimer / 120), 4);
            ctx.restore();
        }
    }

    // ---- Warp dash ----
    function doWarp(dir) {
        if (warpCooldown > 0 || dying || invincible > 0) return;
        const dist = dir === 'right' ? WARP_DIST : -WARP_DIST;
        player.x = Math.max(0, Math.min(canvas.width - player.width, player.x + dist));
        warpCooldown = WARP_COOLDOWN;
        // Warp visual: burst of white particles at old + new position
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            particles.push({
                x: player.x + player.width / 2,
                y: player.y + player.height / 2,
                vx: Math.cos(angle) * (1.5 + Math.random() * 2),
                vy: Math.sin(angle) * (1.5 + Math.random() * 2),
                life: 0.8, decay: 0.06,
                size: 3 + Math.random() * 2,
                color: '#00ffff'
            });
        }
        triggerShake(2, 4);
        playTone(800, 'sine', 0.1, 0.07, 400);
    }

    function drawWarpHUD() {
        if (warpCooldown > 0) warpCooldown--;
        const ready = warpCooldown <= 0;
        const pct = 1 - warpCooldown / WARP_COOLDOWN;
        const x = canvas.width / 2 - 40;
        const y = canvas.height - 12;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.font = '11px monospace';
        ctx.fillStyle = ready ? '#00ffff' : 'rgba(0,255,255,0.35)';
        ctx.fillText('WARP', canvas.width / 2, y - 6);
        // Bar
        ctx.globalAlpha = 0.3;
        ctx.fillStyle = '#00ffff';
        ctx.fillRect(x, y, 80, 4);
        ctx.globalAlpha = ready ? 1 : 0.7;
        ctx.fillStyle = ready ? '#00ffff' : '#006688';
        ctx.fillRect(x, y, 80 * pct, 4);
        if (ready) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#00ffff';
            ctx.fillRect(x, y, 80, 4);
        }
        ctx.restore();
    }

    // ---- Lives HUD (mini pixel ships) ----
    function drawLivesHUD() {
        const pu = 5; // small pixel unit for HUD ships
        const shipPixels = [[1,0],[0,1],[1,1],[2,1],[1,2],[0,3],[2,3]];
        for (let i = 0; i < lives; i++) {
            const ox = 14 + i * (3 * pu + 10);
            const oy = 14;
            ctx.save();
            ctx.shadowBlur = 8;
            ctx.shadowColor = '#00ffff';
            ctx.fillStyle = '#00dc82';
            shipPixels.forEach(([px, py]) => {
                ctx.fillRect(ox + px * pu, oy + py * pu, pu, pu);
            });
            ctx.restore();
        }
    }

    // ---- GET READY countdown ----
    function drawCountdownFrame() {
        ctx.fillStyle = '#0d1117';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        drawNebulae();
        drawStars();
        ctx.save();
        ctx.textAlign = 'center';
        ctx.fillStyle = 'rgba(201,209,217,0.75)';
        ctx.font = 'bold 26px monospace';
        ctx.letterSpacing = '4px';
        ctx.fillText('GET READY', canvas.width / 2, canvas.height / 2 - 65);
        ctx.font = 'bold 110px monospace';
        ctx.fillStyle = '#00dc82';
        ctx.shadowBlur = 35;
        ctx.shadowColor = '#00dc82';
        ctx.fillText(countdown > 0 ? countdown : 'GO!', canvas.width / 2, canvas.height / 2 + 32);
        ctx.restore();
        drawLivesHUD();
        drawScanlines();
    }

    function startCountdown() {
        countdown = 3;
        drawCountdownFrame();
        countdownId = setInterval(() => {
            countdown--;
            if (countdown <= 0) {
                clearInterval(countdownId);
                drawCountdownFrame(); // show "GO!"
                setTimeout(() => {
                    countdown = 0;
                    restartSpawnInterval();
                    startMusic();
                    requestAnimationFrame(update);
                }, 500);
            } else {
                drawCountdownFrame();
            }
        }, 900);
    }

    // ---- Pause overlay ----
    function drawPauseOverlay() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#00dc82';
        ctx.font = 'bold 40px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2 - 20);
        ctx.fillStyle = 'rgba(201,209,217,0.6)';
        ctx.font = '18px monospace';
        ctx.fillText('Press P or Esc to resume', canvas.width / 2, canvas.height / 2 + 25);
        ctx.textAlign = 'left';
    }

    // ---- Main loop ----
    function update() {
        if (gameOver || paused || countdown > 0) return;

        ctx.save();
        applyShake();

        // Clear with near-black (stars need a clean slate)
        ctx.fillStyle = '#0d1117';
        ctx.fillRect(-20, -20, canvas.width + 40, canvas.height + 40);

        drawNebulae();
        drawStars();

        if (!dying) {
            movePlayer();
            // Auto-fire
            if (fireCooldown > 0) fireCooldown--;
            if (fireHeld && fireCooldown <= 0) {
                fireBullet();
                const isRapid = activePowerup && activePowerup.type === 'rapid';
                fireCooldown = isRapid ? 6 : 12;
            }
            detectCollisions();
        }

        if (!dying) emitExhaust();
        updateExhaust();
        drawBullets();
        drawEnemies();
        drawBoss();
        updateEnemyBullets();

        if (!dying) drawPlayer();

        updatePowerups();
        updateBonusStars();
        updateCombo();
        updateParticles();
        updateImpactFlashes();
        updateScorePops();
        drawDeathAnim();
        drawLevelUpFlash();
        drawLivesHUD();
        drawWarpHUD();
        drawScanlines();

        ctx.restore();

        requestAnimationFrame(update);
    }

    // ---- Keyboard controls ----
    document.addEventListener('keydown', e => {
        if (gameOver && e.key === 'Enter') { init(); return; }
        if (e.key === 'Escape' || e.key === 'p' || e.key === 'P') { togglePause(); return; }
        if (paused || dying || countdown > 0) return;
        if (e.key === 'ArrowRight' || e.key === 'd') {
            // Double-tap detection
            const now = Date.now();
            if (lastTapKey === 'right' && now - lastTapTime < 300) {
                doWarp('right');
                lastTapKey = null;
            } else {
                lastTapKey = 'right';
                lastTapTime = now;
            }
            player.dx = BASE_PLAYER_SPEED;
        } else if (e.key === 'ArrowLeft' || e.key === 'a') {
            const now = Date.now();
            if (lastTapKey === 'left' && now - lastTapTime < 300) {
                doWarp('left');
                lastTapKey = null;
            } else {
                lastTapKey = 'left';
                lastTapTime = now;
            }
            player.dx = -BASE_PLAYER_SPEED;
        } else if (e.key === ' ') { e.preventDefault(); fireHeld = true; }
    });
    document.addEventListener('keyup', e => {
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'ArrowLeft' || e.key === 'a') player.dx = 0;
        if (e.key === ' ') fireHeld = false;
    });

    // ---- Touch controls ----
    const btnLeft = document.getElementById('btn-left');
    const btnRight = document.getElementById('btn-right');
    const btnFire = document.getElementById('btn-fire');

    if (btnLeft) {
        btnLeft.addEventListener('touchstart',  e => { e.preventDefault(); if (!dying) player.dx = -BASE_PLAYER_SPEED; }, { passive: false });
        btnLeft.addEventListener('touchend',    e => { e.preventDefault(); player.dx = 0; }, { passive: false });
        btnLeft.addEventListener('mousedown',   () => { if (!dying) player.dx = -BASE_PLAYER_SPEED; });
        btnLeft.addEventListener('mouseup',     () => player.dx = 0);
    }
    if (btnRight) {
        btnRight.addEventListener('touchstart', e => { e.preventDefault(); if (!dying) player.dx = BASE_PLAYER_SPEED; }, { passive: false });
        btnRight.addEventListener('touchend',   e => { e.preventDefault(); player.dx = 0; }, { passive: false });
        btnRight.addEventListener('mousedown',  () => { if (!dying) player.dx = BASE_PLAYER_SPEED; });
        btnRight.addEventListener('mouseup',    () => player.dx = 0);
    }
    if (btnFire) {
        btnFire.addEventListener('touchstart',  e => { e.preventDefault(); fireHeld = true; }, { passive: false });
        btnFire.addEventListener('touchend',    e => { e.preventDefault(); fireHeld = false; }, { passive: false });
        btnFire.addEventListener('mousedown',   () => { fireHeld = true; });
        btnFire.addEventListener('mouseup',     () => { fireHeld = false; });
        btnFire.addEventListener('mouseleave',  () => { fireHeld = false; });
    }

    init();
});
