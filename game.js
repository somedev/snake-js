class SnakeGame {
    constructor() {
        this.initializeGame();
        if (typeof window !== 'undefined') {
            this.setupEventListeners();
        }
    }

    initializeGame() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        
        // Initialize basic properties first
        this.snake = [{x: 5, y: 5}];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.gameLoop = null;
        this.speed = 150;
        this.isGameOver = false;
        this.statsKey = 'snake_last5_scores';
        
        // Set canvas size after basic properties are initialized
        this.setCanvasSize();
        
        // Initialize remaining properties
        this.food = this.generateFood();
        this.lastScores = this.loadStats();
        this.renderStats();
    }

    setupEventListeners() {
        // Touch controls
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.setupTouchControls();

        // Bind event listeners
        document.getElementById('startButton').addEventListener('click', () => this.startGame());
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
        window.addEventListener('resize', () => this.setCanvasSize());
    }

    setCanvasSize() {
        const container = this.canvas.parentElement;
        const containerWidth = container.clientWidth - 40; // Account for padding
        const size = Math.min(containerWidth, 400);
        this.canvas.width = size;
        this.canvas.height = size;
        this.gridSize = Math.floor(size / 20);
        // Only draw if we have all required properties
        if (this.snake && this.snake.length > 0 && this.food) {
            this.draw();
        }
    }

    setupTouchControls() {
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchStartX = e.touches[0].clientX;
            this.touchStartY = e.touches[0].clientY;
        }, { passive: false });

        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });

        this.canvas.addEventListener('touchend', (e) => {
            e.preventDefault();
            const touchEndX = e.changedTouches[0].clientX;
            const touchEndY = e.changedTouches[0].clientY;
            
            const dx = touchEndX - this.touchStartX;
            const dy = touchEndY - this.touchStartY;
            
            // Determine swipe direction based on which axis had the larger movement
            if (Math.abs(dx) > Math.abs(dy)) {
                if (dx > 0) {
                    this.handleSwipe('right');
                } else {
                    this.handleSwipe('left');
                }
            } else {
                if (dy > 0) {
                    this.handleSwipe('down');
                } else {
                    this.handleSwipe('up');
                }
            }
        }, { passive: false });
    }

    handleSwipe(newDirection) {
        const opposites = {
            'up': 'down',
            'down': 'up',
            'left': 'right',
            'right': 'left'
        };

        if (this.direction !== opposites[newDirection]) {
            this.nextDirection = newDirection;
        }
    }

    generateFood() {
        let newFood;
        do {
            newFood = {
                x: Math.floor(Math.random() * (this.canvas.width / this.gridSize)),
                y: Math.floor(Math.random() * (this.canvas.height / this.gridSize))
            };
        } while (this.snake.some(segment => 
            segment.x === newFood.x && segment.y === newFood.y
        ));
        return newFood;
    }

    draw() {
        if (!this.ctx || !this.snake || !this.food) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw snake
        this.snake.forEach((segment, index) => {
            const color = index === 0 ? '#4CAF50' : '#45a049';
            this.drawSquare(segment.x, segment.y, color);
        });

        // Draw food
        this.drawSquare(this.food.x, this.food.y, '#ff0000');
    }

    drawSquare(x, y, color) {
        if (!this.ctx) return;
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x * this.gridSize, y * this.gridSize, this.gridSize - 2, this.gridSize - 2);
    }

    move() {
        const head = {...this.snake[0]};

        switch(this.direction) {
            case 'up': head.y--; break;
            case 'down': head.y++; break;
            case 'left': head.x--; break;
            case 'right': head.x++; break;
        }

        // Check for collisions
        if (this.checkCollision(head)) {
            this.gameOver();
            return;
        }

        this.snake.unshift(head);

        // Check if snake ate food
        if (head.x === this.food.x && head.y === this.food.y) {
            this.score += 10;
            document.getElementById('scoreValue').textContent = this.score;
            const oldFood = {...this.food};
            do {
                this.food = this.generateFood();
            } while (this.food.x === oldFood.x && this.food.y === oldFood.y);
            
            // Increase speed slightly
            if (this.speed > 50) {
                this.speed -= 2;
                clearInterval(this.gameLoop);
                this.gameLoop = setInterval(() => this.update(), this.speed);
            }
        } else {
            this.snake.pop();
        }
    }

    checkCollision(head) {
        // Wall collision
        if (head.x < 0 || head.x >= this.canvas.width / this.gridSize ||
            head.y < 0 || head.y >= this.canvas.height / this.gridSize) {
            return true;
        }

        // Self collision - check against all segments except the last one
        // since it will be removed in the next move
        return this.snake.slice(0, -1).some(segment => 
            segment.x === head.x && segment.y === head.y
        );
    }

    handleKeyPress(event) {
        const key = event.key;
        const directions = {
            'ArrowUp': 'up',
            'ArrowDown': 'down',
            'ArrowLeft': 'left',
            'ArrowRight': 'right'
        };

        if (directions[key]) {
            const newDirection = directions[key];
            const opposites = {
                'up': 'down',
                'down': 'up',
                'left': 'right',
                'right': 'left'
            };

            // Only change direction if it's not opposite to current direction
            if (this.direction !== opposites[newDirection]) {
                this.nextDirection = newDirection;
                this.direction = newDirection; // Update current direction immediately
            }
        }
    }

    update() {
        this.move();
        this.draw();
    }

    startGame() {
        if (this.gameLoop) {
            clearInterval(this.gameLoop);
        }
        
        // If previous game ended, save its score (but not if first launch or after reset)
        if (this.isGameOver && this.score > 0) {
            this.saveStats(this.score);
        }
        
        // Reset game state
        this.snake = [{x: 5, y: 5}];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.speed = 150;
        this.isGameOver = false;
        document.getElementById('scoreValue').textContent = '0';
        this.food = this.generateFood();
        
        // Start game loop
        this.gameLoop = setInterval(() => this.update(), this.speed);
    }

    gameOver() {
        clearInterval(this.gameLoop);
        this.gameLoop = null;
        this.isGameOver = true;
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = '30px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game Over!', this.canvas.width / 2, this.canvas.height / 2);
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
        // Save score immediately on game over
        this.saveStats(this.score);
    }

    saveStats(score) {
        this.lastScores.unshift(score);
        if (this.lastScores.length > 5) this.lastScores = this.lastScores.slice(0, 5);
        localStorage.setItem(this.statsKey, JSON.stringify(this.lastScores));
        this.renderStats();
    }

    loadStats() {
        const data = localStorage.getItem(this.statsKey);
        if (data) {
            try {
                return JSON.parse(data);
            } catch {
                return [];
            }
        }
        return [];
    }

    renderStats() {
        const statsList = document.getElementById('scoreStats');
        statsList.innerHTML = '';
        if (this.lastScores.length === 0) {
            statsList.innerHTML = '<li>No games played yet.</li>';
            return;
        }
        this.lastScores.forEach((score, idx) => {
            const li = document.createElement('li');
            li.textContent = `Game ${idx + 1}: ${score}`;
            statsList.appendChild(li);
        });
    }
}

// Initialize the game when the script loads
if (typeof window !== 'undefined') {
    window.addEventListener('load', () => {
        window.snakeGame = new SnakeGame();
    });
} 