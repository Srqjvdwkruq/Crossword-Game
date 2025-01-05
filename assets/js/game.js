// DOM Elements & Constants
const elements = {
    container: document.getElementById('container'),
    menuBtn: document.getElementById('menuBtn'),
    quitBtn: document.getElementById('quitBtn'),
    continueBtn: document.getElementById('continueBtn'),
    title: document.querySelector('.title'),
    description: document.querySelector('.description'),
    buttons: {
        back: document.getElementById('backBtn'),
        back2: document.getElementById('backBtn2'), 
        back3: document.getElementById('backBtn3'),
        //info: document.getElementById('infoBtn'),
        category: {
            animal: document.getElementById('animalBtn'),
            vegetable: document.getElementById('vegetableBtn'),
            fruit: document.getElementById('fruitBtn'),
            clothing: document.getElementById('clothingBtn'),
            schoolsupplies: document.getElementById('schoolsuppliesBtn')
        }
    }
};

// Utility Functions
const utils = {
    redirect: (path) => window.location.href = path,
    
    handleBackNavigation: (element, path = '../index.html') => {
        if (element) {
            element.addEventListener('click', () => utils.redirect(path));
        }
    },

    setupCategoryButton: (button) => {
        if (button) {
            button.addEventListener('click', () => {
                const category = button.getAttribute('data-category');
                // Check if running on GitHub Pages
                const isGitHubPages = window.location.hostname.includes('github.io');
                // Get repository name from URL if on GitHub Pages
                const repoName = isGitHubPages ? window.location.pathname.split('/')[1] : '';
                
                if (isGitHubPages) {
                    // GitHub Pages path
                    utils.redirect(`/${repoName}/pages/${category}.html`);
                } else {
                    // Local development path
                    utils.redirect(`./pages/${category}.html`);
                }
            });
        }
    }
};

// Function Animation Letter in Main Screen
function addAnimation(element, animationClass) {
    if (!element) return;
    element.classList.remove('fade-in', 'slide-in', 'pop-in');
    void element.offsetWidth;
    element.classList.add(animationClass);
}

// Function Transition Screen
function showScreen(screenToShow, screenToHide) {
    // Hide current screen
    screenToHide.style.opacity = '0'; // Hide current screen
    
    setTimeout(() => { // Wait for fade out animation
        screenToHide.style.display = 'none'; // Hide current screen
        screenToShow.style.display = 'flex'; // Show new screen
        void screenToShow.offsetWidth; // Trigger reflow
        screenToShow.style.opacity = '1'; // Fade in new screen
    }, 300);
}

// Background Animation
class BackgroundAnimation {
    constructor() {
        this.container = document.querySelector('.background-animation');
        this.letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        this.maxLetters = 15; // Maximum letters on screen
        this.createInterval = null;
        this.init();
    }

    init() {
        if (!this.container) return;
        
        // Create falling letters
        this.createInterval = setInterval(() => this.createLetter(), 1200);
        
        // Create initial letters
        for (let i = 0; i < this.maxLetters / 3; i++) {
            this.createLetter();
        }
    }

    createLetter() {
        if (!this.container) return;
        
        // Ceck current letters count
        const currentLetters = this.container.children.length;
        if (currentLetters >= this.maxLetters) {
            return;
        }
        
        const letter = document.createElement('div');
        letter.className = 'falling-letter';
        
        // Random Letter
        letter.textContent = this.letters[Math.floor(Math.random() * this.letters.length)];
        
        // Random Size Letter
        const sizes = ['small', 'medium', 'large'];
        letter.classList.add(sizes[Math.floor(Math.random() * sizes.length)]);
        
        // Random Position, Rotation, and Delay
        const left = Math.random() * 100;
        const initialRotation = Math.random() * 360;
        const fallDelay = Math.random() * 5;
        
        letter.style.cssText = `
            left: ${left}%;
            transform: rotate(${initialRotation}deg);
            animation-delay: -${fallDelay}s;
        `;
        
        this.container.appendChild(letter);
        
        // Delete letter when animation ends
        letter.addEventListener('animationend', () => {
            if (letter && letter.parentNode === this.container) {
                this.container.removeChild(letter);
            }
        });
    }

    stop() {
        if (this.createInterval) {
            clearInterval(this.createInterval);
            this.createInterval = null;
        }
        
        if (this.container) {
            this.container.innerHTML = '';
        }
    }
}

// Function Confirm Box
function showConfirmBox(message, onConfirm, onCancel) {
    const confirmBox = document.getElementById('confirmBox');
    const confirmMessage = document.getElementById('confirmMessage');
    const confirmYes = document.getElementById('confirmYes');
    const confirmNo = document.getElementById('confirmNo');

    // Set message
    confirmMessage.textContent = message;

    // Show confirm box
    confirmBox.classList.add('show');

    // Setup button handlers
    const handleYes = () => {
        confirmBox.classList.remove('show');
        confirmYes.removeEventListener('click', handleYes);
        confirmNo.removeEventListener('click', handleNo);
        if (onConfirm) onConfirm();
    };

    const handleNo = () => {
        confirmBox.classList.remove('show');
        confirmYes.removeEventListener('click', handleYes);
        confirmNo.removeEventListener('click', handleNo);
        if (onCancel) onCancel();
    };

    confirmYes.addEventListener('click', handleYes);
    confirmNo.addEventListener('click', handleNo);

    // Close on ESC key
    const handleEsc = (e) => {
        if (e.key === 'Escape') {
            handleNo();
            document.removeEventListener('keydown', handleEsc);
        }
    };
    document.addEventListener('keydown', handleEsc);
}

// Menu System
class MenuSystem {
    constructor() {
        this.menuBtn = document.getElementById('menuBtn');
        this.menuDropdown = null;
        this.setupMenu();
    }

    hideDropdown() {
        if (this.menuDropdown) {
            this.menuDropdown.classList.remove('show');
        }
    }

    setupMenu() {
        if (!this.menuBtn) return;
        
        // Get elements
        this.menuDropdown = this.menuBtn.querySelector('.menu-dropdown');
        const menuButton = this.menuBtn.querySelector('.menu-btn');
        const quitBtn = document.getElementById('quitBtn');
        const continueBtn = document.getElementById('continueBtn');

        // Toggle menu
        menuButton?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.menuDropdown?.classList.toggle('show');
        });

        // Quit button handler
        if (quitBtn) {
            quitBtn.addEventListener('click', () => {
                showConfirmBox('Are you sure you want to quit?',
                    () => window.location.href = '../index.html',
                    () => this.hideDropdown()
                );
            });
        }

        // Continue button handler
        if (continueBtn) {
            continueBtn.addEventListener('click', () => {
                this.hideDropdown();
            });
        }

        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (this.menuDropdown?.classList.contains('show') && 
                !this.menuBtn.contains(e.target)) {
                this.hideDropdown();
            }
        });

        // Close dropdown on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.menuDropdown?.classList.contains('show')) {
                this.hideDropdown();
            }
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize menu system
    new MenuSystem();
    
    // Initialize background animation
    new BackgroundAnimation();
    
    // Setup navigation buttons with proper paths
    const currentPath = window.location.pathname;
    const isInPagesDir = currentPath.includes('/pages/');
    
    utils.handleBackNavigation(elements.buttons.back, isInPagesDir ? '../index.html' : './index.html');
    utils.handleBackNavigation(elements.buttons.back2, isInPagesDir ? '../index.html' : './index.html');
    utils.handleBackNavigation(elements.buttons.back3, isInPagesDir ? '../scrabblemode.html' : './scrabblemode.html');
    
    // Setup category buttons
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        utils.setupCategoryButton(button);
    });
    
    // Setup home screen animations
    if (elements.container) {
        addAnimation(elements.title, 'fade-in');
        setTimeout(() => addAnimation(elements.description, 'slide-in'), 200);
    }
});
