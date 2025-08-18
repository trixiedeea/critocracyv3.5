// Game Module for Critocracy
// Handles core game logic, game flow, and state management

// ===== Imports =====
import { 
    drawBoard,        // New scaling function
    setupBoard,    
    getNextStepOptions,   // Added missing import
    findSpaceDetailsByCoords,
    loadTokenImages,
    drawTokens,
} from './board.js';

import { 
    START_SPACE, 
    FINISH_SPACE, 
    choicepoints,
    fullDeckRegionPathMap,
} from './board-data.js';
import { 
    setupDecks, 
    discardCard,
    deckType
} from './cards.js';

import { 
    createPlayer, 
    allPlayersFinished,
    markPlayerFinished, 
    getPlayerRanking,
    resetPlayers,
} from './players.js';
// UI imports
import {  
    promptForPathChoice, 
    updateGameControls,
    rollDiceSound,
    updatePlayerInfo,
    playClickSound,
} from './ui.js';
import {
    animateDiceRoll,
    animateTokenToPosition,
    highlightDeckRegions,
    startDiceShake,
} from './animations.js';

import { 
    state, 
    updateGameState, 
    isActionAllowed 
} from './state.js';

import { endGame } from './endGameScreen.js';

// Game logic imports-

// ===== Game Functions =====

/**
 * Initializes the core game modules (Board, Cards, Players).
 */
// Debug mode flag - set to true to test with a single AI player
const DEBUG_MODE = false;
/**
 * Initializes the core game modules (Board, Cards, Players).
 * @param {Array} playerConfigs - Array of player configurations
 * @param {Array} turnOrder - Array of player IDs in turn order
 * @param {Object} options - Additional options
 * @param {boolean} [options.debugMode=false] - Enable debug mode
 */
export function startGame(playerConfigs, turnOrder, { debugMode = false } = {}) {
    console.log('=============startGame=============');
    //console.log('[Game] startGame called with:', { playerConfigs, turnOrder, debugMode });
    
    if (!playerConfigs || !turnOrder || playerConfigs.length === 0 || turnOrder.length === 0) {
        console.error('[Game] startGame called with invalid arguments.');
        return;
    }

    // Reset and create players
    resetPlayers();
    
    // First create a map of player configs by ID for quick lookup
    const configMap = new Map();
    playerConfigs.forEach(config => {
        configMap.set(config.id, config);
    });
    
    // Create players in the order specified by turnOrder
    const players = [];
    const playerMap = new Map();
    
    turnOrder.forEach(playerId => {
        const config = configMap.get(playerId);
        if (config) {
            const player = createPlayer(config);
            if (player) {
                playerMap.set(player.id, player);
                players.push(player);
            }
        }
    });

    // Define fixed start coordinates at the top of your file (once)
    const START_COORDS = { x: 104, y: 512 };

    // Set game state with the correctly ordered players
    updateGameState({
        players: players,  // Now in the correct order
        turnOrder: turnOrder,
        totalPlayerCount: turnOrder.length,
        humanPlayerCount: players.filter(p => p.isHuman).length,
        currentPlayerIndex: -1,
        gameStarted: true,
        currentPhase: 'PLAYING',
        debugMode: debugMode || DEBUG_MODE
    });

    // Update player coordinates
    updateGameState({
        players: state.players.map(p => ({
            ...p,
            currentCoords: { ...START_COORDS }
        }))
    });

    console.log('[Game] Game state initialized:', {
        players: state.players.map((p, i) => `${i}: ${p.name} (${p.id})`),
        turnOrder: state.turnOrder,
        totalPlayerCount: state.totalPlayerCount,
        actualPlayerCount: state.players.length,
        playerFinishedStatus: state.players.map(p => `${p.name}: finished=${p.finished}`)
    });
    
    // Verify counts match
    if (state.totalPlayerCount !== state.players.length) {
        console.error(`INITIALIZATION BUG: totalPlayerCount=${state.totalPlayerCount} but players.length=${state.players.length}`);
    }

    // Draw the board with initial token positions
    drawBoard();
    drawTokens();

    // Start the first turn
    console.log('[Game] Advancing to the first player.');
    advanceToNextPlayer();
};

export async function initGame() {
    try {
       // console.log("-------Initializing game-------");

        // 1. Reset all players and core game state
        resetPlayers();

        // 2. Load board visuals, game spaces, tokens, and cards
        await setupBoard();
        await setupDecks();
        await loadTokenImages();

        // 3. Add min/max bounds to each choicepoint for hitbox detection
        if (Array.isArray(choicepoints)) {
            for (let i = 0; i < choicepoints.length; i++) {
                const cp = choicepoints[i];

                if (!cp.coords || typeof cp.coords !== 'object') {
                    console.warn(`[Choicepoint ${cp?.id || i}] is missing or invalid coords`);
                    continue;
                }

                // Extract coordinates from the new object format
                const coords = cp.coords;
                const xs = [coords.topleft, coords.toprightx, coords.bottomrightx, coords.bottomleftx];
                const ys = [coords.toplefty, coords.topright, coords.bottomright, coords.bottomleft];

                cp.minX = Math.min(...xs);
                cp.maxX = Math.max(...xs);
                cp.minY = Math.min(...ys);
                cp.maxY = Math.max(...ys);
            }
        }

        // 4. Make choicepoints globally accessible
        window.choicepoints = choicepoints;

        // 5. Initialize game state from scratch
        updateGameState({
            started: false,
            ended: false,
            currentPhase: 'SETUP',
            players: [],
            totalPlayerCount: 0,
            humanPlayerCount: 0,
            currentPlayerIndex: -1,
            turnOrder: [],
            pendingActionData: null,
            pathChoiceLock: false,
            lastRoll: 0
        });

        console.log("-------Game initialization complete-------");
        return true;

    } catch (error) {
        console.error('❌ Error initializing game:', error);
        return false;
    }
};

/**
 * Gets the player object whose turn it currently is.
 */
export function getCurrentPlayer() {
   // console.log('=============getCurrentPlayer=============');
    // If players array is empty or invalid, return null
    if (!Array.isArray(state.players) || state.players.length === 0) {
        console.warn("No players available");
        return null;
    }
    
    // If currentPlayerIndex is invalid, default to first player
    if (state.currentPlayerIndex === undefined || state.currentPlayerIndex < 0 || state.currentPlayerIndex >= state.players.length) {
        console.warn("Invalid currentPlayerIndex:", state.currentPlayerIndex, "- defaulting to first player");
        updateGameState({ currentPlayerIndex: 0 });
        return state.players[0];
    }
    
    return state.players[state.currentPlayerIndex];
};

export const rollResult = state.rollResult;

export async function handlePlayerAction() {
    if (!isActionAllowed('handlePlayerAction')) return;
    console.log('=============--handlePlayerAction=============--')
    updateGameState({
        currentPhase: 'PLAYING'
    });
    console.warn('GAMEPHASE updated to PLAYING');

    const player = getCurrentPlayer();
    if (!player) {
        console.error("handlePlayerAction: Could not get current player.");
        return;
    }

    // 0. Check if player turn should be skipped
    if (player.skipTurns > 0) {
        //console.log(`Player ${player.name} skips turn (${player.skipTurns} remaining).`);
        player.skipTurns--;
        updatePlayerInfo(player.id);
        handleEndTurn(true);
        return;
    }

    updateGameControls();

    // Add a small delay after dice roll for better visibility
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Get the roll result from state
    const rollResult = state.rollResult;
    //console.log(`Player ${player.name} rolling stored value: ${rollResult}`);

    // Handle start space case with 10-pixel tolerance
    const startX = START_SPACE.coordinates[0];
    const startY = START_SPACE.coordinates[1];
    const tolerance = 10; // Tolerance for coordinate comparison
    
    // Log the coordinates for debugging
    //console.log('Start space coordinates:', { startX, startY });
    console.log('Player coordinates:', { 
        x: player.currentCoords.x, 
        y: player.currentCoords.y 
    });
    
    const dx = Math.abs(player.currentCoords.x - startX);
    const dy = Math.abs(player.currentCoords.y - startY);
    const isAtStart = dx <= tolerance && dy <= tolerance;
    
    // Log the comparison results
    //console.log('Coordinate comparison:', { dx, dy, tolerance, isAtStart });

    //console.log(`Checking start space - Player: (${player.currentCoords.x},${player.currentCoords.y}), Start: (${startX},${startY}), Within tolerance: ${isAtStart}`);

    // Determine player action based on type and position
    if (player.isHuman) {
        if (isAtStart) {
            //console.log(`Human player ${player.name} is at Start. Prompting for path choice.`);
            updateGameState({
                currentPhase: 'AWAITING_PATH_CHOICE',
                pendingActionData: { rollResult }
            });
            
            const pathObjects = {
                ageOfExpansion: { name: 'Age of Expansion', color: 'Purple' },
                ageOfResistance: { name: 'Age of Resistance', color: 'Blue' },
                ageOfReckoning: { name: 'Age of Reckoning', color: 'Cyan' },
                ageOfLegacy: { name: 'Age of Legacy', color: 'Pink' }
            };

            const options = Object.entries(START_SPACE.nextCoordOptions).map(([pathKey, coordsArray]) => ({
                text: pathObjects[pathKey]?.name || pathKey,
                coords: { x: coordsArray[0], y: coordsArray[1] },
                color: pathObjects[pathKey]?.color || 'White',
                pathName: pathKey + 'Path' // Add 'Path' suffix to match the pathKey in board data
            }));
            promptForPathChoice(options, player);
            return; // Wait for choice
        } else {
            //console.log(`Human player ${player.name} is not at start. Animating token to position.`);
            await animateTokenToPosition(player, null, 1000, false, null);
        }
    } else {
        // AI Player
        if (isAtStart) {
            //console.log(`AI player ${player.name} is at Start. Simulating path choice.`);
            updateGameState({
                currentPhase: 'AWAITING_PATH_CHOICE',
                pendingActionData: { rollResult }
            });
            simulateCpuChoicepoint(player);
            return; // Wait for choice
        } else {
            updateGameState({
                currentPhase: 'MOVING',
            });
            console.warn('game phase updated to MOVING');
            //console.log(`AI player ${player.name} is not at start. Animating token to position.`);
            animateTokenToPosition(player, null, 1000, false, null);
        }
    }
};

export function handlePathChoice(chosenCoords, chosenPath) {
    console.log('============= handlePathChoice =============');
    if (!isActionAllowed('handlePathChoice')) return;
  
    const player = getCurrentPlayer();
    if (!player) {
      console.error("handlePathChoice: No current player found.");
      return;
    }
  
    // Store the player's decision
    player.currentCoords = chosenCoords;
    player.currentPath = chosenPath;
  
    // Read and clear the interrupted move data
    const {
      remainingSteps = 0,
      duration = 1000,
      skipSpaceAction = false,
      onComplete = null
    } = state.interruptedMove || {};
  
    delete state.interruptedMove;
    updateGameState({
        currentPhase: 'MOVING',
    });
  
    // Resume movement from new path/coords
    animateTokenToPosition(player, null, duration, skipSpaceAction, onComplete);
};  

/**
 * Handles the logic after a player's token finishes its movement.
 * Identifies the space type and path, then highlights the associated deck.
 * @param {object} completionData - { reason, stepsTaken }
 */
export async function handleEndOfMove(currentCoords) {
    if (!isActionAllowed('handleEndOfMove')) return;
    const player = getCurrentPlayer();
    
    // Ensure player coordinates in state match the current position
    if (player.currentCoords.x !== currentCoords.x || player.currentCoords.y !== currentCoords.y) {
        console.log(`Updating player ${player.id} coordinates to:`, currentCoords);
        updatePlayer(player.id, { currentCoords: { ...currentCoords } });
    }

    updateGameState({
        currentPhase: 'AWAITING_CARD_ACTION',
    });
    console.warn('game state updated to AWAITING_CARD_ACTION')
    console.log('=============handleEndOfMove=============');
    //console.log(`Player ${player.name} completed movement to coords:`, player.currentCoords);

    const spaceDetails = findSpaceDetailsByCoords(currentCoords);

    if (!spaceDetails) {
        console.error(`Could not find space details at:`, currentCoords);
        console.warn("Resetting player to START_SPACE due to invalid position.");

        if (START_SPACE && START_SPACE.coordinates?.[0]) {
            player.currentCoords = { x: START_SPACE.coordinates[0][0], y: START_SPACE.coordinates[0][1] };
            //console.log(`Player position reset to START_SPACE at (${player.currentCoords.x}, ${player.currentCoords.y})`);
            drawBoard(); // Refresh visuals
        } else {
            console.error("START_SPACE is invalid or malformed.");
        }

        return;
    }

    console.log(`Found space:`, spaceDetails);

    // Determine path the player is on
    let pathKey = spaceDetails.pathName?.replace('Path', '') || null;
    const pathColor = spaceDetails.pathColor || 'default';
    const spaceType = spaceDetails.Type || 'draw';

    // Map path names to the correct keys in fullDeckRegionPathMap
    const pathNameMap = {
        'ageOfExpansion': 'ageOfExpansion',
        'ageOfResistance': 'ageOfResistance',
        'ageOfReckoning': 'ageOfReckoning',
        'ageOfLegacy': 'ageOfLegacy'
    };

    // Get the correct path key if it exists in our mapping
    const mappedPathKey = pathKey ? pathNameMap[pathKey] : null;

    //console.log(`Space type: ${spaceType}, Path: ${pathKey}, Mapped Path: ${mappedPathKey}, Color: ${pathColor}`);

    // Only highlight deck regions if this is a Draw space
    if (spaceType === 'draw') {
        // Determine deck to highlight based on path for Draw spaces
        let deckType = 'endOfTurnDeck';
        
        if (pathColor === 'purple') {
            deckType = 'ageOfExpansionDeck';

        } else if (pathColor === 'blue') {
            deckType = 'ageOfResistanceDeck';

        } else if (pathColor === 'cyan') {
            deckType = 'ageOfReckoningDeck';

        } else if (pathColor === 'pink') {
            deckType = 'ageOfLegacyDeck';
            
        } else if (!pathColor) {
            deckType = 'endOfTurnDeck';
        } else {
            console.warn(`No specific deckType found for path '${pathKey}'. Using 'endOfTurnDeck'.`);
        }

        // Get positions from fullDeckRegionPathMap
        let positions = [];
        if (mappedPathKey && fullDeckRegionPathMap[mappedPathKey]?.positions) {
            positions = fullDeckRegionPathMap[mappedPathKey].positions;
        } else if (deckType === 'endOfTurnDeck' && fullDeckRegionPathMap.endOfTurn?.positions) {
            positions = fullDeckRegionPathMap.endOfTurn.positions;
        }
        //console.log(`Draw space → highlighting deck region for path ${mappedPathKey} using deckType ${deckType}`);
        await highlightDeckRegions(player, deckType, positions);

    } else if (spaceType === 'regular') {
        // For Regular spaces, only highlight end-of-turn regions
        const deckType = 'endOfTurnDeck';
        const positions = fullDeckRegionPathMap.endOfTurn?.positions || [];
         //console.log(`Regular space → highlighting end-of-turn regions`);
        await highlightDeckRegions(player, deckType, positions);``

    } else if (spaceType === 'choicepoint') {
        const deckType = 'endOfTurnDeck';
        const positions = fullDeckRegionPathMap.endOfTurn?.positions || [];
        console.log('choicepoint space, treating as regular space player will pick direction start of next turn')
        await highlightDeckRegions(player, deckType, positions);``

    } else if (spaceType === 'finish') {
        await markPlayerFinished(player);
    } else {
        console.log(`Space type ${spaceType} - no deck highlighting needed`);
    }
};

/**
 * Handle the action a player takes after landing on a space.
 * Delegates logic based on spaceType and pathName.
 *
 * @param {object} player - The player who landed
 * @param {string} spaceType - The type of the space ('Draw', 'Regular', etc.)
 * @param {string} pathName - The path name the player is on (e.g., 'Age of Resistance Path')
 */
export async function handleSpaceAction(player, spaceType, pathName) {
    console.log('=============handleSpaceAction=============');
    //console.log(`Handling space type: ${spaceType}, pathName: ${pathName}, player: ${player.name}`);
  
    if (preventAgeCardDraw) {
        //console.log('Age of card draw prevented - player moved by card effect');
        preventAgeCardDraw = false; // Reset the flag
        return; // Don't draw a card
      }
    // Normalize the pathName to a key (e.g. 'Age of Resistance Path' => 'ageOfResistance')
    const normalizedKey = pathName?.replace(/\s+/g, '').replace('Path', '');
    const pathData = fullDeckRegionPathMap?.[normalizedKey];
  
    if (spaceType === 'draw') {
      if (!pathData || !pathData.deckType || !pathData.positions) {
        console.error(`Missing deckType or positions for pathName: "${pathName}"`);
        return;
      }
  
      const deckType = pathData.deckType;
      const positions = pathData.positions;
  
      //console.log(`Draw space → deckType: ${deckType}, positions:`, positions);
      
      if (!player.isHuman) {
        // For AI players, wait 5 seconds then simulate deck click
        //console.log(`AI player ${player.name} will draw a card in 5 seconds...`);
        await delay(5000);
        await simulateCpuDeckClick(deckType);
      } else {
        // For human players, highlight the deck regions
        highlightDeckRegions(player, deckType, positions);
      }
  
    } else if (spaceType === 'regular') {
      const deckType = 'endOfTurnDeck';
      const positions = fullDeckRegionPathMap.endOfTurn?.positions || [];
  
      //console.log(`Regular space → deckType: ${deckType}, positions:`, positions);
      
      if (!player.isHuman) {
        // For AI players, wait 5 seconds then simulate end of turn deck click
        //console.log(`AI player ${player.name} will draw an end of turn card in 2.5 seconds...`);
        await delay(2500);
        await simulateCpuDeckClick(deckType);
      } else {
        // For human players, handle end of turn normally
        handleEndTurn(spaceType, deckType, player, positions);
      }
  
    } else {
      //console.log(`Unhandled space type: ${spaceType}`);
    }
};

/**
 * Triggers end-of-turn card draw for the current player.
 * Does NOT advance to the next player — that’s handled later by processEndPlayerTurn().
 */
export function handleEndTurn() {
    if (!isActionAllowed('handleEndTurn')) {
        //console.log('handleEndTurn action not allowed');
        return;
    }
    console.log('=============handleEndTurn=============');
  
    const player = getCurrentPlayer();
    if (!player) {
      console.error('[handleEndTurn] No current player found.');
      return;
    }
  
    //console.log(`GAME: Ending turn for Player ${player.name} (${player.role})`);
  
    // Stop any queued animations
    if (window.animationQueue && typeof window.animationQueue.clear === 'function') {
      window.animationQueue.clear();
    }
  
    // Clear any visual highlights
    if (typeof clearHighlights === 'function') {
      clearHighlights();
    }
    updateGameState({
        currentPhase: 'AWAITING_CARD_ACTION',
    });
    console.warn('game phase updated to AWAITING_CARD_ACTION');
  
    // Define deckType and positions (⬅️ as variables, like you asked)
    const deckType = 'endOfTurnDeck';
    const positions = [
      {
        topleft: 302, toplefty: 444,
        toprightx: 386, topright: 444,
        bottomrightx: 386, bottomright: 582,
        bottomleftx: 302, bottomleft: 582
      },
      {
        topleft: 1128, toplefty: 458,
        toprightx: 1210, topright: 458,
        bottomrightx: 1210, bottomright: 596,
        bottomleftx: 1128, bottomleft: 596
      }
    ];
    //console.log("Prompting player to draw end-of-turn card. Turn will advance after card is drawn.");
    // 👇 Call exactly as you demanded
    highlightDeckRegions(player, deckType, positions);
  
    
};

/**
 * Finalizes the current player's turn.
 * Discards card, checks if player is at finish, handles game end logic.
 */
export function processEndPlayerTurn() {
    if (!isActionAllowed('processEndPlayerTurn')) {
        //console.log('processEndPlayerTurn action not allowed');
        return;
    }
    console.log('=============processEndPlayerTurn=============');
    
    try {
        // Discard the current card with proper deck type
        if (state.currentCard) {
            //console.log(`Discarding current card: ${state.currentCard.name}`);
            // Get deck type from state or card
            const deckType = state.currentDeck || state.currentCard.deckType || 'unknown';
            //console.log(`Using deck type: ${deckType}`);
            discardCard(state.currentCard, deckType);
        } else {
            console.warn('No current card to discard at end of turn');
        }
    } catch (error) {
        console.error('Error in processEndPlayerTurn:', error);
        // Ensure we still update the game state even if there's an error
        updateGameState({
            currentPhase: 'TURN_TRANSITION'
        });
    }
    // Get current player
    const currentPlayer = getCurrentPlayer();
        
    if (!currentPlayer) {
        console.error('[processEndPlayerTurn] No current player found.');
        return;
    }

    //console.log(`Processing end of turn for ${currentPlayer.name} (${currentPlayer.role})`);

    // Check if player is at finish coordinates
    const playerCoords = currentPlayer.coordinates;
    const finishCoords = FINISH_SPACE.coordinates[0]; // [1384, 512]
        
    if (playerCoords && playerCoords.x === finishCoords[0] && playerCoords.y === finishCoords[1]) {
            //console.log(`Player ${currentPlayer.name} is at finish coordinates, marking as finished`);
            markPlayerFinished(currentPlayer);
            
            // Check if all other players are finished
            if (allPlayersFinished()) {
                //console.log('All players finished, triggering game over');
                endGame().catch(console.error);
                return;
            }
        }
        
    const endTurnButton = document.getElementById('end-Turn-Button');

    if (currentPlayer.isHuman) {
        // For human players, enable the end turn button with pulse effect
        //console.log('Enabling end turn button for human player');
        if (endTurnButton) {
            // First, remove any existing pulse animation
            endTurnButton.classList.remove('shake');
            // Force reflow to ensure the animation restarts
            void endTurnButton.offsetWidth;
            
            // Enable the button and add pulse effect
            endTurnButton.disabled = false;
            endTurnButton.classList.add('shake');
            endTurnButton.style.pointerEvents = 'auto';
            
            //console.log('End turn button enabled and pulsing for human player');
        }
        updateGameState({ currentPhase: 'TURN_TRANSITION' });
    } else {
        // For AI players, ensure the button is disabled and not pulsing
        //console.log('AI player turn ended, ensuring end turn button is disabled');
        if (endTurnButton) {
            endTurnButton.disabled = true;
            endTurnButton.classList.remove('shake');
            endTurnButton.style.pointerEvents = 'none';
        }
        updateGameState({ currentPhase: 'TURN_TRANSITION' });
        advanceToNextPlayer();
    }
};

/**
 * Ends the game and displays the results.
 */
export async function triggerGameOver() {
    if (state.ended) return; // Prevent multiple calls

    updateGameState({
        ended: true,
        currentPhase: 'GAME_OVER'
    });
    endGame();
};

// Track if an AI turn is in progress to prevent overlapping turns
state.aiTurnInProgress = state.aiTurnInProgress || false;

/**
 * Handles the AI player's turn by simulating a dice roll, animating it, and calling handlePlayerAction.
 * @param {object} aiPlayer - The AI player object.
 */
export function handleAITurn(aiPlayer) {
    if (!isActionAllowed('handleAITurn')) return;
    console.log('=============handleAITurn=============');
    
    // Debug guard: detect if player is both isHuman and isAI or has both properties
    if (aiPlayer.isHuman) {
        console.error('[BUG] AI turn called with player having both isHuman and isAI or isAI property present:', aiPlayer);
        throw new Error('AI turn called with player having both isHuman and isAI or isAI property present. This should never happen!');
    }

    // Clear the advancingPlayer flag immediately when AI turn starts
    updateGameState({ 
        aiTurnInProgress: true,
        advancingPlayer: false  // Clear this flag immediately for AI turns
    });
    
    // Debug log
    //console.log(`🔄 AI ${aiPlayer.name}'s turn starting...`);
    setTimeout(() => {
        rollDiceSound();
    }, 400);
    
    // 1. Generate a random roll (1-6)
    const rollResult = Math.floor(Math.random() * 6) + 1;
    //console.log(`AI ${aiPlayer.name} rolled a ${rollResult}`);
    
    // 2. Update game state with the roll result
    updateGameState({ 
        rollResult,
        currentPhase: 'ROLLING'
    });
    
    // 3. Animate the dice roll and wait for it to complete
    const diceElement = document.getElementById('dice');
    if (diceElement) {
        updateGameState({ 
            currentPhase: 'ROLLING',
        });
        //console.log(`✅ AI ${aiPlayer.name}'s roll completed`);
        animateDiceRoll(diceElement, rollResult, 2000);
    } else {
        console.warn('Dice element not found for AI roll animation');
        // Small delay to simulate animation time
 
    }
};

/**
 * Simulates an AI player making a choicepoint decision.
 * Called when an AI player lands on a choicepoint or starts from the beginning.
 * @param {object} player - The AI player making the choice
 */
export function simulateCpuChoicepoint(player) {
    if (!isActionAllowed('simulateCpuChoicepoint')) return;
    console.log('=============simulateCpuChoicepoint=============');
    //console.log(`[AI] Simulating path choice choice for ${player.name} in phase: ${state.currentPhase}`);
    updateGameState({ currentPhase: 'AWAITING_PATH_CHOICE' });
    console.warn('gamestate updated to AWAITING_PATH_CHOICE');

    // Guard: Prevent invalid player or human calls
    if (!player || player.isHuman) {
        console.error("simulateCpuChoicepoint called with invalid player:", player);
        return;
    }

    // Guard: Prevent running in incorrect phase
    if (!state.currentPhase === 'AWAITING_PATH_CHOICE') {
        console.warn(`AI attempted to choose in ${state.currentPhase} phase — blocking.`);
        return;
    }
    
    // Guard: Prevent multiple simultaneous choices
    if (state.choiceInProgress) {
        console.warn("AI choice already in progress, ignoring duplicate call");
        return;
    }
    
    // Set flag to prevent overlapping choices
    updateGameState({ choiceInProgress: true });
    
    // Helper function to clean up after choice is made
    const cleanup = () => {
        if (state.choiceInProgress) {
            updateGameState({ 
                choiceInProgress: false,
                currentPhase: 'MOVING'
            });
            //console.log(`[AI] ${player.name} completed choice in phase: ${state.currentPhase}`);
        }
    };
    
    // Helper function to handle errors and cleanup
    const handleError = (message) => {
        console.error(`[AI] ${message}`);
        cleanup();
        handleEndTurn(true);
    };

    // Initial 1-second delay for thought time
    setTimeout(() => {
        //console.log(`[AI] ${player.name} is making a choicepoint decision...`);

        let options;
        
        // Check if we're at the start position (with 10-pixel tolerance)
        const startX = START_SPACE.coordinates[0];
        const startY = START_SPACE.coordinates[1];
        const tolerance = 10; // pixels
        
        const dx = Math.abs(player.currentCoords.x - startX);
        const dy = Math.abs(player.currentCoords.y - startY);
        const isAtStart = dx <= tolerance && dy <= tolerance;
        
        if (isAtStart) {
            // At start position, use the start space options
            //console.log('[AI] At start position, using start space options');
            options = Object.entries(START_SPACE.nextCoordOptions).map(([pathKey, coords]) => ({
                text: pathKey.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
                coords: { x: coords[0], y: coords[1] },
                pathName: pathKey + 'Path'
            }));
        } else {
            // At a regular choicepoint, get next step options
            //console.log('[AI] At regular choicepoint, getting next step options');
            const currentCoords = player.currentCoords;
            if (!currentCoords) {
                return handleError("Player has no current coordinates");
            }
            options = getNextStepOptions(currentCoords);
        }
        
        if (!options || options.length === 0) {
            return handleError("No path options available");
        }
        
        // Select a random option
        const randomIndex = Math.floor(Math.random() * options.length);
        const selectedOption = options[randomIndex];

        if (!selectedOption || !selectedOption.coords ||
            typeof selectedOption.coords.x !== 'number' ||
            typeof selectedOption.coords.y !== 'number') {
            return handleError(`Invalid selected option: ${JSON.stringify(selectedOption)}`);
        }

        updateGameState({
            pendingActionData: {
                ...state.pendingActionData || {},
                pathName: selectedOption.pathName
            }
        });

        //console.log(`[AI] ${player.name} pre-selected path: ${selectedOption.pathName || selectedOption.text}.`);

        // Show popover
        const popover = document.getElementById('path-Choice-Popover');
        if (!popover) {
            return handleError("Path-choice popover not found");
        }

        const idMap = {
            ageOfExpansion: 'age-Of-Expansion-Path',
            ageOfResistance: 'age-Of-Resistance-Path',
            ageOfReckoning: 'age-Of-Reckoning-Path',
            ageOfLegacy: 'age-Of-Legacy-Path',
        }; 

    
            popover.showModal();
        
        try {
            popover.showModal();
        } catch (err) {
            console.error('Failed to show modal:', err);
            return handleError("Failed to show path choice modal");
        }

        // Get the button element for the selected path
        const pathKey = selectedOption.pathName.replace('Path', '');
        const buttonId = idMap[pathKey] || `path-${pathKey}`;
        const chosenButton = document.getElementById(buttonId);
        
        if (chosenButton) {
            //console.log(`[AI] Animating button for path choice: ${selectedOption.pathName}`);
            
            // Animate button scaling: 1.0 -> 0.9 -> 0.8 -> 0.7 -> 0.8 -> 0.9 -> 1.0 over 2 seconds
            const scales = [0.9, 0.85, 0.8, 0.85, 0.9, 1.0];
            const stepDuration = 1500 / scales.length; // ~333ms per step
            
            let currentStep = 0;
            const animateStep = () => {
                if (currentStep < scales.length) {
                    chosenButton.style.transform = `scale(${scales[currentStep]})`;
                    chosenButton.style.transition = `transform ${stepDuration}ms ease-in-out`;
                    currentStep++;
                    setTimeout(animateStep, stepDuration);
                } else {
                    // Animation complete, clean up and proceed
                    chosenButton.style.transform = '';
                    chosenButton.style.transition = '';
                    
                    // Close the popover
                    try {
                        playClickSound();
                        popover.close();
                    } catch (err) {
                        console.error('Failed to close popover:', err);
                    }
                    
                    console.log(`[AI] AI ${player.name} chose path: ${selectedOption.pathName} at (${selectedOption.coords.x}, ${selectedOption.coords.y})`);
                    
                    // Call handlePathChoice with the selected coordinates and path
                    handlePathChoice(selectedOption.coords, selectedOption.pathName);
                    
                    // Clean up the choice in progress flag
                    cleanup();

                }
            };
            
            // Start the animation
            animateStep();
            
        } else {
            console.warn(`[AI] Could not find button for path: ${selectedOption.pathName}`);
            
            // Still proceed even if button not found
            try {
                popover.close();
            } catch (err) {
                console.error('Failed to close popover:', err);
            }
            
            //console.log(`[AI] AI ${player.name} chose path: ${selectedOption.pathName} at (${selectedOption.coords.x}, ${selectedOption.coords.y})`);
            
            // Call handlePathChoice with the selected coordinates and path

            handlePathChoice(selectedOption.coords, selectedOption.pathName);
            
            // Clean up the choice in progress flag
            cleanup();
        }

    }, 3000);
};

/**
 * Advances the game state to the next player in the turn order.
 * Handles skipping finished players and looping back.
 */
export async function advanceToNextPlayer() {
    console.log("=============== advance To Next Player ================");
    
    // Normal game flow for non-debug mode
    if (state.currentPlayerIndex === state.totalPlayerCount - 1) {
        //console.log("End of round reached, decrementing/clearing statuses.");
        // Update game state with any end-of-round cleanup
        updateGameState({
            // Reset any round-based state here
            currentPhase: 'ROLLING',
            pendingActionData: null,
            rollResult: 0
        });
        
        // Clear any temporary alliances
        updateGameState({
            players: state.players.map(p => ({
                ...p,
                currentAlliancePartnerId: null,
                // Add any other player state that should reset at end of round
                hasRolled: false,
                hasMoved: false,
                hasDrawnCard: false
            }))
        });
        
        //console.log("All temporary alliances and turn flags cleared.");
    }

    if (state.ended) {
        //console.log("Game has ended, not advancing player.");
        return;
    }

    // Check for game over condition *before* advancing (in case last player finished)
    if (allPlayersFinished(state.players)) {
        await allPlayersFinished();
        resolve();
        return;
    }

    let nextPlayerIndex = (state.currentPlayerIndex + 1) % state.totalPlayerCount;
    let loopCheck = 0; // Prevent infinite loops

    //console.log(`Advancing from player index ${state.currentPlayerIndex} of ${state.totalPlayerCount} total players`);
    //console.log(`Initial next index: ${nextPlayerIndex}`);

    // Find the next player who hasn't finished
    while (state.players[nextPlayerIndex].finished && loopCheck < state.totalPlayerCount) {
        //console.log(`Player ${state.players[nextPlayerIndex].name} at index ${nextPlayerIndex} has finished, skipping.`);
        nextPlayerIndex = (nextPlayerIndex + 1) % state.totalPlayerCount;
        loopCheck++;
        //console.log(`Trying next index: ${nextPlayerIndex}, loop count: ${loopCheck}`);
    }

    // If loopCheck reaches totalPlayerCount, it means everyone left is finished - trigger game over again just in case.
    if (loopCheck >= state.totalPlayerCount) {
         console.warn("Advanced player logic found only finished players. Triggering game over.");
         await endGame();
         return;
    }

    //console.log(`Final next player index selected: ${nextPlayerIndex} - Player: ${state.players[nextPlayerIndex].name}`);
    
    const newCurrentPlayer = state.players[nextPlayerIndex];
    
    // Update the current player index and set phase to ROLLING
    updateGameState({
        currentPlayerIndex: nextPlayerIndex,
        currentPhase: 'ROLLING',
        pendingActionData: null,
        rollResult: 0
    });
    console.warn(`GAMEPHASE UPDATED TO ROLLING for ${newCurrentPlayer.name}`);

    //console.log(`Advancing turn. New current player: ${newCurrentPlayer.name} (ID: ${newCurrentPlayer.id}, Index: ${state.currentPlayerIndex})`);
    
    // Clear any pending data from previous turn
    updateGameState({
        pendingActionData: null,
        rollResult: 0 // Clear dice roll
    });
    
    // Update UI for the current player (highlights current)
    if (!newCurrentPlayer.id) {
        console.error('Current player has no ID!', newCurrentPlayer);
        return; // Don't proceed if player is invalid
    }
    
    // Update UI controls for the current player
    updateGameControls();
    
    if (newCurrentPlayer.isHuman) {
        //console.log(`[DEBUG] Human player ${newCurrentPlayer.name}'s turn started`);
        // Enable dice shake for human players
        startDiceShake();
        // Update UI to show it's the player's turn
        updatePlayerInfo(newCurrentPlayer.id);
        console.log(`It's ${
            newCurrentPlayer.name}'s turn (${newCurrentPlayer.role})`);
    } else {
        console.log(`[DEBUG] AI player ${newCurrentPlayer.name}'s turn started`);
        // For AI players, trigger the AI turn after a short delay
        //console.log("Starting 2 second delay before AI turn...");
        await new Promise(resolve => setTimeout(resolve, 2000)); 
        //console.log("...Delay finished, starting AI turn.");
        await handleAITurn(newCurrentPlayer);
    }
}