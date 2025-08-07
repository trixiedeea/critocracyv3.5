
import { START_SPACE } from './board-data.js';
import { updatePlayerInfo } from './ui.js'; // Corrected import name
import { 
    notifySubscribers, 
    updateGameState,
    getCurrentPlayer,
    _state,
} from './state.js';

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
    return [...players];
}

/**
 * Resets the player state, clearing all players.
 */
export function resetPlayers() {
    //console.log("Player state reset.");
    players = [];
}

/**
 * Marks a player as finished.
 */
export function markPlayerFinished(player) {
    if (!player) return;
    //console.log(`Marking player ${player.name} as finished.`);
    console.trace('markPlayerFinished called from:');
    player.finished = true;
    // Optionally add finish time/rank later if needed
}

/**
 * Checks if all players in the game have finished.
 */
export function allPlayersFinished() {
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
    const player = _state.game.players.find(p => p.id === playerId);
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
  Object.assign(currentPlayer.resources, newValues);
  //console.log(`Resources updated for ${currentPlayer.name}:`, currentPlayer.resources);

  // Update the global state with the modified player
  const updatedPlayers = players.map(p => 
      p.id === currentPlayer.id ? { ...p, resources: { ...currentPlayer.resources } } : p
  );
  
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
  
  return true;
}

/**
* Get a player's resources from global state
* @param {string} playerId - The ID of the player
* @returns {Object} Player's resources or null if not found
*/
export function getPlayerResources(playerId) {
    console.log('=============getPlayerResources=============');
    if (!playerId || !_state.playerResources[playerId]) return null;
    return JSON.parse(JSON.stringify(_state.playerResources[playerId]));
}

/**
 * Initialize player resources in global state
 * @param {string} playerId - The ID of the player
 * @param {Object} initialResources - Initial resource values
 */
export function initPlayerResources(playerId, initialResources) {
    console.log('=============initPlayerResources=============');
    if (!playerId || !initialResources) return;
    _state.playerResources[playerId] = JSON.parse(JSON.stringify(initialResources));
}