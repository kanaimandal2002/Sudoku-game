// script.js
document.addEventListener('DOMContentLoaded', function() {
    // Game state variables
    let selectedCell = null;
    let grid = {};
    let solution = {};
    let startTime;
    let timerInterval;
    let difficulty = 'easy';
    
    // Difficulty settings (number of cells to hide)
    const difficultyLevels = {
        easy: 35,    // 46 visible cells
        medium: 45,  // 36 visible cells
        hard: 55     // 26 visible cells
    };
    
    // Initialize the game
    initGame();
    
    // Initialize game board and controls
    function initGame() {
        createGrid();
        createNumberControls();
        setupEventListeners();
        generateNewPuzzle();
    }
    
    // Create the Sudoku grid
    function createGrid() {
        const gridElement = document.getElementById('sudoku-grid');
        gridElement.innerHTML = '';
        
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                
                // Add thicker borders for 3x3 boxes
                if ((j + 1) % 3 === 0 && j < 8) {
                    cell.classList.add('border-right-3');
                }
                if ((i + 1) % 3 === 0 && i < 8) {
                    cell.classList.add('border-bottom-3');
                }
                
                gridElement.appendChild(cell);
            }
        }
    }
    
    // Create number selection buttons
    function createNumberControls() {
        const controlsElement = document.querySelector('.number-controls');
        controlsElement.innerHTML = '';
        
        for (let i = 1; i <= 9; i++) {
            const btn = document.createElement('div');
            btn.className = 'number-btn';
            btn.textContent = i;
            btn.dataset.number = i;
            controlsElement.appendChild(btn);
        }
        
        // Add erase button
        const eraseBtn = document.createElement('div');
        eraseBtn.className = 'number-btn';
        eraseBtn.innerHTML = '&#10005;'; // X symbol
        eraseBtn.dataset.number = '0';
        controlsElement.appendChild(eraseBtn);
    }
    
    // Set up event listeners
    function setupEventListeners() {
        // Cell selection
        document.getElementById('sudoku-grid').addEventListener('click', function(e) {
            if (e.target.classList.contains('cell')) {
                selectCell(e.target);
            }
        });
        
        // Number input
        document.querySelector('.number-controls').addEventListener('click', function(e) {
            if (e.target.classList.contains('number-btn') && selectedCell) {
                const number = e.target.dataset.number;
                if (number === '0') {
                    clearCell();
                } else {
                    fillCell(number);
                }
            }
        });
        
        // Keyboard input
        document.addEventListener('keydown', function(e) {
            if (selectedCell) {
                if (e.key >= '1' && e.key <= '9') {
                    fillCell(e.key);
                } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
                    clearCell();
                }
            }
        });
        
        // Difficulty buttons
        document.querySelectorAll('.difficulty-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.difficulty-btn').forEach(b => {
                    b.classList.remove('active');
                });
                this.classList.add('active');
                difficulty = this.dataset.difficulty;
                generateNewPuzzle();
            });
        });
        
        // Control buttons
        document.getElementById('new-game').addEventListener('click', generateNewPuzzle);
        document.getElementById('validate').addEventListener('click', validateSolution);
        document.getElementById('hint').addEventListener('click', provideHint);
        document.getElementById('solve').addEventListener('click', solvePuzzle);
        document.getElementById('reset').addEventListener('click', resetPuzzle);
    }
    
    // Select a cell
    function selectCell(cell) {
        // Deselect previous cell
        if (selectedCell) {
            selectedCell.classList.remove('selected');
        }
        
        // Select new cell if it's not fixed
        if (!cell.classList.contains('fixed')) {
            selectedCell = cell;
            cell.classList.add('selected');
        } else {
            selectedCell = null;
        }
    }
    
    // Fill selected cell with a number
    function fillCell(number) {
        if (selectedCell && !selectedCell.classList.contains('fixed')) {
            selectedCell.textContent = number;
            
            const row = parseInt(selectedCell.dataset.row);
            const col = parseInt(selectedCell.dataset.col);
            
            // Update grid state
            grid[row][col] = parseInt(number);
            
            // Check for errors
            checkForErrors();
            
            // Check if puzzle is complete
            if (isPuzzleComplete()) {
                clearInterval(timerInterval);
                showMessage('Congratulations! Puzzle solved!', 'success');
            }
        }
    }
    
    // Clear selected cell
    function clearCell() {
        if (selectedCell && !selectedCell.classList.contains('fixed')) {
            selectedCell.textContent = '';
            
            const row = parseInt(selectedCell.dataset.row);
            const col = parseInt(selectedCell.dataset.col);
            
            // Update grid state
            grid[row][col] = 0;
            
            // Remove error highlighting
            checkForErrors();
        }
    }
    
    // Check for errors in the grid
    function checkForErrors() {
        // Clear previous error highlighting
        document.querySelectorAll('.cell.error').forEach(cell => {
            cell.classList.remove('error');
        });
        
        // Check rows and columns for duplicates
        for (let i = 0; i < 9; i++) {
            const rowNumbers = {};
            const colNumbers = {};
            
            for (let j = 0; j < 9; j++) {
                // Check rows
                if (grid[i][j] !== 0) {
                    if (rowNumbers[grid[i][j]]) {
                        // Highlight duplicate cells in row
                        document.querySelectorAll(`.cell[data-row="${i}"]`).forEach(cell => {
                            if (parseInt(cell.textContent) === grid[i][j]) {
                                cell.classList.add('error');
                            }
                        });
                    } else {
                        rowNumbers[grid[i][j]] = true;
                    }
                }
                
                // Check columns
                if (grid[j][i] !== 0) {
                    if (colNumbers[grid[j][i]]) {
                        // Highlight duplicate cells in column
                        document.querySelectorAll(`.cell[data-col="${i}"]`).forEach(cell => {
                            if (parseInt(cell.textContent) === grid[j][i]) {
                                cell.classList.add('error');
                            }
                        });
                    } else {
                        colNumbers[grid[j][i]] = true;
                    }
                }
            }
        }
        
        // Check 3x3 boxes for duplicates
        for (let boxRow = 0; boxRow < 3; boxRow++) {
            for (let boxCol = 0; boxCol < 3; boxCol++) {
                const boxNumbers = {};
                
                for (let i = 0; i < 3; i++) {
                    for (let j = 0; j < 3; j++) {
                        const row = boxRow * 3 + i;
                        const col = boxCol * 3 + j;
                        
                        if (grid[row][col] !== 0) {
                            if (boxNumbers[grid[row][col]]) {
                                // Highlight duplicate cells in box
                                for (let x = 0; x < 3; x++) {
                                    for (let y = 0; y < 3; y++) {
                                        const r = boxRow * 3 + x;
                                        const c = boxCol * 3 + y;
                                        const cell = document.querySelector(`.cell[data-row="${r}"][data-col="${c}"]`);
                                        if (parseInt(cell.textContent) === grid[row][col]) {
                                            cell.classList.add('error');
                                        }
                                    }
                                }
                            } else {
                                boxNumbers[grid[row][col]] = true;
                            }
                        }
                    }
                }
            }
        }
    }
    
    // Check if puzzle is complete
    function isPuzzleComplete() {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                if (grid[i][j] === 0 || grid[i][j] !== solution[i][j]) {
                    return false;
                }
            }
        }
        return true;
    }
    
    // Validate the current solution
    function validateSolution() {
        if (isPuzzleComplete()) {
            showMessage('Congratulations! Your solution is correct!', 'success');
        } else {
            showMessage('There are errors in your solution. Keep trying!', 'error');
        }
    }
    
    // Provide a hint by revealing a correct number
    function provideHint() {
        if (selectedCell && !selectedCell.classList.contains('fixed')) {
            const row = parseInt(selectedCell.dataset.row);
            const col = parseInt(selectedCell.dataset.col);
            
            if (grid[row][col] !== solution[row][col]) {
                fillCell(solution[row][col].toString());
            } else {
                // Find an empty cell and highlight it
                for (let i = 0; i < 9; i++) {
                    for (let j = 0; j < 9; j++) {
                        const cell = document.querySelector(`.cell[data-row="${i}"][data-col="${j}"]`);
                        if (grid[i][j] === 0) {
                            selectCell(cell);
                            showMessage(`Try filling row ${i+1}, column ${j+1}`, 'info');
                            return;
                        }
                    }
                }
            }
        } else {
            // Find an empty cell and highlight it
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    const cell = document.querySelector(`.cell[data-row="${i}"][data-col="${j}"]`);
                    if (grid[i][j] === 0) {
                        selectCell(cell);
                        showMessage(`Try filling row ${i+1}, column ${j+1}`, 'info');
                        return;
                    }
                }
            }
        }
    }
    
    // Solve the entire puzzle
    function solvePuzzle() {
        if (confirm('Are you sure you want to see the solution?')) {
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    const cell = document.querySelector(`.cell[data-row="${i}"][data-col="${j}"]`);
                    cell.textContent = solution[i][j];
                    grid[i][j] = solution[i][j];
                    
                    if (!cell.classList.contains('fixed')) {
                        cell.classList.add('fixed');
                    }
                    
                    cell.classList.remove('error');
                }
            }
            
            clearInterval(timerInterval);
            showMessage('Puzzle solved!', 'success');
        }
    }
    
    // Reset the puzzle to initial state
    function resetPuzzle() {
        if (confirm('Are you sure you want to reset the puzzle?')) {
            for (let i = 0; i < 9; i++) {
                for (let j = 0; j < 9; j++) {
                    const cell = document.querySelector(`.cell[data-row="${i}"][data-col="${j}"]`);
                    
                    if (!cell.classList.contains('fixed')) {
                        cell.textContent = '';
                        grid[i][j] = 0;
                        cell.classList.remove('error');
                    }
                }
            }
            
            // Reset timer
            clearInterval(timerInterval);
            startTimer();
            
            showMessage('Puzzle reset to initial state', 'info');
        }
    }
    
    // Generate a new puzzle
    function generateNewPuzzle() {
        // Reset grid and solution
        grid = Array(9).fill().map(() => Array(9).fill(0));
        solution = Array(9).fill().map(() => Array(9).fill(0));
        
        // Generate a valid Sudoku solution
        generateSolution();
        
        // Create a playable puzzle by removing numbers
        createPlayablePuzzle();
        
        // Update the UI
        updateGridUI();
        
        // Start timer
        clearInterval(timerInterval);
        startTimer();
        
        // Clear any messages
        hideMessage();
        
        // Deselect any selected cell
        if (selectedCell) {
            selectedCell.classList.remove('selected');
            selectedCell = null;
        }
    }
    
    // Generate a valid Sudoku solution
    function generateSolution() {
        // This is a simplified approach - real Sudoku generators are more complex
        // For a real project, you might want to use a more robust algorithm
        
        // Base pattern
        const base = [1, 2, 3, 4, 5, 6, 7, 8, 9];
        
        // Create solution by shifting base pattern
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                solution[i][j] = base[(j + i * 3 + Math.floor(i / 3)) % 9];
            }
        }
        
        // Randomize the solution by swapping rows and columns
        for (let i = 0; i < 30; i++) {
            // Swap two rows within the same band
            const band = Math.floor(Math.random() * 3) * 3;
            const row1 = band + Math.floor(Math.random() * 3);
            let row2 = band + Math.floor(Math.random() * 3);
            while (row1 === row2) {
                row2 = band + Math.floor(Math.random() * 3);
            }
            
            // Swap rows
            for (let j = 0; j < 9; j++) {
                [solution[row1][j], solution[row2][j]] = [solution[row2][j], solution[row1][j]];
            }
            
            // Swap two columns within the same stack
            const stack = Math.floor(Math.random() * 3) * 3;
            const col1 = stack + Math.floor(Math.random() * 3);
            let col2 = stack + Math.floor(Math.random() * 3);
            while (col1 === col2) {
                col2 = stack + Math.floor(Math.random() * 3);
            }
            
            // Swap columns
            for (let j = 0; j < 9; j++) {
                [solution[j][col1], solution[j][col2]] = [solution[j][col2], solution[j][col1]];
            }
        }
    }
    
    // Create a playable puzzle by removing numbers
    function createPlayablePuzzle() {
        // Copy solution to grid
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                grid[i][j] = solution[i][j];
            }
        }
        
        // Remove numbers based on difficulty
        const cellsToRemove = difficultyLevels[difficulty];
        let removed = 0;
        
        while (removed < cellsToRemove) {
            const row = Math.floor(Math.random() * 9);
            const col = Math.floor(Math.random() * 9);
            
            if (grid[row][col] !== 0) {
                grid[row][col] = 0;
                removed++;
            }
        }
    }
    
    // Update the grid UI based on the current grid state
    function updateGridUI() {
        for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
                const cell = document.querySelector(`.cell[data-row="${i}"][data-col="${j}"]`);
                cell.textContent = grid[i][j] === 0 ? '' : grid[i][j];
                
                // Mark fixed cells (pre-filled)
                if (grid[i][j] !== 0) {
                    cell.classList.add('fixed');
                } else {
                    cell.classList.remove('fixed');
                }
                
                cell.classList.remove('error');
            }
        }
    }
    
    // Start the game timer
    function startTimer() {
        startTime = new Date();
        timerInterval = setInterval(updateTimer, 1000);
    }
    
    // Update the timer display
    function updateTimer() {
        const currentTime = new Date();
        const elapsedTime = new Date(currentTime - startTime);
        
        const minutes = elapsedTime.getMinutes().toString().padStart(2, '0');
        const seconds = elapsedTime.getSeconds().toString().padStart(2, '0');
        
        document.getElementById('time').textContent = `${minutes}:${seconds}`;
    }
    
    // Show a message to the user
    function showMessage(text, type) {
        const messageElement = document.getElementById('message');
        messageElement.textContent = text;
        messageElement.className = 'message';
        messageElement.classList.add(type);
    }
    
    // Hide the message
    function hideMessage() {
        document.getElementById('message').className = 'message';
    }
});
