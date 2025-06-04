// Mock canvas and context
const mockContext = {
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    fillText: jest.fn(),
    fillStyle: '',
    font: '',
    textAlign: ''
};

const mockCanvas = {
    getContext: jest.fn(() => mockContext),
    width: 400,
    height: 400,
    addEventListener: jest.fn(),
    parentElement: {
        clientWidth: 400
    }
};

// Mock DOM elements
const mockElement = {
    addEventListener: jest.fn(),
    textContent: '',
    innerHTML: '',
    appendChild: jest.fn()
};

// Mock document methods
document.getElementById = jest.fn((id) => {
    if (id === 'gameCanvas') return mockCanvas;
    if (id === 'startButton') return mockElement;
    if (id === 'scoreValue') return mockElement;
    if (id === 'scoreStats') return mockElement;
    return null;
});

document.createElement = jest.fn((tag) => ({
    ...mockElement,
    textContent: ''
}));

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn()
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Mock requestAnimationFrame
global.requestAnimationFrame = jest.fn(callback => setTimeout(callback, 0));

// Mock performance.now
global.performance = {
    now: jest.fn(() => 0)
}; 