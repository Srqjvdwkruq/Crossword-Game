// // ScrabbleBoard.js
// import { GRID_SIZE, SPECIAL_SQUARES } from './scrabbleMode.js';
// import { utils } from './utils.js';

// export class ScrabbleBoard {
//     constructor() {
//         this.boardSize = GRID_SIZE;
//         this.placedTiles = new Map();
//     }

//     initializeBoard() {
//         const grid = document.querySelector('.scrabble-grid');
//         grid.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;
//         grid.style.gridTemplateRows = `repeat(${this.boardSize}, 1fr)`;

//         for (let row = 0; row < this.boardSize; row++) {
//             for (let col = 0; col < this.boardSize; col++) {
//                 const cell = document.createElement('div');
//                 cell.classList.add('cell');
//                 cell.dataset.row = row;
//                 cell.dataset.col = col;

//                 this.setSpecialCell(cell, row, col);
//                 grid.appendChild(cell);
//             }
//         }
//     }

//     setSpecialCell(cell, row, col) {
//         if (row === 7 && col === 7) {
//             cell.classList.add('start');
//             return;
//         }

//         Object.entries(SPECIAL_SQUARES).forEach(([type, positions]) => {
//             if (positions.some(([r, c]) => r === row && c === col)) {
//                 cell.classList.add(type.toLowerCase());
//             }
//         });
//     }
// }
