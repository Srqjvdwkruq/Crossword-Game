class AnimalGame extends BaseGame {
    constructor() {
        super();
        
        // กำหนดค่าตาราง
        this.setGridConfig({
            rows: 11,
            cols: 11,
            words: [
                { clueNumber: 1, word: "MONKEY", direction: "down" },
                { clueNumber: 2, word: "TIGER", direction: "down" },
                { clueNumber: 3, word: "LION", direction: "across" },
                { clueNumber: 4, word: "SNAKE", direction: "down" }, 
                { clueNumber: 5, word: "ELEPHANT", direction: "across" },
                { clueNumber: 6, word: "BEAR", direction: "across" },    
                { clueNumber: 7, word: "PANDA", direction: "down" },
                { clueNumber: 8, word: "GIRAFFE", direction: "across" },
                { clueNumber: 9, word: "FROG", direction: "down" },  
                { clueNumber: 10, word: "ZEBRA", direction: "across" }    
            ]
        });

        this.answers = Object.fromEntries(
            this.gridConfig.words.map(w => [w.clueNumber, w.word])
        );
        
        this.hintImages = {
            1: "../assets/img/animal/monkey.svg",
            2: "../assets/img/animal/tiger.jpg",
            3: "../assets/img/animal/lion.png",
            4: "../assets/img/animal/snake.jpg",
            5: "../assets/img/animal/elephant.avif",
            6: "../assets/img/animal/bear.svg",
            7: "../assets/img/animal/panda.avif",
            8: "../assets/img/animal/giraffe.avif",
            9: "../assets/img/animal/frog.jpg",
            10: "../assets/img/animal/zebra.svg"
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
