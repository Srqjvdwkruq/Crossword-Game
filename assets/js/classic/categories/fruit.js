class AnimalGame extends BaseGame {
    constructor() {
        super();
        
        // กำหนดค่าตาราง
        this.setGridConfig({
            rows: 14,
            cols: 13,
            words: [
                { clueNumber: 1, word: "ORANGE", direction: "down" },
                { clueNumber: 2, word: "WATERMELON", direction: "down" },
                { clueNumber: 3, word: "BANANA", direction: "down" }, 
                { clueNumber: 4, word: "PAPAYA", direction: "across" }, 
                { clueNumber: 5, word: "CHERRY", direction: "down" },
                { clueNumber: 6, word: "GRAPE", direction: "across" },    
                { clueNumber: 7, word: "KIWI", direction: "down" },
                { clueNumber: 8, word: "STRAWBERRY", direction: "across" },
                { clueNumber: 9, word: "PEACH", direction: "down" },  
                { clueNumber: 10, word: "PINEAPPLE", direction: "across" }    
            ]
        });

        this.answers = Object.fromEntries(
            this.gridConfig.words.map(w => [w.clueNumber, w.word])
        );
        
        this.hintImages = {
            1: "../assets/img/fruit/orange.svg",
            2: "../assets/img/fruit/watermelon.svg",
            3: "../assets/img/fruit/banana.svg",
            4: "../assets/img/fruit/papaya.svg",
            5: "../assets/img/fruit/cherry.svg",
            6: "../assets/img/fruit/grape.svg",
            7: "../assets/img/fruit/kiwi.svg",
            8: "../assets/img/fruit/strawberry.svg",
            9: "../assets/img/fruit/peach.jpg",
            10: "../assets/img/fruit/pineapple.svg"
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
