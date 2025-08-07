// resourceManagement.js


import { 
  getPlayers, 
  getPlayerById,
  updatePlayerResources,
} from './players.js';

import { 
  triggerGameOver,
  processEndPlayerTurn,
} from './game.js';

import {
  updateGameState,
  getCurrentPlayer,
  isActionAllowed,
  state
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
  //console.log('=============getMultiplier=============');
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
    
  //console.log(`[MULTIPLIER] ${player.name}'s ${isGain ? 'gain' : 'loss'} multiplier for ${resource}: ${multiplier}x (${player.role})`);
  //console.log('=============getMultiplier END=============');
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
  
  //console.log(`[RESISTANCE] ${targetPlayer.name}'s resistance to ${resource} loss: ${resistance}x (${targetPlayer.role})`);
  console.log('=============getResistanceRate END=============');
  return resistance;
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
      //console.log(`[STEAL] ${currentRole} cannot steal from ${targetRole} due to role restrictions`);
      return false;
    }
    
    // Check if target matches the card's target filter
    const targetFilter = cardEffect?.target;
    const matchesTargetFilter = 
      !targetFilter || // If no target filter, allow all
      targetFilter === 'ALL' || 
      targetFilter === 'OTHER' || 
      (targetFilter && p.role && p.role.toUpperCase() === targetFilter.toUpperCase());
      
    return matchesTargetFilter;
  });
  
  //console.log(`[STEAL] ${currentPlayer.name} (${currentPlayer.role}) has ${validTargets.length} valid steal targets`);
  validTargets.forEach((target, index) => {
    //console.log(`[STEAL] Target ${index + 1}: ${target.name} (${target.role})`);
  });
  
  return validTargets;
}

// Full change history log
const resourceLog = [];

/**
 * Updates the resource displays based on the current game state
 * @param {Object} gameState - The current game state (optional, will use global state if not provided)
 */
export function updateResourceDisplays(gameState = state) {
    console.log('=============updateResourceDisplays=============');
    
    const players = gameState.players || [];
    const currentPlayerIndex = gameState.currentPlayerIndex || 0;
    
    if (!players.length) {
        console.warn('No players found in game state');
        return;
    }

    // Get the display containers from the HTML
    const resourceDisplayContainer = document.getElementById('resource-Display-Container');
    const playerScoreDisplay = document.querySelector('.player-Score-Display');

    // Safety check to ensure the containers exist in your HTML
    if (!resourceDisplayContainer || !playerScoreDisplay) {
        console.warn("Resource display containers not found. Please check the IDs in your index.html.");
        return;
    }

    // Clear the current content of the displays before updating
    resourceDisplayContainer.innerHTML = '';
    playerScoreDisplay.innerHTML = '';

    const currentPlayer = players[currentPlayerIndex];
    const humanPlayers = players.filter(p => p.isHuman);
    const aiPlayers = players.filter(p => !p.isHuman);

    let playerForBottomDisplay = null;

    // --- Logic for the Bottom Display Container ---
    // If there's only one human player, always show them.
    if (humanPlayers.length === 1) {
        playerForBottomDisplay = humanPlayers[0];
    } 
    // If there are multiple human players, show the one whose turn it is.
    else if (humanPlayers.length > 1) {
        if (currentPlayer?.isHuman) {
            playerForBottomDisplay = currentPlayer;
        }
    }

    // Populate the bottom display if a player has been selected
    if (playerForBottomDisplay) {
        const playerInfoList = document.createElement('ul');
        playerInfoList.innerHTML = `
            <li><span id="currentPlayer">${playerForBottomDisplay.role || 'Player'}</span></li>
            <li>Knowledge: <span id="KNOWLEDGE_COUNT">${playerForBottomDisplay.resources?.knowledge || 0}</span></li>
            <li>Money: <span id="MONEY_COUNT">${playerForBottomDisplay.resources?.money || 0}</span></li>
            <li>Influence: <span id="INFLUENCE_COUNT">${playerForBottomDisplay.resources?.influence || 0}</span></li>
        `;
        resourceDisplayContainer.appendChild(playerInfoList);
    }

    // --- Logic for the Top Score Display ---
    const playersForTopDisplay = [];
    
    // Add all AI players who are active in the game
    aiPlayers.forEach(player => {
        if (players.includes(player)) {
            playersForTopDisplay.push(player);
        }
    });
    
    // Add any human players who are NOT being shown in the bottom display
    humanPlayers.forEach(player => {
        if (player !== playerForBottomDisplay && players.includes(player)) {
            playersForTopDisplay.push(player);
        }
    });

    // Add header to score display
    const header = document.createElement('h3');
    header.textContent = 'Player Scores';
    playerScoreDisplay.appendChild(header);

    // Populate the top display with the selected players
    playersForTopDisplay.forEach(player => {
        const playerScoreElement = document.createElement('h4');
        const roleName = player.role || `Player ${player.id?.slice(0, 4) || '?'}`;
        const resources = player.resources || {};
        
        playerScoreElement.innerHTML = `
            <span class="role-Name">${roleName}</span>
            <p>
                ${resources.money || 0} 💰, 
                ${resources.knowledge || 0} 🧠, 
                ${resources.influence || 0} 🎯
            </p>
        `;
        playerScoreDisplay.appendChild(playerScoreElement);
    });
    
    console.log('=============updateResourceDisplays END=============');
}

/**
 * Log every change with full metadata
 */
export function logChange({ resourceType, baseAmount, adjustedAmount, source, actionType }) {
  console.log('=============logChange=============');
  const player = getCurrentPlayer();
  
  // Update the resource displays whenever a change is logged
  updateResourceDisplays();
  
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
  //console.log(`[RESOURCE LOG]`, entry);
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
  console.log('=============handleCardMovement=============');
  
  const player = getCurrentPlayer();
  if (!player) {
      console.error("handleCardMovement: No current player found.");
      return Promise.reject("No current player");
  }
  
  //console.log(`GAME: Handling card movement for ${player.name}:`, effect);
  
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

      //console.log(`GAME: Moving ${player.name} ${steps} spaces via card effect.`);
      ensurePlayerPath(player);

      // Handle backwards movement
      if (steps < 0) {
        //console.log(`Handling backwards movement of ${Math.abs(steps)} steps`);
        const paths = [ageOfExpansionPath, ageOfResistancePath, ageOfReckoningPath, ageOfLegacyPath];
        const currentPath = paths.find(p => p.pathName === player.currentPath);
        
        if (!currentPath || !currentPath.segments?.length) {
          console.warn("No valid path found for backwards movement");
          return;
        }
        
        // Find current segment index with tolerance for floating point imprecision
        let currentSegmentIndex = -1;
        const TOLERANCE = 0.1;
        
        for (let i = 0; i < currentPath.segments.length; i++) {
          const segCoord = currentPath.segments[i].coordinates?.[0];
          if (segCoord) {
            const dx = Math.abs(segCoord[0] - player.currentCoords.x);
            const dy = Math.abs(segCoord[1] - player.currentCoords.y);
            if (dx <= TOLERANCE && dy <= TOLERANCE) {
              currentSegmentIndex = i;
              break;
            }
          }
        }
        
        if (currentSegmentIndex === -1) {
          console.warn(`Could not find current position in path ${player.currentPath} at coords`, player.currentCoords);
          return;
        }
        
        // Calculate target index (steps is negative for backwards movement)
        const targetIndex = Math.max(0, currentSegmentIndex + steps);
        const targetSegment = currentPath.segments[targetIndex];
        
        if (!targetSegment?.coordinates?.[0]) {
          console.warn("Invalid target segment for backwards movement");
          return;
        }
        
        const targetCoords = {
          x: targetSegment.coordinates[0][0],
          y: targetSegment.coordinates[0][1]
        };
        
        //console.log(`Moving from segment ${currentSegmentIndex} to ${targetIndex} (${Math.abs(steps)} steps back)`);
        
        // Update player position
        player.currentCoords = { ...targetCoords };
        
        // Update game state with new position
        updateGameState({
          players: state.players.map(p => 
            p.id === player.id ? { 
              ...p, 
              currentCoords: { ...targetCoords },
              currentPath: player.currentPath
            } : p
          )
        });
        
        //console.log(`Moved ${player.name} backwards ${Math.abs(steps)} steps to`, targetCoords);
        
        // Redraw the board to show the new position
        drawBoard();
        return;
      }

      // For forward movement
      updateGameState({
        currentPhase: 'MOVING'
      });
      //console.log(`Moving ${steps} spaces for ${player.name}`);

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

      // Helper function to search for a specific coordinate across all paths with tolerance
      const findSegmentByCoord = (coord, targetPathData = pathData) => {
        return targetPathData.segments.find(segment => {
          const segCoord = segment.coordinates?.[0];
          return segCoord?.[0] === coord.x && segCoord?.[1] === coord.y;
        });
      };

      // Helper function to search for a coordinate across all paths with tolerance
      const findPathByChosenCoord = (chosenCoord, tolerance = 5) => {
        //console.log('=============--------findPathByChosenCoord=============--------');
        for (const path of paths) {
          for (const segment of path.segments) {
            const segCoord = segment.coordinates?.[0];
            if (segCoord) {
              const dx = Math.abs(segCoord[0] - chosenCoord.x);
              const dy = Math.abs(segCoord[1] - chosenCoord.y);
              if (dx <= tolerance && dy <= tolerance) {
                //console.log(`Found matching coords in path ${path.pathName} with tolerance ${tolerance}`);
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

            // Ease in-out cubic animation curve
            // See: https://easings.net/#easeInOutCubic
            const eased = progress < 0.5
              ? 4 * progress * progress * progress
              : 1 - Math.pow(-2 * progress + 2, 3) / 2;

            // Calculate the current position based on the eased progress
            const currentX = start.x + (end.x - start.x) * eased;
            const currentY = start.y + (end.y - start.y) * eased;

            // Scale the coordinates to the board's scale factor
            const [scaledX, scaledY] = scaleCoordinates(currentX, currentY);

            // Update the element's transform with the current position
            element.style.transform = `translate(${scaledX}px, ${scaledY}px)`;

            // If the animation is not complete, request the next frame
            if (progress < 1) {
              requestAnimationFrame(update);
            } else {
              // Otherwise, resolve the promise to indicate animation completion
              resolve();
            }
          };

          // Start the animation loop
          requestAnimationFrame(update);
        });
      };

      const animateNextSegment = async () => {
        if (remainingSteps <= 0) {
          // Movement complete
          token.classList.remove('enlarged');
          token.classList.add('normal');
          player.currentCoords = { ...currentCoord };
          
          // Update player coordinates directly and clear preventCardDraw
          player.currentCoords = { ...currentCoord };
          state.preventCardDraw = false;
          //console.log(`GAME: Card movement (${steps} spaces) completed for ${player.name}`);
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
                // Update the player's current path and coordinates to the new path
                player.currentPath = match.path.pathName;
                player.currentCoords = match.exactCoord;
                currentCoord = { ...match.exactCoord };
                pathData = match.path; // Update pathData to the new path
              } else {
                console.warn("Could not match chosen coords exactly, using provided coords:", chosenOption.coords);
                // Update the player's current coordinates to the chosen coordinates
                player.currentCoords = { x: chosenOption.coords[0], y: chosenOption.coords[1] };
                currentCoord = { ...player.currentCoords };
              }
              
              // Update player path and coordinates directly
              player.currentPath = player.currentPath;
              player.currentCoords = { ...player.currentCoords };
              //console.log(`Updated player ${player.name} coordinates in game state after choicepoint:`, { path: player.currentPath, coords: player.currentCoords });

              // Decrement the number of remaining steps
              remainingSteps--;
              // Update the game state with the new number of remaining steps
              updateGameState({ remainingSteps });

              // Clear the interrupted move data
              delete state.interruptedMove;
              // Update the game state to indicate that we are no longer waiting for a choice
              updateGameState({
                currentPhase: 'MOVING',
                pendingActionData: null
              });

              // Continue the movement
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
        
        // CRITICAL: Update player coordinates in global game state immediately
        updateGameState({
          players: state.players.map(p => 
            p.id === player.id ? { ...p, currentCoords: { ...player.currentCoords } } : p
          )
        });
        //console.log(`Updated player ${player.name} coordinates in game state:`, player.currentCoords);

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
        //console.log(`GAME: Moving ${player.name} directly to ${spaceId} (${targetCoords.x}, ${targetCoords.y})`);
        player.currentCoords = { ...targetCoords };
        
        // CRITICAL: Update player coordinates in global game state immediately
        updateGameState({
          players: state.players.map(p => 
            p.id === player.id ? { ...p, currentCoords: { ...player.currentCoords } } : p
          )
        });
        //console.log(`Updated player ${player.name} coordinates in game state:`, player.currentCoords);
        
        drawBoard();

        if (spaceId === 'FINISH') {
          //console.log(`Player ${player.name} reached FINISH via card effect.`);
          markPlayerFinished(player);
          if (allPlayersFinished(getPlayers())) {
            triggerGameOver();
          }
        }
      }

    } else if (effect.moveToAge) {
      // Handle moving to the start of a specific Age
      //console.log(`GAME: Moving ${player.name} to start of Age: ${effect.moveToAge}`);

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
        //console.log(`Moving to ${effect.moveToAge} at:`, targetCoords);

        // Update player's path and position
        player.currentPath = targetPath.pathName;
        player.currentCoords = { ...targetCoords };
        
        // Update player path and coordinates directly
        player.currentPath = player.currentPath;
        player.currentCoords = { ...player.currentCoords };
        state.preventCardDraw = false;
        //console.log(`Updated player ${player.name} path and coordinates:`, { path: player.currentPath, coords: player.currentCoords });

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
 * Returns deep copy of the full log
 */
export function getResourceLog() {
  console.log('=============getResourceLog=============');
  return JSON.parse(JSON.stringify(resourceLog));
}

export async function showStealPopover(effect, currentPlayer, validTargets, delayMs = 5000) {
  console.log('=============showStealPopover=============');

  return new Promise((resolve) => {
    // Get popover and container
    const popover = document.getElementById('steal-Popover');
    const optionsContainer = document.getElementById('player-Choice-Options');

    if (!popover || !optionsContainer) {
      console.error('Steal popover elements not found in DOM');
      resolve();
      return;
    }

    // Clear existing buttons
    optionsContainer.innerHTML = '';

    // Create a button for each valid target
    validTargets.forEach(target => {
      const button = document.createElement('button');
      button.className = 'steal-target-button';

      // Name label
      const nameText = document.createElement('span');
      nameText.textContent = target.name;
      nameText.className = 'player-name-text';
      button.appendChild(nameText);

      // Only attach click handler for human players
      if (currentPlayer.isHuman) {
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
      }

      optionsContainer.appendChild(button);
    });

    // Show the popover for both AI and human
    popover.showModal();

    // --- AI selection logic ---
    if (!currentPlayer.isHuman) {
      setTimeout(async () => {
        const randomIndex = Math.floor(Math.random() * validTargets.length);
        const target = validTargets[randomIndex];
        const targetButton = optionsContainer.children[randomIndex];

        // Animate the AI's selected button
        if (targetButton) {
          targetButton.style.transition = 'transform 0.2s ease-in-out';
          targetButton.style.transform = 'scale(1.2)';
          setTimeout(() => {
            targetButton.style.transform = 'scale(1.0)';
          }, 300);
        }

        const rate = await getResistanceRate(target, effect.resource);
        const actualAmount = Math.floor(effect.amount * rate);

        setTimeout(async () => {
          popover.close();
          await handleStealEffect(effect, target, currentPlayer, actualAmount);
          resolve();
        }, 500); // short delay after animation
      }, delayMs); // wait before AI makes its decision
    }

    // Human players will resolve via button click
  });
}

export async function applyStealEffect(effect, sourcePlayer) {
  console.log('=============applyStealEffect=============');
  //console.log(`Starting steal chain: applyStealEffect → getValidStealTargets → showStealPopover → handleStealEffect`);
  
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
  //console.log(`${sourcePlayer.name} steals ${adjustedAmount} ${effect.resource} from ${targetPlayer.name}`);
  
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
    
    // Remove resources from target player
    await applyResourceChange(
      resourceType,
      -actualAmount, // Negative amount to remove resources
      `stolen_by_${sourcePlayer.id}`,
      targetPlayer.id
    );
    
    // Add resources to source player
    await applyResourceChange(
      resourceType,
      actualAmount, // Positive amount to add resources
      `stolen_from_${targetPlayer.id}`,
      sourcePlayer.id
    );
    
    //console.log(`Steal completed: ${sourcePlayer.name} gained ${actualAmount} ${effect.resource} from ${targetPlayer.name}`);
    
    // Update UI for both players
    updatePlayerInfo(targetPlayer.id);
    updatePlayerInfo(sourcePlayer.id);
    
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
      //console.log(`${target.name} resisted the entire ${effect.resource} steal.`);
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

      //console.log(`[SKIP TURN] ${player.name} will skip ${skipTurns} turn(s). Total skips: ${player.skipTurns}`);
      
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

/**
* Get a player's resources from global state
* @param {string} playerId - The ID of the player
* @returns {Object} Player's resources or null if not found
*/
export function getPlayerResources(playerId) {
  console.log('=============getPlayerResources=============');
  if (!playerId || !state.playerResources[playerId]) return null;
  return JSON.parse(JSON.stringify(state.playerResources[playerId]));
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
  //console.log('Full card object received:', JSON.stringify(card, null, 2));

  const player = getCurrentPlayer();

  if (!player) {
    console.error('No current player found');
    return;
}
    
  if (!card || !player) {
      console.warn(`Cannot apply effects of card "${card.name}" to player ${player.name} card or player is undefined`);
      return;
  }

  //console.log(`Applying effects of card "${card.name}" to player ${player.name}...`);
  
  // Handle different effect formats
  if (!card.effects) {
      console.error(`Card "${card.name}" has no effects property.`);
      return;
  }
  
  // Case 1: Effects organized by role (object with role keys)
  if (typeof card.effects === 'object' && !Array.isArray(card.effects)) {
    //console.log(`Card "${card.name}" has role-based effects structure.`);
    
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
        //console.log(`Applying ${player.role}-specific effects (matched as "${matchedRole}"):`, roleEffects);
        
        // Process the effect
        if (Array.isArray(roleEffects)) {
            roleEffects.forEach(effect => processCardEffects(effect, player));
        } else if (typeof roleEffects === 'object') {
            processCardEffects(roleEffects, player, player);
        }
    } else {
        console.warn(`No effects found for role "${player.role}" on card "${card.name}"`);
        //console.log('Available roles:', Object.keys(card.effects));
        
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
  //console.log(`Card "${card.name}" effects has an unexpected format:`, card.effects);
  
  // Call processEndPlayerTurn even if effects format is unexpected
  console.log('=============applyCardEffect END=============');
  processEndPlayerTurn();
};

export async function applyAgeCardEffect(card, optionName = null, playerId) {
  if (!isActionAllowed('AWAITING_PATH_CHOICE', 'ROLLING', 'TURN_TRANSITION')) return;
  updateGameState({ currentPhase: 'PLAYING' });
  console.log('=============applyAgeCardEffect=============')
  //console.log('Card:', card.name);
  //console.log('Option:', optionName);
  
  const player = getCurrentPlayer();
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
  
  //console.log(`Starting sequential processing of ${effects.length} effects`);
  
  // Process all effects sequentially with proper async/await chains
  for (const effect of effects) {
    try {
      //console.log('Processing effect:', effect);
      
      // Handle different effect types with proper async chains
      switch (effect.type) {
        case 'RESOURCE_CHANGE': {
          const player = getCurrentPlayer();
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

  //console.log('All effects completed - calling processAgeCardEffects');
  // Validate and finalize all effects
  await processAgeCardEffects(card, effects);
}

export async function applyResourceChange(resourceType, amount, source, playerId, callback = null) {
  console.log('=============applyResourceChange=============');
  
  // Get the target player
  const player = playerId ? getPlayerById(playerId) : getCurrentPlayer();
  if (!player) {
    console.error('applyResourceChange: No player found');
    return null;
  }
  
  //console.log(`[RESOURCE] Starting resource change for ${player.name} (${player.role})`);
  console.log('Parameters:', { 
    resourceType, 
    amount, 
    source,
    playerId: player.id,
    playerName: player.name
  });

  // Input validation
  if (!resourceType || typeof amount !== 'number' || typeof source !== 'string') {
    console.error('Invalid parameters for applyResourceChange:', { resourceType, amount, source });
    return null;
  }

  if (!RESOURCE_TYPES.includes(resourceType)) {
    console.error(`Unknown resource type: ${resourceType}. Valid types are:`, RESOURCE_TYPES);
    return null;
  }

  if (amount === 0) {
    //console.log('No change needed: amount is 0');
    return { success: true, amount: 0 };
  }

  try {
    // Get current resource value before any changes
    const currentValue = player.resources?.[resourceType] || 0;
    const isGain = amount > 0;
    
    console.group(`[RESOURCE] ${player.name} - Processing ${resourceType} ${isGain ? 'gain' : 'loss'}`);
    //console.log('Initial Value:', currentValue);
    //console.log('Requested Change:', amount);
    
    // Apply multipliers and resistances
    let adjustedAmount = amount;
    
    if (isGain) {
      // Apply gain multipliers
      const multiplier = await getMultiplier(resourceType, true);
      if (multiplier !== 1) {
        adjustedAmount = Math.round(amount * multiplier);
        //console.log(`Applied gain multiplier: ${multiplier}x`);
      }
    } else {
      // Apply resistance for losses
      const resistance = await getResistanceRate(player, resourceType);
      if (resistance !== 1) {
        adjustedAmount = Math.round(amount * resistance);
        //console.log(`Applied resistance: ${resistance}x`);
      }
    }
    
    // Ensure we don't go below zero
    if (!isGain && Math.abs(adjustedAmount) > currentValue) {
      //console.log(`Adjusting loss to not go below zero (was: ${adjustedAmount}, max: ${currentValue})`);
      adjustedAmount = -currentValue;
    }
    
    //console.log('Final Change After Adjustments:', adjustedAmount);
    
    // Determine which callback to use based on source and callback parameter
    let newValue;
    if (callback) {
      // Use the provided callback function
      newValue = await callback({
        currentPlayer: player,
        resourceType,
        amount: adjustedAmount,
        source,
        fromPlayer: source === 'steal' ? getCurrentPlayer() : null
      });
    } else if (source === 'applyCardEffect') {
      // If called from applyCardEffect, delegate to processCardEffects
      await processCardEffects({
        type: 'RESOURCE_CHANGE',
        resource: resourceType,
        amount: adjustedAmount
      }, player);
      newValue = (player.resources?.[resourceType] || 0) + adjustedAmount;
    } else {
      // Default: delegate to handleCardResourceEffect
      newValue = await handleCardResourceEffect({
        currentPlayer: player,
        resourceType,
        amount: adjustedAmount,
        source,
        fromPlayer: source === 'steal' ? getCurrentPlayer() : null
      });
    }
    
    // Log the complete transaction
    const logEntry = {
      timestamp: new Date().toISOString(),
      playerId: player.id,
      playerName: player.name,
      playerRole: player.role,
      resourceType,
      originalAmount: amount,
      adjustedAmount,
      previousValue: currentValue,
      newValue: newValue !== undefined ? newValue : (currentValue + adjustedAmount),
      source,
      isGain
    };
    
    resourceLog.push(logEntry);
    
    //console.log('Resource Update Summary:');
    //console.log('Previous Value:', currentValue);
    //console.log('Change:', adjustedAmount);
    //console.log('New Value:', logEntry.newValue);
    console.groupEnd();
    
    //console.log(`[RESOURCE] ${player.name} ${isGain ? 'gained' : 'lost'} ${Math.abs(adjustedAmount)} ${resourceType}`);
    
    // Update the resource displays
    updateResourceDisplays();
    
    console.log('=============applyResourceChange END=============');
    
    return {
      success: true,
      amount: adjustedAmount,
      previousValue: currentValue,
      newValue: logEntry.newValue,
      logEntry
    };
    
  } catch (error) {
    console.error('Error in applyResourceChange:', error);
    console.groupEnd();
    
    return {
      success: false,
      error: error.message,
      resourceType,
      amount,
      source
    };
  }
}

/**`
* Handles any resource change triggered by a card
*/
export async function handleCardResourceEffect({
  currentPlayer = getCurrentPlayer(),
  resourceType,
  amount,
  source = 'cardEffect',
  fromPlayer = null
}) {
  console.log('=============handleCardResourceEffect=============');
  //console.log(`Processing resource effect: ${amount > 0 ? '+' : ''}${amount} ${resourceType} for ${currentPlayer.name} (${currentPlayer.id})`);
  
  if (!isValidResource(resourceType)) {
    console.error(`Invalid resource type in card effect: ${resourceType}`);
    return;
  }

  if (amount === 0) {
    //console.log('Skipping resource update: amount is 0');
    return;
  }

  try {
    // Get fresh player data to ensure we're working with current state
    const player = getPlayerById(currentPlayer.id) || currentPlayer;
    if (!player) {
      console.error('Player not found for resource update:', currentPlayer.id);
      return;
    }

    // Calculate new resource value
    const currentValue = player.resources?.[resourceType] || 0;
    const newValue = Math.max(0, currentValue + amount); // Ensure resources don't go below 0
    
    console.group(`[RESOURCE] ${player.name} (${player.role}) - ${resourceType} Update`);
    //console.log('Source:', source);
    //console.log('Current Value:', currentValue);
    //console.log('Change:', `${amount > 0 ? '+' : ''}${amount}`);
    //console.log('New Value:', newValue);
    
    // Create updated resources object
    const updatedResources = {
      ...(player.resources || {}),
      [resourceType]: newValue
    };

    // Update player state immutably
    const updatedPlayer = {
      ...player,
      resources: updatedResources
    };

    // Log the change for debugging
    logChange({
      resourceType,
      baseAmount: amount,
      adjustedAmount: amount, // No adjustment here as it's already handled in applyResourceChange
      source,
      actionType: fromPlayer ? 'steal' : (amount > 0 ? 'gain' : 'lose')
    });

    // Update game state with the modified player
    updateGameState({
      players: state.players.map(p => 
        p.id === updatedPlayer.id ? updatedPlayer : p
      )
    });

    //console.log('Resource update completed successfully');
    
    // Update the resource displays
    updateResourceDisplays();
    
    console.groupEnd();
    
    return updatedPlayer.resources[resourceType];
  } catch (error) {
    console.error('Error in handleCardResourceEffect:', error);
    console.groupEnd();
    throw error; // Re-throw to allow callers to handle the error
  }
}