const symbols = ["🍎","🍌","🍇","🍓","🍍","🥝","🍉","🍒"];
let cards = [];
let flippedCards = [];
let matchedCount = 0;
let moves = 0;
let score = 0;
let lockBoard = false;

const grid = document.getElementById("grid");
const movesSpan = document.getElementById("moves");
const scoreSpan = document.getElementById("score");
const messageDiv = document.getElementById("message");

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function startGame() {
  const deck = shuffle([...symbols, ...symbols]);
  grid.innerHTML = "";
  cards = [];
  flippedCards = [];
  matchedCount = 0;
  moves = 0;
  score = 0;
  lockBoard = false;

  messageDiv.innerText = "";
  movesSpan.innerText = moves;
  scoreSpan.innerText = score;

  deck.forEach(symbol => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerText = symbol;
    card.addEventListener("click", () => flipCard(card));
    grid.appendChild(card);
    cards.push(card);
  });
}

function flipCard(card) {
  if (lockBoard || card.classList.contains("flipped") || card.classList.contains("matched")) return;

  card.classList.add("flipped");
  flippedCards.push(card);

  if (flippedCards.length === 2) {
    moves++;
    movesSpan.innerText = moves;
    checkMatch();
  }
}

function checkMatch() {
  lockBoard = true;
  const [c1, c2] = flippedCards;

  if (c1.innerText === c2.innerText) {
    c1.classList.add("matched");
    c2.classList.add("matched");

    matchedCount += 2;
    score += 5;

    scoreSpan.innerText = score;

    flippedCards = [];
    lockBoard = false;

    if (matchedCount === cards.length) {
      messageDiv.innerText = "🎉 YOU WON!";
      saveScore(score);   // ✅ Save score to PHP
    }

  } else {
    setTimeout(() => {
      c1.classList.remove("flipped");
      c2.classList.remove("flipped");
      flippedCards = [];
      lockBoard = false;
    }, 700);
  }
}

function restartGame() {
  startGame();
}

startGame();