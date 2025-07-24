const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const PADDLE_WIDTH = 10;
const PADDLE_HEIGHT = 100;
const BALL_SIZE = 10;
const WINNING_SCORE = 15; // Changed to 15 hits as per requirement

let playerPaddleY = (canvas.height - PADDLE_HEIGHT) / 2;
let aiPaddleY = (canvas.height - PADDLE_HEIGHT) / 2;
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSpeedX = 5;
let ballSpeedY = 5;
let playerScore = 0;
let aiScore = 0;
let gamePaused = false;
let gameStarted = false;
let playerSide = 'left'; // 'left' or 'right'

function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

function drawCircle(x, y, radius, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2, true);
    ctx.fill();
}

function drawText(text, x, y, color = 'white') {
    ctx.fillStyle = color;
    ctx.font = '30px Arial';
    ctx.fillText(text, x, y);
}

function moveBall() {
    if (gamePaused || !gameStarted) return;

    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Ball collision with top/bottom walls
    if (ballY < 0 || ballY > canvas.height - BALL_SIZE) {
        ballSpeedY *= -1;
    }

    // Ball collision with paddles
    if (playerSide === 'left') {
        if (ballX < PADDLE_WIDTH && ballY > playerPaddleY && ballY < playerPaddleY + PADDLE_HEIGHT) {
            ballSpeedX *= -1;
            playerScore++;
            if (playerScore >= WINNING_SCORE) {
                endGame('Player');
            }
        }
    } else { // playerSide === 'right'
        if (ballX > canvas.width - PADDLE_WIDTH - BALL_SIZE && ballY > playerPaddleY && ballY < playerPaddleY + PADDLE_HEIGHT) {
            ballSpeedX *= -1;
            playerScore++;
            if (playerScore >= WINNING_SCORE) {
                endGame('Player');
            }
        }
    }

    if (playerSide === 'left') { // AI on right
        if (ballX > canvas.width - PADDLE_WIDTH - BALL_SIZE && ballY > aiPaddleY && ballY < aiPaddleY + PADDLE_HEIGHT) {
            ballSpeedX *= -1;
            aiScore++;
            if (aiScore >= WINNING_SCORE) {
                endGame('AI');
            }
        }
    } else { // AI on left
        if (ballX < PADDLE_WIDTH && ballY > aiPaddleY && ballY < aiPaddleY + PADDLE_HEIGHT) {
            ballSpeedX *= -1;
            aiScore++;
            if (aiScore >= WINNING_SCORE) {
                endGame('AI');
            }
        }
    }

    // Ball out of bounds (scoring)
    if (ballX < 0 || ballX > canvas.width - BALL_SIZE) {
        resetBall();
    }
}

function aiMove() {
    if (gamePaused || !gameStarted) return;

    const centerPaddle = aiPaddleY + PADDLE_HEIGHT / 2;
    if (centerPaddle < ballY - 35) {
        aiPaddleY += 4; // AI speed, adjust for difficulty
    } else if (centerPaddle > ballY + 35) {
        aiPaddleY -= 4; // AI speed, adjust for difficulty
    }

    // Keep AI paddle within bounds
    if (aiPaddleY < 0) aiPaddleY = 0;
    if (aiPaddleY > canvas.height - PADDLE_HEIGHT) aiPaddleY = canvas.height - PADDLE_HEIGHT;
}

function resetBall() {
    ballX = canvas.width / 2;
    ballY = canvas.height / 2;
    ballSpeedX *= -1; // Serve in opposite direction
}

function drawCourt() {
    // Middle line
    drawRect(canvas.width / 2 - 1, 0, 2, canvas.height, 'white');
    // Middle circle
    drawCircle(canvas.width / 2, canvas.height / 2, 30, 'rgba(255, 255, 255, 0.2)');
}

function draw() {
    // Clear canvas
    drawRect(0, 0, canvas.width, canvas.height, 'black');

    drawCourt();

    // Draw paddles
    if (playerSide === 'left') {
        drawRect(0, playerPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT, 'white'); // Player
        drawRect(canvas.width - PADDLE_WIDTH, aiPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT, 'white'); // AI
    } else {
        drawRect(canvas.width - PADDLE_WIDTH, playerPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT, 'white'); // Player
        drawRect(0, aiPaddleY, PADDLE_WIDTH, PADDLE_HEIGHT, 'white'); // AI
    }

    // Draw ball
    drawCircle(ballX, ballY, BALL_SIZE, 'white');

    // Update score display
    document.getElementById('score').innerText = `Player: ${playerScore} | AI: ${aiScore}`;

    if (!gameStarted) {
        drawText('Press Enter to Start', canvas.width / 2 - 150, canvas.height / 2);
    } else if (gamePaused) {
        drawText('Paused - Press Enter to Resume', canvas.width / 2 - 250, canvas.height / 2);
    }
}

function endGame(winner) {
    gamePaused = true;
    gameStarted = false;
    drawText(`${winner} Wins! Press Enter to Retry`, canvas.width / 2 - 250, canvas.height / 2);
    // Swap sides for next game
    playerSide = playerSide === 'left' ? 'right' : 'left';
    playerScore = 0;
    aiScore = 0;
}

function gameLoop() {
    moveBall();
    aiMove();
    draw();
    requestAnimationFrame(gameLoop);
}

// Keyboard controls
document.addEventListener('keydown', function(e) {
    if (e.key === 'ArrowUp') {
        playerPaddleY -= 10;
    } else if (e.key === 'ArrowDown') {
        playerPaddleY += 10;
    } else if (e.key === 'Enter') {
        if (!gameStarted) {
            gameStarted = true;
            gamePaused = false;
            resetBall(); // Initial ball reset
        } else {
            gamePaused = !gamePaused;
        }
    }

    // Keep player paddle within bounds
    if (playerPaddleY < 0) playerPaddleY = 0;
    if (playerPaddleY > canvas.height - PADDLE_HEIGHT) playerPaddleY = canvas.height - PADDLE_HEIGHT;
});

// Initial call to start the game loop
gameLoop();
