class Tetris {
  constructor() {
    // Canvas setup
    this.gameCanvas = document.getElementById("gameCanvas");
    this.holdCanvas = document.getElementById("holdCanvas");
    this.nextCanvas = document.getElementById("nextCanvas");
    this.ctx = this.gameCanvas.getContext("2d");
    this.holdCtx = this.holdCanvas.getContext("2d");
    this.nextCtx = this.nextCanvas.getContext("2d");

    // Game board setup
    this.cols = 10;
    this.rows = 20;
    this.cellSize = 30;
    this.gameCanvas.width = this.cols * this.cellSize;
    this.gameCanvas.height = this.rows * this.cellSize;
    this.holdCanvas.width = this.holdCanvas.height = 4 * this.cellSize;
    this.nextCanvas.width = this.nextCanvas.height = 4 * this.cellSize;

    // Game state
    this.board = Array(this.rows)
      .fill()
      .map(() => Array(this.cols).fill(0));
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.gameOver = false;
    this.paused = false;

    // Piece management
    this.currentPiece = null;
    this.holdPiece = null;
    this.nextPiece = null;
    this.canHold = true;

    // Scoring system
    this.scoreMultiplier = {
      1: 100, // Single line
      2: 300, // Double
      3: 500, // Triple
      4: 800 // Tetris
    };

    // Speed settings
    this.baseSpeed = 1000;
    this.currentSpeed = this.baseSpeed;
    this.softDropSpeed = 50;

    // Initialize UI elements
    this.scoreDisplay = document.getElementById("score");
    this.linesDisplay = document.getElementById("lines");
    this.levelDisplay = document.getElementById("level");
    this.gameOverMessage = document.getElementById("gameOverMessage");
    this.startBtn = document.getElementById("startBtn");
    this.restartBtn = document.getElementById("restartBtn");

    // Event listeners
    this.setupControls();
    this.startBtn.addEventListener("click", () => this.startGame());
    this.restartBtn.addEventListener("click", () => this.resetGame());

    // Optimización de rendimiento
    this.lastTime = 0;
    this.dropCounter = 0;
    this.dropInterval = 1000;
    this.requestId = null;

    // Buffers para el dibujado
    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = this.gameCanvas.width;
    this.offscreenCanvas.height = this.gameCanvas.height;
    this.offscreenCtx = this.offscreenCanvas.getContext('2d');

    this.heightLimit = 8; // Límite de altura para game over (4 filas desde arriba)
  }

  // Tetromino definitions
  tetrominoes = {
    I: {
      shape: [[1, 1, 1, 1]],
      color: "#00ffff"
    },
    J: {
      shape: [
        [1, 0, 0],
        [1, 1, 1]
      ],
      color: "#0000ff"
    },
    L: {
      shape: [
        [0, 0, 1],
        [1, 1, 1]
      ],
      color: "#ff7f00"
    },
    O: {
      shape: [
        [1, 1],
        [1, 1]
      ],
      color: "#ffff00"
    },
    S: {
      shape: [
        [0, 1, 1],
        [1, 1, 0]
      ],
      color: "#00ff00"
    },
    T: {
      shape: [
        [0, 1, 0],
        [1, 1, 1]
      ],
      color: "#ff00ff"
    },
    Z: {
      shape: [
        [1, 1, 0],
        [0, 1, 1]
      ],
      color: "#ff0000"
    }
  };

  generatePiece() {
    const pieces = "IJLOSTZ";
    const type = pieces[Math.floor(Math.random() * pieces.length)];
    const piece = {
      type,
      shape: [...this.tetrominoes[type].shape],
      color: this.tetrominoes[type].color,
      x: Math.floor((this.cols - this.tetrominoes[type].shape[0].length) / 2),
      y: 0
    };
    return piece;
  }

  setupControls() {
    document.addEventListener("keydown", (e) => {
      if (!this.gameOver && !this.paused) {
        switch (e.code) {
          case "ArrowLeft":
            this.movePiece(-1, 0);
            break;
          case "ArrowRight":
            this.movePiece(1, 0);
            break;
          case "ArrowDown":
            this.movePiece(0, 1);
            break;
          case "ArrowUp":
            this.rotatePiece();
            break;
          case "Space":
            this.hardDrop();
            break;
          case "KeyC":
            this.holdPieceFunction();
            break;
        }
      }
    });
  }

  movePiece(dx, dy) {
    const newX = this.currentPiece.x + dx;
    const newY = this.currentPiece.y + dy;

    if (this.isValidMove(this.currentPiece.shape, newX, newY)) {
      this.currentPiece.x = newX;
      this.currentPiece.y = newY;
      return true;
    }
    return false;
  }

  rotatePiece() {
    const rotated = this.currentPiece.shape[0].map((_, i) =>
      this.currentPiece.shape.map((row) => row[i]).reverse()
    );

    if (this.isValidMove(rotated, this.currentPiece.x, this.currentPiece.y)) {
      this.currentPiece.shape = rotated;
    }
  }

  holdPieceFunction() {
    if (!this.canHold) return;

    const temp = this.holdPiece;
    if (!this.holdPiece) {
      this.holdPiece = {
        type: this.currentPiece.type,
        shape: [...this.tetrominoes[this.currentPiece.type].shape],
        color: this.currentPiece.color
      };
      this.currentPiece = this.nextPiece;
      this.nextPiece = this.generatePiece();
    } else {
      this.holdPiece = {
        type: this.currentPiece.type,
        shape: [...this.tetrominoes[this.currentPiece.type].shape],
        color: this.currentPiece.color
      };
      this.currentPiece = {
        type: temp.type,
        shape: [...temp.shape],
        color: temp.color,
        x: Math.floor((this.cols - temp.shape[0].length) / 2),
        y: 0
      };
    }
    this.canHold = false;
    this.drawHoldPiece();
  }

  hardDrop() {
    while (this.movePiece(0, 1)) {
      this.score += 2;
    }
    this.placePiece();
  }

  isValidMove(shape, x, y) {
    for (let row = 0; row < shape.length; row++) {
      for (let col = 0; col < shape[row].length; col++) {
        if (shape[row][col]) {
          const newX = x + col;
          const newY = y + row;

          if (
            newX < 0 ||
            newX >= this.cols ||
            newY >= this.rows ||
            (newY >= 0 && this.board[newY][newX])
          ) {
            return false;
          }
        }
      }
    }
    return true;
  }

  placePiece() {
    for (let row = 0; row < this.currentPiece.shape.length; row++) {
      for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
        if (this.currentPiece.shape[row][col]) {
          const boardY = this.currentPiece.y + row;
          
          // Verificar si la pieza está demasiado arriba
          if (boardY <= this.heightLimit) {
            this.gameOver = true;
            this.showGameOver();
            return;
          }

          this.board[boardY][this.currentPiece.x + col] = {
            color: this.currentPiece.color
          };
        }
      }
    }

    this.clearLines();
    this.currentPiece = this.nextPiece;
    this.nextPiece = this.generatePiece();
    this.canHold = true;
    this.drawNextPiece();
  }

  clearLines() {
    let linesCleared = 0;

    for (let row = this.rows - 1; row >= 0; row--) {
      if (this.board[row].every((cell) => cell !== 0)) {
        this.board.splice(row, 1);
        this.board.unshift(Array(this.cols).fill(0));
        linesCleared++;
        row++;
      }
    }

    if (linesCleared > 0) {
      this.lines += linesCleared;
      this.score += this.scoreMultiplier[linesCleared] * this.level;
      this.level = Math.floor(this.lines / 10) + 1;
      this.currentSpeed = this.baseSpeed / this.level;

      this.updateDisplay();
    }
  }

  draw() {
    // Limpiar el canvas offscreen
    this.offscreenCtx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);

    // Dibujar en el canvas offscreen
    this.drawBoard();
    this.drawCurrentPiece();
    this.drawGhostPiece();

    // Copiar al canvas principal
    this.ctx.clearRect(0, 0, this.gameCanvas.width, this.gameCanvas.height);
    this.ctx.drawImage(this.offscreenCanvas, 0, 0);
  }

  drawBoard() {
    for (let row = 0; row < this.rows; row++) {
      for (let col = 0; col < this.cols; col++) {
        if (this.board[row][col]) {
          this.drawCell(this.offscreenCtx, col, row, this.board[row][col].color);
        }
      }
    }
  }

  drawCurrentPiece() {
    if (!this.currentPiece) return;
    
    for (let row = 0; row < this.currentPiece.shape.length; row++) {
      for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
        if (this.currentPiece.shape[row][col]) {
          this.drawCell(
            this.offscreenCtx,
            this.currentPiece.x + col,
            this.currentPiece.y + row,
            this.currentPiece.color
          );
        }
      }
    }
  }

  drawCell(context, x, y, color) {
    context.fillStyle = color;
    context.shadowBlur = 10;
    context.shadowColor = color;
    context.fillRect(
      x * this.cellSize,
      y * this.cellSize,
      this.cellSize - 1,
      this.cellSize - 1
    );
    context.shadowBlur = 0;
  }

  drawGhostPiece() {
    if (!this.currentPiece) return;

    let ghostY = this.currentPiece.y;
    while (
      this.isValidMove(this.currentPiece.shape, this.currentPiece.x, ghostY + 1)
    ) {
      ghostY++;
    }

    this.offscreenCtx.globalAlpha = 0.3;
    for (let row = 0; row < this.currentPiece.shape.length; row++) {
      for (let col = 0; col < this.currentPiece.shape[row].length; col++) {
        if (this.currentPiece.shape[row][col]) {
          this.drawCell(
            this.offscreenCtx,
            this.currentPiece.x + col,
            ghostY + row,
            this.currentPiece.color
          );
        }
      }
    }
    this.offscreenCtx.globalAlpha = 1;
  }

  drawHoldPiece() {
    this.holdCtx.clearRect(0, 0, this.holdCanvas.width, this.holdCanvas.height);

    if (this.holdPiece) {
      const offsetX =
        ((4 - this.holdPiece.shape[0].length) * this.cellSize) / 2;
      const offsetY = ((4 - this.holdPiece.shape.length) * this.cellSize) / 2;

      for (let row = 0; row < this.holdPiece.shape.length; row++) {
        for (let col = 0; col < this.holdPiece.shape[row].length; col++) {
          if (this.holdPiece.shape[row][col]) {
            this.holdCtx.fillStyle = this.holdPiece.color;
            this.holdCtx.shadowBlur = 10;
            this.holdCtx.shadowColor = this.holdPiece.color;
            this.holdCtx.fillRect(
              offsetX + col * this.cellSize,
              offsetY + row * this.cellSize,
              this.cellSize - 1,
              this.cellSize - 1
            );
          }
        }
      }
    }
  }

  drawNextPiece() {
    this.nextCtx.clearRect(0, 0, this.nextCanvas.width, this.nextCanvas.height);

    if (this.nextPiece) {
      const offsetX =
        ((4 - this.nextPiece.shape[0].length) * this.cellSize) / 2;
      const offsetY = ((4 - this.nextPiece.shape.length) * this.cellSize) / 2;

      for (let row = 0; row < this.nextPiece.shape.length; row++) {
        for (let col = 0; col < this.nextPiece.shape[row].length; col++) {
          if (this.nextPiece.shape[row][col]) {
            this.nextCtx.fillStyle = this.nextPiece.color;
            this.nextCtx.shadowBlur = 10;
            this.nextCtx.shadowColor = this.nextPiece.color;
            this.nextCtx.fillRect(
              offsetX + col * this.cellSize,
              offsetY + row * this.cellSize,
              this.cellSize - 1,
              this.cellSize - 1
            );
          }
        }
      }
    }
  }

  updateDisplay() {
    this.scoreDisplay.textContent = this.score;
    this.linesDisplay.textContent = this.lines;
    this.levelDisplay.textContent = this.level;
  }

  gameLoop(time = 0) {
    const deltaTime = time - this.lastTime;
    this.lastTime = time;
    this.dropCounter += deltaTime;

    if (this.dropCounter > this.dropInterval) {
      if (!this.movePiece(0, 1)) {
        this.placePiece();
        if (this.gameOver || this.checkGameOver()) {
          return;
        }
      }
      this.dropCounter = 0;
    }

    this.draw();
    this.requestId = requestAnimationFrame(time => this.gameLoop(time));
  }

  startGame() {
    this.currentPiece = this.generatePiece();
    this.nextPiece = this.generatePiece();
    this.drawNextPiece();
    this.startBtn.hidden = true;
    this.lastTime = 0;
    this.dropCounter = 0;
    this.requestId = requestAnimationFrame(time => this.gameLoop(time));
  }

  resetGame() {
    this.board = Array(this.rows)
      .fill()
      .map(() => Array(this.cols).fill(0));
    this.score = 0;
    this.lines = 0;
    this.level = 1;
    this.currentSpeed = this.baseSpeed;
    this.gameOver = false;
    this.holdPiece = null;
    this.canHold = true;
    this.updateDisplay();
    this.gameOverMessage.classList.remove("visible");
    this.restartBtn.hidden = true;
    this.holdCtx.clearRect(0, 0, this.holdCanvas.width, this.holdCanvas.height);
    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
    }
    this.startGame();
  }

  showGameOver() {
    // Efecto visual de game over
    const flashEffect = () => {
      for (let row = 0; row < this.rows; row++) {
        for (let col = 0; col < this.cols; col++) {
          if (this.board[row][col]) {
            this.board[row][col].color = '#ff0000';
          }
        }
      }
      this.draw();

      setTimeout(() => {
        for (let row = 0; row < this.rows; row++) {
          for (let col = 0; col < this.cols; col++) {
            if (this.board[row][col]) {
              this.board[row][col].color = '#444444';
            }
          }
        }
        this.draw();
        
        this.gameOverMessage.classList.add('visible');
        this.restartBtn.hidden = false;
        cancelAnimationFrame(this.requestId);
      }, 500);
    };

    flashEffect();
  }

  checkGameOver() {
    // Verificar si hay bloques por encima del límite
    for (let row = 0; row < this.heightLimit; row++) {
      if (this.board[row].some(cell => cell !== 0)) {
        this.gameOver = true;
        this.showGameOver();
        return true;
      }
    }
    return false;
  }
}

// Iniciar el juego cuando se carga la página
window.onload = () => {
  new Tetris();
};
