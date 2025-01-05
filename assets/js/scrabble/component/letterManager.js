// import { LETTER_DATA, updateTileBagCounts } from './scrabbleMode.js';

// export class LetterManager {
//     constructor() {
//         this.letterData = LETTER_DATA;
//         this.validateData();
//     }

//     validateData() {
//         const total = Object.values(this.letterData)
//             .reduce((sum, { count }) => sum + count, 0);
//         if (total !== 100) {
//             console.warn('Invalid letter count, resetting...');
//             this.resetLetterData();
//         }
//     }

//     resetLetterData() {
//         Object.keys(this.letterData).forEach(letter => {
//             this.letterData[letter].count = LETTER_DATA[letter].count;
//         });
//         updateTileBagCounts();
//     }

//     getRandomLetter() {
//         const availableLetters = Object.entries(this.letterData)
//             .filter(([_, data]) => data.count > 0)
//             .map(([letter]) => letter);

//         if (availableLetters.length === 0) {
//             console.log('No letters available in the bag');
//             return null;
//         }

//         const randomIndex = Math.floor(Math.random() * availableLetters.length);
//         const selectedLetter = availableLetters[randomIndex];
//         this.letterData[selectedLetter].count--;
//         updateTileBagCounts();
//         return selectedLetter;
//     }
// }
