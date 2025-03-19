class Arkanoid {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Configuración del canvas
        this.canvas.width = 480;
        this.canvas.height = 640;
        
        // Elementos de juego
        this.paddle = {
            width: 80,
            height: 10,
            x: this.canvas.width / 2 - 40,
            y: this.canvas.height - 30
        };
        
        this.ball = {
            size: 8,
            x: this.canvas.width / 2,
            y: this.canvas.height - 40,
            dx: 5,
            dy: -5
        };
        
        // Ajustar configuración de bloques para que quepan en el canvas
        this.blockConfig = {
            rows: 5,
            cols: 8,
            width: 45,  // Reducido para que quepan los bloques
            height: 20,
            padding: 5, // Reducido el padding
            offsetX: 35,
            offsetY: 50
        };

        // Estado del juego
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameStarted = false;
        this.gameOver = false;
        
        // Agregar estado de victoria
        this.victory = false;

        // UI Elements
        this.scoreDisplay = document.getElementById('score');
        this.livesDisplay = document.getElementById('lives');
        this.levelDisplay = document.getElementById('level');
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.gameOverMessage = document.getElementById('gameOverMessage');
        this.startMessage = document.getElementById('startMessage');
        this.victoryMessage = document.getElementById('victoryMessage');
        
        // Event Listeners
        this.setupControls();
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.resetGame());
        
        // Inicializar bloques
        this.initializeBlocks();
    }

    initializeBlocks() {
        this.blocks = [];
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'];
        
        for(let i = 0; i < this.blockConfig.rows; i++) {
            for(let j = 0; j < this.blockConfig.cols; j++) {
                this.blocks.push({
                    x: j * (this.blockConfig.width + this.blockConfig.padding) + this.blockConfig.offsetX,
                    y: i * (this.blockConfig.height + this.blockConfig.padding) + this.blockConfig.offsetY,
                    width: this.blockConfig.width,
                    height: this.blockConfig.height,
                    color: colors[i],
                    active: true
                });
            }
        }
    }

    setupControls() {
        document.addEventListener('mousemove', (e) => {
            if (this.gameStarted && !this.gameOver) {
                const relativeX = e.clientX - this.canvas.offsetLeft;
                if(relativeX > 0 && relativeX < this.canvas.width) {
                    this.paddle.x = relativeX - this.paddle.width / 2;
                }
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && !this.gameStarted) {
                this.startGame();
            }
        });
    }

    startGame() {
        this.gameStarted = true;
        this.startBtn.hidden = true;
        this.startMessage.classList.remove('visible');
        this.gameLoop();
    }

    resetGame() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.gameOver = false;
        this.victory = false;
        this.scoreDisplay.textContent = this.score;
        this.livesDisplay.textContent = this.lives;
        this.levelDisplay.textContent = this.level;
        this.initializeBlocks();
        this.resetBall();
        this.gameOverMessage.classList.remove('visible');
        this.victoryMessage.classList.remove('visible');
        this.restartBtn.hidden = true;
        document.getElementById('gameOverMessage').className = 'game-over';
        this.startGame();
    }

    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height - 40;
        this.ball.dx = 5 * (Math.random() > 0.5 ? 1 : -1);
        this.ball.dy = -5;
    }

    gameLoop() {
        if (this.gameOver) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.moveBall();
        this.checkCollisions();
        this.drawGame();
        requestAnimationFrame(() => this.gameLoop());
    }

    drawGame() {
        // Dibujar paddle con efecto neón
        this.ctx.fillStyle = '#00ff00';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#00ff00';
        this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);

        // Dibujar ball con efecto neón
        this.ctx.fillStyle = '#ffffff';
        this.ctx.shadowColor = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ball.size, 0, Math.PI * 2);
        this.ctx.fill();

        // Dibujar bloques con efecto neón
        this.blocks.forEach(block => {
            if (block.active) {
                this.ctx.fillStyle = block.color;
                this.ctx.shadowColor = block.color;
                this.ctx.fillRect(block.x, block.y, block.width, block.height);
                
                // Añadir brillo extra al borde
                this.ctx.strokeStyle = '#fff';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(block.x, block.y, block.width, block.height);
            } else if (block.breaking) {
                // Animación de ruptura
                this.drawBreakingBlock(block);
            }
        });

        // Resetear shadow blur
        this.ctx.shadowBlur = 0;
    }

    drawBreakingBlock(block) {
        // Crear partículas de explosión
        if (!block.particles) {
            block.particles = [];
            for (let i = 0; i < 8; i++) {
                block.particles.push({
                    x: block.x + block.width/2,
                    y: block.y + block.height/2,
                    dx: (Math.random() - 0.5) * 10,
                    dy: (Math.random() - 0.5) * 10,
                    size: Math.random() * 5 + 2,
                    alpha: 1
                });
            }
        }

        // Dibujar y actualizar partículas
        block.particles.forEach(particle => {
            this.ctx.fillStyle = `rgba(${this.hexToRgb(block.color)},${particle.alpha})`;
            this.ctx.shadowColor = block.color;
            this.ctx.shadowBlur = 10;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();

            // Actualizar posición y opacidad
            particle.x += particle.dx;
            particle.y += particle.dy;
            particle.alpha -= 0.02;
        });

        // Remover bloque cuando la animación termina
        if (block.particles[0].alpha <= 0) {
            block.breaking = false;
            delete block.particles;
        }
    }

    checkCollisions() {
        // Colisión con paredes
        if (this.ball.x + this.ball.dx > this.canvas.width - this.ball.size || 
            this.ball.x + this.ball.dx < this.ball.size) {
            this.ball.dx = -this.ball.dx;
        }
        if (this.ball.y + this.ball.dy < this.ball.size) {
            this.ball.dy = -this.ball.dy;
        }

        // Colisión con paddle
        if (this.ball.y + this.ball.dy > this.canvas.height - this.ball.size) {
            if (this.ball.x > this.paddle.x && 
                this.ball.x < this.paddle.x + this.paddle.width) {
                this.ball.dy = -this.ball.dy;
                // Añadir efecto basado en donde golpea el paddle
                const hitPoint = (this.ball.x - this.paddle.x) / this.paddle.width;
                this.ball.dx = 8 * (hitPoint - 0.5);
            } else {
                this.lives--;
                this.livesDisplay.textContent = this.lives;
                this.checkGameOver();
                if (!this.gameOver) {
                    this.resetBall();
                }
            }
        }

        // Colisión con bloques
        this.blocks.forEach(block => {
            if (block.active && this.checkBlockCollision(this.ball, block)) {
                this.ball.dy = -this.ball.dy;
                block.active = false;
                block.breaking = true;
                this.score += 10;
                this.scoreDisplay.textContent = this.score;
                this.checkVictory(); // Verificar victoria después de destruir un bloque
            }
        });
    }

    checkVictory() {
        const remainingBlocks = this.blocks.filter(block => block.active).length;
        if (remainingBlocks === 0) {
            this.gameOver = true;
            this.victory = true;
            this.victoryMessage.classList.add('visible');
            this.restartBtn.hidden = false;
            this.stopGame();
        }
    }

    checkGameOver() {
        if (this.lives <= 0) {
            this.gameOver = true;
            this.victory = false;
            this.gameOverMessage.classList.add('visible');
            this.restartBtn.hidden = false;
            this.stopGame();
        }
    }

    stopGame() {
        this.gameStarted = false;
        // Detener la pelota
        this.ball.dx = 0;
        this.ball.dy = 0;
    }

    checkBlockCollision(ball, block) {
        return ball.x > block.x && 
               ball.x < block.x + block.width && 
               ball.y > block.y && 
               ball.y < block.y + block.height;
    }

    moveBall() {
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? 
            `${parseInt(result[1], 16)},${parseInt(result[2], 16)},${parseInt(result[3], 16)}` : 
            '255,255,255';
    }
}

// Iniciar el juego cuando se carga la página
window.onload = () => {
    new Arkanoid();
};