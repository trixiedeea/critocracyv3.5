// resourceManagement.js


import { 
  getPlayers, 
  updatePlayerResources,
} from './players.js';

import { 
  triggerGameOver,
  processEndPlayerTurn,
} from './game.js';

import {
  updateGameState,
  getCurrentPlayer,
  isActionAllowed
} from './state.js';

import { 
  ensurePlayerPath,
  animateTokenToPosition
} from './animations.js';

import { 
    processCardEffects,
    processAgeCardEffects
} from './cards.js';

import {
    drawBoard,
    scaleCoordinates
} from './board.js';

import { 
    fullDeckRegionPathMap, 
    ageOfExpansionPath, 
    ageOfResistancePath, 
    ageOfReckoningPath, 
    ageOfLegacyPath 
} from './board-data.js';

import { updatePlayerInfo } from './ui.js';

// ========== //constants ==========

const RESOURCE_TYPES = ['money', 'knowledge', 'influence'];

const pathKey = {
    ageOfExpansionPath: fullDeckRegionPathMap.ageOfExpansion.pathKey,
    ageOfResistancePath: fullDeckRegionPathMap.ageOfResistance.pathKey,
    ageOfReckoningPath: fullDeckRegionPathMap.ageOfReckoning.pathKey,
    ageOfLegacyPath: fullDeckRegionPathMap.ageOfLegacy.pathKey,
};

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

function isValidResource(resource) {
  return RESOURCE_TYPES.includes(resource);
}

// Helper function to get multiplier for a resource
// Takes into account player role and resource type
export async function getMultiplier(resource, isGain) {
  console.log('=============getMultiplier=============');
  const player = getCurrentPlayer();
  if (!player?.role) {
    console.warn(`getMultiplier: No current player or role for ${resource} (${isGain ? 'gain' : 'loss'})`);
    return 1;
  }
  
  const role = player.role;
  if (!role) {
    console.warn(`getMultiplier: Unknown role ${player.role} for player ${player.name}`);
    return 1;
  }
  
  const multiplier = isGain 
    ? (roleMultipliers.gain[role]?.[resource] || 1)
    : (roleMultipliers.loss[role]?.[resource] || 1);
    
  console.log(`[MULTIPLIER] ${player.name}'s ${isGain ? 'gain' : 'loss'} multiplier for ${resource}: ${multiplier}x (${player.role})`);
  console.log('=============getMultiplier END=============');
  return multiplier;
}

/**
 * Gets the resistance rate for a player's resource
 * @param {Object} targetPlayer - The target player
 * @param {string} resource - The resource type
 * @returns {number} The resistance multiplier (1 = no resistance)
 */
export async function getResistanceRate(targetPlayer, resource) {
  //console.log('=============getResistanceRate=============');
  
  if (!targetPlayer?.role) {
    console.warn(`getResistanceRate: No target player or role for ${resource}`);
    return 1;
  }
  
  const role = targetPlayer.role.toUpperCase();
  const resourceLower = resource.toLowerCase();
  
  const resistance = resistanceRates[role]?.[resourceLower] || 1;
  
  console.log(`[RESISTANCE] ${targetPlayer.name}'s resistance to ${resource} loss: ${resistance}x (${targetPlayer.role})`);
  console.log('=============getResistanceRate END=============');
  return resistance;
}

/**
 * Applies the effects listed on the current card to the target player(s).
 * Called for regular cards. Calls processEndPlayerTurn when complete.
 * @param {Object} card - The card to apply effects from

 */
export function applyCardEffect(card) {
  updateGameState({ currentPhase: 'PLAYING' });
  if (!isActionAllowed('AWAITING_PATH_CHOICE', 'ROLLING', 'TURN_TRANSITION')) return;
  console.log('=============applyCardEffect=============');
  console.log('Full card object received:', JSON.stringify(card, null, 2));

  const player = getCurrentPlayer();

  if (!player) {
    console.error('No current player found');
    return;
}
    
  if (!card || !player) {
      console.warn(`Cannot apply effects of card "${card.name}" to player ${player.name} card or player is undefined`);
      return;
  }

  console.log(`Applying effects of card "${card.name}" to player ${player.name}...`);
  
  // Handle different effect formats
  if (!card.effects) {
      console.error(`Card "${card.name}" has no effects property.`);
      return;
  }
  
  // Case 1: Effects organized by role (object with role keys)
  if (typeof card.effects === 'object' && !Array.isArray(card.effects)) {
    console.log(`Card "${card.name}" has role-based effects structure.`);
    
    // REPLACE THIS ENTIRE SECTION WITH OPTION 2:
    // Try different case formats to match card data
    const rolesToTry = [
        player.role.toUpperCase(),           // HISTORIAN
        player.role.charAt(0).toUpperCase() + player.role.slice(1).toLowerCase(), // Historian
        player.role.toLowerCase()            // historian
    ];
    
    let roleEffects = null;
    let matchedRole = null;
    
    for (const roleFormat of rolesToTry) {
        if (card.effects[roleFormat]) {
            roleEffects = card.effects[roleFormat];
            matchedRole = roleFormat;
            break;
        }
    }
    
    if (roleEffects) {
        console.log(`Applying ${player.role}-specific effects (matched as "${matchedRole}"):`, roleEffects);
        
        // Process the effect
        if (Array.isArray(roleEffects)) {
            roleEffects.forEach(effect => processCardEffects(effect, player));
        } else if (typeof roleEffects === 'object') {
            processCardEffects(roleEffects, player, player);
        }
    } else {
        console.warn(`No effects found for role "${player.role}" on card "${card.name}"`);
        console.log('Available roles:', Object.keys(card.effects));
        
        // Check if there's a generic "ALL" key for effects that apply to all roles
        if (card.effects.ALL) {
            const allEffects = card.effects.ALL;
            if (Array.isArray(allEffects)) {
                allEffects.forEach(effect => processCardEffects(effect, player));
            } else {
                processCardEffects(allEffects, player);
            }
        }
    }
    updateGameState({
        currentPhase: 'PLAYING',
    });
    console.warn('game phase updated to PLAYING');
      // Call processEndPlayerTurn after applying effects
      console.log('=============applyCardEffect END=============');
      processEndPlayerTurn();
      return;
  }
  
  // Case 2: Effects as an array (original format)
  if (Array.isArray(card.effects)) {
      card.effects.forEach(effect => processCardEffects(effect, player));
      
      // Call processEndPlayerTurn after applying effects
      console.log('=============applyCardEffect END=============');
      processEndPlayerTurn();
      return;
  }
  
  // If we get here, the effects property has an unexpected format
  console.log(`Card "${card.name}" effects has an unexpected format:`, card.effects);
  
  // Call processEndPlayerTurn even if effects format is unexpected
  console.log('=============applyCardEffect END=============');
  processEndPlayerTurn();
};

export async function applyAgeCardEffect(card, optionName = null, playerId) {
  if (!isActionAllowed('AWAITING_PATH_CHOICE', 'ROLLING', 'TURN_TRANSITION')) return;
  updateGameState({ currentPhase: 'PLAYING' });
  console.log('=============applyAgeCardEffect=============')
  console.log('Card:', card.name);
  console.log('Option:', optionName);
  
  const player = getCurrentPlayer(playerId);
  if (!player) {
    console.error('No current player found');
    return;
  }
  
  let effects;
  
  if (optionName) {
    effects = card.choice?.[optionName]?.effects;
    if (!effects || !Array.isArray(effects)) {
      console.warn(`No effects array found for option ${optionName}:`, card.choice?.[optionName]);
      console.log('=============applyAgeCardEffect END=============')
      await processAgeCardEffects(card, []);
      return;
    }
  } else {
    effects = card.effects;
    if (!effects || !Array.isArray(effects)) {
      console.warn('No effects array found on card:', card);
      console.log('=============applyAgeCardEffect END=============')
      await processAgeCardEffects(card, []);
      return;
    }
  }
  
  console.log(`Starting sequential processing of ${effects.length} effects`);
  
  // Process all effects sequentially with proper async/await chains
  for (const effect of effects) {
    try {
      console.log('Processing effect:', effect);
      
      // Handle different effect types with proper async chains
      switch (effect.type) {
        case 'RESOURCE_CHANGE': {
          const player = getCurrentPlayer(playerId);
          if (!player) {
            console.error('No current player found during RESOURCE_CHANGE');
            break;
          }
        
          if (effect.changes && typeof effect.changes === 'object') {
            for (const [resourceType, amount] of Object.entries(effect.changes)) {
              if (typeof amount === 'number') {
                await applyResourceChange(resourceType, amount, 'cardEffect', player.id);
              }
            }
          } else if (effect.resource && typeof effect.amount === 'number') {
            await applyResourceChange(effect.resource, effect.amount, 'cardEffect', player.id);
          } else {
            console.warn('Invalid RESOURCE_CHANGE effect:', effect);
          }
          break;
      }
        case 'MOVEMENT':
        case 'MOVE_TO':
          await handleCardMovement(effect);
          break;
          
        case 'SKIP_TURN':
          // Handle both old format (effect.turns) and age card format (effect.target)
          const skipEffect = {
            turns: effect.turns || 1, // Default to 1 turn if not specified
            target: effect.target || 'SELF'
          };
          await applySkipTurn(skipEffect, player);
          break;
          
        case 'STEAL':
          // Normalize age card STEAL effect format to work with existing functions
          const normalizedStealEffect = {
            type: 'STEAL',
            resource: effect.resource ? effect.resource.toLowerCase() : 'money', // Convert MONEY → money
            amount: effect.amount || 1,
            target: effect.target || 'OTHER'
          };
          // Start proper steal chain: applyStealEffect → getValidStealTargets → showStealPopover → handleStealEffect
          await applyStealEffect(normalizedStealEffect, player);
          break;

        case 'STEAL_FROM_ALL':
          await handleStealFromAll(effect, player, getPlayers());
          break;
          
        default:
          // For any other effect type, use processCardEffects
          await processCardEffects(effect, player);
      }
    } catch (error) {
      console.error('Error processing effect:', effect, error);
    }
  }

  console.log('All effects completed - calling processAgeCardEffects');
  // Validate and finalize all effects
  await processAgeCardEffects(card, effects);
}

export async function applyResourceChange(resourceType, amount, source, playerId) {
  console.log('=============applyResourceChange=============')
  
  const player = getCurrentPlayer(playerId);
  if (!player) {
    console.error('applyResourceChange: No current player found');
    return null;
  }
  
  console.log(`[RESOURCE] Starting chain: applyResourceChange → getMultiplier → getResistanceRate → handleCardResourceEffect`);
  console.log('Parameters:', { resourceType, amount, source });

  if (!resourceType || typeof amount !== 'number' || typeof source !== 'string') {
    console.error(`Invalid parameters for applyResourceChange:`, { resourceType, amount, source });
    return null;
  }

  if (!RESOURCE_TYPES.includes(resourceType)) {
    console.warn(`Unknown resource type: ${resourceType}`);
    return null;
  }

  // Get current resources for logging (before changes)
  const currentResources = player.resources || {};
  const previousValue = currentResources[resourceType] || 0;

  // Step 1: Get multiplier (this calls getMultiplier)
  const isGain = amount > 0;
  const multiplier = await getMultiplier(resourceType, isGain);
  
  // Step 2: Get resistance rate (this calls getResistanceRate) 
  const resistance = await getResistanceRate(player, resourceType);
  
  // Step 3: Apply both multiplier and resistance
  let adjustedAmount = amount;
  if (isGain) {
    adjustedAmount = Math.round(amount * multiplier);
  } else {
    adjustedAmount = Math.round(amount * resistance);
  }
  
  // Step 4: Call handleCardResourceEffect to finalize the change
  await handleCardResourceEffect({
    fromPlayer: player,
    toPlayer: null,
    resourceType: resourceType,
    amount: adjustedAmount,
    source: source
  });
  
  // Get updated resources after the change
  const updatedResources = player.resources || {};
  const newValue = updatedResources[resourceType] || 0;
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    playerId: player.id,
    playerName: player.name,
    playerRole: player.role,
    resourceType,
    originalAmount: amount,
    finalAmount: adjustedAmount,
    multiplierApplied: multiplier,
    multiplierType: isGain ? 'gain' : 'resistance',
    previousValue,
    newValue,
    source,
    isGain
  };

  resourceLog.push(logEntry);

  console.group(`[RESOURCE] ${player.name} (${player.role}) - ${resourceType} Change`);
  console.log('=== TRANSACTION DETAILS ===');
  console.log('Source:', source);
  console.log('Original Amount:', amount);
  console.log('Multiplier Type:', isGain ? 'gain' : 'resistance');
  console.log('Multiplier Applied:', multiplier);
  if (multiplier !== 1) {
    console.log(`Applied ${isGain ? 'gain' : 'resistance'} multiplier: ${multiplier}x`);
  }
  console.log('Final Amount After Multipliers:', adjustedAmount);
  console.log('Previous Value:', previousValue);
  console.log('New Value:', newValue);
  console.log('=== RESOURCE STATE ===');
  console.log('All Resources After Update:', JSON.parse(JSON.stringify(updatedResources)));
  console.groupEnd();

  if (typeof logEvent === 'function') {
    logEvent(logEntry);
  }

  console.log(`[RESOURCE] Chain completed: ${player.name} ${isGain ? 'gained' : 'lost'} ${Math.abs(adjustedAmount)} ${resourceType}`);
  console.log('=============applyResourceChange END=============');

  return logEntry;
}

/**
 * Gets a list of valid steal targets for a player
 * @param {Object} currentPlayer - The player attempting to steal
 * @param {Array} players - List of all players
 * @param {Object} cardEffect - The card effect being processed
 * @returns {Array} List of valid targets
 */
export function getValidStealTargets(currentPlayer, players, cardEffect) {
  console.log('=============getValidStealTargets=============');
  
  const validTargets = players.filter(p => {
    // Can't steal from self
    if (p.id === currentPlayer.id) return false;
    
    // Check if target's role is restricted from being stolen from by current player's role
    const currentRole = currentPlayer.role?.toUpperCase();
    const targetRole = p.role?.toUpperCase();
    
    if (!currentRole || !targetRole) {
      console.warn(`[STEAL] Invalid roles - current: ${currentRole}, target: ${targetRole}`);
      return false;
    }
    
    // Check if target's role is in the current role's restricted roles
    const restrictedRoles = stealRestrictions[currentRole] || [];
    const isRestricted = restrictedRoles.includes(targetRole);
    
    if (isRestricted) {
      console.log(`[STEAL] ${currentRole} cannot steal from ${targetRole} due to role restrictions`);
      return false;
    }
    
    // Check if target matches the card's target filter
    const matchesTargetFilter = 
      cardEffect.target === 'ALL' || 
      cardEffect.target === 'OTHER' || 
      p.role.toUpperCase() === cardEffect.target.toUpperCase();
      
    return matchesTargetFilter;
  });
  
  console.log(`[STEAL] ${currentPlayer.name} (${currentPlayer.role}) has ${validTargets.length} valid steal targets`);
  validTargets.forEach((target, index) => {
    console.log(`[STEAL] Target ${index + 1}: ${target.name} (${target.role})`);
  });
  
  return validTargets;
}

// Full change history log
const resourceLog = [];

/**
 * Log every change with full metadata
 */
export function logChange({ resourceType, baseAmount, adjustedAmount, source, actionType }) {
  console.log('=============logChange=============');
  const player = getCurrentPlayer();
  if (!player) {
    console.error('logChange: No current player found');
    return;
  }

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
 * Handles movement effects triggered by cards.
 * This function interprets the card effect and calls the appropriate board functions.
 * Exported for use by cards.js
 * @param {object} player - The player object to move.
 * @param {object} effect - The movement effect details from the card.
 * @returns {Promise} Resolves when movement is complete
 */
export async function handleCardMovement(effect) {
  console.log('=============handleCardMovement=============')
  
  const player = getCurrentPlayer();
  if (!player) {
      console.error("handleCardMovement: No current player found.");
      return Promise.reject("No current player");
  }
  
  console.log(`GAME: Handling card movement for ${player.name}:`, effect);
  
  // Set flag to prevent Age of card draws when moved by a card
  updateGameState({
    preventCardDraw: true
  });

  try {
    if (effect.spaces) {
      // Handle moving a specific number of spaces (positive or negative)
      const steps = parseInt(effect.spaces, 10);
      if (isNaN(steps)) {
        console.error(`handleCardMovement: Invalid 'spaces' value: ${effect.spaces}`);
        return;
      }

      console.log(`GAME: Moving ${player.name} ${steps} spaces via card effect.`);
      ensurePlayerPath(player);

      // Check if moving backward past start - if so, clamp to start and ignore choicepoints
      if (steps < 0) {
        const paths = [ageOfExpansionPath, ageOfResistancePath, ageOfReckoningPath, ageOfLegacyPath];
        const currentPath = paths.find(p => p.pathName === player.currentPath);
        if (currentPath && currentPath.segments?.length > 0) {
          const startSegment = currentPath.segments[0];
          if (startSegment?.coordinates?.[0]) {
            const startCoords = {
              x: startSegment.coordinates[0][0],
              y: startSegment.coordinates[0][1]
            };
            console.log(`Moving back to start at:`, startCoords);
            player.currentCoords = { ...startCoords };
            drawBoard();
            return;
          }
        }
      }

      // For forward movement
      updateGameState({
        currentPhase: 'MOVING'
      });
      console.log(`Moving ${steps} spaces for ${player.name}`);

      const token = document.querySelector(`[data-player-id="${player.id}"]`);
      if (!token) {
        console.warn("Token not found for player:", player);
        return;
      }

      const paths = [ageOfExpansionPath, ageOfResistancePath, ageOfReckoningPath, ageOfLegacyPath];
      let pathData = paths.find(path => path.pathName === player.currentPath);

      if (!pathData || !pathData.segments) {
        console.warn("No path data found for player's current path.");
        return;
      }

      let remainingSteps = steps;
      let currentCoord = { ...player.currentCoords };
      const duration = 1000;

      const findSegmentByCoord = (coord, targetPathData = pathData) => {
        return targetPathData.segments.find(segment => {
          const segCoord = segment.coordinates?.[0];
          return segCoord?.[0] === coord.x && segCoord?.[1] === coord.y;
        });
      };

      // Function to search for a coordinate across all paths with tolerance
      const findPathByChosenCoord = (chosenCoord, tolerance = 5) => {
        console.log('=============--------findPathByChosenCoord=============--------');
        for (const path of paths) {
          for (const segment of path.segments) {
            const segCoord = segment.coordinates?.[0];
            if (segCoord) {
              const dx = Math.abs(segCoord[0] - chosenCoord.x);
              const dy = Math.abs(segCoord[1] - chosenCoord.y);
              if (dx <= tolerance && dy <= tolerance) {
                console.log(`Found matching coords in path ${path.pathName} with tolerance ${tolerance}`);
                return { path, segment, exactCoord: { x: segCoord[0], y: segCoord[1] } };
              }
            }
          }
        }
        console.warn("No path found for chosen coordinates:", chosenCoord);
        return null;
      };

      const animatePosition = (element, start, end, duration = 1000) => {
        return new Promise(resolve => {
          const startTime = performance.now();

          const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const eased = progress < 0.5
              ? 4 * progress * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            const currentX = start.x + (end.x - start.x) * eased;
            const currentY = start.y + (end.y - start.y) * eased;

            const [scaledX, scaledY] = scaleCoordinates(currentX, currentY);
            element.style.transform = `translate(${scaledX}px, ${scaledY}px)`;

            if (progress < 1) {
              requestAnimationFrame(update);
            } else {
              resolve();
            }
          };

          requestAnimationFrame(update);
        });
      };

      const animateNextSegment = async () => {
        if (remainingSteps <= 0) {
          // Movement complete
          token.classList.remove('enlarged');
          token.classList.add('normal');
          console.log(`GAME: Card movement (${steps} spaces) completed for ${player.name}`);
          return;
        }

        const segment = findSegmentByCoord(currentCoord);
        if (!segment || !segment.Next || segment.Next.length === 0) {
          console.warn("Invalid or incomplete segment found at", currentCoord);
          return;
        }

        // Check if this is a choicepoint (multiple Next coordinates)
        if (segment.Next.length > 1) {
          // Store interrupted move data
          state.interruptedMove = {
            remainingSteps,
            duration
          };

          // Ensure game state is set to wait for choice
          updateGameState({
            pendingActionData: {
              choiceOptions: segment.Next
            }
          });

          // Prepare path names for the choice point
          let pathNames = [];
          if (Array.isArray(segment.pathNames) && segment.pathNames[0]) {
            pathNames = segment.pathNames[0].split(',').map(name => name.trim());
          }

          const options = segment.Next.map((coords, index) => ({
            coords,
            pathName: pathNames[index] || 'UNKNOWN_PATH'
          }));

          return new Promise(resolve => {
            promptForChoicepoint(options, (chosenOption) => {
              // Search for the chosen coordinates across all paths
              const match = findPathByChosenCoord({ x: chosenOption.coords[0], y: chosenOption.coords[1] });
              if (match) {
                player.currentPath = match.path.pathName;
                player.currentCoords = match.exactCoord;
                currentCoord = { ...match.exactCoord };
                pathData = match.path; // Update pathData to the new path
              } else {
                console.warn("Could not match chosen coords exactly, using provided coords:", chosenOption.coords);
                player.currentCoords = { x: chosenOption.coords[0], y: chosenOption.coords[1] };
                currentCoord = { ...player.currentCoords };
              }

              remainingSteps--;
              updateGameState({ remainingSteps });

              // Clear the interrupted move data
              delete state.interruptedMove;
              updateGameState({
                currentPhase: 'MOVING',
                pendingActionData: null
              });

              // Continue movement
              animateNextSegment().then(resolve);
            });
          });
        }

        // Regular movement (single Next coordinate)
        const nextCoord = {
          x: segment.Next[0][0],
          y: segment.Next[0][1]
        };

        // Count step as we leave the currentCoord
        remainingSteps--;
        updateGameState({ remainingSteps });

        // Animate visual movement
        await animatePosition(token, currentCoord, nextCoord, duration);

        // Update to exact coordinates from the path segment
        const nextSegment = findSegmentByCoord(nextCoord);
        if (nextSegment) {
          const exactCoord = nextSegment.coordinates[0];
          player.currentCoords = { x: exactCoord[0], y: exactCoord[1] };
          currentCoord = { ...player.currentCoords };
        } else {
          player.currentCoords = nextCoord;
          currentCoord = nextCoord;
        }

        await animateNextSegment();
      };

      token.classList.add('animating-token', 'enlarged');
      token.classList.remove('normal');

      await animateNextSegment();

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
        return;
      }

      if (targetCoords) {
        console.log(`GAME: Moving ${player.name} directly to ${spaceId} (${targetCoords.x}, ${targetCoords.y})`);
        player.currentCoords = { ...targetCoords };
        drawBoard();

        if (spaceId === 'FINISH') {
          console.log(`Player ${player.name} reached FINISH via card effect.`);
          markPlayerFinished(player);
          if (allPlayersFinished(getPlayers())) {
            triggerGameOver();
          }
        }
      }

    } else if (effect.moveToAge) {
      // Handle moving to the start of a specific Age
      console.log(`GAME: Moving ${player.name} to start of Age: ${effect.moveToAge}`);

      let targetPath = null;
      const pathKey = effect.moveToAge.toLowerCase();

      if (pathKey.includes("expansion")) {
        targetPath = ageOfExpansionPath;
      } else if (pathKey.includes("resistance") || pathKey.includes("resistence")) {
        targetPath = ageOfResistancePath;
      } else if (pathKey.includes("reckoning")) {
        targetPath = ageOfReckoningPath;
      } else if (pathKey.includes("legacy")) {
        targetPath = ageOfLegacyPath;
      }

      if (targetPath?.segments?.[0]?.coordinates?.[0]) {
        const targetCoords = {
          x: targetPath.segments[0].coordinates[0][0],
          y: targetPath.segments[0].coordinates[0][1]
        };
        console.log(`Moving to ${effect.moveToAge} at:`, targetCoords);

        // Update player's path and position
        player.currentPath = targetPath.pathName;
        player.currentCoords = { ...targetCoords };

        drawBoard();
      } else {
        console.error(`Could not find path data for Age: ${effect.moveToAge}`);
      }

    } else {
      console.warn("handleCardMovement: Unknown movement effect structure:", effect);
    }

  } catch (error) {
    console.error('Error in handleCardMovement:', error);
  }
}
// ========== Public Interface ==========

/**
 * Handles any resource change triggered by a card
 */
export async function handleCardResourceEffect({
  fromPlayer,
  toPlayer = null,
  resourceType,
  amount,
  source = 'cardEffect'
}) {
  console.log('=============handleCardResourceEffect=============');
  if (!isValidResource(resourceType)) {
    console.error(`Invalid resource type in card effect: ${resourceType}`);
    return;
  }

  if (toPlayer) {
    // This is a steal - subtract from fromPlayer, add to toPlayer
    console.log(`Transferring ${amount} ${resourceType} from ${fromPlayer.name} to ${toPlayer.name}`);
    
    // Subtract from source (with resistance applied)
    const resistance = getResistanceRate(fromPlayer, resourceType);
    const actualLoss = Math.floor(amount * resistance);
    
    // Update fromPlayer resources directly
    if (!fromPlayer.resources) fromPlayer.resources = {};
    fromPlayer.resources[resourceType] = (fromPlayer.resources[resourceType] || 0) - actualLoss;
    
    // Add to target (with multipliers applied)
    const multiplier = getMultiplier(resourceType, true); // true for gain
    const actualGain = Math.floor(amount * multiplier);
    
    if (!toPlayer.resources) toPlayer.resources = {};
    toPlayer.resources[resourceType] = (toPlayer.resources[resourceType] || 0) + actualGain;
    
    // Update UI for both players
    updatePlayerResources(fromPlayer.id, fromPlayer.resources);
    updatePlayerResources(toPlayer.id, toPlayer.resources);
    
    console.log(`Transfer complete: ${fromPlayer.name} lost ${actualLoss}, ${toPlayer.name} gained ${actualGain}`);
  } else {
    // This is a regular resource change - update resources and call processAgeCardEffects for validation
    const newResources = { ...fromPlayer.resources };
    newResources[resourceType] = (newResources[resourceType] || 0) + amount;
    
    try {
      updatePlayerResources(fromPlayer.id, newResources);
      console.log('Successfully updated player resources');
      
      // Call processAgeCardEffects for validation
      const currentCard = window.currentCard; // Assuming this is available globally
      if (currentCard) {
        await processAgeCardEffects(currentCard, []);
      }
    } catch (error) {
      console.error('Error in updatePlayerResources or processAgeCardEffects:', error);
    }
  }
}

/**
 * Returns deep copy of the full log
 */
export function getResourceLog() {
  console.log('=============getResourceLog=============');
  return JSON.parse(JSON.stringify(resourceLog));
}

export async function showStealPopover(effect, currentPlayer, validTargets, delayMs = 5000) {
  console.log('=============showStealPopover=============');
  
  return new Promise((resolve) => {
    // Use existing HTML popover for both human and AI players
    const popover = document.getElementById('steal-Popover');
    const optionsContainer = document.getElementById('player-Choice-Options');
    
    if (!popover || !optionsContainer) {
      console.error('Steal popover elements not found in DOM');
      resolve();
      return;
    }
    
    // Clear existing buttons
    optionsContainer.innerHTML = '';
    
    // Create button for each valid target
    validTargets.forEach(target => {
      const button = document.createElement('button');
      button.className = 'steal-target-button';
      
      // Add player name text
      const nameText = document.createElement('span');
      nameText.textContent = target.name;
      nameText.className = 'player-name-text';
      
      button.appendChild(nameText);
      
      // Add click listener that calls handleStealEffect
      button.onclick = async () => {
        const rate = await getResistanceRate(target, effect.resource);
        const isResistant = rate < 1;
        const actualAmount = Math.floor(effect.amount * rate);
        
        const confirmText = isResistant
          ? `${target.name} is resistant to ${effect.resource}. You'll only steal ${actualAmount} instead of ${effect.amount}. Proceed?`
          : `Steal ${effect.amount} ${effect.resource} from ${target.name}?`;
        
        if (confirm(confirmText)) {
          popover.close();
          await handleStealEffect(effect, target, currentPlayer, actualAmount);
          resolve();
        }
      };
      
      optionsContainer.appendChild(button);
    });
    
    // Show the popover
    popover.showModal();
    
    // If current player is human, wait for user interaction
    if (currentPlayer.isHuman) {
      return;
    }
    
    // AI player logic - auto-choose a target after delay with animation
    setTimeout(async () => {
      const randomIndex = Math.floor(Math.random() * validTargets.length);
      const targetButton = optionsContainer.children[randomIndex];
      
      if (targetButton) {
        // Apply CSS animation to the selected button
        targetButton.style.transition = 'transform 0.1s ease-in-out';
        
        // Animation sequence: 1.0 -> 0.9 -> 0.8 -> 0.9 -> 1.0 over 1.5 seconds
        setTimeout(() => {
          targetButton.style.transform = 'scale(0.9)';
        }, 100);
        
        setTimeout(() => {
          targetButton.style.transform = 'scale(0.8)';
        }, 200);
        
        setTimeout(() => {
          targetButton.style.transform = 'scale(0.9)';
        }, 300);
        
        setTimeout(() => {
          targetButton.style.transform = 'scale(1.0)';
        }, 400);
        
        // Wait 0.5 seconds after animation completes, then execute
        setTimeout(async () => {
          const target = validTargets[randomIndex];
          const rate = await getResistanceRate(target, effect.resource);
          const actualAmount = Math.floor(effect.amount * rate);
          
          popover.close();
          await handleStealEffect(effect, target, currentPlayer, actualAmount);
          resolve();
        }, 900); // Total: 500ms delay + 400ms animation + 500ms after = 1400ms
      }
    }, delayMs + 500); // 0.5 seconds before animation starts
  });
}

export async function applyStealEffect(effect, sourcePlayer) {
  console.log('=============applyStealEffect=============');
  console.log(`Starting steal chain: applyStealEffect → getValidStealTargets → showStealPopover → handleStealEffect`);
  
  try {
    // Step 1: Get valid steal targets
    const allPlayers = getPlayers();
    const validTargets = getValidStealTargets(sourcePlayer, allPlayers, effect);
    
    if (validTargets.length === 0) {
      console.warn('No valid steal targets found');
      return;
    }
    
    // Step 2: Show steal popover (this will call handleStealEffect when user clicks)
    await showStealPopover(effect, sourcePlayer, validTargets);
    
  } catch (error) {
    console.error('Error in applyStealEffect:', error);
  }
  
  console.log('=============applyStealEffect END=============');
}

// This function actually performs the resource transfer (called after user selects target)
export async function handleStealEffect(effect, targetPlayer, sourcePlayer, adjustedAmount) {
  console.log('=============handleStealEffect=============');
  console.log(`${sourcePlayer.name} steals ${adjustedAmount} ${effect.resource} from ${targetPlayer.name}`);
  
  try {
    const resourceType = effect.resource.toLowerCase();
    
    // Validate that target has enough resources
    const targetResources = targetPlayer.resources || {};
    const availableAmount = targetResources[resourceType] || 0;
    
    const actualAmount = Math.min(adjustedAmount, availableAmount);
    
    if (actualAmount <= 0) {
      console.warn(`Target ${targetPlayer.name} has no ${effect.resource} to steal`);
      return;
    }
    
    // Use handleCardResourceEffect to properly apply the steal with multipliers and resistance
    await handleCardResourceEffect({
      fromPlayer: targetPlayer,
      toPlayer: sourcePlayer,
      resourceType: resourceType,
      amount: actualAmount,
      source: 'steal'
    });
    
    console.log(`Steal completed: ${sourcePlayer.name} gained ${actualAmount} ${effect.resource} from ${targetPlayer.name}`);
    
  } catch (error) {
    console.error('Error in handleStealEffect:', error);
  }
  
  console.log('=============handleStealEffect END=============');
}

export async function handleStealFromAll(effect, sourcePlayer, allPlayers) {
  console.log('=============handleStealFromAll=============');
  const validTargets = getValidStealTargets(sourcePlayer, allPlayers, effect);

  if (validTargets.length === 0) {
    console.warn('No valid players to steal from.');
    return;
  }

  const confirmMsg = `Steal from ${validTargets.length} players (${validTargets.map(p => p.name).join(', ')}). Proceed?`;
  if (!sourcePlayer.isAI && !confirm(confirmMsg)) {
    return;
  }

  // Process each target sequentially to avoid resource conflicts
  for (const target of validTargets) {
    const resistance = await getResistanceRate(target, effect.resource);
    const adjustedAmount = Math.floor(effect.amount * resistance);
    
    if (adjustedAmount > 0) {
      await handleStealEffect(effect, target, sourcePlayer, adjustedAmount);
    } else {
      console.log(`${target.name} resisted the entire ${effect.resource} steal.`);
    }
  }
  }

/**
 * Applies a skip turn effect to a player
 * @param {Object} effect - The skip turn effect
 * @param {Object} player - The player to skip
 * @returns {Promise} Resolves when the skip turn is processed
 */
export async function applySkipTurn(effect, player) {
  console.log('=============applySkipTurn=============')
  
  return new Promise((resolve) => {
    try {
      if (!player) {
        console.warn('applySkipTurn: No player provided.');
        resolve();
        return;
      }

      // Apply the skip turn effect
      const skipTurns = effect.turns || 1;
      player.skipTurns = (player.skipTurns || 0) + skipTurns;

      console.log(`[SKIP TURN] ${player.name} will skip ${skipTurns} turn(s). Total skips: ${player.skipTurns}`);
      
      // Update UI if the updatePlayerStatus function exists
      if (typeof updatePlayerStatus === 'function') {
        updatePlayerStatus(player, `SKIPPED (${skipTurns} turn${skipTurns > 1 ? 's' : ''})`);
      }

      // Resolve after a short delay to allow UI updates
      setTimeout(() => {
        resolve({
          success: true,
          playerId: player.id,
          playerName: player?.name,
          turnsSkipped: skipTurns,
          totalSkips: player.skipTurns
        });
      }, 500);
      
    } catch (error) {
      console.error('Error in applySkipTurn:', error);
      resolve({
        success: false,
        error: error.message,
        playerId: player?.id,
        playerName: player?.name
      });
    }
  });
}
