let playerScore = 0;
let aiScore = 0;

const choices = ["rock", "paper", "scissors"];

const emojiMap = {
  rock: "✊",
  paper: "📄",
  scissors: "✂️"
};

function play(playerChoice) {
  const aiChoice = choices[Math.floor(Math.random() * choices.length)];

  document.getElementById("playerChoice").innerText = emojiMap[playerChoice];
  document.getElementById("aiChoice").innerText = emojiMap[aiChoice];

  let result = "";

  if (playerChoice === aiChoice) {
    result = "🤝 It's a Draw!";
  } else if (
    (playerChoice === "rock" && aiChoice === "scissors") ||
    (playerChoice === "paper" && aiChoice === "rock") ||
    (playerChoice === "scissors" && aiChoice === "paper")
  ) {
    playerScore++;
    result = "🎉 You Win!";
  } else {
    aiScore++;
    result = "You Lose!";
  }

  document.getElementById("playerScore").innerText = playerScore;
  document.getElementById("aiScore").innerText = aiScore;
  document.getElementById("result").innerText = result;
}

function restartGame() {
  playerScore = 0;
  aiScore = 0;
  document.getElementById("playerScore").innerText = 0;
  document.getElementById("aiScore").innerText = 0;
  document.getElementById("playerChoice").innerText = "❔";
  document.getElementById("aiChoice").innerText = "❔";
  document.getElementById("result").innerText = "";
}