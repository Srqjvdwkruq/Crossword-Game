// Global configurations
const CONFIG = {
    GAME_STATES: {
        PLAYING: 'playing',
        PAUSED: 'paused',
        COMPLETED: 'completed'
    },
    CELL_STATES: {
        EMPTY: 'empty',
        FILLED: 'filled',
        CORRECT: 'correct',
        INCORRECT: 'incorrect'
    },
    DIRECTIONS: {
        ACROSS: 'across',
        DOWN: 'down'
    }
};

// Base Game Class
class BaseGame {
    constructor() {
        // Core game elements
        this.gameState = CONFIG.GAME_STATES.PLAYING;
        this.score = 0;
        this.timer = 0;
        
        // Selected cell tracking
        this.selectedCell = null;
        this.selectedClueNumber = null;
        this.currentDirection = CONFIG.DIRECTIONS.ACROSS;
        
        // DOM elements
        this.board = document.getElementById('classicBoard');
        this.hintBox = document.querySelector('.hint-box');
        this.timerDisplay = document.querySelector('.timer');
        
        // Add word mapping
        this.wordMap = {};  // Will store word coordinates

        // Add  grid configuration
        this.gridConfig = {
            rows: 0,
            cols: 0,
            words: [], // Keep data for each words
            directions: {} // Keep direction for each word
        };

        // Add button elements
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.setupButtons();

        // Add confirm box elements
        this.confirmBox = document.getElementById('confirmBox');
        this.confirmMessage = document.getElementById('confirmMessage');
        this.confirmYes = document.getElementById('confirmYes');
        this.confirmNo = document.getElementById('confirmNo');
        this.setupConfirmBox();

        this.checkAnswerBtn = document.getElementById('checkansBtn');
        this.setupCheckAnswer();

        this.isCheckingAnswer = false;
        this.confirmAction = null; 
    }

    // Core utility functions
    initializeGame() {
        this.setupEventListeners();
        this.startTimer();
    }

    setupEventListeners() {
        // Add click events to all box2 cells
        const cells = document.querySelectorAll('.box2');
        cells.forEach(cell => {
            cell.addEventListener('click', () => this.handleCellClick(cell));
        });
    
        // Add input and keydown events to all spans in box2
        const spans = document.querySelectorAll('.box2 span');
        spans.forEach(span => {
            // Handle input for each span
            span.addEventListener('input', (e) => {
                const value = e.target.textContent.toUpperCase(); // Convert to uppercase
                e.target.textContent = value.charAt(0); // Limit to 1 character
    
                // Automatically move to the next cell
                const td = e.target.closest('td');
                const nextSpan = td.nextElementSibling?.querySelector('span');
                if (nextSpan) {
                    nextSpan.focus();
                }
            });
    
            // Handle backspace to move to the previous cell
            span.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && !e.target.textContent) {
                    const td = e.target.closest('td');
                    const prevSpan = td.previousElementSibling?.querySelector('span');
                    if (prevSpan) {
                        prevSpan.focus();
                    }
                }
            });
        });
    
        // Handle global keyboard events (like Tab)
        document.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'Tab':
                    e.preventDefault();
                    this.toggleDirection();
                    break;
                default:
                    if (/^[A-Za-z]$/.test(e.key)) {
                        this.handleLetterInput(e.key.toUpperCase());
                    }
            }
        });
    }
    

    // Timer functions
    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const minutes = Math.floor(elapsed / 60);
            const seconds = elapsed % 60;
            this.timerDisplay.textContent = 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    // Save/Load game state
    saveGameState() {
        const state = {
            board: this.getCurrentBoard(),
            timer: this.timer,
            score: this.score
        };
        localStorage.setItem('crosswordGameState', JSON.stringify(state));
    }

    loadGameState() {
        const savedState = localStorage.getItem('crosswordGameState');
        if (savedState) {
            const state = JSON.parse(savedState);
            this.restoreBoard(state.board);
            this.timer = state.timer;
            this.score = state.score;
        }
    }

    // Other utility functions that will be common across all categories
    toggleDirection() {
        this.currentDirection = this.currentDirection === CONFIG.DIRECTIONS.ACROSS ? 
            CONFIG.DIRECTIONS.DOWN : CONFIG.DIRECTIONS.ACROSS;
    }

    handleLetterInput(letter) {
        if (!this.selectedCell || this.gameState !== CONFIG.GAME_STATES.PLAYING) return;
    
        const span = this.selectedCell.querySelector('span');
        if (span) {
            span.textContent = letter;
    
            // Move to the next cell
            const nextCell = this.findNextCell();
            if (nextCell) {
                this.handleCellClick(nextCell);
            }
        }
    }
    
    // Get the next cell based on current direction
    findNextCell() {
        const td = this.selectedCell;
        const direction = this.currentDirection;
    
        if (direction === CONFIG.DIRECTIONS.ACROSS) {
            return td.nextElementSibling?.classList.contains('box2') ? td.nextElementSibling : null;
        } else if (direction === CONFIG.DIRECTIONS.DOWN) {
            const rowIndex = td.parentElement.rowIndex;
            const cellIndex = td.cellIndex;
            const table = td.closest('table');
            const nextRow = table.rows[rowIndex + 1];
            return nextRow?.cells[cellIndex]?.classList.contains('box2') ? nextRow.cells[cellIndex] : null;
        }
        return null;
    }
    

    handleCellClick(cell) {
        // Remove previous highlights
        document.querySelectorAll('.box2').forEach(c => {
            c.classList.remove('selected', 'highlight');
        });
        
        // Add selection highlight
        cell.classList.add('selected');
        this.selectedCell = cell;
        this.selectedClueNumber = cell.dataset.clue;
        
        // Find and highlight related cells in the same word
        if (this.selectedClueNumber) {
            this.highlightWord(cell);
            this.showHint();
        }
    }

    highlightWord(cell) {
        const clueNum = parseInt(cell.dataset.clue);
        
        if (clueNum) {
            const direction = this.gridConfig.directions[clueNum];
            
            switch(direction) {
                case 'across':
                    this.highlightAcrossWord(cell);
                    break;
                case 'down':
                    this.highlightDownWord(cell);
                    break;
            }
        } else {
            const hasHorizontal = this.checkHorizontalWord(cell.parentElement, cell.cellIndex);
            const hasVertical = this.checkVerticalWord(cell.closest('table'), cell.parentElement.rowIndex, cell.cellIndex);
            
            if (hasHorizontal) this.highlightAcrossWord(cell);
            if (hasVertical) this.highlightDownWord(cell);
        }
    }

    determineWordDirection(cell) {
        const clueNum = parseInt(cell.dataset.clue);
        
        const hasHorizontal = this.checkHorizontalWord(cell.parentElement, cell.cellIndex);
        const hasVertical = this.checkVerticalWord(cell.closest('table'), cell.parentElement.rowIndex, cell.cellIndex);
        
        if (hasHorizontal) return 'across';
        if (hasVertical) return 'down';
        
        return null;
    }

    checkHorizontalWord(row, cellIndex) {
        // Check left cell
        const prevCell = row.children[cellIndex - 1];
        const hasLeftCell = prevCell && prevCell.classList.contains('box2');
        
        // Check right cell
        const nextCell = row.children[cellIndex + 1];
        const hasRightCell = nextCell && nextCell.classList.contains('box2');
        
        return hasLeftCell || hasRightCell;
    }

    checkVerticalWord(table, rowIndex, cellIndex) {
        // Check cell above
        const aboveRow = table.rows[rowIndex - 1];
        const hasAboveCell = aboveRow && 
            aboveRow.children[cellIndex].classList.contains('box2');
        
        // Check cell below
        const belowRow = table.rows[rowIndex + 1];
        const hasBelowCell = belowRow && 
            belowRow.children[cellIndex].classList.contains('box2');
        
        return hasAboveCell || hasBelowCell;
    }

    highlightAcrossWord(cell) {
        const row = cell.parentElement;
        let currentCell = cell;
        
        // Highlight cells to the right
        while (currentCell && currentCell.classList.contains('box2')) {
            if (currentCell !== cell) currentCell.classList.add('highlight');
            currentCell = currentCell.nextElementSibling;
        }
        
        // Highlight cells to the left
        currentCell = cell.previousElementSibling;
        while (currentCell && currentCell.classList.contains('box2')) {
            currentCell.classList.add('highlight');
            currentCell = currentCell.previousElementSibling;
        }
    }

    highlightDownWord(cell) {
        const table = cell.closest('table');
        const rows = table.rows;
        const cellIndex = cell.cellIndex;
        let rowIndex = cell.parentElement.rowIndex;
        
        // Find the beginning of a word vertically
        while (rowIndex > 0 && rows[rowIndex - 1].cells[cellIndex].classList.contains('box2')) {
            rowIndex--;
        }
        
        // Highlight all vertical cells
        while (rowIndex < rows.length && rows[rowIndex].cells[cellIndex].classList.contains('box2')) {
            const currentCell = rows[rowIndex].cells[cellIndex];
            if (currentCell !== cell) {
                currentCell.classList.add('highlight');
            }
            rowIndex++;
        }
    }

    initializeWordMap() {
        // Map clue numbers to cell coordinates
        const cells = document.querySelectorAll('.box2');
        cells.forEach(cell => {
            if (cell.dataset.clue) {
                const clueNumber = cell.dataset.clue;
                const word = this.answers[clueNumber];
                if (word) {
                    // Mark all cells belonging to this word
                    let currentCell = cell;
                    for (let i = 0; i < word.length; i++) {
                        currentCell.dataset.word = clueNumber;
                        currentCell = this.getNextCell(currentCell);
                    }
                }
            }
        });
    }

    getNextCell(cell) {
        // Find next cell based on word direction
        const row = cell.parentElement;
        const cellIndex = Array.from(row.children).indexOf(cell);
        
        if (this.isVerticalWord(cell)) {
            const nextRow = row.nextElementSibling;
            return nextRow ? nextRow.children[cellIndex] : null;
        } else {
            return row.children[cellIndex + 1];
        }
    }

    isVerticalWord(cell) {
        // Check if word is vertical by looking at next row
        const row = cell.parentElement;
        const cellIndex = Array.from(row.children).indexOf(cell);
        const nextRow = row.nextElementSibling;
        return nextRow && nextRow.children[cellIndex].classList.contains('box2');
    }

    setGridConfig(config) {
        this.gridConfig = {
            ...this.gridConfig,
            ...config
        };
        
        this.initializeWordDirections();
    }

    initializeWordDirections() {
        this.gridConfig.words.forEach(word => {
            this.gridConfig.directions[word.clueNumber] = word.direction;
        });
    }

    setupButtons() {
        this.clearAllBtn.addEventListener('click', () => this.handleClearAll());
    }

    setupConfirmBox() {
        this.confirmYes.addEventListener('click', () => {
            this.hideConfirmBox();
            if (this.confirmAction) {
                this.confirmAction(); 
                this.confirmAction = null;
            }
        });
        
        this.confirmNo.addEventListener('click', () => {
            this.hideConfirmBox();
            this.confirmAction = null;
            if (this.wasPlaying) {
                this.gameState = CONFIG.GAME_STATES.PLAYING;
            }
        });
    }

    showConfirmBox(message) {
        this.confirmMessage.textContent = message;
        this.confirmBox.style.display = 'flex';
    }

    hideConfirmBox() {
        this.confirmBox.style.display = 'none';
    }

    handleClearAll() {
        this.wasPlaying = this.gameState === CONFIG.GAME_STATES.PLAYING;
        if (this.wasPlaying) {
            this.gameState = CONFIG.GAME_STATES.PAUSED;
        }
        
        this.confirmAction = () => this.executeClearAll();
        this.showConfirmBox('Are you sure you want to clear all entries?');
    }

    executeClearAll() {
        // Clear all cells
        document.querySelectorAll('.box2').forEach(cell => {
            const span = cell.querySelector('span');
            if (span) {
                span.textContent = '';
            }
            cell.classList.remove('correct', 'incorrect', 'selected', 'highlight');
            cell.removeAttribute('readonly');
        });

        // Reset gmae state
        this.score = 0;
        this.completedWords = 0;
        this.mistakes = 0;

        // Clear selected cell
        this.selectedCell = null;
        this.selectedClueNumber = null;

        // Clear hint box
        if (this.hintBox) {
            this.hintBox.style.backgroundImage = '';
        }

        // Restart the timer if it was playing previously.
        if (this.wasPlaying) {
            this.gameState = CONFIG.GAME_STATES.PLAYING;
        }
    }

    setupCheckAnswer() {
        this.checkAnswerBtn.addEventListener('click', () => this.handleCheckAnswer());
    }

    handleCheckAnswer() {
        const allCells = document.querySelectorAll('.box2');
        const emptyCells = Array.from(allCells).filter(cell => {
            const span = cell.querySelector('span');
            return !span || !span.textContent.trim();
        });

        if (emptyCells.length > 0) {
            this.showConfirmBox('Please fill in all cells before checking answers.');
            return;
        }

        this.confirmAction = () => this.checkAnswers();
        this.showConfirmBox('Do you want to check your answers?');
    }

    checkAnswers() {
        // Stop time
        clearInterval(this.timerInterval);
        
        let correctCount = 0;
        let totalWords = this.gridConfig.words.length;
        const finalTime = this.timerDisplay.textContent;

        this.gridConfig.words.forEach(wordConfig => {
            const cells = this.getWordCells(wordConfig);
            const userAnswer = cells.map(cell => {
                const span = cell.querySelector('span');
                return span ? span.textContent : '';
            }).join('');

            const isCorrect = userAnswer === wordConfig.word;
            
            cells.forEach(cell => {
                cell.classList.remove('correct', 'incorrect');
                cell.classList.add(isCorrect ? 'correct' : 'incorrect');
            });

            if (isCorrect) correctCount++;
        });

        // Calculate score
        const score = Math.round((correctCount / totalWords) * 100);
        this.showConfirmBox(
            `Time: ${finalTime}\n` +
            `Your score: ${score}%\n` +
            `Correct words: ${correctCount}/${totalWords}`
        );

        // Reset time
        this.timerDisplay.textContent = '00:00';
        this.gameState = CONFIG.GAME_STATES.COMPLETED;
    }

    // Add fuction to reset game
    resetGame() {
        this.executeClearAll();
        this.startTimer();
        this.gameState = CONFIG.GAME_STATES.PLAYING;
    }

    getWordCells(wordConfig) {
        const startCell = document.querySelector(`.box2[data-clue="${wordConfig.clueNumber}"]`);
        if (!startCell) return [];

        const cells = [startCell];
        let currentCell = startCell;

        for (let i = 1; i < wordConfig.word.length; i++) {
            if (wordConfig.direction === 'across') {
                currentCell = currentCell.nextElementSibling;
            } else if (wordConfig.direction === 'down') {
                const nextRow = currentCell.parentElement.nextElementSibling;
                currentCell = nextRow.cells[currentCell.cellIndex];
            }
            if (currentCell) cells.push(currentCell);
        }

        return cells;
    }
}

// Export configurations and base class
window.CONFIG = CONFIG;
window.BaseGame = BaseGame;
