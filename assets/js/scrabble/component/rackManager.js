// // RackManager.js
// export class RackManager {
//     constructor(letterManager, rackSize = 7) {
//         this.letterManager = letterManager;
//         this.rackSize = rackSize;
//         this.letters = [];
//         this.fillRack();
//     }

//     fillRack() {
//         while (this.letters.length < this.rackSize) {
//             const letter = this.letterManager.getRandomLetter();
//             if (!letter) break;
//             this.letters.push(letter);
//         }
//     }

//     addLetter(letter) {
//         if (this.letters.length < this.rackSize) {
//             this.letters.push(letter);
//             return true;
//         }
//         return false;
//     }

//     removeLetter(letter) {
//         const index = this.letters.indexOf(letter);
//         if (index > -1) {
//             this.letters.splice(index, 1);
//             return true;
//         }
//         return false;
//     }

//     getRackLetters() {
//         return [...this.letters];
//     }
// }
