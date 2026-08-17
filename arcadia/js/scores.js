fetch("./backend/get_scores.php")
    .then(response => response.json())
    .then(data => {
        const table = document.getElementById("scoreTable");
        table.innerHTML = "";

        if (data.length === 0) {
            table.innerHTML = "<tr><td colspan='3'>No scores available</td></tr>";
            return;
        }

        data.forEach(score => {
            const row = `
                <tr>
                    <td>${score.game_name}</td>
                    <td>${score.score}</td>
                    <td>${score.played_at}</td>
                </tr>
            `;
            table.innerHTML += row;
        });
    })
    .catch(error => {
        console.error("Error fetching scores:", error);
    });

function loadScores() {
  document.getElementById("snake-last").innerText = localStorage.getItem("snakeLast") || 0;
  document.getElementById("snake-high").innerText = localStorage.getItem("snakeHigh") || 0;

  document.getElementById("flappy-last").innerText = localStorage.getItem("flappyLast") || 0;
  document.getElementById("flappy-high").innerText = localStorage.getItem("flappyHigh") || 0;

  document.getElementById("ttt-wins").innerText = localStorage.getItem("tttWins") || 0;
}

function resetScores() {
  localStorage.clear();
  loadScores();
}

window.onload = loadScores;