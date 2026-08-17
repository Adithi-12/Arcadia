const canvas = document.getElementById("pongCanvas");
const ctx = canvas.getContext("2d");

const paddleWidth = 80;
const paddleHeight = 20;

let playerX = canvas.width / 2 - paddleWidth / 2;
let aiX = canvas.width / 2 - paddleWidth / 2;

let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let ballSize = 10;
let ballSpeedX = 4;
let ballSpeedY = 4;

let playerScore = 0;
let aiScore = 0;

function drawPaddles() {
  ctx.fillStyle = "white";

  // Top paddle (AI)
  ctx.fillRect(aiX, 10, paddleWidth, paddleHeight);

  // Bottom paddle (Player)
  ctx.fillRect(playerX, canvas.height - 30, paddleWidth, paddleHeight);
}

function drawBall() {
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballSize, 0, Math.PI * 2);
  ctx.fillStyle = "white";
  ctx.fill();
}

function moveBall() {
  ballX += ballSpeedX;
  ballY += ballSpeedY;

  // Wall collision (left/right)
  if (ballX <= 0 || ballX >= canvas.width) ballSpeedX *= -1;

  // AI paddle collision (top)
  if (
    ballY <= 30 &&
    ballX > aiX &&
    ballX < aiX + paddleWidth
  ) {
    ballSpeedY *= -1;
  }

  // Player paddle collision (bottom)
  if (
    ballY >= canvas.height - 30 &&
    ballX > playerX &&
    ballX < playerX + paddleWidth
  ) {
    ballSpeedY *= -1;
  }

  // Score
  if (ballY < 0) {
    playerScore++;
    document.getElementById("playerScore").innerText = playerScore;
    resetBall();
  }

  if (ballY > canvas.height) {
    aiScore++;
    document.getElementById("aiScore").innerText = aiScore;
    resetBall();
  }
}

function resetBall() {
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;
  ballSpeedY *= -1;
}

function moveAI() {
  aiX += (ballX - (aiX + paddleWidth / 2)) * 0.05;
}

canvas.addEventListener("mousemove", e => {
  const rect = canvas.getBoundingClientRect();
  playerX = e.clientX - rect.left - paddleWidth / 2;
});

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPaddles();
  drawBall();
  moveBall();
  moveAI();
  requestAnimationFrame(draw);
}

function restartGame() {
  playerScore = 0;
  aiScore = 0;
  document.getElementById("playerScore").innerText = 0;
  document.getElementById("aiScore").innerText = 0;
  resetBall();
}

draw();