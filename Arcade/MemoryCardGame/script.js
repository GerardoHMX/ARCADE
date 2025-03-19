class MemoryGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.gameStarted = false;
        this.timer = null;
        this.seconds = 0;
        
        // Elementos UI
        this.grid = document.querySelector('.memory-grid');
        this.movesDisplay = document.getElementById('moves');
        this.matchesDisplay = document.getElementById('matches');
        this.timerDisplay = document.getElementById('timer');
        this.gameOverMessage = document.getElementById('gameOverMessage');
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');
        
        // Event listeners
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.resetGame());
    }

    createCards() {
        const emojis = ['🚀', '👾', '👻', '🤖', '👽', '🎮', '💀', '🎲'];
        const pairs = [...emojis, ...emojis];
        return this.shuffle(pairs);
    }

    shuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    createCardElement(emoji) {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <div class="card-face card-front">${emoji}</div>
            <div class="card-face card-back">?</div>
        `;
        card.addEventListener('click', () => this.flipCard(card));
        return card;
    }

    startGame() {
        this.grid.innerHTML = ''; // Limpiar el grid
        this.startBtn.hidden = true;
        this.gameStarted = true;
        const shuffledEmojis = this.createCards();
        
        shuffledEmojis.forEach(emoji => {
            const card = this.createCardElement(emoji);
            this.grid.appendChild(card);
            this.cards.push(card);
        });

        this.startTimer();
    }

    startTimer() {
        this.timer = setInterval(() => {
            this.seconds++;
            const minutes = Math.floor(this.seconds / 60);
            const remainingSeconds = this.seconds % 60;
            this.timerDisplay.textContent = 
                `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    flipCard(card) {
        if (!this.gameStarted || 
            this.flippedCards.length >= 2 || 
            card.classList.contains('flipped') ||
            card.classList.contains('matched')) {
            return;
        }

        card.classList.add('flipped');
        this.flippedCards.push(card);

        if (this.flippedCards.length === 2) {
            this.moves++;
            this.movesDisplay.textContent = this.moves;
            this.checkMatch();
        }
    }

    checkMatch() {
        const [card1, card2] = this.flippedCards;
        const emoji1 = card1.querySelector('.card-front').textContent;
        const emoji2 = card2.querySelector('.card-front').textContent;

        if (emoji1 === emoji2) {
            this.matchedPairs++;
            this.matchesDisplay.textContent = this.matchedPairs;
            card1.classList.add('matched');
            card2.classList.add('matched');
            this.flippedCards = [];

            if (this.matchedPairs === 8) {
                this.gameOver();
            }
        } else {
            setTimeout(() => {
                card1.classList.remove('flipped');
                card2.classList.remove('flipped');
                this.flippedCards = [];
            }, 1000);
        }
    }

    gameOver() {
        clearInterval(this.timer);
        this.gameStarted = false;
        this.gameOverMessage.classList.add('visible');
        this.restartBtn.hidden = false;
    }

    resetGame() {
        // Limpiar grid
        this.grid.innerHTML = '';
        
        // Resetear variables
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.seconds = 0;
        
        // Resetear displays
        this.movesDisplay.textContent = '0';
        this.matchesDisplay.textContent = '0';
        this.timerDisplay.textContent = '00:00';
        
        // Ocultar mensaje y botón de reinicio
        this.gameOverMessage.classList.remove('visible');
        this.restartBtn.hidden = true;
        
        // Detener timer anterior si existe
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        // Iniciar nuevo juego
        this.startGame();
    }
}

// Iniciar el juego cuando se carga la página
window.onload = () => {
    new MemoryGame();
};