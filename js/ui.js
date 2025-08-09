// js/ui.js

// --- Imports ---
import { getPlayers } from './players.js';
import { isActionAllowed } from './state.js';
import { 
    animateDiceRoll, 
    clearHighlights, 
    startDiceShake, 
    stopDiceShake,
    clearDeckHighlights,
} from './animations.js';

import { 
    state,
    getCurrentPlayer,
    updateGameState,
    updateUIState,
} from './state.js';

import { 
    advanceToNextPlayer,
    handlePathChoice,
} from './game.js';

import { drawCard } from './cards.js';

import { applyCardEffect } from './resourceManagement.js';

import { 
    fullDeckRegionPathMap, 
} from './board-data.js';

/**
 * Initializes the entire UI module. Should be called once the DOM is fully loaded.
 */
export function initializeUI() {
    //console.log("Initializing UI module...");

    // Ensure state.ui is initialized
    if (!state.ui) {
        state.ui = {};
    }

    // 1. Init dynamic state holder
    updateUIState({
        dynamic: state.ui.dynamic || {}
    });

    // 2. Set up all DOM references
    initializeElementReferences();

    // 3. Validate required elements
    if (!validateElements()) {
        console.error("UI initialization failed: one or more critical elements are missing from the DOM.");
        return false;
    }

    // 4. Set up event listeners
    setupEventListeners();

    // 5. Canvas context
    const boardCanvas = state.ui.elements.gameBoard?.boardCanvas;
    if (!boardCanvas) {
        console.error("Canvas element 'boardCanvas' not found.");
        return false;
    }

    const boardCtx = boardCanvas.getContext('2d');
    updateUIState({
        dynamic: {
            ...state.ui.dynamic,
            boardCtx
        }
    });
    if (!boardCtx) {
        console.error("Could not get canvas context for the board.");
        return false;
    }

    //console.log("UI Initialized Successfully.");
    return true;
};

/**
 * Caches references to all required DOM elements into the state.ui object.
 */
function initializeElementReferences() {
    //console.log("Caching DOM references...");

    updateGameState({
        ui: {
            ...state.ui,
            elements: {
                deckType: {
                    ageOfExpansionDeck: document.getElementById('age-Of-Expansion-Deck'),
                    ageOfResistanceDeck: document.getElementById('age-Of-Resistance-Deck'),
                    ageOfReckoningDeck: document.getElementById('age-Of-Reckoning-Deck'),
                    ageOfLegacyDeck: document.getElementById('age-Of-Legacy-Deck'),
                    endOfTurnDeck: document.getElementById('end-Of-Turn-Deck'),
                },
                gameBoard: {
                    boardCanvas: document.getElementById('board-Canvas'),
                    resourceScoreContainer: document.querySelector('.resource-Score-Container'),
                    playerScoreDisplay: document.querySelectorAll('.player-Score-Display'),
                    boardTokenCanvas: document.getElementById('board-Token-Canvas'),
                    roleName: document.querySelectorAll('.role-Name'),
                    tokenLayer: document.getElementById('token-Layer'),
                    boardContainerWrapper: document.getElementById('board-Container-Wrapper'),
                    boardContainer: document.getElementById('board-Container'),
                    playerInfoPanel: document.getElementById('player-Info-Panel'),
                    resourceDisplayContainer: document.getElementById('resource-Display-Container'),
                    currentPlayer: document.getElementById('currentPlayer'),
                    KNOWLEDGE_COUNT: document.getElementById('KNOWLEDGE_COUNT'),
                    MONEY_COUNT: document.getElementById('MONEY_COUNT'),
                    INFLUENCE_COUNT: document.getElementById('INFLUENCE_COUNT'),
                    diceAnimationArea: document.getElementById('dice-Animation-Area'),
                    dice: document.getElementById('dice'),
                    endTurnButton: document.getElementById('end-Turn-Button'),
                },
                popovers: {
                    choicepointPopover: document.getElementById('choicepoint-Popover'),
                    ageCardChoiceButtonOne: document.querySelectorAll('.card-Choice-Button-One'),
                    ageCardChoiceButtonTwo: document.querySelectorAll('.card-Choice-Button-Two'),
                    cardChoiceOptionOne: document.querySelectorAll('.card-Choice-Option-One'),
                    cardChoiceOptionTwo: document.querySelectorAll('.card-Choice-Option-Two'),
                    choicepointPopoverContainer: document.getElementById('choicepoint-Popover-Container'),
                    pathChoicePopoverContainer: document.getElementById('path-Choice-Popover-Container'),
                    cardPopoverContainer: document.getElementById('card-Popover-Container'),
                    pathChoiceOptions: document.getElementById('path-Choice-Options'),
                    choicepointOptions: document.getElementById('choicepoint-Options'),
                    pathChoicePopover: document.getElementById('path-Choice-Popover'),
                    cardPopover: document.getElementById('card-Popover'),
                    cardTitle: document.getElementById('card-Title'),
                    stealPopover: document.getElementById('steal-Popover'),
                    stealPopoverContainer: document.getElementById('steal-Popover-Container'),
                    playerPopover: document.querySelectorAll('.player-Popover'),
                    cardDescription: document.getElementById('card-Description'),
                    ageOfExpansionDeck: document.getElementById('age-Of-Expansion-Deck'),
                    ageOfResistanceDeck: document.getElementById('age-Of-Resistance-Deck'),
                    ageOfReckoningDeck: document.getElementById('age-Of-Reckoning-Deck'),
                    ageOfLegacyDeck: document.getElementById('age-Of-Legacy-Deck'),
                    endOfTurnDeck: document.getElementById('end-Of-Turn-Deck'),
                    cardEffects: document.getElementById('card-Effects'),
                    popoverContainer: document.querySelectorAll('.popover-Container'),
                    cardPopoverContainer: document.querySelectorAll('.card-Popover-Container'),
                    showCardDetailsButton: document.getElementById('show-Card-Details-Button'),
                    closeCardButton: document.getElementById('close-Card-Button'),
                },
                endGame: {
                    endGameScreen: document.getElementById('end-Game-Screen'),
                    winnerDisplay: document.getElementById('winner-Display'),
                    finalScores: document.getElementById('final-Scores'),
                    newGameButton: document.getElementById('new-Game-Button'),
                }
            }
        }
    });

    //console.log("UI elements cached:", state.ui.elements);
    return true;
};

/**
 * Validates that all critical DOM elements have been found.
 * @returns {boolean} - True if all elements are present, false otherwise.
 */
function validateElements() {
    let allFound = true;
    for (const group in state.ui.elements) {
        for (const key in state.ui.elements[group]) {
            if (!state.ui.elements[group][key]) {
                console.error(`UI element not found: ${group}.${key}`);
                allFound = false;
            }
        }
    }
    return allFound;
};

/**
 * Sets up all necessary event listeners for UI interactions.
 */
function setupEventListeners() {
    //console.log("Setting up event listeners...");
    const { gameBoard, popovers, endGame } = state.ui.elements;

    // --- Game Board Buttons ---
    gameBoard.endTurnButton.addEventListener('click', () => {
        playClickSound();
        //console.log("End Turn button clicked.");
        gameBoard.endTurnButton.classList.remove('shake');
        console.log('*************CALL advanceToNextPlayer *************');
        advanceToNextPlayer();
    });
    // Dice Roll
    gameBoard.dice.addEventListener('click', () => {
        rollDiceSound();
        if (state.currentPhase !== 'ROLLING') return; // Only act during ROLLING phase
    
        console.log('🎯========== Dice clicked in ROLLING phase==========');
        
        // Disable dice immediately after click to prevent multiple rolls
        gameBoard.dice.style.pointerEvents = 'none';
        gameBoard.dice.disabled = true;
    
        stopDiceShake?.(); // Optional: stops visual shake
        updateGameState({ currentPhase: 'PLAYING' }); // Phase gating
        animateDiceRoll(2000); // Your full animation + logic
        
        // Re-enable dice after animation completes (for next turn)
        setTimeout(() => {
            gameBoard.dice.style.pointerEvents = 'auto';
            gameBoard.dice.disabled = false;
        }, 3000);
    });
  
    popovers.showCardDetailsButton?.addEventListener('click', () => {
        //console.log('=============showCardDetailsButton clicked=============');
        if (popovers.cardEffects) {
            const currentDisplay = popovers.cardEffects.style.display;
            popovers.cardEffects.style.display = currentDisplay === 'none' ? 'block' : 'none';
        }
    });

    // Set up event listeners for all close age card buttons
    if (popovers.closeAgeCardButtons) {
        
        popovers.closeAgeCardButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Clear deck highlights
                clearDeckHighlights();
                console.log('===========closeAgeCardButtons clicked=============')
                
                // Close the dialog
                const dialog = button.closest('dialog');
                if (dialog) {
                    dialog.close();
                }
                
                // Apply age card effects
                const currentPlayer = getCurrentPlayer();
                if (currentPlayer) {
                    // Get the original card data from the dialog
                    const cardData = dialog?.dataset?.cardData;
                    if (cardData) {
                        try {
                            const card = JSON.parse(cardData);
                            // Apply the age card effects
                            applyCardEffect(player, card);
                        } catch (error) {
                            console.error('Error parsing card data:', error);
                        }
                    } else {
                        console.error('No card data found in dialog');
                    }
                }
            });
        });
    }

    // --- End Game Screen Button ---
    endGame.newGameButton.addEventListener('click', () => {
        playClickSound();
        //console.log("--------New Game button clicked. Reloading page.--------");
        window.location.reload();
    });

    // --- Canvas Click Listener ---
    // --- Canvas Click Listener ---
    gameBoard.boardCanvas.addEventListener('click', (event) => {
        console.log('==============Canvas clicked==============');
        const player = getCurrentPlayer();
        //console.log('Current player:', player);
        //console.log('Current phase:', state.currentPhase);
        
        if (state.currentPhase === 'AWAITING_CARD_ACTION' && player?.isHuman) {
            handleCanvasCardClick(event);
        } else {
            //console.log(`Canvas click ignored in phase: ${state.currentPhase}`);
        }
    });

    gameBoard.boardTokenCanvas.addEventListener('click', (event) => {
    });
};
    // --- Option A Button ---

/**
 * Handles the logic for when the canvas is clicked during the AWAITING_CARD_CLICK phase.
 * @param {MouseEvent} event - The click event.
 * @param {Object} coords - Optional coordinates object {x, y} for programmatic calls
 * @param {Object} player - Optional player object for programmatic calls
 */
export function handleCanvasCardClick(event, coords = null, player = null) {
    console.log('=============handleCanvasCardClick=============');
    const { boardCanvas } = state.ui.elements.gameBoard;
    
    // Use provided player or get current player
    const currentPlayer = player || getCurrentPlayer();
    
    if (!currentPlayer || !currentPlayer.isHuman) {
        return; // Only human players should handle card clicks this way
    }

    let boardX, boardY;

    if (event) {
        // Handle mouse event
        const rect = boardCanvas.getBoundingClientRect();
        const scaleX = boardCanvas.width / rect.width;
        const scaleY = boardCanvas.height / rect.height;
        boardX = (event.clientX - rect.left) * scaleX;
        boardY = (event.clientY - rect.top) * scaleY;
    } else if (coords) {
        // Use provided coordinates
        boardX = coords.x;
        boardY = coords.y;
    } else {
        console.error('handleCanvasCardClick called without event or coordinates');
        return;
    }

    //console.log(`Canvas clicked for card draw at board coords: (${boardX.toFixed(0)}, ${boardY.toFixed(0)})`);

    // Check which deck region was clicked using fullDeckRegionPathMap positions.
    let clickedDeckType = null;
    
    // Get current player's path to determine which deck should be clickable
    const playerPath = currentPlayer.currentPath;
    const isEndOfTurn = state.currentPhase === 'TURN_TRANSITION';
    
    // Determine which deck types should be clickable based on player position and game phase
    let allowedDeckTypes = [];
    if (isEndOfTurn) {
        // At end of turn, allow up to 2 deck types (current path + adjacent if applicable)
        if (playerPath) {
            allowedDeckTypes.push(playerPath.toLowerCase().replace('age of ', '').replace(' ', ''));
        }
    } else {
        // During normal play, only allow current path deck
        if (playerPath) {
            allowedDeckTypes.push(playerPath.toLowerCase().replace('age of ', '').replace(' ', ''));
        }
    }

    for (const [key, region] of Object.entries(fullDeckRegionPathMap)) {
        if (region.positions && region.positions.length > 0) {
            // Only check regions that are currently allowed
            const regionDeckType = region.deckType.toLowerCase();
            const isAllowed = allowedDeckTypes.some(allowed => regionDeckType.includes(allowed));
            
            if (!isAllowed) continue;
            
            // Check each position in the region
            for (const pos of region.positions) {
                if (boardX >= pos.topleft && boardX <= pos.bottomrightx && 
                    boardY >= pos.toplefty && boardY <= pos.bottomright) {
                    clickedDeckType = region.deckType;
                    playClickSound();
                    //console.log(`Clicked on ${region.pathName} deck: ${clickedDeckType}`);
                    break;
                }
            }
            if (clickedDeckType) break;
        }
    }

    if (clickedDeckType) {
        playClickSound();
        //console.log(`Drawing from deck: ${clickedDeckType}`);
        clearHighlights();
        
        // Disable canvas clicks immediately after card draw to prevent multiple clicks
        const canvas = state.ui.elements.gameBoard.boardCanvas;
        if (canvas) {
            canvas.style.pointerEvents = 'none';
            setTimeout(() => {
                canvas.style.pointerEvents = 'auto';
            }, 2000); // Re-enable after 2 seconds
        }
        
        drawCard(clickedDeckType);
    } else {
        playErrorSound()
        console.log(`No valid deck region clicked at coordinates (${boardX}, ${boardY})`);
    }
    console.log('=============handleCanvasCardClick END=============');
};

// --- UI Update Functions ---  

/**
 * Displays a message to the user in the message log.
 * @param {string} message - The message to display.
 */
export function showMessage(message) {
}; 

export function promptForPathChoice(pathOptions, player, aiChosenOption = null) {
    if (!isActionAllowed('promptForPathChoice')) return;
    if (!state) {
        console.error('Game state not initialized');
        return;
    }
    updateGameState({
        currentPhase: 'AWAITING_PATH_CHOICE'
    });

    console.log('=============promptForPathChoice=============');
    //console.log('Path options:', pathOptions);
    //console.log('Player:', player);
    
    updateGameControls(); // Sync UI with game state

    const popover = document.getElementById('path-Choice-Popover');
    if (!popover) {
        console.error('Path-choice pop-over not found');
        return;
    }

    const idMap = {
        ageOfExpansion: 'age-Of-Expansion-Path',
        ageOfResistance: 'age-Of-Resistance-Path',
        ageOfReckoning: 'age-Of-Reckoning-Path',
        ageOfLegacy: 'age-Of-Legacy-Path',
    };

    // Store the original button references before cloning
    const originalButtons = {};
    Object.entries(idMap).forEach(([key, id]) => {
        const button = document.getElementById(id);
        if (button) {
            originalButtons[key] = button;
        }
    });

    // Clone and replace buttons
    Object.entries(idMap).forEach(([key, id]) => {
        const oldButton = document.getElementById(id);
        if (oldButton) {
            try {
                const newButton = oldButton.cloneNode(true);
                oldButton.replaceWith(newButton);
                
                // Reattach click handler
                newButton.onclick = () => {
                    const option = pathOptions.find(opt => opt.pathName === key);
                    if (option) {
                        //console.log(`Path chosen: ${key}`, option);
                        popover.close();
                        handlePathChoice(option.coords, key);
                    }
                };
            } catch (err) {
                console.error(`Failed to clone button with id ${id}:`, err);
            }
        }
    });

    if (player && !player.isHuman && aiChosenOption) {
        // AI Logic: Show popover and run the 8-second animation sequence
        //console.log('Showing modal for AI player');
        try {
            popover.showModal();
        } catch (err) {
            console.error('Failed to show modal:', err);
            return;
        }

        // 2.5s delay to identify the button
        setTimeout(() => {
            const chosenButton = document.getElementById(idMap[aiChosenOption.pathName]);
            if (chosenButton) {
                chosenButton.classList.add('ai-chosen-path');
            }

            // 2.5s for the pulse animation to run
            setTimeout(() => {
                // 2.5s final delay after animation
                setTimeout(() => {
                    try {
                        popover.close();
                    } catch (err) {
                        console.error('Failed to close popover:', err);
                    }
                    if (chosenButton) {
                        chosenButton.classList.remove('ai-chosen-path');
                    }
                    handlePathChoice(aiChosenOption.coords, aiChosenOption.pathName);
                }, 2500);
            }, 2500);
        }, 2500);

    } else if (player && player.isHuman) {
        // Human Logic: Attach listeners and show popover
        if (Array.isArray(pathOptions) && pathOptions.length > 0) {
            //console.log('Setting up path choice buttons for human player');
            
            // Clear any existing event listeners first
            Object.values(idMap).forEach(id => {
                const button = document.getElementById(id);
                if (button) {
                    const newButton = button.cloneNode(true);
                    button.parentNode.replaceChild(newButton, button);
                }
            });
            
            // Set up new event listeners
            pathOptions.forEach((option) => {
                if (!option || !option.pathName) {
                    console.error('Invalid path option:', option);
                    return;
                }
                
                // Remove 'Path' suffix if present for the ID lookup
                const pathKey = option.pathName.replace(/Path$/, '');
                const button = document.getElementById(idMap[pathKey]);
                
                if (button) {
                    //console.log(`Setting up button for ${option.pathName}`);
                    button.addEventListener('click', () => {
                        //console.log(`Path chosen: ${option.pathName}`, option.coords);
                        try {
                            if (typeof popover.close === 'function') {
                                popover.close();
                            }
                            handlePathChoice(option.coords, option.pathName);
                        } catch (err) {
                            console.error('Error handling path choice:', err);
                        }
                    }, { once: true });
                } else {
                    console.error(`Button not found for path: ${option.pathName} (looked for ID: ${idMap[pathKey]})`);
                }
            });
            
            // Show the modal after setting up the buttons
            try {
                //console.log('Showing path choice modal');
                popover.showModal();
            } catch (err) {
                console.error('Failed to show path choice modal:', err);
            }
        } else {
            console.error('promptForPathChoice called with invalid pathOptions:', pathOptions);
        }
        try {
            popover.showModal();
        } catch (err) {
            console.error('Failed to show modal:', err);
        }
    }
    console.log('=============promptForPathChoice END=============');
};

export function promptForChoicepoint(options, onChoice, delayMs = 3000) {
    console.log('=============promptForChoicepoint=============');
    if (!isActionAllowed('promptForChoicepoint')) return;
    updateGameState({ currentPhase: 'AWAITING_PATH_CHOICE' });
    updateUIState({ currentPhase: 'AWAITING_PATH_CHOICE' });
    console.warn('game phase updated to AWAITING_PATH_CHOICE');

    const popover = document.getElementById('choicepoint-Popover');
    const container = document.getElementById('choicepoint-Options');

    if (!popover || !container) {
        console.error('Missing choicepoint modal or container');
        return;
    }

    container.innerHTML = '';

    try {
        popover.showModal();
    } catch (err) {
        console.error('Failed to open choicepoint modal:', err);
    }

    // Map path names to CSS classes
    const pathClassMap = {
        'ageOfExpansionPath': 'purple',
        'ageOfResistancePath': 'blue',
        'ageOfReckoningPath': 'cyan',
        'ageOfLegacyPath': 'pink'
    };

    options.forEach((option) => {
        const button = document.createElement('button');
        button.textContent = option.pathName;

        // Assign the correct CSS class for color
        const cssClass = pathClassMap[option.pathName] || 'default-path-color';
        button.classList.add('path-button', cssClass);

        Object.assign(button.style, {
            color: 'white',
            margin: '10px',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            fontSize: '16px',
            cursor: 'pointer',
            transformOrigin: 'center center',
            transition: 'transform 0.3s ease'
        });

        button.addEventListener('click', () => {
            popover.close();
            onChoice(option); // Return the chosen option with coords and pathName
        });

        container.appendChild(button);
    });

    const player = getCurrentPlayer();
    if (player && !player.isHuman) {
        // AI logic: random choice + scale animation + auto-close + auto-call onChoice
        const aiIndex = Math.floor(Math.random() * options.length);
        const aiOption = options[aiIndex];

        const button = Array.from(container.children).find(button => button.textContent === aiOption.pathName);

        if (button) {
            // Animate scale sequence: 1.0 -> 0.9 -> 0.8 -> 0.9 -> 1.0 with delays
            const scaleSequence = [0.9, 0.8, 0.7, 0.8, 0.9, 1.0];
            let step = 0;

            function animateScale() {
                if (step < scaleSequence.length) {
                    button.style.transform = `scale(${scaleSequence[step]})`;
                    step++;
                    setTimeout(animateScale, 500); // 600ms per step approx
                } else {
                    // After scaling animation finishes, close popover and call onChoice after 2s delay
                    setTimeout(() => {
                        popover.close();
                        button.style.transform = ''; // reset transform
                        onChoice(aiOption); // Return the chosen option with coords and pathName
                    }, 2000);
                }
            }

            // Initial delay before starting animation
            setTimeout(animateScale, delayMs);
        }
    }
    //console.log('=============promptForChoicepoint END=============');
}
  
export function updateGameControls() {
    //console.log('=============updateGameControls=============');
    const player = getCurrentPlayer();
    let rollEnabled = false;
    let endTurnEnabled = false;

    if (player && player.isHuman && !state.ended) {
        switch (state.currentPhase) {
            case 'ROLLING':
                rollEnabled = true;
                break;
            case 'PLAYING':
                rollEnabled = false;
                break;
            case 'AWAITING_CARD_CLICK':
            case 'AWAITING_PATH_CHOICE':
                // Disable both during these phases
                break;
            case 'MOVE_COMPLETE':
                endTurnEnabled = true;
                break;
            default:
                console.warn(`Unknown game phase: ${state.currentPhase}`);
        }
    }

    const dice = state.ui.elements.gameBoard?.dice;
    if (dice) {
        dice.style.pointerEvents = rollEnabled ? 'auto' : 'none';
        if (rollEnabled) {
            startDiceShake();
        } else {
            stopDiceShake();
        }
    }

    const endTurnButton = state.ui.elements.gameBoard?.endTurnButton;
    if (endTurnButton) {
        endTurnButton.disabled = !endTurnEnabled;
    }

    //console.log(`UI Controls Updated: Roll=${rollEnabled}, EndTurn=${endTurnEnabled}, Phase=${state.currentPhase}`);
    //console.log('=============updateGameControls END=============');
};
  
  /**
   * Flash a feedback animation near the resource panel for the player
   */
export function showResourceChangeFeedback(playerId, resourceType, amount) {
    //console.log('=============showResourceChangeFeedback=============');
    const panel = document.getElementById(`resource-Display-Container-${playerId}`);
    if (!panel) return;
  
    const feedbackEl = panel.querySelector('.resource-feedback');
    if (!feedbackEl) return;
  
    const sign = amount > 0 ? '+' : '';
    const emoji = {
      money: '💰',
      knowledge: '🧠',
      influence: '⚡'
    }[resourceType] || '';
  
    feedbackEl.textContent = `${emoji} ${sign}${amount}`;
    feedbackEl.style.opacity = '1';
    feedbackEl.style.transform = 'translateY(-10px)';
    feedbackEl.style.transition = 'all 0.6s ease';
  
    // Fade out after a moment
    setTimeout(() => {
      feedbackEl.style.opacity = '0';
      feedbackEl.style.transform = 'translateY(0px)';
    }, 1000);
}

/**
 * Updates the player information panel with the current player's stats.
 * @param {string|Object} playerId - The ID of the player to display, or a player object.
 */
export function updatePlayerInfo(currentPlayer = getCurrentPlayer(), newValues = {}) {
    //console.log('==============updatePlayerInfo=============')
    //console.log('[UI] updatePlayerInfo called with:', playerId);
    
    try {
        // If no player ID provided, try to get current player from game state
        if (currentPlayer === undefined || currentPlayer === null) {
            //console.log('updatePlayerInfo: No player ID provided, trying to get current player from game state');
            if (state.game?.currentPlayerIndex !== undefined && state.players?.[state.game.currentPlayerIndex]) {
                currentPlayer = state.players[state.game.currentPlayerIndex].id;
                //console.log('updatePlayerInfo: Using current player ID:', playerId);
            } else {
                console.warn('updatePlayerInfo: Could not determine current player');
                return;
            }
        }
        
        // Handle case where playerId is an object (should be string)
        const playerIdStr = typeof currentPlayer === 'object' ? (currentPlayer.id || '') : String(currentPlayer || '');
        
        if (!playerIdStr) {
            console.warn('updatePlayerInfo: Empty player ID provided');
            return;
        }
  
        const players = getPlayers();
        //console.log('[UI] All players:', players);
        
        if (!Array.isArray(players)) {
            console.error('updatePlayerInfo: Players data is not an array');
            return;
        }
        currentPlayer = players.find(p => p && p.id === playerIdStr);
        if (!currentPlayer) {
            console.error(`updatePlayerInfo: Player with ID ${playerIdStr} not found. Available players:`, 
                players.map(p => p ? p.id : 'null'));
            return;
        }
        
        console.log('[UI] Found player:', {
            id: currentPlayer.id,
            name: currentPlayer.name,
            role: currentPlayer.role,
            resources: currentPlayer.resources,
            isHuman: currentPlayer.isHuman
        });
  
        const { currentPlayer: playerElement, KNOWLEDGE_COUNT, MONEY_COUNT, INFLUENCE_COUNT } = state.ui.elements.gameBoard || {};
        
        // Log the UI elements for debugging
       console.log('[UI] UI Elements:', {
            currentPlayer: !!playerElement,
            KNOWLEDGE_COUNT: !!KNOWLEDGE_COUNT,
            MONEY_COUNT: !!MONEY_COUNT,
            INFLUENCE_COUNT: !!INFLUENCE_COUNT
        });
        
        if (!playerElement || !KNOWLEDGE_COUNT || !MONEY_COUNT || !INFLUENCE_COUNT) {
            console.error('updatePlayerInfo: Missing required UI elements');
            // Try to re-initialize UI elements if they're missing
            if (initializeElementReferences) {
               // console.log('Attempting to re-initialize UI elements...');
                initializeElementReferences();
            }
            return;
        }
  
        // Ensure resources exist, default to 0 if not
        const resources = currentPlayer.resources || {};
        const knowledge = resources.knowledge ?? 0;
        const money = resources.money ?? 0;
        const influence = resources.influence ?? 0;
  
        
        //console.log('[UI] Updating UI with resources:', { knowledge, money, influence });
        
        // Update the UI elements
        playerElement.textContent = `${currentPlayer.name} (${currentPlayer.role || 'No Role'})`;
        KNOWLEDGE_COUNT.textContent = newValues.knowledge ?? knowledge;
        MONEY_COUNT.textContent = newValues.money ?? money;
        INFLUENCE_COUNT.textContent = newValues.influence ?? influence;
        
        // Force a reflow to ensure the UI updates
        void playerElement.offsetHeight;
        
        //console.log(`[UI] Successfully updated UI for ${currentPlayer}'s turn`);
        console.log('=============updatePlayerInfo END=============');
        
    } catch (error) {
        console.error('Error in updatePlayerInfo:', error);
        // Try a full UI refresh on error
        try {
            //console.log('Attempting full UI refresh...');
            if (initializeUI) initializeUI();
            if (updateGameControls) updateGameControls();
        } catch (e) {
            console.error('Failed to refresh UI:', e);
        }
    }
}; 
  
  
  /**
   * Update player's resource panel with current values.
   */
  export function updateResourceDisplayContainer(player = getCurrentPlayer()) {
    //console.log('=============updateResourceDisplayContainer=============');
    // Try to find (or freshly create) the panel again
    const panelUpdated = document.getElementById(`resource-Display-Container-${player.id}`);
    if (!panelUpdated) {
      console.error(`No resource display container found for player ID: ${player.id}`);
      return;
    }
  
    panelUpdated.querySelector('.player-name').textContent = player.name;
    panelUpdated.querySelector('.KNOWLEDGE_COUNT').textContent = `Knowledge ${player.resources.money}`;
    panelUpdated.querySelector('.MONEY_COUNT').textContent = `Money ${player.resources.knowledge}`;
    panelUpdated.querySelector('.INFLUENCE_COUNT').textContent = `Influence ${player.resources.influence}`;
};
  
// Create the audio object once
const clickSound = new Audio('assets/sounds/click.mp3');

export function playClickSound() {
    clickSound.currentTime = 0; // rewind to start so it can replay quickly
    clickSound.play();
}

// Create the audio object once
const diceSound = new Audio('assets/sounds/dice.mp3');

export function rollDiceSound () {
    diceSound.currentTime = 0; // rewind to start so it can replay quickly
    diceSound.play();
}

const errorSound = new Audio('assets/sounds/error.mp3');

export function playErrorSound () {
    errorSound.currentTime = 0; // rewind to start so it can replay quickly
    errorSound.play();
}


