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
    let gamePaused = false; // New: Pause state
    let winner = null;
    let isPlayer1OnLeft = true; // Track which player is on the left
    let player1LogicalScore = 0; // New: Logical score for Player 1
    let player2LogicalScore = 0; // New: Logical score for Player 2

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
        if (gamePaused) { // If paused, don't update game logic
            requestAnimationFrame(update);
            return;
        }

        // Move player paddle (always the one on the left)
        playerLeft.y += playerLeft.dy;
        // Prevent player paddle from going off screen
        if (playerLeft.y < 0) playerLeft.y = 0;
        if (playerLeft.y + paddleHeight > canvas.height) playerLeft.y = canvas.height - paddleHeight;

        // AI for the right paddle (with slight inaccuracy)
        const targetY = ball.y - paddleHeight / 2; // Aim for the center of the paddle
        const aiCenter = playerRight.y + paddleHeight / 2;

        if (aiCenter < targetY - 10) { // If ball is significantly below AI center
            playerRight.y += aiSpeed;
        } else if (aiCenter > targetY + 10) { // If ball is significantly above AI center
            playerRight.y -= aiSpeed;
        }
        // Add a random chance for AI to make a slightly wrong move
        if (Math.random() < 0.05) { // 5% chance to add a random small offset
            playerRight.y += (Math.random() - 0.5) * 20; 
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
        if (ball.x - ballSize < 0) { // Ball went past left paddle
            if (isPlayer1OnLeft) { // Player 1 is on left, so Player 2 (AI) scored
                player2LogicalScore++;
            } else { // Player 2 is on left, so Player 1 (AI) scored
                player1LogicalScore++;
            }
            updateScoreDisplay();
            resetBall();
        } else if (ball.x + ballSize > canvas.width) { // Ball went past right paddle
            if (isPlayer1OnLeft) { // Player 1 is on left, so Player 1 scored
                player1LogicalScore++;
            } else { // Player 2 is on left, so Player 2 scored
                player2LogicalScore++;
            }
            updateScoreDisplay();
            resetBall();
        }

        // Check for game over
        if (player1LogicalScore >= maxScore) {
            gameOver = true;
            winner = 'Player 1';
        } else if (player2LogicalScore >= maxScore) {
            gameOver = true;
            winner = 'Player 2';
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
        ctx.fillText(`Player 1: ${player1LogicalScore} - Player 2: ${player2LogicalScore}`, canvas.width / 2, canvas.height / 2);
        ctx.fillText('Press Enter to Restart', canvas.width / 2, canvas.height / 2 + 40);
    }

    function keyDown(e) {
        if (e.key === 'Enter') {
            if (gameOver) {
                init(); // Restart game
            } else {
                gamePaused = !gamePaused; // Toggle pause
                if (!gamePaused) {
                    requestAnimationFrame(update); // Resume game loop
                } else {
                    // Display PAUSED message immediately
                    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);
                    ctx.fillStyle = 'white';
                    ctx.font = '40px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText('PAUSED', canvas.width / 2, canvas.height / 2);
                }
            }
            return; // Consume Enter key press
        }

        if (!gamePaused && !gameOver) { // Only allow controls if not paused and not game over
            // Player controls (always on the left)
            if (e.key === 'ArrowUp') {
                playerLeft.dy = -paddleSpeed;
            } else if (e.key === 'ArrowDown') {
                playerLeft.dy = paddleSpeed;
            }
        }
    }

    function keyUp(e) {
        // Player controls (always on the left)
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
            playerLeft.dy = 0;
        }
    }

    function updateScoreDisplay() {
        if (isPlayer1OnLeft) {
            player1ScoreElement.innerText = player1LogicalScore;
            player2ScoreElement.innerText = player2LogicalScore;
        } else {
            player1ScoreElement.innerText = player2LogicalScore;
            player2ScoreElement.innerText = player1LogicalScore;
        }
    }

    function init() {
        // Swap sides for the next game
        isPlayer1OnLeft = !isPlayer1OnLeft;

        // Reset logical scores
        player1LogicalScore = 0;
        player2LogicalScore = 0;

        // Reset physical paddle positions
        playerLeft.y = canvas.height / 2 - paddleHeight / 2;
        playerRight.y = canvas.height / 2 - paddleHeight / 2;

        updateScoreDisplay();

        gameOver = false;
        gamePaused = false; // Ensure game is not paused on init
        winner = null;
        resetBall();
        update();
    }

    init();
});