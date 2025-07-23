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

    let player1 = {
        x: 0,
        y: canvas.height / 2 - paddleHeight / 2,
        score: 0,
        dy: 0
    };

    let player2 = {
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
        drawRect(player1.x, player1.y, paddleWidth, paddleHeight, 'white');
        drawRect(player2.x, player2.y, paddleWidth, paddleHeight, 'white');

        // Draw ball
        drawCircle(ball.x, ball.y, ballSize, 'yellow');
    }

    function update() {
        if (gameOver) {
            showGameOver();
            return;
        }

        // Move player 1 paddle
        player1.y += player1.dy;
        // Prevent player 1 paddle from going off screen
        if (player1.y < 0) player1.y = 0;
        if (player1.y + paddleHeight > canvas.height) player1.y = canvas.height - paddleHeight;

        // AI for player 2 paddle
        if (ball.dy < 0) { // Ball moving up
            if (player2.y + paddleHeight / 2 > ball.y) {
                player2.y -= aiSpeed;
            }
        } else { // Ball moving down
            if (player2.y + paddleHeight / 2 < ball.y) {
                player2.y += aiSpeed;
            }
        }
        // Prevent player 2 paddle from going off screen
        if (player2.y < 0) player2.y = 0;
        if (player2.y + paddleHeight > canvas.height) player2.y = canvas.height - paddleHeight;

        // Move ball
        ball.x += ball.dx;
        ball.y += ball.dy;

        // Ball collision with top/bottom walls
        if (ball.y + ballSize > canvas.height || ball.y - ballSize < 0) {
            ball.dy *= -1;
        }

        // Ball collision with paddles
        // Player 1 paddle
        if (
            ball.x - ballSize < player1.x + paddleWidth &&
            ball.y + ballSize > player1.y &&
            ball.y - ballSize < player1.y + paddleHeight
        ) {
            ball.dx *= -1;
        }

        // Player 2 paddle
        if (
            ball.x + ballSize > player2.x &&
            ball.y + ballSize > player2.y &&
            ball.y - ballSize < player2.y + paddleHeight
        ) {
            ball.dx *= -1;
        }

        // Ball out of bounds (scoring)
        if (ball.x - ballSize < 0) {
            player2.score++;
            player2ScoreElement.innerText = player2.score;
            resetBall();
        } else if (ball.x + ballSize > canvas.width) {
            player1.score++;
            player1ScoreElement.innerText = player1.score;
            resetBall();
        }

        // Check for game over
        if (player1.score >= maxScore) {
            gameOver = true;
            winner = 'Player 1';
        } else if (player2.score >= maxScore) {
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
        ctx.fillText(`Player 1: ${player1.score} - Player 2: ${player2.score}`, canvas.width / 2, canvas.height / 2);
        ctx.fillText('Press Enter to Restart', canvas.width / 2, canvas.height / 2 + 40);
    }

    function keyDown(e) {
        if (gameOver && e.key === 'Enter') {
            init();
            return;
        }
        switch (e.key) {
            case 'ArrowUp': player2.dy = -paddleSpeed; break;
            case 'ArrowDown': player2.dy = paddleSpeed; break;
            case 'w': player1.dy = -paddleSpeed; break;
            case 's': player1.dy = paddleSpeed; break;
        }
    }

    function keyUp(e) {
        switch (e.key) {
            case 'ArrowUp':
            case 'ArrowDown': player2.dy = 0; break;
            case 'w':
            case 's': player1.dy = 0; break;
        }
    }

    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);

    function init() {
        player1.score = 0;
        player2.score = 0;
        player1ScoreElement.innerText = player1.score;
        player2ScoreElement.innerText = player2.score;
        gameOver = false;
        winner = null;
        resetBall();
        update();
    }

    init();
});