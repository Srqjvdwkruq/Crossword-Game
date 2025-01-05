import { 
    RACK_SIZE, 
    LETTER_DATA,
    utils,
    updateTileBagCounts 
} from './scrabbleMain.js';

class Player {
    constructor(name, letterManager) {
        this.name = name;
        this.score = 0;
        this.rack = new PlayerRack(letterManager);
        this.isActive = false;
        this.timeLeft = 15 * 60; // 15 minutes in seconds
    }

    updateScore(points) {
        this.score += points;
        document.getElementById(`${this.name.toLowerCase()}Score`).textContent = this.score;
    }

    setActive(active) {
        this.isActive = active;
        const section = document.querySelector(`.${this.name.toLowerCase()}-section`);
        if (section) {
            if (active) {
                section.classList.add('active');
            } else {
                section.classList.remove('active');
            }
        }
    }
}

class PlayerRack {
    constructor(letterManager) {
        this.letters = [];
        this.placedLetters = new Map();
        this.maxLetters = RACK_SIZE;
        this.letterManager = letterManager;
        this.fillInitialRack();
    }

    fillInitialRack() {
        while (this.letters.length < this.maxLetters) {
            const letter = this.letterManager.getRandomLetter();
            if (letter) {
                this.letters.push(letter);
            }
        }
    }

    // เพิ่มตัวอักษรใหม่จนเต็มแร็ค
    fillRack() {
        while (this.letters.length < this.maxLetters) {
            const letter = this.letterManager.getRandomLetter();
            if (letter) {
                this.letters.push(letter);
            } else {
                break;
            }
        }
    }

    // ลบตัวอักษรจากแร็ค
    removeLetter(letter) {
        const index = this.letters.indexOf(letter);
        if (index > -1) {
            this.letters.splice(index, 1);
            return true;
        }
        return false;
    }

    // สลับตัวอักษรในแร็ค
    swap(lettersToSwap) {
        // คืนตัวอักษรเก่าไปที่ถุง
        lettersToSwap.forEach(letter => {
            LETTER_DATA[letter].count++;
            this.removeLetter(letter);
        });

        // จั่วตัวอักษรใหม่
        this.fillRack();
        updateTileBagCounts();
    }
}

class MultiplayerGameManager {
    constructor(letterManager) {
        this.players = [
            new Player('Player1', letterManager),
            new Player('Player2', letterManager)
        ];
        this.currentPlayerIndex = 0;
        this.isGameOver = false;
        this.initializeGame();
    }

    initializeGame() {
        this.setActivePlayer(0);
        this.updateUI();
        this.startTimer();
    }

    setActivePlayer(index) {
        this.players.forEach((player, i) => {
            player.setActive(i === index);
        });
        this.currentPlayerIndex = index;
    }

    switchTurn() {
        const nextIndex = (this.currentPlayerIndex + 1) % this.players.length;
        this.setActivePlayer(nextIndex);
        this.updateUI();
    }

    updateUI() {
        const currentPlayer = this.players[this.currentPlayerIndex];
        
        // Update turn indicator
        document.querySelectorAll('.player-section').forEach(section => {
            section.classList.remove('active');
        });
        document.querySelector(`.${currentPlayer.name.toLowerCase()}-section`).classList.add('active');

        // Update scores
        this.players.forEach(player => {
            const scoreElement = document.getElementById(`${player.name.toLowerCase()}Score`);
            if (scoreElement) {
                scoreElement.textContent = player.score;
            }
        });

        // Enable/disable buttons for current player
        const actionButtons = ['skipBtn', 'swapBtn', 'submitBtn'];
        actionButtons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.disabled = !this.isCurrentPlayer(this.currentPlayerIndex);
                btn.style.opacity = this.isCurrentPlayer(this.currentPlayerIndex) ? '1' : '0.5';
            }
        });
    }

    isCurrentPlayer(index) {
        return index === this.currentPlayerIndex;
    }

    startTimer() {
        setInterval(() => {
            const currentPlayer = this.players[this.currentPlayerIndex];
            if (!this.isGameOver) {
                currentPlayer.timeLeft--;
                this.updateTimeDisplay(currentPlayer);
                if (currentPlayer.timeLeft <= 0) {
                    this.endGame();
                }
            }
        }, 1000);
    }

    updateTimeDisplay(player) {
        const minutes = Math.floor(player.timeLeft / 60);
        const seconds = player.timeLeft % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById(`${player.name.toLowerCase()}Time`).textContent = timeString;
    }

    endGame() {
        this.isGameOver = true;
        const winner = this.determineWinner();
        this.showGameOverScreen(winner);
    }

    determineWinner() {
        let highestScore = -1;
        let winner = null;

        this.players.forEach(player => {
            if (player.score > highestScore) {
                highestScore = player.score;
                winner = player;
            }
        });

        return winner;
    }

    showGameOverScreen(winner) {
        const scoreScreen = document.querySelector('.score-screen');
        const scoreContent = document.querySelector('.score-content');
        
        let scoresHTML = '';
        this.players.forEach(player => {
            scoresHTML += `
                <div class="score-item">
                    <h3>${player.name}</h3>
                    <div class="score">${player.score}</div>
                </div>
            `;
        });

        scoreContent.innerHTML = `
            <h2>Game Over!</h2>
            <div class="final-scores">
                ${scoresHTML}
            </div>
            <div class="winner-text">
                ${winner ? `${winner.name} Wins!` : "It's a Tie!"}
            </div>
            <div class="score-buttons">
                <button class="game-btn primary" id="rematchBtn">Rematch</button>
                <button class="game-btn" id="homeBtn">Home</button>
            </div>
        `;

        scoreScreen.classList.add('active');

        // Add button event listeners
        document.getElementById('rematchBtn').addEventListener('click', () => {
            window.location.reload();
        });

        document.getElementById('homeBtn').addEventListener('click', () => {
            window.location.href = '../index.html';
        });
    }
}

// Initialize multiplayer game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('multisb_cw.html')) {
        const letterManager = new LetterManager();
        window.gameManager = new MultiplayerGameManager(letterManager);
    }
});

// Export necessary classes
export { MultiplayerGameManager, Player, PlayerRack };
