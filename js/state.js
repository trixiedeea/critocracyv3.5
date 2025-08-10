/**
 * State Management Module for Critocracy
 * Centralized state management for game, player, and UI state
 * Maintains backward compatibility with existing code
 */

import { SPACE_TYPE } from './board-data.js';
import { showEndGameWithVictory } from './animations.js';
import {getPlayers} from './players.js';

// ===== Global Variables =====
window.hasDrawnEndOfTurnCard = false;

// ===== State Objects =====
export const _state = {
    // Track player resources by player ID
    playerResources: {},
    
    // UI State
    ui: {
        currentScreen: 'start',
        selectedDeck: null,
        highlightedSpace: null,
        isAnimating: false,
        showEndTurnButton: false,
        currentMessage: {
            text: '',
            type: 'info',
            visible: false
        },
        dice: {
            isRolling: false,
            value: 1
        },
        animation: {
            inProgress: false,
            current: null,
            queue: [],
            lastFrameTime: 0,
            frameId: null,
            screenTransition: {
                from: null,
                to: null,
                progress: 0,
                direction: 'right'
            }
        },
        gameboard: {}
    },
    
    // Game State
    game: {
        started: false,
        ended: false,
        currentPhase: 'SETUP',
        currentCard: null,      // Currently active card
        currentDeck: null,      // Current deck type (ageOfExpansion, endOfTurn, etc.)
        players: [],
        aiPlayerCount: 0,
        totalPlayerCount: 0,
        humanPlayerCount: 0,
        debugMode: false,
        currentPlayerIndex: -1,
        turnOrder: [],
        currentPath: null,
        currentCoords: null,
        previousCoords: null,
        remainingSteps: 0,
        pendingActionData: null,
        rollResult: 0,
        pathChoiceLock: false,
        lastRoll: 0,
        turnNumber: 0,
        hasRolled: false,
        drawnCard: false,
        deckType: null,
        phase: 'setup',
        gameStarted: false,
        gameOver: false,
        winner: null,
        playerFinishPosition: 0,
        round: 1,
        maxRounds: 50,
        playerRoles: {},
        playerPositions: {},
        board: {},
        settings: {
            maxPlayers: 6,
            minPlayers: 4,
            enableSpecialAbilities: true
        },
        spaceType: { ...SPACE_TYPE }, // Add spaceType to global state.
    },

    player: {
        id: null,       
        name: null,
        role: null,
        isHuman: false,
        currentCoords:[0, 0],
        x: 0,
        y: 0,
        resources: { knowledge: 0, money: 0, influence: 0 },
        finished: false,
        skipNextTurn: false,
        cards: [],
        items: [],
        alliances: [],
        forcePathChange: false,
        currentAlliancePartnerId: null,
        abilityUsed: false,
        playerFinalScore: 0,
        playerFinalResourceTotal: 0,
        playerFinalRanking: 0,
    }
    
};

// Create proxy for reactivity
export const state = new Proxy(_state.game, {
    set(target, property, value) {
        const oldValue = target[property];
        target[property] = value;
        
        // Only notify subscribers when explicitly requested via a flag
        if (subscribers.size > 0 && oldValue !== value && target._notifyOnChange) {
            notifySubscribers();
        }
        return true;
    }
});

// Set window.gameState for backward compatibility
window.gameState = state;

// Expose _state for direct access (used by animations to bypass proxy)
window._state = _state;

// Expose getCurrentPlayer globally for debugging
window.getCurrentPlayer = getCurrentPlayer;

// ===== State Getters =====

/**
 * Get the current game state
 * @returns {Object} Immutable copy of the game state
 */
export function getGameState() {
    //console.log('=============getGameState=============');
    return JSON.parse(JSON.stringify(_state.game));
}

/**
 * Get the current UI state
 * @returns {Object} Immutable copy of the UI state
 */
export function getUIState() {
    //console.log('=============getUIState=============');
    return JSON.parse(JSON.stringify(_state.ui));
}

/**
 * Get the current player object
 * @returns {Object|null} Current player or null if none
 */
export function getCurrentPlayer() {
    //console.log('=============getCurrentPlayer=============');
    const { game } = _state;
    
    // Check if players array exists and has players
    if (!Array.isArray(game.players) || game.players.length === 0) {
        console.warn("No players available");
        return null;
    }
    
    // Check if currentPlayerIndex is valid
    if (game.currentPlayerIndex < 0 || game.currentPlayerIndex >= game.players.length) {
        console.warn("Invalid currentPlayerIndex:", game.currentPlayerIndex, "- defaulting to first player");
        updateGameState({ currentPlayerIndex: 0 });
        return { ...game.players[0] };
    }
    
    // Return current player
    return { ...game.players[game.currentPlayerIndex] };
}


/**
 * Update a player's resources in global state
 * @param {string} playerId - The ID of the player
 * @param {Object} resources - The new resource values
 */
export function updatePlayerResources(playerId, resources) {
    console.log('=============updatePlayerResources=============');
    if (!playerId || !resources) return;
    _state.playerResources[playerId] = JSON.parse(JSON.stringify(resources));
    notifySubscribers();  
}

// ===== State Setters =====

const subscribers = new Set();

/**
 * Subscribe to state changes
 * @param {Function} callback - Function to call when state changes
 * @returns {Function} Unsubscribe function
 */
export function subscribe(callback) {
   // console.log('=============subscribe=============');
    subscribers.add(callback);
    return () => subscribers.delete(callback);
}

export function notifySubscribers() {
   // console.log('=============notifySubscribers=============');
    const state = {
        game: getGameState(),
        ui: getUIState()
    };
    subscribers.forEach(callback => callback(state));
}

/**
 * Update the game state atomically
 * @param {Object} updates - Partial state update
 */
let isUpdating = false;
let updateQueue = [];

export function updateGameState(updates) {
   //console.log('=============updateGameState=============');
    // If we're already processing updates, queue this one
    if (isUpdating) {
        updateQueue.push(updates);
        return;
    }

    try {
        isUpdating = true;
        
        // Apply the update
        _state.game._notifyOnChange = true;
        Object.assign(_state.game, updates);
        
        // Notify subscribers
        notifySubscribers();
        
        // Process any queued updates
        while (updateQueue.length > 0) {
            const nextUpdate = updateQueue.shift();
            Object.assign(_state.game, nextUpdate);
            notifySubscribers();
        }
    } finally {
        _state.game._notifyOnChange = false;
        isUpdating = false;
    }
}

export function animationState(updates) {
    //console.log('=============animationState=============');
    Object.assign(_state.ui.animation, updates);
    notifySubscribers();
}

/**
 * Update the UI state
 * @param {Object} updates - Partial UI state update
 */
export function updateUIState(updates) {
    //console.log('=============updateUIState=============');
    Object.assign(_state.ui, updates);
    notifySubscribers();
}

/**
 * Update a player's data
 * @param {string} playerId - The ID of the player to update
 * @param {Object} updates - The properties to update
 * @returns {boolean} True if player was found and updated
 */
export function updatePlayer(playerId, updates) {
    //console.log('=============updatePlayer=============');
    const playerIndex = _state.game.players.findIndex(p => p.id === playerId);
    if (playerIndex !== -1) {
        _state.game.players[playerIndex] = { 
            ..._state.game.players[playerIndex], 
            ...updates 
        };
        
        // If coordinates are being updated, ensure immediate state synchronization
        if (updates.currentCoords) {
            //console.log(`Player ${playerId} coordinates updated immediately:`, updates.currentCoords);
        }
        
        notifySubscribers();
        return true;
    }
    return false;
}

/**
 * Reset the game state to initial values
 * @param {Object} [settings] - Optional game settings
 */
export function resetGameState(settings = {}) {
    //console.log('=============resetGameState=============');
    Object.assign(_state.game, {
        players: [],
        currentPlayerIndex: 0,
        turnNumber: 0,
        hasRolled: false,
        lastRoll: 0,
        drawnCard: false,
        phase: 'SETUP',
        gameStarted: false,
        gameOver: false,
        winner: null,
        rollResult: 0,
        pendingAction: null,
        pendingActionData: {},
        turnOrder: [],
        playerRoles: {},
        pathChoiceLock: false,
        playerPositions: {},
        round: 1,
        settings: {
            ..._state.game.settings,
            ...settings
        }
    });
    
    Object.assign(_state.ui, {
        currentScreen: 'start',
        selectedDeck: null,
        highlightedSpace: null,
        isAnimating: false,
        showEndTurnButton: false,
        currentMessage: {
            text: '',
            type: 'info',
            visible: false
        },
        animation: {
            inProgress: false,
            current: null,
            queue: [],
            lastFrameTime: 0,
            frameId: null,
            screenTransition: {
                from: null,
                to: null,
                progress: 0,
                direction: 'right'
            }
        }
    });
    notifySubscribers();
}

export function addPlayer(playerData) {
    //console.log('=============addPlayer=============');
    _state.game.players.push(playerData);
    notifySubscribers();
}

export function startGame() {
    //console.log('=============startGame=============');
    _state.game.gameStarted = true;
    _state.game.phase = 'PLAYING';
    notifySubscribers();
}

export let currentCard = null;
export let currentDeck = null;
export let currentOnComplete = null;

export function setCurrentCardState(card, deck, onComplete) {
    //console.log('=============setCurrentCardState=============');
    currentCard = card;
    currentDeck = deck;
    currentOnComplete = onComplete;
}

// ONE single lookup table (object) holding the parsers
export const EFFECT_PARSERS = {
    
    RESOURCE_CHANGE: ({ changes }) =>
        Object.entries(changes).map(([res, amt]) => {
            const verb = amt >= 0 ? 'Gain' : 'Lose';
            return `${verb} ${Math.abs(amt)} ${capitalize(res)}`;
        }),

    STEAL: ({ amount, resource }) =>
        `Pick a player to steal ${amount} ${resource ? `of ${resource}` : 'of any resource'} from.`,

    STEAL_FROM_ALL: ({ amount, resource }) =>
        `Steal ${amount} ${resource ? `of ${resource}` : 'of any resource'} from all players.`,

    MOVEMENT: ({ spaces }) => {
        if (!spaces) return '';
        return spaces > 0
            ? `Move forward ${spaces} ${spaces === 1 ? 'space' : 'spaces'}.`
            : `Move back ${Math.abs(spaces)} ${Math.abs(spaces) === 1 ? 'space' : 'spaces'}.`;
    }
};

// Action validation system
const FORBIDDEN_ACTIONS = {
    'ROLLING': ['advanceToNextPlayer', 'animateTokenToPosition', 'drawCard', 'showCard'],
    'MOVING': ['advanceToNextPlayer', 'animateDiceRoll', 'drawCard', 'showCard'],
    'PLAYING': ['advanceToNextPlayer', 'animateDiceRoll', 'animateTokenToPosition'],
    'AWAITING_PATH_CHOICE': ['advanceToNextPlayer', 'animateDiceRoll', 'animateTokenToPosition', 'drawCard'],
    'AWAITING_CARD_ACTION': ['advanceToNextPlayer', 'animateDiceRoll', 'animateTokenToPosition, processEndPlayerTurn', 'handlePlayerAction'],
    'TURN_TRANSITION': ['animateTokenToPosition', 'processEndPlayerTurn', 'handleEndOfMove, handleEndTurn, handlePlayerAction', 'drawCard', 'showCard'],
};

export function isActionAllowed(action) {
   //console.log('=============isActionAllowed=============');
    // During initialization, allow all actions until game state is fully set up
    if (!state.game) {
        return true;
    }
    
    const currentPhase = state.game.currentPhase;
    if (!currentPhase) return true; // No phase set yet, allow action
    
    const forbiddenActions = FORBIDDEN_ACTIONS[currentPhase] || [];
    const isForbidden = forbiddenActions.includes(action);
    
    if (isForbidden) {
        console.warn(`[Action Blocked] "${action}" is not allowed during "${currentPhase}" phase`);
        return false;
    }
    
    return true;
}

// SINGLE function that everybody calls
export function getEffectDescription(effect) {
    //console.log('=============getEffectDescription=============');
    const parser = EFFECT_PARSERS[effect.type];
    if (!parser) return [`Unknown effect type: ${effect.type}`];

    const result = parser(effect);
    // Always hand back an array so the UI can loop safely
    return Array.isArray(result) ? result : [result];
}

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Calculates final scores and determines the game winner
 */
export function endGame() {
    console.log('=== ENDING GAME ===');
    
    const players = getPlayers();
    
    if (players.length === 0) {
        console.error('Cannot end game: No players found');
        return;
    }
    
    // Calculate final scores for all players
    players.forEach((player, index) => {
        const resourceTotal = player.playerFinalResourceTotal || 0;
        let rankingBonus = 0;
        
        // Assign ranking bonus based on finish position
        switch(player.playerFinalRanking) {
            case 1: rankingBonus = 25; break;  // 1st place
            case 2: rankingBonus = 20; break;  // 2nd place
            case 3: rankingBonus = 15; break
            case 4: rankingBonus = 15; break;  // 3rd and 4th place
            case 5: rankingBonus = 10; break;
            case 6: rankingBonus = 10; break;  // 5th and 6th place
            default: rankingBonus = 0; break; // Beyond 6th place
        }
        
        _state.game.players[index].playerFinalScore = player.playerFinalResourceTotal + player.playerFinalRanking;
        
        console.log(`Player ${player.name}: Resources=${player.playerFinalResourceTotal}, Ranking=${player.playerFinalRanking}, Bonus=${player.playerFinalRanking}, Final Score=${player.playerFinalScore}`);
    });
    
    // Find all players with the highest final score (handles ties)
    const maxScore = Math.max(...players.map(p => p.playerFinalScore || 0));
    const winners = players.filter(p => p.playerFinalScore === maxScore);
    
    if (winners.length === 1) {
        console.log(`Game Winner: ${winners[0].name} with score ${winners[0].playerFinalScore}`);
    } else {
        console.log(`Game Tie! Winners: ${winners.map(w => w.name).join(', ')} with score ${maxScore}`);
    }
    
    // Update game state
    updateGameState({
        ended: true,
        gameOver: true,
        winner: winners.length === 1 ? winners[0] : winners
    });
    showScreen('endGameScreen');
    // Show the end game screen with victory animation
    showEndGameWithVictory(winners);
}
