class DuckHunt {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Configuración del canvas
        this.canvas.width = 800;
        this.canvas.height = 600;
        
        // Elementos UI
        this.scoreDisplay = document.getElementById('score');
        this.levelDisplay = document.getElementById('level');
        this.ducksDisplay = document.getElementById('ducks');
        this.gameOverMessage = document.getElementById('gameOverMessage');
        this.victoryMessage = document.getElementById('victoryMessage');
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');
        
        // Configuración del juego
        this.score = 0;
        this.level = 1;
        this.ducksRemaining = 8;
        this.gameStarted = false;
        this.gameOver = false;
        
        // Configuración de patos
        this.ducks = [];
        this.duckSpeed = 2;
        this.duckSize = 50;
        this.maxDucks = 2;
        this.hitArea = 10;
        
        // Crosshair
        this.crosshair = document.querySelector('.crosshair');
        
        // Event listeners
        this.setupControls();
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.resetGame());
        
        // Añadir línea de predicción
        this.showPredictionLine = true;

        // Ajustar límites del área de juego
        this.gameBounds = {
            minX: this.duckSize,
            maxX: this.canvas.width - this.duckSize,
            minY: this.duckSize,
            maxY: this.canvas.height - this.duckSize
        };
    }

    setupControls() {
        document.addEventListener('mousemove', (e) => {
            this.crosshair.style.left = e.clientX + 'px';
            this.crosshair.style.top = e.clientY + 'px';
        });

        this.canvas.addEventListener('click', (e) => {
            if (!this.gameStarted || this.gameOver) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.checkShot(x, y);
        });
    }

    createDuck() {
        // Asegurar que el pato comience dentro de los límites
        return {
            x: Math.random() * (this.gameBounds.maxX - this.gameBounds.minX) + this.gameBounds.minX,
            y: this.canvas.height - this.duckSize * 2, // Comenzar un poco arriba del borde inferior
            dx: (Math.random() - 0.5) * this.duckSpeed * 2,
            dy: -this.duckSpeed,
            size: this.duckSize,
            hit: false
        };
    }

    checkShot(x, y) {
        this.ducks.forEach(duck => {
            const hitDistance = this.hitArea + duck.size/2;
            const duckCenterX = duck.x + duck.size/2;
            const duckCenterY = duck.y + duck.size/2;
            
            const distance = Math.sqrt(
                Math.pow(x - duckCenterX, 2) + 
                Math.pow(y - duckCenterY, 2)
            );
            
            if (!duck.hit && distance < hitDistance) {
                duck.hit = true;
                this.score += 10;
                this.scoreDisplay.textContent = this.score;
                this.ducksRemaining--;
                this.ducksDisplay.textContent = this.ducksRemaining;
                
                if (this.ducksRemaining <= 0) {
                    this.levelComplete();
                }
            }
        });
    }

    levelComplete() {
        this.level++;
        this.levelDisplay.textContent = this.level;
        this.ducksRemaining = 10;
        this.ducksDisplay.textContent = this.ducksRemaining;
        this.duckSpeed += 0.5;
        this.ducks = [];
        
        if (this.level > 5) {
            this.victory();
        }
    }

    victory() {
        this.gameOver = true;
        this.victoryMessage.classList.add('visible');
        this.restartBtn.hidden = false;
    }

    gameOverCheck() {
        // Modificar la condición de game over
        const escapedDucks = this.ducks.filter(duck => 
            !duck.hit && duck.y <= this.gameBounds.minY && Math.abs(duck.dy) < 0.1
        ).length;
        
        if (escapedDucks > 0) {
            this.gameOver = true;
            this.gameOverMessage.classList.add('visible');
            this.restartBtn.hidden = false;
        }
    }

    update() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Actualizar y dibujar patos
        this.ducks = this.ducks.filter(duck => {
            if (!duck.hit) {
                // Actualizar posición
                let newX = duck.x + duck.dx;
                let newY = duck.y + duck.dy;
                
                // Mantener dentro de los límites horizontales
                if (newX < this.gameBounds.minX || newX > this.gameBounds.maxX) {
                    duck.dx = -duck.dx; // Invertir dirección
                    newX = duck.x + duck.dx; // Recalcular posición
                }
                
                // Mantener dentro de los límites verticales
                if (newY < this.gameBounds.minY) {
                    duck.dy = Math.abs(duck.dy); // Hacer que baje
                    newY = this.gameBounds.minY;
                } else if (newY > this.gameBounds.maxY) {
                    duck.dy = -Math.abs(duck.dy); // Hacer que suba
                    newY = this.gameBounds.maxY;
                }
                
                // Aplicar nuevas posiciones
                duck.x = newX;
                duck.y = newY;
                
                // Dibujar pato
                this.drawDuck(duck);
                
                // Mantener pato en juego si no ha sido golpeado
                return true;
            }
            return false;
        });
        
        // Crear nuevos patos si es necesario
        if (this.ducks.length < this.maxDucks) {
            this.ducks.push(this.createDuck());
        }
        
        // Continuar animación
        if (!this.gameOver) {
            requestAnimationFrame(() => this.update());
        }
    }

    drawPredictionLine(duck) {
        this.ctx.strokeStyle = 'rgba(0, 255, 0, 0.3)';
        this.ctx.setLineDash([5, 5]);
        this.ctx.beginPath();
        this.ctx.moveTo(duck.x + duck.size/2, duck.y + duck.size/2);
        
        let futureX = duck.x;
        let futureY = duck.y;
        for (let i = 0; i < 10; i++) {
            futureX += duck.dx * 5;
            futureY += duck.dy * 5;
            this.ctx.lineTo(futureX + duck.size/2, futureY + duck.size/2);
        }
        
        this.ctx.stroke();
        this.ctx.setLineDash([]);
    }

    drawDuck(duck) {
        this.ctx.fillStyle = '#00ff00';
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = '#00ff00';
        
        // Cuerpo del pato
        this.ctx.fillRect(duck.x, duck.y, duck.size, duck.size);
        
        // Alas (animadas)
        const wingOffset = Math.sin(Date.now() / 100) * 5;
        this.ctx.fillRect(
            duck.x - 10, 
            duck.y + duck.size/4 + wingOffset, 
            10, 
            duck.size/2
        );
        
        this.ctx.shadowBlur = 0;
    }

    startGame() {
        this.gameStarted = true;
        this.startBtn.hidden = true;
        this.update();
    }

    resetGame() {
        this.score = 0;
        this.level = 1;
        this.ducksRemaining = 10;
        this.duckSpeed = 3;
        this.gameOver = false;
        this.ducks = [];
        
        this.scoreDisplay.textContent = this.score;
        this.levelDisplay.textContent = this.level;
        this.ducksDisplay.textContent = this.ducksRemaining;
        
        this.gameOverMessage.classList.remove('visible');
        this.victoryMessage.classList.remove('visible');
        this.restartBtn.hidden = true;
        
        this.startGame();
    }
}

// Iniciar el juego cuando se carga la página
window.onload = () => {
    new DuckHunt();
};