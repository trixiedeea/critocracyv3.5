
import { START_SPACE } from './board-data.js';
import { updatePlayerInfo } from './ui.js'; // Corrected import name

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
        playerResourcePanel: null,
    },
    REVOLUTIONARY: {
        name: 'Audre Lorde the Revolutionary',
        description: 'The Quietest Revolutionary That Ever There Was',
        startingResources: { knowledge: 14, influence: 8, money: 0 },
        opposingRole: 'COLONIALIST',
        abilityIdentifier: 'influenceMultiplier',
        token: 'R.png',
        abilityDescription: 'Gains Influence Faster',
        playerResourcePanel: null,
    },
    COLONIALIST: { 
        name: 'Jacques Cartier the Colonialist', 
        description: 'For The Glory Of The Empire! but to the detriment of everyone else...',
        startingResources: { money: 14, influence: 8, knowledge: 0 },
        opposingRole: 'REVOLUTIONARY',
        abilityIdentifier: 'influenceTheftImmunity',
        token: 'C.png',
        abilityDescription: 'Immune to Influence Theft',
        playerResourcePanel: null,
    },
    ENTREPRENEUR: { 
        name: 'Regina Basilier the Entrepreneur', 
        description: 'Making Bank Before It Was Even Legal, Literally',
        startingResources: { money: 14, knowledge: 8, influence: 0 },
        opposingRole: 'ARTIST',
        abilityIdentifier: 'moneyMultiplier',
        token: 'E.png',
        abilityDescription: 'Gains Money Faster',
        playerResourcePanel: null,
    },
    POLITICIAN: { 
        name: 'Winston Churchill the Politician', 
        description: 'A Politician With A Plan...Unless You Are Irish',
        startingResources: { influence: 14, money: 8, knowledge: 0 },
        opposingRole: 'HISTORIAN',
        abilityIdentifier: 'moneyTheftImmunity',
        token: 'P.png',
        abilityDescription: 'Immune To Money Theft',
        playerResourcePanel: null,
    },
    ARTIST: { 
        name: 'Salvador Dali the Artist', 
        description: 'A Brilliant Nutjob And Entertaining Loose Cannon',
        startingResources: { influence: 14, knowledge: 8, money: 0 },
        opposingRole: 'ENTREPRENEUR',
        abilityIdentifier: 'knowledgeMultiplier',
        token: 'A.png',
        abilityDescription: 'Gains Knowledge Faster',
        playerResourcePanel: null,
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

  console.log('START_SPACE coordinates:', START_SPACE.coordinates);
  console.log('Player start coords:', startCoords);

  console.log(`[Players] Creating player ${config.name} with role ${config.role}`);
  console.log(`[Players] Role definition for ${config.role}:`, PLAYER_ROLES[config.role]);
  console.log(`[Players] Starting resources for ${config.role}:`, PLAYER_ROLES[config.role]?.startingResources);

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

  console.log(`[Players] Player created with final resources:`, player.resources);
  console.log(`Created player ${player.name} (${player.role}), Human: ${player.isHuman}, starting at (${player.x},${player.y})`);

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
    console.log("Player state reset.");
    players = [];
}

/**
 * Marks a player as finished.
 */
export function markPlayerFinished(player) {
    if (!player) return;
    console.log(`Marking player ${player.name} as finished.`);
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
 * Sets the skipNextTurn flag for a player.
 */
export function setPlayerSkipTurn(player, skip = true) {
    if (player) {
        player.skipNextTurn = skip;
    }
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


import { updatePlayerResources as updateGlobalResources } from './state.js';

export function updatePlayerResources(player, changes) {
    console.group(`[PLAYER] updatePlayerResources - ${player?.name} (${player?.role})`);
    console.log('Changes requested:', changes);
    
    if (!player || !changes) {
        const error = `Invalid parameters for updatePlayerResources: ${JSON.stringify({
            hasPlayer: !!player,
            hasChanges: !!changes,
            playerId: player?.id,
            changesType: typeof changes
        }, null, 2)}`;
        console.error(error);
        console.groupEnd();
        return false;
    }
    
    // Validate player has resources object
    if (!player.resources) {
        console.warn('Player missing resources object, initializing...');
        player.resources = { money: 0, knowledge: 0, influence: 0 };
    }
    
    console.log('Current resources:', JSON.parse(JSON.stringify(player.resources)));

    // Validate and normalize changes
    const normalizedChanges = {};
    let isValid = true;
    
    console.log('Normalizing changes...');
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
        
        console.log(`- ${resource}: ${change}`);
        normalizedChanges[resource] = change;
    }
    
    if (!isValid) return false;

    // Calculate new values first to ensure all changes are valid
    const newValues = { ...player.resources };
    console.log('\nApplying changes to resources:');
    
    for (const [resource, change] of Object.entries(normalizedChanges)) {
        console.group(`Processing ${resource}:`);
        console.log(`Current: ${newValues[resource] || 0} ${resource}`);
        console.log(`Change:  ${change >= 0 ? '+' : ''}${change} ${resource}`);
        const currentValue = newValues[resource] || 0;
        const newValue = currentValue + change;
        
        // Prevent negative resources
        if (newValue < 0) {
            console.error(`Cannot update ${resource}: would result in negative value (${newValue})`);
            console.groupEnd(); // End resource group
            console.groupEnd(); // End main group
            return false;
        }
        
        console.log(`New:     ${newValue} ${resource}`);
        console.groupEnd(); // End resource group
        
        newValues[resource] = newValue;
    }

    // Log the state before update
    console.log('\n=== RESOURCE UPDATE SUMMARY ===');
    console.log('Before update:', JSON.parse(JSON.stringify(player.resources)));
    
    // Update local player object
    Object.assign(player.resources, newValues);
    
    console.log('After update: ', JSON.parse(JSON.stringify(player.resources)));
    
    // Log the actual changes made
    const changesMade = {};
    for (const [resource, change] of Object.entries(normalizedChanges)) {
        changesMade[resource] = {
            from: (player.resources[resource] || 0) - change,
            to: player.resources[resource],
            change: change
        };
    }
    console.log('Changes applied:', changesMade);
    
    try {
        // Update global state
        console.log('Updating global state...');
        updateGlobalResources(player.id, { ...player.resources });
        console.log('Global state updated');
        
        // Trigger UI update
        console.log('Updating UI...');
        updatePlayerInfo(player.id);
        console.log('UI update complete');
        
        console.log('=== RESOURCE UPDATE COMPLETE ===');
        console.groupEnd();
        return true;
    } catch (error) {
        console.error('Error updating resources:', error);
        console.groupEnd();
        return false;
    }
}
