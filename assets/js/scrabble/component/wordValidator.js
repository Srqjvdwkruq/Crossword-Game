// // validator.js
// import { DICTIONARY_APIS } from './scrabbleMode.js';

// export class WordValidator {
//     constructor() {
//         this.dictionary = new Set();
//         this.cache = new Map();
//     }

//     async loadDictionary(apiUrl) {
//         try {
//             const response = await fetch(`${apiUrl}*`);
//             if (!response.ok) throw new Error('API failed');

//             const words = await response.json();
//             this.dictionary = new Set(words.map(w => w.word.toUpperCase()));
//             console.log('Dictionary loaded:', this.dictionary.size, 'words');
//         } catch (error) {
//             console.error('Error loading dictionary:', error.message);
//         }
//     }

//     validateWord(word) {
//         if (this.cache.has(word)) return this.cache.get(word);

//         const isValid = this.dictionary.has(word.toUpperCase());
//         this.cache.set(word, isValid);
//         return isValid;
//     }
// }
