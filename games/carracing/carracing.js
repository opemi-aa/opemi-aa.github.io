const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const PIXEL_SIZE = 10; // Increased size of each pixel in the car pattern for visibility
const CAR_PATTERN = [
    [1, 0, 1], // x 0 x
    [0, 0, 0], // 0 0 0
    [1, 0, 1], // x 0 x
    [0, 0, 0]  // 0 0 0
];

const CAR_WIDTH = PIXEL_SIZE * CAR_PATTERN[0].length; // 3 * PIXEL_SIZE
const CAR_HEIGHT = PIXEL_SIZE * CAR_PATTERN.length; // 4 * PIXEL_SIZE
const LANE_WIDTH = canvas.width / 3;
const PLAYER_SPEED = 5; // Speed of player car movement (left/right)
const AI_SPEED_MIN = 2;
const AI_SPEED_MAX = 4;
const TRACK_SPEED = 5; // Speed at which the track moves downwards
const SCORE_INCREMENT_INTERVAL = 100; // ms

let playerCar = {
    x: LANE_WIDTH + (LANE_WIDTH / 2) - (CAR_WIDTH / 2), // Start in center of middle lane
    y: canvas.height - CAR_HEIGHT - 20, // Fixed position at bottom
    color: 'white'
};

let aiCars = [];
let gamePaused = false;
let gameOver = false;
let score = 0;
let lastScoreIncrementTime = 0;
let trackLineOffset = 0; // For animating dashed lines

// Function to draw a single pixel (square)
function drawPixel(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, PIXEL_SIZE, PIXEL_SIZE);
}

// Function to draw a car using the pattern
function drawCarPattern(carX, carY, color) {
    for (let row = 0; row < CAR_PATTERN.length; row++) {
        for (let col = 0; col < CAR_PATTERN[row].length; col++) {
            if (CAR_PATTERN[row][col] === 1) {
                drawPixel(carX + col * PIXEL_SIZE, carY + row * PIXEL_SIZE, color);
            }
        }
    }
}

// Function to draw a rectangle (for track lines)
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

// Function to draw the track lines
function drawTrack() {
    // Left and Right solid lane lines
    drawRect(LANE_WIDTH, 0, 5, canvas.height, 'gray'); // Left lane divider
    drawRect(LANE_WIDTH * 2, 0, 5, canvas.height, 'gray'); // Right lane divider

    // Middle dashed lines (animated)
    const dashLength = 30;
    const dashSpace = 20;
    const totalDashSegment = dashLength + dashSpace;

    // Update offset for animation
    trackLineOffset = (trackLineOffset + TRACK_SPEED) % totalDashSegment;

    for (let i = -totalDashSegment + trackLineOffset; i < canvas.height; i += totalDashSegment) {
        drawRect(canvas.width / 2 - 2.5, i, 5, dashLength, 'white');
    }
}

// Function to draw cars
function drawCars() {
    drawCarPattern(playerCar.x, playerCar.y, playerCar.color);
    aiCars.forEach(car => {
        drawCarPattern(car.x, car.y, car.color);
    });
}

// Function to spawn AI cars
function spawnAICar() {
    const lane = Math.floor(Math.random() * 3); // 0, 1, or 2
    const x = lane * LANE_WIDTH + (LANE_WIDTH / 2) - (CAR_WIDTH / 2);
    // Spawn off-screen top, relative to track movement
    const y = -CAR_HEIGHT - (Math.random() * canvas.height * 0.5); 
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

    // Move AI cars (relative to track moving down)
    aiCars.forEach((car, index) => {
        car.y += car.speed; // AI cars move down the screen

        // Remove cars that go off screen and respawn
        if (car.y > canvas.height) {
            aiCars.splice(index, 1);
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
    ctx.font = `${fontSize} 'Press Start 2P'`; // Use retro font
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
            // Calculate target X based on current lane and move towards it
            let currentLane = Math.round(playerCar.x / LANE_WIDTH);
            currentLane = Math.max(0, Math.min(2, currentLane)); // Ensure within 0-2

            if (currentLane > 0) {
                playerCar.x = (currentLane - 1) * LANE_WIDTH + (LANE_WIDTH / 2) - (CAR_WIDTH / 2);
            }
        } else if (e.key === 'ArrowRight') {
            // Calculate target X based on current lane and move towards it
            let currentLane = Math.round(playerCar.x / LANE_WIDTH);
            currentLane = Math.max(0, Math.min(2, currentLane)); // Ensure within 0-2

            if (currentLane < 2) {
                playerCar.x = (currentLane + 1) * LANE_WIDTH + (LANE_WIDTH / 2) - (CAR_WIDTH / 2);
            }
        }
    }

    // Keep player car within overall canvas bounds (within the 3 lanes)
    // Adjust playerCar.x to snap to lane center after movement
    const playerLane = Math.round(playerCar.x / LANE_WIDTH);
    playerCar.x = playerLane * LANE_WIDTH + (LANE_WIDTH / 2) - (CAR_WIDTH / 2);

    // Ensure player car stays within canvas boundaries
    if (playerCar.x < 0) playerCar.x = 0;
    if (playerCar.x + CAR_WIDTH > canvas.width) playerCar.x = canvas.width - CAR_WIDTH;
});

// Reset game state
function resetGame() {
    playerCar.x = LANE_WIDTH + (LANE_WIDTH / 2) - (CAR_WIDTH / 2); // Reset to middle lane
    aiCars = [];
    score = 0;
    gameOver = false;
    gamePaused = false;
    lastScoreIncrementTime = Date.now();
    document.getElementById('score').innerText = `Score: ${score}`;
    spawnAICar(); // Spawn initial AI car
    spawnAICar(); // Spawn a second AI car for more challenge
}

// Initial setup
resetGame();

// Start the game loop
gameLoop();