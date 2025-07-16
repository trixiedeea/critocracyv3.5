// resourceManagement.js

/**
 * Applies resource changes to a single player, with role-based mod//ifiers
 */
function applyResourceChange(player, resourceType, amount, source = 'cardEffect') {
  if (!RESOURCE_TYPES.includes(resourceType)) {
    console.warn(`Unknown resource type: ${resourceType}`);
    return;
  }

  const isGain = amount > 0;
  const role = player.role;
  let adjustedAmount = amount;

   //Gain modifiers
  if (isGain && roleMultipliers.gain[role]?.[resourceType]) {
    adjustedAmount *= roleMultipliers.gain[role][resourceType];
  }

   //Loss modifiers
  if (!isGain && roleMultipliers.loss[role]?.[resourceType]) {
    adjustedAmount *= roleMultipliers.loss[role][resourceType];
  }

  // Round to nearest integer
  adjustedAmount = Math.round(adjustedAmount);

  // Apply change
  player.resources[resourceType] += adjustedAmount;

  // Log and update UI
  const logEntry = {
    playerId: player.id,
    playerName: player.name,
    resourceType,
    change: adjustedAmount,
    reason: source,
    timestamp: new Date().toISOString(),
  };
  resourceLog.push(logEntry);

  if (typeof logEvent === 'function') logEvent(logEntry);
  updateResourcePanel(player);
}

import { updateResourcePanel } from './ui.js';

// ========== //constants ==========

const RESOURCE_TYPES = ['money', 'knowledge', 'influence'];

const roleMultipliers = {
  gain: {
    ARTIST: { knowledge: 1.85 },
    ENTREPRENEUR: { money: 1.85 },
    REVOLUTIONARY: { influence: 1.85 },
  },
  loss: {
    HISTORIAN: { knowledge: 0.15 },
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

export function canStealFrom(sourceRole, targetRole) {
  return !(stealRestrictions[sourceRole]?.includes(targetRole));
}

export function getValidStealTargets(currentPlayer, players, cardEffect) {
  return players.filter(p => 
    p.id !== currentPlayer.id &&
    canStealFrom(currentPlayer.role, p.role) &&
    (cardEffect.target === 'ALL' || cardEffect.target === 'OTHER' || p.role.toUpperCase() === cardEffect.target)
  );
}

export function getResistanceRate(targetPlayer, resource) {
  const resist = resistanceRates[targetPlayer.role.toUpperCase()];
  return resist && resist[resource.toLowerCase()] ? resist[resource.toLowerCase()] : 1;
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



