document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    const player1ScoreElement = document.getElementById('player1Score');
    const player2ScoreElement = document.getElementById('player2Score');

    // Game variables
    const paddleWidth = 10;
    const paddleHeight = 100;
    const ballSize = 10;
    const paddleSpeed = 5;
    const initialBallSpeed = 3; // Slower ball speed
    const maxScore = 15; // Score to win
    const aiSpeed = 3.5; // AI paddle speed

    let playerLeft = {
        x: 0,
        y: canvas.height / 2 - paddleHeight / 2,
        score: 0,
        dy: 0
    };

    let playerRight = {
        x: canvas.width - paddleWidth,
        y: canvas.height / 2 - paddleHeight / 2,
        score: 0,
        dy: 0
    };

    let ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        dx: initialBallSpeed, // Ball speed in x direction
        dy: initialBallSpeed  // Ball speed in y direction
    };

    let gameOver = false;
    let winner = null;
    let isPlayer1OnLeft = true; // Track which player is on the left

    function drawRect(x, y, width, height, color) {
        ctx.fillStyle = color;
        ctx.fillRect(x, y, width, height);
    }

    function drawCircle(x, y, radius, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2, false);
        ctx.fill();
    }

    function drawCourt() {
        // Middle line
        drawRect(canvas.width / 2 - 1, 0, 2, canvas.height, 'gray');
        // Middle circle
        drawCircle(canvas.width / 2, canvas.height / 2, 50, 'rgba(128, 128, 128, 0.3)');
    }

    function draw() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawCourt();

        // Draw paddles
        drawRect(playerLeft.x, playerLeft.y, paddleWidth, paddleHeight, 'white');
        drawRect(playerRight.x, playerRight.y, paddleWidth, paddleHeight, 'white');

        // Draw ball
        drawCircle(ball.x, ball.y, ballSize, 'yellow');
    }

    function update() {
        if (gameOver) {
            showGameOver();
            return;
        }

        // Move player paddle (always the one on the left)
        playerLeft.y += playerLeft.dy;
        // Prevent player paddle from going off screen
        if (playerLeft.y < 0) playerLeft.y = 0;
        if (playerLeft.y + paddleHeight > canvas.height) playerLeft.y = canvas.height - paddleHeight;

        // AI for the right paddle
        if (ball.dy < 0) { // Ball moving up
            if (playerRight.y + paddleHeight / 2 > ball.y) {
                playerRight.y -= aiSpeed;
            }
        } else { // Ball moving down
            if (playerRight.y + paddleHeight / 2 < ball.y) {
                playerRight.y += aiSpeed;
            }
        }
        // Prevent AI paddle from going off screen
        if (playerRight.y < 0) playerRight.y = 0;
        if (playerRight.y + paddleHeight > canvas.height) playerRight.y = canvas.height - paddleHeight;

        // Move ball
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Ball collision with top/bottom walls
        if (ball.y + ballSize > canvas.height || ball.y - ballSize < 0) {
            ball.dy *= -1;
        }

        // Ball collision with paddles
        // Left paddle
        if (
            ball.x - ballSize < playerLeft.x + paddleWidth &&
            ball.y + ballSize > playerLeft.y &&
            ball.y - ballSize < playerLeft.y + paddleHeight
        ) {
            ball.dx *= -1;
        }

        // Right paddle
        if (
            ball.x + ballSize > playerRight.x &&
            ball.y + ballSize > playerRight.y &&
            ball.y - ballSize < playerRight.y + paddleHeight
        ) {
            ball.dx *= -1;
        }

        // Ball out of bounds (scoring)
        if (ball.x - ballSize < 0) {
            playerRight.score++;
            player2ScoreElement.innerText = playerRight.score;
            resetBall();
        } else if (ball.x + ballSize > canvas.width) {
            playerLeft.score++;
            player1ScoreElement.innerText = playerLeft.score;
            resetBall();
        }

        // Check for game over
        if (playerLeft.score >= maxScore) {
            gameOver = true;
            winner = isPlayer1OnLeft ? 'Player 1' : 'Player 2';
        } else if (playerRight.score >= maxScore) {
            gameOver = true;
            winner = isPlayer1OnLeft ? 'Player 2' : 'Player 1';
        }

        draw();
        requestAnimationFrame(update);
    }

    function resetBall() {
        ball.x = canvas.width / 2;
        ball.y = canvas.height / 2;
        ball.dx = initialBallSpeed * (Math.random() > 0.5 ? 1 : -1); // Random initial direction
        ball.dy = initialBallSpeed * (Math.random() > 0.5 ? 1 : -1);
    }

    function showGameOver() {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = '40px Arial';
        ctx.textAlign = 'center';
        if (winner) {
            ctx.fillText(`${winner} Wins!`, canvas.width / 2, canvas.height / 2 - 40);
        } else {
            ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 40);
        }
        ctx.font = '20px Arial';
        ctx.fillText(`Player 1: ${player1ScoreElement.innerText} - Player 2: ${player2ScoreElement.innerText}`, canvas.width / 2, canvas.height / 2);
        ctx.fillText('Press Enter to Restart', canvas.width / 2, canvas.height / 2 + 40);
    }

    function keyDown(e) {
        if (gameOver && e.key === 'Enter') {
            init();
            return;
        }
        // Player 1 controls (always on the left)
        if (e.key === 'ArrowUp') {
            playerLeft.dy = -paddleSpeed;
        } else if (e.key === 'ArrowDown') {
            playerLeft.dy = paddleSpeed;
        }
    }

    function keyUp(e) {
        // Player 1 controls (always on the left)
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            playerLeft.dy = 0;
        }
    }

    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);

    function init() {
        // Swap sides for the next game
        isPlayer1OnLeft = !isPlayer1OnLeft;

        // Reset scores
        playerLeft.score = 0;
        playerRight.score = 0;

        // Assign player and AI to correct paddles based on isPlayer1OnLeft
        if (isPlayer1OnLeft) {
            player1ScoreElement.innerText = playerLeft.score;
            player2ScoreElement.innerText = playerRight.score;
        } else {
            // If Player 1 is on the right, swap the score elements for display
            player1ScoreElement.innerText = playerRight.score;
            player2ScoreElement.innerText = playerLeft.score;
        }

        gameOver = false;
        winner = null;
        resetBall();
        update();
    }

    init();
});