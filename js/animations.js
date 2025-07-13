import { 
    getUIState, 
    updateUIState,
    state,
    updateGameState 
} from './state.js';

import {
    promptForChoicepoint,

} from './ui.js';

import { 
    getCurrentPlayer,
    handleEndOfMove,
    handlePlayerAction
} from './game.js';

import { 
    drawTokens, 
    scaleCoordinates,
    drawBoard
} from './board.js';

import { 
    fullDeckRegionPathMap, 
    ageOfExpansionPath, 
    ageOfResistancePath, 
    ageOfReckoningPath, 
    ageOfLegacyPath, 
    PATH_COLORS,
    choicepoints
} from './board-data.js';


import {drawCard } from './cards.js';

// Animation timing constants
export const TIMING = {
    // Card animations
    CARD_FLIP: 500,
    CARD_DISCARD: 1000,
    CARD_DRAW: 1000,
    
    // Player turns
    CPU_CARD_DISPLAY: 4000,
    CPU_DECK_FLASH: 4000,
    CPU_MOVE_DELAY: 1000,
    
    // Dice
    DICE_ROLL: 1000,
    DICE_SHAKE: 300,
    
    // UI effects
    FADE_IN: 300,
    FADE_OUT: 300,
    PULSE: 1500,
    TOKEN_MOVE: 1000
};

/**
 * Animates a value from start to end over a duration
 * @param {number} start - Starting value
 * @param {number} end - Ending value
 * @param {number} duration - Duration in milliseconds
 * @param {Function} callback - Callback function with current value
 */
export const animateValue = (start, end, duration, callback) => {
    const startTime = performance.now();
    
    const update = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Ease in-out cubic
        const eased = progress < 0.5
            ? 4 * progress * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 3) / 2;
        
        const current = start + (end - start) * eased;
        callback(current);
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    };
    
    // Update gameState references
    const { animation: { frameId: existingId } } = getUIState();
    if (existingId) {
        cancelAnimationFrame(existingId);
    }
    
    const newFrameId = requestAnimationFrame(update);
    updateUIState({
        animation: {
            ...getUIState().animation,
            frameId: newFrameId
        }
    });
};

/**
 * Animates a dice roll
 * @param {HTMLElement} diceElement - Dice element to animate
 * @param {number} finalValue - Final dice value
 * @param {number} duration - Duration in milliseconds
 * @returns {Promise} Resolves when animation completes
 */
export const animateDiceRoll = async (diceElement, finalValue, duration = 1500) => {
  console.log('---------animateDiceRoll---------');

  const player = getCurrentPlayer();

  // If not human, delay 2 seconds before continuing
  if (!player?.isHuman) {
      console.log('CPU player detected – auto-rolling in 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000));
  }

     const dice = document.getElementById('dice');
   if (!dice) return;

  // Disable interaction while rolling
  dice.style.pointerEvents = 'none';

  // Add rolling class to trigger animation
  dice.classList.add('rolling');

  // Use the provided finalValue or generate a random roll if not provided
   const result = Math.ceil(Math.random() * 6);
   
   // Store the roll result in state
   updateGameState({ rollResult: result });

  // After animation completes, show the result
  setTimeout(() => {
      dice.classList.remove('rolling');

      // Position the dice to show the result face
      let transform = '';
      switch(result) {
          case 1: transform = 'rotateX(0deg) rotateY(0deg)'; break;
          case 2: transform = 'rotateY(90deg) rotateX(0deg)'; break;
          case 3: transform = 'rotateX(90deg) rotateY(0deg)'; break;
          case 4: transform = 'rotateX(-90deg) rotateY(0deg)'; break;
          case 5: transform = 'rotateY(-90deg) rotateX(0deg)'; break;
          case 6: transform = 'rotateY(180deg) rotateX(0deg)'; break;
      }

      // Apply final transform and show face
      dice.style.transform = `${transform} scale(1.2)`;

      // Keep face visible for 1.5s before proceeding
      setTimeout(() => {
          // Then enable interaction and trigger game logic
          dice.style.pointerEvents = 'auto';
          dice.classList.add('shake');
          
          // Set the roll result in state before calling handlePlayerAction
          updateGameState({ rollResult: result });
          handlePlayerAction();
      }, 1500);

  }, duration); // Match this with the CSS animation duration

  return result;
};

/**
 * Gets the path segments between two points
 * @param {Object} start - Starting coordinates {x, y}
 * @param {Object} end - Ending coordinates {x, y}
 * @param {Object} pathData - Path data containing segments
 * @returns {Array} Array of coordinates representing the path
 */
export function getPathSegments(start, end, pathData) {
    console.log('---------getPathSegments---------');
    // Find the closest segment to start
    let startSegment = null;
    let minStartDist = Infinity;
  
    for (const segment of pathData.segments) {
        const coords = segment.coordinates[0];
        const dist = Math.hypot(coords[0] - start.x, coords[1] - start.y);
        if (dist < minStartDist) {
            minStartDist = dist;
            startSegment = segment;
        }
    }
  
    // Find the closest segment to end
    let endSegment = null;
    let minEndDist = Infinity;
  
    for (const segment of pathData.segments) {
        const coords = segment.coordinates[0];
        const dist = Math.hypot(coords[0] - end.x, coords[1] - end.y);
        if (dist < minEndDist) {
            minEndDist = dist;
            endSegment = segment;
        }
    }
  
    if (!startSegment || !endSegment) {
        // Fallback to a direct path in the same format
        return [
            [start.x, start.y],
            [end.x, end.y]
        ];
    }
  
    // Build path segments
    const segments = [];
    let currentSegment = startSegment;
  
    while (currentSegment && currentSegment !== endSegment) {
        segments.push(currentSegment.coordinates[0]);
  
        // Find next segment
        if (currentSegment.Next && currentSegment.Next.length > 0) {
            const nextCoords = currentSegment.Next[0];
            currentSegment = pathData.segments.find(s =>
                s.coordinates[0][0] === nextCoords[0] &&
                s.coordinates[0][1] === nextCoords[1]
            );
        } else {
            break;
        }
    }
  
    if (endSegment) {
        segments.push(endSegment.coordinates[0]);
    }
  
    return segments;
};
  
export const ensurePlayerPath = (player) => {
    console.log('---------ensurePlayerPath---------');
    if (!player.currentPath) {
      player.currentPath = 'ageOfLegacyPath'; // or default based on your game state
    }
};  
  
/**
 * Animates the player's token forward based on the dice roll.
 *
 * @param {object} player - The player whose token is moving.
 * @param {object} newPosition - The destination (currently unused).
 * @param {number} duration - Animation duration in ms.
 * @param {boolean} skipSpaceAction - If true, bypass space actions at end.
 * @param {function|null} onComplete - Callback after animation finishes.
 */
export function animateTokenToPosition(player, newPosition, duration = 1000, skipSpaceAction = false, onComplete = null) {
  console.log(`----------animateTokenToPosition: ${player.name} moving ${state.rollResult} spaces -----------`);
  player = getCurrentPlayer();
  const rollResult = state.rollResult;
  console.log(`Moving ${rollResult} spaces for ${player.name}`);

  return new Promise(async (resolve) => {
    const token = document.querySelector(`[data-player-id="${player.id}"]`);
    if (!token) {
      console.warn("Token not found for player:", player);
      resolve();
      return;
    }

    const paths = [ageOfExpansionPath, ageOfResistancePath, ageOfReckoningPath, ageOfLegacyPath];
    let pathData = paths.find(path => path.pathName === player.currentPath);

    if (!pathData || !pathData.segments) {
      console.warn("No path data found for player's current path.");
      resolve();
      return;
    }

    let remainingSteps = rollResult;
    let currentCoord = { ...player.currentCoords };
    console.log(`Current coordinates for ${player.name}:`, currentCoord);
    console.log(`Remaining steps for ${player.name}:`, remainingSteps);

    const findSegmentByCoord = (coord, targetPathData = pathData) => {
      return targetPathData.segments.find(segment => {
        const segCoord = segment.coordinates?.[0];
        return segCoord?.[0] === coord.x && segCoord?.[1] === coord.y;
      });
    };

    // Function to search for a coordinate across all paths with tolerance
    const findPathByChosenCoord = (chosenCoord, tolerance = 5) => {
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
    

    async function animateNextSegment() {
      if (remainingSteps <= 0) {
        // Movement complete
        console.log(`[DEBUG] Movement complete. Final position: ${JSON.stringify(currentCoord)}`);
        token.classList.remove('enlarged');
        token.classList.add('normal');
        await handleEndOfMove();
        resolve();
        return;
      }
    
      const segment = findSegmentByCoord(currentCoord);
      if (!segment || !segment.Next || segment.Next.length === 0) {
        console.warn("Invalid or incomplete segment found at", currentCoord);
        resolve();
        return;
      }
    
      // Check if this is a choicepoint (multiple Next coordinates)
      if (segment.Next.length > 1) {
        console.log(`[DEBUG] Choicepoint detected at ${JSON.stringify(currentCoord)} with ${segment.Next.length} options`);
        
        // Store interrupted move data
        state.interruptedMove = {
          remainingSteps,
          duration,
          skipSpaceAction,
          onComplete
        };
        
        // Ensure game state is set to wait for choice
        updateGameState({
          currentPhase: 'AWAITING_CHOICEPOINT_CHOICE',
          pendingActionData: {
            choiceOptions: segment.Next
          }
        });
        
        console.log("At choicepoint - using promptForChoicepoint for both human and AI");
        
        // Prepare path names for the choice point
        let pathNames = [];
        if (Array.isArray(segment.pathNames) && segment.pathNames[0]) {
          pathNames = segment.pathNames[0].split(',').map(name => name.trim());
        }
        
        const options = segment.Next.map((coords, index) => ({
          coords,
          pathName: pathNames[index] || 'UNKNOWN_PATH'
        }));
        
        promptForChoicepoint(options, (chosenOption) => {
          console.log("Player chose:", chosenOption);
          
          // Search for the chosen coordinates across all paths
          const match = findPathByChosenCoord({ x: chosenOption.coords[0], y: chosenOption.coords[1] });
          if (match) {
            player.currentPath = match.path.pathName;
            player.currentCoords = match.exactCoord;
            currentCoord = { ...match.exactCoord };
            pathData = match.path; // Update pathData to the new path
            console.log(`Updated player path to ${player.currentPath} at coords ${JSON.stringify(currentCoord)}`);
          } else {
            console.warn("Could not match chosen coords exactly, using provided coords:", chosenOption.coords);
            player.currentCoords = { x: chosenOption.coords[0], y: chosenOption.coords[1] };
            currentCoord = { ...player.currentCoords };
          }
          
          remainingSteps--;
          // Persist updated step count immediately
          updateGameState({ remainingSteps });
          
          // Clear the interrupted move data
          delete state.interruptedMove;
          updateGameState({
            currentPhase: 'PLAYING',
            pendingActionData: null
          });
          
          // Continue movement
          animateNextSegment();
        });
        
        return; // Wait for choice before continuing
      }
    
      // Regular movement (single Next coordinate)
      const nextCoord = {
        x: segment.Next[0][0],
        y: segment.Next[0][1]
      };

      // Count step as we leave the currentCoord
      remainingSteps--;
            // Persist updated step count immediately
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
    }
    

    token.classList.add('animating-token', 'enlarged');
    token.classList.remove('normal');

    await animateNextSegment();
  });
};

/**
 * Clears all highlights including deck highlights and move highlights
 */
export function clearHighlights() {
    // Clear deck highlights
    clearDeckHighlights();
    
    // Clear any existing move highlights from the board
    const highlightElements = document.querySelectorAll('.highlight');
    highlightElements.forEach(el => {
        el.classList.remove('highlight');
    });
};

document.addEventListener('DOMContentLoaded', () => {
    // Initialize any animation-related UI elements
    const playerCountButtons = document.querySelectorAll('.player-count-Button');
    playerCountButtons.forEach(button => {
        pulseAnimation(button);
    });
});

/**
 * Starts the dice shake animation
 */

export let diceShakeInterval = null;

export function startDiceShake() {
    const dice = document.getElementById('dice');
    if (!dice) return;
    
    // Clear any existing shake interval
    stopDiceShake();

    
    // Add shake class to start the CSS animation
    dice.classList.add('shake');
    
    // Set up interval to ensure the shake animation keeps running
    diceShakeInterval = setInterval(() => {
        // This forces the animation to restart if it gets stuck
        dice.classList.remove('shake');
        void dice.offsetWidth; // Trigger reflow
        dice.classList.add('shake');
    }, 1200); // Restart animation every second
};

/**
 * Stops the dice shake animation
 */
export function stopDiceShake() {
    const dice = document.getElementById('dice');
    if (!dice) return;
    
    // Clear the interval
    if (diceShakeInterval) {
        clearInterval(diceShakeInterval);
        diceShakeInterval = null;
    }
    
    // Remove shake class
    dice.classList.remove('shake');
};

/**
 * Shows a visual effect for card being discarded
 * @param {HTMLElement} cardElement - Card to discard
 * @param {Function} onComplete - Callback when animation completes
 */
export function animateCardDiscard(cardElement, onComplete) {
    updateUIState({
        animation: {
            ...getUIState().animation,
            inProgress: true
        }
    });
    
    cardElement.style.transition = 'all 0.5s ease-in-out';
    cardElement.style.transform = 'scale(0.8) translateY(100px) rotate(10deg)';
    cardElement.style.opacity = '0';
    
    cardElement.addEventListener('transitionend', function onEnd() {
        cardElement.removeEventListener('transitionend', onEnd);
        cardElement.style.transition = '';
        cardElement.style.transform = '';
        cardElement.style.opacity = '';
        
        updateUIState({
            animation: {
                ...getUIState().animation,
                inProgress: false
            }
        });
        
        if (onComplete) onComplete();
    });
};

/**
 * Highlight the deck region for a player to draw from
 * 
 * @param {object} player - The player (must include `isAI` boolean).
 * @param {string} deckType - The deck to highlight (e.g., 'ageOfResistanceDeck').
 * @param {Array} positions - The region(s) to highlight (only used for decks like endOfTurnDeck).
 */
export function highlightDeckRegions(player, deckType, positions) {
  console.log('---------highlightDeckRegions---------');
  console.log('Highlighting deck regions for player:', player.name, 'deckType:', deckType, 'positions:', positions);

  const canvas = state.board?.Canvas || state.board?.canvas;
  if (!canvas || !deckType) {
    console.error('Missing canvas or deckType for highlightDeckRegions');
    return;
  }

  const ctx = canvas.getContext('2d');

  // Map proper highlight colors by deckType
  const colorMap = {
    ageOfExpansionDeck: 'rgba(83, 0, 159, 0.81)',   // purple
    ageOfResistanceDeck: 'rgba(25, 25, 248, 0.81)',  // blue
    ageOfReckoningDeck: 'rgba(39, 255, 248, 0.81)',   // cyan
    ageOfLegacyDeck: 'rgba(255, 15, 171, 0.81)',      // pink
    endOfTurnDeck: 'rgba(245, 238, 52, 0.9)'         // gold/yellow
  };

  const highlightColor = colorMap[deckType] || '#FF0000'; // fallback to red

  // Remove any old highlights
  clearDeckHighlights();

  // Determine what region(s) to highlight
  let regionsToHighlight = [];

  if (deckType.startsWith('ageOf')) {
    // Only highlight the matching age deck region
    const region = Object.values(fullDeckRegionPathMap).find(r => r.deckType === deckType);
    if (!region || !region.positions) {
      console.error(`No matching region or position for deckType: ${deckType}`);
      return;
    }
    regionsToHighlight = region.positions;
  } else {
    // Highlight all given positions (e.g. end-of-turn)
    if (!positions?.length) {
      console.error('No positions provided for non-ageOf deckType');
      return;
    }
    regionsToHighlight = positions;
  }

  // Store highlight data for animation
  if (!state.ui.dynamic) state.ui.dynamic = {};
  if (!state.ui.dynamic.deckHighlights) state.ui.dynamic.deckHighlights = [];
  
  // Clear existing highlights
  state.ui.dynamic.deckHighlights = [];

  // Create canvas highlight data
  regionsToHighlight.forEach((pos, index) => {
    const highlightData = {
      type: 'canvas',
      position: pos,
      color: highlightColor,
      deckType: deckType,
      player: player,
      phase: 0,
      animationId: null
    };

    state.ui.dynamic.deckHighlights.push(highlightData);
  });

  // Single animation function for all highlights
  function animateHighlights() {
    // Redraw the board to clear previous highlights
    if (typeof drawBoard === 'function') {
      drawBoard();
    }
    
    // Draw all highlights
    state.ui.dynamic.deckHighlights.forEach(highlight => {
      highlight.phase = (highlight.phase + 0.02) % 1;
      
      // Calculate pulsing alpha (0.4 to 0.8 range)
      const alpha = 0.4 + 0.4 * Math.sin(highlight.phase * Math.PI);
      const width = highlight.position.toprightx - highlight.position.topleft;
      const height = highlight.position.bottomleft - highlight.position.toplefty;
      
      // Extract base color from rgba string (remove the alpha part)
      const baseColor = highlight.color.replace(/,\s*[\d.]+\s*\)$/, '');
      
      ctx.save();
      
      // Draw semi-transparent fill behind the pulsing borders
      ctx.fillStyle = baseColor + `,${alpha * 0.3})`;
      ctx.fillRect(highlight.position.topleft, highlight.position.toplefty, width, height);
      
      // Draw border with pulsing effect
      ctx.strokeStyle = baseColor + `,${alpha})`;
      ctx.lineWidth = 4; // Slightly thicker border for better visibility
      ctx.strokeRect(highlight.position.topleft, highlight.position.toplefty, width, height);
      
      // Draw a second border with lower opacity for a glow effect
      ctx.strokeStyle = baseColor + `,${alpha * 0.5})`;
      ctx.lineWidth = 8;
      ctx.strokeRect(highlight.position.topleft, highlight.position.toplefty, width, height);
      
      ctx.restore();
    });
    
    // Continue animation only if there are still highlights
    if (state.ui.dynamic.deckHighlights.length > 0) {
      requestAnimationFrame(animateHighlights);
    }
  }

  // Start the animation
  requestAnimationFrame(animateHighlights);

  // Add click handler to canvas for deck interaction
  const originalClickHandler = canvas.onclick;
  canvas.onclick = (event) => {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // Check if click is within any highlighted region
    for (const highlight of state.ui.dynamic.deckHighlights) {
      const pos = highlight.position;
      if (x >= pos.topleft && x <= pos.toprightx && 
          y >= pos.toplefty && y <= pos.bottomleft) {
        clearDeckHighlights();
        drawCard(deckType, player);
        return;
      }
    }
    
    // If not clicking on a highlight, call original handler
    if (originalClickHandler) {
      originalClickHandler(event);
    }
  };

  // AI auto-draw after 5 seconds
  if (!player.isHuman) {
    setTimeout(() => {
      clearDeckHighlights();
      drawCard(deckType, player);
    }, 5000);
  }
}

/**
 * Clears all active canvas-based deck highlights without affecting tokens.
 */
export function clearDeckHighlights() {
  console.log('---------clearDeckHighlights---------');

  // Clear all highlight data
  if (state.ui.dynamic?.deckHighlights) {
    state.ui.dynamic.deckHighlights = [];
  }

  // Clear highlight animation interval (e.g. pulsing)
  if (state.ui.dynamic?.deckHighlightInterval) {
      clearInterval(state.ui.dynamic.deckHighlightInterval);
      state.ui.dynamic.deckHighlightInterval = null;
  }

  // Redraw the board to clear any highlights drawn on the canvas
  if (typeof drawBoard === 'function') {
    drawBoard();
  }

  // Clear the highlight canvas if it's separate from token canvas
  if (state.board?.highlightCtx && state.board?.highlightCanvas) {
    const ctx = state.board.ctx;
      ctx.clearRect(0, 0, state.board.highlightCanvas.width, state.board.highlightCanvas.height);
      console.log('[CANVAS] Cleared highlight canvas');
  } else if (state.board?.mainCtx && state.board?.mainCanvas) {
      // If deck highlights were drawn directly on main board canvas
      const ctx = state.board.mainCtx;
      ctx.clearRect(0, 0, state.board.mainCanvas.width, state.board.mainCanvas.height);
      console.log('[CANVAS] Cleared main canvas highlight layer');
  } else {
      console.log('[CANVAS] No valid highlight or main canvas found to clear');
  }
}
