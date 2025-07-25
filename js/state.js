/**
 * State Management Module for Critocracy
 * Centralized state management for game, player, and UI state
 * Maintains backward compatibility with existing code
 */

import { SPACE_TYPE } from './board-data.js';

// ===== State Objects =====
const _state = {
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
        }
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
        phase: 'setup',
        gameStarted: false,
        gameOver: false,
        winner: null,
        round: 1,
        maxRounds: 10,
        playerRoles: {},
        playerPositions: {},
        board: {},
        settings: {
            maxPlayers: 6,
            minPlayers: 2,
            enableSpecialAbilities: true
        },
        spaceType: { ...SPACE_TYPE }, // Add spaceType to global state.
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
    return JSON.parse(JSON.stringify(_state.game));
}

/**
 * Get the current UI state
 * @returns {Object} Immutable copy of the UI state
 */
export function getUIState() {
    return JSON.parse(JSON.stringify(_state.ui));
}

/**
 * Get a player's resources from global state
 * @param {string} playerId - The ID of the player
 * @returns {Object} Player's resources or null if not found
 */
export function getPlayerResources(playerId) {
    if (!playerId || !_state.playerResources[playerId]) return null;
    return JSON.parse(JSON.stringify(_state.playerResources[playerId]));
}

/**
 * Update a player's resources in global state
 * @param {string} playerId - The ID of the player
 * @param {Object} resources - The new resource values
 */
export function updatePlayerResources(playerId, resources) {
    if (!playerId || !resources) return;
    _state.playerResources[playerId] = JSON.parse(JSON.stringify(resources));
    notifySubscribers();
}

/**
 * Initialize player resources in global state
 * @param {string} playerId - The ID of the player
 * @param {Object} initialResources - Initial resource values
 */
export function initPlayerResources(playerId, initialResources) {
    if (!playerId || !initialResources) return;
    _state.playerResources[playerId] = JSON.parse(JSON.stringify(initialResources));
}

/**
 * Get the current player object
 * @returns {Object|null} Current player or null if none
 */
export function getCurrentPlayer() {
    const { game } = _state;
    if (game.currentPlayerIndex >= 0 && game.currentPlayerIndex < game.players.length) {
        return { ...game.players[game.currentPlayerIndex] };
    }
    return null;
}

/**
 * Get a player by ID
 * @param {string} playerId - The ID of the player to find
 * @returns {Object|null} Player object or null if not found
 */
export function getPlayerById(playerId) {
    const player = _state.game.players.find(p => p.id === playerId);
    return player ? { ...player } : null;
}

// ===== State Setters =====

const subscribers = new Set();

/**
 * Subscribe to state changes
 * @param {Function} callback - Function to call when state changes
 * @returns {Function} Unsubscribe function
 */
export function subscribe(callback) {
    subscribers.add(callback);
    return () => subscribers.delete(callback);
}

function notifySubscribers() {
    const state = {
        game: getGameState(),
        ui: getUIState()
    };
    subscribers.forEach(callback => callback(state));
}

/**
 * Update the game state
 * @param {Object} updates - Partial state update
 */
export function updateGameState(updates) {
    // Set flag to enable notifications during this update
    _state.game._notifyOnChange = true;
    Object.assign(_state.game, updates);
    notifySubscribers();
    // Reset flag after update
    _state.game._notifyOnChange = false;
}

export function animationState(updates) {
    Object.assign(_state.ui.animation, updates);
    notifySubscribers();
}

/**
 * Update the UI state
 * @param {Object} updates - Partial UI state update
 */
export function updateUIState(updates) {
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
    const playerIndex = _state.game.players.findIndex(p => p.id === playerId);
    if (playerIndex !== -1) {
        _state.game.players[playerIndex] = { 
            ..._state.game.players[playerIndex], 
            ...updates 
        };
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
    _state.game.players.push(playerData);
    notifySubscribers();
}

export function startGame() {
    _state.game.gameStarted = true;
    _state.game.phase = 'PLAYING';
    notifySubscribers();
}

export let currentCard = null;
export let currentDeck = null;
export let currentOnComplete = null;

export function setCurrentCardState(card, deck, onComplete) {
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

// SINGLE function that everybody calls
export function getEffectDescription(effect) {
    const parser = EFFECT_PARSERS[effect.type];
    if (!parser) return [`Unknown effect type: ${effect.type}`];

    const result = parser(effect);
    // Always hand back an array so the UI can loop safely
    return Array.isArray(result) ? result : [result];
}

function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
}
