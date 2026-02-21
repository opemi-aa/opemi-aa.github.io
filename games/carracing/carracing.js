const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const HS_KEY = 'highscore_carracing';
const PIXEL_SIZE = 5;
// Cell values: 0=empty, 1=body, 2=glass/window, 3=headlight, 4=taillight, 5=tyre
const PLAYER_PATTERN = [
    [0, 0, 1, 1, 1, 1, 0, 0],  // front bumper
    [0, 3, 1, 1, 1, 1, 3, 0],  // headlights
    [0, 1, 1, 1, 1, 1, 1, 0],  // hood
    [5, 1, 1, 1, 1, 1, 1, 5],  // front wheel arches
    [0, 1, 2, 2, 2, 2, 1, 0],  // windshield
    [0, 1, 2, 2, 2, 2, 1, 0],  // cockpit
    [0, 1, 2, 2, 2, 2, 1, 0],  // cockpit
    [0, 1, 2, 2, 2, 2, 1, 0],  // rear window
    [5, 1, 1, 1, 1, 1, 1, 5],  // rear wheel arches
    [0, 1, 1, 1, 1, 1, 1, 0],  // trunk
    [0, 4, 1, 1, 1, 1, 4, 0],  // taillights
    [0, 0, 1, 1, 1, 1, 0, 0],  // rear bumper
];
const AI_PATTERN = [
    [0, 1, 1, 1, 1, 1, 1, 0],  // front bumper (wider/blockier)
    [3, 1, 1, 1, 1, 1, 1, 3],  // headlights at outer edges
    [1, 1, 1, 1, 1, 1, 1, 1],  // full-width hood
    [5, 1, 1, 1, 1, 1, 1, 5],  // front wheel arches
    [1, 1, 2, 2, 2, 2, 1, 1],  // windshield (thick pillars = muscle car)
    [1, 1, 2, 2, 2, 2, 1, 1],  // cockpit
    [1, 1, 1, 1, 1, 1, 1, 1],  // solid roof
    [1, 1, 2, 2, 2, 2, 1, 1],  // rear window
    [5, 1, 1, 1, 1, 1, 1, 5],  // rear wheel arches
    [1, 1, 1, 1, 1, 1, 1, 1],  // full-width trunk
    [4, 1, 1, 1, 1, 1, 1, 4],  // taillights at outer edges
    [0, 1, 1, 1, 1, 1, 1, 0],  // rear bumper
];
const AI_COLORS = ['#ff3e88', '#ff8c00', '#a855f7', '#3b82f6', '#e53e3e'];

const CAR_WIDTH  = PIXEL_SIZE * PLAYER_PATTERN[0].length;   // 40px
const CAR_HEIGHT = PIXEL_SIZE * PLAYER_PATTERN.length;       // 60px
const LANE_WIDTH = canvas.width / 3;
const PLAYER_SPEED = 5;
const AI_SPEED_MIN = 1.0;
const AI_SPEED_MAX = 2.2;
const TRACK_SPEED = 3;
const SCORE_INCREMENT_INTERVAL = 100;

let playerCar = {
    x: LANE_WIDTH + (LANE_WIDTH / 2) - (CAR_WIDTH / 2),
    y: canvas.height - CAR_HEIGHT - 20,
    width: CAR_WIDTH,
    height: CAR_HEIGHT,
    color: '#00dc82',
    laneIndex: 1,          // 0 = left, 1 = mid, 2 = right
    targetX: LANE_WIDTH + (LANE_WIDTH / 2) - (CAR_WIDTH / 2)
};

let aiCars = [];
let gamePaused = false;
let gameOver = false;
let score = 0;
let lastScoreIncrementTime = 0;
let trackLineOffset = 0;
let currentSpeed = TRACK_SPEED;
let difficultyLevel = 1;
let lastDifficultyLevel = 1;
let levelUpFlash = 0;
let lives = 3;
let invincible = 0;
let shakeTimer = 0;
let shakeMag = 0;
let particles = [];
let nitroCharges = 3;
let nitroActive = 0;       // frames remaining
let nitroRechargeTimer = 0;
const NITRO_DURATION = 90;
const NITRO_RECHARGE = 600;
const NITRO_MULT = 1.8;
let countdown = 0;
let countdownId = null;
let deathAnim = null;  // { timer, cx, cy } — crash cinematic before game over

// ---- Scenery (parallax roadside) ----
const SCENERY_LEFT_X  = [2, 10, 20];    // x positions on left margin
const SCENERY_RIGHT_X = [canvas.width - 22, canvas.width - 14, canvas.width - 4];
const SCENERY_SPEEDS  = [1.5, 3.5, 6.5]; // slow / mid / fast

let scenery = [];

function initScenery() {
    scenery = [];
    for (let tier = 0; tier < 3; tier++) {
        for (let side = 0; side < 2; side++) {
            const count = tier === 0 ? 8 : tier === 1 ? 6 : 4;
            for (let i = 0; i < count; i++) {
                const isLeft = side === 0;
                const baseX = isLeft ? SCENERY_LEFT_X[tier] : SCENERY_RIGHT_X[tier];
                scenery.push({
                    x: baseX,
                    y: Math.random() * canvas.height,
                    type: Math.random() > 0.4 ? 'tree' : 'pole',
                    tier,
                    speed: SCENERY_SPEEDS[tier],
                    side: isLeft ? 'left' : 'right'
                });
            }
        }
    }
}

function drawScenery() {
    const speedMult = currentSpeed / TRACK_SPEED;
    scenery.forEach(s => {
        s.y += s.speed * speedMult;
        if (s.y > canvas.height + 60) s.y = -60;

        const alpha = 0.25 + s.tier * 0.2;  // deeper = more opaque
        ctx.save();
        ctx.globalAlpha = alpha;

        if (s.type === 'tree') {
            const h = 18 + s.tier * 8;
            const w = 12 + s.tier * 4;
            // Trunk
            ctx.fillStyle = '#5a3a1a';
            ctx.fillRect(s.x + w / 2 - 2, s.y + h * 0.6, 4, h * 0.4);
            // Canopy
            ctx.fillStyle = '#1a6b2f';
            ctx.beginPath();
            ctx.moveTo(s.x + w / 2, s.y);
            ctx.lineTo(s.x + w, s.y + h * 0.65);
            ctx.lineTo(s.x, s.y + h * 0.65);
            ctx.closePath();
            ctx.fill();
        } else {
            // Pole / barrier post
            const h = 14 + s.tier * 4;
            ctx.fillStyle = '#888';
            ctx.fillRect(s.x, s.y, 4, h);
            ctx.fillStyle = '#ff4444';
            ctx.fillRect(s.x, s.y, 4, 4);
        }
        ctx.restore();
    });
}

// ---- Motion blur speed lines ----
let speedLines = [];

function initSpeedLines() {
    speedLines = Array.from({ length: 20 }, () => ({
        x: 35 + Math.random() * (canvas.width - 70),
        y: Math.random() * canvas.height,
        len: 20 + Math.random() * 50,
        speed: 6 + Math.random() * 8,
        alpha: 0.05 + Math.random() * 0.15
    }));
}

function drawSpeedLines() {
    const speedMult = currentSpeed / TRACK_SPEED;
    if (speedMult < 1.1) return;
    const intensity = Math.min(1, (speedMult - 1.1) / 1.4);
    const nitroBurst = nitroActive > 0 ? 1.5 : 1;
    ctx.save();
    speedLines.forEach(l => {
        l.y += l.speed * speedMult * nitroBurst;
        if (l.y > canvas.height + l.len) l.y = -l.len;
        const lineIntensity = intensity * nitroBurst;
        ctx.globalAlpha = Math.min(0.85, l.alpha * lineIntensity * 1.5);
        ctx.strokeStyle = nitroActive > 0 ? '#00ffff' : 'rgba(200,230,255,0.9)';
        ctx.lineWidth = 1 + intensity * 1.5;
        ctx.beginPath();
        ctx.moveTo(l.x, l.y);
        ctx.lineTo(l.x, l.y + l.len * (0.4 + intensity * 0.6));
        ctx.stroke();
    });
    ctx.restore();
}

function loadHighScore() {
    const el = document.getElementById('highscore');
    const hs = localStorage.getItem(HS_KEY);
    if (el) el.textContent = hs || '--';
}

function saveHighScore(s) {
    const current = parseInt(localStorage.getItem(HS_KEY) || '0');
    if (s > current) {
        localStorage.setItem(HS_KEY, s);
        const el = document.getElementById('highscore');
        if (el) el.textContent = s;
    }
}

function drawPixel(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, PIXEL_SIZE, PIXEL_SIZE);
}

function drawCarPattern(carX, carY, bodyColor, pattern) {
    ctx.save();
    for (let row = 0; row < pattern.length; row++) {
        for (let col = 0; col < pattern[row].length; col++) {
            const cell = pattern[row][col];
            if (cell === 0) continue;
            const px = carX + col * PIXEL_SIZE;
            const py = carY + row * PIXEL_SIZE;
            switch (cell) {
                case 1: // body
                    ctx.fillStyle = bodyColor;
                    ctx.shadowBlur = 20; ctx.shadowColor = bodyColor;
                    break;
                case 2: // tinted glass
                    ctx.fillStyle = '#0a1a2e';
                    ctx.shadowBlur = 0;
                    break;
                case 3: // headlight
                    ctx.fillStyle = '#ffffa0';
                    ctx.shadowBlur = 14; ctx.shadowColor = '#ffff66';
                    break;
                case 4: // taillight / brake light
                    ctx.fillStyle = '#ff2020';
                    ctx.shadowBlur = 10; ctx.shadowColor = '#ff0000';
                    break;
                case 5: // tyre / wheel arch
                    ctx.fillStyle = '#1c1c1c';
                    ctx.shadowBlur = 0;
                    break;
            }
            ctx.fillRect(px, py, PIXEL_SIZE, PIXEL_SIZE);
        }
    }
    ctx.restore();
}

function drawScanlines() {
    ctx.save();
    ctx.globalAlpha = 0.04;
    ctx.fillStyle = '#000000';
    for (let y = 0; y < canvas.height; y += 4) {
        ctx.fillRect(0, y, canvas.width, 2);
    }
    ctx.restore();
}

function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawTrack() {
    const effectiveSpeed = currentSpeed * (nitroActive > 0 ? NITRO_MULT : 1);
    const dashLength = 40, dashSpace = 25;
    const totalDashSegment = dashLength + dashSpace;
    trackLineOffset = (trackLineOffset + effectiveSpeed) % totalDashSegment;

    const CURB_W = 14;

    // Asphalt gradient — darker at horizon (top), slightly lighter up close (bottom)
    const roadGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    roadGrad.addColorStop(0,   '#111520');
    roadGrad.addColorStop(0.5, '#161b28');
    roadGrad.addColorStop(1,   '#1c2235');
    ctx.fillStyle = roadGrad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Scrolling kerb stripes — wider, high contrast
    const stripeH = 28;
    const kerbOffset = trackLineOffset % stripeH;
    for (let y = -stripeH + kerbOffset; y < canvas.height; y += stripeH) {
        const alt = Math.floor((y - kerbOffset + stripeH * 100) / stripeH) % 2 === 0;
        ctx.fillStyle = alt ? '#dd1111' : '#eeeeee';
        ctx.fillRect(0, y, CURB_W, stripeH);
        ctx.fillStyle = alt ? '#eeeeee' : '#dd1111';
        ctx.fillRect(canvas.width - CURB_W, y, CURB_W, stripeH);
    }

    // Solid white edge lines (inside kerbs)
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.fillRect(CURB_W, 0, 3, canvas.height);
    ctx.fillRect(canvas.width - CURB_W - 3, 0, 3, canvas.height);

    // Yellow dashed lane dividers (real-road feel)
    ctx.fillStyle = '#e8c040';
    for (let i = -totalDashSegment + trackLineOffset; i < canvas.height; i += totalDashSegment) {
        ctx.fillRect(Math.round(LANE_WIDTH) - 2, i, 4, dashLength);
        ctx.fillRect(Math.round(LANE_WIDTH * 2) - 2, i, 4, dashLength);
    }
}

function drawCars() {
    drawCarPattern(playerCar.x, playerCar.y, playerCar.color, PLAYER_PATTERN);
    aiCars.forEach(car => drawCarPattern(car.x, car.y, car.color, AI_PATTERN));
}

function getAISpeed() {
    const mult = 1 + (difficultyLevel - 1) * 0.3;
    return (AI_SPEED_MIN + Math.random() * (AI_SPEED_MAX - AI_SPEED_MIN)) * mult;
}

function spawnAICar() {
    const maxCars = Math.min(6, 2 + Math.floor(difficultyLevel / 2));
    if (aiCars.length >= maxCars) return;
    const lane = Math.floor(Math.random() * 3);
    const x = laneX(lane);
    const y = -CAR_HEIGHT - (Math.random() * canvas.height * 0.5);
    aiCars.push({
        x, y,
        width: CAR_WIDTH, height: CAR_HEIGHT,
        speed: getAISpeed(),
        laneIndex: lane,
        targetX: x,
        laneChangeTimer: 90 + Math.floor(Math.random() * 140),
        color: AI_COLORS[Math.floor(Math.random() * AI_COLORS.length)]
    });
}

function updateAILanes() {
    if (difficultyLevel < 2) return; // no lane changes at level 1
    aiCars.forEach(car => {
        // Lerp toward target lane
        const d = car.targetX - car.x;
        if (Math.abs(d) < 0.5) car.x = car.targetX;
        else car.x += d * 0.08;

        // Count down to lane change
        car.laneChangeTimer--;
        if (car.laneChangeTimer <= 0) {
            const options = [];
            if (car.laneIndex > 0) options.push(car.laneIndex - 1);
            if (car.laneIndex < 2) options.push(car.laneIndex + 1);
            if (options.length > 0) {
                car.laneIndex = options[Math.floor(Math.random() * options.length)];
                car.targetX = laneX(car.laneIndex);
            }
            car.laneChangeTimer = 90 + Math.floor(Math.random() * 140);
        }
    });
}

// ---- Screen shake ----
function triggerShake(mag, duration) { shakeMag = mag; shakeTimer = duration; }

// ---- Explosion particles ----
function createExplosion(x, y) {
    const colors = ['#ff3e88', '#ff8c00', '#ffff55', '#ffffff'];
    for (let i = 0; i < 18; i++) {
        const angle = (i / 18) * Math.PI * 2 + Math.random() * 0.4;
        const speed = 1.5 + Math.random() * 4;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0, decay: 0.035,
            size: 2 + Math.random() * 3,
            color: colors[Math.floor(Math.random() * colors.length)]
        });
    }
}

function updateParticles() {
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        p.vy += 0.08;
        p.life -= p.decay;
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
    });
    ctx.globalAlpha = 1;
}

// ---- Lives HUD ----
const MINI_CAR = [
    [0, 3, 3, 0],  // headlights
    [5, 1, 1, 5],  // front wheels
    [0, 2, 2, 0],  // cockpit
    [5, 1, 1, 5],  // rear wheels
    [0, 4, 4, 0],  // taillights
];
function drawLivesHUD() {
    const pu = 3;
    for (let i = 0; i < lives; i++) {
        const ox = 8 + i * (4 * pu + 5);
        const oy = 6;
        ctx.save();
        MINI_CAR.forEach((row, ry) => row.forEach((cell, cx2) => {
            if (cell === 0) return;
            const px = ox + cx2 * pu, py = oy + ry * pu;
            switch (cell) {
                case 1: ctx.fillStyle = '#00dc82'; ctx.shadowBlur = 5; ctx.shadowColor = '#00dc82'; break;
                case 2: ctx.fillStyle = '#0a1a2e'; ctx.shadowBlur = 0; break;
                case 3: ctx.fillStyle = '#ffffa0'; ctx.shadowBlur = 4; ctx.shadowColor = '#ffff66'; break;
                case 4: ctx.fillStyle = '#ff2020'; ctx.shadowBlur = 3; ctx.shadowColor = '#ff0000'; break;
                case 5: ctx.fillStyle = '#1c1c1c'; ctx.shadowBlur = 0; break;
            }
            ctx.fillRect(px, py, pu, pu);
        }));
        ctx.restore();
    }
}

// ---- Score pops ----
let scorePops = [];
function createScorePop(x, y, text = '+1', color = '#00dc82') {
    scorePops.push({ x, y, text, color, life: 1.0 });
}
function updateScorePops() {
    scorePops = scorePops.filter(p => p.life > 0);
    scorePops.forEach(p => {
        p.y -= 1.5; p.life -= 0.025;
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.font = `bold 14px monospace`;
        ctx.textAlign = 'center';
        ctx.shadowBlur = 8; ctx.shadowColor = p.color;
        ctx.fillText(p.text, p.x, p.y);
        ctx.restore();
    });
}

// ---- Web Audio ----
let audioCtx = null;
let engineOsc = null, engineGain = null;

function getAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
}

function playTone(freq, type, duration, vol = 0.12, startFreq = null) {
    try {
        const ac = getAudio();
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        osc.connect(gain); gain.connect(ac.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(startFreq || freq, ac.currentTime);
        if (startFreq) osc.frequency.exponentialRampToValueAtTime(freq, ac.currentTime + duration);
        gain.gain.setValueAtTime(vol, ac.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + duration);
        osc.start(ac.currentTime);
        osc.stop(ac.currentTime + duration);
    } catch(e) {}
}

function sfxCrash()    { playTone(80,  'sawtooth', 0.35, 0.2,  200); }
function sfxNitro()    { playTone(660, 'sine',     0.25, 0.1,  220); }
function sfxNearMiss() { playTone(880, 'square',   0.08, 0.07, 1100); }
function sfxLevelUp()  { playTone(523, 'sine',     0.4,  0.08, 392); }

function startEngineSound() {
    try {
        const ac = getAudio();
        if (engineOsc) { try { engineOsc.stop(); } catch(e) {} }
        engineOsc = ac.createOscillator();
        engineGain = ac.createGain();
        engineOsc.connect(engineGain); engineGain.connect(ac.destination);
        engineOsc.type = 'sawtooth';
        engineOsc.frequency.setValueAtTime(80, ac.currentTime);
        engineGain.gain.setValueAtTime(0.04, ac.currentTime);
        engineOsc.start();
    } catch(e) {}
}

function updateEngineSound() {
    if (!engineOsc || !audioCtx) return;
    try {
        const speedMult = currentSpeed / TRACK_SPEED * (nitroActive > 0 ? NITRO_MULT : 1);
        const freq = 70 + speedMult * 30;
        const vol  = gameOver ? 0 : 0.03 + (speedMult - 1) * 0.01;
        engineOsc.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.1);
        engineGain.gain.setTargetAtTime(Math.max(0, vol), audioCtx.currentTime, 0.1);
    } catch(e) {}
}

function stopEngineSound() {
    try { if (engineOsc) { engineGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.1); } } catch(e) {}
}

// ---- GET READY countdown ----
function drawCountdownFrame() {
    drawTrack();
    drawScenery();
    drawCarPattern(playerCar.x, playerCar.y, playerCar.color, PLAYER_PATTERN);
    drawLivesHUD();
    drawNitroHUD();
    drawScanlines();
    ctx.save();
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(201,209,217,0.75)';
    ctx.font = 'bold 18px monospace';
    ctx.fillText('GET READY', canvas.width / 2, canvas.height / 2 - 55);
    ctx.font = 'bold 80px monospace';
    ctx.fillStyle = '#00dc82';
    ctx.shadowBlur = 30; ctx.shadowColor = '#00dc82';
    ctx.fillText(countdown > 0 ? countdown : 'GO!', canvas.width / 2, canvas.height / 2 + 24);
    ctx.restore();
}

function startCountdown() {
    countdown = 3;
    drawCountdownFrame();
    countdownId = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
            clearInterval(countdownId);
            drawCountdownFrame();
            setTimeout(() => {
                countdown = 0;
                lastScoreIncrementTime = Date.now();
                startEngineSound();
            }, 500);
        } else {
            drawCountdownFrame();
        }
    }, 900);
}

// ---- Near-miss bonus ----
function checkNearMisses() {
    if (invincible > 0) return;
    aiCars.forEach(car => {
        if (car.nearMissCooldown > 0) { car.nearMissCooldown--; return; }
        // Vertically overlapping (alongside player)
        const vertOverlap = playerCar.y < car.y + car.height && playerCar.y + playerCar.height > car.y;
        if (!vertOverlap) return;
        // Horizontal gap (near but not touching)
        const leftGap  = playerCar.x - (car.x + car.width);
        const rightGap = car.x - (playerCar.x + playerCar.width);
        const gap = Math.max(leftGap, rightGap);
        if (gap > 0 && gap < 14) {
            score++;
            document.getElementById('score').innerText = score;
            createScorePop(playerCar.x + CAR_WIDTH / 2, playerCar.y - 8, '⚡ NEAR!', '#ffff00');
            triggerShake(2, 4);
            sfxNearMiss();
            car.nearMissCooldown = 60;
        }
    });
}

// ---- Nitro ----
function activateNitro() {
    if (nitroCharges <= 0 || nitroActive > 0 || gameOver || gamePaused) return;
    nitroCharges--;
    nitroActive = NITRO_DURATION;
    sfxNitro();
}

function updateNitro() {
    if (nitroActive > 0) nitroActive--;
    nitroRechargeTimer++;
    if (nitroRechargeTimer >= NITRO_RECHARGE && nitroCharges < 3) {
        nitroCharges++;
        nitroRechargeTimer = 0;
    }
}

function drawNitroHUD() {
    const barW = 28, barH = 8, gap = 6;
    const totalW = 3 * barW + 2 * gap;
    const startX = (canvas.width - totalW) / 2;
    const y = canvas.height - 16;
    for (let i = 0; i < 3; i++) {
        const x = startX + i * (barW + gap);
        const filled = i < nitroCharges;
        const active = nitroActive > 0 && filled;
        ctx.save();
        ctx.globalAlpha = filled ? 0.9 : 0.25;
        ctx.fillStyle = active ? '#ffffff' : '#00ffff';
        if (active) { ctx.shadowBlur = 12; ctx.shadowColor = '#00ffff'; }
        ctx.fillRect(x, y, barW, barH);
        ctx.restore();
    }
    // Label
    ctx.save();
    ctx.font = '9px monospace';
    ctx.fillStyle = '#00ffff';
    ctx.textAlign = 'center';
    ctx.globalAlpha = 0.7;
    ctx.fillText('NITRO', canvas.width / 2, y - 3);
    ctx.restore();
}

function updateDifficulty() {
    difficultyLevel = 1 + Math.floor(score / 50);
    currentSpeed = Math.min(9, TRACK_SPEED + (difficultyLevel - 1) * 0.8);
    if (difficultyLevel !== lastDifficultyLevel) {
        levelUpFlash = 50;
        sfxLevelUp();
        lastDifficultyLevel = difficultyLevel;
        // Ensure enough cars on screen at new difficulty
        const maxCars = Math.min(6, 2 + Math.floor(difficultyLevel / 2));
        while (aiCars.length < maxCars) spawnAICar();
    }
}

function drawDifficultyHUD() {
    // Level-up flash
    if (levelUpFlash > 0) {
        levelUpFlash--;
        ctx.save();
        ctx.globalAlpha = (levelUpFlash / 50) * 0.3;
        ctx.fillStyle = '#00dc82';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = Math.min(1, levelUpFlash / 25);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 28px monospace';
        ctx.textAlign = 'center';
        ctx.shadowBlur = 16;
        ctx.shadowColor = '#00dc82';
        ctx.fillText(`LEVEL ${difficultyLevel}`, canvas.width / 2, canvas.height / 2);
        ctx.restore();
    }
    // Persistent level badge top-right
    ctx.save();
    ctx.font = 'bold 12px monospace';
    ctx.fillStyle = '#00dc82';
    ctx.textAlign = 'right';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#00dc82';
    ctx.fillText(`LVL ${difficultyLevel}`, canvas.width - 8, 20);
    ctx.restore();
}

function laneX(index) {
    return index * LANE_WIDTH + (LANE_WIDTH / 2) - (CAR_WIDTH / 2);
}

function changeLane(dir) {
    // Block if mid-slide (more than 5px from target)
    if (Math.abs(playerCar.x - playerCar.targetX) > 5) return;
    if (dir === 'left'  && playerCar.laneIndex > 0) playerCar.laneIndex--;
    else if (dir === 'right' && playerCar.laneIndex < 2) playerCar.laneIndex++;
    playerCar.targetX = laneX(playerCar.laneIndex);
}

function update() {
    if (gamePaused || gameOver || countdown > 0) return;

    // Death animation phase — keep particles alive, wait for cinematic to finish
    if (deathAnim) {
        deathAnim.timer--;
        if (deathAnim.timer % 8 === 0) {
            createExplosion(
                deathAnim.cx + (Math.random() - 0.5) * 36,
                deathAnim.cy + (Math.random() - 0.5) * 28
            );
        }
        if (deathAnim.timer <= 0) {
            deathAnim = null;
            gameOver = true;
            saveHighScore(score);
            showGameOver();
        }
        return;
    }

    // Smooth lane lerp (player)
    const diff = playerCar.targetX - playerCar.x;
    if (Math.abs(diff) < 0.5) {
        playerCar.x = playerCar.targetX;
    } else {
        playerCar.x += diff * 0.18;
    }

    updateAILanes();

    const effectiveSpeed = currentSpeed * (nitroActive > 0 ? NITRO_MULT : 1);
    aiCars.forEach((car, index) => {
        car.y += car.speed * (effectiveSpeed / TRACK_SPEED);
        if (car.y > canvas.height) { aiCars.splice(index, 1); spawnAICar(); }
        // Collision — skip if invincible
        if (invincible <= 0 &&
            playerCar.x < car.x + car.width &&
            playerCar.x + playerCar.width > car.x &&
            playerCar.y < car.y + car.height &&
            playerCar.y + playerCar.height > car.y) {
            lives--;
            sfxCrash();
            if (lives <= 0) {
                stopEngineSound();
                // Spawn big multi-point explosion for the finale
                for (let e = 0; e < 5; e++) {
                    createExplosion(
                        playerCar.x + Math.random() * CAR_WIDTH,
                        playerCar.y + Math.random() * CAR_HEIGHT
                    );
                }
                triggerShake(14, 35);
                deathAnim = {
                    timer: 90,
                    cx: playerCar.x + CAR_WIDTH / 2,
                    cy: playerCar.y + CAR_HEIGHT / 2
                };
            } else {
                createExplosion(playerCar.x + CAR_WIDTH / 2, playerCar.y + CAR_HEIGHT / 2);
                triggerShake(6, 12);
                invincible = 120;
                aiCars.splice(index, 1);
                spawnAICar();
            }
        }
    });

    if (invincible > 0) invincible--;
    updateNitro();
    updateEngineSound();
    checkNearMisses();

    const currentTime = Date.now();
    if (currentTime - lastScoreIncrementTime > SCORE_INCREMENT_INTERVAL) {
        score++;
        document.getElementById('score').innerText = score;
        lastScoreIncrementTime = currentTime;
        updateDifficulty();
    }
}

function drawDeathAnim() {
    const t        = deathAnim.timer;
    const progress = 1 - t / 90;           // 0→1 as timer counts down
    const { cx, cy } = deathAnim;

    // Pulsing red screen flash (peaks mid-animation then fades)
    const flashAlpha = Math.sin(progress * Math.PI) * 0.5;
    ctx.save();
    ctx.globalAlpha = flashAlpha;
    ctx.fillStyle = '#ff1100';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.restore();

    // Three staggered expanding fire rings
    const RING_COLORS = ['#ff8800', '#ff3300', '#ffcc00'];
    for (let i = 0; i < 3; i++) {
        const rp = Math.max(0, progress - i * 0.14);
        if (rp <= 0) continue;
        const r = rp * 100;
        const alpha = Math.max(0, 1 - rp * 1.1);
        ctx.save();
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = RING_COLORS[i];
        ctx.lineWidth = 4 - i;
        ctx.globalAlpha = alpha;
        ctx.shadowBlur = 24; ctx.shadowColor = '#ff5500';
        ctx.stroke();
        ctx.restore();
    }

    // "WRECKED!" text slams in after ring starts expanding
    if (progress > 0.35) {
        const ta  = Math.min(1, (progress - 0.35) * 5);
        const scale = 1.2 - 0.2 * Math.min(1, (progress - 0.35) * 4);  // slam scale
        ctx.save();
        ctx.textAlign = 'center';
        ctx.globalAlpha = ta;
        ctx.translate(canvas.width / 2, canvas.height / 2 - 18);
        ctx.scale(scale, scale);
        ctx.font = 'bold 52px monospace';
        ctx.fillStyle = '#ffffff';
        ctx.shadowBlur = 28; ctx.shadowColor = '#ff3e00';
        ctx.fillText('WRECKED!', 0, 0);
        // Red outline pass
        ctx.strokeStyle = '#ff3e00';
        ctx.lineWidth = 2;
        ctx.strokeText('WRECKED!', 0, 0);
        ctx.restore();
    }
}

function draw() {
    ctx.save();
    // Screen shake
    if (shakeTimer > 0) {
        shakeTimer--;
        ctx.translate((Math.random() - 0.5) * shakeMag * 2, (Math.random() - 0.5) * shakeMag * 2);
        if (shakeTimer <= 0) shakeMag = 0;
    }

    // Hand off to animateGameOver when it's running
    if (gameOver) { ctx.restore(); return; }

    drawTrack();
    drawScenery();
    drawSpeedLines();

    if (deathAnim) {
        // Only show AI cars + wreckage during death cinematic
        aiCars.forEach(car => drawCarPattern(car.x, car.y, car.color, AI_PATTERN));
        updateParticles();
        drawDeathAnim();
        drawScanlines();
    } else {
        // Normal gameplay rendering
        const showPlayer = invincible <= 0 || Math.floor(invincible / 6) % 2 !== 0;
        if (showPlayer) drawCarPattern(playerCar.x, playerCar.y, playerCar.color, PLAYER_PATTERN);
        aiCars.forEach(car => drawCarPattern(car.x, car.y, car.color, AI_PATTERN));
        updateParticles();
        updateScorePops();
        drawLivesHUD();
        drawNitroHUD();
        drawDifficultyHUD();
        if (gamePaused) {
            ctx.fillStyle = 'rgba(0,0,0,0.55)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            drawText('PAUSED', canvas.width / 2, canvas.height / 2, '#00dc82');
        }
        drawScanlines();
    }

    ctx.restore();
}

function drawText(text, x, y, color, fontSize = '30px') {
    ctx.fillStyle = color;
    ctx.font = `${fontSize} monospace`;
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
}

let goAnim = null;
function showGameOver() {
    saveHighScore(score);
    const prevBest = parseInt(localStorage.getItem(HS_KEY) || '0');
    goAnim = { frame: 0, displayScore: 0, isNewBest: score >= prevBest, embers: [] };
    // Seed floating embers for atmosphere
    for (let i = 0; i < 30; i++) {
        goAnim.embers.push({
            x: Math.random() * canvas.width,
            y: canvas.height + Math.random() * 60,
            vx: (Math.random() - 0.5) * 1.2,
            vy: -(0.6 + Math.random() * 1.4),
            size: 1 + Math.random() * 3,
            alpha: 0.4 + Math.random() * 0.6,
            color: Math.random() > 0.5 ? '#ff6600' : '#ffcc00'
        });
    }
    requestAnimationFrame(animateGameOver);
}

function animateGameOver() {
    if (!goAnim) return;
    goAnim.frame++;
    const f   = goAnim.frame;
    const cx  = canvas.width / 2;
    const cy  = canvas.height / 2;

    // ── Background: dark with gradient vignette ──────────────────────────
    ctx.fillStyle = '#080b10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Radial glow behind title (dark red)
    const grd = ctx.createRadialGradient(cx, cy - 60, 10, cx, cy - 60, 160);
    grd.addColorStop(0,   `rgba(180, 20, 20, ${Math.min(0.35, f / 80 * 0.35)})`);
    grd.addColorStop(1,   'rgba(0,0,0,0)');
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // ── Floating fire embers ─────────────────────────────────────────────
    goAnim.embers.forEach(em => {
        em.x += em.vx; em.y += em.vy;
        em.vx += (Math.random() - 0.5) * 0.06;
        if (em.y < -10) { em.y = canvas.height + 5; em.x = Math.random() * canvas.width; }
        ctx.save();
        ctx.globalAlpha = em.alpha * Math.min(1, f / 30);
        ctx.fillStyle = em.color;
        ctx.shadowBlur = 6; ctx.shadowColor = em.color;
        ctx.beginPath();
        ctx.arc(em.x, em.y, em.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });

    // ── "GAME OVER" title slides down from top ───────────────────────────
    const titleY = Math.min(cy - 75, -50 + f * 7);
    ctx.save();
    ctx.textAlign = 'center';
    ctx.globalAlpha = Math.min(1, f / 12);
    ctx.font = 'bold 46px monospace';
    ctx.fillStyle = '#ff3e88';
    ctx.shadowBlur = 30; ctx.shadowColor = '#ff0044';
    ctx.fillText('GAME OVER', cx, titleY);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1;
    ctx.strokeText('GAME OVER', cx, titleY);
    ctx.restore();

    // ── Divider line ─────────────────────────────────────────────────────
    if (f > 14) {
        const la = Math.min(1, (f - 14) / 12);
        ctx.save();
        ctx.globalAlpha = la * 0.5;
        ctx.strokeStyle = '#ff3e88';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - 100, cy - 40); ctx.lineTo(cx + 100, cy - 40);
        ctx.stroke();
        ctx.restore();
    }

    // ── Score count-up ───────────────────────────────────────────────────
    if (f > 18) {
        const countSpeed = Math.max(1, Math.ceil(score / 35));
        if (goAnim.displayScore < score)
            goAnim.displayScore = Math.min(score, goAnim.displayScore + countSpeed);
        ctx.save();
        ctx.textAlign = 'center';
        ctx.globalAlpha = Math.min(1, (f - 18) / 14);
        ctx.font = '13px monospace';
        ctx.fillStyle = 'rgba(200,210,220,0.7)';
        ctx.fillText('FINAL SCORE', cx, cy - 12);
        ctx.font = 'bold 38px monospace';
        ctx.fillStyle = '#00dc82';
        ctx.shadowBlur = 14; ctx.shadowColor = '#00dc82';
        ctx.fillText(goAnim.displayScore, cx, cy + 28);
        ctx.restore();
    }

    // ── NEW BEST banner ───────────────────────────────────────────────────
    if (goAnim.isNewBest && goAnim.displayScore >= score && f > 32) {
        const pulse = 0.72 + Math.sin(f * 0.18) * 0.28;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.globalAlpha = pulse * Math.min(1, (f - 32) / 10);
        ctx.font = 'bold 18px monospace';
        ctx.fillStyle = '#ffd700';
        ctx.shadowBlur = 20; ctx.shadowColor = '#ffaa00';
        ctx.fillText('★  NEW BEST!  ★', cx, cy + 62);
        ctx.restore();
    }

    // ── "Press Enter" blink ───────────────────────────────────────────────
    if (f > 55) {
        const blink = Math.floor(f / 26) % 2 === 0;
        ctx.save();
        ctx.textAlign = 'center';
        ctx.globalAlpha = blink ? 0.85 : 0.25;
        ctx.font = '12px monospace';
        ctx.fillStyle = '#8899aa';
        ctx.fillText('[ ENTER ]  Restart', cx, cy + 95);
        ctx.restore();
    }

    drawScanlines();
    if (gameOver) requestAnimationFrame(animateGameOver);
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// ---- Keyboard controls ----
document.addEventListener('keydown', e => {
    if (gameOver) { if (e.key === 'Enter') resetGame(); return; }
    if (deathAnim) return;  // no input during crash cinematic
    if (e.key === 'Enter') { gamePaused = !gamePaused; return; }
    if (!gamePaused && countdown <= 0) {
        if (e.key === 'ArrowLeft')  changeLane('left');
        if (e.key === 'ArrowRight') changeLane('right');
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') activateNitro();
    }
});

// ---- Touch controls ----
const btnLeft  = document.getElementById('btn-left');
const btnRight = document.getElementById('btn-right');

if (btnLeft) {
    btnLeft.addEventListener('touchstart', e => { e.preventDefault(); changeLane('left'); }, { passive: false });
    btnLeft.addEventListener('click', () => changeLane('left'));
}
if (btnRight) {
    btnRight.addEventListener('touchstart', e => { e.preventDefault(); changeLane('right'); }, { passive: false });
    btnRight.addEventListener('click', () => changeLane('right'));
}

function resetGame() {
    playerCar.laneIndex = 1;
    playerCar.x = laneX(1);
    playerCar.targetX = laneX(1);
    aiCars = [];
    score = 0;
    gameOver = false;
    gamePaused = false;
    currentSpeed = TRACK_SPEED;
    difficultyLevel = 1;
    lastDifficultyLevel = 1;
    levelUpFlash = 0;
    lives = 3;
    invincible = 0;
    shakeTimer = 0;
    shakeMag = 0;
    particles = [];
    scorePops = [];
    goAnim = null;
    deathAnim = null;
    nitroCharges = 3;
    nitroActive = 0;
    nitroRechargeTimer = 0;
    countdown = 0;
    if (countdownId) clearInterval(countdownId);
    stopEngineSound();
    document.getElementById('score').innerText = score;
    initScenery();
    initSpeedLines();
    spawnAICar();
    spawnAICar();
    startCountdown();
}

loadHighScore();
resetGame();
gameLoop();
