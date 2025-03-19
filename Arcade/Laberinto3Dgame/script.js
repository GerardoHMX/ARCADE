class Maze3D {
    constructor() {
        this.maze = document.getElementById('maze');
        this.player = document.getElementById('player');
        this.levelDisplay = document.getElementById('level');
        this.timerDisplay = document.getElementById('timer');
        this.gameOverMessage = document.getElementById('gameOverMessage');
        this.victoryMessage = document.getElementById('victoryMessage');
        this.startBtn = document.getElementById('startBtn');
        this.restartBtn = document.getElementById('restartBtn');

        // Configuración del juego
        this.currentLevel = 1;
        this.maxLevel = 5;
        this.mazeSize = { width: 15, height: 12 };
        this.cellSize = 50;
        this.playerSize = 30; // Tamaño del jugador
        
        // Posición inicial del jugador (centro del laberinto)
        this.startPos = { 
            x: Math.floor(this.mazeSize.width / 2), 
            y: Math.floor(this.mazeSize.height / 2) 
        };
        this.playerPos = { ...this.startPos };
        this.gameStarted = false;
        this.timer = null;
        this.seconds = 0;

        // Event listeners
        this.setupControls();
        this.startBtn.addEventListener('click', () => this.startGame());
        this.restartBtn.addEventListener('click', () => this.resetGame());

        // Inicializar
        this.generateMaze();
    }

    setupControls() {
        // Controles de teclado
        document.addEventListener('keydown', (e) => {
            if (!this.gameStarted) return;
            
            switch(e.key) {
                case 'ArrowUp':
                    this.movePlayer(0, -1);
                    break;
                case 'ArrowDown':
                    this.movePlayer(0, 1);
                    break;
                case 'ArrowLeft':
                    this.movePlayer(-1, 0);
                    break;
                case 'ArrowRight':
                    this.movePlayer(1, 0);
                    break;
            }
        });

        // Controles móviles
        ['up', 'down', 'left', 'right'].forEach(direction => {
            const btn = document.getElementById(`${direction}Btn`);
            if (btn) {
                btn.addEventListener('click', () => {
                    if (!this.gameStarted) return;
                    switch(direction) {
                        case 'up': this.movePlayer(0, -1); break;
                        case 'down': this.movePlayer(0, 1); break;
                        case 'left': this.movePlayer(-1, 0); break;
                        case 'right': this.movePlayer(1, 0); break;
                    }
                });
            }
        });
    }

    generateMaze() {
        this.maze.innerHTML = '';
        
        // Crear matriz del laberinto con el jugador en el centro
        const grid = Array(this.mazeSize.height).fill().map(() => 
            Array(this.mazeSize.width).fill(1));
        
        // Asegurar que la posición inicial del jugador esté libre
        grid[this.startPos.y][this.startPos.x] = 0;
        
        const stack = [{
            x: this.startPos.x,
            y: this.startPos.y
        }];
        
        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const neighbors = this.getUnvisitedNeighbors(current, grid);
            
            if (neighbors.length === 0) {
                stack.pop();
                continue;
            }
            
            const next = neighbors[Math.floor(Math.random() * neighbors.length)];
            grid[next.y][next.x] = 0;
            grid[(current.y + next.y) / 2][(current.x + next.x) / 2] = 0;
            stack.push(next);
        }
        
        // Crear salida en una pared exterior
        const exits = [];
        for (let i = 1; i < this.mazeSize.height - 1; i++) {
            if (grid[i][1] === 0) exits.push({x: 0, y: i});
            if (grid[i][this.mazeSize.width - 2] === 0) exits.push({x: this.mazeSize.width - 1, y: i});
        }
        for (let i = 1; i < this.mazeSize.width - 1; i++) {
            if (grid[1][i] === 0) exits.push({x: i, y: 0});
            if (grid[this.mazeSize.height - 2][i] === 0) exits.push({x: i, y: this.mazeSize.height - 1});
        }
        
        const exit = exits[Math.floor(Math.random() * exits.length)];
        grid[exit.y][exit.x] = 0;
        this.exitPos = exit;

        // Crear paredes visuales
        this.walls = [];
        for (let y = 0; y < this.mazeSize.height; y++) {
            for (let x = 0; x < this.mazeSize.width; x++) {
                if (grid[y][x] === 1) {
                    const wall = document.createElement('div');
                    wall.className = 'wall';
                    wall.style.left = `${x * this.cellSize}px`;
                    wall.style.top = `${y * this.cellSize}px`;
                    this.maze.appendChild(wall);
                    this.walls.push({x, y});
                }
            }
        }
        
        // Posicionar jugador en el centro
        this.updatePlayerPosition();
    }

    getUnvisitedNeighbors(pos, grid) {
        const neighbors = [];
        const directions = [
            {x: 2, y: 0}, {x: -2, y: 0},
            {x: 0, y: 2}, {x: 0, y: -2}
        ];
        
        for (const dir of directions) {
            const newX = pos.x + dir.x;
            const newY = pos.y + dir.y;
            
            if (newX > 0 && newX < this.mazeSize.width - 1 &&
                newY > 0 && newY < this.mazeSize.height - 1 &&
                grid[newY][newX] === 1) {
                neighbors.push({x: newX, y: newY});
            }
        }
        
        return neighbors;
    }

    movePlayer(dx, dy) {
        const newX = this.playerPos.x + dx;
        const newY = this.playerPos.y + dy;
        
        // Verificar colisiones con paredes
        const walls = Array.from(document.querySelectorAll('.wall'));
        const collision = walls.some(wall => {
            const wallX = parseInt(wall.style.left) / this.cellSize;
            const wallY = parseInt(wall.style.top) / this.cellSize;
            return wallX === newX && wallY === newY;
        });
        
        if (!collision &&
            newX >= 0 && newX < this.mazeSize.width &&
            newY >= 0 && newY < this.mazeSize.height) {
            this.playerPos.x = newX;
            this.playerPos.y = newY;
            this.updatePlayerPosition();
            this.checkVictory();
        }
    }

    updatePlayerPosition() {
        const offsetX = (this.cellSize - this.playerSize) / 2;
        const offsetY = (this.cellSize - this.playerSize) / 2;
        
        this.player.style.left = `${this.playerPos.x * this.cellSize + offsetX}px`;
        this.player.style.top = `${this.playerPos.y * this.cellSize + offsetY}px`;
    }

    checkVictory() {
        if (this.playerPos.x === this.exitPos.x && 
            this.playerPos.y === this.exitPos.y) {
            if (this.currentLevel === this.maxLevel) {
                this.victory();
            } else {
                this.nextLevel();
            }
        }
    }

    nextLevel() {
        this.currentLevel++;
        this.levelDisplay.textContent = this.currentLevel;
        this.mazeSize.width += 2;
        this.mazeSize.height += 2;
        this.generateMaze();
    }

    victory() {
        clearInterval(this.timer);
        this.gameStarted = false;
        this.victoryMessage.classList.add('visible');
        this.restartBtn.hidden = false;
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

    startGame() {
        this.gameStarted = true;
        this.startBtn.hidden = true;
        this.startTimer();
    }

    resetGame() {
        this.currentLevel = 1;
        this.levelDisplay.textContent = this.currentLevel;
        this.seconds = 0;
        this.timerDisplay.textContent = '00:00';
        this.mazeSize = { width: 15, height: 12 };
        this.gameStarted = false;
        this.victoryMessage.classList.remove('visible');
        this.gameOverMessage.classList.remove('visible');
        this.restartBtn.hidden = true;
        clearInterval(this.timer);
        this.generateMaze();
        this.startGame();
    }
}

// Iniciar el juego cuando se carga la página
window.onload = () => {
    new Maze3D();
};