import { 
    RACK_SIZE, 
    GRID_SIZE, 
    LETTER_DATA, 
    INITIAL_LETTER_DATA,
    utils, 
    updateTileBagCounts 
} from './scrabbleMain.js';

export class BotRack {
    constructor(letterManager) {
        this.letters = [];
        this.maxLetters = RACK_SIZE;
        this.letterManager = letterManager;
        this.fillInitialRack();
        this.updateDisplay();
    }

    fillInitialRack() {
        console.log('Starting bot initial rack fill...');
        let attempts = 0;
        const maxAttempts = 5;

        while (this.letters.length < this.maxLetters && attempts < maxAttempts) {
            const letter = this.letterManager.getRandomLetter();
            if (letter) {
                this.letters.push(letter);
            } else {
                console.warn(`Failed to get letter, attempt ${attempts + 1}/${maxAttempts}`);
                attempts++;
                if (attempts >= maxAttempts) {
                    console.error('Max attempts reached, forcing reset');
                    this.letters = [];
                    resetLetterData();
                    attempts = 0;
                }
            }
        }

        // Check if all letters are obtained
        if (this.letters.length === this.maxLetters) {
            console.log('Bot rack filled successfully:', this.letters);
        } else {
            console.error('Failed to fill bot rack:', this.letters);
        }
    }

    fillRack() {
        const neededLetters = this.maxLetters - this.letters.length;
        console.log(`Filling bot rack, need ${neededLetters} letters`);
        
        for (let i = 0; i < neededLetters; i++) {
            const letter = this.letterManager.getRandomLetter();
            if (letter) {
                this.letters.push(letter);
            } else {
                console.warn('Could not get letter from bag');
                break;
            }
        }

        this.updateDisplay();
        console.log('Bot rack after fill:', this.letters);
    }

    updateDisplay() {
        const botRack = document.getElementById('bot-rack');
        if (botRack) {
            botRack.innerHTML = '';
            this.letters.forEach(letter => {
                const tile = document.createElement('div');
                tile.className = 'bot-tile';
                tile.textContent = letter;
                botRack.appendChild(tile);
            });
        }
    }

    removeLetter(letter) {
        // Find letter ignoring case
        const index = this.letters.findIndex(l => l.toUpperCase() === letter.toUpperCase());
        if (index > -1) {
            this.letters.splice(index, 1);
            this.updateDisplay();
            return true;
        }
        console.log('Failed to remove letter:', letter, 'Current rack:', this.letters);
        return false;
    }

    removeLetters(letters) {
        let success = true;
        // Create a copy of letters array to avoid affecting the original
        const lettersToRemove = [...letters];
        
        for (const letter of lettersToRemove) {
            if (!this.removeLetter(letter)) {
                console.log(`Failed to remove letter ${letter}`);
                success = false;
                break;
            }
        }
        
        // If removal fails, restore previously removed letters
        if (!success) {
            const removedCount = lettersToRemove.length - this.letters.length;
            if (removedCount > 0) {
                // Add removed letters back to rack
                this.letters.push(...letters.slice(0, removedCount));
                this.updateDisplay();
            }
        }
        
        return success;
    }
    
}

export class ScrabbleBot {
    constructor(board, letterManager, controls) {
        this.board = board;
        this.rack = new BotRack(letterManager);
        this.controls = controls;
        this.letterManager = letterManager;
        this.wordValidator = board.wordValidator;
        this.validWords = new Set(); 
        this.maxAttempts = 20;
        this.preferredMinLength = 2;
        this.strategy = {
            early: { minLength: 2 },
            mid: { minLength: 3 },
            late: { minLength: 3 }
        };
        this.swapCount = 0; // Add counter for swap attempts
        this.maxSwapAttempts = Infinity; // Set unlimited swap attempts
        
        // Add validation
        if (!this.wordValidator) {
            console.error('WordValidator not initialized');
        }
    }

    // Add this new method
    hasAvailableLetters(word) {
        const letterCounts = {};
        // Create frequency map of rack letters
        this.rack.letters.forEach(letter => {
            letterCounts[letter] = (letterCounts[letter] || 0) + 1;
        });

        // Check if we have enough of each letter
        for (const letter of word) {
            if (!letterCounts[letter] || letterCounts[letter] <= 0) {
                return false;
            }
            letterCounts[letter]--;
        }
        return true;
    }

    async findPossibleWordsFromRack() {
        const rackLetters = this.rack.letters.join('');
        const availableWords = new Set();
        const startTime = Date.now();

        // Start from short to long words for better chances of finding valid words
        for (let length = 2; length <= this.rack.letters.length; length++) {
            const combinations = this.generateCombinations(this.rack.letters, length);
            for (const combo of combinations) {
                // เช็คว่าเป็นคำที่มีในพจนานุกรมหรือไม่
                if (this.wordValidator.dictionary.has(combo.toUpperCase())) {
                    availableWords.add(combo);
                }
                if (Date.now() - startTime > 3000) break;
            }
        }

        // เรียงลำดับคำตามเกณฑ์
        const sortedWords = Array.from(availableWords).sort((a, b) => {
            const scoreA = this.calculatePotentialScore(a);
            const scoreB = this.calculatePotentialScore(b);
            return scoreB - scoreA;
        });

        console.log(`Found ${sortedWords.length} possible words:`, sortedWords);
        return sortedWords;
    }

    canMakeWordWithLetters(word, rackLetters) {
        const letterCounts = {};
        [...rackLetters].forEach(letter => {
            letterCounts[letter] = (letterCounts[letter] || 0) + 1;
        });

        for (const letter of word) {
            if (!letterCounts[letter] || letterCounts[letter] <= 0) {
                return false;
            }
            letterCounts[letter]--;
        }

        return true;
    }

    async placeBestWord() {
        try {
            const boardState = this.getBoardState();
            const anchorPoints = this.findAnchors(boardState); // ค้นหา Anchor Points
            console.log('Anchor points:', anchorPoints);
    
            const possibleWords = await this.findPossibleWordsFromRack(); // คำศัพท์จากแร็ค
            console.log('Possible words:', possibleWords);
    
            if (possibleWords.length === 0) {
                console.log('No possible words from rack');
                return false;
            }
    
            let bestMove = null;
            let bestScore = -1;
    
            for (const anchor of anchorPoints) {
                for (const word of possibleWords) {
                    for (const isHorizontal of [true, false]) {
                        const move = {
                            word,
                            row: anchor.row,
                            col: anchor.col,
                            isHorizontal
                        };
                        if (await this.validateMove(move)) {
                            const score = this.calculateMoveScore(word, anchor.row, anchor.col, isHorizontal);
                            if (score > bestScore) {
                                bestScore = score;
                                bestMove = move;
                            }
                        }
                    }
                }
            }
    
            if (bestMove) {
                console.log('Best move:', bestMove);
                return await this.executeMove(bestMove);
            }
    
            console.log('No valid moves found');
            return false;
        } catch (error) {
            console.error('Error in placeBestWord:', error);
            return false;
        }
    }
    

    findBestPositionForWord(word, boardState) {
        let bestMove = null;
        let bestScore = -1;

        // ลองทุกตำแหน่งบนบอร์ด
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                // ลองวางทั้งแนวนอนและแนวตั้ง
                for (const isHorizontal of [true, false]) {
                    if (this.isValidPositionForWord(word, row, col, isHorizontal, boardState)) {
                        const score = this.calculateMoveScore(word, row, col, isHorizontal);
                        if (score > bestScore) {
                            bestScore = score;
                            bestMove = { word, row, col, isHorizontal, score };
                        }
                    }
                }
            }
        }

        return bestMove;
    }

    async makeMove() {
        if (window.gameManager.isPlayerTurn) {
            console.warn('Not bot turn');
            return;
        }
    
        console.log('Bot making move...', this.rack.letters);
        
        try {
            const boardState = this.getBoardState();
            const possibleWords = await this.findPossibleWordsFromRack();
            let success = false;
            
            if (possibleWords.length > 0) {
                // ลองหา moves ที่เป็นไปได้ทั้งหมดทั้งแนวตั้งและแนวนอน
                const moves = await this.findAllPossibleMoves(boardState, possibleWords);
                
                if (moves.length > 0) {
                    // สลับระหว่างแนวตั้งและแนวนอน
                    const alternatingMoves = this.alternateDirections(moves);
                    // เลือก move ที่ดีที่สุด
                    const bestMove = alternatingMoves[0];
                    success = await this.executeMove(bestMove);
                }
            }

            if (!success) {
                console.log('Bot could not find valid move, attempting to swap...');
                await this.swapBotLetters();
            } else {
                this.finishTurn();
            }

        } catch (error) {
            console.error('Error during bot move:', error);
            await this.swapBotLetters();
        }
    }

    async findBestMove(boardState, possibleWords) {
        const centerPos = Math.floor(GRID_SIZE / 2);
        let bestMove = null;
        let bestScore = -1;

        // หา anchor points ทั้งหมดที่สามารถวางได้ 
        const anchorPoints = this.findAnchors(boardState);
        
        // ถ้าบอร์ดว่าง ให้เพิ่มจุดกลางเป็น anchor point
        if (this.isFirstMove(boardState)) {
            anchorPoints.push({
                row: centerPos,
                col: centerPos,
                adjacentLetters: {}
            });
        }

        // ลองวางทุกคำที่เป็นไปได้ในทุกตำแหน่ง
        for (const anchor of anchorPoints) {
            for (const word of possibleWords) {
                for (const isHorizontal of [true, false]) {
                    const move = {
                        word,
                        row: anchor.row,
                        col: anchor.col, 
                        isHorizontal
                    };

                    if (await this.validateMove(move)) {
                        const score = this.calculateMoveScore(word, anchor.row, anchor.col, isHorizontal);
                        if (score > bestScore) {
                            bestScore = { ...move, score };
                        }
                    }
                }
            }
        }

        return bestMove;
    }

    async handleNoWords() {
        if (this.swapCount < this.maxSwapAttempts) {
            console.log('Bot attempting to swap letters...');
            await this.swapBotLetters();
        } else {
            console.log('Bot must skip turn');
            this.executeSkip();
        }
    }

    async handleFailedMove() {
        if (this.swapCount < this.maxSwapAttempts) {
            await this.swapBotLetters();
        }
        this.executeSkip();
    }

    finishTurn() {
        if (!window.gameManager) {
            console.error('GameManager not found');
            return;
        }

        // อัปเดต UI และสถานะ
        document.querySelector('.bot-section')?.classList.remove('active');
        document.querySelector('.player-section')?.classList.add('active');
        window.gameManager.isPlayerTurn = true;
        window.gameManager.updateActionButtons();
        window.gameManager.updateTurnIndicator();
        console.log('Bot finished turn');
    }

    hasGoodLetters() {
        const letters = this.rack.letters;
        // มีทั้งสระและพยัญชนะ
        const hasVowel = letters.some(l => 'AEIOU'.includes(l));
        const hasConsonant = letters.some(l => !'AEIOU'.includes(l));
        
        // มีตัวอักษรที่มีคะแนนสูง
        const hasHighValue = letters.some(l => {
            const score = LETTER_DATA[l]?.score || 0;
            return score >= 8;
        });

        // มีตัวอักษรที่ใช้บ่อย
        const hasCommonLetters = letters.some(l => 'ETAOINSHRDLU'.includes(l));

        return (hasVowel && hasConsonant) || hasHighValue || hasCommonLetters;
    }

    async _makeMove() {
        if (window.gameManager && window.gameManager.isPlayerTurn) {
            console.warn('Bot attempted to move during player turn');
            return;
        }

        try {
            let success = false;
            
            if (this.isFirstMove(this.getBoardState())) {
                console.log('Bot making first move');
                const firstMove = await this.findBestFirstMove();
                if (firstMove) {
                    success = await this.executeMove(firstMove);
                }
            } else {
                success = await this.tryNormalMove();
            }

            if (success) {
                this.rack.fillRack();
                this.finishTurn();
            } else {
                await this.handleFailedMove();
            }
        } catch (error) {
            console.error('Error in bot move:', error);
            this.handleFailedMove();
        }
    }

    async tryNormalMove() {
        const possibleMoves = await this.findPossibleMoves();
        for (const move of possibleMoves) {
            if (await this.executeMove(move)) {
                return true;
            }
        }
        return false;
    }

    async handleFailedMove() {
        if (this.swapCount < this.maxSwapAttempts) {
            await this.swapBotLetters();
        }
        this.executeSkip();
    }

    finishTurn() {
        if (!window.gameManager) {
            console.error('GameManager not found');
            return;
        }

        try {
            // อัปเดต UI ก่อนเปลี่ยนเทิร์น
            document.querySelector('.bot-section')?.classList.remove('active');
            document.querySelector('.player-section')?.classList.add('active');

            // เปลี่ยนสถานะเกม
            window.gameManager.isPlayerTurn = true;

            // อัปเดต UI
            window.gameManager.updateActionButtons();
            window.gameManager.updateTurnIndicator();

            console.log('Bot finished turn');
        } catch (error) {
            console.error('Error in finishTurn:', error);
        }
    }

    async findBestFirstMove() {
        const centerPos = Math.floor(GRID_SIZE / 2);
        console.log('Bot attempting first move with letters:', this.rack.letters);

        // หาคำที่สามารถสร้างได้จาก rack
        const possibleWords = await this.findPossibleWordsFromRack();
        console.log('Possible words for first move:', possibleWords);

        // หาคำที่เหมาะสมสำหรับวางตรงกลาง
        const centerMoves = this.findCenterWordCandidates(possibleWords, centerPos);
        
        if (centerMoves.length > 0) {
            console.log('Found valid center moves:', centerMoves);
            // เลือกคำที่ดีที่สุดจากตัวเลือกที่มี
            return this.selectBestCenterMove(centerMoves);
        }

        console.log('No valid center moves found');
        return null;
    }

    findCenterWordCandidates(words, centerPos) {
        const candidates = [];
        
        for (const word of words) {
            if (word.length >= 2) {
                // ลองทั้งแนวนอนและแนวตั้ง
                for (const isHorizontal of [true, false]) {
                    for (let offset = 0; offset < word.length; offset++) {
                        // คำนวณตำแหน่งตามทิศทาง
                        const pos = centerPos - offset;
                        if (pos >= 0 && pos + word.length <= GRID_SIZE) {
                            if (pos <= centerPos && pos + word.length > centerPos) {
                                candidates.push({
                                    word,
                                    row: isHorizontal ? centerPos : pos,
                                    col: isHorizontal ? pos : centerPos,
                                    isHorizontal,
                                    score: this.calculateWeightedFirstMoveScore(
                                        word, 
                                        isHorizontal ? centerPos : pos,
                                        isHorizontal ? pos : centerPos,
                                        isHorizontal
                                    )
                                });
                            }
                        }
                    }
                }
            }
        }
        
        return candidates;
    }

    selectBestCenterMove(moves) {
        // เรียงลำดับตามคะแนน
        moves.sort((a, b) => {
            // ให้ความสำคัญกับคำที่ยาวกว่า
            const lengthDiff = b.word.length - a.word.length;
            if (lengthDiff !== 0) return lengthDiff;
            
            // ถ้าความยาวเท่ากัน ใช้คะแนน
            return b.score - a.score;
        });
        
        return moves[0];
    }

    calculateWeightedFirstMoveScore(word, centerPos, startCol) {
        let score = this.calculateMoveScore(word, centerPos, startCol, true);
        
        // โบนัสพิเศษสำหรับการเล่นครั้งแรก (ลบ length bonus ออก)
        const bonuses = {
            highValue: /[QZJX]/.test(word) ? 10 : 0,  // โบนัสตัวอักษรที่มีคะแนนสูง
            balance: this.getLetterBalanceBonus(word), // โบนัสสำหรับการใช้ทั้งสระและพยัญชนะ
            centerCoverage: this.getCenterCoverageBonus(word.length) // โบนัสการครอบคลุมจุดศูนย์กลาง
        };
        
        score += Object.values(bonuses).reduce((sum, bonus) => sum + bonus, 0);
        
        return score;
    }

    getLetterBalanceBonus(word) {
        const vowels = (word.match(/[AEIOU]/g) || []).length;
        const consonants = word.length - vowels;
        // ให้โบนัสมากที่สุดเมื่อมีสัดส่วนสระต่อพยัญชนะที่สมดุล
        return Math.min(vowels, consonants) * 3;
    }

    getCenterCoverageBonus(wordLength) {
        // ให้โบนัสตามจำนวนช่องที่คำครอบคลุมหลังจุดศูนย์กลาง
        return Math.min(wordLength - 2, 3) * 5;
    }

    async validateMove(move) {
        if (!move || !move.word) return false;
        
        console.log('Validating move:', move);
        
        // Check if we have required letters
        if (!this.hasAvailableLetters(move.word)) {
            console.log('Not enough letters for word:', move.word);
            return false;
        }

        const { row, col, isHorizontal, word } = move;
        const boardState = this.getBoardState();

        // First move validation
        if (this.isFirstMove(boardState)) {
            return this.isValidFirstMove(move);
        }

        // Create temporary board state
        const tempBoard = boardState.map(row => [...row]);
        
        // Place the word on temporary board
        for (let i = 0; i < word.length; i++) {
            const currentRow = isHorizontal ? row : row + i;
            const currentCol = isHorizontal ? col + i : col;
            
            if (!this.isValidPosition(currentRow, currentCol)) {
                console.log('Invalid position:', currentRow, currentCol);
                return false;
            }

            // Check if position is already occupied
            if (tempBoard[currentRow][currentCol]) {
                if (tempBoard[currentRow][currentCol] !== word[i]) {
                    console.log('Letter conflict at position:', i);
                    return false;
                }
                continue;
            }
            
            tempBoard[currentRow][currentCol] = word[i];
        }

        // Find all words formed by this move
        const formedWords = this.findAllFormedWords(tempBoard, row, col, word.length, isHorizontal);
        console.log('Formed words:', formedWords);

        // Validate each formed word
        for (const formedWord of formedWords) {
            if (!await this.wordValidator.validateWord(formedWord)) {
                console.log('Invalid word formed:', formedWord);
                return false;
            }
        }

        return true;
    }

    findAllFormedWords(boardState, startRow, startCol, length, isHorizontal) {
        const words = new Set();
        
        // Get the main word
        let mainWord = '';
        let mainRow = startRow;
        let mainCol = startCol;
        
        // Move to start of main word
        while (this.isValidPosition(
            isHorizontal ? mainRow : mainRow - 1, 
            isHorizontal ? mainCol - 1 : mainCol
        ) && boardState[
            isHorizontal ? mainRow : mainRow - 1
        ][
            isHorizontal ? mainCol - 1 : mainCol
        ]) {
            if (isHorizontal) {
                mainCol--;
            } else {
                mainRow--;
            }
        }
        
        // Read the complete main word
        let tempRow = mainRow;
        let tempCol = mainCol;
        while (this.isValidPosition(tempRow, tempCol) && 
               boardState[tempRow][tempCol]) {
            mainWord += boardState[tempRow][tempCol];
            if (isHorizontal) {
                tempCol++;
            } else {
                tempRow++;
            }
        }
        
        if (mainWord.length > 1) {
            words.add(mainWord);
        }

        // Find perpendicular words
        for (let i = 0; i < length; i++) {
            const currentRow = isHorizontal ? startRow : startRow + i;
            const currentCol = isHorizontal ? startCol + i : startCol;
            
            // Skip if this position uses an existing letter
            if (boardState[currentRow][currentCol] === null) {
                continue;
            }

            let crossWord = '';
            let crossRow = currentRow;
            let crossCol = currentCol;

            // Move to start of perpendicular word
            while (this.isValidPosition(
                isHorizontal ? crossRow - 1 : crossRow, 
                isHorizontal ? crossCol : crossCol - 1
            ) && boardState[
                isHorizontal ? crossRow - 1 : crossRow
            ][
                isHorizontal ? crossCol : crossCol - 1
            ]) {
                if (isHorizontal) {
                    crossRow--;
                } else {
                    crossCol--;
                }
            }

            // Read the complete perpendicular word
            tempRow = crossRow;
            tempCol = crossCol;
            while (this.isValidPosition(tempRow, tempCol) && 
                   boardState[tempRow][tempCol]) {
                crossWord += boardState[tempRow][tempCol];
                if (isHorizontal) {
                    tempRow++;
                } else {
                    tempCol++;
                }
            }

            if (crossWord.length > 1) {
                words.add(crossWord);
            }
        }

        return Array.from(words);
    }

    async findPossibleWordsFromPosition(row, col, isHorizontal, boardState) {
        const words = [];
        const maxLength = isHorizontal ? GRID_SIZE - col : GRID_SIZE - row;
        
        // Get existing prefix/suffix if any
        const prefix = this.getExistingPrefix(row, col, isHorizontal, boardState);
        const suffix = this.getExistingSuffix(row, col, isHorizontal, boardState);

        // Get cross-check constraints
        const crossChecks = this.getCrossChecks(row, col, isHorizontal, boardState);

        for (const word of this.wordValidator.dictionary) {
            // Skip words that are too long
            if (word.length > maxLength) continue;

            // Check if word matches existing prefix/suffix
            if (prefix && !word.startsWith(prefix)) continue;
            if (suffix && !word.endsWith(suffix)) continue;

            // Check if word satisfies cross-check constraints
            let isValid = true;
            for (let i = 0; i < word.length; i++) {
                if (crossChecks[i] && !crossChecks[i].includes(word[i])) {
                    isValid = false;
                    break;
                }
            }

            if (isValid && this.hasAvailableLetters(word)) {
                words.push(word);
            }
        }

        return words;
    }

    getExistingPrefix(row, col, isHorizontal, boardState) {
        let prefix = '';
        let pos = isHorizontal ? col - 1 : row - 1;
        
        while (pos >= 0) {
            const letter = isHorizontal ? 
                boardState[row][pos] : 
                boardState[pos][col];
            if (!letter) break;
            prefix = letter + prefix;
            pos--;
        }
        
        return prefix;
    }

    getExistingSuffix(row, col, isHorizontal, boardState) {
        let suffix = '';
        let pos = isHorizontal ? col + 1 : row + 1;
        const max = GRID_SIZE;
        
        while (pos < max) {
            const letter = isHorizontal ? 
                boardState[row][pos] : 
                boardState[pos][col];
            if (!letter) break;
            suffix += letter;
            pos++;
        }
        
        return suffix;
    }

    async executeMove(move) {
        console.log('Bot executing move:', move);
        
        try {
            // validate move first
            if (!move || !move.word || !(await this.validateMove(move))) {
                console.error('Invalid move:', move);
                return false;
            }

            const { word, row, col, isHorizontal, score } = move;
            const lettersNeeded = word.toUpperCase().split('');

            // Remove letters from rack
            if (!this.rack.removeLetters(lettersNeeded)) {
                console.error('Failed to remove letters from rack');
                return false;
            }

            // Place tiles and update score
            let success = true;
            try {
                // Place tiles
                for (let i = 0; i < lettersNeeded.length; i++) {
                    const currentRow = isHorizontal ? row : row + i;
                    const currentCol = isHorizontal ? col + i : col;
                    const cell = utils.queryCell(currentRow, currentCol);
                    
                    if (!cell || cell.querySelector('.tile')) {
                        success = false;
                        break;
                    }

                    const tile = document.createElement('div');
                    tile.className = 'tile submitted bot-played';
                    
                    const letterContent = document.createElement('span');
                    letterContent.className = 'letter-content';
                    letterContent.textContent = lettersNeeded[i];
                    
                    tile.appendChild(letterContent);
                    cell.appendChild(tile);
                }

                // Update score only if placement successful
                if (success) {
                    const botScore = document.getElementById('botScore');
                    if (botScore) {
                        const currentScore = parseInt(botScore.textContent) || 0;
                        const newScore = currentScore + score;
                        botScore.textContent = newScore;
                        console.log('Updated bot score:', newScore);
                    }
                }

                return success;

            } catch (error) {
                console.error('Error during move execution:', error);
                return false;
            }

        } catch (error) {
            console.error('Error in executeMove:', error);
            return false;
        }
    }

    async findPossibleMoves() {
        const moves = [];
        const boardState = this.getBoardState();
        
        if (this.isFirstMove(boardState)) {
            return this.findFirstMoves();
        }

        // หาคำที่สามารถสร้างได้จาก rack
        const possibleWords = await this.findPossibleWordsFromRack();
        console.log('Found possible words:', possibleWords);

        // ลองวางแต่ละคำในตำแหน่งที่เหมาะสม
        for (const word of possibleWords) {
            const move = await this.findBestPositionForWord(word, boardState);
            if (move && await this.validateMove(move)) {
                moves.push(move);
            }
        }

        // จัดเรียงตามคะแนน
        moves.sort((a, b) => b.score - a.score);
        return moves.slice(0, 5); // เลือก 5 อันดับแรก
    }

    findAllExistingLetters(boardState) {
        const letters = [];
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (boardState[row][col]) {
                    letters.push({
                        letter: boardState[row][col],
                        row, 
                        col
                    });
                }
            }
        }
        return letters;
    }

    findExistingWords(boardState, existingLetters) {
        const horizontalWords = new Set();
        const verticalWords = new Set();

        for (const {row, col} of existingLetters) {
            // หาคำแนวนอน
            let hWord = this.getWordInDirection(row, col, 0, 1, boardState);
            if (hWord) horizontalWords.add(hWord);

            // หาคำแนวตั้ง
            let vWord = this.getWordInDirection(row, col, 1, 0, boardState);
            if (vWord) verticalWords.add(vWord);
        }

        return {horizontalWords, verticalWords};
    }

    getWordInDirection(row, col, dx, dy, boardState) {
        let word = '';
        let currentRow = row;
        let currentCol = col;

        // ถอยกลับไปจุดเริ่มต้นของคำ
        while (this.isValidPosition(currentRow - dx, currentCol - dy) &&
               boardState[currentRow - dx][currentCol - dy]) {
            currentRow -= dx;
            currentCol -= dy;
        }

        // อ่านคำจากซ้ายไปขวาหรือบนลงล่าง
        while (this.isValidPosition(currentRow, currentCol) &&
               boardState[currentRow][currentCol]) {
            word += boardState[currentRow][currentCol];
            currentRow += dx;
            currentCol += dy;
        }

        return word.length > 1 ? word : null;
    }

    async findPossibleWordsFromPosition(row, col, isHorizontal, existingLetter, boardState) {
        const possibleWords = [];
        const rackLetters = [...this.rack.letters, existingLetter];
        
        // หาคำที่สามารถสร้างได้จากตัวอักษรที่มี
        for (const word of this.wordValidator.dictionary) {
            if (word.includes(existingLetter) && 
                this.canMakeWordWithLetters(word, rackLetters)) {
                possibleWords.push(word);
            }
        }

        return possibleWords;
    }

    prioritizeMovesByDirection(moves) {
        // จัดกลุ่มตาม direction
        const grouped = moves.reduce((acc, move) => {
            const key = move.isHorizontal ? 'horizontal' : 'vertical';
            if (!acc[key]) acc[key] = [];
            acc[key].push(move);
            return acc;
        }, {});

        // เรียงตามคะแนนในแต่ละกลุ่ม
        for (const direction in grouped) {
            grouped[direction].sort((a, b) => b.score - a.score);
        }

        // สลับการเลือกระหว่างแนวตั้งและแนวนอน
        const result = [];
        const maxPerDirection = 3;
        for (let i = 0; i < maxPerDirection; i++) {
            if (grouped.horizontal?.[i]) result.push(grouped.horizontal[i]);
            if (grouped.vertical?.[i]) result.push(grouped.vertical[i]);
        }

        return result;
    }

    async findWordsFromAnchor(anchor, isHorizontal) {
        const words = new Set();
        const rackLetters = this.rack.letters;
        
        // หาตัวอักษรที่มีอยู่แล้วบนบอร์ด
        const prefix = await this.findPrefix(anchor, isHorizontal);
        const suffix = await this.findSuffix(anchor, isHorizontal);

        // สร้างคำจากตัวอักษรในแร็ค
        for (let len = 1; len <= rackLetters.length; len++) {
            const combinations = this.generateCombinations(rackLetters, len);
            for (const combo of combinations) {
                // ลองวางคำในตำแหน่งต่างๆ
                const word = prefix + combo + suffix;
                if (await this.isValidWord(word)) {
                    words.add(word);
                }
            }
        }

        return Array.from(words);
    }

    isFirstMove(boardState) {
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                if (boardState[i][j] !== null) return false;
            }
        }
        return true;
    }

    calculateFirstMoveScore(word, start) {
        let score = 0;
        let wordMultiplier = 1;
        
        // Score each letter considering center square and other bonuses
        for (let i = 0; i < word.length; i++) {
            const pos = start + i;
            const letter = word[i];
            let letterScore = INITIAL_LETTER_DATA[letter].score;
            
            // Center square (7,7) is just a normal square for scoring
            // But check other bonus squares
            if (this.isBonusSquare(pos)) {
                const bonus = this.getBonusMultiplier(pos);
                if (bonus.type === 'letter') {
                    letterScore *= bonus.value;
                } else {
                    wordMultiplier *= bonus.value;
                }
            }
            
            score += letterScore;
        }
        
        return score * wordMultiplier;
    }

    isBonusSquare(pos) {
        // Check if position has any special multiplier
        return pos !== 7; // Skip center square
    }

    getBonusMultiplier(pos) {
        // Return bonus type and value for special squares
        // This is a simplified version - implement based on your board layout
        return { type: 'normal', value: 1 };
    }

    isValidFirstMove(move) {
        const centerPos = Math.floor(GRID_SIZE / 2);
        
        // อนุญาตให้วางได้ทั้งแนวตั้งและแนวนอนในการเล่นครั้งแรก
        if (move.isHorizontal) { // Change from isHorizontal to move.isHorizontal
            // สำหรับการวางแนวนอน - ต้องอยู่ในแถวกลาง
            if (move.row !== centerPos) return false;
            const endCol = move.col + move.word.length - 1;
            return move.col <= centerPos && endCol >= centerPos;
        } else {
            // สำหรับการวางแนวตั้ง - ต้องอยู่ในคอลัมน์กลาง
            if (move.col !== centerPos) return false;
            const endRow = move.row + move.word.length - 1;
            return move.row <= centerPos && endRow >= centerPos;
        }
    }

    getBoardState() {
        const state = Array(GRID_SIZE).fill(null)
            .map(() => Array(GRID_SIZE).fill(null));
            
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                const cell = utils.queryCell(i, j);
                const tile = cell?.querySelector('.tile');
                if (tile) {
                    state[i][j] = tile.textContent.trim();
                }
            }
        }
        return state;
    }

    findAnchors(boardState) {
        const anchors = [];
        const directions = [[-1,0], [1,0], [0,-1], [0,1]];
        
        // เพิ่มการหา anchors ที่มีประสิทธิภาพมากขึ้น
        for (let i = 0; i < GRID_SIZE; i++) {
            for (let j = 0; j < GRID_SIZE; j++) {
                if (!boardState[i][j]) { // ช่องว่าง
                    // เช็คว่ามีตัวอักษรติดกันหรือไม่
                    const hasAdjacent = directions.some(([di, dj]) => {
                        const newI = i + di;
                        const newJ = j + dj;
                        return this.isValidPosition(newI, newJ) && 
                               boardState[newI][newJ] !== null;
                    });

                    if (hasAdjacent) {
                        anchors.push({
                            row: i,
                            col: j,
                            adjacentLetters: this.getAdjacentLetters(boardState, i, j)
                        });
                    }
                }
            }
        }
        
        return anchors;
    }

    getAdjacentLetters(boardState, row, col) {
        const adjacent = {
            top: null,
            bottom: null,
            left: null,
            right: null
        };
        
        if (this.isValidPosition(row-1, col)) adjacent.top = boardState[row-1][col];
        if (this.isValidPosition(row+1, col)) adjacent.bottom = boardState[row+1][col];
        if (this.isValidPosition(row, col-1)) adjacent.left = boardState[row][col-1];
        if (this.isValidPosition(row, col+1)) adjacent.right = boardState[row][col+1];
        
        return adjacent;
    }

    hasAdjacentTile(boardState, row, col) {
        const directions = [[-1,0], [1,0], [0,-1], [0,1]];
        
        return directions.some(([dRow, dCol]) => {
            const newRow = row + dRow;
            const newCol = col + dCol;
            return this.isValidPosition(newRow, newCol) && 
                   boardState[newRow][newCol] !== null;
        });
    }

    isValidPosition(row, col) {
        return row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE;
    }

    async findMovesFromAnchor(anchor, isHorizontal) {
        const moves = [];
        const rackLetters = this.rack.letters;
        
        // Get cross-checks for this anchor
        const validLetters = this.getCrossChecks(anchor, isHorizontal);
        
        // For each valid letter that we can place
        for (const letter of rackLetters) {
            if (validLetters.includes(letter)) {
                // Try extending left/up and right/down
                const words = await this.extendWord(
                    anchor, 
                    letter,
                    isHorizontal,
                    rackLetters.filter(l => l !== letter)
                );
                
                moves.push(...words.map(word => ({
                    word,
                    row: anchor.row,
                    col: anchor.col,
                    isHorizontal,
                    score: this.calculateMoveScore(word, anchor.row, anchor.col, isHorizontal)
                })));
            }
        }
        
        return moves;
    }

    getCrossChecks(anchor, isHorizontal) {
        // Return valid letters that can be placed at anchor position
        // considering perpendicular words that would be formed
        const validLetters = [];
        
        for (const letter of Object.keys(LETTER_DATA)) {
            if (this.isValidCrossWord(anchor, letter, isHorizontal)) {
                validLetters.push(letter);
            }
        }
        
        return validLetters;
    }

    isValidCrossWord(anchor, letter, isHorizontal) {
        // Check if placing this letter would form valid perpendicular words
        const perpendicularWord = this.getPerpendicularWord(
            anchor.row,
            anchor.col,
            letter,
            isHorizontal
        );
        
        return !perpendicularWord || this.isValidWord(perpendicularWord);
    }

    getPerpendicularWord(row, col, letter, isHorizontal, boardState) {
        // Get the word that would be formed perpendicular to the placement direction
        let word = '';
        let startRow = isHorizontal ? row : col;

        // Read backwards
        let pos = startRow - 1;
        while (this.isValidPosition(startRow, pos) && 
               this.board.hasLetterAt(startRow, pos)) {
            word = this.board.getLetterAt(startRow, pos) + word;
            pos--;
        }

        // Add current letter
        word += letter;

        // Read forwards
        pos = startRow + 1;
        while (this.isValidPosition(startRow, pos) && 
               this.board.hasLetterAt(startRow, pos)) {
            word += this.board.getLetterAt(startRow, pos);
            pos++;
        }

        return word.length > 1 ? word : null;
    }

    calculateMoveScore(word, row, col, isHorizontal) {
        let score = 0;
        let wordMultiplier = 1;
        const centerPos = Math.floor(GRID_SIZE / 2);
        
        for (let i = 0; i < word.length; i++) {
            const currentRow = isHorizontal ? row : row + i;
            const currentCol = isHorizontal ? col + i : col;
            const letter = word[i];
            let letterScore = LETTER_DATA[letter]?.score || 0;
            
            // ตรวจสอบช่องพิเศษ
            const cell = utils.queryCell(currentRow, currentCol);
            if (cell) {
                // ยกเว้นช่องกลางในการเล่นครั้งแรก
                if (currentRow === centerPos && currentCol === centerPos) {
                    score += letterScore;
                    continue;
                }
                
                if (cell.classList.contains('double-letter')) letterScore *= 2;
                else if (cell.classList.contains('triple-letter')) letterScore *= 3;
                else if (cell.classList.contains('double-word')) wordMultiplier *= 2;
                else if (cell.classList.contains('triple-word')) wordMultiplier *= 3;
            }
            
            score += letterScore;
        }
        
        return score * wordMultiplier;
    }

    async isValidWord(word) {
        if (!word || word.length < 2) return false;
        if (!this.wordValidator) {
            console.error('WordValidator not available');
            return false;
        }

        const normalizedWord = word.trim().toUpperCase();
        
        // 1. เช็คจาก cache ก่อน
        if (this.validWords.has(normalizedWord)) return true;
        
        // 2. เช็คจาก dictionary
        const isValid = this.wordValidator.dictionary.has(normalizedWord);
        if (isValid) {
            this.validWords.add(normalizedWord);
            return true;
        }

        console.log(`Word validation result for ${normalizedWord}:`, isValid);
        return isValid;
    }

    isValidFirstMove(move) {
        const centerPos = Math.floor(GRID_SIZE / 2);
        
        // อนุญาตให้วางได้ทั้งแนวตั้งและแนวนอนในการเล่นครั้งแรก
        if (move.isHorizontal) { // Change from isHorizontal to move.isHorizontal
            // สำหรับการวางแนวนอน - ต้องอยู่ในแถวกลาง
            if (move.row !== centerPos) return false;
            const endCol = move.col + move.word.length - 1;
            return move.col <= centerPos && endCol >= centerPos;
        } else {
            // สำหรับการวางแนวตั้ง - ต้องอยู่ในคอลัมน์กลาง
            if (move.col !== centerPos) return false;
            const endRow = move.row + move.word.length - 1;
            return move.row <= centerPos && endRow >= centerPos;
        }
    }

    generateCombinations(letters, length) {
        if (length < 2 || length > letters.length) return []; // ลดความยาวขั้นต่ำเป็น 2

        const letterFreq = {};
        letters.forEach(l => {
            letterFreq[l] = (letterFreq[l] || 0) + 1;
        });

        const results = new Set();
        const maxCombos = 200; // เพิ่มจำนวน combinations ที่จะลอง

        const generate = (current, remaining) => {
            if (results.size >= maxCombos) return;
            if (current.length === length) {
                // ผ่อนปรนเงื่อนไขการตรวจสอบ - ยอมให้มีแค่สระหรือพยัญชนะอย่างเดียวได้
                if (this.isBasicValid(current)) {
                    results.add(current);
                }
                return;
            }

            Object.entries(remaining).forEach(([letter, count]) => {
                if (count > 0) {
                    const newRemaining = {...remaining};
                    newRemaining[letter]--;
                    generate(current + letter, newRemaining);
                }
            });
        };

        generate('', letterFreq);
        return Array.from(results);
    }

    isBasicValid(word) {
        // ยอมรับคำที่มีแค่พยัญชนะสำหรับคำสั้นๆ 
        if (word.length <= 2) {
            return this.wordValidator.dictionary.has(word.toUpperCase());
        }

        // สำหรับคำที่ยาวกว่า 2 ตัว
        if (!/[AEIOU]/.test(word)) return false; // ต้องมีสระอย่างน้อย 1 ตัว
        if (/[^AEIOU]{4,}/.test(word)) return false; // ไม่ควรมีพยัญชนะติดกันเกิน 3 ตัว
        if (/[AEIOU]{3,}/.test(word)) return false; // ไม่ควรมีสระติดกันเกิน 2 ตัว

        return true;
    }

    executeSkip() {
        console.log('Bot executing skip');
        if (!window.gameManager?.isPlayerTurn) {
            this.consecutiveInvalidMoves = 0;
            this.lastMove = null;
            this.finishTurn();
            console.log('Turn switched to player after bot skip');
        } else {
            console.warn('Attempted to skip during player turn');
        }
    }

    // เพิ่มฟังก์ชันใหม่สำหรับตรวจสอบการ skip
    async shouldSkipTurn() {
        const availableWords = await this.findPossibleWordsFromRack();
        
        // ถ้ามีคำที่เล่นได้ ไม่ควร skip
        if (availableWords.length > 0) {
            console.log('Found playable words, should not skip:', availableWords);
            return false;
        }

        const rack = this.rack.letters;
        
        // ถ้ามีตัวอักษรน้อยกว่า 2 ตัว ให้ swap
        if (rack.length < 2) {
            return this.swapCount >= this.maxSwapAttempts;
        }

        // ตรวจสอบคุณภาพของตัวอักษรในแร็ค
        const hasVowel = rack.some(l => 'AEIOU'.includes(l));
        const hasConsonant = rack.some(l => !'AEIOU'.includes(l));
        const hasHighValue = rack.some(l => LETTER_DATA[l]?.score >= 8);
        
        // ถ้ามีทั้งสระและพยัญชนะ หรือมีตัวอักษรที่มีคะแนนสูง ให้ลอง swap
        if ((hasVowel && hasConsonant) || hasHighValue) {
            return this.swapCount >= this.maxSwapAttempts;
        }

        return true;
    }

    async extendWord(anchor, letter, isHorizontal, remainingLetters) {
        const words = [];
        const prefix = await this.findPrefix(anchor, isHorizontal);
        const suffix = await this.findSuffix(anchor, isHorizontal);
        
        // Start with the placed letter
        let baseWord = prefix + letter + suffix;
        if (await this.isValidWord(baseWord)) {
            words.push(baseWord);
        }

        // Try extending with remaining letters
        await this.extendWithLetters(
            prefix + letter,
            suffix,
            remainingLetters,
            words
        );

        return words;
    }

    async findPrefix(anchor, isHorizontal) {
        let prefix = '';
        let row = anchor.row;
        let col = anchor.col;
        
        // Move backwards to find prefix
        while (true) {
            const prevRow = isHorizontal ? row : row - 1;
            const prevCol = isHorizontal ? col - 1 : col;
            
            if (!this.isValidPosition(prevRow, prevCol)) break;
            
            const letter = this.board.getLetterAt(prevRow, prevCol);
            if (!letter) break;
            
            prefix = letter + prefix;
            row = prevRow;
            col = prevCol;
        }
        
        return prefix;
    }

    async findSuffix(anchor, isHorizontal) {
        let suffix = '';
        let row = anchor.row;
        let col = anchor.col;
        
        // Move forwards to find suffix
        while (true) {
            const nextRow = isHorizontal ? row : row + 1;
            const nextCol = isHorizontal ? col + 1 : col;
            
            if (!this.isValidPosition(nextRow, nextCol)) break;
            
            const letter = this.board.getLetterAt(nextRow, nextCol);
            if (!letter) break;
            
            suffix += letter;
            row = nextRow;
            col = nextCol;
        }
        
        return suffix;
    }

    async extendWithLetters(prefix, suffix, letters, words) {
        // Base case: check current word
        const currentWord = prefix + suffix;
        if (await this.isValidWord(currentWord)) {
            words.push(currentWord);
        }

        // Try each remaining letter
        for (let i = 0; i < letters.length; i++) {
            const letter = letters[i];
            const remainingLetters = [...letters.slice(0, i), ...letters.slice(i + 1)];
            
            // Try extending prefix
            await this.extendWithLetters(
                prefix + letter,
                suffix,
                remainingLetters,
                words
            );
            
            // Try extending suffix
            await this.extendWithLetters(
                prefix,
                letter + suffix,
                remainingLetters,
                words
            );
        }
    }

    createBotTile(letter) {
        const tile = document.createElement('div');
        tile.className = 'tile bot-tile';
        tile.draggable = false;
        
        // Add only letter content without score
        const letterContent = document.createElement('span');
        letterContent.className = 'letter-content';
        letterContent.textContent = letter;
        tile.appendChild(letterContent);
        
        return tile;
    }

    placeTile(cell, letter) {
        if (cell && !cell.querySelector('.tile')) {
            const tile = this.createBotTile(letter);
            cell.appendChild(tile);
            return true;
        }
        return false;
    }

    // เพิ่มฟังก์ชันใหม่สำหรับการ swap ตัวอักษรของบอท
    async swapBotLetters() {
        try {
            console.log('Bot swapping letters...');
    
            // คืนตัวอักษรทั้งหมดในแร็คกลับไปที่ LETTER_DATA
            this.rack.letters.forEach(letter => {
                if (LETTER_DATA[letter] && LETTER_DATA[letter].count < INITIAL_LETTER_DATA[letter].count) {
                    LETTER_DATA[letter].count++;
                } else {
                    console.warn(`Cannot return letter ${letter}, count exceeds initial limit.`);
                }
            });
    
            this.rack.letters = []; // เคลียร์แร็คของบอท
    
            // สุ่มตัวอักษรใหม่สำหรับแร็คของบอท
            for (let i = 0; i < RACK_SIZE; i++) {
                const newLetter = this.letterManager.getRandomLetter();
                if (newLetter) {
                    this.rack.letters.push(newLetter);
                } else {
                    console.error('Failed to get a new letter during swap.');
                    break;
                }
            }
    
            // อัปเดตการแสดงผล
            this.rack.updateDisplay();
            if (typeof updateTileBagCounts === 'function') {
                updateTileBagCounts();
            }
    
            this.swapCount++;
            console.log('Bot swapped letters successfully:', this.rack.letters);
    
            // เพิ่มการสลับเทิร์นหลัง swap
            this.finishTurn();
    
        } catch (error) {
            console.error('Error in swapBotLetters:', error);
            // ในกรณีที่เกิดข้อผิดพลาด ก็ยังต้องสลับเทิร์น
            this.finishTurn();
        }
    }
    

    canMakeWordWithLetters(word, availableLetters) {
        const letterCounts = {};
        // Create frequency map of required letters
        for (const letter of word.toUpperCase()) {
            letterCounts[letter] = (letterCounts[letter] || 0) + 1;
        }

        // Check against available letters
        const available = [...availableLetters];
        for (const [letter, count] of Object.entries(letterCounts)) {
            const foundCount = available.filter(l => l === letter).length;
            if (foundCount < count) {
                return false;
            }
            // Remove used letters from available
            for (let i = 0; i < count; i++) {
                const index = available.indexOf(letter);
                if (index !== -1) {
                    available.splice(index, 1);
                }
            }
        }

        return true;
    }

    // Add new method to calculate weighted score
    calculateWeightedScore(move) {
        const strategy = this.getCurrentStrategy();
        const baseScore = move.score;
        const lengthScore = Math.pow(move.word.length, 1.5);
        const positionScore = this.calculatePositionScore(move);

        // โบนัสพิเศษ
        let bonusScore = 0;

        // โบนัสสำหรับการใช้ตัวอักษรทั้งหมดในแร็ค (7 ตัว)
        if (move.word.length === 7) {
            bonusScore += 50;
        }

        // โบนัสสำหรับการใช้ตัวอักษรที่มีคะแนนสูง (Q, Z, J, X)
        if (/[QZJX]/.test(move.word)) {
            bonusScore += 20;
        }

        // โบนัสสำหรับการสร้างคำหลายคำในครั้งเดียว
        const crossWords = this.findCrossWords(move);
        bonusScore += crossWords.length * 15;

        // เพิ่มการตรวจสอบความถูกต้องของคำ
        if (!this.wordValidator.dictionary.has(move.word.toUpperCase())) {
            return -1; // ให้คะแนนติดลบถ้าคำไม่ถูกต้อง
        }

        return (baseScore * strategy.scoreWeight) +
               (lengthScore * strategy.lengthWeight) +
               (positionScore * strategy.positionWeight) +
               bonusScore;
    }

    calculatePositionScore(move) {
        let score = 0;
        const centerPos = Math.floor(GRID_SIZE / 2);
        
        // คำนวณตำแหน่งที่ดีที่สุด
        for (let i = 0; i < move.word.length; i++) {
            const row = move.isHorizontal ? move.row : move.row + i;
            const col = move.isHorizontal ? move.col + i : move.col;
            const cell = utils.queryCell(row, col);
            
            if (cell) {
                // ช่องคะแนนพิเศษ
                if (cell.classList.contains('tw')) score += 8;
                if (cell.classList.contains('dw')) score += 6;
                if (cell.classList.contains('tl')) score += 4;
                if (cell.classList.contains('dl')) score += 2;

                // โบนัสตำแหน่งใกล้กลาง
                const distanceFromCenter = Math.sqrt(
                    Math.pow(row - centerPos, 2) + 
                    Math.pow(col - centerPos, 2)
                );
                score += Math.max(0, (GRID_SIZE / 2) - distanceFromCenter);

                // โบนัสสำหรับการต่อคำ
                const adjacentCells = [
                    [row - 1, col], [row + 1, col],
                    [row, col - 1], [row, col + 1]
                ];
                
                for (const [adjRow, adjCol] of adjacentCells) {
                    if (this.board.hasLetterAt(adjRow, adjCol)) {
                        score += 3;
                    }
                }
            }
        }

        return score;
    }

    prioritizeMoves(moves) {
        const strategy = this.getCurrentStrategy();
        const prioritized = moves
            .filter(move => move.word.length >= strategy.minLength)
            .sort((a, b) => {
                const scoreA = this.calculateWeightedScore(a);
                const scoreB = this.calculateWeightedScore(b);
                return scoreB - scoreA;
            });

        // เลือก moves ที่ดีที่สุด 5 อันดับแรก
        return prioritized.slice(0, 5);
    }

    // เพิ่มเมธอดที่หายไป
    calculatePotentialScore(word) {
        let score = 0;
        for (const letter of word.toUpperCase()) {
            const letterData = LETTER_DATA[letter];
            if (letterData) {
                score += letterData.score;
            }
        }
        return score;
    }

    isValidPositionForWord(word, row, col, isHorizontal, boardState) {
        // ตรวจสอบว่าคำไม่ยาวเกินขอบกระดาน
        const endRow = isHorizontal ? row : row + word.length - 1;
        const endCol = isHorizontal ? col + word.length - 1 : col;
        
        if (!this.isValidPosition(endRow, endCol)) {
            return false;
        }

        // ตรวจสอบว่าไม่ทับกับตัวอักษรที่มีอยู่แล้ว
        for (let i = 0; i < word.length; i++) {
            const currentRow = isHorizontal ? row : row + i;
            const currentCol = isHorizontal ? col + i : col;
            
            if (boardState[currentRow][currentCol] !== null) {
                return false;
            }

            // ตรวจสอบว่ามีการเชื่อมต่อกับตัวอักษรที่มีอยู่แล้ว (ยกเว้นการเล่นครั้งแรก)
            if (!this.isFirstMove(boardState)) {
                const hasConnection = this.hasAdjacentTile(boardState, currentRow, currentCol);
                if (!hasConnection) {
                    return false;
                }
            }
        }

        return true;
    }

    findAllExistingWords(boardState) {
        const words = {
            horizontal: [],
            vertical: []
        };

        // หาคำแนวนอน
        for (let row = 0; row < GRID_SIZE; row++) {
            let word = '';
            let start = null;
            for (let col = 0; col < GRID_SIZE; col++) {
                if (boardState[row][col]) {
                    if (!start) start = { row, col };
                    word += boardState[row][col];
                } else if (word.length > 1) {
                    words.horizontal.push({
                        word,
                        start,
                        end: { row, col: col - 1 }
                    });
                    word = '';
                    start = null;
                } else {
                    word = '';
                    start = null;
                }
            }
            if (word.length > 1) {
                words.horizontal.push({
                    word,
                    start,
                    end: { row: centerPos, col: GRID_SIZE - 1 }
                });
            }
        }

        // หาคำแนวตั้ง
        for (let col = 0; col < GRID_SIZE; col++) {
            let word = '';
            let start = null;
            for (let row = 0; row < GRID_SIZE; row++) {
                if (boardState[row][col]) {
                    if (!start) start = { row, col };
                    word += boardState[row][col];
                } else if (word.length > 1) {
                    words.vertical.push({
                        word,
                        start,
                        end: { row: row - 1, col }
                    });
                    word = '';
                    start = null;
                } else {
                    word = '';
                    start = null;
                }
            }
            if (word.length > 1) {
                words.vertical.push({
                    word,
                    start,
                    end: { row: GRID_SIZE - 1, col }
                });
            }
        }

        return words;
    }

    findAllAnchorPoints(boardState, existingWords) {
        const anchors = new Set();
        const directions = [[-1,0], [1,0], [0,-1], [0,1]];

        // เพิ่มจุดต่อรอบๆ คำที่มีอยู่
        for (const direction of ['horizontal', 'vertical']) {
            for (const wordInfo of existingWords[direction]) {
                // หาช่องว่างรอบๆ คำ
                this.addAnchorsAroundWord(wordInfo, boardState, anchors);
            }
        }

        return Array.from(anchors);
    }

    addAnchorsAroundWord(wordInfo, boardState, anchors) {
        const { start, end } = wordInfo;
        
        // เพิ่มจุดก่อนและหลังคำ
        if (start.col > 0 && !boardState[start.row][start.col - 1]) {
            anchors.add({ row: start.row, col: start.col - 1, type: 'horizontal' });
        }
        if (end.col < GRID_SIZE - 1 && !boardState[end.row][end.col + 1]) {
            anchors.add({ row: end.row, col: end.col + 1, type: 'horizontal' });
        }
        
        // เพิ่มจุดเหนือและใต้คำ
        for (let col = start.col; col <= end.col; col++) {
            if (start.row > 0 && !boardState[start.row - 1][col]) {
                anchors.add({ row: start.row - 1, col, type: 'vertical' });
            }
            if (end.row < GRID_SIZE - 1 && !boardState[end.row + 1][col]) {
                anchors.add({ row: end.row + 1, col, type: 'vertical' });
            }
        }
    }

    async validateCompleteMove(move, boardState) {
        if (!await this.validateMove(move)) return false;

        // ตรวจสอบคำที่เกิดจากการต่อเพิ่มเติม
        const connectedWords = this.findConnectedWords(move, boardState);
        move.connectedWords = connectedWords;

        // ตรวจสอบทุกคำที่เกิดขึ้น
        for (const word of connectedWords) {
            if (!await this.isValidWord(word)) {
                return false;
            }
        }

        return true;
    }

    findConnectedWords(move, boardState) {
        const words = new Set();
        const { row, col, isHorizontal, word } = move;

        // สร้าง temporary board state
        const tempBoard = boardState.map(row => [...row]);
        
        // วางคำลงใน temporary board
        for (let i = 0; word && i < word.length; i++) {
            const currentRow = isHorizontal ? row : row + i;
            const currentCol = isHorizontal ? col + i : col;
            tempBoard[currentRow][currentCol] = word[i];
        }

        // หาคำที่เกิดจากการต่อในแนวตั้งฉาก
        for (let i = 0; word && i < word.length; i++) {
            const currentRow = isHorizontal ? row : row + i;
            const currentCol = isHorizontal ? col + i : col;
            
            const crossWord = this.getWordInDirection(
                currentRow,
                currentCol,
                !isHorizontal,
                tempBoard
            );
            
            if (crossWord && crossWord.length > 1) {
                words.add(crossWord);
            }
        }

        return Array.from(words);
    }

    selectBestMove(validMoves) {
        if (validMoves.length === 0) return null;

        // จัดอันดับ moves ตามเกณฑ์ต่างๆ
        const rankedMoves = validMoves.map(move => ({
            ...move,
            rank: this.calculateMoveRank(move)
        }));

        // เรียงตามคะแนนและเลือกการเล่นที่ดีที่สุด
        rankedMoves.sort((a, b) => b.rank - a.rank);
        return rankedMoves[0];
    }

    calculateMoveRank(move) {
        let rank = move.score;

        // โบนัสสำหรับการสร้างหลายคำ
        rank += move.connectedWords.length * 10;

        // โบนัสสำหรับการใช้ตัวอักษรที่มีคะแนนสูง
        if (/[QZJX]/.test(move.word)) {
            rank += 15;
        }

        // โบนัสสำหรับการใช้ตัวอักษรหลายตัว
        rank += move.word.length * 2;

        return rank;
    }

    findAllAvailablePositions(boardState) {
        const positions = [];
        const usedPositions = new Set();

        // 1. หาตำแหน่งที่มีตัวอักษรอยู่แล้ว
        const existingLetters = [];
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (boardState[row][col]) {
                    existingLetters.push({row, col});
                    // เพิ่มตำแหน่งที่ใช้แล้วและตำแหน่งที่ติดกัน
                    this.markAdjacentPositions(row, col, usedPositions);
                }
            }
        }

        // 2. หาตำแหน่งที่สามารถวางได้ (ไม่ชิดกับตัวอักษรที่มีอยู่)
        for (let row = 0; row < GRID_SIZE; row++) {
            for (let col = 0; col < GRID_SIZE; col++) {
                if (!usedPositions.has(`${row},${col}`) && !boardState[row][col]) {
                    positions.push({
                        row,
                        col,
                        distanceFromCenter: this.calculateDistanceFromCenter(row, col)
                    });
                }
            }
        }

        // 3. จัดเรียงตามระยะห่างจากจุดศูนย์กลาง
        positions.sort((a, b) => a.distanceFromCenter - b.distanceFromCenter);

        return positions;
    }

    markAdjacentPositions(row, col, usedPositions) {
        // เพิ่มตำแหน่งปัจจุบัน
        usedPositions.add(`${row},${col}`);

        // เพิ่มตำแหน่งที่ติดกันในทุกทิศทาง (รวมแนวทแยง)
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; i <= 1; j++) {
                const newRow = row + i;
                const newCol = col + j;
                if (this.isValidPosition(newRow, newCol)) {
                    usedPositions.add(`${newRow},${newCol}`);
                }
            }
        }
    }

    calculateDistanceFromCenter(row, col) {
        const centerPos = Math.floor(GRID_SIZE / 2);
        return Math.sqrt(
            Math.pow(row - centerPos, 2) + 
            Math.pow(col - centerPos, 2)
        );
    }

    async findBestPositionForWord(word, boardState) {
        const availablePositions = this.findAllAvailablePositions(boardState);
        let bestMove = null;
        let bestScore = -1;

        // ลองวางในแต่ละตำแหน่งที่หาได้
        for (const pos of availablePositions) {
            for (const isHorizontal of [true, false]) {
                // ตรวจสอบว่าสามารถวางคำในตำแหน่งนี้ได้หรือไม่
                if (this.canPlaceWordAt(word, pos.row, pos.col, isHorizontal, boardState)) {
                    const score = this.calculateMoveScore(word, pos.row, pos.col, isHorizontal);
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = {
                            word,
                            row: pos.row,
                            col: pos.col,
                            isHorizontal,
                            score
                        };
                    }
                }
            }
        }

        return bestMove;
    }

    canPlaceWordAt(word, row, col, isHorizontal, boardState) {
        // ตรวจสอบว่าคำไม่ยาวเกินขอบกระดาน
        const endRow = isHorizontal ? row : row + word.length - 1;
        const endCol = isHorizontal ? col + word.length - 1 : col;
        
        if (!this.isValidPosition(endRow, endCol)) return false;

        // เพิ่มการตรวจสอบพื้นที่รอบๆ คำ
        const buffer = 1; // ระยะห่างที่ต้องการรักษา

        for (let i = -buffer; i <= word.length + buffer; i++) {
            for (let j = -buffer; i <= buffer; j++) {
                const checkRow = isHorizontal ? row + j : row + i;
                const checkCol = isHorizontal ? col + i : col + j;

                // ข้ามการตรวจสอบตำแหน่งที่จะวางคำ
                if (isHorizontal && j === 0 && i >= 0 && i < word.length) continue;
                if (!isHorizontal && j === 0 && i >= 0 && i < word.length) continue;

                // ตรวจสอบว่าไม่มีตัวอักษรในระยะ buffer
                if (this.isValidPosition(checkRow, checkCol) && 
                    boardState[checkRow][checkCol] !== null) {
                    return true;
                }
            }
        }

        return true;
    }

    async findBestFirstGameMove() {
        const centerPos = Math.floor(GRID_SIZE / 2);
        console.log('Bot attempting first game move with letters:', this.rack.letters);

        // หาคำที่สามารถสร้างได้จาก rack
        const possibleWords = await this.findPossibleWordsFromRack();
        console.log('Possible words for first game move:', possibleWords);

        // หาคำที่เหมาะสมสำหรับวางตรงกลาง
        const candidates = [];

        for (const word of possibleWords) {
            if (word.length >= 2) { // ต้องมีความยาวอย่างน้อย 2 ตัวอักษร
                // ลองวางคำให้ผ่านจุดศูนย์กลาง
                for (let offset = 0; offset < word.length; offset++) {
                    const col = centerPos - offset;
                    if (col >= 0 && col + word.length <= GRID_SIZE) {
                        // ตรวจสอบว่าคำจะผ่านจุดศูนย์กลาง
                        if (col <= centerPos && col + word.length > centerPos) {
                            candidates.push({
                                word,
                                row: centerPos,
                                col: col,
                                isHorizontal: true,
                                score: this.calculateWeightedFirstMoveScore(word, centerPos, col)
                            });
                        }
                    }
                }
            }
        }

        // เรียงลำดับตามคะแนนและความยาว
        candidates.sort((a, b) => {
            if (b.word.length !== a.word.length) {
                return b.word.length - a.word.length; // เรียงตามความยาวก่อน
            }
            return b.score - a.score; // ถ้าความยาวเท่ากัน เรียงตามคะแนน
        });

        console.log('Candidates for first game move:', candidates);
        return candidates[0] || null;
    }

    async findAllPossibleMoves(boardState, possibleWords) {
        const moves = [];
        const centerPos = Math.floor(GRID_SIZE / 2);
        
        if (this.isFirstMove(boardState)) {
            // สำหรับการเล่นครั้งแรก ให้ลองทั้งแนวตั้งและแนวนอน
            for (const word of possibleWords) {
                for (const isHorizontal of [true, false]) {
                    const col = isHorizontal ? centerPos - Math.floor(word.length / 2) : centerPos;
                    const row = isHorizontal ? centerPos : centerPos - Math.floor(word.length / 2);
                    moves.push({
                        word,
                        row,
                        col,
                        isHorizontal,
                        score: this.calculateMoveScore(word, row, col, isHorizontal)
                    });
                }
            }
        } else {
            // หา anchor points ทั้งหมด
            const anchorPoints = this.findAnchors(boardState);
            
            // ลองวางทุกคำในทุก anchor point
            for (const anchor of anchorPoints) {
                for (const word of possibleWords) {
                    // ลองทั้งแนวตั้งและแนวนอน
                    for (const isHorizontal of [true, false]) {
                        const move = {
                            word,
                            row: anchor.row,
                            col: anchor.col,
                            isHorizontal
                        };
                        
                        // เพิ่มการตรวจสอบว่าคำจะไม่ออกนอกกระดาน
                        const endRow = isHorizontal ? move.row : move.row + word.length;
                        const endCol = isHorizontal ? move.col + word.length : move.col;
                        
                        if (endRow <= GRID_SIZE && endCol <= GRID_SIZE) {
                            if (await this.validateMove(move)) {
                                move.score = this.calculateMoveScore(
                                    word, 
                                    anchor.row, 
                                    anchor.col, 
                                    isHorizontal
                                );
                                moves.push(move);
                            }
                        }
                    }
                }
            }
        }

        // จัดเรียงตามคะแนนและให้มีโอกาสเลือกทั้งแนวตั้งและแนวนอน
        return this.prioritizeBalancedMoves(moves);
    }

    prioritizeBalancedMoves(moves) {
        // แยกและเรียงคะแนนตามทิศทาง
        const horizontal = moves.filter(m => m.isHorizontal).sort((a, b) => b.score - a.score);
        const vertical = moves.filter(m => !m.isHorizontal).sort((a, b) => b.score - a.score);

        // เพิ่มโบนัสให้แนวที่น้อยกว่า
        const bonus = 5; // โบนัสคะแนนเพื่อส่งเสริมความหลากหลาย
        if (horizontal.length > vertical.length * 2) {
            vertical.forEach(move => move.score += bonus);
        } else if (vertical.length > horizontal.length * 2) {
            horizontal.forEach(move => move.score += bonus);
        }

        // รวมและเรียงใหม่
        return [...horizontal, ...vertical].sort((a, b) => b.score - a.score);
    }

    alternateDirections(moves) {
        // แยกตาม direction
        const horizontal = moves.filter(m => m.isHorizontal);
        const vertical = moves.filter(m => !m.isHorizontal);

        // เรียงแต่ละกลุ่มตามคะแนน
        horizontal.sort((a, b) => b.score - a.score);
        vertical.sort((a, b) => b.score - a.score);

        // สลับระหว่างแนวตั้งและแนวนอน
        const result = [];
        const maxLength = Math.max(horizontal.length, vertical.length);
        
        for (let i = 0; i < maxLength; i++) {
            if (i < vertical.length) result.push(vertical[i]);
            if (i < horizontal.length) result.push(horizontal[i]);
        }

        return result;
    }
}

class WordValidator {
    constructor() {
        this.dictionary = new Set();
        this.cache = new Map();
        this.loadGitHubDictionary();
    }

    async loadGitHubDictionary() {
        try {
            const response = await fetch('https://raw.githubusercontent.com/raun/Scrabble/master/words.txt');
            if (!response.ok) throw new Error('Failed to load dictionary');
            const text = await response.text();
            const words = text.split('\n')
                .map(word => word.trim().toUpperCase())
                .filter(word => word.length > 0);
            words.forEach(word => this.dictionary.add(word));
            console.log(`Dictionary loaded with ${this.dictionary.size} words`);
        } catch (error) {
            console.error('Error loading dictionary:', error);
        }
    }

    isValidWord(word) {
        return this.dictionary.has(word.toUpperCase());
    }

    async validateWord(word) {
        if (!word) return false;
        const normalizedWord = word.trim().toUpperCase();
        
        // Check cache first
        if (this.cache.has(normalizedWord)) {
            return this.cache.get(normalizedWord);
        }

        // Check against dictionary only
        const isValid = this.dictionary.has(normalizedWord);
        
        // Cache the result
        this.cache.set(normalizedWord, isValid);
        
        return isValid;
    }
}
