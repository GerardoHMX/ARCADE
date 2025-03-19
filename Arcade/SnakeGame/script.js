class SnakeGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Configuración del canvas
        this.canvas.width = 400;
        this.canvas.height = 400;
        this.tileSize = 20;
        
        // Estado inicial del juego
        this.snake = [{x: 5, y: 5}];
        this.direction = 'right';
        this.food = this.generateFood();
        this.score = 0;
        this.gameOver = false;
        this.gameOverMessage = document.getElementById('gameOverMessage');
        
        // Controles y elementos UI
        this.setupControls();
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.scoreDisplay = document.getElementById('score');
        
        this.setupButtons();
    }

    setupButtons() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.resetGame());
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (this.gameOver) return;
            
            switch(e.key) {
                case 'ArrowUp':
                    if (this.direction !== 'down') this.direction = 'up';
                    break;
                case 'ArrowDown':
                    if (this.direction !== 'up') this.direction = 'down';
                    break;
                case 'ArrowLeft':
                    if (this.direction !== 'right') this.direction = 'left';
                    break;
                case 'ArrowRight':
                    if (this.direction !== 'left') this.direction = 'right';
                    break;
            }
        });
    }

    generateFood() {
        const x = Math.floor(Math.random() * (this.canvas.width / this.tileSize));
        const y = Math.floor(Math.random() * (this.canvas.height / this.tileSize));
        return {x, y};
    }

    draw() {
        // Limpiar canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Dibujar serpiente con efecto neón
        this.snake.forEach((segment, index) => {
            this.ctx.fillStyle = index === 0 ? '#00ffff' : '#008888';
            this.ctx.shadowBlur = 15;
            this.ctx.shadowColor = '#00ffff';
            this.ctx.fillRect(
                segment.x * this.tileSize,
                segment.y * this.tileSize,
                this.tileSize - 2,
                this.tileSize - 2
            );
        });

        // Dibujar comida con efecto neón
        this.ctx.fillStyle = '#ff0000';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#ff0000';
        this.ctx.fillRect(
            this.food.x * this.tileSize,
            this.food.y * this.tileSize,
            this.tileSize - 2,
            this.tileSize - 2
        );

        // Resetear shadow blur
        this.ctx.shadowBlur = 0;
    }

    move() {
        if (this.gameOver) return;

        const head = {...this.snake[0]};

        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // Verificar colisiones
        if (this.checkCollision(head)) {
            this.gameOver = true;
            this.restartBtn.hidden = false;
            return;
        }

        this.snake.unshift(head);

        // Verificar si come
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            this.scoreDisplay.textContent = this.score;
            this.food = this.generateFood();
        } else {
            this.snake.pop();
        }
    }

    checkCollision(head) {
        if (head.x < 0 ||
            head.x >= this.canvas.width / this.tileSize ||
            head.y < 0 ||
            head.y >= this.canvas.height / this.tileSize ||
            this.snake.some(segment => segment.x === head.x && segment.y === head.y)) {
            
            this.gameOver = true;
            this.gameOverMessage.classList.add('visible');
            return true;
        }
        return false;
    }

    startGame() {
        this.startBtn.hidden = true;
        this.gameLoop();
    }

    resetGame() {
        this.snake = [{x: 5, y: 5}];
        this.direction = 'right';
        this.food = this.generateFood();
        this.score = 0;
        this.scoreDisplay.textContent = this.score;
        this.gameOver = false;
        this.restartBtn.hidden = true;
        this.gameOverMessage.classList.remove('visible');
        this.startGame();
    }

    gameLoop() {
        if (this.gameOver) {
            return;
        }

        this.move();
        this.draw();
        setTimeout(() => requestAnimationFrame(() => this.gameLoop()), 100);
    }
}

// Iniciar el juego cuando se carga la página
window.onload = () => {
    new SnakeGame();
};