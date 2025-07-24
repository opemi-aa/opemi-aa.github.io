---
layout: default
title: Simple Snake Game Course
---

<div class="course-frame">

# Simple Snake Game Course: A Beginner's Guide

Welcome to the first module of our "Simple JavaScript Games Course"! In this section, we'll build a classic Snake game from scratch. Our focus will be on understanding the fundamental concepts of game development using plain JavaScript, HTML, and CSS, without relying on complex libraries or frameworks.

This game will be very basic, designed to illustrate core programming principles like game loops, user input, collision detection, and rendering on a canvas.

## What You'll Learn:
- Setting up a basic HTML structure for your game.
- Using the HTML `<canvas>` element for drawing game graphics.
- Understanding the game loop concept.
- Handling keyboard input.
- Implementing basic game logic (movement, collision, scoring).

Let's get started!

---

## 1. Setting up Your Project

First, create a new folder for your Snake game. Inside this folder, you'll need three files:
- `index.html`: This will be the main structure of our game.
- `style.css`: For basic styling of our game canvas.
- `script.js`: Where all our JavaScript game logic will live.

### `index.html`

Open `index.html` and add the following basic HTML structure. This sets up our page, links to our CSS and JavaScript files, and includes the `<canvas>` element where our game will be drawn.

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Snake Game</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <h1>Simple Snake Game</h1>
    <canvas id="gameCanvas" width="400" height="400"></canvas>
    <p>Score: <span id="score">0</span></p>
    <script src="script.js"></script>
</body>
</html>
```

**Explanation:**
- `<!DOCTYPE html>`: Declares the document type.
- `<html lang="en">`: The root element of an HTML page.
- `<head>`: Contains meta-information about the HTML document (like character set, viewport settings, and title).
- `<meta charset="UTF-8">`: Specifies the character encoding for the document.
- `<meta name="viewport" ...>`: Configures the viewport for responsive design.
- `<title>Simple Snake Game</title>`: Sets the title that appears in the browser tab.
- `<link rel="stylesheet" href="style.css">`: Links our HTML document to our `style.css` file, which will control the visual appearance.
- `<body>`: Contains the visible page content.
- `<h1>Simple Snake Game</h1>`: A main heading for our game.
- `<canvas id="gameCanvas" width="400" height="400"></canvas>`: This is the most important part for our game. The `<canvas>` element provides a blank drawing surface. We give it an `id` so we can easily access it with JavaScript, and set its `width` and `height`.
- `<p>Score: <span id="score">0</span></p>`: A paragraph to display the player's score. The `<span>` with `id="score"` will be updated by JavaScript.
- `<script src="script.js"></script>`: Links our HTML document to our `script.js` file. This is where all our game logic will be written. It's placed at the end of `<body>` so that the HTML elements are loaded before the script tries to access them.

---

## 2. Basic Styling (`style.css`)

Now, let's add some minimal styling to `style.css` to make our canvas visible.

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
    background-color: #eee;
}

h1 {
    color: #333;
}

p {
    font-size: 1.2em;
}
```

**Explanation:**
- `body`: Styles the entire page. `display: flex`, `flex-direction: column`, and `align-items: center` are used to center the game content vertically.
- `canvas`: Adds a black border around our canvas and gives it a light gray background, making it clearly visible.
- `h1` and `p`: Basic styling for the heading and paragraph elements.

---

## 3. Game Logic (`script.js`) - Initial Setup

Now, let's start with the JavaScript logic in `script.js`. We'll begin by getting references to our canvas and its 2D rendering context, and define some basic game variables.

```javascript
// Get the canvas element and its 2D rendering context
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Define game constants
const gridSize = 20; // Size of each segment of the snake and food
const tileCount = canvas.width / gridSize; // Number of tiles in a row/column

// Game variables
let snake = [
    { x: 10, y: 10 } // Initial position of the snake's head
];
let food = {}; // Position of the food
let score = 0;
let dx = 0; // Horizontal velocity
let dy = 0; // Vertical velocity
let changingDirection = false; // To prevent multiple key presses in one frame

// Function to draw a single square (for snake segments and food)
function drawSquare(x, y, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x * gridSize, y * gridSize, gridSize, gridSize);
    ctx.strokeStyle = 'black'; // Add a border for better visibility
    ctx.strokeRect(x * gridSize, y * gridSize, gridSize, gridSize);
}

// Function to draw the entire snake
function drawSnake() {
    snake.forEach(segment => {
        drawSquare(segment.x, segment.y, 'green'); // Snake color
    });
}

// Function to generate random food position
function generateFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };

    // Ensure food does not spawn on the snake
    snake.forEach(segment => {
        const foodIsOnSnake = (segment.x === food.x && segment.y === food.y);
        if (foodIsOnSnake) {
            generateFood(); // Regenerate if it's on the snake
        }
    });
}

// Function to draw the food
function drawFood() {
    drawSquare(food.x, food.y, 'red'); // Food color
}

// Initial call to generate food
generateFood();
```

**Explanation:**
- `const canvas = document.getElementById('gameCanvas');`: This line gets a reference to our `<canvas>` element from the HTML using its `id`.
- `const ctx = canvas.getContext('2d');`: This is crucial! It gets the 2D rendering context of the canvas, which provides methods for drawing shapes, text, and images on the canvas. Think of `ctx` as our paintbrush.
- `gridSize`: Defines the size of each square unit in our game (e.g., a snake segment or a piece of food).
- `tileCount`: Calculates how many `gridSize` units fit across the canvas.
- `snake`: An array of objects. Each object represents a segment of the snake, with `x` and `y` coordinates. The first element is always the head.
- `food`: An object to store the `x` and `y` coordinates of the food.
- `score`: Keeps track of the player's score.
- `dx`, `dy`: These variables control the direction of the snake's movement. `dx` is for horizontal movement (1 for right, -1 for left, 0 for no horizontal movement), and `dy` is for vertical movement (1 for down, -1 for up, 0 for no vertical movement).
- `changingDirection`: A flag to prevent the snake from reversing direction too quickly, which can lead to instant game over.
- `drawSquare(x, y, color)`: A helper function to draw a single square on the canvas at given grid coordinates and with a specified color. It uses `ctx.fillRect` to draw the filled square and `ctx.strokeRect` to add a black border.
- `drawSnake()`: Iterates through the `snake` array and draws each segment.
- `generateFood()`: Randomly places food on the canvas. It also checks to make sure the food doesn't spawn directly on top of the snake.
- `drawFood()`: Draws the food square.
- `generateFood()`: We call this once at the beginning to place the first piece of food.

---

## 4. The Game Loop (`script.js`)

Games constantly update and redraw. This is managed by a "game loop." In JavaScript, `requestAnimationFrame` is the preferred way to create smooth animations.

```javascript
// ... (previous script.js code) ...

// Main game loop
function main() {
    if (didGameEnd()) return; // Check if game is over

    changingDirection = false; // Allow new direction input

    setTimeout(function onTick() {
        clearCanvas(); // Clear previous frame
        drawFood();    // Draw food
        moveSnake();   // Update snake position
        drawSnake();   // Draw snake

        // Call main again to continue the loop
        main();
    }, 100); // Game speed: 100ms per frame (adjust for difficulty)
}

// Function to clear the canvas
function clearCanvas() {
    ctx.fillStyle = 'white'; // Background color for clearing
    ctx.strokeStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

// Function to move the snake
function moveSnake() {
    // Create the new head of the snake
    const head = { x: snake[0].x + dx, y: snake[0].y + dy };

    // Add the new head to the beginning of the snake array
    snake.unshift(head);

    const didEatFood = head.x === food.x && head.y === food.y;
    if (didEatFood) {
        score += 10; // Increase score
        document.getElementById('score').textContent = score; // Update score display
        generateFood(); // Generate new food
    } else {
        // Remove the tail segment if no food was eaten
        snake.pop();
    }
}

// Function to check for game over conditions
function didGameEnd() {
    for (let i = 4; i < snake.length; i++) {
        const didCollide = snake[i].x === snake[0].x && snake[i].y === snake[0].y;
        if (didCollide) return true; // Collided with itself
    }

    const hitLeftWall = snake[0].x < 0;
    const hitRightWall = snake[0].x > tileCount - 1;
    const hitTopWall = snake[0].y < 0;
    const hitBottomWall = snake[0].y > tileCount - 1;

    return hitLeftWall || hitRightWall || hitTopWall || hitBottomWall;
}

// Start the game loop
main();
```

**Explanation:**
- `main()`: This is our game loop function.
    - `if (didGameEnd()) return;`: Checks if the game is over. If it is, the loop stops.
    - `changingDirection = false;`: Resets the flag, allowing the player to input a new direction for the next frame.
    - `setTimeout(function onTick() { ... }, 100);`: This schedules the `onTick` function to run after 100 milliseconds. This controls the game speed. A smaller number means a faster game.
    - `clearCanvas()`: Erases everything drawn in the previous frame.
    - `drawFood()`: Draws the food at its current position.
    - `moveSnake()`: Updates the snake's position based on its current direction.
    - `drawSnake()`: Draws the snake at its new position.
    - `main()`: Recursively calls `main` to continue the loop.
- `clearCanvas()`: Fills the entire canvas with a white background and draws a black border.
- `moveSnake()`:
    - `const head = { x: snake[0].x + dx, y: snake[0].y + dy };`: Calculates the new position of the snake's head based on its current direction (`dx`, `dy`).
    - `snake.unshift(head);`: Adds the new head to the beginning of the `snake` array.
    - `const didEatFood = ...`: Checks if the snake's head is at the same position as the food.
    - If `didEatFood` is true:
        - `score += 10;`: Increases the score.
        - `document.getElementById('score').textContent = score;`: Updates the score displayed in the HTML.
        - `generateFood();`: Places new food on the canvas.
    - Else (if no food was eaten):
        - `snake.pop();`: Removes the last segment of the snake, making it appear to move.
- `didGameEnd()`: Checks for two game over conditions:
    - **Self-collision:** Iterates through the snake's body (starting from the 4th segment to avoid immediate collision with the neck) to see if the head (`snake[0]`) has collided with any other part of its body.
    - **Wall collision:** Checks if the snake's head has gone beyond the canvas boundaries.
- `main();`: This line starts our game loop when the script loads.

---

## 5. Handling User Input (`script.js`)

To make the snake move, we need to listen for keyboard presses.

```javascript
// ... (previous script.js code) ...

// Event listener for keyboard presses
document.addEventListener('keydown', changeDirection);

function changeDirection(event) {
    const LEFT_KEY = 37;
    const RIGHT_KEY = 39;
    const UP_KEY = 38;
    const DOWN_KEY = 40;

    // Prevent the snake from reversing direction instantly
    if (changingDirection) return;
    changingDirection = true;

    const keyPressed = event.keyCode;
    const goingUp = dy === -1;
    const goingDown = dy === 1;
    const goingRight = dx === 1;
    const goingLeft = dx === -1;

    if (keyPressed === LEFT_KEY && !goingRight) {
        dx = -1;
        dy = 0;
    }

    if (keyPressed === UP_KEY && !goingDown) {
        dx = 0;
        dy = -1;
    }

    if (keyPressed === RIGHT_KEY && !goingLeft) {
        dx = 1;
        dy = 0;
    }

    if (keyPressed === DOWN_KEY && !goingUp) {
        dx = 0;
        dy = 1;
    }
}
```

**Explanation:**
- `document.addEventListener('keydown', changeDirection);`: This line attaches an "event listener" to the entire document. Whenever a key is pressed down, the `changeDirection` function will be called.
- `changeDirection(event)`: This function is executed when a key is pressed. The `event` object contains information about the key press.
- `LEFT_KEY`, `RIGHT_KEY`, etc.: These are "key codes" (numerical representations) for the arrow keys.
- `if (changingDirection) return;`: This prevents the player from pressing multiple direction keys very quickly within a single game frame, which could cause the snake to collide with itself.
- `changingDirection = true;`: Sets the flag to true, indicating that a direction change has been processed for this frame.
- `const keyPressed = event.keyCode;`: Gets the key code of the pressed key.
- `const goingUp = dy === -1;` etc.: These variables check the current direction of the snake.
- The `if` statements check which arrow key was pressed and, importantly, prevent the snake from immediately reversing into itself (e.g., if going right, you can't instantly go left). If a valid direction key is pressed and it's not a direct reversal, `dx` and `dy` are updated to reflect the new direction.

---

## Putting It All Together

You now have all the pieces for a simple Snake game!

1.  Save the HTML, CSS, and JavaScript code into their respective files (`index.html`, `style.css`, `script.js`) within your `Snake Game` folder.
2.  Open `index.html` in your web browser.

You should see a simple Snake game. Try playing it!

In the next module, we'll move on to creating a simple Space War game.
