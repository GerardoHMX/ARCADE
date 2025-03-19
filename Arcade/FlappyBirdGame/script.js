class FlappyBird {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Configuración del canvas con tamaño más pequeño
        this.canvas.width = 3000;
        this.canvas.height = 4500;
        
        // Elementos UI
        this.scoreDisplay = document.getElementById('score');
        this.highScoreDisplay = document.getElementById('highScore');
        this.gameOverMessage = document.getElementById('gameOverMessage');
        this.startMessage = document.getElementById('startMessage');
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');
        
        // Configuración del juego
        this.gravity = 0.2;     // Reducida de 0.4
        this.jump = -3;         // Menos fuerte que -6
        this.pipeGap = 550;     // Aumentado de 120
        this.pipeWidth = 200;
        this.minPipeHeight = 50;
        
        // Velocidad de movimiento más lenta
        this.gameSpeed = 2;   // Nueva variable para controlar velocidad
        
        // Estado inicial
        this.bird = {
            x: 50,
            y: this.canvas.height / 2,
            velocity: 0,
            width: 10,          // Un poco más grande para mejor visibilidad
            height: 10,
            maxVelocity: 7,      // Limitar velocidad máxima de caída
        };
        this.reset();
        
        // Event listeners
        this.setupControls();
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.resetGame());
        
        // Mejor puntuación
        this.highScore = localStorage.getItem('flappyHighScore') || 0;
        this.highScoreDisplay.textContent = this.highScore;

        // Hacer el canvas responsive
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
    }

    reset() {
        // Corregir dimensiones y posición inicial del pájaro
        this.bird = {
            x: this.canvas.width * 0.2, // 20% desde la izquierda
            y: this.canvas.height / 2,
            width: 20,  // Tamaño más apropiado
            height: 20, // Tamaño más apropiado
            velocity: 0,
            maxVelocity: 7
        };
        
        this.pipes = [];
        this.score = 0;
        this.gameStarted = false;
        this.gameOver = false;
        this.frameCount = 0;
        
        this.scoreDisplay.textContent = '0';
        this.startMessage.classList.add('visible');
        this.gameOverMessage.classList.remove('visible');
    }

    setupControls() {
        // Agregar control con teclas de flecha además de espacio
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' || e.code === 'ArrowUp') {
                e.preventDefault(); // Prevenir scroll
                if (!this.gameStarted) {
                    this.startGame();
                } else if (!this.gameOver) {
                    this.bird.velocity = this.jump;
                }
            }
        });

        // Mejorar controles táctiles
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!this.gameOver && this.gameStarted) {
                this.bird.velocity = this.jump;
            }
        });
    }

    startGame() {
        this.gameStarted = true;
        this.startBtn.hidden = true;
        this.startMessage.classList.remove('visible');
        this.gameLoop();
    }

    createPipe() {
        const minHeight = 50;
        const maxHeight = this.canvas.height - this.pipeGap - minHeight;
        const height = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;
        
        this.pipes.push({
            x: this.canvas.width,
            y: 0,
            width: this.pipeWidth,
            height: height,
            passed: false
        });
        
        this.pipes.push({
            x: this.canvas.width,
            y: height + this.pipeGap,
            width: this.pipeWidth,
            height: this.canvas.height - height - this.pipeGap
        });
    }

    updateBird() {
        // Limitar la velocidad máxima de caída
        this.bird.velocity = Math.min(this.bird.velocity + this.gravity, this.bird.maxVelocity);
        this.bird.y += this.bird.velocity;
        
        // Colisión con el suelo o techo con un pequeño margen
        if (this.bird.y + this.bird.height > this.canvas.height - 5 || this.bird.y < 5) {
            this.gameOver = true;
        }
    }

    updatePipes() {
        for (let i = 0; i < this.pipes.length; i++) {
            const pipe = this.pipes[i];
            pipe.x -= this.gameSpeed;
            
            // Mejorar detección de colisiones
            if (
                this.bird.x < pipe.x + pipe.width &&
                this.bird.x + this.bird.width > pipe.x &&
                (this.bird.y < pipe.y + pipe.height &&
                this.bird.y + this.bird.height > pipe.y)
            ) {
                this.gameOver = true;
            }
            
            // Actualizar puntuación
            if (!pipe.passed && pipe.x + pipe.width < this.bird.x) {
                pipe.passed = true;
                if (i % 2 === 0) { // Solo contar una vez por par de tubos
                    this.score++;
                    this.scoreDisplay.textContent = this.score;
                    
                    // Actualizar mejor puntuación
                    if (this.score > this.highScore) {
                        this.highScore = this.score;
                        this.highScoreDisplay.textContent = this.highScore;
                        localStorage.setItem('flappyHighScore', this.highScore);
                    }
                }
            }
        }
        
        // Eliminar tubos fuera de pantalla
        this.pipes = this.pipes.filter(pipe => pipe.x + pipe.width > 0);
        
        // Crear tubos con más espacio entre ellos
        if (this.frameCount % 150 === 0) {
            this.createPipe();
        }
    }

    draw() {
        // Limpiar canvas
        this.ctx.fillStyle = '#000033';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Dibujar pájaro
        this.ctx.save();
        this.ctx.fillStyle = '#ffff00';
        this.ctx.shadowBlur = 20;
        this.ctx.shadowColor = '#ffff00';
        this.ctx.fillRect(
            this.bird.x, 
            this.bird.y, 
            this.bird.width, 
            this.bird.height
        );
        this.ctx.restore();

        // Dibujar tubos
        this.ctx.fillStyle = '#00ff00';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#00ff00';
        this.pipes.forEach(pipe => {
            this.ctx.fillRect(pipe.x, pipe.y, pipe.width, pipe.height);
        });
    }

    gameLoop() {
        if (this.gameOver) {
            this.gameOverMessage.classList.add('visible');
            this.restartBtn.hidden = false;
            return;
        }
        
        this.frameCount++;
        this.updateBird();
        this.updatePipes();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }

    resetGame() {
        this.reset();
        this.restartBtn.hidden = true;
    }

    resizeCanvas() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth;
        const aspectRatio = 2/3;
        
        this.canvas.width = Math.min(400, containerWidth - 40);
        this.canvas.height = this.canvas.width * aspectRatio;
        
        // Recalcular dimensiones del juego
        this.bird.width = this.canvas.width * 0.075;
        this.bird.height = this.bird.width;
        this.pipeWidth = this.canvas.width * 0.125;
        this.pipeGap = this.canvas.height * 0.25;
        
        // Actualizar posición del pájaro si el juego no ha comenzado
        if (!this.gameStarted) {
            this.bird.x = this.canvas.width * 0.125;
            this.bird.y = this.canvas.height / 2;
        }
    }

    drawStars() {
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * this.canvas.width;
            const y = Math.random() * this.canvas.height;
            const size = Math.random() * 2;
            
            this.ctx.fillStyle = '#fff';
            this.ctx.globalAlpha = Math.random();
            this.ctx.fillRect(x, y, size, size);
        }
        this.ctx.globalAlpha = 1;
    }
}

// Iniciar el juego cuando se carga la página
window.onload = () => {
    new FlappyBird();
};