const words = ["JAVASCRIPT", "PYTHON", "ARCADIA", "COMPUTER", "PROGRAM", "DEVELOPER"];
let chosenWord;
let displayWord;
let lives;

const wordEl = document.getElementById("word");
const lettersEl = document.getElementById("letters");
const livesEl = document.getElementById("lives");

const overlay = document.getElementById("hangmanOverlay");
const overlayTitle = document.getElementById("overlayTitle");
const overlayWord = document.getElementById("overlayWord");

function initGame() {
    chosenWord = words[Math.floor(Math.random() * words.length)];
    displayWord = Array(chosenWord.length).fill("_");
    lives = 6;

    livesEl.textContent = lives;
    overlay.classList.add("hidden");
    renderWord();
    renderLetters();
}

function renderWord() {
    wordEl.textContent = displayWord.join(" ");
}

function renderLetters() {
    lettersEl.innerHTML = "";
    for (let i = 65; i <= 90; i++) {
        const btn = document.createElement("button");
        btn.textContent = String.fromCharCode(i);
        btn.addEventListener("click", () => guessLetter(btn.textContent, btn));
        lettersEl.appendChild(btn);
    }
}

function guessLetter(letter, btn) {
    btn.disabled = true;

    if (chosenWord.includes(letter)) {
        for (let i = 0; i < chosenWord.length; i++) {
            if (chosenWord[i] === letter) {
                displayWord[i] = letter;
            }
        }
    } else {
        lives--;
        livesEl.textContent = lives;
    }

    renderWord();

    if (!displayWord.includes("_")) {
        endGame(true);
    }

    if (lives === 0) {
        endGame(false);
    }
}

function endGame(won) {
    overlayTitle.textContent = won ? "🎉 YOU WON!" : "💀 GAME OVER";
    overlayWord.textContent = won ? "" : "Word was: " + chosenWord;
    overlay.classList.remove("hidden");
}

function restartGame() {
    initGame();
}

initGame();