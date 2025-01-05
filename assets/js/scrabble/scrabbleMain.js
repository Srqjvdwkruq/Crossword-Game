// Constants section - move to top
export const GRID_SIZE = 15; // Make sure this is exported

// Imort classes from scrabbleMode.js
import {  ScrabbleBot } from './scrabbleBot.js';

// Constants
export const RACK_SIZE = 7; // Rack size for player and bot

// Multiplier types for special squares
const BOARD_MULTIPLIERS = {
    TRIPLE_WORD: 'TW',
    DOUBLE_WORD: 'DW',
    TRIPLE_LETTER: 'TL',
    DOUBLE_LETTER: 'DL'
};

// Position of special squares on the board
const SPECIAL_SQUARES = {
    TW: [[0, 0], [0, 7], [0, 14], [7, 0], [7, 14], [14, 0], [14, 7], [14, 14]],
    DW: [[1, 1], [1, 13], [2, 2], [2, 12], [3, 3], [3, 11], [4, 4], [4, 10],
         [10, 4], [10, 10], [11, 3], [11, 11], [12, 2], [12, 12], [13, 1], [13, 13]],
    TL: [[1, 5], [1, 9], [5, 1], [5, 5], [5, 9], [5, 13], [9, 1], [9, 5],
         [9, 9], [9, 13], [13, 5], [13, 9]],
    DL: [[0, 3], [0, 11], [2, 6], [2, 8], [3, 0], [3, 7], [3, 14],
         [6, 2], [6, 6], [6, 8], [6, 12], [7, 3], [7, 11],
         [8, 2], [8, 6], [8, 8], [8, 12], [11, 0], [11, 7], [11, 14],
         [12, 6], [12, 8], [14, 3], [14, 11]]
};

// Data for each letter tile
export const LETTER_DATA = {
    '' : { score: 0, count: 2 },  // Blank tiles
    'A': { score: 1, count: 9 },
    'B': { score: 3, count: 2 },
    'C': { score: 3, count: 2 },
    'D': { score: 2, count: 4 },
    'E': { score: 1, count: 12 },
    'F': { score: 4, count: 2 },
    'G': { score: 2, count: 3 },
    'H': { score: 4, count: 2 },
    'I': { score: 1, count: 9 },
    'J': { score: 8, count: 1 },
    'K': { score: 5, count: 1 },
    'L': { score: 1, count: 4 },
    'M': { score: 3, count: 2 },
    'N': { score: 1, count: 6 },
    'O': { score: 1, count: 8 },
    'P': { score: 3, count: 2 },
    'Q': { score: 10, count: 1 },
    'R': { score: 1, count: 6 },
    'S': { score: 1, count: 4 },
    'T': { score: 1, count: 6 },
    'U': { score: 1, count: 4 },
    'V': { score: 4, count: 2 },
    'W': { score: 4, count: 2 },
    'X': { score: 8, count: 1 },
    'Y': { score: 4, count: 2 },
    'Z': { score: 10, count: 1 }
};

// เพิ่มตัวแปร INITIAL_LETTER_DATA เพื่อเก็บค่าเริ่มต้น
export const INITIAL_LETTER_DATA = {
    '' : { score: 0, count: 2 },  
    'A': { score: 1, count: 9 },
    'B': { score: 3, count: 2 },
    'C': { score: 3, count: 2 },
    'D': { score: 2, count: 4 },
    'E': { score: 1, count: 12 },
    'F': { score: 4, count: 2 },
    'G': { score: 2, count: 3 },
    'H': { score: 4, count: 2 },
    'I': { score: 1, count: 9 },
    'J': { score: 8, count: 1 },
    'K': { score: 5, count: 1 },
    'L': { score: 1, count: 4 },
    'M': { score: 3, count: 2 },
    'N': { score: 1, count: 6 },
    'O': { score: 1, count: 8 },
    'P': { score: 3, count: 2 },
    'Q': { score: 10, count: 1 },
    'R': { score: 1, count: 6 },
    'S': { score: 1, count: 4 },
    'T': { score: 1, count: 6 },
    'U': { score: 1, count: 4 },
    'V': { score: 4, count: 2 },
    'W': { score: 4, count: 2 },
    'X': { score: 8, count: 1 },
    'Y': { score: 4, count: 2 },
    'Z': { score: 10, count: 1 }
};

function showConfirmBox(message, onConfirm, onCancel) {
    const confirmBox = document.getElementById('confirmBox');
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmYes = document.getElementById('confirmYes');
    const confirmNo = document.getElementById('confirmNo');

    if (!confirmBox || !confirmMessage || !confirmYes || !confirmNo) {
        console.error('Confirmation box elements not found');
        return;
    }

    confirmMessage.textContent = message;
    confirmBox.style.display = 'flex';

    // Remove existing listeners
    const newConfirmYes = confirmYes.cloneNode(true);
    const newConfirmNo = confirmNo.cloneNode(true);
    confirmYes.parentNode.replaceChild(newConfirmYes, confirmYes);
    confirmNo.parentNode.replaceChild(newConfirmNo, confirmNo);

    // Add new listeners
    newConfirmYes.addEventListener('click', () => {
        confirmBox.style.display = 'none';
        if (onConfirm) onConfirm();
    });

    newConfirmNo.addEventListener('click', () => {
        confirmBox.style.display = 'none';
        if (onCancel) onCancel();
    });
}

export function validateTileBagTotal() {
    const totalTiles = Object.values(LETTER_DATA)
        .reduce((sum, tile) => sum + tile.count, 0);
    console.log(`Total tiles in bag: ${totalTiles}`);
    if (totalTiles !== 100) {
        console.error('Error: Total tiles do not add up to 100!');
    }
}


function validateGameStart() {
    const totalLetters = Object.values(LETTER_DATA)
        .reduce((sum, {count}) => sum + count, 0);

    console.log('Validating total letters:', totalLetters);

    if (totalLetters !== 100) {
        console.error(`Invalid letter count (${totalLetters}), resetting game...`);
        resetLetterData();
        validateTileBagTotal(); // ตรวจสอบหลังรีเซ็ต
        return false;
    }
    return true;
}


function validateLetterAvailability() {
    const totalLetters = Object.values(LETTER_DATA)
        .reduce((sum, {count}) => sum + count, 0);
    
    if (totalLetters < 14) { // ต้องมีพอสำหรับทั้ง player และ bot
        console.error(`Not enough letters available: ${totalLetters}`);
        return false;
    }
    return true;
}

export function resetLetterData() {
    try {
        // Reset values from INITIAL_LETTER_DATA
        Object.keys(LETTER_DATA).forEach(letter => {
            if (INITIAL_LETTER_DATA[letter]) {
                LETTER_DATA[letter].count = INITIAL_LETTER_DATA[letter].count;
                LETTER_DATA[letter].score = INITIAL_LETTER_DATA[letter].score;
            }
        });

        // Validate the total tile count after reset
        validateTileBagTotal();
        console.log('Letter data has been reset to initial values');
    } catch (error) {
        console.error('Error resetting letter data:', error);
    }
}


export function updateTileBagCounts() {
    const availableLettersDiv = document.getElementById('available-letters');
    const vowelsCount = document.getElementById('vowelsCount');
    const consonantsCount = document.getElementById('consonantsCount');
    const totalTilesElement = document.getElementById('totalTiles');

    let vowels = 0;
    let consonants = 0;
    let total = 0;

    let lettersHTML = '';
    for (const [letter, data] of Object.entries(LETTER_DATA)) {
        const displayLetter = letter === '' ? '?' : letter;
        total += data.count;

        if ('AEIOU'.includes(letter)) {
            vowels += data.count;
        } else if (letter !== '') {
            consonants += data.count;
        }

        lettersHTML += `
            <div class="letter-count">
                <span class="letter">${displayLetter}=${data.count}</span>
            </div>
        `;
    }
    
    if (vowelsCount) vowelsCount.textContent = vowels;
    if (consonantsCount) consonantsCount.textContent = consonants;
    if (totalTilesElement) totalTilesElement.textContent = total;
    if (availableLettersDiv) availableLettersDiv.innerHTML = lettersHTML;
    
    //console.log('Updated tile counts - Total:', total, 'Vowels:', vowels, 'Consonants:', consonants);
}

function initializeLetterData() {
    // Initialize letter data
    const initialLetterData = { ...LETTER_DATA };
    
    // Reset all counts to initial values
    Object.keys(LETTER_DATA).forEach(letter => {
        LETTER_DATA[letter].count = initialLetterData[letter].count;
    });
    
    updateTileBagCounts();
}

function cleanupGame() {
    if (window.location.pathname.includes('scrabble_cw.html')) {
        resetLetterData();
        updateTileBagCounts();
        console.log('Game data reset completed');
    }
}

// Update dictionary APIs
export const DICTIONARY_APIS = [
    'https://api.datamuse.com/words?sp=*',
    './data/fallbackDictionary.json'
];

const utils = {
    queryCell: (row, col) => document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`),
    getTileInCell: (cell) => cell?.querySelector('.tile'),
    getLetterContent: (cell) => cell?.querySelector('.letter-content')?.textContent || '',
    isValidPosition: (row, col) => row >= 0 && row < GRID_SIZE && col >= 0 && col < GRID_SIZE,
    createStar: () => {
        const star = document.createElement('i');
        star.className = 'fa-solid fa-star';
        return star;
    }
};

// Make utilities available globally
window.gameUtils = utils;

// Export utils with other exports
export { utils };

class WordValidator {
    constructor() {
        this.cache = new Map();
        this.validationTimeouts = new Map();
        this.dictionary = new Set();
        this.minimumWordLength = 2;
        this.loadGitHubDictionary();
    }

    async loadGitHubDictionary() {
        try {
            // ใช้ raw content URL จาก GitHub
            const response = await fetch('https://raw.githubusercontent.com/raun/Scrabble/master/words.txt');
            if (!response.ok) {
                throw new Error('Failed to load GitHub dictionary');
            }
            
            const text = await response.text();
            // แยกคำด้วย newline และเพิ่มเข้า Set
            const words = text.split('\n')
                .map(word => word.trim().toUpperCase())
                .filter(word => word.length > 0);
            
            this.dictionary = new Set(words);
            console.log(`GitHub dictionary loaded with ${this.dictionary.size} words`);

            // สำรองข้อมูลลง localStorage
            try {
                localStorage.setItem('scrabbleDictionary', JSON.stringify(Array.from(this.dictionary)));
            } catch (e) {
                console.warn('Could not cache dictionary to localStorage:', e);
            }

        } catch (error) {
            console.error('Error loading GitHub dictionary:', error);
            // ถ้าโหลดไม่สำเร็จ ลองใช้ข้อมูลจาก localStorage
            try {
                const cachedDict = localStorage.getItem('scrabbleDictionary');
                if (cachedDict) {
                    this.dictionary = new Set(JSON.parse(cachedDict));
                    console.log(`Loaded ${this.dictionary.size} words from cache`);
                } else {
                    // ถ้าไม่มีข้อมูลใน cache ให้ใช้ fallback dictionary
                    this.loadFallbackDictionary();
                }
            } catch (e) {
                console.error('Error loading cached dictionary:', e);
                this.loadFallbackDictionary();
            }
        }
    }

    async loadFallbackDictionary() {
        try {
            const response = await fetch('./data/fallbackDictionary.json');
            if (!response.ok) throw new Error('Failed to load fallback dictionary');
            
            const data = await response.json();
            this.dictionary = new Set(data.words.map(w => w.toUpperCase()));
            console.log(`Fallback dictionary loaded with ${this.dictionary.size} words`);
        } catch (error) {
            console.error('Error loading fallback dictionary:', error);
            this.dictionary = new Set();
        }
    }

    debounceValidate(word, cells, delay = 300) {
        if (!word || word.length < this.minimumWordLength) {
            cells.forEach(cell => {
                const tile = cell.querySelector('.tile');
                if (tile) {
                    tile.classList.remove('valid-word', 'invalid-word', 'validating');
                }
            });
            return;
        }

        // Clear existing timeout for this word
        if (this.validationTimeouts.has(word)) {
            clearTimeout(this.validationTimeouts.get(word));
        }

        // Add validating state
        cells.forEach(cell => {
            const tile = cell.querySelector('.tile');
            if (tile) {
                tile.classList.remove('valid-word', 'invalid-word');
                tile.classList.add('validating');
            }
        });

        // Set new timeout
        const timeoutId = setTimeout(async () => {
            try {
                // ใช้เฉพาะ dictionary ไม่เรียก API
                const isValid = this.dictionary.has(word.toUpperCase());
                
                cells.forEach(cell => {
                    const tile = cell.querySelector('.tile');
                    if (tile) {
                        tile.classList.remove('validating');
                        tile.classList.add(isValid ? 'valid-word' : 'invalid-word');
                    }
                });

                this.validationTimeouts.delete(word);
                
            } catch (error) {
                console.error('Validation error:', error);
                cells.forEach(cell => {
                    const tile = cell.querySelector('.tile');
                    if (tile) {
                        tile.classList.remove('validating', 'valid-word', 'invalid-word');
                    }
                });
            }
        }, delay);

        this.validationTimeouts.set(word, timeoutId);
    }

    async validateWord(word) {
        if (!word || word.length < this.minimumWordLength) return false;
        
        const normalizedWord = word.trim().toUpperCase();
        
        // Check cache first
        if (this.cache.has(normalizedWord)) {
            return this.cache.get(normalizedWord);
        }

        // Check dictionary only, no API call
        const isValid = this.dictionary.has(normalizedWord);
        this.cache.set(normalizedWord, isValid);
        return isValid;
    }
}


//Core Classes
class LetterManager {
    constructor() {
        // Use LETTER_DATA from shared data
        this.letterData = LETTER_DATA;
        this.validateData();
        console.log('Letter manager initialized with shared data');
    }

    validateData() {
        const total = Object.values(this.letterData)
            .reduce((sum, {count}) => sum + count, 0);
        if (total !== 100) {
            console.warn('Invalid letter count, resetting...');
            resetLetterData(); // Corrected function name
        }
    }

    getRandomLetter() {
        const maxAttempts = 3;
        let attempts = 0;
    
        while (attempts < maxAttempts) {
            const availableLetters = Object.entries(LETTER_DATA)
                .filter(([_, data]) => data.count > 0)
                .map(([letter]) => letter);
    
            if (availableLetters.length === 0) {
                console.log('No letters available in the bag.');
                validateTileBagTotal(); // ตรวจสอบว่าจำนวนถูกต้อง
                return null;
            }
    
            const randomIndex = Math.floor(Math.random() * availableLetters.length);
            const selectedLetter = availableLetters[randomIndex];
    
            if (LETTER_DATA[selectedLetter].count > 0) {
                LETTER_DATA[selectedLetter].count--;
                console.log(`Letter ${selectedLetter} removed. Remaining:`, LETTER_DATA[selectedLetter].count);
                updateTileBagCounts(); // อัปเดตการแสดงผล
                validateTileBagTotal(); // ตรวจสอบหลังการแจก
                return selectedLetter;
            }
    
            attempts++;
            console.log(`Failed to get letter, attempt ${attempts}/${maxAttempts}`);
        }
    
        console.error('Failed to get letter after multiple attempts.');
        return null;
    }
    
    
}

class ScrabbleBoard {
    constructor(letterRack) {
        this.boardSize = GRID_SIZE;
        this.letterRack = letterRack;
        this.createBoard();
        this.setupDragAndDrop();
        this.wordValidator = new WordValidator();
        this.placedTiles = new Map();
    }

    createBoard() {
        const grid = document.querySelector('.scrabble-grid');
        if (!grid) {
            console.error('Grid element not found');
            return;
        }

        console.log('Creating board...');
        grid.innerHTML = '';
        grid.style.display = 'grid';
        grid.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;
        grid.style.gridTemplateRows = `repeat(${this.boardSize}, 1fr)`;

        // Create cells
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.dataset.cellId = `cell-${i}-${j}`;
                
                
                this.setSpecialCell(cell, i, j);
                
                grid.appendChild(cell);
            }
        }
    }

    setSpecialCell(cell, row, col) {
        // Center Position - ไม่มีคะแนนพิเศษ
        if (row === 7 && col === 7) {
            cell.classList.add('start');
            const star = document.createElement('i');
            star.className = 'fa-solid fa-star';
            cell.appendChild(star);
            return; // ออกจากฟังก์ชันทันทีสำหรับช่องกลาง
        }

        // Configure special squares - แยกการตั้งค่าช่องพิเศษออกจากช่องกลาง
        if (SPECIAL_SQUARES.TW.some(([r, c]) => r === row && c === col)) {
            cell.classList.add('tw');
            cell.dataset.multiplier = 'TW';
        }
        else if (SPECIAL_SQUARES.DW.some(([r, c]) => r === row && c === col)) {
            cell.classList.add('dw');
            cell.dataset.multiplier = 'DW';
        }
        else if (SPECIAL_SQUARES.TL.some(([r, c]) => r === row && c === col)) {
            cell.classList.add('tl');
            cell.dataset.multiplier = 'TL';
        }
        else if (SPECIAL_SQUARES.DL.some(([r, c]) => r === row && c === col)) {
            cell.classList.add('dl');
            cell.dataset.multiplier = 'DL';
        }
    }

    // Create tile element
    createTile(letter) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.id = 'tile-' + Date.now();
        tile.draggable = true;
        tile.textContent = letter;

        return tile;
    }

    // Manage star icon
    handleStar(cell, isRemoving = true) {
        if (cell.classList.contains('start')) {
            const existingStar = cell.querySelector('.fa-star');
            if (isRemoving && existingStar) {
                existingStar.remove();
            } else if (!isRemoving && !existingStar) {
                const star = document.createElement('i');
                star.className = 'fa-solid fa-star';
                cell.appendChild(star);
            }
        }
    }

    // Manage tile placement
    handleTilePlacement(cell, letter, sourceTile = null) {
        // Check if it's player's turn
        if (!window.gameManager.isPlayerTurn) return false;
        
        // ตรวจสอบว่ามี tile อยู่แล้วหรือไม่
        const existingTile = cell.querySelector('.tile');
        if (existingTile) {
            if (existingTile.classList.contains('submitted') || 
                existingTile.classList.contains('bot-played')) {
                return false;
            }
            // ถ้ามี tile ที่ไม่ได้ submit ให้ลบออกก่อน
            cell.removeChild(existingTile);
        }

        // Remove source tile and its data if exists
        if (sourceTile) {
            const sourceCell = sourceTile.closest('.cell');
            if (sourceCell) {
                // ลบข้อมูลจาก placedTiles และ letterRack
                const sourceCellId = sourceCell.dataset.cellId;
                this.letterRack.placedLetters.delete(sourceCellId);
                this.placedTiles.delete(`${sourceCell.dataset.row}-${sourceCell.dataset.col}`);
                sourceTile.remove();

                // คืนดาวให้ช่องกลางถ้าจำเป็น
                if (sourceCell.classList.contains('start') && !sourceCell.querySelector('.fa-star')) {
                    const star = document.createElement('i');
                    star.className = 'fa-solid fa-star';
                    sourceCell.appendChild(star);
                }
            }
        }

        // Delete star if it's center cell
        this.handleStar(cell, true);

        // Create and place new tile
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.draggable = true;
        tile.id = 'tile-' + Date.now();
        
        // Add letter content
        const letterContent = document.createElement('span');
        letterContent.className = 'letter-content';
        letterContent.textContent = letter;
        tile.appendChild(letterContent);
        
        // Add drag events
        tile.addEventListener('dragstart', (e) => {
            // ถ้าเป็น tile ที่ submit แล้ว ไม่อนุญาตให้ลาก
            if (tile.classList.contains('submitted') || tile.classList.contains('bot-played')) {
                e.preventDefault();
                return;
            }

            e.dataTransfer.setData('text/plain', letter);
            e.dataTransfer.setData('sourceId', tile.id);
            e.dataTransfer.effectAllowed = 'move';
            tile.dataset.lastPosition = `${cell.dataset.row}-${cell.dataset.col}`;
        });

        tile.addEventListener('dragend', (e) => {
            if (e.dataTransfer.dropEffect === 'none') {
                // ถ้าลากไปที่ไม่สามารถวางได้ ให้ย้ายกลับตำแหน่งเดิม
                const lastPos = tile.dataset.lastPosition;
                if (lastPos) {
                    const [lastRow, lastCol] = lastPos.split('-');
                    const lastCell = this.queryCell(lastRow, lastCol);
                    if (lastCell && !lastCell.querySelector('.tile')) {
                        lastCell.appendChild(tile);
                        // อัพเดทข้อมูลการวาง
                        this.letterRack.placedLetters.set(lastCell.dataset.cellId, letter);
                        this.placedTiles.set(lastPos, letter);
                    }
                }
            }
        });
        
        // Place tile and update data
        cell.appendChild(tile);
        this.letterRack.placedLetters.set(cell.dataset.cellId, letter);
        this.placedTiles.set(`${cell.dataset.row}-${cell.dataset.col}`, letter);
        this.letterRack.updateButtonState();

        // Check word validation
        const words = this.findWordsFromCell(cell, letter);
        if (words.length > 0) {
            console.log('Found words:', words);
            words.forEach(({word, cells}) => {
                this.wordValidator.debounceValidate(word, cells);
            });
        }

        return true;
    }

    validateWordAtCell(cell, tile, letter) {
        // ตรวจหาคำที่เกิดจากการวางตัวอักษร
        const words = this.findWordsFromCell(cell, letter);
        words.forEach(word => {
            if (word.length > 1) {
                this.wordValidator.debounceValidate(word, tile);
            }
        });
    }

    getCompleteWord(startRow, startCol, deltaRow, deltaCol) {
        let word = '';
        let row = startRow;
        let col = startCol;
        let length = 0;
        
        // ตรวจสอบข้างเคียงในทิศทางตรงข้าม
        const checkAdjacent = (r, c) => {
            if (deltaRow === 0) { // แนวนอน - ตรวจบนล่าง
                return (r > 0 && this.hasLetterAt(r - 1, c)) ||
                       (r < GRID_SIZE - 1 && this.hasLetterAt(r + 1, c));
            } else { // แนวตั้ง - ตรวจซ้ายขวา
                return (c > 0 && this.hasLetterAt(r, c - 1)) ||
                       (c < GRID_SIZE - 1 && this.hasLetterAt(r, c + 1));
            }
        };

        // อ่านคำ
        while (utils.isValidPosition(row, col)) {
            const letter = this.getLetterAt(row, col);
            if (!letter) break;
            
            word += letter;
            length++;

            row += deltaRow;
            col += deltaCol;
        }

        // ถ้าเป็นตัวเดียว ตรวจสอบว่ามีตัวอักษรติดกันหรือไม่
        if (length === 1) {
            return checkAdjacent(startRow, startCol) ? word : null;
        }

        // ถ้ามีมากกว่า 1 ตัว ให้คืนค่าคำนั้นเลย
        return length >= 2 ? word : null;
    }

    findWordsFromCell(cell, letter) {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        
        this.placedTiles.set(`${row}-${col}`, letter);
        const words = [];

        // หาจุดเริ่มต้นของคำแนวนอน
        let startCol = col;
        while (startCol > 0 && this.hasLetterAt(row, startCol - 1)) startCol--;
        
        // ตรวจสอบว่ามีคำแนวนอนที่ยาวกว่า 1 ตัวหรือไม่
        let horizontalWord = '';
        let horizontalCells = [];
        let currentCol = startCol;
        
        while (currentCol < GRID_SIZE && this.hasLetterAt(row, currentCol)) {
            const cell = utils.queryCell(row, currentCol);
            horizontalWord += this.getLetterAt(row, currentCol);
            horizontalCells.push(cell);
            currentCol++;
        }

        if (horizontalWord.length > 1) {
            words.push({
                word: horizontalWord,
                cells: horizontalCells
            });
        }

        // หาจุดเริ่มต้นของคำแนวตั้ง
        let startRow = row;
        while (startRow > 0 && this.hasLetterAt(startRow - 1, col)) startRow--;
        
        // ตรวจสอบว่ามีคำแนวตั้งที่ยาวกว่า 1 ตัวหรือไม่
        let verticalWord = '';
        let verticalCells = [];
        let currentRow = startRow;
        
        while (currentRow < GRID_SIZE && this.hasLetterAt(currentRow, col)) {
            const cell = utils.queryCell(currentRow, col);
            verticalWord += this.getLetterAt(currentRow, col);
            verticalCells.push(cell);
            currentRow++;
        }

        if (verticalWord.length > 1) {
            words.push({
                word: verticalWord,
                cells: verticalCells
            });
        }

        return words;
    }

    getWordCells(startRow, startCol, deltaRow, deltaCol, length) {
        const cells = [];
        let row = startRow;
        let col = startCol;
        
        for (let i = 0; i < length; i++) {
            const cell = document.querySelector(
                `.cell[data-row="${row}"][data-col="${col}"]`
            );
            if (cell) cells.push(cell);
            row += deltaRow;
            col += deltaCol;
        }
        
        return cells;
    }

    hasLetterAt(row, col) {
        if (!utils.isValidPosition(row, col)) return false;
        const key = `${row}-${col}`;
        if (this.placedTiles.has(key)) return true;
        const cell = utils.queryCell(row, col);
        return utils.getTileInCell(cell) !== null;
    }

    getLetterAt(row, col) {
        const key = `${row}-${col}`;
        if (this.placedTiles.has(key)) {
            return this.placedTiles.get(key);
        }
        const cell = utils.queryCell(row, col);
        return utils.getLetterContent(cell);
    }

    setupDragAndDrop() {
        const cells = document.querySelectorAll('.scrabble-grid .cell');
        
        cells.forEach(cell => {
            // จัดการ dragover
            cell.addEventListener('dragover', (e) => {
                e.preventDefault();
                const tile = cell.querySelector('.tile');
                
                // ถ้ามี tile ที่ submit แล้ว หรือเป็น bot tile ให้ยกเลิกการ drop
                if (tile && (tile.classList.contains('submitted') || tile.classList.contains('bot-played'))) {
                    e.dataTransfer.dropEffect = 'none';
                    return;
                }

                e.dataTransfer.dropEffect = 'move';
                if (!tile) {
                    cell.classList.add('drag-over');
                }
            });

            // จัดการ dragleave
            cell.addEventListener('dragleave', () => {
                cell.classList.remove('drag-over');
            });

            // จัดการ drop
            cell.addEventListener('drop', (e) => {
                e.preventDefault();
                cell.classList.remove('drag-over');

                const existingTile = cell.querySelector('.tile');
                // ตรวจสอบว่ามี tile อยู่แล้วหรือไม่ และเป็น tile ที่ submit แล้วหรือไม่
                if (existingTile && (
                    existingTile.classList.contains('submitted') || 
                    existingTile.classList.contains('bot-played')
                )) {
                    return;
                }

                if (!existingTile) {
                    const letter = e.dataTransfer.getData('text/plain');
                    const sourceId = e.dataTransfer.getData('sourceId');
                    const sourceTile = document.getElementById(sourceId);
                    
                    if (sourceTile) {
                        // ลบข้อมูลตำแหน่งเดิมก่อนย้าย
                        const oldCell = sourceTile.closest('.cell');
                        if (oldCell) {
                            // ลบข้อมูลจาก placedTiles และ letterRack
                            this.placedTiles.delete(`${oldCell.dataset.row}-${oldCell.dataset.col}`);
                            if (this.letterRack.placedLetters) {
                                this.letterRack.placedLetters.delete(oldCell.dataset.cellId);
                            }
                            
                            // คืนดาวให้ช่องกลางถ้าจำเป็น
                            if (oldCell.classList.contains('start')) {
                                const star = document.createElement('i');
                                star.className = 'fa-solid fa-star';
                                oldCell.appendChild(star);
                            }
                        }
                        this.handleTilePlacement(cell, letter, sourceTile);
                    }
                }
            });
        });
    }
    
    placeLetter(row, col, letter) {
        const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
        if (cell && !cell.querySelector('.tile')) {
            this.handleTilePlacement(cell, letter);
            return true;
        }
        return false;
    }
}

class LetterRack {
    constructor(letterManager) {
        this.rack = document.getElementById('letter-rack');
        this.letters = [];
        this.placedLetters = new Map();
        this.maxLetters = RACK_SIZE;
        this.letterManager = letterManager;
        this.fillInitialRack(); 
        this.updateRackDisplay();
        this.hasShuffled = false;
        this.setupButtons();
    }

    setupButtons() {
        const undoBtn = document.getElementById('undoBtn');
        const shuffleBtn = document.getElementById('shuffleBtn');
        
        // Disable undo initially
        undoBtn.disabled = true;
        undoBtn.style.opacity = '0.5';
        
        const shuffleHandler = () => {
            if (this.letters.length > 0) {
                this.shuffleLetters();
            }
        };
    
        shuffleBtn?.addEventListener('click', shuffleHandler);
        
        undoBtn?.addEventListener('click', () => {
            if (this.placedLetters.size > 0) {
                this.returnLettersToRack();
                this.clearBoardLetters();
            }
        });
    }

    clearBoardLetters() {
        const cells = document.querySelectorAll('.scrabble-grid .cell');
        cells.forEach(cell => {
            const tile = cell.querySelector('.tile');
            if (tile) {
                const isSubmitted = tile.classList.contains('submitted');
                if (!isSubmitted) {
                    // Remove validation classes before removing tile
                    tile.classList.remove('valid-word', 'invalid-word', 'validating');
                    
                    const letter = tile.querySelector('.letter-content')?.textContent;
                    if (letter) {
                        this.letters.push(letter);
                    }
                    tile.remove();

                    // Restore star if needed
                    if (cell.classList.contains('start')) {
                        const existingStar = cell.querySelector('.fa-star');
                        if (!existingStar) {
                            const star = document.createElement('i');
                            star.className = 'fa-solid fa-star';
                            cell.appendChild(star);
                        }
                    }
                }
            }
        });
        this.updateRackDisplay();
    }

    returnLettersToRack() {
        const boardTiles = document.querySelectorAll('.scrabble-grid .cell .tile');
        const returningLetters = [];
    
        // Collect all letters from board first
        boardTiles.forEach(tile => {
            // ตรวจสอบว่าตัวอักษรไม่อยู่ในสถานะ submitted และไม่ใช่ bot-played
            const isNotSubmittedOrBotPlayed = !tile.classList.contains('submitted') && !tile.classList.contains('bot-played');
    
            if (isNotSubmittedOrBotPlayed) {
                const letter = tile.querySelector('.letter-content')?.textContent;
                if (letter) {
                    returningLetters.push(letter);
                    const cell = tile.closest('.cell');
    
                    // Restore star if needed
                    if (cell && cell.classList.contains('start')) {
                        const star = document.createElement('i');
                        star.className = 'fa-solid fa-star';
                        cell.appendChild(star);
                    }
                    tile.remove();
                }
            }
        });
    
        // Add letters back to rack while respecting RACK_SIZE limit
        const availableSlots = this.maxLetters - this.letters.length;
        const lettersToAdd = returningLetters.slice(0, availableSlots);
    
        lettersToAdd.forEach(letter => {
            if (this.letters.length < this.maxLetters) {
                this.letters.push(letter);
            }
        });
    
        // Update rack display and button states
        this.updateRackDisplay();
        this.placedLetters.clear();
        this.updateButtonState();
    
        // Log any letters that couldn't be returned
        const remainingLetters = returningLetters.slice(availableSlots);
        if (remainingLetters.length > 0) {
            console.warn('Some letters could not be returned to rack:', remainingLetters);
        }
    }    

    createLetterTile(letter) {
        const tile = document.createElement('span');
        tile.className = 'letter-tile';
        tile.draggable = true;
        tile.id = 'rack-tile-' + Date.now();
        tile.dataset.letter = letter;
    
        // เพิ่มตัวอักษร
        const letterContent = document.createElement('span');
        letterContent.className = 'letter-content';
        letterContent.textContent = letter;
    
        // เพิ่มคะแนน
        const score = document.createElement('span');
        score.className = 'letter-score';
        score.textContent = LETTER_DATA[letter]?.score || 0;
    
        // เพิ่มเนื้อหาใน tile
        tile.appendChild(letterContent);
        tile.appendChild(score);
    
        return tile;
    }

    fillInitialRack() {
        this.letters = [];
        const initialAttempts = 0;
        const maxInitialAttempts = 3;
        
        while (this.letters.length < this.maxLetters && initialAttempts < maxInitialAttempts) {
            // Reset LETTER_DATA if not enough letters available
            if (!this.hasEnoughLetters()) {
                console.warn('Not enough letters in bag, resetting...');
                resetLetterData();
                this.letterManager.validateData();
            }
            
            const letter = this.letterManager.getRandomLetter();
            if (!letter) {
                console.error('Failed to get letter, retrying...');
                continue;
            }
            this.letters.push(letter);
        }

        // Final validation
        if (this.letters.length < this.maxLetters) {
            console.error('Failed to fill rack after multiple attempts');
            // Force reset and try one final time
            resetLetterData();
            this.fillInitialRack();
            return;
        }

        console.log('Initial rack filled:', this.letters);
        this.updateRackDisplay();
    }

    hasEnoughLetters() {
        const totalAvailable = Object.values(LETTER_DATA)
            .reduce((sum, {count}) => sum + count, 0);
        return totalAvailable >= this.maxLetters;
    }

    fillRack() {
        while (this.letters.length < this.maxLetters) {
            const letter = this.letterManager.getRandomLetter();
            if (!letter) break;
            this.letters.push(letter);
        }
        console.log('Rack filled:', this.letters);
        validateTileBagTotal(); // ตรวจสอบว่าจำนวนตัวอักษรยังถูกต้อง
        this.updateRackDisplay(); // เปลี่ยนจาก updateDisplay เป็น updateRackDisplay
    }
    
    

    refreshLetters() {
        // Return letters to the bag
        this.letters.forEach(letter => {
            this.letterManager.returnLetter(letter);
        });
        
        // Clear and refill rack
        this.letters = [];
        this.fillRack();
        updateTileBagCounts();
    }

    returnLettersToRack() {
        const boardTiles = document.querySelectorAll('.scrabble-grid .cell .tile');
        const returningLetters = [];
    
        // Collect all letters from board, skipping submitted or bot-played tiles
        boardTiles.forEach(tile => {
            const isReturnable = !tile.classList.contains('submitted') && !tile.classList.contains('bot-played');
    
            if (isReturnable) {
                const letter = tile.querySelector('.letter-content')?.textContent;
                if (letter) {
                    returningLetters.push(letter);
                    const cell = tile.closest('.cell');
    
                    // Restore star if applicable
                    if (cell && cell.classList.contains('start')) {
                        const star = document.createElement('i');
                        star.className = 'fa-solid fa-star';
                        cell.appendChild(star);
                    }
    
                    // Reset all validation-related classes
                    tile.classList.remove('valid-word', 'invalid-word', 'validating');
                    tile.remove();
                }
            } else {
                // Remove any lingering validation classes from non-returnable tiles
                tile.classList.remove('valid-word', 'invalid-word', 'validating');
            }
        });
    
        // Add letters back to rack, ensuring it does not exceed max capacity
        const availableSlots = this.maxLetters - this.letters.length;
        const lettersToAdd = returningLetters.slice(0, availableSlots);
    
        lettersToAdd.forEach(letter => {
            if (this.letters.length < this.maxLetters) {
                this.letters.push(letter);
            }
        });
    
        // Update rack display and button states
        this.updateRackDisplay();
        this.placedLetters.clear();
        this.updateButtonState();
    
        // Log any letters that couldn't fit back into the rack
        const excessLetters = returningLetters.slice(availableSlots);
        if (excessLetters.length > 0) {
            console.warn('Excess letters that could not fit in rack:', excessLetters);
        }
    
        // Validate final rack state
        if (this.letters.length > this.maxLetters) {
            console.error('Rack contains more letters than allowed!');
        }
    }
    
    
    

    updateRackDisplay() {
        // Clear current rack display
        while (this.rack.firstChild) {
            this.rack.removeChild(this.rack.firstChild);
        }
        
        // Add tiles for each letter
        this.letters.forEach(letter => {
            const tile = this.createLetterTile(letter);
            this.setupTileDragEvents(tile, letter);
            this.rack.appendChild(tile);
        });
    }

    setupTileDragEvents(tile, letter) {
        let touchStartX = 0;
        let touchStartY = 0;
        let isDragging = false;
        let dragElement = null;

        // Mouse/Desktop events
        tile.addEventListener('dragstart', (e) => {
            if (!window.gameManager.isPlayerTurn) {
                e.preventDefault();
                return;
            }
            
            e.dataTransfer.setData('text/plain', letter);
            e.dataTransfer.setData('sourceId', tile.id);
            e.dataTransfer.effectAllowed = 'move';
            tile.classList.add('dragging');
        });

        // Touch events
        tile.addEventListener('touchstart', (e) => {
            if (!window.gameManager.isPlayerTurn) return;
            
            touchStartX = e.touches[0].clientX;
            touchStartY = e.touches[0].clientY;
            isDragging = true;

            // Create ghost element for dragging
            dragElement = tile.cloneNode(true);
            dragElement.classList.add('touch-dragging');
            document.body.appendChild(dragElement);
            
            // Position the ghost element
            dragElement.style.left = `${touchStartX - dragElement.offsetWidth / 2}px`;
            dragElement.style.top = `${touchStartY - dragElement.offsetHeight / 2}px`;
        }, { passive: false });

        tile.addEventListener('touchmove', (e) => {
            if (!isDragging || !dragElement) return;
            e.preventDefault();

            const touch = e.touches[0];
            dragElement.style.left = `${touch.clientX - dragElement.offsetWidth / 2}px`;
            dragElement.style.top = `${touch.clientY - dragElement.offsetHeight / 2}px`;

            // Find target cell
            const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
            const cell = targetElement?.closest('.cell');
            
            // Remove previous highlights
            document.querySelectorAll('.cell').forEach(c => c.classList.remove('drag-over'));
            
            // Add highlight to valid target
            if (cell && !cell.querySelector('.tile')) {
                cell.classList.add('drag-over');
            }
        }, { passive: false });

        tile.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            e.preventDefault();
            
            const touch = e.changedTouches[0];
            const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
            const cell = targetElement?.closest('.cell');

            if (cell && !cell.querySelector('.tile')) {
                // Place tile in cell
                this.letters = this.letters.filter(l => l !== letter);
                window.gameBoard.handleTilePlacement(cell, letter);
            }

            // Cleanup
            isDragging = false;
            if (dragElement) {
                dragElement.remove();
                dragElement = null;
            }
            document.querySelectorAll('.cell').forEach(c => c.classList.remove('drag-over'));
            this.updateRackDisplay();
        }, { passive: false });

        tile.addEventListener('dragend', (e) => {
            tile.classList.remove('dragging');
            if (e.dataTransfer.dropEffect === 'move') {
                const index = this.letters.indexOf(letter);
                if (index > -1) {
                    this.letters.splice(index, 1);
                    tile.remove();
                }
                this.updateButtonState();
            }
        });
    }

    shuffleLetters() {
        // สลับเฉพาะตัวอักษรที่มีอยู่ใน this.letters เท่านั้น
        for (let i = this.letters.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.letters[i], this.letters[j]] = [this.letters[j], this.letters[i]];
        }
        // อัพเดทการแสดงผลหลังจากสลับตัวอักษร
        this.updateRackDisplay();
        console.log('Shuffled letters:', this.letters);
    }
    

    updateButtonState() {
        const shuffleBtn = document.getElementById('shuffleBtn');
        const undoBtn = document.getElementById('undoBtn');
        const isPlayerTurn = window.gameManager?.isPlayerTurn;
        
        // Shuffle button is always enabled when there are letters
        shuffleBtn.disabled = this.letters.length === 0;
        shuffleBtn.style.opacity = shuffleBtn.disabled ? '0.5' : '1';
        
        // Undo button is only enabled during player's turn and when there are placed letters
        undoBtn.disabled = !isPlayerTurn || this.placedLetters.size === 0;
        undoBtn.style.opacity = undoBtn.disabled ? '0.5' : '1';
    }
}

class GameControls {
    constructor(letterRack, board) {
        this.letterRack = letterRack;
        this.board = board;
        this.setupActionButtons();
        this.setupMenuButtons();
        this.setupSwapModal();
        this.playerWord = new Set();
    }

    setupMenuButtons() {
        const quitBtn = document.getElementById('quitBtn');
        if (quitBtn) {
            quitBtn.addEventListener('click', () => {
                showConfirmBox('Are you sure you want to quit?', 
                    () => {
                        resetLetterData();
                        window.location.href = '../index.html';
                    }, 
                    () => console.log('Quit canceled')
                );
            });
        }
    }

    handleResign() {
        showConfirmBox('Are you sure you want to resign?', 
            () => {
                // Get final scores
                const playerScore = parseInt(document.getElementById('playerScore').textContent) || 0;
                const botScore = parseInt(document.getElementById('botScore').textContent) || 0;

                // Show score screen
                const scoreScreen = document.querySelector('.score-screen');
                const scoreContent = document.querySelector('.score-content');
                
                // Bot wins when player resigns
                scoreContent.innerHTML = `
                    <h2>Game Over!</h2>
                    <div class="final-scores">
                        <div class="score-item">
                            <h3>Player</h3>
                            <div class="score">${playerScore}</div>
                        </div>
                        <div class="score-item">
                            <h3>Bot</h3>
                            <div class="score">${botScore}</div>
                        </div>
                    </div>
                    <div class="winner-text">
                        Player Resigned - Bot Wins!
                    </div>
                    <div class="score-buttons">
                        <button class="game-btn primary" id="rematchBtn">Rematch</button>
                        <button class="game-btn" id="homeBtn">Home</button>
                    </div>
                `;

                // Show score screen
                scoreScreen.classList.add('active');

                // Add button event listeners
                document.getElementById('rematchBtn').addEventListener('click', () => {
                    window.location.reload();
                });

                document.getElementById('homeBtn').addEventListener('click', () => {
                    window.location.href = '../index.html';
                });

                // Reset game data
                resetLetterData();
            }, 
            () => {
                console.log('Resign canceled');
            }
        );
    }

    setupActionButtons() {
        const resignBtn = document.getElementById('resignBtn');
        const skipBtn = document.getElementById('skipBtn');
        const swapBtn = document.getElementById('swapBtn');
        const submitBtn = document.getElementById('submitBtn');
        
        // เพิ่ม event listeners
        resignBtn.addEventListener('click', () => this.handleResign());
        skipBtn.addEventListener('click', () => this.handleSkipTurn());
        swapBtn.addEventListener('click', () => this.handleSwap());
        submitBtn.addEventListener('click', () => this.handleSubmit());
    }

    handleSkipTurn() {
        // Check if any tiles are placed on board
        if (this.letterRack.placedLetters.size > 0) {
            // If tiles are placed, ask to return them first
            showConfirmBox('Return placed tiles to rack before skipping?',
                () => {
                    this.letterRack.returnLettersToRack();
                    this.executeSkip();
                },
                () => {
                    console.log('Skip cancelled - tiles not returned');
                }
            );
            return;
        }

        // If no tiles are placed, confirm skip directly
        showConfirmBox('Are you sure you want to skip your turn?',
            () => this.executeSkip(),
            () => console.log('Skip cancelled')
        );
    }

    executeSkip() {
        // เปลี่ยนเทิร์นและเรียกให้บอทเล่น
        if (window.gameManager) {
            window.gameManager.isPlayerTurn = false;
            window.gameManager.updateActionButtons();
            window.gameManager.updateTurnIndicator();
            
            // ให้บอทเล่นหลังจากเปลี่ยนเทิร์น
            setTimeout(async () => {
                if (window.bot) {
                    await window.bot.makeMove();
                }
            }, 1000);
        }
    }

    setupSwapModal() {
        if (!this.selectedLetters) {
            this.selectedLetters = new Set();
        }
        
        const modal = document.getElementById('swapModal');
        const swapBtn = document.getElementById('swapSelectedBtn');
        const cancelBtn = document.getElementById('cancelSwapBtn');

        // ลบ event listeners เดิม
        const newSwapBtn = swapBtn.cloneNode(true);
        const newCancelBtn = cancelBtn.cloneNode(true);
        swapBtn.parentNode.replaceChild(newSwapBtn, swapBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);

        // เพิ่ม event listeners ใหม่
        newSwapBtn.addEventListener('click', () => {
            if (this.selectedLetters.size > 0) {
                this.executeSwap();
            }
        });

        newCancelBtn.addEventListener('click', () => this.closeSwapModal());

        modal.onclick = (e) => {
            if (e.target === modal) this.closeSwapModal();
        };
    }

    handleSwap() {
        if (!window.gameManager.isPlayerTurn) {
            console.log('Not player turn');
            return;
        }

        const modal = document.getElementById('swapModal');
        const container = document.getElementById('swapLettersContainer');
        const swapBtn = document.getElementById('swapSelectedBtn');

        // เคลียร์ข้อมูลเดิม
        container.innerHTML = '';
        this.selectedLetters.clear();
        swapBtn.disabled = true;

        console.log('Current rack letters:', this.letterRack.letters);

        // สร้าง tiles สำหรับแต่ละตัวอักษร
        this.letterRack.letters.forEach((letter, index) => {
            const letterDiv = document.createElement('div');
            letterDiv.className = 'swap-letter';
            letterDiv.dataset.index = index;
            letterDiv.dataset.letter = letter;
            letterDiv.innerHTML = `
                ${letter}
                <span class="letter-score">${LETTER_DATA[letter]?.score || 0}</span>
            `;

            // เพิ่ม click handler
            letterDiv.addEventListener('click', () => {
                letterDiv.classList.toggle('selected');
                if (letterDiv.classList.contains('selected')) {
                    this.selectedLetters.add(index);
                } else {
                    this.selectedLetters.delete(index);
                }
                swapBtn.disabled = this.selectedLetters.size === 0;
                console.log('Selected letters:', Array.from(this.selectedLetters));
            });

            container.appendChild(letterDiv);
        });

        // แสดง modal
        modal.style.display = 'flex';
        console.log('Swap modal opened');
    }

    executeSwap() {
        if (this.selectedLetters.size === 0) {
            console.log('No letters selected');
            return;
        }

        console.log('Executing swap for indices:', Array.from(this.selectedLetters));

        // แปลง Set เป็น Array และเรียงลำดับจากมากไปน้อย
        const indices = Array.from(this.selectedLetters).sort((a, b) => b - a);
        const lettersToSwap = indices.map(i => this.letterRack.letters[i]);

        console.log('Letters to swap:', lettersToSwap);

        // คืนตัวอักษรลงถุงและลบออกจาก rack
        lettersToSwap.forEach(letter => {
            if (LETTER_DATA[letter]) {
                LETTER_DATA[letter].count++;
                const index = this.letterRack.letters.indexOf(letter);
                if (index > -1) {
                    this.letterRack.letters.splice(index, 1);
                }
            }
        });

        // จั่วตัวอักษรใหม่
        for (let i = 0; i < lettersToSwap.length; i++) {
            const newLetter = this.letterRack.letterManager.getRandomLetter();
            if (newLetter) {
                this.letterRack.letters.push(newLetter);
            }
        }

        // อัพเดทการแสดงผล
        this.letterRack.updateRackDisplay();
        updateTileBagCounts();

        console.log('New rack letters:', this.letterRack.letters);

        // ปิด modal และเปลี่ยนเทิร์น
        this.closeSwapModal();

        // เปลี่ยนเทิร์นและเรียกให้บอทเล่น
        if (window.gameManager) {
            window.gameManager.isPlayerTurn = false;
            window.gameManager.updateActionButtons();
            window.gameManager.updateTurnIndicator();
            
            // ให้บอทเล่นหลังจากเปลี่ยนเทิร์น
            setTimeout(() => {
                if (window.bot) {
                    window.bot.makeMove();
                }
            }, 1000);
        }
    }

    closeSwapModal() {
        const modal = document.getElementById('swapModal');
        modal.style.display = 'none';
        this.selectedLetters.clear();
        console.log('Swap modal closed');
    }

    calculateWordScore(word, cells) {
        let wordScore = 0;
        let wordMultiplier = 1;
        
        // Step 1: คำนวณคะแนนพื้นฐานของแต่ละตัวอักษรและเก็บตัวคูณคำ
        cells.forEach((cell, index) => {
            const letter = word[index];
            let letterScore = LETTER_DATA[letter]?.score || 0;
            
            // ข้ามช่องดาวกลาง
            if (!cell.classList.contains('start')) {
                // คำนวณตัวคูณตัวอักษร (DL, TL)
                if (cell.classList.contains('dl')) {
                    letterScore *= 2;
                } else if (cell.classList.contains('tl')) {
                    letterScore *= 3;
                }
                
                // เก็บตัวคูณคำ (DW, TW)
                if (cell.classList.contains('dw')) {
                    wordMultiplier *= 2;
                } else if (cell.classList.contains('tw')) {
                    wordMultiplier *= 3;
                }
            }
            
            wordScore += letterScore;
        });
        
        // Step 2: คูณคะแนนรวมด้วยตัวคูณคำทั้งหมด
        const finalScore = wordScore * wordMultiplier;
        
        // Debug log
        console.log(`Word: ${word}, Base Score: ${wordScore}, Multiplier: ${wordMultiplier}, Final: ${finalScore}`);
        
        return finalScore;
    }

    handleSubmit() {
        console.log('Checking placed tiles...');
    
        // เพิ่มการตรวจสอบ placedLetters จาก letterRack
        if (this.letterRack.placedLetters.size === 0) {
            console.log('No letters placed on board');
            alert('Please place some letters first');
            return;
        }

        // หา tiles ที่เพิ่งวางใหม่
        const placedTiles = Array.from(document.querySelectorAll('.scrabble-grid .cell .tile'))
            .filter(tile => {
                const isNotSubmitted = !tile.classList.contains('submitted');
                const isNotBot = !tile.classList.contains('bot-played');
                const letterContent = tile.querySelector('.letter-content');
                return isNotSubmitted && isNotBot && letterContent;
            });

        console.log('Found placed tiles:', placedTiles.length);
        console.log('Placed tiles:', placedTiles);

        if (placedTiles.length === 0) {
            console.warn('No valid tiles found on board');
            alert('Please place some letters first');
            return;
        }

        // ส่วนที่เหลือของ handleSubmit ยังคงเหมือนเดิม
        // ...existing code...

        // เก็บข้อมูลคำที่วางทั้งหมด
        const allWords = new Set();
        const allCells = new Set();
        
        // ตรวจสอบทุก tile ที่วาง
        placedTiles.forEach(tile => {
            const cell = tile.closest('.cell');
            if (!cell) return;
            
            const words = this.board.findWordsFromCell(cell, tile.querySelector('.letter-content').textContent);
            words.forEach(({word, cells}) => {
                allWords.add(word);
                cells.forEach(c => allCells.add(c));
            });
        });

        if (allWords.size === 0) {
            alert('Letters must connect to form valid words');
            return;
        }

        // Validate and calculate scores
        Promise.all(
            Array.from(allWords).map(async word => {
                const cells = Array.from(allCells).filter(cell => 
                    cell.querySelector('.tile')?.querySelector('.letter-content')?.textContent
                );
                const isValid = await this.board.wordValidator.validateWord(word);
                const score = isValid ? this.calculateWordScore(word, cells) : 0;
                return { word, cells, isValid, score };
            })
        ).then(results => {
            // ลบ class validation ทั้งหมดก่อน
            allCells.forEach(cell => {
                const tile = cell.querySelector('.tile');
                if (tile) {
                    tile.classList.remove('valid-word', 'invalid-word', 'validating');
                }
            });

            if (results.every(({isValid}) => isValid)) {
                const totalScore = results.reduce((sum, {score}) => sum + score, 0);
                
                // อัพเดทคะแนนและ UI
                results.forEach(({word}) => this.playerWord.add(word));
                
                // เพิ่ม submitted class และลบ validation classes
                placedTiles.forEach(tile => {
                    tile.classList.remove('valid-word', 'invalid-word', 'validating');
                    tile.classList.add('submitted');
                });

                const playerScore = document.getElementById('playerScore');
                const currentScore = parseInt(playerScore.textContent) || 0;
                playerScore.textContent = currentScore + totalScore;
                
                // เคลียร์และเปลี่ยนเทิร์น
                this.letterRack.placedLetters.clear();
                this.letterRack.fillRack();
                this.letterRack.updateButtonState();
                
                // เปลี่ยนเทิร์นและเรียกให้บอทเล่น
                window.gameManager.isPlayerTurn = false;
                window.gameManager.updateActionButtons();
                window.gameManager.updateTurnIndicator();
                
                setTimeout(async () => {
                    if (window.bot) {
                        await window.bot.makeMove();
                    }
                }, 1000);
            } else {
                const invalidWords = results.filter(r => !r.isValid).map(r => r.word);
                alert(`Invalid word(s): ${invalidWords.join(', ')}`);
                
                // คืนค่า tiles กลับไปที่ rack
                this.letterRack.returnLettersToRack();
            }
        });
    }

    findConnectedWords(cells) {
        const words = new Set();
        const processedCells = new Set();

        cells.forEach(cell => {
            if (!cell) return;
            
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);

            // ตรวจสอบแนวนอน
            const horizontalWord = this.getWordInDirection(row, col, 0, 1);
            if (horizontalWord && horizontalWord.word.length > 1) {
                words.add(horizontalWord);
            }

            // ตรวจสอบแนวตั้ง
            const verticalWord = this.getWordInDirection(row, col, 1, 0);
            if (verticalWord && verticalWord.word.length > 1) {
                words.add(verticalWord);
            }
        });

        return Array.from(words);
    }

    getWordInDirection(startRow, startCol, deltaRow, deltaCol) {
        // หาจุดเริ่มต้นของคำ
        let row = startRow;
        let col = startCol;
        while (this.hasLetterAt(row - deltaRow, col - deltaCol)) {
            row -= deltaRow;
            col -= deltaCol;
        }

        // สร้างคำจากตำแหน่งเริ่มต้น
        let word = '';
        const wordCells = [];
        let currentRow = row;
        let currentCol = col;

        while (this.hasLetterAt(currentRow, currentCol)) {
            const letter = this.getLetterAt(currentRow, currentCol);
            if (!letter) break;

            word += letter;
            const cell = document.querySelector(
                `.cell[data-row="${currentRow}"][data-col="${currentCol}"]`
            );
            if (cell) wordCells.push(cell);

            currentRow += deltaRow;
            currentCol += deltaCol;
        }

        return word.length > 1 ? { word, cells: wordCells } : null;
    }

    hasLetterAt(row, col) {
        const cell = document.querySelector(
            `.cell[data-row="${row}"][data-col="${col}"]`
        );
        return cell?.querySelector('.tile') !== null;
    }

    getLetterAt(row, col) {
        const cell = document.querySelector(
            `.cell[data-row="${row}"][data-col="${col}"]`
        );
        return cell?.querySelector('.letter-content')?.textContent || '';
    }

    async validateWords(words) {
        try {
            // เปลี่ยนวิธีการดึงคำและตรวจสอบ
            const validations = await Promise.all(
                words.map(async ({word}) => {
                    console.log('Validating word:', word); // Debug log
                    const isValid = await window.gameBoard.wordValidator.validateWord(word);
                    console.log('Word validation result:', word, isValid); // Debug log
                    return isValid;
                })
            );
            return validations.every(result => result === true);
        } catch (error) {
            console.error('Error validating words:', error);
            return false;
        }
    }

    calculateScore(words) {
        let totalScore = 0;
        words.forEach(word => {
            let wordScore = 0;
            let wordMultiplier = 1;

            // คำนวณคะแนนแต่ละตัวอักษร
            for (const letter of word) {
                const letterScore = LETTER_DATA[letter].score;
                // TODO: เพิ่มการคูณคะแนนตามช่องพิเศษ
                wordScore += letterScore;
            }

            // คูณคะแนนรวมของคำ (ถ้ามีช่อง DW หรือ TW)
            totalScore += wordScore * wordMultiplier;
        });

        return totalScore;
    }
}

class ScoreManager {
    constructor() {
        this.playerScore = 0;
        this.botScore = 0;
        this.scoreDisplay = document.getElementById('score-display');
    }

    addPoints(points, isPlayer = true) {
        if (isPlayer) {
            this.playerScore += points;
        } else {
            this.botScore += points;
        }
        this.updateDisplay();
    }

    updateDisplay() {
        if (this.scoreDisplay) {
            this.scoreDisplay.innerHTML = `
                <div>Player: ${this.playerScore}</div>
                <div>Bot: ${this.botScore}</div>
            `;
        }
    }
}

class GameManager {
    constructor() {
        // แก้ไขจาก random เป็นกำหนดให้ player เริ่มก่อนเสมอ
        this.isPlayerTurn = true; 
        this.turnTime = 15 * 60; // 15 minutes in seconds
        this.playerTimeLeft = this.turnTime;
        this.botTimeLeft = this.turnTime;
        this.timerInterval = null;
        this.gameEnded = false;
        this.initialize();
    }

    initialize() {
        // แสดงผล turn แรก
        this.updateTurnIndicator();
        this.updateActionButtons(); // Add this line
        // เริ่มจับเวลา
        this.startTimer();
    }

    updateTurnIndicator() {
        const playerSection = document.querySelector('.player-section');
        const botSection = document.querySelector('.bot-section');

        if (this.isPlayerTurn) {
            playerSection.classList.add('active');
            botSection.classList.remove('active');
        } else {
            botSection.classList.add('active');
            playerSection.classList.remove('active');
        }
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            if (this.isPlayerTurn) {
                this.playerTimeLeft--;
                this.updateTimeDisplay('playerTime', this.playerTimeLeft);
            } else {
                this.botTimeLeft--;
                this.updateTimeDisplay('botTime', this.botTimeLeft);
            }

            if (this.playerTimeLeft <= 0 || this.botTimeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }

    updateTimeDisplay(elementId, timeInSeconds) {
        const minutes = Math.floor(timeInSeconds / 60);
        const seconds = timeInSeconds % 60;
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        document.getElementById(elementId).textContent = timeString;
    }

    switchTurn() {
        this.isPlayerTurn = !this.isPlayerTurn;
        this.updateTurnIndicator();
        this.updateActionButtons();
        console.log('Turn switched:', this.isPlayerTurn ? 'Player' : 'Bot');
    }

    updateActionButtons() {
        const actionButtons = ['skipBtn', 'swapBtn', 'submitBtn'];
        actionButtons.forEach(btnId => {
            const btn = document.getElementById(btnId);
            if (btn) {
                btn.disabled = !this.isPlayerTurn;
                btn.style.opacity = this.isPlayerTurn ? '1' : '0.5';
            }
        });

        // Update rack buttons too if letterRack exists
        if (window.gameBoard?.letterRack) {
            window.gameBoard.letterRack.updateButtonState();
        }
    }

    endGame() {
        if (this.gameEnded) return;
        
        this.gameEnded = true;
        clearInterval(this.timerInterval);

        // Get final scores
        const playerScore = parseInt(document.getElementById('playerScore').textContent) || 0;
        const botScore = parseInt(document.getElementById('botScore').textContent) || 0;

        // Show score screen
        const scoreScreen = document.querySelector('.score-screen');
        const scoreContent = document.querySelector('.score-content');
        
        // Calculate winner
        const winner = playerScore > botScore ? 'Player' : 
                      playerScore < botScore ? 'Bot' : 'Tie';
        
        scoreContent.innerHTML = `
            <h2>Game Over!</h2>
            <div class="final-scores">
                <div class="score-item">
                    <h3>Player</h3>
                    <div class="score">${playerScore}</div>
                </div>
                <div class="score-item">
                    <h3>Bot</h3>
                    <div class="score">${botScore}</div>
                </div>
            </div>
            <div class="winner-text">
                ${winner === 'Tie' ? "It's a Tie!" : `${winner} Wins!`}
            </div>
            <div class="score-buttons">
                <button class="game-btn primary" id="rematchBtn">Rematch</button>
                <button class="game-btn" id="homeBtn">Home</button>
            </div>
        `;

        // Show score screen
        scoreScreen.classList.add('active');

        // Add button event listeners
        document.getElementById('rematchBtn').addEventListener('click', () => {
            window.location.reload();
        });

        document.getElementById('homeBtn').addEventListener('click', () => {
            window.location.href = '../index.html';
        });
    }

    checkGameEnd() {
        // End game conditions:
        // 1. Time's up
        if (this.playerTimeLeft <= 0 || this.botTimeLeft <= 0) {
            return true;
        }
        
        // 2. No more tiles in bag and either player has no tiles
        const tileBagEmpty = Object.values(LETTER_DATA)
            .every(({count}) => count === 0);
        
        const playerRackEmpty = window.gameBoard.letterRack.letters.length === 0;
        const botRackEmpty = window.bot.rack.letters.length === 0;

        if (tileBagEmpty && (playerRackEmpty || botRackEmpty)) {
            return true;
        }

        return false;
    }

    updateGame() {
        if (this.checkGameEnd()) {
            this.endGame();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('scrabble_cw.html')) {
        try {
            console.log('Initializing game...');
            
            // รีเซ็ตค่าตัวอักษรก่อนเริ่มเกมใหม่ทุกครั้ง
            resetLetterData();
            
            // ตรวจสอบจำนวนตัวอักษรหลังรีเซ็ต
            if (!validateGameStart()) {
                console.log('Game initialization failed, retrying...');
                resetLetterData();
                if (!validateGameStart()) {
                    throw new Error('Failed to initialize game after reset');
                }
            }

            const letterManager = new LetterManager();
            const letterRack = new LetterRack(letterManager);
            const board = new ScrabbleBoard(letterRack);
            
            // Set game board globally before creating controls
            window.gameBoard = board;
            
            // Create controls first
            const controls = new GameControls(letterRack, board);
            
            // Create bot after controls and pass controls instance
            const bot = new ScrabbleBot(board, letterManager, controls);
            
            // Initialize score manager
            const scoreManager = new ScoreManager();
            
            // Setup player rack
            letterRack.setupButtons();
            
            // Update tile counts
            updateTileBagCounts();
            console.log('Initial tile counts updated');
            
            // Initialize game manager and store references
            window.gameManager = new GameManager();
            window.bot = bot;

            // Handle page reload/close
            window.addEventListener('beforeunload', (e) => {
                e.preventDefault();
                e.returnValue = '';
                resetLetterData();
            });

            window.addEventListener('unload', cleanupGame);

        } catch (error) {
            console.error('Error initializing game:', error);
            resetLetterData();
            window.location.reload();
        }
    }
});
