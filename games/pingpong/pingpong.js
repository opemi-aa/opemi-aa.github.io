const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

const HS_KEY     = 'highscore_pingpong';
const PW         = 12;     // paddle width
const PH         = 90;     // paddle height
const BALL_R     = 8;      // ball radius
const WIN_SCORE  = 11;     // first to 11
const BASE_SPD   = 5;
const AI_SPEED   = 3.6;    // max AI movement per frame
const PAD_MARGIN = 18;     // paddle distance from edge
const PLAYER_SPD = 7;      // keyboard/touch move speed per frame

// ── STATE ─────────────────────────────────────────────────────────────
let playerY, aiY;
let ballX, ballY, ballVX, ballVY;
let playerScore, aiScore, rallyCount;
let particles = [], trail = [], scorePops = [];
let gameState  = 'idle'; // idle | countdown | playing | paused | gameover
let countdown  = 0, cdTimer = null;
let goAnim     = null;
let paddleMoving = 0;   // touch hold: -1 up, 0 still, +1 down
let rafId      = null;
const keysHeld = {};

// ── AUDIO ─────────────────────────────────────────────────────────────
let audioCtx = null;
function getAudio() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
}
function playTone(freq, type, dur, vol = 0.12, freqEnd = null) {
    try {
        const ac = getAudio();
        const osc = ac.createOscillator(), gain = ac.createGain();
        osc.connect(gain); gain.connect(ac.destination);
        osc.type = type;
        osc.frequency.setValueAtTime(freq, ac.currentTime);
        if (freqEnd) osc.frequency.exponentialRampToValueAtTime(freqEnd, ac.currentTime + dur);
        gain.gain.setValueAtTime(vol, ac.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
        osc.start(); osc.stop(ac.currentTime + dur);
    } catch(e) {}
}
function sfxHit()   { playTone(320, 'square', 0.06, 0.15); }
function sfxWall()  { playTone(200, 'square', 0.05, 0.10); }
function sfxScore() { playTone(523, 'sine',   0.30, 0.12, 200); }
function sfxWin()   { playTone(660, 'sine',   0.50, 0.14, 1100); }

// ── HIGH SCORE ────────────────────────────────────────────────────────
function loadHS() {
    const el = document.getElementById('highscore');
    const hs = localStorage.getItem(HS_KEY);
    if (el) el.textContent = hs || '--';
}
function saveHS(s) {
    const cur = parseInt(localStorage.getItem(HS_KEY) || '0');
    if (s > cur) {
        localStorage.setItem(HS_KEY, s);
        const el = document.getElementById('highscore');
        if (el) el.textContent = s;
    }
}

// ── PARTICLES ─────────────────────────────────────────────────────────
function spawnHitParticles(x, y, color) {
    for (let i = 0; i < 14; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = 1.5 + Math.random() * 4.5;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1.0,
            decay: 0.045 + Math.random() * 0.04,
            size: 2 + Math.random() * 3.5,
            color
        });
    }
}
function updateParticles() {
    particles = particles.filter(p => p.life > 0);
    particles.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.vy += 0.06; p.life -= p.decay;
        if (p.life <= 0) return; // guard: skip draw if life crossed zero this frame
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 7; ctx.shadowColor = p.color;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    });
}

// ── SCORE POPS ────────────────────────────────────────────────────────
function spawnScorePop(x, y, text) {
    scorePops.push({ x, y, text, life: 1.0 });
}
function updateScorePops() {
    scorePops = scorePops.filter(p => p.life > 0);
    scorePops.forEach(p => {
        p.y -= 1.6; p.life -= 0.02;
        ctx.save();
        ctx.globalAlpha = p.life;
        ctx.textAlign = 'center';
        ctx.font = 'bold 30px monospace';
        ctx.fillStyle = '#ffd700';
        ctx.shadowBlur = 14; ctx.shadowColor = '#ffd700';
        ctx.fillText(p.text, p.x, p.y);
        ctx.restore();
    });
}

// ── BALL TRAIL ────────────────────────────────────────────────────────
const TRAIL_LEN = 12;
function updateTrail() {
    trail.push({ x: ballX, y: ballY });
    if (trail.length > TRAIL_LEN) trail.shift();
}
function drawTrail() {
    trail.forEach((pos, i) => {
        const t = i / TRAIL_LEN;
        ctx.save();
        ctx.globalAlpha = t * 0.38;
        ctx.fillStyle = '#00ccff';
        ctx.shadowBlur = 8; ctx.shadowColor = '#00ccff';
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, BALL_R * t * 0.8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });
}

// ── DRAW HELPERS ──────────────────────────────────────────────────────
function drawBackground() {
    ctx.fillStyle = '#0d1117';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawCourt() {
    ctx.save();
    // Dashed centre line
    ctx.setLineDash([12, 16]);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
    // Centre circle
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, 65, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
}

function drawPaddle(x, y, color) {
    const r = 5;
    ctx.save();
    ctx.shadowBlur = 24; ctx.shadowColor = color;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + PW - r, y);   ctx.quadraticCurveTo(x + PW, y,      x + PW, y + r);
    ctx.lineTo(x + PW, y + PH - r); ctx.quadraticCurveTo(x + PW, y + PH, x + PW - r, y + PH);
    ctx.lineTo(x + r, y + PH);   ctx.quadraticCurveTo(x,      y + PH, x,      y + PH - r);
    ctx.lineTo(x, y + r);        ctx.quadraticCurveTo(x,      y,      x + r, y);
    ctx.closePath();
    ctx.fill();
    // Bright edge highlight
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.28;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x + 2, y + 5, 2, PH - 10);
    ctx.restore();
}

function drawBall() {
    ctx.save();
    ctx.shadowBlur = 26; ctx.shadowColor = '#00ccff';
    ctx.fillStyle = '#ffffff';
    ctx.beginPath(); ctx.arc(ballX, ballY, BALL_R, 0, Math.PI * 2); ctx.fill();
    // Inner cyan highlight
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = '#00ccff';
    ctx.beginPath(); ctx.arc(ballX - 2, ballY - 2, BALL_R * 0.42, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
}

function drawScoresBig() {
    // Large faded scores on canvas
    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = 'bold 80px monospace';
    ctx.globalAlpha = 0.1;
    ctx.fillStyle = '#ffffff';
    ctx.fillText(playerScore, canvas.width / 4, 105);
    ctx.fillText(aiScore,     canvas.width * 3 / 4, 105);
    ctx.restore();
}

function drawScanlines() {
    ctx.save();
    ctx.globalAlpha = 0.035;
    ctx.fillStyle = '#000';
    for (let y = 0; y < canvas.height; y += 4) {
        ctx.fillRect(0, y, canvas.width, 2);
    }
    ctx.restore();
}

// ── OVERLAY SCREENS ───────────────────────────────────────────────────
function drawIdleScreen() {
    const pulse = 0.65 + Math.sin(Date.now() * 0.004) * 0.35;
    ctx.save();
    ctx.textAlign = 'center';
    ctx.globalAlpha = pulse;
    ctx.font = 'bold 16px monospace';
    ctx.fillStyle = '#00dc82';
    ctx.shadowBlur = 22; ctx.shadowColor = '#00dc82';
    ctx.fillText('PRESS ENTER TO START', canvas.width / 2, canvas.height / 2 + 16);
    ctx.restore();
}

function drawPauseScreen() {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.6)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.font = 'bold 36px monospace';
    ctx.fillStyle = '#00dc82';
    ctx.shadowBlur = 24; ctx.shadowColor = '#00dc82';
    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2 - 10);
    ctx.font = '13px monospace';
    ctx.fillStyle = '#8899aa';
    ctx.shadowBlur = 0;
    ctx.fillText('ENTER to resume', canvas.width / 2, canvas.height / 2 + 30);
    ctx.restore();
}

function drawCountdownScreen() {
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.38)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.textAlign = 'center';
    ctx.font = 'bold 88px monospace';
    ctx.fillStyle = '#00dc82';
    ctx.shadowBlur = 44; ctx.shadowColor = '#00dc82';
    ctx.fillText(countdown > 0 ? countdown : 'GO!', canvas.width / 2, canvas.height / 2 + 32);
    ctx.restore();
}

// ── BALL PHYSICS ──────────────────────────────────────────────────────
function currentSpeed() {
    return Math.min(BASE_SPD + rallyCount * 0.18, BASE_SPD * 2.5);
}

function launchBall(towardPlayer) {
    const angle = (Math.random() * Math.PI / 4) - Math.PI / 8;
    const spd   = currentSpeed();
    const dir   = towardPlayer ? -1 : 1;
    ballX  = canvas.width  / 2;
    ballY  = canvas.height / 2;
    ballVX = Math.cos(angle) * spd * dir;
    ballVY = Math.sin(angle) * spd;
    trail  = [];
}

function moveBall() {
    ballX += ballVX;
    ballY += ballVY;

    // Top / bottom walls
    if (ballY - BALL_R < 0) {
        ballY = BALL_R; ballVY = Math.abs(ballVY);
        spawnHitParticles(ballX, BALL_R, '#aaddff');
        sfxWall();
    }
    if (ballY + BALL_R > canvas.height) {
        ballY = canvas.height - BALL_R; ballVY = -Math.abs(ballVY);
        spawnHitParticles(ballX, canvas.height - BALL_R, '#aaddff');
        sfxWall();
    }

    // Player paddle (left)
    const px = PAD_MARGIN;
    if (ballVX < 0 &&
        ballX - BALL_R <= px + PW && ballX + BALL_R >= px &&
        ballY + BALL_R >= playerY  && ballY - BALL_R <= playerY + PH) {
        ballX = px + PW + BALL_R;
        const rel   = Math.max(0, Math.min(1, (ballY - playerY) / PH)); // clamp to [0,1]
        const angle = (rel - 0.5) * (Math.PI * 0.5); // max ±45° — keeps ballVX >= cos(45°)*spd
        const spd   = currentSpeed();
        ballVX = Math.cos(angle) * spd;
        ballVY = Math.sin(angle) * spd;
        rallyCount++;
        spawnHitParticles(px + PW, ballY, '#00dc82');
        sfxHit();
    }

    // AI paddle (right)
    const ax = canvas.width - PAD_MARGIN - PW;
    if (ballVX > 0 &&
        ballX + BALL_R >= ax && ballX - BALL_R <= ax + PW &&
        ballY + BALL_R >= aiY  && ballY - BALL_R <= aiY + PH) {
        ballX = ax - BALL_R;
        const rel   = Math.max(0, Math.min(1, (ballY - aiY) / PH)); // clamp to [0,1]
        const angle = (rel - 0.5) * (Math.PI * 0.5); // max ±45°
        const spd   = currentSpeed();
        ballVX = -(Math.cos(angle) * spd);
        ballVY = Math.sin(angle) * spd;
        rallyCount++;
        spawnHitParticles(ax, ballY, '#ff3e88');
        sfxHit();
    }

    // AI scored (ball left the left edge)
    if (ballX - BALL_R < 0) {
        aiScore++;
        updateScoreDOM();
        spawnScorePop(canvas.width * 0.75, 80, '+1 AI');
        sfxScore();
        rallyCount = 0;
        if (aiScore >= WIN_SCORE) { triggerGameOver(false); return; }
        gameState = 'countdown';
        startCountdown(() => launchBall(true)); // serve toward player
    }

    // Player scored (ball left the right edge)
    if (ballX + BALL_R > canvas.width) {
        playerScore++;
        updateScoreDOM();
        spawnScorePop(canvas.width * 0.25, 80, '+1 YOU');
        sfxScore();
        rallyCount = 0;
        if (playerScore >= WIN_SCORE) { triggerGameOver(true); return; }
        gameState = 'countdown';
        startCountdown(() => launchBall(false)); // serve toward AI
    }
}

function moveAI() {
    const center = aiY + PH / 2;
    if (ballVX > 0) {
        // Ball coming toward AI — track it
        if (center < ballY - 10) aiY += AI_SPEED;
        else if (center > ballY + 10) aiY -= AI_SPEED;
    } else {
        // Ball going away — drift back to centre slowly
        if (center < canvas.height / 2 - 18) aiY += 1.2;
        else if (center > canvas.height / 2 + 18) aiY -= 1.2;
    }
    aiY = Math.max(0, Math.min(canvas.height - PH, aiY));
}

function updateScoreDOM() {
    document.getElementById('score').innerText = `You: ${playerScore}  |  AI: ${aiScore}`;
}

// ── COUNTDOWN ─────────────────────────────────────────────────────────
function startCountdown(callback) {
    countdown = 3;
    if (cdTimer) clearInterval(cdTimer);
    cdTimer = setInterval(() => {
        countdown--;
        if (countdown <= 0) {
            clearInterval(cdTimer); cdTimer = null;
            countdown = 0;
            setTimeout(() => {
                if (gameState === 'countdown') {
                    gameState = 'playing';
                    callback();
                }
            }, 500);
        }
    }, 800);
}

// ── GAME OVER ─────────────────────────────────────────────────────────
function triggerGameOver(playerWon) {
    gameState = 'gameover';
    const prevBest = parseInt(localStorage.getItem(HS_KEY) || '0');
    saveHS(playerScore);
    sfxWin();
    const winColor = playerWon ? '#00dc82' : '#ff3e88';
    goAnim = {
        frame: 0,
        playerWon,
        isNewBest: playerScore > prevBest,
        winColor,
        embers: Array.from({ length: 30 }, () => ({
            x:     Math.random() * canvas.width,
            y:     Math.random() * canvas.height,
            vx:    (Math.random() - 0.5) * 1.3,
            vy:    -(0.5 + Math.random() * 1.6),
            size:  1.5 + Math.random() * 3,
            alpha: 0.3 + Math.random() * 0.5,
            color: playerWon
                ? (Math.random() > 0.5 ? '#00dc82' : '#00ff99')
                : (Math.random() > 0.5 ? '#ff3e88' : '#ff8c00')
        }))
    };
    if (rafId) cancelAnimationFrame(rafId);
    requestAnimationFrame(animateGameOver);
}

function animateGameOver() {
    if (!goAnim || gameState !== 'gameover') return;
    goAnim.frame++;
    const f  = goAnim.frame;
    const cx = canvas.width  / 2;
    const cy = canvas.height / 2;
    const wc = goAnim.winColor;

    ctx.fillStyle = f < 10 ? `rgba(8,11,16,${0.6 + f * 0.04})` : '#080b10';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Floating embers
    goAnim.embers.forEach(em => {
        em.x += em.vx; em.y += em.vy;
        em.vx += (Math.random() - 0.5) * 0.04;
        if (em.y < -10) { em.y = canvas.height + 5; em.x = Math.random() * canvas.width; }
        ctx.save();
        ctx.globalAlpha = em.alpha;
        ctx.fillStyle = em.color;
        ctx.shadowBlur = 7; ctx.shadowColor = em.color;
        ctx.beginPath(); ctx.arc(em.x, em.y, em.size, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    });

    // Winner text — fades in over 15 frames
    ctx.save();
    ctx.textAlign   = 'center';
    ctx.globalAlpha = Math.min(1, f / 15);
    ctx.font        = 'bold 64px monospace';
    ctx.fillStyle   = wc;
    ctx.shadowBlur  = 40; ctx.shadowColor = wc;
    ctx.fillText(goAnim.playerWon ? 'YOU WIN!' : 'AI WINS!', cx, cy - 80);
    ctx.restore();

    // Divider line
    if (f > 8) {
        ctx.save();
        ctx.globalAlpha = Math.min(0.5, (f - 8) / 12);
        ctx.strokeStyle = wc;
        ctx.lineWidth   = 1;
        ctx.beginPath();
        ctx.moveTo(cx - 150, cy - 42); ctx.lineTo(cx + 150, cy - 42);
        ctx.stroke();
        ctx.restore();
    }

    // Final score
    if (f > 12) {
        ctx.save();
        ctx.textAlign   = 'center';
        ctx.globalAlpha = Math.min(1, (f - 12) / 15);
        ctx.font        = '14px monospace';
        ctx.fillStyle   = 'rgba(180,200,215,0.75)';
        ctx.fillText('FINAL SCORE', cx, cy - 8);
        ctx.font        = 'bold 52px monospace';
        ctx.fillStyle   = '#ffffff';
        ctx.shadowBlur  = 16; ctx.shadowColor = '#ffffff';
        ctx.fillText(`${playerScore}  —  ${aiScore}`, cx, cy + 52);
        ctx.restore();
    }

    // NEW BEST banner
    if (goAnim.isNewBest && f > 30) {
        const pulse = 0.75 + Math.sin(f * 0.14) * 0.25;
        ctx.save();
        ctx.textAlign   = 'center';
        ctx.globalAlpha = pulse * Math.min(1, (f - 30) / 12);
        ctx.font        = 'bold 20px monospace';
        ctx.fillStyle   = '#ffd700';
        ctx.shadowBlur  = 22; ctx.shadowColor = '#ffaa00';
        ctx.fillText('★  NEW BEST!  ★', cx, cy + 96);
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
        ctx.fillText('ENTER or tap to play again', cx, cy + 130);
        ctx.restore();
    }

    drawScanlines();
    requestAnimationFrame(animateGameOver);
}

// ── INIT ──────────────────────────────────────────────────────────────
function init() {
    playerY      = (canvas.height - PH) / 2;
    aiY          = (canvas.height - PH) / 2;
    ballX        = canvas.width  / 2;
    ballY        = canvas.height / 2;
    ballVX = ballVY = 0;
    playerScore  = 0; aiScore = 0; rallyCount = 0;
    particles    = []; trail = []; scorePops = [];
    goAnim       = null;
    gameState    = 'idle';
    document.getElementById('score').innerText = 'You: 0  |  AI: 0';
    if (cdTimer) { clearInterval(cdTimer); cdTimer = null; }
    loadHS();
}

// ── MAIN LOOP ─────────────────────────────────────────────────────────
function gameLoop() {
    drawBackground();
    drawCourt();
    drawScoresBig();

    if (gameState === 'playing') {
        moveBall();
        moveAI();
        // Smooth keyboard movement
        if (keysHeld['ArrowUp']   || keysHeld['w'] || keysHeld['W'])
            playerY = Math.max(0, playerY - PLAYER_SPD);
        if (keysHeld['ArrowDown'] || keysHeld['s'] || keysHeld['S'])
            playerY = Math.min(canvas.height - PH, playerY + PLAYER_SPD);
        // Touch hold movement
        if (paddleMoving !== 0)
            playerY = Math.max(0, Math.min(canvas.height - PH, playerY + paddleMoving * PLAYER_SPD));
    }

    if (gameState !== 'gameover') {
        if (gameState !== 'idle') updateTrail();
        drawTrail();
        if (gameState !== 'idle') drawBall();
        drawPaddle(PAD_MARGIN, playerY, '#00dc82');
        drawPaddle(canvas.width - PAD_MARGIN - PW, aiY, '#ff3e88');
        updateParticles();
        updateScorePops();
        drawScanlines();
    }

    if      (gameState === 'idle')      drawIdleScreen();
    else if (gameState === 'paused')    drawPauseScreen();
    else if (gameState === 'countdown') drawCountdownScreen();

    if (gameState !== 'gameover') {
        rafId = requestAnimationFrame(gameLoop);
    }
}

// ── CONTROLS ──────────────────────────────────────────────────────────
function handleAction() {
    if (gameState === 'gameover') { init(); gameLoop(); return; }
    if (gameState === 'idle') {
        gameState = 'countdown';
        startCountdown(() => launchBall(false));
        return;
    }
    if (gameState === 'playing')   { gameState = 'paused';  return; }
    if (gameState === 'paused')    { gameState = 'playing'; return; }
}

document.addEventListener('keydown', e => {
    keysHeld[e.key] = true;
    if (e.key === 'Enter') handleAction();
    // Prevent page scroll on arrow keys during game
    if (['ArrowUp','ArrowDown',' '].includes(e.key)) e.preventDefault();
});
document.addEventListener('keyup', e => { keysHeld[e.key] = false; });

const btnUp    = document.getElementById('btn-up');
const btnDown  = document.getElementById('btn-down');
const btnEnter = document.getElementById('btn-enter');

if (btnUp) {
    btnUp.addEventListener('touchstart',  e => { e.preventDefault(); paddleMoving = -1; }, { passive: false });
    btnUp.addEventListener('touchend',    e => { e.preventDefault(); paddleMoving =  0; }, { passive: false });
    btnUp.addEventListener('mousedown',   () => paddleMoving = -1);
    btnUp.addEventListener('mouseup',     () => paddleMoving =  0);
}
if (btnDown) {
    btnDown.addEventListener('touchstart', e => { e.preventDefault(); paddleMoving = 1; }, { passive: false });
    btnDown.addEventListener('touchend',   e => { e.preventDefault(); paddleMoving = 0; }, { passive: false });
    btnDown.addEventListener('mousedown',  () => paddleMoving =  1);
    btnDown.addEventListener('mouseup',    () => paddleMoving =  0);
}
if (btnEnter) {
    btnEnter.addEventListener('touchstart', e => { e.preventDefault(); handleAction(); }, { passive: false });
    btnEnter.addEventListener('click', () => handleAction());
}

// ── BOOT ──────────────────────────────────────────────────────────────
init();
gameLoop();
