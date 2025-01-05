class AnimalGame extends BaseGame {
    constructor() {
        super();
        
        // กำหนดค่าตาราง
        this.setGridConfig({
            rows: 12,
            cols: 12,
            words: [
                { clueNumber: 1, word: "CARROT", direction: "down" },
                { clueNumber: 2, word: "CUCUMBER", direction: "across" },
                { clueNumber: 3, word: "CORN", direction: "down" },
                { clueNumber: 4, word: "EGGPLANT", direction: "down" }, 
                { clueNumber: 5, word: "MINT", direction: "down" },
                { clueNumber: 6, word: "ONION", direction: "across" },    
                { clueNumber: 7, word: "CHILI", direction: "across" },
                { clueNumber: 8, word: "POTATO", direction: "across" },
                { clueNumber: 9, word: "TARO", direction: "down" },  
                { clueNumber: 10, word: "TOMATO", direction: "across" }
            ]
        });

        this.answers = Object.fromEntries(
            this.gridConfig.words.map(w => [w.clueNumber, w.word])
        );
        
        this.hintImages = {
            1: "../assets/img/vegetable/carrot.svg",
            2: "../assets/img/vegetable/cucumber.svg",
            3: "../assets/img/vegetable/corn.svg",
            4: "../assets/img/vegetable/eggplant.svg",
            5: "../assets/img/vegetable/mint.png",
            6: "../assets/img/vegetable/onion.svg",
            7: "../assets/img/vegetable/chili.svg",
            8: "../assets/img/vegetable/potato.svg",
            9: "../assets/img/vegetable/taro.png",
            10: "../assets/img/vegetable/tomato.jpg"
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
