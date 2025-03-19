class PongGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Configuración del canvas
        this.canvas.width = 800;
        this.canvas.height = 400;
        
        // Configuración del juego
        this.paddleHeight = 100;
        this.paddleWidth = 15;
        this.ballSize = 10;
        this.paddleSpeed = 5;
        this.ballSpeed = 5;
        
        // Estado inicial
        this.initialize();
        
        // Elementos UI
        this.playerScoreElement = document.getElementById('playerScore');
        this.cpuScoreElement = document.getElementById('cpuScore');
        this.gameOverMessage = document.getElementById('gameOverMessage');
        this.victoryMessage = document.getElementById('victoryMessage');
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');
        
        // Event listeners
        this.setupControls();
        this.setupButtons();
    }

    initialize() {
        // Posiciones iniciales
        this.playerPaddle = {
            y: (this.canvas.height - this.paddleHeight) / 2,
            score: 0
        };
        
        this.cpuPaddle = {
            y: (this.canvas.height - this.paddleHeight) / 2,
            score: 0
        };
        
        this.ball = {
            x: this.canvas.width / 2,
            y: this.canvas.height / 2,
            dx: this.ballSpeed,
            dy: this.ballSpeed
        };
        
        this.gameOver = false;
        this.keys = {
            ArrowUp: false,
            ArrowDown: false
        };
    }

    setupControls() {
        document.addEventListener('keydown', (e) => {
            if (this.keys.hasOwnProperty(e.key)) {
                this.keys[e.key] = true;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (this.keys.hasOwnProperty(e.key)) {
                this.keys[e.key] = false;
            }
        });
    }

    setupButtons() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.resetGame());
    }

    update() {
        // Mover jugador
        if (this.keys.ArrowUp && this.playerPaddle.y > 0) {
            this.playerPaddle.y -= this.paddleSpeed;
        }
        if (this.keys.ArrowDown && this.playerPaddle.y < this.canvas.height - this.paddleHeight) {
            this.playerPaddle.y += this.paddleSpeed;
        }

        // IA simple para la CPU
        const paddleCenter = this.cpuPaddle.y + this.paddleHeight / 2;
        if (paddleCenter < this.ball.y - 35) {
            this.cpuPaddle.y += this.paddleSpeed * 0.85;
        } else if (paddleCenter > this.ball.y + 35) {
            this.cpuPaddle.y -= this.paddleSpeed * 0.85;
        }

        // Actualizar posición de la pelota
        this.ball.x += this.ball.dx;
        this.ball.y += this.ball.dy;

        // Colisiones con paredes
        if (this.ball.y <= 0 || this.ball.y >= this.canvas.height) {
            this.ball.dy *= -1;
        }

        // Colisiones con paletas
        if (this.checkPaddleCollision()) {
            this.ball.dx *= -1.1; // Aumentar velocidad
            this.ball.dx = Math.min(Math.abs(this.ball.dx), 15) * Math.sign(this.ball.dx);
        }

        // Puntuación
        if (this.ball.x <= 0) {
            this.cpuPaddle.score++;
            this.cpuScoreElement.textContent = this.cpuPaddle.score;
            this.resetBall();
        } else if (this.ball.x >= this.canvas.width) {
            this.playerPaddle.score++;
            this.playerScoreElement.textContent = this.playerPaddle.score;
            this.resetBall();
        }

        // Verificar fin del juego
        if (this.cpuPaddle.score >= 5) {
            this.gameOver = true;
            this.gameOverMessage.classList.add('visible');
            this.restartBtn.hidden = false;
        } else if (this.playerPaddle.score >= 5) {
            this.gameOver = true;
            this.victoryMessage.classList.add('visible');
            this.restartBtn.hidden = false;
        }
    }

    checkPaddleCollision() {
        // Colisión con paleta del jugador
        if (this.ball.dx < 0 && 
            this.ball.x <= this.paddleWidth && 
            this.ball.y >= this.playerPaddle.y && 
            this.ball.y <= this.playerPaddle.y + this.paddleHeight) {
            return true;
        }
        
        // Colisión con paleta de la CPU
        if (this.ball.dx > 0 && 
            this.ball.x >= this.canvas.width - this.paddleWidth && 
            this.ball.y >= this.cpuPaddle.y && 
            this.ball.y <= this.cpuPaddle.y + this.paddleHeight) {
            return true;
        }
        
        return false;
    }

    resetBall() {
        this.ball.x = this.canvas.width / 2;
        this.ball.y = this.canvas.height / 2;
        this.ball.dx = this.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
        this.ball.dy = this.ballSpeed * (Math.random() > 0.5 ? 1 : -1);
    }

    draw() {
        // Limpiar canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Dibujar línea central
        this.ctx.setLineDash([10, 10]);
        this.ctx.beginPath();
        this.ctx.moveTo(this.canvas.width / 2, 0);
        this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.5)';
        this.ctx.stroke();
        this.ctx.setLineDash([]);

        // Dibujar paletas
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#00ffff';
        this.ctx.fillStyle = '#00ffff';
        this.ctx.fillRect(0, this.playerPaddle.y, this.paddleWidth, this.paddleHeight);
        
        this.ctx.shadowColor = '#ff0000';
        this.ctx.fillStyle = '#ff0000';
        this.ctx.fillRect(this.canvas.width - this.paddleWidth, this.cpuPaddle.y, this.paddleWidth, this.paddleHeight);

        // Dibujar pelota
        this.ctx.shadowColor = '#ffffff';
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(this.ball.x, this.ball.y, this.ballSize, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.shadowBlur = 0;
    }

    startGame() {
        this.startBtn.hidden = true;
        this.gameLoop();
    }

    resetGame() {
        this.initialize();
        this.playerScoreElement.textContent = '0';
        this.cpuScoreElement.textContent = '0';
        this.gameOverMessage.classList.remove('visible');
        this.victoryMessage.classList.remove('visible');
        this.restartBtn.hidden = true;
        this.startGame();
    }

    gameLoop() {
        if (!this.gameOver) {
            this.update();
            this.draw();
            requestAnimationFrame(() => this.gameLoop());
        }
    }
}

// Iniciar el juego cuando se carga la página
window.onload = () => {
    new PongGame();
};