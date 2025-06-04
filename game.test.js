import { SnakeGame } from './game.js';

describe('SnakeGame', () => {
    let game;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
        // Create new game instance
        game = new SnakeGame();
    });

    describe('Initialization', () => {
        test('should initialize with correct default values', () => {
            expect(game.snake).toHaveLength(1);
            expect(game.snake[0]).toEqual({ x: 5, y: 5 });
            expect(game.direction).toBe('right');
            expect(game.score).toBe(0);
            expect(game.isGameOver).toBe(false);
        });

        test('should generate food within canvas bounds', () => {
            const food = game.generateFood();
            expect(food.x).toBeGreaterThanOrEqual(0);
            expect(food.x).toBeLessThan(game.canvas.width / game.gridSize);
            expect(food.y).toBeGreaterThanOrEqual(0);
            expect(food.y).toBeLessThan(game.canvas.height / game.gridSize);
        });

        test('should set up canvas correctly', () => {
            expect(game.canvas.getContext).toHaveBeenCalledWith('2d');
            expect(game.ctx).toBeDefined();
        });
    });

    describe('Movement', () => {
        test('should move snake in correct direction', () => {
            const initialHead = { ...game.snake[0] };
            game.move();
            expect(game.snake[0].x).toBe(initialHead.x + 1);
            expect(game.snake[0].y).toBe(initialHead.y);
        });

        test('should not allow 180-degree turns', () => {
            game.direction = 'right';
            game.handleKeyPress({ key: 'ArrowLeft' });
            expect(game.nextDirection).toBe('right');
        });

        test('should allow valid direction changes', () => {
            game.direction = 'right';
            game.handleKeyPress({ key: 'ArrowUp' });
            expect(game.nextDirection).toBe('up');
        });

        test('should handle all arrow keys', () => {
            const directions = {
                'ArrowUp': 'up',
                'ArrowDown': 'down',
                'ArrowLeft': 'left',
                'ArrowRight': 'right'
            };

            Object.entries(directions).forEach(([key, direction]) => {
                game.direction = 'right';
                game.nextDirection = 'right';
                if (key === 'ArrowLeft') {
                    game.handleKeyPress({ key });
                    expect(game.nextDirection).toBe('right');
                } else {
                    game.handleKeyPress({ key });
                    expect(game.nextDirection).toBe(direction);
                }
            });
        });
    });

    describe('Collision Detection', () => {
        test('should detect wall collision', () => {
            game.snake[0] = { x: -1, y: 5 };
            expect(game.checkCollision(game.snake[0])).toBe(true);

            game.snake[0] = { x: game.canvas.width / game.gridSize, y: 5 };
            expect(game.checkCollision(game.snake[0])).toBe(true);
        });

        test('should detect self collision', () => {
            game.snake = [
                { x: 5, y: 5 },
                { x: 5, y: 5 }
            ];
            expect(game.checkCollision(game.snake[0])).toBe(true);
        });

        test('should not detect collision for valid positions', () => {
            game.snake[0] = { x: 5, y: 5 };
            expect(game.checkCollision(game.snake[0])).toBe(false);
        });
    });

    describe('Food Collection', () => {
        test('should increase score when food is collected', () => {
            const initialScore = game.score;
            // Place food directly in front of snake
            game.direction = 'right';
            game.nextDirection = 'right';
            game.snake[0] = { x: 5, y: 5 };
            game.food = { x: 6, y: 5 };
            game.move();
            expect(game.score).toBe(initialScore + 10);
        });

        test('should generate new food after collection', () => {
            // Place food directly in front of snake
            game.direction = 'right';
            game.nextDirection = 'right';
            game.snake[0] = { x: 5, y: 5 };
            game.food = { x: 6, y: 5 };
            const oldFood = { ...game.food };
            game.move();
            expect(game.food).not.toEqual(oldFood);
        });

        test('should not generate food on snake body', () => {
            game.snake = [
                { x: 5, y: 5 },
                { x: 6, y: 5 },
                { x: 7, y: 5 }
            ];
            const food = game.generateFood();
            const isOnSnake = game.snake.some(segment => 
                segment.x === food.x && segment.y === food.y
            );
            expect(isOnSnake).toBe(false);
        });
    });

    describe('Game State', () => {
        test('should reset game state on start', () => {
            game.score = 100;
            game.snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }];
            game.startGame();
            expect(game.score).toBe(0);
            expect(game.snake).toHaveLength(1);
            expect(game.snake[0]).toEqual({ x: 5, y: 5 });
        });

        test('should handle game over correctly', () => {
            game.score = 100;
            game.gameOver();
            expect(game.isGameOver).toBe(true);
            expect(game.gameLoop).toBeNull();
        });

        test('should clear game loop on game over', () => {
            game.gameLoop = setInterval(() => {}, 1000);
            game.gameOver();
            expect(game.gameLoop).toBeNull();
        });
    });

    describe('Stats Management', () => {
        test('should save score to localStorage', () => {
            game.score = 100;
            game.saveStats(game.score);
            expect(localStorage.setItem).toHaveBeenCalled();
        });

        test('should load stats from localStorage', () => {
            const mockScores = [100, 80, 60];
            localStorage.getItem.mockReturnValue(JSON.stringify(mockScores));
            const scores = game.loadStats();
            expect(scores).toEqual(mockScores);
        });

        test('should handle empty localStorage', () => {
            localStorage.getItem.mockReturnValue(null);
            const scores = game.loadStats();
            expect(scores).toEqual([]);
        });

        test('should maintain only last 5 scores', () => {
            const scores = [100, 90, 80, 70, 60, 50];
            scores.forEach(score => game.saveStats(score));
            expect(game.lastScores).toHaveLength(5);
            expect(game.lastScores[0]).toBe(50);
        });
    });

    describe('Touch Controls', () => {
        test('should handle swipe right', () => {
            game.direction = 'up';
            game.handleSwipe('right');
            expect(game.nextDirection).toBe('right');
        });

        test('should handle swipe left', () => {
            game.direction = 'up';
            game.handleSwipe('left');
            expect(game.nextDirection).toBe('left');
        });

        test('should handle swipe up', () => {
            game.direction = 'right';
            game.handleSwipe('up');
            expect(game.nextDirection).toBe('up');
        });

        test('should handle swipe down', () => {
            game.direction = 'right';
            game.handleSwipe('down');
            expect(game.nextDirection).toBe('down');
        });

        test('should prevent opposite direction swipes', () => {
            game.direction = 'right';
            game.handleSwipe('left');
            expect(game.nextDirection).toBe('right');
        });
    });
}); 