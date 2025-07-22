const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Player
const player = {
    x: canvas.width / 2,
    y: canvas.height - 50,
    width: 50,
    height: 50,
    color: 'white',
    speed: 5,
    dx: 0
};

// Bullets
const bullets = [];
const bulletSpeed = 7;

// Enemies
const enemies = [];
const enemyWidth = 50;
const enemyHeight = 50;
const enemySpeed = 2;
let enemySpawnInterval = 2000; // 2 seconds

// Game state
let score = 0;
let gameOver = false;

function drawPlayer() {
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
}

function drawBullets() {
    for (let i = 0; i < bullets.length; i++) {
        ctx.fillStyle = 'yellow';
        ctx.fillRect(bullets[i].x, bullets[i].y, 5, 10);
    }
}

function drawEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        ctx.fillStyle = 'red';
        ctx.fillRect(enemies[i].x, enemies[i].y, enemyWidth, enemyHeight);
    }
}

function movePlayer() {
    player.x += player.dx;

    // Wall detection
    if (player.x < 0) {
        player.x = 0;
    }

    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
}

function moveBullets() {
    for (let i = 0; i < bullets.length; i++) {
        bullets[i].y -= bulletSpeed;
        if (bullets[i].y < 0) {
            bullets.splice(i, 1);
            i--;
        }
    }
}

function moveEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        enemies[i].y += enemySpeed;
        if (enemies[i].y > canvas.height) {
            enemies.splice(i, 1);
            i--;
        }
    }
}

function spawnEnemy() {
    const x = Math.random() * (canvas.width - enemyWidth);
    const y = -enemyHeight;
    enemies.push({ x, y });
}

function detectCollisions() {
    // Bullets and enemies
    for (let i = 0; i < bullets.length; i++) {
        for (let j = 0; j < enemies.length; j++) {
            if (
                bullets[i].x < enemies[j].x + enemyWidth &&
                bullets[i].x + 5 > enemies[j].x &&
                bullets[i].y < enemies[j].y + enemyHeight &&
                bullets[i].y + 10 > enemies[j].y
            ) {
                bullets.splice(i, 1);
                i--;
                enemies.splice(j, 1);
                j--;
                score++;
            }
        }
    }

    // Player and enemies
    for (let i = 0; i < enemies.length; i++) {
        if (
            player.x < enemies[i].x + enemyWidth &&
            player.x + player.width > enemies[i].x &&
            player.y < enemies[i].y + enemyHeight &&
            player.y + player.height > enemies[i].y
        ) {
            gameOver = true;
        }
    }
}

function drawScore() {
    ctx.fillStyle = 'white';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 20);
}

function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function update() {
    if (gameOver) {
        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.fillText('Game Over', canvas.width / 2 - 100, canvas.height / 2);
        return;
    }

    clear();

    drawPlayer();
    drawBullets();
    drawEnemies();
    drawScore();

    movePlayer();
    moveBullets();
    moveEnemies();

    detectCollisions();

    requestAnimationFrame(update);
}

function keyDown(e) {
    if (e.key === 'ArrowRight' || e.key === 'Right') {
        player.dx = player.speed;
    } else if (e.key === 'ArrowLeft' || e.key === 'Left') {
        player.dx = -player.speed;
    } else if (e.key === ' ') {
        bullets.push({ x: player.x + player.width / 2 - 2.5, y: player.y });
    }
}

function keyUp(e) {
    if (
        e.key === 'ArrowRight' ||
        e.key === 'Right' ||
        e.key === 'ArrowLeft' ||
        e.key === 'Left'
    ) {
        player.dx = 0;
    }
}

document.addEventListener('keydown', keyDown);
document.addEventListener('keyup', keyUp);

setInterval(spawnEnemy, enemySpawnInterval);
update();