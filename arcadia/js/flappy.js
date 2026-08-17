const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Bird
// let bird = { x: 80, y: 200, size: 30, velocity: 0 };
let bird = { x: 100, y: 300, size: 30, velocity: 0 };
const gravity = 0.6;
const lift = -10;

// Pipes
let pipes = [];
const pipeWidth = 50;
// const pipeGap = 150;
const pipeGap = 160;

// Game state
let score = 0;
let gameOver = false;
let started = false;   // ⬅️ paused until first input

// Overlay helpers (if you added the UI overlay)
const overlay = document.getElementById("flappyOverlay");
const overlayTitle = document.getElementById("flappyOverlayTitle");
const overlayHint = document.getElementById("flappyOverlayHint");

function showOverlay(title, hint = "") {
  if (!overlay) return;
  overlayTitle.textContent = title;
  overlayHint.textContent = hint;
  overlay.style.display = "flex";
}
function hideOverlay() {
  if (!overlay) return;
  overlay.style.display = "none";
}

// Input
canvas.addEventListener("click", flap);
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") flap();
});

function flap() {
  if (gameOver) return;

  if (!started) {
    started = true;     // ⬅️ start game on first input
    hideOverlay();
  }

  bird.velocity = lift;
}

// Create pipe
function createPipe() {
  if (!started || gameOver) return;  // ⬅️ don’t spawn before start
  const top = Math.random() * 200 + 50;
  pipes.push({ x: canvas.width, top, bottom: top + pipeGap, passed: false });
}

// Draw loop
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw bird
  ctx.fillStyle = "#ffd43b";
  ctx.fillRect(bird.x, bird.y, bird.size, bird.size);

  // Draw pipes
  ctx.fillStyle = "#2ecc71";
  pipes.forEach(pipe => {
    ctx.fillRect(pipe.x, 0, pipeWidth, pipe.top);
    ctx.fillRect(pipe.x, pipe.bottom, pipeWidth, canvas.height);
  });

  if (started && !gameOver) {
    // Physics only after start
    bird.velocity += gravity;
    bird.y += bird.velocity;

    pipes.forEach(pipe => {
      pipe.x -= 2;

      // Collision
      if (
        bird.x < pipe.x + pipeWidth &&
        bird.x + bird.size > pipe.x &&
        (bird.y < pipe.top || bird.y + bird.size > pipe.bottom)
      ) endGame();

      // Score
      if (!pipe.passed && pipe.x + pipeWidth < bird.x) {
        pipe.passed = true;
        document.getElementById("score").textContent = ++score;
      }
    });

    // Remove offscreen pipes
    pipes = pipes.filter(p => p.x + pipeWidth > 0);

    // Bounds
    if (bird.y <= 0 || bird.y + bird.size >= canvas.height) endGame();
  }

  requestAnimationFrame(draw);
}

function endGame() {
  if (gameOver) return;
  gameOver = true;
  saveScore(score);
  showOverlay("Game Over!", `Score: ${score}`);
}

function restartGame() {
  location.reload();
}

function saveScore(score) {
  fetch("../backend/save_score.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `game_name=Flappy Bird&score=${score}`
  });
}

// Start overlay + loop
showOverlay("Tap / Press Space to Start", "Click canvas or press Space to flap");
setInterval(createPipe, 1800);
draw();