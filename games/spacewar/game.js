document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');

    // Define the size of a single pixel unit for your pixel art
    const PIXEL_UNIT = 12; // Increased size for larger characters

    let player, bullets, enemies, score, gameOver, enemyIntervalId;

    const playerSpeed = 5;
    const bulletSpeed = 7;
    const enemySpeed = 2;
    const enemySpawnInterval = 2000;

    /**
     * Draws the pixel-art character as a 3x4 spaceship.
     * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the canvas.
     * @param {number} x - The x-coordinate for the top-left corner of the character's 3x4 conceptual grid.
     * @param {number} y - The y-coordinate for the top-left corner of the character's 3x4 conceptual grid.
     * @param {string} color - The color of the character.
     */
    function drawPixelCharacter(ctx, x, y, color) {
        ctx.fillStyle = color;

        // Row 1: [empty] [filled] [empty]
        ctx.fillRect(x + PIXEL_UNIT, y, PIXEL_UNIT, PIXEL_UNIT);

        // Row 2: [filled] [filled] [filled]
        ctx.fillRect(x, y + PIXEL_UNIT, PIXEL_UNIT, PIXEL_UNIT);
        ctx.fillRect(x + PIXEL_UNIT, y + PIXEL_UNIT, PIXEL_UNIT, PIXEL_UNIT);
        ctx.fillRect(x + 2 * PIXEL_UNIT, y + PIXEL_UNIT, PIXEL_UNIT, PIXEL_UNIT);

        // Row 3: [empty] [filled] [empty]
        ctx.fillRect(x + PIXEL_UNIT, y + 2 * PIXEL_UNIT, PIXEL_UNIT, PIXEL_UNIT);

        // Row 4: [filled] [empty] [filled]
        ctx.fillRect(x, y + 3 * PIXEL_UNIT, PIXEL_UNIT, PIXEL_UNIT);
        ctx.fillRect(x + 2 * PIXEL_UNIT, y + 3 * PIXEL_UNIT, PIXEL_UNIT, PIXEL_UNIT);
    }

    function init() {
        const characterPixelWidth = 3 * PIXEL_UNIT;
        const characterPixelHeight = 4 * PIXEL_UNIT;
        player = {
            x: canvas.width / 2 - characterPixelWidth / 2,
            y: canvas.height - characterPixelHeight - 20,
            width: characterPixelWidth,
            height: characterPixelHeight,
            color: 'white',
            speed: playerSpeed,
            dx: 0
        };
        bullets = [];
        enemies = [];
        score = 0;
        gameOver = false;
        scoreElement.innerText = score;
        if (enemyIntervalId) clearInterval(enemyIntervalId);
        enemyIntervalId = setInterval(spawnEnemy, enemySpawnInterval);
        update();
    }

    function drawPlayer() {
        drawPixelCharacter(ctx, player.x, player.y, player.color);
    }

    function drawBullets() {
        bullets.forEach(bullet => {
            ctx.fillStyle = 'yellow';
            ctx.fillRect(bullet.x, bullet.y, 5, 10);
        });
    }

    function drawEnemies() {
        enemies.forEach(enemy => {
            drawPixelCharacter(ctx, enemy.x, enemy.y, enemy.color);
        });
    }

    function movePlayer() {
        player.x += player.dx;
        if (player.x < 0) player.x = 0;
        if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    }

    function moveBullets() {
        bullets.forEach((bullet, index) => {
            bullet.y -= bulletSpeed;
            if (bullet.y < 0) bullets.splice(index, 1);
        });
    }

    function moveEnemies() {
        enemies.forEach((enemy, index) => {
            enemy.y += enemySpeed;
            if (enemy.y > canvas.height) enemies.splice(index, 1);
        });
    }

    function spawnEnemy() {
        const enemyPixelWidth = 3 * PIXEL_UNIT;
        const enemyPixelHeight = 4 * PIXEL_UNIT;
        const x = Math.random() * (canvas.width - enemyPixelWidth);
        enemies.push({ x, y: -enemyPixelHeight, width: enemyPixelWidth, height: enemyPixelHeight, color: 'red' });
    }

    function detectCollisions() {
        // Bullets and enemies
        for (let i = bullets.length - 1; i >= 0; i--) {
            for (let j = enemies.length - 1; j >= 0; j--) {
                if (bullets[i] && enemies[j] &&
                    bullets[i].x < enemies[j].x + enemies[j].width &&
                    bullets[i].x + 5 > enemies[j].x &&
                    bullets[i].y < enemies[j].y + enemies[j].height &&
                    bullets[i].y + 10 > enemies[j].y
                ) {
                    bullets.splice(i, 1);
                    enemies.splice(j, 1);
                    score++;
                    scoreElement.innerText = score;
                    break; 
                }
            }
        }

        // Player and enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            if (
                player.x < enemies[i].x + enemies[i].width &&
                player.x + player.width > enemies[i].x &&
                player.y < enemies[i].y + enemies[i].height &&
                player.y + player.height > enemies[i].y
            ) {
                gameOver = true;
                clearInterval(enemyIntervalId);
                return;
            }
        }
    }

    function showGameOver() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 40);
        ctx.font = '20px Arial';
        ctx.fillText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2);
        ctx.fillText('Press Enter to Restart', canvas.width / 2, canvas.height / 2 + 40);
    }

    function update() {
        if (gameOver) {
            showGameOver();
            return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawPlayer();
        drawBullets();
        drawEnemies();
        movePlayer();
        moveBullets();
        moveEnemies();
        detectCollisions();

        requestAnimationFrame(update);
    }

    function keyDown(e) {
        if (gameOver && e.key === 'Enter') {
            init();
            return;
        }
        if (e.key === 'ArrowRight' || e.key === 'd') player.dx = player.speed;
        else if (e.key === 'ArrowLeft' || e.key === 'a') player.dx = -player.speed;
        else if (e.key === ' ') {
            bullets.push({ x: player.x + player.width / 2 - 2.5, y: player.y });
        }
    }

    function keyUp(e) {
        if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'ArrowLeft' || e.key === 'a') {
            player.dx = 0;
        }
    }

    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);

    init();
});