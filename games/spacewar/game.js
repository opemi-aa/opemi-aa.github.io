document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');

    let player, bullets, enemies, score, gameOver, enemyIntervalId;

    const playerWidth = 50, playerHeight = 50, playerSpeed = 5;
    const bulletSpeed = 7;
    const enemyWidth = 50, enemyHeight = 50, enemySpeed = 2;
    const enemySpawnInterval = 2000;

    function init() {
        player = {
            x: canvas.width / 2 - playerWidth / 2,
            y: canvas.height - playerHeight - 20,
            width: playerWidth,
            height: playerHeight,
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
        ctx.fillStyle = player.color;
        ctx.fillRect(player.x, player.y, player.width, player.height);
    }

    function drawBullets() {
        bullets.forEach(bullet => {
            ctx.fillStyle = 'yellow';
            ctx.fillRect(bullet.x, bullet.y, 5, 10);
        });
    }

    function drawEnemies() {
        enemies.forEach(enemy => {
            ctx.fillStyle = 'red';
            ctx.fillRect(enemy.x, enemy.y, enemyWidth, enemyHeight);
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
        const x = Math.random() * (canvas.width - enemyWidth);
        enemies.push({ x, y: -enemyHeight });
    }

    function detectCollisions() {
        // Bullets and enemies
        for (let i = bullets.length - 1; i >= 0; i--) {
            for (let j = enemies.length - 1; j >= 0; j--) {
                if (bullets[i] && enemies[j] &&
                    bullets[i].x < enemies[j].x + enemyWidth &&
                    bullets[i].x + 5 > enemies[j].x &&
                    bullets[i].y < enemies[j].y + enemyHeight &&
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
                player.x < enemies[i].x + enemyWidth &&
                player.x + player.width > enemies[i].x &&
                player.y < enemies[i].y + enemyHeight &&
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