import { START_SPACE } from './board-data.js';

import { 
    notifySubscribers, 
    updateGameState,
    getCurrentPlayer,
    state,
} from './state.js';

import { updatePlayerInfo} from './ui.js';

import { 
    advanceToNextPlayer,
} from './game.js';
import {endGame} from './endGameScreen.js';


// ===== Resource & Player Constants =====
// List of all valid resource keys used throughout the game.
export const RESOURCES = ['knowledge', 'money', 'influence'];

// ===== Player Constants =====
export const PLAYER_ROLES = {
    HISTORIAN: { 
        name: 'Suetonius the Historian', 
        description: 'Rome\'s Greatest Gossip....err Historian',
        startingResources: { knowledge: 14, money: 8, influence: 0 },
        opposingRole: 'POLITICIAN',
        abilityIdentifier: 'knowledgeTheftImmunity',
        token: 'H.png',
        abilityDescription: 'Immune to Knowledge Theft',
        playerScoreDisplay: null,
    },
    REVOLUTIONARY: {
        name: 'Audre Lorde the Revolutionary',
        description: 'The Quietest Revolutionary That Ever There Was',
        startingResources: { knowledge: 14, influence: 8, money: 0 },
        opposingRole: 'COLONIALIST',
        abilityIdentifier: 'influenceMultiplier',
        token: 'R.png',
        abilityDescription: 'Gains influence Faster',
        playerScoreDisplay: null,
    },
    COLONIALIST: { 
        name: 'Jacques Cartier the Colonialist', 
        description: 'For The Glory Of The Empire! but to the detriment of everyone else...',
        startingResources: { money: 14, influence: 8, knowledge: 0 },
        opposingRole: 'REVOLUTIONARY',
        abilityIdentifier: 'influenceTheftImmunity',
        token: 'C.png',
        abilityDescription: 'Immune to influence Theft',
        playerScoreDisplay: null,
    },
    ENTREPRENEUR: { 
        name: 'Regina Basilier the Entrepreneur', 
        description: 'Making Bank Before It Was Even Legal, Literally',
        startingResources: { money: 14, knowledge: 8, influence: 0 },
        opposingRole: 'ARTIST',
        abilityIdentifier: 'moneyMultiplier',
        token: 'E.png',
        abilityDescription: 'Gains Money Faster',
        playerScoreDisplay: null,
    },
    POLITICIAN: { 
        name: 'Winston Churchill the Politician', 
        description: 'A Politician With A Plan...Unless You Are Irish',
        startingResources: { influence: 14, money: 8, knowledge: 0 },
        opposingRole: 'HISTORIAN',
        abilityIdentifier: 'moneyTheftImmunity',
        token: 'P.png',
        abilityDescription: 'Immune To Money Theft',
        playerScoreDisplay: null,
    },
    ARTIST: { 
        name: 'Salvador Dali the Artist', 
        description: 'A Brilliant Nutjob And Entertaining Loose Cannon',
        startingResources: { influence: 14, knowledge: 8, money: 0 },
        opposingRole: 'ENTREPRENEUR',
        abilityIdentifier: 'knowledgeMultiplier',
        token: 'A.png',
        abilityDescription: 'Gains Knowledge Faster',
        playerScoreDisplay: null,
    }
};

// ===== Player State =====
export let players = [];

/**
 * Creates a new player with the specified role and settings.
 * Initializes position using START_SPACE coordinates.
 * @param {string} name - The player's name
 * @param {string} id - The player's ID
 * @param {string} role - The player's role (must be a key in PLAYER_ROLES)
 * @param {boolean} [isHuman=false] - Whether this player is human-controlled
 * @returns {Object|null} The created player object or null if role is invalid
 */

export function createPlayer(config) {
    // START_SPACE.coordinates is [104, 512], so we need to use it directly
    const startCoords = {
        x: START_SPACE.coordinates[0], 
        y: START_SPACE.coordinates[1]
    };

  //console.log('START_SPACE coordinates:', START_SPACE.coordinates);
  //console.log('Player start coords:', startCoords);

  //console.log(`[Players] Creating player ${config.name} with role ${config.role}`);
  //console.log(`[Players] Role definition for ${config.role}:`, PLAYER_ROLES[config.role]);
  //console.log(`[Players] Starting resources for ${config.role}:`, PLAYER_ROLES[config.role]?.startingResources);

  const player = {
    id: config.id,
    name: config.name,
    role: config.role,
    isHuman: config.isHuman ?? true,
    currentCoords: { ...startCoords },
    x: startCoords.x,
    y: startCoords.y,
    resources: { ...(PLAYER_ROLES[config.role]?.startingResources || { knowledge: 0, money: 0, influence: 0 }) },
    finished: false,
    skipNextTurn: false,
    cards: [],
    items: [],
    alliances: [],
    temporaryImmunityTurns: 0,
    tradeBlockedTurns: 0,
    forcePathChange: false,
    currentAlliancePartnerId: null,
    abilityUsed: false,
  };

  //console.log(`[Players] Player created with final resources:`, player.resources);
  //console.log(`Created player ${player.name} (${player.role}), Human: ${player.isHuman}, starting at (${player.x},${player.y})`);

  players.push(player);
  return player;
}

/**
 * Retrieves the current list of players
 * @returns {Array<Object>} Copy of the players array
 */
export function getPlayers() {
    // Return a shallow copy to prevent external modification
    return [...state.players];
}

/**
 * Resets the player state, clearing all players.
 */
export function resetPlayers() {
    //console.log("Player state reset.");
    players = [];
}

/**
 * Marks a player as finished, updates their final scores, and handles game flow
 */
/**
 * Marks a player as finished, calculates final scores, and updates game state
 * @param {string|Object} playerOrId - Player ID or player object
 */
export function markPlayerFinished(playerOrId) {
    if (!playerOrId) {
        console.error('markPlayerFinished: No player provided');
        return;
    }
    
    console.log('=== markPlayerFinished called ===');
    
    // Get the players array from state
    const players = getPlayers();
    if (players.length === 0) {
        console.error('No players in game state');
        return;
    }
    
    // Find the player in the state
    let player;
    let playerIndex = -1;
    
    if (typeof playerOrId === 'string' || typeof playerOrId === 'number') {
        // Find player by ID
        playerIndex = players.findIndex(p => p.id === playerOrId);
        if (playerIndex === -1) {
            console.error(`Player with ID ${playerOrId} not found`);
            return;
        }
        player = players[playerIndex];
    } else if (typeof playerOrId === 'object' && playerOrId.id) {
        // Find player by object reference
        playerIndex = players.findIndex(p => p.id === playerOrId.id);
        if (playerIndex === -1) {
            console.error('Player object not found in state');
            return;
        }
        player = players[playerIndex];
    } else {
        console.error('Invalid player identifier provided');
        return;
    }
    
    console.log(`Marking player as finished: ${player.name} (ID: ${player.id})`);
    
    // Mark player as finished in the state
    state.players[playerIndex] = {
        ...state.players[playerIndex],
        finished: true,
        finishedAt: new Date().toISOString()
    };
    
    // Get the most up-to-date resources using our synchronized function
    const resources = getPlayerResources(player.id);
    console.log('Final resources for player:', resources);
    
    // Calculate final resource total
    const finalResourceTotal = (resources?.money || 0) + 
                             (resources?.knowledge || 0) + 
                             (resources?.influence || 0);
    
    console.log(`Calculated final resource total: ${finalResourceTotal}`);
    
    // Update player's final resource total in state
    state.players[playerIndex].playerFinalResourceTotal = finalResourceTotal;
    
    // Calculate finish position (1st, 2nd, etc.)
    const finishedPlayers = state.players.filter(p => p.finished);
    const finishPosition = finishedPlayers.length;
    
    // Update player's final ranking
    state.players[playerIndex].playerFinalRanking = finishPosition;
    
    console.log(`Player ${player.name} finished in position ${finishPosition} with ${finalResourceTotal} total resources`);
    
    // Update the player in the global state
    if (typeof updateGameState === 'function') {
        updateGameState({
            players: [...state.players],
            playerFinishPosition: Math.max(state.game?.playerFinishPosition || 0, finishPosition)
        });
    }
    state.players[playerIndex].playerFinalRanking = finishPosition;
    
    console.log(`Player ${player.name} marked as finished in position ${finishPosition} with ${finalResourceTotal} total resources`);
    console.log('=== END RESOURCE CALCULATION DEBUG ===');
    
    // Trigger state update notification
    updateGameState({
        playerFinishPosition: Math.max(state.players.playerFinishPosition, finishPosition)
    });
    
    // Verify the change took effect
    const verifyPlayer = state.players[playerIndex];
    console.log(`VERIFICATION - Player ${verifyPlayer.name} finished: ${verifyPlayer.finished}`);
    
    if (allPlayersFinished()) {
        console.log('All players finished - ending game');
        endGame();
    } else {
        console.log('Not all players finished - advancing to next player');
        advanceToNextPlayer();
    }
}

/**
 * Checks if all players in the game have finished.
 */
export function allPlayersFinished() {
    console.log('===============allPlayersFinished================');
    if (players.length === 0) return false; // No players, game can't be finished
    return players.every(p => p.finished);
}


/**
 * Get a player by ID
 * @param {string} playerId - The ID of the player to find
 * @returns {Object|null} Player object or null if not found
 */
export function getPlayerById(playerId) {
    console.log('=============getPlayerById=============');
    const player = state.players.find(p => p.id === playerId);
    return player ? { ...player } : null;
}
/**
 * Calculates the score for a single player (sum of resources).
 */
export function getPlayerScore(player) {
    // Placeholder scoring logic
    let score = 0;
    if (player.finished) score += 100; // Bonus for finishing
    // Add points for resources, cards, etc. later
    // score += Object.values(player.resources).reduce((sum, val) => sum + val, 0);
    return score;
}

/**
 * Calculates the final player rankings based on score and elimination.
 */
export function getPlayerRanking() {
    // Simple ranking: finished players first, then by name (for tie-breaking)
    return [...players].sort((a, b) => {
        if (a.finished && !b.finished) return -1;
        if (!a.finished && b.finished) return 1;
        return a.name.localeCompare(b.name); // Alphabetical for ties/unfinished
    });
}
// Get player by role
export function getPlayerByRole(role) {
    return players.find(player => player.role === role);
}

/**
 * Gets a random player from the list, excluding the provided player.
 * @param {object} currentPlayer - The player to exclude.
 * @returns {object | null} A random other player, or null if none exist.
 */
export function getRandomOtherPlayer(currentPlayer) {
    if (!currentPlayer) return null; 
    const otherPlayers = players.filter(p => p.id !== currentPlayer.id);
    if (otherPlayers.length === 0) {
        return null; // No other players in the game
    }
    const randomIndex = Math.floor(Math.random() * otherPlayers.length);
    return otherPlayers[randomIndex];
}

/**
 * Update a player's resources in global state
 * @param {Object|string} currentPlayer - Either the player object, player ID, or changes object if called with single parameter
 * @param {Object} [changes] - The resource changes to apply (can be positive or negative)
 * @returns {boolean} - True if update succeeded, false otherwise
 */
export function updatePlayerResources(currentPlayer, changes) {
  console.log('=============updatePlayerResources=============');
  
  // Handle single parameter call (just changes object)
  if (arguments.length === 1 && currentPlayer && typeof currentPlayer === 'object' && !Array.isArray(currentPlayer)) {
    changes = currentPlayer;
    currentPlayer = getCurrentPlayer();
  } else if (!changes) {
    // If changes is not provided, treat the first param as changes
    changes = currentPlayer;
    currentPlayer = getCurrentPlayer();
  }
  
  // If currentPlayer is a string, treat it as playerId
  if (typeof currentPlayer === 'string') {
    currentPlayer = getPlayerById(currentPlayer);
  } else if (!currentPlayer) {
    // Fallback to current player if not provided
    currentPlayer = getCurrentPlayer();
  }
  
  // Find the player in the global state
  const players = getPlayers ? getPlayers() : []; // Safety check
  
  if (!currentPlayer || !changes) {
    console.error('Invalid parameters for updatePlayerResources:', { 
      currentPlayer: currentPlayer?.id || 'undefined', 
      changes 
    });
    return false;
  }

  // Validate player has resources object
  if (!currentPlayer.resources) {
      console.error('Player missing resources object:', currentPlayer);
      return false;
  }

  // Define valid resources
  const RESOURCES = ['knowledge', 'money', 'influence'];

  // Validate and normalize changes
  const normalizedChanges = {};
  let isValid = true;
  for (const resource in changes) {
      if (!RESOURCES.includes(resource)) {
          console.warn(`Invalid resource type '${resource}' ignored`);
          continue;
      }

      const change = Number(changes[resource]);
      if (isNaN(change)) {
          console.error(`Invalid change value for ${resource}:`, changes[resource]);
          isValid = false;
          break;
      }

      normalizedChanges[resource] = change;
  }

  if (!isValid) return false;

  // Calculate new values first to ensure all changes are valid
  const newValues = { ...currentPlayer.resources };
  for (const [resource, change] of Object.entries(normalizedChanges)) {
      const currentValue = newValues[resource] || 0;
      const newValue = currentValue + change;

      // Prevent negative resources
      if (newValue < 0) {
          console.error(`Cannot update ${resource}: would result in negative value (${newValue})`);
          return false;
      }

      newValues[resource] = newValue;
  }

  // Apply validated changes to the player object
  currentPlayer.resources = { ...newValues };
  
  // Update the global state with the modified player
  const updatedPlayers = players.map(p => 
      p.id === currentPlayer.id ? { ...p, resources: { ...newValues } } : p
  );
  
  // Update module-level state
  if (state.playerResources[currentPlayer.id]) {
      state.playerResources[currentPlayer.id] = { ...newValues };
  }
  
  // Update global state (if function exists)
  if (typeof updateGameState === 'function') {
      updateGameState({ players: updatedPlayers });
  }
  
  // Notify subscribers of state changes (if function exists)
  if (typeof notifySubscribers === 'function') {
      notifySubscribers();
  }

  // Trigger UI update for this specific player (if function exists)
  if (typeof updatePlayerInfo === 'function') {
      updatePlayerInfo(currentPlayer, newValues);
  }
  
  console.log(`[Resources] Updated resources for ${currentPlayer.name}:`, newValues);
  
  return true;
}

/**
* Get a player's resources
* @param {string} playerId - The ID of the player
* @returns {Object} Player's resources or null if not found
*/
export function getPlayerResources(playerId) {
    if (!playerId) {
        console.warn('getPlayerResources: No player ID provided');
        return null;
    }
    
    // First try to get from the player object
    const player = getPlayerById(playerId);
    if (player?.resources) {
        return { ...player.resources };
    }
    
    // Fall back to module state
    if (state.playerResources[playerId]) {
        return { ...state.playerResources[playerId] };
    }
    
    console.warn(`getPlayerResources: No resources found for player ${playerId}`);
    return { knowledge: 0, money: 0, influence: 0 };
}

/**
 * Initialize player resources in both module state and player object
 * @param {string} playerId - The ID of the player
 * @param {Object} initialResources - Initial resource values
 */
export function initPlayerResources(playerId, initialResources) {
    if (!playerId || !initialResources) {
        console.warn('initPlayerResources: Missing playerId or initialResources');
        return;
    }
    
    const resources = {
        knowledge: Number(initialResources.knowledge) || 0,
        money: Number(initialResources.money) || 0,
        influence: Number(initialResources.influence) || 0
    };
    
    // Update module state
    state.playerResources[playerId] = { ...resources };
    
    // Update player object if it exists
    const player = getPlayerById(playerId);
    if (player) {
        player.resources = { ...resources };
    }
    
    console.log(`[Resources] Initialized resources for player ${playerId}:`, resources);
}