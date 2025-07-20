// Import player functions needed for card effects
import { 
    getPlayers, 
    setPlayerSkipTurn, 
    PLAYER_ROLES,
    getRandomOtherPlayer,
    updatePlayerResources,
} from './players.js';

// Import game logic functions needed for complex effects
import { 
    handleCardMovement,
    handleEndTurn, 
    processEndPlayerTurn,
} from './game.js';

// Import card data directly from JS files
import { endOfTurnDeck } from '../assets/Cards/Endofturncards.js';
import { ageOfExpansionDeck } from '../assets/Cards/AgeOfExpansionCards.js';
import { ageOfLegacyDeck } from '../assets/Cards/AgeOfLegacyCards.js';
import { ageOfReckoningDeck } from '../assets/Cards/AgeOfReckoningCards.js';
import { ageOfResistanceDeck } from '../assets/Cards/AgeOfResistanceCards.js';

// Import UI functions needed
import { showMessage, updatePlayerInfo, updateResourcePanel } from './ui.js';
import { state, getEffectDescription } from './state.js';
import { TIMING, clearDeckHighlights } from './animations.js';

// Import game state functions
import { getCurrentPlayer } from './game.js';

import { fullDeckRegionPathMap } from './board-data.js';
import { drawBoard } from './board.js';

// Combine path Card decks into one structure for easier access by color
const CARD_DATA = {
    ageOfExpansionDeck: Array.isArray(ageOfExpansionDeck) ? ageOfExpansionDeck : [],
    ageOfResistanceDeck: Array.isArray(ageOfResistanceDeck) ? ageOfResistanceDeck : [],
    ageOfReckoningDeck: Array.isArray(ageOfReckoningDeck) ? ageOfReckoningDeck : [],
    ageOfLegacyDeck: Array.isArray(ageOfLegacyDeck) ? ageOfLegacyDeck : [],
    endOfTurnDeck: Array.isArray(endOfTurnDeck) ? endOfTurnDeck : []
};

// Define deck types using fullDeckRegionPathMap
export const deckType = {
    ageOfExpansionDeck: fullDeckRegionPathMap.ageOfExpansion.deckType,
    ageOfResistanceDeck: fullDeckRegionPathMap.ageOfResistance.deckType,
    ageOfReckoningDeck: fullDeckRegionPathMap.ageOfReckoning.deckType,
    ageOfLegacyDeck: fullDeckRegionPathMap.ageOfLegacy.deckType,
    endOfTurnDeck: 'endOfTurnDeck'
};

// Map deck types to their display names and colors using fullDeckRegionPathMap
export const deckInfo = {
    [deckType.ageOfExpansionDeck]: { 
        name: fullDeckRegionPathMap.ageOfExpansion.name + ' Deck',
        color: fullDeckRegionPathMap.ageOfExpansion.cssClass.replace('path-', ''),
        displayName: fullDeckRegionPathMap.ageOfExpansion.name
    },
    [deckType.ageOfResistanceDeck]: { 
        name: fullDeckRegionPathMap.ageOfResistance.name + ' Deck',
        color: fullDeckRegionPathMap.ageOfResistance.cssClass.replace('path-', ''),
        displayName: fullDeckRegionPathMap.ageOfResistance.name
    },
    [deckType.ageOfReckoningDeck]: { 
        name: fullDeckRegionPathMap.ageOfReckoning.name + ' Deck',
        color: fullDeckRegionPathMap.ageOfReckoning.cssClass.replace('path-', ''),
        displayName: fullDeckRegionPathMap.ageOfReckoning.name
    },
    [deckType.ageOfLegacyDeck]: { 
        name: fullDeckRegionPathMap.ageOfLegacy.name + ' Deck',
        color: fullDeckRegionPathMap.ageOfLegacy.cssClass.replace('path-', ''),
        displayName: fullDeckRegionPathMap.ageOfLegacy.name
    },
    [deckType.endOfTurnDeck]: {
        name: 'End of Turn Deck',
        color: 'yellow',
        displayName: 'End of Turn'
    }
};

export const deckIdMap = {
    // End of Turn deck - matches the HTML element ID 'end-Of-Turn'
    'endofturndeck': ['endOfTurnDeck'],
    'endofturnDeck': ['endOfTurnDeck'],
    'endOfTurnDeck': ['endOfTurnDeck'],
    'end-Of-Turn-Deck': ['endOfTurnDeck'],
    'end-of-turn-deck': ['endOfTurnDeck'],
    
    // Age paths using fullDeckRegionPathMap
    'purplepath': [fullDeckRegionPathMap.ageOfExpansion.pathKey],
    'bluepath': [fullDeckRegionPathMap.ageOfResistance.pathKey],
    'cyanpath': [fullDeckRegionPathMap.ageOfReckoning.pathKey],
    'pinkpath': [fullDeckRegionPathMap.ageOfLegacy.pathKey]
};

// Check the actual export names and fix if necessary
console.log("Loaded Cards:", Object.keys(CARD_DATA));

// Card State Management
let cardState = {
    decks: {
        [deckType.ageOfExpansionDeck]: [],
        [deckType.ageOfResistanceDeck]: [],
        [deckType.ageOfReckoningDeck]: [],
        [deckType.ageOfLegacyDeck]: [],
        [deckType.endOfTurnDeck]: []
    },
    discardPiles: {
        [deckType.ageOfExpansionDeck]: [],
        [deckType.ageOfResistanceDeck]: [],
        [deckType.ageOfReckoningDeck]: [],
        [deckType.ageOfLegacyDeck]: [],
        [deckType.endOfTurnDeck]: []
    },
    initialized: false
};

let currentCard = null;
let currentPlayer = null;
let currentOnComplete = null;

// ===== Core Functions =====

/**
 * Initializes card decks from imported data and shuffles them.
 */
export function setupDecks() {
    console.log("Setting up card decks...");
    try {
        // Load and shuffle Age of Expansion (Purple)
        if (Array.isArray(ageOfExpansionDeck) && ageOfExpansionDeck.length > 0) {
            cardState.decks[deckType.ageOfExpansionDeck] = [...ageOfExpansionDeck];
            cardState.discardPiles[deckType.ageOfExpansionDeck] = [];
            shuffleDeck(deckType.ageOfExpansionDeck);
            console.log(`Deck ${deckType.ageOfExpansionDeck} loaded with ${cardState.decks[deckType.ageOfExpansionDeck].length} cards.`);
        } else {
            console.error(`Failed to load Age of Expansion cards.ageOfExpansionDeck=${ageOfExpansionDeck ? 'exists' : 'undefined'}`);
            return false;
        }

        // Load and shuffle Age of Resistance (Blue)
        if (Array.isArray(ageOfResistanceDeck) && ageOfResistanceDeck.length > 0) {
            cardState.decks[deckType.ageOfResistanceDeck] = [...ageOfResistanceDeck];
            cardState.discardPiles[deckType.ageOfResistanceDeck] = [];
            shuffleDeck(deckType.ageOfResistanceDeck);
            console.log(`Deck ${deckType.ageOfResistanceDeck} loaded with ${cardState.decks[deckType.ageOfResistanceDeck].length} cards.`);
        } else {
            console.log(`Failed to load Age of Resistance (ageOfResistanceDeck) cards. Data is missing, empty, or not an array.`);
            return false;
        }

        // Load and shuffle Age of Reckoning (Cyan)
        if (Array.isArray(ageOfReckoningDeck) && ageOfReckoningDeck.length > 0) {
            cardState.decks[deckType.ageOfReckoningDeck] = [...ageOfReckoningDeck];
            cardState.discardPiles[deckType.ageOfReckoningDeck] = [];
            shuffleDeck(deckType.ageOfReckoningDeck);
            console.log(`Deck ${deckType.ageOfReckoningDeck} loaded with ${cardState.decks[deckType.ageOfReckoningDeck].length} cards.`);
        } else {
            console.log(`Failed to load Age of Reckoning (ageOfReckoningDeck) cards. Data is missing, empty, or not an array.`);
            return false;
        }

        // Load and shuffle Age of Legacy (Pink)
        if (Array.isArray(ageOfLegacyDeck) && ageOfLegacyDeck.length > 0) {
            cardState.decks[deckType.ageOfLegacyDeck] = [...ageOfLegacyDeck];
            cardState.discardPiles[deckType.ageOfLegacyDeck] = [];
            shuffleDeck(deckType.ageOfLegacyDeck);
            console.log(`Deck ${deckType.ageOfLegacyDeck} loaded with ${cardState.decks[deckType.ageOfLegacyDeck].length} cards.`);
        } else {
            console.log(`Failed to load Age of Legacy (ageOfLegacyDeck) cards. Data is missing, empty, or not an array.`);
            return false;
        }

        // Load and shuffle End of Turn cards
        if (Array.isArray(endOfTurnDeck) && endOfTurnDeck.length > 0) {
            cardState.decks[deckType.endOfTurnDeck] = [...endOfTurnDeck];
            cardState.discardPiles[deckType.endOfTurnDeck] = [];
            shuffleDeck(deckType.endOfTurnDeck);
            console.log(`End of Turn deck loaded with ${cardState.decks[deckType.endOfTurnDeck].length} cards.`);
        } else {
            console.log("Failed to load End of Turn (endOfTurnDeck) cards. Data is missing, empty, or not an array.");
            return false;
        }

        cardState.initialized = true;
        console.log("All card decks have been set up successfully.");
        return true;
    } catch (error) {
        console.error("An unexpected error occurred during deck setup:", error);
        cardState.initialized = false;
        return false;
    }
};

/**
 * Shuffles a specified deck using the Fisher-Yates algorithm.
 */
function shuffleDeck(deckType) {
    let deck = cardState.decks[deckType];
    if (!deck) return;

    console.log(`Shuffling ${deckType} deck...`);
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]]; // Swap
    }
};

/**
 * Animates a card being drawn with proper timing for CPU vs Human
 * @param {string} deckType - The type of deck to animate from
 * @returns {Promise} Resolves when animation and card display completes
 */
/**
 * Draws a card from the specified deck and displays it
 * @param {string} deckType - Type of deck to draw from (e.g., 'ageOfExpansion', 'endOfTurn')
 * @param {Object} player - Player drawing the card
 * @returns {Promise} Resolves when card is drawn and displayed
 */
export async function drawCard(deckType, player) {
    console.log('---------drawCard---------');
    console.log(`Drawing card from ${deckType} deck for player:`, player?.name || 'Unknown');
    
    // Clear any existing card first
    if (state.currentCard) {
        console.log('Clearing current card before drawing new one:', state.currentCard.name);
        discardCard(state.currentCard, state.currentDeck);
    }
    
    const ctx = state.board.ctx;
    if (!ctx) {
        console.warn('No canvas context available for animation');
        return Promise.resolve(); // fail-safe fallback
    }

    // Get deck region configuration
    const deckConfig = Object.values(fullDeckRegionPathMap).find(r => r.deckType === deckType);
    if (!deckConfig) {
        console.warn(`No deck configuration found for type: ${deckType}`);
        return Promise.resolve(); // fail-safe fallback
    }

    // Pick a position (random for endOfTurnDeck)
    const positions = deckConfig.positions;
    const position = (deckType === 'endOfTurnDeck')
        ? positions[Math.floor(Math.random() * positions.length)]
        : positions[0];

    // Get coordinates
    const { topleft, toplefty, bottomrightx, bottomright } = position;
    const cardX = topleft;
    const cardY = toplefty;
    const cardWidth = bottomrightx - topleft;
    const cardHeight = bottomright - toplefty;

    // Animation logic
    return new Promise((resolve) => {
        let startTime = null;

        function animate(currentTime) {
            if (!startTime) startTime = currentTime;
            const elapsed = currentTime - startTime;

            ctx.clearRect(cardX, cardY, cardWidth, cardHeight);

            if (elapsed < TIMING.CARD_DRAW) {
                const progress = elapsed / TIMING.CARD_DRAW;
                const scale = 1 + (0.2 * Math.sin(progress * Math.PI));
                const scaledWidth = cardWidth * scale;
                const scaledHeight = cardHeight * scale;
                const offsetX = (scaledWidth - cardWidth) / 2;
                const offsetY = (scaledHeight - cardHeight) / 2;

                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.fillRect(
                    cardX - offsetX,
                    cardY - offsetY,
                    scaledWidth,
                    scaledHeight
                );

                requestAnimationFrame(animate);
            } else {
                resolve();
            }
        }

        requestAnimationFrame(animate);
    }).then(() => {
        // Draw the actual card from the deck
        if (!cardState.initialized || !cardState.decks[deckType]) {
            console.log(`Cannot draw card: Deck type ${deckType} not initialized or invalid.`);
            return;
        }

        let deck = cardState.decks[deckType];
        let discardPile = cardState.discardPiles[deckType];

        if (deck.length === 0) {
            console.log(`${deckType} deck empty. Reshuffling discard pile...`);
            if (discardPile.length === 0) {
                console.warn(`Cannot draw card: ${deckType} deck and discard pile are both empty.`);
                return;
            }
            // Move discard pile to deck and shuffle
            cardState.decks[deckType] = [...discardPile];
            cardState.discardPiles[deckType] = [];
            shuffleDeck(deckType);
            deck = cardState.decks[deckType]; // Update reference
        }

        const drawnCard = deck.pop(); // Draw from the end (top) of the deck
        
        if (!drawnCard) {
            console.log(`Popped an undefined card from ${deckType}. Deck state:`, deck);
            return;
        }
        
        console.log(`Drawn card from ${deckType}: ${drawnCard.name}`);
        
        // Store the current deck type in state
        state.currentDeckType = deckType;
        
        if (drawnCard && typeof showCard === 'function') {
            showCard(drawnCard, player);
        } else {
            console.warn('showCard function not defined or no card drawn');
        }
    });
};

/**
 * Discards a card to the appropriate discard pile and cleans up UI elements
 * @param {Object} card - The card to discard
 * @param {string} deckType - The type of deck the card belongs to
 */
export function discardCard(card, deckType) {
    console.log('---------discardCard---------')
    console.log(`Discarding card: ${card?.name || 'Unknown'}`);
    console.log(`Target deck: ${deckType || 'Unknown'}`);
    
    // Clear card data from all dialogs
    document.querySelectorAll('dialog').forEach(dialog => {
        if (dialog.dataset.cardData) {
            console.log(`Removing card data from dialog: ${dialog.id || 'unnamed'}`);
            delete dialog.dataset.cardData;
        }
    });
    
    // Add card to discard pile if valid
    if (!cardState.initialized || !deckType || !cardState.discardPiles[deckType]) {
        console.warn(`Cannot discard card: Deck type ${deckType} not initialized or invalid.`);
        return;
    }
    
    if (!card) {
        console.warn('Attempted to discard an invalid card object.');
        return;
    }
    
    cardState.discardPiles[deckType].push(card);
    console.log(`Card ${card.name} discarded to ${deckType}. Pile size: ${cardState.discardPiles[deckType].length}`);
    
    // Clear current card from state
    if (state.currentCard) {
        console.log('Clearing current card from state');
        state.currentCard = null;
        state.currentDeck = null;
    }
    
    // Trigger UI update
    const event = new CustomEvent('cardDiscarded', { detail: { card, deckType } });
    document.dispatchEvent(event);
};

/**
 * Applies the effects listed on the current card to the target player(s).
 */
export async function applyCardEffect(player) {
    console.log('---------applyCardEffect---------')
    const card = state.currentCard;
    if (!card || !player) {
        console.warn("Cannot apply card effect: No current card or invalid player.", { currentCard: card, player });
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
        
        // Find effects for the player's role (convert to PascalCase to match card data)
        const pascalCaseRole = player.role.charAt(0).toUpperCase() + player.role.slice(1).toLowerCase();
        const roleEffects = card.effects[pascalCaseRole];
        if (roleEffects) {
            console.log(`Applying ${player.role}-specific effects:`, roleEffects);
            
            // If the role effects is an array, process each effect
            if (Array.isArray(roleEffects)) {
                roleEffects.forEach(effect => processEffect(effect, player, player));
            }
            // If it's a single effect object, process it directly
            else if (typeof roleEffects === 'object') {
                processEffect(roleEffects, player, player);
            }
        } else {
            console.error(`No specific effects defined for ${player.role} role.`);
            
            // Check if there's a generic "ALL" key for effects that apply to all roles
            if (card.effects.ALL) {
                const allEffects = card.effects.ALL;
                if (Array.isArray(allEffects)) {
                    allEffects.forEach(effect => processEffect(effect, player, player));
                } else {
                    processEffect(allEffects, player, player);
                }
            }
        }
        
        // Call processEndPlayerTurn after applying effects
        processEndPlayerTurn();
        return;
    }
    
    // Case 2: Effects as an array (original format)
    if (Array.isArray(card.effects)) {
        card.effects.forEach(effect => processEffect(effect, player, player));
        
        // Call processEndPlayerTurn after applying effects
        processEndPlayerTurn();
        return;
    }
    
    // If we get here, the effects property has an unexpected format
    console.log(`Card "${card.name}" effects has an unexpected format:`, card.effects);
    
    // Call processEndPlayerTurn even if effects format is unexpected
    processEndPlayerTurn();
};

/**
 * Process a single effect, handling immunity and applying the correct effect type
 * @param {object} effect - The effect object from the card.
 * @param {object} player - The target player of the effect.
 * @param {object} sourcePlayer - The player who initiated the effect (drew the card).
 */
function processEffect(effect, player, sourcePlayer) {
    console.log('---------processEffect---------');
    console.log(` Processing effect: ${JSON.stringify(effect)} for target ${player.name} from source ${sourcePlayer.name}`);
    
    // Define the target player based on the effect's target property if it exists
    let targetPlayer = player; // Default target is the player passed in (often source player)
    if (effect.target === 'OTHER') {
        targetPlayer = getRandomOtherPlayer(sourcePlayer);
        if (!targetPlayer) {
            console.log(`Effect targeted OTHER, but no other player found.`);
            return; // Cannot apply effect if no target
        }
        console.log(` Effect target is OTHER: ${targetPlayer.name}`);
        // For effects targeting others, the 'player' arg might be misleading, use targetPlayer
    } else if (effect.target === 'SELF') {
        targetPlayer = sourcePlayer; // Explicitly target the source player
        console.log(` Effect target is SELF: ${targetPlayer.name}`);
    } 
    // If no target property, assume the effect applies to the sourcePlayer (player who drew card)
    else if (!effect.target) {
         targetPlayer = sourcePlayer;
    }
    
    // Apply the effect based on its type
    switch (effect.type) {
        case 'RESOURCE_CHANGE':
            // Applies to the player object passed in (usually the source) unless target logic modifies it
            applyResourceChange(effect, targetPlayer); 
            break;
        case 'MOVEMENT':
            // applyMovement determines target internally based on effect.target
            applyMovement(effect, sourcePlayer); 
            break;
        case 'STEAL':
            case 'STEAL':
                // delay steal for player interaction
                if (sourcePlayer.isAI) {
                  const validTargets = getValidStealTargets(sourcePlayer, getPlayers(), effect);
                  const target = getRandom(validTargets);
                  const rate = getResistanceRate(target, effect.resource);
                  applyStealEffect(effect, target, sourcePlayer, Math.floor(effect.amount * rate));
                } else {
                  showStealPopover(effect, sourcePlayer, getPlayers());
                }
                break;
        case 'SKIP_TURN':
             // applySkipTurn determines target internally based on effect.target
             applySkipTurn(effect, sourcePlayer);
             break;
        case 'CHANGE_PATH':
        case 'STEAL_FROM_ALL':
            handleStealFromAll(effect, sourcePlayer, getPlayers());
            break;
        default:
            console.warn(`Unknown card effect type: ${effect.type}`);
    }
};

function applyResourceChange(effect, player) {
    console.log('---------applyResourceChange---------');
    console.log(` Applying RESOURCE_CHANGE to ${player.name}:`, effect.changes);
    // effect.changes should be an object like { knowledge: 10, money: -5 }
    updatePlayerResources(player, effect.changes ?? effect);
    updateResourcePanel(player); 
};

function applyMovement(effect, player) {
    // player here is the sourcePlayer passed from processEffect
    console.log(` Processing MOVEMENT effect initiated by ${player.name}:`, effect);

    let targetPlayerForMove = null;
    if (effect.target === 'SELF') {
        targetPlayerForMove = player;
    } else if (effect.target === 'OTHER') {
        targetPlayerForMove = getRandomOtherPlayer(player);
        if (!targetPlayerForMove) {
            console.log("No other player found for MOVEMENT effect.");
            return; 
        }
        console.log(` Target for movement effect is other player: ${targetPlayerForMove.name}`);
    } else {
        // If target is not specified, assume SELF
        targetPlayerForMove = player; 
    }
    
    // Pass the responsibility to game.js
    handleCardMovement(targetPlayerForMove, effect);
};

function applySkipTurn(effect, player) {
    // player here is the sourcePlayer passed from processEffect
    console.log(` Processing SKIP_TURN initiated by ${player.name}:`, effect);
    let target = null;
    if (effect.target === 'SELF') {
        target = player;
    } else if (effect.target === 'OTHER') {
         target = getRandomOtherPlayer(player);
    } else {
         // If target is not specified, assume SELF
         target = player; 
    }
    
    if (!target) {
         console.log("No target found for SKIP_TURN effect.");
         return;
    }
    
    console.log(` Player ${target.name} will skip their next turn.`);
    setPlayerSkipTurn(target, true); 
};

    /**
 * Displays a card in the UI with appropriate animations and interactions
 * @param {Object} card - The card to display
 * @param {Object} player - The player viewing the card
 * @param {Function} onComplete - Callback when card is closed
 */
export async function showCard(card, player, onComplete) {
    console.log('---------showCard---------')
    
    // Get deck type from state
    const deckType = state.currentDeckType || 'unknown';
    console.log(`Displaying card: ${card?.name || 'Unknown'} from ${deckType} deck`);
    
    const deckMeta = deckInfo[deckType];
    const isAI = player && !player.isHuman;
    const isEndOfTurnCard = deckType === 'endOfTurnDeck' || 
        (card.type && card.type.includes('endOfTurn')) ||
        (card.deck && card.deck.includes('endOfTurn'));
    const isAgeDeck = /^ageOf/i.test(deckType);
    
    // Enhanced logging for deck type detection
    console.log(`[showCard] Deck Type Analysis:`);
    console.log(`- deckType: ${deckType}`);
    console.log(`- isEndOfTurnCard: ${isEndOfTurnCard} (deckType match: ${deckType === 'endOfTurnDeck'}, card.type: ${card?.type}, card.deck: ${card?.deck})`);
    console.log(`- isAgeDeck: ${isAgeDeck} (regex test: ${/^age-Of/i.test(deckType)})`);
    console.log(`- Card has choice: ${!!card?.choice}`);
    if (card?.choice) {
        console.log(`  - Option A effects: ${card.choice.optionA?.effects ? 'Present' : 'None'}`);
        console.log(`  - Option B effects: ${card.choice.optionB?.effects ? 'Present' : 'None'}`);
    }

    if (isEndOfTurnCard) console.log('Card details:', JSON.stringify({
        id: card?.id,
        type: card?.type,
        hasChoice: !!card?.choice,
        effects: card?.effects ? 'Present' : 'None'
    }, null, 2));
    else console.log('Card details:', JSON.stringify({
        id: card?.id,
        type: card?.type,
        hasChoice: !!card?.choice,
        effects: {
            optionA: card?.choice?.optionA?.effects? 'Present' : 'None',
            optionB: card?.choice?.optionB?.effects? 'Present' : 'None'
        }
    }, null, 2));
    
    // Store current card in state
    state.currentCard = card;
    state.currentDeck = deckType;

    document.querySelectorAll('[data-deck-id]').forEach(popover => {
        popover.style.display = 'none';
    });

    let dialog = document.querySelector(`[data-deck-id="${deckType}"]`)?.closest('dialog') 
              || document.getElementById('card-Popover');
    if (!dialog) {
        console.error("No valid dialog found");
        if (typeof onComplete === 'function') onComplete();
        return;
    }

    const popoverContent = dialog.querySelector(`[data-deck-id="${deckType}"]`) 
                        || dialog.querySelector('.popover-Content') 
                        || dialog;
    if (popoverContent) popoverContent.style.display = 'block';

    dialog.className = 'popover';
    if (deckMeta?.color) dialog.classList.add(`card-${deckType}`);
    else if (card?.color) dialog.classList.add(`card-${card.color}`);

    // Set up basic card content before showing modal
    const titleEl = dialog.querySelector('#card-Title');
    const descEl = dialog.querySelector('#card-Description');
    const effectsEl = dialog.querySelector('#card-Effects');
    const showDetailsButton = dialog.querySelector('#show-Card-Details-Button');
    const closeCardButton = dialog.querySelector('#close-Card-Button');

    if (titleEl) titleEl.textContent = card.name || 'Card';

    let resourceSummary = '';
    if (Array.isArray(card.effects)) {
        card.effects.forEach(effect => {
            if (effect.type === 'RESOURCE_CHANGE' && effect.changes) {
                const formatted = formatResourceChanges(effect.changes);
                if (formatted) {
                    let target = effect.target === 'OTHER' ? ' (Target: Other)' :
                                 (effect.target && effect.target !== 'SELF' ? ` (Target: ${effect.target})` : '');
                    resourceSummary += `<p><span class="effect-icon">💰</span> <strong>Effect${target}:</strong> ${formatted}</p>`;
                }
            } else if (effect.type === 'MOVEMENT') {
                resourceSummary += `<p><span class="effect-icon">🚶</span> <strong>Effect:</strong> Move ${effect.spaces}</p>`;
            } else if (effect.type === 'SKIP_TURN') {
                resourceSummary += `<p><span class="effect-icon">⏭️</span> <strong>Effect:</strong> Skip Turn</p>`;
            } else if (effect.type === 'STEAL') {
                resourceSummary += `<p><span class="effect-icon">🔄</span> <strong>Effect:</strong> Steal ${effect.amount} ${effect.resource}</p>`;
            } else if (effect.type === 'STEAL_FROM_ALL') {
                resourceSummary += `<p><span class="effect-icon">🤝</span> <strong>Effect:</strong> Alliance Offer</p>`;
            }
        });
    } else if (typeof card.effects === 'object' && isEndOfTurnCard) {
        resourceSummary += `<p><span class="effect-icon">💡</span><i>(Effects vary by role - click below for details)</i></p>`;
    }

    if (descEl) {
        descEl.innerHTML = `<div class="card-description">${card.description || ''}</div>
                            <div class="card-effects-summary">${resourceSummary}</div>`;
    }

    if (effectsEl) {
        effectsEl.innerHTML = '';
        effectsEl.style.display = 'none';
    }

    if (showDetailsButton) {
        showDetailsButton.style.display = isAgeDeck ? 'none' : 'block';
        showDetailsButton.disabled = false;
        showDetailsButton.onclick = () => {
            let explanationHTML = '';
            if (isEndOfTurnCard && player?.role) {
                const allRoles = ['Colonialist', 'Revolutionary', 'Historian', 'Entrepreneur', 'Politician', 'Artist'];
                explanationHTML += "<div class='role-effects-container'><h3>Effects for All Roles:</h3><ul class='role-effects-list'>";
                allRoles.forEach(role => {
                    const roleEffect = card.effects[role];
                    if (roleEffect) {
                        const changes = roleEffect.changes || {};
                        const changeText = [
                            changes.money !== undefined ? `${changes.money >= 0 ? '+' : ''}${changes.money} Money` : '',
                            changes.knowledge !== undefined ? `${changes.knowledge >= 0 ? '+' : ''}${changes.knowledge} Knowledge` : '',
                            changes.influence !== undefined ? `${changes.influence >= 0 ? '+' : ''}${changes.influence} Influence` : ''
                        ].filter(Boolean).join(', ');

                        const fullText = `<span class='role-name'>${role}:</span> <span class='resource-changes'>[${changeText}]</span> <span class='effect-explanation'>${roleEffect.explanation || ''}</span>`;
                        const currentClass = role === player.role ? 'current-role' : '';
                        explanationHTML += `<li class="role-effect ${currentClass}">${fullText}</li>`;
                    } else {
                        explanationHTML += `<li class='role-effect'><span class='role-name'>${role}:</span> No effect defined.</li>`;
                    }
                });
                explanationHTML += "</ul></div>";
            } else if (Array.isArray(card.effects)) {
                explanationHTML += '<p><strong>Card Effects:</strong></p><ul>';
                card.effects.forEach(effect => {
                    explanationHTML += `<li>${effect.Description || JSON.stringify(effect)}</li>`;
                });
                explanationHTML += '</ul>';
            }

            if (effectsEl) {
                effectsEl.innerHTML = explanationHTML;
                effectsEl.style.display = 'block';
            }
            showDetailsButton.style.display = 'none';
        };
    }
    
    if (closeCardButton) {
        closeCardButton.onclick = () => {
            dialog.close();
            state.currentCard = card; // Ensure current card is set
            applyCardEffect(player);
            if (typeof onComplete === 'function') onComplete();
        };
    }

    dialog.dataset.cardData = JSON.stringify(card);
    currentCard = card;
    currentPlayer = player;

    // Show dialog first - safer DOM element selection timing
    dialog.showModal();
    
    // Re-query DOM elements after modal is shown for safer selection
    if (isAgeDeck) {
        const cardChoiceColumnA = dialog.querySelector('.card-Choice-A-Column');
        const cardChoiceColumnB = dialog.querySelector('.card-Choice-B-Column');
        const optionAButton = dialog.querySelector('.optionAButton');
        const optionBButton = dialog.querySelector('.optionBButton');
        
        // Clear buttons - remove old event listeners by cloning
        const cleanOptionAButton = optionAButton.cloneNode(true);
        const cleanOptionBButton = optionBButton.cloneNode(true);
        optionAButton.replaceWith(cleanOptionAButton);
        optionBButton.replaceWith(cleanOptionBButton);
        
        // Remove any old effect paragraphs
        const oldEffectsA = cardChoiceColumnA.querySelectorAll('p');
        const oldEffectsB = cardChoiceColumnB.querySelectorAll('p');
        oldEffectsA.forEach(p => p.remove());
        oldEffectsB.forEach(p => p.remove());
        
        // Get fresh references after cloning
        const freshOptionAButton = dialog.querySelector('.optionAButton');
        const freshOptionBButton = dialog.querySelector('.optionBButton');
        
        // Set up Option A
        if (freshOptionAButton && card.choice.optionA) {
            freshOptionAButton.textContent = card.choice.optionA.text || 'Option A';
            freshOptionAButton.style.display = 'inline-block';
            freshOptionAButton.disabled = false;
            
            freshOptionAButton.onclick = () => {
                console.log('Age Deck Option A selected');
                freshOptionAButton.style.display = 'none';
                
                if (card.choice.optionA.effects?.length) {
                    card.choice.optionA.effects.forEach(effect => {
                        getEffectDescription(effect).forEach(desc => {
                            const p = document.createElement('p');
                            p.textContent = desc;
                            cardChoiceColumnA.appendChild(p);
                        });
                    });
                }
                
                setTimeout(() => {
                    dialog.close();
                    applyAgeCardEffect(card.choice.optionA.effects, player);
                    if (typeof onComplete === 'function') onComplete();
                }, 5000);
            };
        }
        
        // Set up Option B
        if (freshOptionBButton && card.choice.optionB) {
            freshOptionBButton.textContent = card.choice.optionB.text || 'Option B';
            freshOptionBButton.style.display = 'inline-block';
            freshOptionBButton.disabled = false;
            
            freshOptionBButton.onclick = () => {
                console.log('Age Deck Option B selected');
                freshOptionBButton.style.display = 'none';

                if (card.choice.optionB.effects?.length) {
                    card.choice.optionB.effects.forEach(effect => {
                        getEffectDescription(effect).forEach(desc => {
                            const p = document.createElement('p');
                            p.textContent = desc;
                            cardChoiceColumnB.appendChild(p);
                        });
                    });
                }
                
                setTimeout(() => {
                    dialog.close();
                    applyAgeCardEffect(card.choice.optionB.effects, player);
                    if (typeof onComplete === 'function') onComplete();
                }, 5000);
            };
        }
    }
    
    // Handle AI player auto-choice
    if (isAI) {
        console.log('AI player handling card:', card.name);
        setTimeout(() => {
            if (!dialog.open) return;
            
            console.log('AI making choice for card:', card.name);
            dialog.close();
            
            if (isEndOfTurnCard) {
                console.log('Applying end of turn card effects');
                state.currentCard = card; // Ensure current card is set
                drawBoard();
                applyCardEffect(player);
            } else if (card.choice) {
                // AI always chooses option A for now
                console.log('AI choosing option A');
                if (isAgeDeck) {
                    drawBoard();
                    applyAgeCardEffect(card.choice.optionA.effects, player);
                } else {
                    state.currentCard = { ...card, effects: card.choice.optionA.effects };
                    drawBoard();
                    applyCardEffect(player);
                }
            } else if (card.effects) {
                console.log('Applying direct effects');
                if (isAgeDeck) {
                    drawBoard();
                    applyAgeCardEffect(card.effects, player);
                } else {
                    state.currentCard = card; // Ensure current card is set
                    drawBoard();
                    applyCardEffect(player);
                }
            }
            
            if (typeof onComplete === 'function') {
                onComplete();
            }
        }, 5000); // 5 second delay for AI
    } else if (card.effects && !card.choice) {
        // For non-choice cards with effects, apply them immediately for human players
        console.log('Applying immediate effects for non-choice card');
        if (isAgeDeck) {
            drawBoard();
            applyAgeCardEffect(card.effects, player);
        } else {
            drawBoard();
            applyCardEffect(card.effects, player);
        }
    }
    
    return dialog;
}

function formatResourceChanges(changes) {
    const result = [];
    if (changes.money !== undefined) result.push(`${changes.money >= 0 ? '+' : ''}${changes.money}💰`);
    if (changes.knowledge !== undefined) result.push(`${changes.knowledge >= 0 ? '+' : ''}${changes.knowledge}📚`);
    if (changes.influence !== undefined) result.push(`${changes.influence >= 0 ? '+' : ''}${changes.influence}🎭`);
    return result.join(', ');
}

// Hide card popover
export function hideCard() {
    console.log('---------hideCard---------')
    const { ui } = state;
    const popoverContainer = ui.elements.cardPopoverContainer;
    const popover = ui.elements.popover;
    const effectsEl = ui.elements.cardEffects;
    const showDetailsButton = ui.elements.showCardDetailsButton;

    if (!popover) return;
    console.log("Hiding card popover");
    
    // Add reverse animation
    const cardPopover = popover.querySelector('.card-Popover');
    if (cardPopover) {
        cardPopover.style.animation = 'cardFlip 0.3s reverse';
        // Wait for animation to complete before hiding
        setTimeout(() => {
            popover.style.display = 'none';
            // Reset animation for next time
            cardPopover.style.animation = '';
            // Redraw the canvas after hiding the popover
            redrawCanvas();
        }, 500);
    } else {
        popover.style.display = 'none';
        // Redraw the canvas immediately if no animation
        redrawCanvas();
    }
    
    // Reset effects visibility for next time
    if (effectsEl) {
        effectsEl.style.display = 'none';
        effectsEl.innerHTML = '';
    }
    if (showDetailsButton) {
        showDetailsButton.style.display = 'block'; // Or 'inline-block'
    }
    
    // Stop any deck highlighting
    clearDeckHighlights();
    
    // Ensure canvas is redrawn
    function redrawCanvas() {
        const canvas = document.getElementById('gameCanvas');
        if (canvas) {
            const ctx = canvas.getContext('2d');
            // Trigger a redraw by dispatching a custom event that the board will listen for
            const event = new CustomEvent('redrawCanvas');
            document.dispatchEvent(event);
        }
    }
};

/**
 * Process a single effect, handling immunity and applying the correct effect type
 * @param {object} effect - The effect object from the card.
 * @param {object} player - The target player of the effect.
 * @param {object} sourcePlayer - The player who initiated the effect (drew the card).
 */
export function applyAgeCardEffect(effect, player, sourcePlayer) {
    console.log('---------applyAgeCardEffect---------');
    console.log(` Processing effect: ${JSON.stringify(effect)} for target ${player.name} from source ${sourcePlayer ? sourcePlayer.name : 'unknown'}`);
    
    // Define the target player based on the effect's target property if it exists
    let targetPlayer = player; // Default target is the player passed in (often source player)
    if (effect.target === 'OTHER') {
        targetPlayer = getRandomOtherPlayer(sourcePlayer);
        if (!targetPlayer) {
            console.log(`Effect targeted OTHER, but no other player found.`);
            return; // Cannot apply effect if no target
        }
        console.log(` Effect target is OTHER: ${targetPlayer.name}`);
        // For effects targeting others, the 'player' arg might be misleading, use targetPlayer
    } else if (effect.target === 'SELF') {
        targetPlayer = sourcePlayer; // Explicitly target the source player
        console.log(` Effect target is SELF: ${targetPlayer.name}`);
    } 
    // If no target property, assume the effect applies to the sourcePlayer (player who drew card)
    else if (!effect.target) {
         targetPlayer = sourcePlayer;
    }
    
    // Apply the effect based on its type
    switch (effect.type) {
        case 'RESOURCE_CHANGE':
            // Applies to the player object passed in (usually the source) unless target logic modifies it
            updatePlayerResources(targetPlayer, effect.changes ?? effect); 
            break;
        case 'MOVEMENT':
            // applyMovement determines target internally based on effect.target
            handleCardMovement(effect, sourcePlayer); 
            break;
        case 'STEAL':
             // Source player steals from the target player
             applySteal(effect, targetPlayer, sourcePlayer);
             break;
        case 'SKIP_TURN':
             // applySkipTurn determines target internally based on effect.target
             applySkipTurn(effect, sourcePlayer);
             break;
        case 'STEAL_FROM_ALL':
             // Source player steals from all others
             applyStealFromAll(effect, sourcePlayer);
             break;
        default:
            console.warn(`Unknown card effect type: ${effect.type}`);
            if (!player.isHuman) {
                updatePlayerResources(player, effect.changes ?? effect);
                handleEndTurn();
            } else {
                updatePlayerResources(player, effect.changes ?? effect);
                handleEndTurn();
            }
            break;
    }
};

export function isEndOfTurnCard(card) {
    console.log('---------isEndOfTurnCard---------');
    return card && (
        (card.type && card.type.includes('endOfTurn')) ||
        (card.deck && card.deck.includes('endOfTurn'))
    );
}
