// resourceManagement.js


import { 
  getPlayers, 
  getRandomOtherPlayer,
  updatePlayerResources,
} from './players.js';

// Import game logic functions needed for complex effects
import { 
  handleEndTurn, 
  processEndPlayerTurn,
} from './game.js';
import { state } from './state.js';


// ========== //constants ==========

const RESOURCE_TYPES = ['money', 'knowledge', 'influence'];

const roleMultipliers = {
  gain: {
    ARTIST: { knowledge: 1.85 },
    ENTREPRENEUR: { money: 1.85 },
    REVOLUTIONARY: { influence: 1.85 },
  },
  loss: {
    HISTORIAN: { knowledge: 0.15 }, // Loses only 15% of knowledge losses
    COLONIALIST: { influence: 0.15 },
    POLITICIAN: { money: 0.15 },
  },
};

const stealRestrictions = {
  POLITICIAN: ['HISTORIAN'],
  HISTORIAN: ['POLITICIAN'],
  REVOLUTIONARY: ['COLONIALIST'],
  COLONIALIST: ['REVOLUTIONARY'],
  ENTREPRENEUR: ['ARTIST'],
  ARTIST: ['ENTREPRENEUR'],
};

const resistanceRates = {
  POLITICIAN: { money: 0.15 },
  HISTORIAN: { knowledge: 0.15 },
  COLONIALIST: { influence: 0.15 }
};

/**
 * Applies the effects listed on the current card to the target player(s).
 * Called for regular cards. Calls processEndPlayerTurn when complete.
 * @param {Object} player - The player to apply effects to
 * @param {Function} [onComplete] - Optional callback after effects are applied
 */
export function applyCardEffects(player, onComplete) {
  console.log('---------applyCardEffects---------')
  const card = state.currentCard;
  if (!card || !player) {
    console.warn("Cannot apply card effect: No current card or invalid player.", { currentCard: card, player });
    processEndPlayerTurn();
    if (onComplete) onComplete(false);
    return;
  }

  console.log(`Applying effects of card "${card.name}" to player ${player.name}...`);
  
  if (!card.effects) {
    console.error(`Card "${card.name}" has no effects property.`);
    processEndPlayerTurn();
    if (onComplete) onComplete(false);
    return;
  }
  
  const processEffects = (effects) => {
    if (!effects) {
      console.warn('No effects to process');
      return false;
    }
    
    try {
      if (Array.isArray(effects)) {
        return processEffectGroup(effects, player, player);
      } else if (typeof effects === 'object') {
        return processEffectGroup([effects], player, player);
      }
      return false;
    } catch (error) {
      console.error('Error processing effects:', error);
      return false;
    }
  };
  
  try {
    // Handle role-based effects (object with role keys)
    if (typeof card.effects === 'object' && !Array.isArray(card.effects)) {
      console.log(`Card "${card.name}" has role-based effects structure.`);
      
      if (!player.role) {
        console.error('Player role is undefined or invalid:', player);
        processEndPlayerTurn();
        if (onComplete) onComplete(false);
        return;
      }
      
      // Convert role to PascalCase to match card data
      const roleStr = String(player.role);
      const pascalCaseRole = roleStr.charAt(0).toUpperCase() + roleStr.slice(1).toLowerCase();
      const roleEffects = card.effects[pascalCaseRole];
      
      if (roleEffects) {
        console.log(`Applying ${player.role}-specific effects:`, roleEffects);
        processEffects(roleEffects);
      } else if (card.effects.ALL) {
        console.log(`No specific effects for ${player.role}, applying ALL effects`);
        processEffects(card.effects.ALL);
      } else {
        console.log(`No effects defined for ${player.role} role and no ALL effects found.`);
      }
    }
    // Handle array-based effects
    else if (Array.isArray(card.effects)) {
      console.log(`Card "${card.name}" has array-based effects.`);
      processEffects(card.effects);
    }
    else {
      console.error(`Card "${card.name}" effects has unexpected format:`, card.effects);
    }
  } catch (error) {
    console.error(`Error applying card effects for ${card.name}:`, error);
  } finally {
    // Always call processEndPlayerTurn for regular cards
    console.log('Regular card effects complete, ending turn');
    processEndPlayerTurn();
    if (onComplete) onComplete(true);
  }
}

/**
 * Applies the effects from Age cards to the target player(s).
 * Called for Age of cards. Calls handleEndTurn when complete.
 * @param {Object} player - The player to apply effects to
 * @param {Function} [onComplete] - Optional callback after effects are applied
 */
export function applyAgeCardEffects(player, onComplete) {
  console.log('---------applyAgeCardEffects---------')
  const card = state.currentCard;
  if (!card || !player) {
    console.warn("Cannot apply age card effect: No current card or invalid player.", { currentCard: card, player });
    handleEndTurn();
    if (onComplete) onComplete(false);
    return;
  }

  console.log(`Applying age card effects of "${card.name}" to player ${player.name}...`);
  
  if (!card.choice?.optionA?.effects && !card.choice?.optionB?.effects) {
    console.error(`Age card "${card.name}" has no effects property.`);
    handleEndTurn();
    if (onComplete) onComplete(false);
    return;
  }
  
  // Determine which choice was made by the player
  const chosenOption = player.choice; // Assuming player.choice contains 'A' or 'B'
  let selectedEffects = null;
  
  if (chosenOption === 'A' && card.choice.optionA?.effects) {
    selectedEffects = card.choice.optionA.effects;
    console.log(`Applying optionA effects based on player's choice...`);
  } else if (chosenOption === 'B' && card.choice.optionB?.effects) {
    selectedEffects = card.choice.optionB.effects;
    console.log(`Applying optionB effects based on player's choice...`);
  } else {
    console.warn(`No valid choice found for player ${player.name} or no effects for chosen option.`, { 
      playerChoice: chosenOption, 
      hasOptionA: !!card.choice.optionA?.effects, 
      hasOptionB: !!card.choice.optionB?.effects 
    });
    handleEndTurn();
    if (onComplete) onComplete(false);
    return;
  }
  
  const processEffects = () => {
    if (!selectedEffects) {
      console.warn('No effects to process for age card');
      return false;
    }
    
    try {
      if (Array.isArray(selectedEffects)) {
        return processEffectGroup(selectedEffects, player, player);
      } else if (selectedEffects && typeof selectedEffects === 'object') {
        return processEffectGroup(selectedEffects, player, player);
      }
      return false;
    } catch (error) {
      console.error('Error processing age card effects:', error);
      return false;
    }
  };
  
  try {
    // Process the selected effects
    const success = processEffects();
    
    if (!success) {
      console.warn('Some effects may not have been processed correctly');
    }
    
    return success;
  } catch (error) {
    console.error(`Error applying age card effects for ${card.name}:`, error);
    return false;
  } finally {
    // For age cards, we call handleEndTurn to continue the turn
    console.log('Age card effects complete, continuing turn');
    handleEndTurn();
    if (onComplete) onComplete(true);
  }
}
/**
 * Handles resource change effects
 * @private
 */
function handleResourceChangeEffect(effect, targetPlayer) {
  if (effect.changes) {
    Object.entries(effect.changes).forEach(([resource, amount]) => {
      applyResourceChange(targetPlayer, resource, amount, 'cardEffect');
    });
  } else {
    // Handle direct resource properties
    ['money', 'knowledge', 'influence'].forEach(resource => {
      if (effect[resource]) {
        applyResourceChange(targetPlayer, resource, effect[resource], 'cardEffect');
      }
    });
  }
}

/**
 * Handles steal effects
 * @private
 */
function handleStealEffect(effect, sourcePlayer, targetPlayer) {
  if (sourcePlayer.isAI) {
    const validTargets = getValidStealTargets(sourcePlayer, getPlayers(), effect);
    if (validTargets.length > 0) {
      const target = validTargets[Math.floor(Math.random() * validTargets.length)];
      const rate = getResistanceRate(target, effect.resource);
      const adjustedAmount = Math.floor(effect.amount * rate);
      applyStealEffect(effect, target, sourcePlayer, adjustedAmount);
    }
  } else {
    showStealPopover(effect, sourcePlayer, getPlayers());
  }
}

/**
 * Handles a single effect by routing it to the appropriate handler
 * @private
 * @param {Object} effect - The effect to process
 * @param {Object} player - The target player
 * @param {Object} sourcePlayer - The player who triggered the effect
 * @returns {boolean} True if the effect was handled successfully
 */
function handleEffect(effect, player, sourcePlayer) {
  if (!effect || !player) return false;
  
  try {
    // Determine target player
    let targetPlayer = player;
    if (effect.target === 'OTHER') {
      targetPlayer = getRandomOtherPlayer(sourcePlayer);
      if (!targetPlayer) {
        console.log(`Effect targeted OTHER, but no other player found.`);
        return false;
      }
    } else if (effect.target === 'SELF') {
      targetPlayer = sourcePlayer;
    }

    // Route to appropriate handler based on effect type
    switch (effect.type) {
      case 'RESOURCE_CHANGE':
        handleResourceChangeEffect(effect, targetPlayer);
        break;
        
      case 'MOVEMENT':
        handleCardMovement(targetPlayer, effect);
        break;
        
      case 'STEAL':
        handleStealEffect(effect, sourcePlayer, targetPlayer);
        break;
        
      case 'SKIP_TURN':
        applySkipTurn(effect, targetPlayer);
        break;
        
      case 'STEAL_FROM_ALL':
        handleStealFromAll(effect, sourcePlayer, getPlayers());
        break;
        
      default:
        console.warn(`Unknown effect type: ${effect.type}`);
        // Fallback: try to apply as direct resource changes
        handleResourceChangeEffect(effect, targetPlayer);
        return false;
    }
    return true;
  } catch (error) {
    console.error('Error in handleEffect:', error);
    return false;
  }
}

/**
 * Helper function to process a group of effects (array or single effect)
 * @param {Array|Object} effectGroup - The effect(s) to process
 * @param {Object} player - The target player
 * @param {Object} sourcePlayer - The player who triggered the effect
 * @returns {boolean} True if all effects were processed successfully
 */
function processEffectGroup(effectGroup, player, sourcePlayer) {
  if (!effectGroup) return false;
  
  try {
    const effects = Array.isArray(effectGroup) ? effectGroup : [effectGroup];
    let allProcessed = true;
    
    for (const effect of effects) {
      if (effect) {
        const success = handleEffect(effect, player, sourcePlayer);
        allProcessed = allProcessed && success;
      }
    }
    
    return allProcessed;
  } catch (error) {
    console.error('Error in processEffectGroup:', error);
    return false;
  }
}

/**
 * Applies resource changes to a single player, with role-based mod//ifiers
 */
/**
 * Applies resource changes to a single player with role-based modifiers
 * @param {Object} player - The player object
 * @param {string} resourceType - Type of resource (money/knowledge/influence)
 * @param {number} amount - Amount to change (positive for gain, negative for loss)
 * @param {string} source - Source of the change (default: 'cardEffect')
 */
import { getPlayerResources as getGlobalResources, updatePlayerResources as updateGlobalResources } from './state.js';

function applyResourceChange(player, resourceType, amount, source = 'cardEffect') {
  console.group(`[RESOURCE] applyResourceChange - ${player?.name} (${player?.role})`);
  console.log('Parameters:', { resourceType, amount, source });
  
  if (!player || !resourceType || typeof amount !== 'number' || typeof source !== 'string') {
    const error = `Invalid parameters for applyResourceChange: ${JSON.stringify({ player: !!player, resourceType, amount, source })}`;
    console.error(error);
    console.groupEnd();
    return null;
  }

  if (!RESOURCE_TYPES.includes(resourceType)) {
    console.warn(`Unknown resource type: ${resourceType}`);
    return null;
  }

  console.log(`[RESOURCE] Applying ${amount > 0 ? 'gain' : 'loss'} of ${Math.abs(amount)} ${resourceType} to ${player.name} (${player.role}) from ${source}`);

  // Get current resources from global state
  const currentResources = getGlobalResources(player.id) || player.resources;
  if (!currentResources) {
    const error = `Could not get current resources for player: ${player.id}`;
    console.error(error);
    console.groupEnd();
    return null;
  }
  
  console.log('Current resources before change:', JSON.parse(JSON.stringify(currentResources)));

  // Store the original amount from the card effect
  const originalAmount = amount;
  let adjustedAmount = amount;
  let multiplierApplied = 1;
  let multiplierType = 'none';
  
  console.log(`Processing ${amount > 0 ? 'gain' : 'loss'} of ${Math.abs(amount)} ${resourceType} for ${player.role}`);

  // Apply role-based multipliers
  const isGain = amount > 0;
  
  // First check for loss multipliers (like HISTORIAN's knowledge loss reduction)
  if (!isGain && roleMultipliers.loss?.[player.role]?.[resourceType]) {
    multiplierApplied = roleMultipliers.loss[player.role][resourceType];
    multiplierType = 'loss';
    adjustedAmount = Math.round(amount * multiplierApplied);
    console.log(`[RESOURCE] ${player.name} (${player.role}) loss multiplier ${multiplierApplied}x applied to ${resourceType}`);
  } 
  // Then check for gain multipliers
  else if (isGain && roleMultipliers.gain?.[player.role]?.[resourceType]) {
    multiplierApplied = roleMultipliers.gain[player.role][resourceType];
    multiplierType = 'gain';
    adjustedAmount = Math.round(amount * multiplierApplied);
    console.log(`[RESOURCE] ${player.name} (${player.role}) gain multiplier ${multiplierApplied}x applied to ${resourceType}`);
  } 
  // Default case - no multipliers applied
  else {
    adjustedAmount = Math.round(amount);
  }

  // Store previous value for logging
  const previousValue = currentResources[resourceType] || 0;
  
  // Calculate the final amount after applying multipliers
  const finalAmount = adjustedAmount;
  
  // Calculate new value and ensure it doesn't go below 0
  const newValue = Math.max(0, previousValue + finalAmount);
  
  // Update the player's resources in the global state
  const updatedResources = { ...currentResources, [resourceType]: newValue };
  updateGlobalResources(player.id, updatedResources);
  
  // Also update the local player object for backward compatibility
  if (!player.resources) player.resources = {};
  player.resources[resourceType] = newValue;

  // Create detailed log entry
  const logEntry = {
    timestamp: new Date().toISOString(),
    playerId: player.id,
    playerName: player.name,
    playerRole: player.role,
    resourceType,
    originalAmount: originalAmount,  // Amount from card effect
    finalAmount: adjustedAmount,     // Amount after multipliers
    multiplierApplied: multiplierType !== 'none' ? multiplierApplied : 1,
    multiplierType,
    previousValue,
    newValue: newValue,
    source,
    isGain
  };

  // Add to resource log
  resourceLog.push(logEntry);
  
  // Log the complete transaction with more details
  console.group(`[RESOURCE] ${player.name} (${player.role}) - ${resourceType} Change`);
  console.log('=== TRANSACTION DETAILS ===');
  console.log('Source:', source);
  console.log('Original Amount:', originalAmount);
  console.log('Multiplier Type:', multiplierType);
  console.log('Multiplier Applied:', multiplierApplied);
  if (multiplierType !== 'none') {
    console.log(`Applied ${multiplierType} multiplier: ${multiplierApplied}x`);
  }
  console.log('Final Amount After Multipliers:', adjustedAmount);
  console.log('Previous Value:', previousValue);
  console.log('New Value:', newValue);
  console.log('=== RESOURCE STATE ===');
  console.log('All Resources Before Update:', JSON.parse(JSON.stringify(currentResources)));
  console.log('=== STACK TRACE ===');
  console.trace('Resource change call stack');
  console.groupEnd();

  // Update UI and trigger any event listeners
  if (typeof logEvent === 'function') {
    logEvent(logEntry);
  }
  
  // Log the actual updatePlayerResources call
  const changes = { [resourceType]: adjustedAmount }; // Use adjustedAmount to reflect the actual change
  console.log('Calling updatePlayerResources with:', {
    player: player.name,
    changes: changes,
    source: 'applyResourceChange',
    timestamp: new Date().toISOString()
  });
  
  try {
    // Ensure we pass both required parameters
    updatePlayerResources(player, changes);
    console.log('Successfully updated player resources');
  } catch (error) {
    console.error('Error in updatePlayerResources:', error);
  }
  
  console.log('Final resources after update:', JSON.parse(JSON.stringify(player.resources || {})));
  console.groupEnd();
  
  return logEntry; // Return the log entry for further processing if needed
}

/**
 * Checks if a player can steal from another player based on their roles
 * @param {string} sourceRole - Role of the stealing player
 * @param {string} targetRole - Role of the target player
 * @returns {boolean} True if stealing is allowed, false otherwise
 */
export function canStealFrom(sourceRole, targetRole) {
  const canSteal = !(stealRestrictions[sourceRole]?.includes(targetRole));
  console.log(`[STEAL] ${sourceRole} can${!canSteal ? 'not' : ''} steal from ${targetRole}`);
  return canSteal;
}

/**
 * Gets a list of valid steal targets for a player
 * @param {Object} currentPlayer - The player attempting to steal
 * @param {Array} players - List of all players
 * @param {Object} cardEffect - The card effect being processed
 * @returns {Array} List of valid targets
 */
export function getValidStealTargets(currentPlayer, players, cardEffect) {
  const validTargets = players.filter(p => 
    p.id !== currentPlayer.id &&
    canStealFrom(currentPlayer.role, p.role) &&
    (cardEffect.target === 'ALL' || cardEffect.target === 'OTHER' || p.role.toUpperCase() === cardEffect.target)
  );
  
  console.log(`[STEAL] ${currentPlayer.name} (${currentPlayer.role}) has ${validTargets.length} valid steal targets`);
  validTargets.forEach((target, index) => {
    console.log(`[STEAL] Target ${index + 1}: ${target.name} (${target.role})`);
  });
  
  return validTargets;
}

/**
 * Gets the resistance rate for a player's resource
 * @param {Object} targetPlayer - The target player
 * @param {string} resource - The resource type
 * @returns {number} The resistance multiplier (1 = no resistance)
 */
export function getResistanceRate(targetPlayer, resource) {
  const role = targetPlayer.role.toUpperCase();
  const resist = resistanceRates[role];
  const rate = resist && resist[resource.toLowerCase()] ? resist[resource.toLowerCase()] : 1;
  
  if (rate !== 1) {
    console.log(`[RESISTANCE] ${targetPlayer.name} (${role}) has resistance ${rate} against ${resource} theft`);
  }
  
  return rate;
}
// Full change history log
const resourceLog = [];

// ========== Utility Functions ==========

function isValidResource(resource) {
  return RESOURCE_TYPES.includes(resource);
}

function canStealBetween(fromRole, toRole) {
  return !(
    stealRestrictions[fromRole]?.includes(toRole) ||
    stealRestrictions[toRole]?.includes(fromRole)
  );
}

export function getMultiplier(player, resource, isGain) {
  const role = player.role;
  if (isGain && roleMultipliers.gain[role]?.[resource]) {
    return roleMultipliers.gain[role][resource];
  }
  if (!isGain && roleMultipliers.loss[role]?.[resource]) {
    return roleMultipliers.loss[role][resource];
  }
  return 1;
}

// ========== Core Handlers ==========

/**
 * Log every change with full metadata
 */
export function logChange({ player, resourceType, baseAmount, adjustedAmount, source, actionType }) {
  const entry = {
    playerId: player.id,
    playerName: player.name,
    role: player.role,
    resourceType,
    baseAmount,
    adjustedAmount,
    finalValue: player.resources[resourceType],
    actionType,
    source,
    timestamp: new Date().toISOString()
  };
  resourceLog.push(entry);
  console.log(`[RESOURCE LOG]`, entry);
}
/**
 * Steal resources between two players with restrictions and role adjustments
 */
function stealResource(fromPlayer, toPlayer, resourceType, amount) {
  if (!isValidResource(resourceType)) {
    console.error(`Invalid resource type "${resourceType}" passed to stealResource`);
    return;
  }

  if (!canStealBetween(fromPlayer.role, toPlayer.role)) {
    console.warn(`Stealing blocked between ${fromPlayer.role} and ${toPlayer.role}`);
    return;
  }

  const availableAmount = Math.min(fromPlayer.resources[resourceType], amount);
  if (availableAmount <= 0) {
    console.warn(`No resources available to steal from ${fromPlayer.name}`);
    return;
  }

  applyResourceChange(fromPlayer, resourceType, -availableAmount, `stolenBy:${toPlayer.name}`);
  applyResourceChange(toPlayer, resourceType, availableAmount, `stoleFrom:${fromPlayer.name}`);
}

/**
 * Handles movement effects triggered by cards.
 * This function interprets the card effect and calls the appropriate board functions.
 * Exported for use by cards.js
 * @param {object} player - The player object to move.
 * @param {object} effect - The movement effect details from the card.
 */
export function handleCardMovement(player, effect) {
    console.log('---------handleCardMovement---------');
    console.log(`GAME: Handling card movement for ${player.name}:`, effect);

    if (!player) {
        console.error("handleCardMovement: Invalid player object received.");
        return;
    }

    if (effect.spaces) {
        // Handle moving a specific number of spaces (positive or negative)
        const steps = parseInt(effect.spaces, 10);
        if (isNaN(steps)) {
            console.error(`handleCardMovement: Invalid 'spaces' value: ${effect.spaces}`);
            return;
        }
        console.log(`GAME: Moving ${player.name} ${steps} spaces via card effect.`);
        ensurePlayerPath(player);
        animateTokenToPosition(player, steps, (result) => {
            console.log(`GAME: Card movement (spaces: ${steps}) animation completed for ${player.name}. Reason: ${result.reason}`);
            // No extra action needed here, animateTokenToPosition handles end state.
        });

    } else if (effect.targetSpaceId) {
        // Handle moving to a specific space ID (e.g., 'START', 'FINISH')
        let targetCoords = null;
        const spaceId = effect.targetSpaceId.toUpperCase();
        
        if (spaceId === 'START' && START_SPACE) {
            targetCoords = { x: START_SPACE.coordinates[0][0], y: START_SPACE.coordinates[0][1] };
        } else if (spaceId === 'FINISH' && FINISH_SPACE) {
            targetCoords = { x: FINISH_SPACE.coordinates[0][0], y: FINISH_SPACE.coordinates[0][1] };
        } else {
            console.warn(`handleCardMovement: Unsupported 'targetSpaceId': ${effect.targetSpaceId}`);
            // TODO: Implement lookup for other potential named space IDs if needed
            return; 
        }

        if(targetCoords) {
            console.log(`GAME: Moving ${player.name} directly to ${spaceId} (${targetCoords.x}, ${targetCoords.y}) via card effect.`);
            console.log(`${player.role} moves directly to ${spaceId}!`);
            player.currentCoords = { ...targetCoords }; 
            drawBoard(); // Redraw board
            
            if (spaceId === 'FINISH') {
                console.log(`Player ${player.name} reached FINISH via card effect.`);
                markPlayerFinished(player); // Use existing function
                // Check if game ends after marking finished
                if (allPlayersFinished(getPlayers())) {
                    triggerGameOver();
                    return; // Stop further processing if game over
                }
            }
            updatePlayerInfo(); // Corrected UI update call
        }

    } else if (effect.moveToAge) {
        // Handle moving to the start of a specific Age
        console.log(`GAME: Moving ${player.name} to start of Age: ${effect.moveToAge}`);
        console.log(`${player.role} jumps to ${effect.moveToAge}!`);
        
        // Debug log the actual path names
        console.log("Available path names:", {
            ageOfExpansionPath: ageOfExpansionPath.name,
            ageOfResistancePath: ageOfResistancePath.name,
            ageOfReckoningPath: ageOfReckoningPath.name,
            ageOfLegacyPath: ageOfLegacyPath.name
        });
        
        let targetPath = null;
        // Case-insensitive matching for more robustness
        const ageNameKey = effect.moveToAge;
        if (ageNameKey.includes("expansion")) {
            targetPath = ageOfExpansionPath;
        } else if (ageNameKey.includes("resistance") || ageNameKey.includes("resistence")) {
            targetPath = ageOfResistancePath;
        } else if (ageNameKey.includes("reckoning")) {
            targetPath = ageOfReckoningPath;
        } else if (ageNameKey.includes("legacy")) {
            targetPath = ageOfLegacyPath;
        } else {
            console.error(`handleCardMovement: Unknown Age name in moveToAge: ${effect.moveToAge}`);
            return;
        }
        
        console.log(`Selected targetPath:`, targetPath.name);

        if (targetPath && targetPath.segments && targetPath.segments.length > 0) {
            // Get the coordinates of the very first space in the target path
            const targetCoords = {
                x: targetPath.segments[0].coordinates[0][0],
                y: targetPath.segments[0].coordinates[0][1]
            };
            console.log(` Target coordinates for ${effect.moveToAge}: (${targetCoords.x}, ${targetCoords.y})`);
            player.currentCoords = { ...targetCoords };
            drawBoard(); // Redraw board
            updatePlayerInfo(); // Corrected UI update call
        } else {
            console.error(`handleCardMovement: Could not find path data for Age: ${effect.moveToAge}`);
        }

    } else {
        console.warn("handleCardMovement: Unknown movement effect structure:", effect);
    }
};

// ========== Public Interface ==========

/**
 * Handles any resource change triggered by a card
 */
export function handleCardResourceEffect({
  fromPlayer,
  toPlayer = null,
  resourceType,
  amount,
  source = 'cardEffect'
}) {
  if (!isValidResource(resourceType)) {
    console.error(`Invalid resource type in card effect: ${resourceType}`);
    return;
  }

  if (!fromPlayer || typeof fromPlayer.resources !== 'object') {
    console.error(`Invalid fromPlayer object`, fromPlayer);
    return;
  }

  if (toPlayer) {
    stealResource(fromPlayer, toPlayer, resourceType, amount);
  } else {
    applyResourceChange(fromPlayer, resourceType, amount, source);
  }
}

/**
 * Returns deep copy of the full log
 */
export function getResourceLog() {
  return JSON.parse(JSON.stringify(resourceLog));
}

export function showStealPopover(effect, currentPlayer, allPlayers) {
  const validTargets = getValidStealTargets(currentPlayer, allPlayers, effect);
  const popover = document.createElement('div');
  popover.classList.add('steal-popover');
  
  const title = document.createElement('h3');
  title.textContent = 'Choose a player to steal from:';
  popover.appendChild(title);

  validTargets.forEach(target => {
    const btn = document.createElement('button');
    btn.textContent = `${target.name} (${target.role})`;

    btn.onclick = () => {
      const rate = getResistanceRate(target, effect.resource);
      const isResistant = rate < 1;
      const actualAmount = Math.floor(effect.amount * rate);

      const confirmText = isResistant
        ? `${target.name} is resistant to ${effect.resource}. You'll only steal ${actualAmount} instead of ${effect.amount}. Proceed?`
        : `Steal ${effect.amount} ${effect.resource} from ${target.name}?`;

      if (confirm(confirmText)) {
        applyStealEffect(effect, target, currentPlayer, actualAmount);
        closePopover();
      }
    };

    popover.appendChild(btn);
  });

  document.body.appendChild(popover);
}

function closePopover() {
  const popover = document.querySelector('.steal-popover');
  if (popover) popover.remove();
}

function applyStealEffect(effect, targetPlayer, sourcePlayer, adjustedAmount) {
  console.log(`${sourcePlayer.name} steals ${adjustedAmount} ${effect.resource} from ${targetPlayer.name}`);
  
  // Subtract from target
  targetPlayer.resources[effect.resource.toLowerCase()] -= adjustedAmount;
  // Add to source
  sourcePlayer.resources[effect.resource.toLowerCase()] += adjustedAmount;

  // Log or update UI
  updatePlayerUI(targetPlayer);
  updatePlayerUI(sourcePlayer);
}


export function handleStealFromAll(effect, sourcePlayer, allPlayers) {
  const validTargets = allPlayers.filter(p => 
    p.id !== sourcePlayer.id &&
    canStealFrom(sourcePlayer.role, p.role)
  );

  if (validTargets.length === 0) {
    console.warn('No valid players to steal from.');
    return;
  }

  const confirmMsg = `Steal from ${validTargets.length} players (${validTargets.map(p => p.name).join(', ')}). Proceed?`;
  if (!sourcePlayer.isAI && !confirm(confirmMsg)) {
    return;
  }

  validTargets.forEach(target => {
    const resistance = getResistanceRate(target, effect.resource);
    const adjustedAmount = Math.floor(effect.amount * resistance);
    
    if (adjustedAmount > 0) {
      applyStealEffect(effect, target, sourcePlayer, adjustedAmount);
    } else {
      console.log(`${target.name} resisted the entire ${effect.resource} steal.`);
    }
  });
}


export function applySkipTurn(effect, player) {
  if (!player) {
    console.warn('applySkipTurn: No player provided.');
    return;
  }

  player.skipNextTurn = true;

  console.log(`${player.name}'s next turn will be skipped.`);
  
  // Optionally update UI or log
  if (typeof updatePlayerStatus === 'function') {
    updatePlayerStatus(player, 'SKIPPED');
  }
}
