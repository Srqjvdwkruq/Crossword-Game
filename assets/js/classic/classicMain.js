class GameManager {
    constructor() {
        // Timer elements
        this.timerDisplay = document.querySelector('.timer');
        this.startTime = null;
        this.timerInterval = null;

        // Button elements
        this.clearAllBtn = document.getElementById('clearAllBtn');
        this.checkAnswerBtn = document.getElementById('checkansBtn');
        this.menuBtn = document.getElementById('menuBtn');
        this.continueBtn = document.getElementById('continueBtn');
        this.quitBtn = document.getElementById('quitBtn');

        // Game state
        this.isPlaying = false;
        this.isPaused = false;

        this.initializeButtons();
    }

    // Timer functions
    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => this.updateTimer(), 1000);
        this.isPlaying = true;
    }

    pauseTimer() {
        clearInterval(this.timerInterval);
        this.isPaused = true;
    }

    resumeTimer() {
        if (this.isPaused) {
            this.timerInterval = setInterval(() => this.updateTimer(), 1000);
            this.isPaused = false;
        }
    }

    updateTimer() {
        const currentTime = Date.now();
        const elapsedTime = Math.floor((currentTime - this.startTime) / 1000);
        const minutes = Math.floor(elapsedTime / 60);
        const seconds = elapsedTime % 60;
        this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    // Button handlers
    initializeButtons() {
        this.clearAllBtn.addEventListener('click', () => this.handleClearAll());
        this.checkAnswerBtn.addEventListener('click', () => this.handleCheckAnswer());
        this.menuBtn.addEventListener('click', () => this.handleMenuClick());
        this.continueBtn.addEventListener('click', () => this.handleContinue());
        this.quitBtn.addEventListener('click', () => this.handleQuit());
    }
    
    handleClearAll() {
        const cells = document.querySelectorAll('.box2');
        cells.forEach(cell => {
            cell.textContent = '';
            cell.classList.remove('correct', 'incorrect');
        });
    }

    handleMenuClick() {
        this.pauseTimer();
        this.showConfirmBox();
    }

    handleContinue() {
        this.hideConfirmBox();
        this.resumeTimer();
    }

    handleQuit() {
        // Save game state if needed
        window.location.href = '../index.html';
    }

    // Utility functions
    showConfirmBox() {
        document.getElementById('confirmBox').style.display = 'flex';
    }

    hideConfirmBox() {
        document.getElementById('confirmBox').style.display = 'none';
    }
}

// Export for global use
window.GameManager = GameManager;
