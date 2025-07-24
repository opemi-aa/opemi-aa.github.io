const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CAR_WIDTH = 30;
const CAR_HEIGHT = 50;
const LANE_WIDTH = canvas.width / 3;
const PLAYER_SPEED = 5;
const AI_SPEED_MIN = 2;
const AI_SPEED_MAX = 4;
const SCORE_INCREMENT_INTERVAL = 100; // ms

let playerCar = {
    x: canvas.width / 2 - CAR_WIDTH / 2,
    y: canvas.height - CAR_HEIGHT - 10,
    width: CAR_WIDTH,
    height: CAR_HEIGHT,
    color: 'white'
};

let aiCars = [];
let gamePaused = false;
let gameOver = false;
let score = 0;
let lastScoreIncrementTime = 0;

// Function to draw a rectangle (for cars and track lines)
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

// Function to draw the track lines
function drawTrack() {
    // Left lane line
    drawRect(LANE_WIDTH, 0, 5, canvas.height, 'gray');
    // Right lane line
    drawRect(LANE_WIDTH * 2 - 5, 0, 5, canvas.height, 'gray');

    // Middle dashed lines
    const dashLength = 20;
    const dashSpace = 20;
    for (let i = 0; i < canvas.height; i += dashLength + dashSpace) {
        drawRect(canvas.width / 2 - 2.5, i, 5, dashLength, 'white');
    }
}

// Function to draw cars
function drawCars() {
    drawRect(playerCar.x, playerCar.y, playerCar.width, playerCar.height, playerCar.color);
    aiCars.forEach(car => {
        drawRect(car.x, car.y, car.width, car.height, car.color);
    });
}

// Function to spawn AI cars
function spawnAICar() {
    const lane = Math.floor(Math.random() * 3); // 0, 1, or 2
    const x = lane * LANE_WIDTH + (LANE_WIDTH / 2) - (CAR_WIDTH / 2);
    const y = -CAR_HEIGHT - (Math.random() * canvas.height / 2); // Spawn off-screen top
    aiCars.push({
        x: x,
        y: y,
        width: CAR_WIDTH,
        height: CAR_HEIGHT,
        color: 'red',
        speed: AI_SPEED_MIN + Math.random() * (AI_SPEED_MAX - AI_SPEED_MIN)
    });
}

// Function to update game state
function update() {
    if (gamePaused || gameOver) return;

    // Move AI cars
    aiCars.forEach((car, index) => {
        car.y += car.speed;

        // Remove cars that go off screen
        if (car.y > canvas.height) {
            aiCars.splice(index, 1);
            // Optionally spawn a new car immediately to keep density
            spawnAICar();
        }

        // Collision detection with player car
        if (playerCar.x < car.x + car.width &&
            playerCar.x + playerCar.width > car.x &&
            playerCar.y < car.y + car.height &&
            playerCar.y + playerCar.height > car.y) {
            gameOver = true;
            displayGameOver();
        }
    });

    // Score increment based on time survived
    const currentTime = Date.now();
    if (currentTime - lastScoreIncrementTime > SCORE_INCREMENT_INTERVAL) {
        score++;
        document.getElementById('score').innerText = `Score: ${score}`;
        lastScoreIncrementTime = currentTime;
    }
}

// Function to draw everything
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas

    drawTrack();
    drawCars();

    if (gamePaused) {
        drawText('PAUSED', canvas.width / 2, canvas.height / 2, 'white');
    } else if (gameOver) {
        // Game over text is handled by displayGameOver
    }
}

// Helper to draw text
function drawText(text, x, y, color, fontSize = '30px') {
    ctx.fillStyle = color;
    ctx.font = `${fontSize} Arial`;
    ctx.textAlign = 'center';
    ctx.fillText(text, x, y);
}

// Display Game Over screen
function displayGameOver() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawText('GAME OVER', canvas.width / 2, canvas.height / 2 - 50, 'red', '40px');
    drawText(`Final Score: ${score}`, canvas.width / 2, canvas.height / 2, 'white', '30px');
    drawText('Press Enter to Restart', canvas.width / 2, canvas.height / 2 + 50, 'white', '25px');
}

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Keyboard controls
document.addEventListener('keydown', function(e) {
    if (gameOver) {
        if (e.key === 'Enter') {
            resetGame();
        }
        return;
    }

    if (e.key === 'Enter') {
        gamePaused = !gamePaused;
    } else if (!gamePaused) {
        if (e.key === 'ArrowLeft') {
            playerCar.x -= PLAYER_SPEED * 5; // Move faster between lanes
        } else if (e.key === 'ArrowRight') {
            playerCar.x += PLAYER_SPEED * 5;
        }
    }

    // Keep player car within bounds
    if (playerCar.x < 0) playerCar.x = 0;
    if (playerCar.x + playerCar.width > canvas.width) playerCar.x = canvas.width - playerCar.width;
});

// Reset game state
function resetGame() {
    playerCar.x = canvas.width / 2 - CAR_WIDTH / 2;
    playerCar.y = canvas.height - CAR_HEIGHT - 10;
    aiCars = [];
    score = 0;
    gameOver = false;
    gamePaused = false;
    lastScoreIncrementTime = Date.now();
    document.getElementById('score').innerText = `Score: ${score}`;
    spawnAICar(); // Spawn initial AI car
}

// Initial setup
resetGame();

// Start the game loop
gameLoop();