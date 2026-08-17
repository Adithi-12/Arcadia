const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const box = 20;
let score = 0;
let direction = null;
let gameRunning = false;   // ⬅️ game starts paused
let gameInterval;

let snake = [{ x: 9 * box, y: 10 * box }];

const overlay = document.getElementById("snakeOverlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayHint = document.getElementById("overlayHint");

function showOverlay(title, hint = "") {
  overlayTitle.textContent = title;
  overlayHint.textContent = hint;
  overlay.style.display = "flex";
}

function hideOverlay() {
  overlay.style.display = "none";
}


function randomFood() {
  let pos;
  do {
    pos = {
      x: Math.floor(Math.random() * 19) * box,
      y: Math.floor(Math.random() * 19) * box
    };
  } while (snake.some(s => s.x === pos.x && s.y === pos.y));
  return pos;
}

let food = randomFood();

// Show start message
function showStartMessage() {
    showOverlay("Press Arrow Key to Start", "Use ⬅️ ⬆️ ➡️ ⬇️ to move");

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Press Arrow Key to Start", canvas.width / 2, canvas.height / 2);
}

showStartMessage();

document.addEventListener("keydown", e => {
  const keyMap = {
    ArrowLeft: "LEFT",
    ArrowUp: "UP",
    ArrowRight: "RIGHT",
    ArrowDown: "DOWN"
  };

  if (!keyMap[e.key]) return;

  if (!gameRunning) {
    gameRunning = true;
    direction = keyMap[e.key];
    gameInterval = setInterval(drawGame, 120);

    hideOverlay();

    return;
  }

  const opposite = { LEFT: "RIGHT", RIGHT: "LEFT", UP: "DOWN", DOWN: "UP" };
  if (direction !== opposite[keyMap[e.key]]) {
    direction = keyMap[e.key];
  }
});

function drawGame() {
  if (!gameRunning) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  snake.forEach((part, i) => {
    ctx.fillStyle = i === 0 ? "lime" : "green";
    ctx.fillRect(part.x, part.y, box, box);
  });

  ctx.fillStyle = "red";
  ctx.fillRect(food.x, food.y, box, box);

  let head = { ...snake[0] };
  if (direction === "LEFT") head.x -= box;
  if (direction === "UP") head.y -= box;
  if (direction === "RIGHT") head.x += box;
  if (direction === "DOWN") head.y += box;

  if (
    head.x < 0 || head.y < 0 ||
    head.x >= canvas.width || head.y >= canvas.height ||
    snake.some(s => s.x === head.x && s.y === head.y)
  ) {
    gameOver();
    return;
  }

  if (head.x === food.x && head.y === food.y) {
    score++;
    document.getElementById("score").textContent = score;
    food = randomFood();
  } else {
    snake.pop();
  }

  snake.unshift(head);
}

function gameOver() {
    clearInterval(gameInterval);
    gameRunning = false;
    saveSnakeScore(score);
//   alert("Game Over! Score: " + score);
    showOverlay("Game Over!", `Score: ${score}`);

}

function restartGame() {
  location.reload();
}

function saveSnakeScore(finalScore) {
  fetch("../backend/save_score.php", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `game_name=Snake Game&score=${finalScore}`
  });
}