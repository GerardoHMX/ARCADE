class WhackAMole {
    constructor() {
        this.score = 0;
        this.timeLeft = 30;
        this.gameStarted = false;
        this.lastHole = null;
        
        // Elementos UI
        this.holes = document.querySelectorAll('.hole');
        this.moles = document.querySelectorAll('.mole');
        this.scoreDisplay = document.getElementById('score');
        this.timerDisplay = document.getElementById('timer');
        this.gameOverMessage = document.getElementById('gameOverMessage');
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');
        
        // Event listeners
        this.moles.forEach(mole => {
            mole.addEventListener('click', () => this.whack(mole));
        });
        
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.resetGame());
    }

    randomTime(min, max) {
        return Math.round(Math.random() * (max - min) + min);
    }

    randomHole() {
        const idx = Math.floor(Math.random() * this.holes.length);
        const hole = this.holes[idx];
        
        if (hole === this.lastHole) {
            return this.randomHole();
        }
        
        this.lastHole = hole;
        return hole;
    }

    peep() {
        if (!this.gameStarted) return;
        
        const time = this.randomTime(600, 1000);
        const hole = this.randomHole();
        
        hole.classList.add('up');
        
        setTimeout(() => {
            hole.classList.remove('up');
            if (this.gameStarted) this.peep();
        }, time);
    }

    whack(mole) {
        if (!this.gameStarted) return;
        
        if (mole.parentNode.classList.contains('up')) {
            this.score += 10;
            mole.parentNode.classList.remove('up');
            mole.classList.add('bonk');
            this.scoreDisplay.textContent = this.score;
            
            setTimeout(() => mole.classList.remove('bonk'), 300);
        }
    }

    startTimer() {
        const countdown = setInterval(() => {
            this.timeLeft--;
            this.timerDisplay.textContent = this.timeLeft;
            
            if (this.timeLeft <= 0) {
                clearInterval(countdown);
                this.endGame();
            }
        }, 1000);
    }

    startGame() {
        this.score = 0;
        this.timeLeft = 30;
        this.gameStarted = true;
        this.startBtn.hidden = true;
        this.gameOverMessage.classList.remove('visible');
        this.scoreDisplay.textContent = '0';
        this.timerDisplay.textContent = '30';
        
        this.startTimer();
        this.peep();
    }

    endGame() {
        this.gameStarted = false;
        this.gameOverMessage.classList.add('visible');
        this.restartBtn.hidden = false;
        this.holes.forEach(hole => hole.classList.remove('up'));
    }

    resetGame() {
        this.gameOverMessage.classList.remove('visible');
        this.restartBtn.hidden = true;
        this.startGame();
    }
}

// Iniciar el juego cuando se carga la página
window.onload = () => {
    new WhackAMole();
};