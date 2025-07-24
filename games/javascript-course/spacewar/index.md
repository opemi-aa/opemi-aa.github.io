---
layout: default
title: Simple Space War Game Course
---

<div class="course-frame">

# Simple Space War Game Course: A Beginner's Guide

Welcome to the second module of our "Simple JavaScript Games Course"! In this section, we'll build a basic Space War game. Similar to the Snake game, our goal is to understand core JavaScript game development concepts using simple shapes and logic.

This game will feature a player spaceship, enemy spaceships, and projectiles, all represented by simple squares. We'll focus on movement, shooting, collision detection, and a basic game loop.

## What You'll Learn:

*   Creating and moving player and enemy entities.
*   Implementing projectile (bullet) mechanics.
*   Detecting collisions between different game objects.
*   Managing multiple game objects (enemies, bullets).

Let's get started!

---

## 1. Setting up Your Project

Create a new folder for your Space War game. Inside this folder, you'll need three files:

*   `index.html`: The main structure of our game.
*   `style.css`: For basic styling.
*   `script.js`: Where our JavaScript game logic will live.

### `index.html`

Open `index.html` and add the following basic HTML structure. This is very similar to our Snake game setup, providing a canvas for drawing.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Space War</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Simple Space War</h1>
    <canvas id="gameCanvas" width="600" height="400"></canvas>
    <p>Score: <span id="score">0</span></p>
    <script src="script.js"></script>
</body>
</html>
```

**Explanation:**
The structure is almost identical to the Snake game. We have a `canvas` element where all our game graphics will be drawn, and a `span` to display the score.

---

## 2. Basic Styling (`style.css`)

Add some minimal styling to `style.css` to make our canvas visible and center the content.

```css
body {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-family: Arial, sans-serif;
    background-color: #f0f0f0;
    margin: 0;
    padding: 20px;
}

canvas {
    border: 2px solid black;
    background-color: #333; /* Dark background for space */
}

h1 {
    color: #333;
}

p {
    font-size: 1.2em;
}
```

**Explanation:**
We've changed the `canvas` background to a dark gray (`#333`) to simulate space.

---

## 3. Game Logic (`script.js`) - Initial Setup

Now, let's set up our JavaScript file. We'll define our game entities (player, enemies, bullets) as simple objects with properties like position, size, and speed.

```javascript
// Get the canvas element and its 2D rendering context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game constants
const PLAYER_SIZE = 30;
const ENEMY_SIZE = 25;
const BULLET_SIZE = 10;
const PLAYER_SPEED = 5;
const ENEMY_SPEED = 2;
const BULLET_SPEED = 7;

// Game variables
let score = 0;
let player = {
    x: canvas.width / 2 - PLAYER_SIZE / 2,
    y: canvas.height - PLAYER_SIZE - 10,
    width: PLAYER_SIZE,
    height: PLAYER_SIZE,
    color: 'blue'
};
let enemies = [];
let bullets = [];
let gameOver = false;

// Function to draw a rectangle (our basic game object)
function drawRect(x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, width, height);
}

// Function to draw the player
function drawPlayer() {
    drawRect(player.x, player.y, player.width, player.height, player.color);
}

// Function to draw enemies
function drawEnemies() {
    enemies.forEach(enemy => {
        drawRect(enemy.x, enemy.y, enemy.width, enemy.height, enemy.color);
    });
}

// Function to draw bullets
function drawBullets() {
    bullets.forEach(bullet => {
        drawRect(bullet.x, bullet.y, bullet.width, bullet.height, bullet.color);
    });
}

// Function to generate a new enemy
function spawnEnemy() {
    const x = Math.random() * (canvas.width - ENEMY_SIZE);
    const y = 0; // Start from the top
    enemies.push({
        x: x,
        y: y,
        width: ENEMY_SIZE,
        height: ENEMY_SIZE,
        color: 'red'
    });
}

// Initial enemy spawn
spawnEnemy();
setInterval(spawnEnemy, 2000); // Spawn a new enemy every 2 seconds
```

**Explanation:**
*   `PLAYER_SIZE`, `ENEMY_SIZE`, `BULLET_SIZE`: Define the dimensions of our square characters.
*   `PLAYER_SPEED`, `ENEMY_SPEED`, `BULLET_SPEED`: Control how fast each entity moves.
*   `player`: An object representing our player's spaceship, with its initial position, size, and color.
*   `enemies`: An array to hold all the enemy spaceship objects.
*   `bullets`: An array to hold all the bullet objects fired by the player.
*   `gameOver`: A boolean flag to track the game state.
*   `drawRect()`: A utility function to draw any rectangular game object.
*   `drawPlayer()`, `drawEnemies()`, `drawBullets()`: Functions to render our game entities on the canvas.
*   `spawnEnemy()`: Creates a new enemy object at a random horizontal position at the top of the canvas and adds it to the `enemies` array.
*   `setInterval(spawnEnemy, 2000)`: This line uses `setInterval` to call `spawnEnemy` every 2000 milliseconds (2 seconds), continuously adding new enemies to the game.

---

## 4. The Game Loop (`script.js`)

Our game loop will handle updating the positions of all game objects, checking for collisions, and redrawing the screen.

```javascript
// ... (previous script.js code) ...

// Main game loop
function gameLoop() {
    if (gameOver) return; // Stop the loop if game is over

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Update and draw player
    drawPlayer();

    // Update and draw enemies
    enemies.forEach(enemy => {
        enemy.y += ENEMY_SPEED; // Move enemy downwards
        drawRect(enemy.x, enemy.y, enemy.width, enemy.height, enemy.color);

        // Check if enemy reached bottom (game over condition)
        if (enemy.y + enemy.height > canvas.height) {
            gameOver = true;
            alert('Game Over! Score: ' + score);
        }
    });

    // Update and draw bullets
    bullets.forEach((bullet, bulletIndex) => {
        bullet.y -= BULLET_SPEED; // Move bullet upwards
        drawRect(bullet.x, bullet.y, bullet.width, bullet.height, bullet.color);

        // Remove bullets that go off screen
        if (bullet.y < 0) {
            bullets.splice(bulletIndex, 1); // Remove bullet from array
        }
    });

    // Collision detection (Bullet vs Enemy)
    bullets.forEach((bullet, bulletIndex) => {
        enemies.forEach((enemy, enemyIndex) => {
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                // Collision detected!
                bullets.splice(bulletIndex, 1); // Remove bullet
                enemies.splice(enemyIndex, 1); // Remove enemy
                score += 10; // Increase score
                document.getElementById('score').textContent = score; // Update score display
            }
        });
    });

    requestAnimationFrame(gameLoop); // Call gameLoop again for the next frame
}

// Start the game loop
gameLoop();
```

**Explanation:**
*   `gameLoop()`: This is our main game loop, called repeatedly by `requestAnimationFrame` for smooth animation.
*   `if (gameOver) return;`: If the game is over, the loop stops.
*   `ctx.clearRect(0, 0, canvas.width, canvas.height);`: Clears the entire canvas before drawing the new frame.
*   **Enemy Movement and Game Over:** Each enemy's `y` position is increased, moving it down. If an enemy reaches the bottom of the screen, the game is over.
*   **Bullet Movement and Removal:** Each bullet's `y` position is decreased, moving it up. If a bullet goes off the top of the screen, it's removed from the `bullets` array using `splice` to keep our array clean and efficient.
*   **Collision Detection (Bullet vs Enemy):** This is a crucial part. We loop through all bullets and all enemies. The `if` condition checks if their rectangular boundaries overlap. If they do:
    *   The bullet is removed.
    *   The enemy is removed.
    *   The score is increased and updated on the screen.
*   `requestAnimationFrame(gameLoop);`: This is the modern and efficient way to create animations in the browser. It tells the browser that you want to perform an animation and requests that the browser calls a specified function to update an animation before the browser's next repaint.

---

## 5. Handling User Input (`script.js`)

We need to allow the player to move their spaceship and fire bullets.

```javascript
// ... (previous script.js code) ...

// Event listener for keyboard presses
document.addEventListener('keydown', handleKeyPress);

function handleKeyPress(event) {
    switch (event.key) {
        case 'ArrowLeft':
            player.x -= PLAYER_SPEED;
            break;
        case 'ArrowRight':
            player.x += PLAYER_SPEED;
            break;
        case ' ': // Spacebar for shooting
            // Create a new bullet at the player's position
            bullets.push({
                x: player.x + player.width / 2 - BULLET_SIZE / 2,
                y: player.y,
                width: BULLET_SIZE,
                height: BULLET_SIZE,
                color: 'yellow'
            });
            break;
    }

    // Keep player within canvas bounds
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
}
```

**Explanation:**
*   `document.addEventListener('keydown', handleKeyPress);`: Attaches an event listener to the document to detect key presses.
*   `handleKeyPress(event)`: This function is called when a key is pressed.
*   `switch (event.key)`: We use a `switch` statement to check which key was pressed:
    *   `ArrowLeft`: Moves the player spaceship to the left by `PLAYER_SPEED`.
    *   `ArrowRight`: Moves the player spaceship to the right by `PLAYER_SPEED`.
    *   ` `: (Spacebar) Creates a new bullet object. The bullet's initial position is set to be in the middle of the player's spaceship, and it's added to the `bullets` array.
*   **Player Bounds:** The `if` conditions at the end ensure that the player's spaceship cannot move off the screen.

---

## Putting It All Together

1.  Save the HTML, CSS, and JavaScript code into their respective files (`index.html`, `style.css`, `script.js`) within your `Space War Game` folder.
2.  Open `index.html` in your web browser.

You should now have a simple Space War game where you can move your blue square spaceship, shoot yellow square bullets, and destroy red square enemies!

This concludes our course on creating simple JavaScript games. You've learned the fundamental concepts that apply to many 2D games. Feel free to experiment with these games, change colors, speeds, add more features, or even create new games based on these principles!

</div>