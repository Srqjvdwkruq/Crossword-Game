class AnimalGame extends BaseGame {
    constructor() {
        super();
        
        // กำหนดค่าตาราง
        this.setGridConfig({
            rows: 11,
            cols: 11,
            words: [
                { clueNumber: 1, word: "NOTEBOOK", direction: "down" },
                { clueNumber: 2, word: "BOOK", direction: "across" },
                { clueNumber: 3, word: "SCISSORS", direction: "across" },
                { clueNumber: 4, word: "SHARPENER", direction: "down" }, 
                { clueNumber: 5, word: "BACKPACK", direction: "across" },
                { clueNumber: 6, word: "TAPE", direction: "across" },    
                { clueNumber: 7, word: "GLUE", direction: "down" },
                { clueNumber: 8, word: "PENCIL", direction: "across" },
                { clueNumber: 9, word: "PEN", direction: "down" },  
                { clueNumber: 10, word: "ERASER", direction: "across" }    
            ]
        });

        this.answers = Object.fromEntries(
            this.gridConfig.words.map(w => [w.clueNumber, w.word])
        );
        
        this.hintImages = {
            1: "/assets/img/school supplies/notebook.jpg",
            2: "/assets/img/school supplies/book.png",
            3: "/assets/img/school supplies/scissors.avif",
            4: "/assets/img/school supplies/sharpener.png",
            5: "/assets/img/school supplies/backpack.avif",
            6: "/assets/img/school supplies/tape.jpg",
            7: "/assets/img/school supplies/glue.avif",
            8: "/assets/img/school supplies/pencil.avif",
            9: "/assets/img/school supplies/pen.jpg",
            10: "/assets/img/school supplies/eraser.avif"
        };
    }

    initializeGame() {
        super.initializeGame();
        this.initializeWordMap();
    }

    showHint() {
        const hintBox = document.querySelector('.hint-box');
        if (this.selectedClueNumber && this.hintImages[this.selectedClueNumber]) {
            const imagePath = this.hintImages[this.selectedClueNumber];
            console.log('Loading hint image:', imagePath);
            
            // เพิ่ม check ว่ารูปอยู่ในตำแหน่งที่ถูกต้องหรือไม่
            fetch(imagePath)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    hintBox.style.backgroundImage = `url('${imagePath}')`;
                })
                .catch(error => {
                    console.error('Image loading error:', error);
                    hintBox.style.backgroundImage = 'none';
                });
        } else {
            hintBox.style.backgroundImage = 'none';
        }
    }
}

// Initialize when document loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new AnimalGame();
    game.initializeGame();
});
