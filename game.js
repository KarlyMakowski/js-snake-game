// select elements
const scoreEl = document.querySelector(".score");
const highScoreEl = document.querySelector(".high-score");
const gameOverEl = document.querySelector(".game-over");
const playAgainBtn = document.querySelector(".play-again");

// select cvs
const cvs = document.getElementById("cvs");
const ctx = cvs.getContext("2d");

// add a border to cvs
cvs.style.border = "1px solid #fff";

//cvs dimensions
const width = cvs.width,
  height = cvs.height;

// game vars
const FPS = 1000 / 15;
let gameLoop;
const squareSize = 20;
let gameStarted = false;

// game colours
let boardColour = "#000000",
  headColour = "#FFF",
  bodyColour = "#999";

// direction
let currentDirection = "";
let directionsQueu = [];
let directions = {
  RIGHT: "ArrowRight",
  LEFT: "ArrowLeft",
  UP: "ArrowUp",
  DOWN: "ArrowDown",
};

// draw board
function drawBoard() {
  ctx.fillStyle = boardColour;
  ctx.fillRect(0, 0, width, height);
}

// draw square (for food & snake)
function drawSquare(x, y, colour) {
  ctx.fillStyle = colour;
  ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
  ctx.strokeStyle = boardColour;
  ctx.strokeRect(x * squareSize, y * squareSize, squareSize, squareSize);
}

// snake
let snake = [
  { x: 2, y: 0 }, // head
  { x: 1, y: 0 }, // body
  { x: 0, y: 0 }, // tail
];

function drawSnake() {
  snake.forEach((square, index) => {
    const colour = index === 0 ? headColour : bodyColour;
    drawSquare(square.x, square.y, colour);
  });
}

// snake controller
function moveSnake() {
  if (!gameStarted) return;
  // get head position
  const head = { ...snake[0] };
  // consume directions
  if (directionsQueu.length) {
    currentDirection = directionsQueu.shift();
  }
  // change head position
  switch (currentDirection) {
    case directions.RIGHT:
      head.x += 1;
      break;
    case directions.LEFT:
      head.x -= 1;
      break;
    case directions.UP:
      head.y -= 1;
      break;
    case directions.DOWN:
      head.y += 1;
      break;
  }

  if (hasEatenFood()) {
    food = createFood();
  } else {
    // remove tail
    snake.pop();
  }
  // unshift new head
  snake.unshift(head);
}

function hasEatenFood() {
  const head = snake[0];
  return head.x === food.x && head.y === food.y;
}

document.addEventListener("keyup", setDirection);

function setDirection(event) {
  const newDirection = event.key;
  const oldDirection = currentDirection;
  // snake cannot change opposite directions
  if (
    (newDirection === directions.LEFT && oldDirection !== directions.RIGHT) ||
    (newDirection === directions.RIGHT && oldDirection !== directions.LEFT) ||
    (newDirection === directions.UP && oldDirection !== directions.DOWN) ||
    (newDirection === directions.DOWN && oldDirection !== directions.UP)
  ) {
    if (!gameStarted) {
      gameStarted = true;
      gameLoop = setInterval(frame, FPS);
    }
    directionsQueu.push(newDirection);
  }
}

// number of vertical/horizontal squares
const horizontalSq = width / squareSize;
const verticalSq = height / squareSize;

// food
let food = createFood();

function createFood() {
  let food = {
    x: Math.floor(Math.random() * horizontalSq),
    y: Math.floor(Math.random() * verticalSq),
  };
  while (snake.some((square) => square.x === food.x && square.y === food.y)) {
    //this is made so that snake position and food position do not match
    food = {
      x: Math.floor(Math.random() * horizontalSq),
      y: Math.floor(Math.random() * verticalSq),
    };
  }
  return food;
}

function drawFood() {
  drawSquare(food.x, food.y, "#F95700");
}

// score
const initialSnakeLength = snake.length; // = 3
let score = 0;
let highScore = localStorage.getItem("high-score") || 0;

function renderScore() {
  score = snake.length - initialSnakeLength;
  scoreEl.innerHTML = `⭐ ${score}`;
  highScoreEl.innerHTML = `🏆 ${highScore}`;
}

// hit wall
function hitWall() {
  const head = snake[0];

  return (
    head.x < 0 || head.x >= horizontalSq || head.y < 0 || head.y >= verticalSq
  );
}

// hit self
function hitSelf() {
  const snakeBody = [...snake];
  const head = snakeBody.shift();

  return snakeBody.some((square) => square.x === head.x && square.y === head.y);
}

// game over!!
function gameOver() {
  // select score and high score El
  const scoreEl = document.querySelector(".game-over-score .current");
  const highScoreEl = document.querySelector(".game-over-score .high");
  // calculate high score
  highScore = Math.max(score, highScore);
  localStorage.setItem("high-score", highScore);
  // update score and high score El
  scoreEl.innerHTML = `⭐ ${score}`;
  highScoreEl.innerHTML = `🏆 ${highScore}`;
  // show game over El
  gameOverEl.classList.remove("hide");
}

// loop
function frame() {
  drawBoard();
  drawFood();
  moveSnake();
  drawSnake();
  renderScore();
  if (hitWall() || hitSelf()) {
    clearInterval(gameLoop);
    gameOver();
  }
}
frame();

// restart the game
playAgainBtn.addEventListener("click", restartGame);

function restartGame() {
  // reset snake length and position
  snake = [
    { x: 2, y: 0 }, // head
    { x: 1, y: 0 }, // body
    { x: 0, y: 0 }, // tail
  ];
  // reset direction
  currentDirection = "";
  directionsQueu = [];
  // hide game over screen
  gameOverEl.classList.add("hide");
  // reset the gameStarted state to false
  gameStarted = false;
  // re-draw everything
  frame();
}
