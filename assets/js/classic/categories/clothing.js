class AnimalGame extends BaseGame {
    constructor() {
        super();
        
        // กำหนดค่าตาราง
        this.setGridConfig({
            rows: 12,
            cols: 10,
            words: [
                { clueNumber: 1, word: "UNDERWEAR", direction: "down" },
                { clueNumber: 2, word: "PANTS", direction: "across" },
                { clueNumber: 3, word: "SHIRT", direction: "down" },
                { clueNumber: 4, word: "JEANS", direction: "down" }, 
                { clueNumber: 5, word: "HOODIE", direction: "across" },
                { clueNumber: 6, word: "DRESS", direction: "down" },    
                { clueNumber: 7, word: "SWEATER", direction: "across" },
                { clueNumber: 8, word: "CAP", direction: "across" },
                { clueNumber: 9, word: "TIE", direction: "down"},  
                { clueNumber: 10, word: "SUIT", direction: "across" }    
            ]
        });

        this.answers = Object.fromEntries(
            this.gridConfig.words.map(w => [w.clueNumber, w.word])
        );
        
        this.hintImages = {
            1: "/assets/img/clothing/underwear.svg",
            2: "/assets/img/clothing/pants.jpg",
            3: "/assets/img/clothing/shirt.png",
            4: "/assets/img/clothing/jeans.png",
            5: "/assets/img/clothing/hoodie.png",
            6: "/assets/img/clothing/dress.avif",
            7: "/assets/img/clothing/sweater.svg",
            8: "/assets/img/clothing/cap.png",
            9: "/assets/img/clothing/tie.png",
            10: "/assets/img/clothing/suit.png"
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
