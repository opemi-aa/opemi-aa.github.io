document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const scoreElement = document.getElementById('score');

    const gridSize = 20;
    let snake, food, score, direction, gameOver, animationFrameId;
    let lastRenderTime = 0;
    const gameSpeed = 100; // Milliseconds per frame (lower is faster)

    function init() {
        snake = [{ x: 10, y: 10 }];
        food = {};
        score = 0;
        direction = 'right';
        gameOver = false;
        scoreElement.innerText = score;
        placeFood();
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        animationFrameId = requestAnimationFrame(gameLoop);
    }

    function placeFood() {
        food.x = Math.floor(Math.random() * (canvas.width / gridSize));
        food.y = Math.floor(Math.random() * (canvas.height / gridSize));
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw snake
        snake.forEach(segment => {
            ctx.fillStyle = 'lime';
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize, gridSize);
        });

        // Draw food
        ctx.fillStyle = 'red';
        ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    }

    function updateGameLogic() {
        const head = { x: snake[0].x, y: snake[0].y };

        switch (direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // Check for collision with walls
        if (head.x < 0 || head.x * gridSize >= canvas.width || head.y < 0 || head.y * gridSize >= canvas.height) {
            gameOver = true;
            return;
        }

        // Check for collision with self
        for (let i = 1; i < snake.length; i++) {
            if (head.x === snake[i].x && head.y === snake[i].y) {
                gameOver = true;
                return;
            }
        }

        snake.unshift(head);

        // Check for food
        if (head.x === food.x && head.y === food.y) {
            score++;
            scoreElement.innerText = score;
            placeFood();
        } else {
            snake.pop();
        }
    }

    function gameLoop(currentTime) {
        if (gameOver) {
            showGameOver();
            return;
        }

        animationFrameId = requestAnimationFrame(gameLoop);

        const secondsSinceLastRender = (currentTime - lastRenderTime);

        if (secondsSinceLastRender < gameSpeed) return;

        lastRenderTime = currentTime;

        updateGameLogic();
        draw();
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

    function keyDown(e) {
        if (gameOver && e.key === 'Enter') {
            init();
            return;
        }

        switch (e.key) {
            case 'ArrowUp': if (direction !== 'down') direction = 'up'; break;
            case 'ArrowDown': if (direction !== 'up') direction = 'down'; break;
            case 'ArrowLeft': if (direction !== 'right') direction = 'left'; break;
            case 'ArrowRight': if (direction !== 'left') direction = 'right'; break;
        }
    }

    document.addEventListener('keydown', keyDown);

    init();
});