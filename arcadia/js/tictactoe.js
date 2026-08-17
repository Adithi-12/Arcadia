const board = document.getElementById("board");
const statusText = document.getElementById("status");
const resultScreen = document.getElementById("resultScreen");
const winnerSymbol = document.getElementById("winnerSymbol");

let currentPlayer = "X";
let gameActive = true;
let gameState = ["", "", "", "", "", "", "", "", ""];

const winningConditions = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
]

function createBoard() {
  board.innerHTML = "";
  gameState.forEach((_, index) => {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.dataset.index = index;
    cell.addEventListener("click", handleCellClick);
    board.appendChild(cell);
  });
}

function handleCellClick(e) {
  const index = e.target.dataset.index;
  if (!gameActive || gameState[index] !== "") return;

  gameState[index] = currentPlayer;
  e.target.textContent = currentPlayer;

  checkResult();
}

function checkResult() {
  let winner = null;

  for (let [a, b, c] of winningConditions) {
    if (
      gameState[a] &&
      gameState[a] === gameState[b] &&
      gameState[a] === gameState[c]
    ) {
      winner = gameState[a];
      break;
    }
  }

  if (winner) {
    gameActive = false;
    showResult(winner);
    return;
  }

  if (!gameState.includes("")) {
    gameActive = false;
    showResult("DRAW");
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  statusText.textContent = `Player ${currentPlayer}'s turn`;
}

// function showResult(result) {
//   resultScreen.style.display = "flex";
//   winnerSymbol.textContent = result === "DRAW" ? "DRAW" : result;
// }

function showResult(result) {
  const resultTitle = document.getElementById("resultTitle");
  const resultMessage = document.getElementById("resultMessage");

  resultScreen.style.display = "flex";

  if (result === "DRAW") {
    winnerSymbol.textContent = "🤝";
    resultTitle.textContent = "It's a Draw!";
    resultMessage.textContent = "Well played both players!";
  } else {
    winnerSymbol.textContent = result;
    resultTitle.textContent = `Player ${result} Wins! 🎉`;
    resultMessage.textContent = "Congratulations!";
  }
}


function restartGame() {
  gameState = ["","","","","","","","",""];
  currentPlayer = "X";
  gameActive = true;
  statusText.textContent = "Player X's turn";
  resultScreen.style.display = "none";
  createBoard();
}

createBoard();