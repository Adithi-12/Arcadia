// ==================== API CONFIGURATION ====================
const API_URL = 'http://localhost/arcadia/api.php';
const USER_ID = 1; // Guest user

// ==================== GLOBAL VARIABLES ====================
let currentGame = null;
let gameStartTime = null;
let userSettings = {
    sound_enabled: true,
    music_enabled: true,
    difficulty: 'medium',
    theme: 'dark'
};

// ==================== NAVIGATION FUNCTIONS ====================

function showHome() {
    hideAllScreens();
    document.getElementById('homeScreen').classList.add('active');
    loadHomeStats();
}

function showGamesMenu() {
    hideAllScreens();
    document.getElementById('gamesMenuScreen').classList.add('active');
    loadGames();
    loadLeaderboard();
}

function showSettings() {
    hideAllScreens();
    document.getElementById('settingsScreen').classList.add('active');
    loadSettings();
}

function backToGamesMenu() {
    // Stop any running games
    if (currentGame === 'snake') pauseSnake();
    if (currentGame === 'flappyBird') {
        flappyRunning = false;
        clearInterval(flappyGameLoop);
    }
    
    hideAllScreens();
    document.getElementById('gamesMenuScreen').classList.add('active');
    currentGame = null;
    loadLeaderboard();
}

function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
}

function loadGame(gameName, gameId) {
    hideAllScreens();
    currentGame = gameName;
    gameStartTime = Date.now();
    
    switch(gameName) {
        case 'ticTacToe':
            document.getElementById('ticTacToeGame').classList.add('active');
            initTicTacToe();
            break;
        case 'snake':
            document.getElementById('snakeGame').classList.add('active');
            initSnake();
            break;
        case 'flappyBird':
            document.getElementById('flappyBirdGame').classList.add('active');
            initFlappy();
            break;
    }
}

// ==================== API FUNCTIONS ====================

async function loadHomeStats() {
    try {
        const response = await fetch(${API_URL}?action=get_stats);
        const data = await response.json();
        
        if (data.success) {
            document.getElementById('totalPlayers').textContent = data.data.total_players || 0;
            document.getElementById('totalGames').textContent = data.data.total_games_played || 0;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadGames() {
    try {
        const response = await fetch(${API_URL}?action=get_games);
        const data = await response.json();
        
        if (data.success) {
            displayGames(data.data);
        }
    } catch (error) {
        console.error('Error loading games:', error);
    }
}

function displayGames(games) {
    const grid = document.getElementById('gamesGrid');
    grid.innerHTML = '';
    
    const gameIcons = {
        'tic-tac-toe': '⭕',
        'snake': '🐍',
        'flappy-bird': '🐦'
    };
    
    const gameNames = {
        'tic-tac-toe': 'ticTacToe',
        'snake': 'snake',
        'flappy-bird': 'flappyBird'
    };
    
    games.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';
        card.onclick = () => loadGame(gameNames[game.game_slug], game.game_id);
        
        card.innerHTML = `
            <div class="game-icon">${gameIcons[game.game_slug]}</div>
            <h3>${game.game_name}</h3>
            <p>${game.description}</p>
            <p class="game-plays">🎮 ${game.play_count} plays</p>
        `;
        
        grid.appendChild(card);
    });
}

async function loadLeaderboard() {
    try {
        const response = await fetch(${API_URL}?action=get_leaderboard&limit=5);
        const data = await response.json();
        
        if (data.success) {
            displayLeaderboard(data.data);
        }
    } catch (error) {
        console.error('Error loading leaderboard:', error);
    }
}

function displayLeaderboard(scores) {
    const list = document.getElementById('leaderboardList');
    list.innerHTML = '';
    
    if (scores.length === 0) {
        list.innerHTML = '<li class="leaderboard-item">No scores yet. Be the first!</li>';
        return;
    }
    
    scores.forEach((score, index) => {
        const li = document.createElement('li');
        li.className = 'leaderboard-item';
        li.innerHTML = `
            <span class="rank">#${index + 1}</span>
            <span>${score.game_name} - ${score.username}</span>
            <span style="font-weight: bold; color: #f5576c;">${score.score} pts</span>
        `;
        list.appendChild(li);
    });
}

async function saveScore(gameId, score) {
    const duration = Math.floor((Date.now() - gameStartTime) / 1000);
    
    try {
        const response = await fetch(${API_URL}?action=save_score, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                game_id: gameId,
                score: score,
                duration: duration,
                user_id: USER_ID
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('Score saved successfully');
        }
        
        return data;
    } catch (error) {
        console.error('Error saving score:', error);
    }
}

// ==================== SETTINGS FUNCTIONS ====================

async function loadSettings() {
    try {
        const response = await fetch(${API_URL}?action=get_settings&user_id=${USER_ID});
        const data = await response.json();
        
        if (data.success) {
            userSettings = data.data;
            
            document.getElementById('soundToggle').checked = userSettings.sound_enabled == 1;
            document.getElementById('musicToggle').checked = userSettings.music_enabled == 1;
            document.getElementById('difficultySelect').value = userSettings.difficulty;
            document.getElementById('themeSelect').value = userSettings.theme;
        }
    } catch (error) {
        console.error('Error loading settings:', error);
    }
}

async function saveSettings() {
    const settings = {
        user_id: USER_ID,
        sound_enabled: document.getElementById('soundToggle').checked,
        music_enabled: document.getElementById('musicToggle').checked,
        difficulty: document.getElementById('difficultySelect').value,
        theme: document.getElementById('themeSelect').value
    };
    
    try {
        const response = await fetch(${API_URL}?action=update_settings, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(settings)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ Settings saved successfully!');
            userSettings = settings;
        } else {
            alert('❌ Failed to save settings');
        }
    } catch (error) {
        console.error('Error saving settings:', error);
        alert('❌ Error saving settings');
    }
}

// ==================== TIC-TAC-TOE GAME ====================
let tttBoard = ['', '', '', '', '', '', '', '', ''];
let tttCurrentPlayer = 'X';
let tttGameActive = true;
let tttMoves = 0;

function initTicTacToe() {
    const board = document.getElementById('ticTacToeBoard');
    board.innerHTML = '';
    tttBoard = ['', '', '', '', '', '', '', '', ''];
    tttCurrentPlayer = 'X';
    tttGameActive = true;
    tttMoves = 0;
    
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'ttt-cell';
        cell.onclick = () => handleTTTClick(i);
        board.appendChild(cell);
    }
    
    document.getElementById('currentPlayer').textContent = tttCurrentPlayer;
}

function handleTTTClick(index) {
    if (!tttGameActive || tttBoard[index] !== '') return;
    
    tttBoard[index] = tttCurrentPlayer;
    tttMoves++;
    updateTTTDisplay();
    
    if (checkTTTWinner()) {
        tttGameActive = false;
        setTimeout(() => {
            alert(🎉 Player ${tttCurrentPlayer} wins!);
            const score = 100 - (tttMoves * 5);
            saveScore(1, score);
        }, 100);
        return;
    }
    
    if (tttMoves === 9) {
        tttGameActive = false;
        setTimeout(() => {
            alert("🤝 It's a draw!");
            saveScore(1, 50);
        }, 100);
        return;
    }
    
    tttCurrentPlayer = tttCurrentPlayer === 'X' ? 'O' : 'X';
    document.getElementById('currentPlayer').textContent = tttCurrentPlayer;
}

function checkTTTWinner() {
    const patterns = [
        [0,1,2], [3,4,5], [6,7,8],
        [0,3,6], [1,4,7], [2,5,8],
        [0,4,8], [2,4,6]
    ];
    
    return patterns.some(p => {
        const [a,b,c] = p;
        return tttBoard[a] && tttBoard[a] === tttBoard[b] && tttBoard[a] === tttBoard[c];
    });
}

function updateTTTDisplay() {
    const cells = document.querySelectorAll('.ttt-cell');
    cells.forEach((cell, i) => {
        cell.textContent = tttBoard[i];
        if (tttBoard[i]) cell.classList.add('disabled');
    });
}

function resetTicTacToe() {
    initTicTacToe();
}

// ==================== SNAKE GAME ====================
let snakeCanvas, snakeCtx;
let snake = [{x:10, y:10}];
let food = {x:15, y:15};
let dx=0, dy=0;
let snakeScore = 0;
let snakeGameLoop;
let snakeRunning = false;

function initSnake() {
    snakeCanvas = document.getElementById('snakeCanvas');
    snakeCtx = snakeCanvas.getContext('2d');
    snake = [{x:10, y:10}];
    food = {x:15, y:15};
    dx=0; dy=0;
    snakeScore = 0;
    snakeRunning = false;
    document.getElementById('snakeScore').textContent = snakeScore;
    drawSnake();
}

function startSnake() {
    if (snakeRunning) return;
    snakeRunning = true;
    dx=1; dy=0;
    snakeGameLoop = setInterval(updateSnake, 100);
}

function pauseSnake() {
    snakeRunning = false;
    clearInterval(snakeGameLoop);
}

function resetSnake() {
    pauseSnake();
    initSnake();
}

function updateSnake() {
    const head = {x: snake[0].x + dx, y: snake[0].y + dy};
    
    if (head.x<0 || head.x>=20 || head.y<0 || head.y>=20 ||
        snake.some(s => s.x===head.x && s.y===head.y)) {
        gameOverSnake();
        return;
    }
    
    snake.unshift(head);
    
    if (head.x===food.x && head.y===food.y) {
        snakeScore += 10;
        document.getElementById('snakeScore').textContent = snakeScore;
        generateFood();
    } else {
        snake.pop();
    }
    
    drawSnake();
}

function drawSnake() {
    snakeCtx.clearRect(0, 0, 400, 400);
    snakeCtx.fillStyle = '#667eea';
    snake.forEach(s => snakeCtx.fillRect(s.x*20, s.y*20, 18, 18));
    snakeCtx.fillStyle = '#f5576c';
    snakeCtx.fillRect(food.x*20, food.y*20, 18, 18);
}

function generateFood() {
    food = {x: Math.floor(Math.random()*20), y: Math.floor(Math.random()*20)};
    if (snake.some(s => s.x===food.x && s.y===food.y)) generateFood();
}

function gameOverSnake() {
    pauseSnake();
    alert(🎮 Game Over! Score: ${snakeScore});
    saveScore(2, snakeScore);
}

document.addEventListener('keydown', (e) => {
    if (!snakeRunning || currentGame !== 'snake') return;
    
    switch(e.key) {
        case 'ArrowUp': if (dy===0) {dx=0; dy=-1;} break;
        case 'ArrowDown': if (dy===0) {dx=0; dy=1;} break;
        case 'ArrowLeft': if (dx===0) {dx=-1; dy=0;} break;
        case 'ArrowRight': if (dx===0) {dx=1; dy=0;} break;
    }
});

// ==================== FLAPPY BIRD GAME ====================
let flappyCanvas, flappyCtx;
let bird = {x:50, y:200, velocity:0, gravity:0.5};
let pipes = [];
let flappyScore = 0;
let flappyGameLoop;
let flappyRunning = false;

function initFlappy() {
    flappyCanvas = document.getElementById('flappyCanvas');
    flappyCtx = flappyCanvas.getContext('2d');
    bird = {x:50, y:200, velocity:0, gravity:0.5};
    pipes = [];
    flappyScore = 0;
    flappyRunning = false;
    document.getElementById('flappyScore').textContent = flappyScore;
    drawFlappy();
}

function startFlappy() {
    if (flappyRunning) return;
    flappyRunning = true;
    pipes = [];
    bird.y = 200;
    bird.velocity = 0;
    flappyScore = 0;
    document.getElementById('flappyScore').textContent = flappyScore;
    flappyGameLoop = setInterval(updateFlappy, 20);
}

function resetFlappy() {
    flappyRunning = false;
    clearInterval(flappyGameLoop);
    initFlappy();
}

function updateFlappy() {
    bird.velocity += bird.gravity;
    bird.y += bird.velocity;
    
    if (bird.y > 580 || bird.y < 0) {
        gameOverFlappy();
        return;
    }
    
    if (pipes.length === 0 || pipes[pipes.length-1].x < 200) {
        const gap = 150;
        const h = Math.random() * 300 + 50;
        pipes.push({x:400, topHeight:h, bottomY:h+gap, passed:false});
    }
    
    pipes.forEach((p, i) => {
        p.x -= 2;
        
        if (bird.x+20>p.x && bird.x<p.x+50) {
            if (bird.y<p.topHeight || bird.y+20>p.bottomY) {
                gameOverFlappy();
                return;
            }
        }
        
        if (!p.passed && p.x+50<bird.x) {
            p.passed = true;
            flappyScore++;
            document.getElementById('flappyScore').textContent = flappyScore;
        }
        
        if (p.x < -50) pipes.splice(i, 1);
    });
    
    drawFlappy();
}

function drawFlappy() {
    flappyCtx.clearRect(0, 0, 400, 600);
    flappyCtx.fillStyle = '#f5576c';
    flappyCtx.fillRect(bird.x, bird.y, 20, 20);
    flappyCtx.fillStyle = '#667eea';
    pipes.forEach(p => {
        flappyCtx.fillRect(p.x, 0, 50, p.topHeight);
        flappyCtx.fillRect(p.x, p.bottomY, 50, 600-p.bottomY);
    });
}

function flap() {
    if (flappyRunning) bird.velocity = -8;
}

function gameOverFlappy() {
    flappyRunning = false;
    clearInterval(flappyGameLoop);
    alert(🎮 Game Over! Score: ${flappyScore});
    saveScore(3, flappyScore);
}

if (document.getElementById('flappyCanvas')) {
    document.getElementById('flappyCanvas').addEventListener('click', flap);
}

document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && currentGame === 'flappyBird') {
        e.preventDefault();
        flap();
    }
});

// ==================== INITIALIZE ====================
window.addEventListener('load', () => {
    showHome();
});