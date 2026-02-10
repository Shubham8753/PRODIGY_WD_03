// Game state
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
let gameMode = 'ai'; // 'ai' or 'pvp'
let aiDifficulty = 'medium';

// Statistics
let stats = {
    xWins: 0,
    oWins: 0,
    draws: 0
};

// Winning combinations
const winningCombos = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
];

// DOM Elements
const cells = document.querySelectorAll('.cell');
const statusMessage = document.getElementById('statusMessage');
const currentPlayerDisplay = document.querySelector('.current-player');
const resetBtn = document.getElementById('resetBtn');
const resetStatsBtn = document.getElementById('resetStatsBtn');
const xWinsDisplay = document.getElementById('xWins');
const oWinsDisplay = document.getElementById('oWins');
const drawsDisplay = document.getElementById('draws');
const modeButtons = document.querySelectorAll('.mode-btn');
const difficultySelector = document.getElementById('difficultySelector');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');

// Load statistics from localStorage
function loadStats() {
    const savedStats = localStorage.getItem('tictactoeStats');
    if (savedStats) {
        stats = JSON.parse(savedStats);
        updateStatsDisplay();
    }
}

// Save statistics to localStorage
function saveStats() {
    localStorage.setItem('tictactoeStats', JSON.stringify(stats));
}

// Update statistics display
function updateStatsDisplay() {
    xWinsDisplay.textContent = stats.xWins;
    oWinsDisplay.textContent = stats.oWins;
    drawsDisplay.textContent = stats.draws;
}

// Check for winner
function checkWinner(board) {
    for (let combo of winningCombos) {
        const [a, b, c] = combo;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { winner: board[a], combo: combo };
        }
    }
    return null;
}

// Check for draw
function checkDraw(board) {
    return board.every(cell => cell !== '');
}

// Highlight winning cells
function highlightWinningCells(combo) {
    combo.forEach(index => {
        cells[index].classList.add('winner');
    });
}

// Handle cell click
function handleCellClick(e) {
    const cell = e.target;
    const index = parseInt(cell.dataset.index);

    // Check if cell is already filled or game is not active
    if (gameBoard[index] !== '' || !gameActive) return;

    // Make move
    gameBoard[index] = currentPlayer;
    cell.textContent = currentPlayer;
    cell.classList.add(currentPlayer.toLowerCase());

    // Check for winner
    const result = checkWinner(gameBoard);
    if (result) {
        statusMessage.textContent = `${result.winner} Wins! 🎉`;
        highlightWinningCells(result.combo);
        gameActive = false;

        // Update stats
        if (result.winner === 'X') {
            stats.xWins++;
        } else {
            stats.oWins++;
        }
        saveStats();
        updateStatsDisplay();
        return;
    }

    // Check for draw
    if (checkDraw(gameBoard)) {
        statusMessage.textContent = "It's a Draw! 🤝";
        gameActive = false;
        stats.draws++;
        saveStats();
        updateStatsDisplay();
        return;
    }

    // Switch player
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    currentPlayerDisplay.textContent = currentPlayer;
    statusMessage.textContent = `${currentPlayer}'s Turn`;

    // AI move if in AI mode
    if (gameMode === 'ai' && currentPlayer === 'O' && gameActive) {
        setTimeout(makeAIMove, 500);
    }
}

// Make AI move
function makeAIMove() {
    if (!gameActive) return;

    let bestMove;

    if (aiDifficulty === 'easy') {
        bestMove = getRandomMove();
    } else if (aiDifficulty === 'medium') {
        bestMove = getMediumMove();
    } else {
        bestMove = getBestMove();
    }

    if (bestMove !== -1) {
        gameBoard[bestMove] = 'O';
        cells[bestMove].textContent = 'O';
        cells[bestMove].classList.add('o');

        // Check for winner
        const result = checkWinner(gameBoard);
        if (result) {
            statusMessage.textContent = `${result.winner} Wins! 🎉`;
            highlightWinningCells(result.combo);
            gameActive = false;

            // Update stats
            if (result.winner === 'X') {
                stats.xWins++;
            } else {
                stats.oWins++;
            }
            saveStats();
            updateStatsDisplay();
            return;
        }

        // Check for draw
        if (checkDraw(gameBoard)) {
            statusMessage.textContent = "It's a Draw! 🤝";
            gameActive = false;
            stats.draws++;
            saveStats();
            updateStatsDisplay();
            return;
        }

        // Switch player back to X
        currentPlayer = 'X';
        currentPlayerDisplay.textContent = currentPlayer;
        statusMessage.textContent = `${currentPlayer}'s Turn`;
    }
}

// Get random move (Easy)
function getRandomMove() {
    const emptyIndices = gameBoard
        .map((cell, index) => cell === '' ? index : null)
        .filter(index => index !== null);
    return emptyIndices.length > 0
        ? emptyIndices[Math.floor(Math.random() * emptyIndices.length)]
        : -1;
}

// Get medium move (Medium)
function getMediumMove() {
    // Try to win
    for (let combo of winningCombos) {
        const [a, b, c] = combo;
        const cells = [a, b, c];
        const oCount = cells.filter(i => gameBoard[i] === 'O').length;
        const emptyCount = cells.filter(i => gameBoard[i] === '').length;

        if (oCount === 2 && emptyCount === 1) {
            return cells.find(i => gameBoard[i] === '');
        }
    }

    // Try to block X
    for (let combo of winningCombos) {
        const [a, b, c] = combo;
        const cells = [a, b, c];
        const xCount = cells.filter(i => gameBoard[i] === 'X').length;
        const emptyCount = cells.filter(i => gameBoard[i] === '').length;

        if (xCount === 2 && emptyCount === 1) {
            return cells.find(i => gameBoard[i] === '');
        }
    }

    // Take center if available
    if (gameBoard[4] === '') return 4;

    // Take a corner
    const corners = [0, 2, 6, 8].filter(i => gameBoard[i] === '');
    if (corners.length > 0) {
        return corners[Math.floor(Math.random() * corners.length)];
    }

    // Take any empty
    return getRandomMove();
}

// Get best move using Minimax (Hard)
function getBestMove() {
    let bestScore = -Infinity;
    let bestMoveIndex = -1;

    for (let i = 0; i < gameBoard.length; i++) {
        if (gameBoard[i] === '') {
            gameBoard[i] = 'O';
            const score = minimax(gameBoard, 0, false);
            gameBoard[i] = '';

            if (score > bestScore) {
                bestScore = score;
                bestMoveIndex = i;
            }
        }
    }

    return bestMoveIndex;
}

// Minimax algorithm
function minimax(board, depth, isMaximizing) {
    const result = checkWinner(board);

    if (result) {
        return result.winner === 'O' ? 10 - depth : depth - 10;
    }

    if (checkDraw(board)) {
        return 0;
    }

    if (isMaximizing) {
        let bestScore = -Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'O';
                const score = minimax(board, depth + 1, false);
                board[i] = '';
                bestScore = Math.max(score, bestScore);
            }
        }
        return bestScore;
    } else {
        let bestScore = Infinity;
        for (let i = 0; i < board.length; i++) {
            if (board[i] === '') {
                board[i] = 'X';
                const score = minimax(board, depth + 1, true);
                board[i] = '';
                bestScore = Math.min(score, bestScore);
            }
        }
        return bestScore;
    }
}

// Reset game
function resetGame() {
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameActive = true;
    statusMessage.textContent = `${currentPlayer}'s Turn`;
    currentPlayerDisplay.textContent = currentPlayer;

    cells.forEach(cell => {
        cell.textContent = '';
        cell.classList.remove('x', 'o', 'winner', 'disabled');
    });
}

// Reset statistics
function resetStatistics() {
    if (confirm('Are you sure you want to reset all statistics?')) {
        stats = { xWins: 0, oWins: 0, draws: 0 };
        saveStats();
        updateStatsDisplay();
    }
}

// Change game mode
function changeGameMode(mode) {
    gameMode = mode;
    modeButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');

    if (mode === 'ai') {
        difficultySelector.style.display = 'block';
    } else {
        difficultySelector.style.display = 'none';
    }

    resetGame();
}

// Change AI difficulty
function changeAIDifficulty(difficulty) {
    aiDifficulty = difficulty;
    difficultyButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
}

// Event listeners
cells.forEach(cell => cell.addEventListener('click', handleCellClick));
resetBtn.addEventListener('click', resetGame);
resetStatsBtn.addEventListener('click', resetStatistics);
modeButtons.forEach(btn => btn.addEventListener('click', (e) => changeGameMode(e.target.dataset.mode)));
difficultyButtons.forEach(btn => btn.addEventListener('click', (e) => changeAIDifficulty(e.target.dataset.difficulty)));

// Initialize
loadStats();
statusMessage.textContent = `${currentPlayer}'s Turn`;
