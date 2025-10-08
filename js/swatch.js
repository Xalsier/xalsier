document.addEventListener('DOMContentLoaded', () => {
    // --- Configuration and State ---
    const TIME_OPTIONS = [
        { label: '5m', ms: 5 * 60 * 1000 },
        { label: '10m', ms: 10 * 60 * 1000 },
        { label: '15m', ms: 15 * 60 * 1000 },
        { label: '30m', ms: 30 * 60 * 1000 },
        { label: '1h', ms: 60 * 60 * 1000 },
        { label: '2h', ms: 2 * 60 * 60 * 1000 }
    ];

    const THEME_OPTIONS = ['Werewolf', 'Unsorted', 'Monocolor', 'Blue Monocolor'];
    const MAX_SWATCHES = 9; // Maximum number of swatches supported

    // --- Predefined Palettes ---
    const PREMADE_PALETTES = {
        'Monocolor': [
            ['#FFFFFF', '#F4ECEA', '#BAB6B3', '#818181', '#FFFFFF', '#FFFFFF'], 
            ['#ECE0CB', '#DBCDBE', '#B3A899', '#453D31', '#0E0C07', '#ECE0CB'],
        ],
        'Unsorted': [
            ['#131732', '#282C47', '#56DE93', '#FFFFFF', '#FFFFFF', '#FFFFFF']
        ],
        'Werewolf': [
            ['#000000', '#D6C8C8', '#D7D2CC', '#887A79', '#5A504E',  '#2A2220'],
            ['#3E2322', '#532F17', '#724526', '#996C4D', '#9A806A', '#FFE1D9'],
            ['#FFFDED', '#F9D5A8', '#BA6C50', '#974833', '#6C241F', '#34011D'],

        ],
        'Blue Monocolor': [
            ['#444853', '#E7E9F8', '#FFFFFF', '#BFCADE', '#7E91B2', '#9BACC8'],
            ['#FFFEFF', '#EDEBF1', '#C5C6D2', '#9093A7', '#817F81', '#030203'],
            ['#F7F7F7', '#E5E5E5', '#9EA8B2', '#494951', '#32363F', '#090A0C'],
            ['#FFFFFF', '#D0CFE0', '#948FAF', '#716C96', '#5A616E', '#15103A'],

        ]
    };

    let currentTimeIndex = 0;
    let currentThemeIndex = 0;
    // NEW STATE VARIABLE: Tracks the index of the currently displayed palette for the theme
    let currentPaletteIndex = 0; 
    let gameTimer;
    let remainingTime;

    // --- DOM Elements ---
    const mainMenu = document.getElementById('main-menu');
    const gameScreen = document.getElementById('game-screen');
    const timeButton = document.getElementById('time-button');
    const themeButton = document.getElementById('theme-button');
    const startButton = document.getElementById('start-button');
    const timerDisplay = document.getElementById('timer-display');
    const copyMessage = document.getElementById('copy-message');
    const swatchGrid = document.getElementById('swatch-grid');
    
    // Arrays to hold DOM references after initial rendering
    let swatchElements = [];
    let hexDisplayElements = [];

    // --- Initialization and Rendering ---

    /** Creates and inserts the necessary swatch elements into the grid dynamically. */
    function initializeSwatchGrid() {
        swatchGrid.innerHTML = ''; 
        swatchElements = [];
        hexDisplayElements = [];

        for (let i = 0; i < MAX_SWATCHES; i++) {
            const item = document.createElement('div');
            item.className = 'color-swatch-item';
            item.style.display = 'none'; 

            const swatch = document.createElement('div');
            swatch.className = 'color-swatch';
            swatch.id = `swatch-${i}`;
            swatch.title = 'Click to copy Hex Code';
            
            const hexDisplay = document.createElement('span');
            hexDisplay.className = 'hex-display';
            hexDisplay.id = `hex-${i}`;
            hexDisplay.textContent = '#INITIAL';
            
            item.appendChild(swatch);
            item.appendChild(hexDisplay);
            swatchGrid.appendChild(item);

            swatchElements.push(swatch);
            hexDisplayElements.push(hexDisplay);
            
            swatch.addEventListener('click', handleSwatchClick);
        }
    }

    /** Renders a new palette, defaulting to random unless a specific index is provided. */
    function renderNewPalette(isSequential = false) {
        const theme = THEME_OPTIONS[currentThemeIndex];
        let palettes = PREMADE_PALETTES[theme];

        if (!palettes || palettes.length === 0) {
             console.error(`No palettes defined for theme "${theme}".`);
             return; 
        }
        
        // --- Palette Selection Logic ---
        let paletteIndex;
        if (isSequential) {
            // For sequential (timer click), use and increment the currentPaletteIndex
            paletteIndex = currentPaletteIndex;
            // Cycle the index for the next call
            currentPaletteIndex = (currentPaletteIndex + 1) % palettes.length;
        } else {
            // For random (Start button or Swatch click), reset index and pick randomly
            currentPaletteIndex = 0; // Reset state tracking
            paletteIndex = Math.floor(Math.random() * palettes.length);
        }
        
        const palette = palettes[paletteIndex];
        // --- End Palette Selection Logic ---

        // Apply colors to the DOM
        swatchElements.forEach((swatch, index) => {
            const item = swatch.parentElement;
            
            if (index < palette.length) {
                const hexCode = palette[index].toUpperCase(); 
                swatch.style.backgroundColor = hexCode;
                swatch.dataset.hex = hexCode;
                hexDisplayElements[index].textContent = hexCode;
                item.style.display = 'flex'; 
            } else {
                item.style.display = 'none'; 
            }
        });
        
        updateGridLayout(palette.length);
    }
    
/** Dynamically updates the grid-template-columns and grid-template-rows based on the palette size. */
function updateGridLayout(size) {
    if (size <= 4) {
        swatchGrid.style.gridTemplateColumns = 'repeat(2, 1fr)';
        swatchGrid.style.gridTemplateRows = 'repeat(2, 1fr)';
    } else {
        swatchGrid.style.gridTemplateColumns = 'repeat(3, 1fr)';
        const rows = Math.ceil(size / 3);
        swatchGrid.style.gridTemplateRows = `repeat(${rows}, 1fr)`; 
    }
}


    // --- Timer Functions ---
    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        let timeString = '';
        if (hours > 0) {
            timeString += `${hours.toString().padStart(2, '0')}:`;
        }
        timeString += `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        return timeString;
    }

    function updateTimer() {
        remainingTime -= 1000;
        timerDisplay.textContent = formatTime(remainingTime);

        if (remainingTime <= 0) {
            clearInterval(gameTimer);
            endGame();
        }
    }

    // --- Game Flow Functions ---
    function startGame() {
        mainMenu.classList.remove('active');
        gameScreen.classList.add('active');

        // Reset the sequential index when starting a new game (ensures it starts from the top)
        currentPaletteIndex = 0; 

        remainingTime = TIME_OPTIONS[currentTimeIndex].ms;
        timerDisplay.textContent = formatTime(remainingTime);

        // Render the initial palette (randomly selected, as START is random)
        renderNewPalette(false);

        // Start the timer
        gameTimer = setInterval(updateTimer, 1000);
    }

    function endGame() {
        clearInterval(gameTimer);
        window.location.reload(); 
    }

    // --- Event Handlers ---
    
    // Swatch Click (Copy Hex Code)
    async function handleSwatchClick(event) {
        const hexCode = event.currentTarget.dataset.hex;
        
        try {
            await navigator.clipboard.writeText(hexCode);
            copyMessage.textContent = `Copied: ${hexCode}`;
            copyMessage.style.opacity = '1';
            
            setTimeout(() => {
                copyMessage.style.opacity = '0';
            }, 1500);

            // Generate a NEW palette (randomly selected) immediately after copying
            renderNewPalette(false); 
            
        } catch (err) {
            console.error('Could not copy text: ', err);
            copyMessage.textContent = 'Failed to copy! (Must be secure context/HTTPS)';
            copyMessage.style.opacity = '1';
            setTimeout(() => {
                copyMessage.style.opacity = '0';
            }, 1500);
        }
    }
    
    // 1. Time Button Cycle
    timeButton.addEventListener('click', () => {
        currentTimeIndex = (currentTimeIndex + 1) % TIME_OPTIONS.length;
        timeButton.textContent = `Time: ${TIME_OPTIONS[currentTimeIndex].label}`;
    });

    // 2. Theme Button Cycle
    themeButton.addEventListener('click', () => {
        currentThemeIndex = (currentThemeIndex + 1) % THEME_OPTIONS.length;
        themeButton.textContent = `Theme: ${THEME_OPTIONS[currentThemeIndex]}`;
        // Reset sequential index when the theme changes
        currentPaletteIndex = 0;
    });

    // 3. Start Button
    startButton.addEventListener('click', startGame);

    // 4. NEW: Timer Click Handler (Reset Timer and Switch Sequentially)
    timerDisplay.addEventListener('click', () => {
        if (gameScreen.classList.contains('active')) {
            // 1. Reset Timer
            clearInterval(gameTimer);
            remainingTime = TIME_OPTIONS[currentTimeIndex].ms;
            timerDisplay.textContent = formatTime(remainingTime);
            gameTimer = setInterval(updateTimer, 1000);

            // 2. Switch to the next sequential palette
            renderNewPalette(true);
        }
    });


    // --- Setup ---
    initializeSwatchGrid(); 
    timeButton.textContent = `Time: ${TIME_OPTIONS[currentTimeIndex].label}`;
    themeButton.textContent = `Theme: ${THEME_OPTIONS[currentThemeIndex]}`;
});