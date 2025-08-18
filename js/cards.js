// Import card data directly from JS files
import { endOfTurnDeck } from '../assets/Cards/Endofturncards.js';
import { ageOfExpansionDeck } from '../assets/Cards/AgeOfExpansionCards.js';
import { ageOfLegacyDeck } from '../assets/Cards/AgeOfLegacyCards.js';
import { ageOfReckoningDeck } from '../assets/Cards/AgeOfReckoningCards.js';
import { ageOfResistanceDeck } from '../assets/Cards/AgeOfResistanceCards.js';

// Import game modules
import { 
    state, 
    isActionAllowed 
} from './state.js';

import { 
    updatePlayerInfo,
    playClickSound,
} from './ui.js';

import { 
    fullDeckRegionPathMap 
} from './board-data.js';

import { 
    drawBoard 
} from './board.js';

import { 
    handleEndTurn, 
    processEndPlayerTurn, 
    getCurrentPlayer, 
} from './game.js';
import { 
    applyCardEffect, 
    applyResourceChange, 
    handleCardMovement,
    applyAgeCardEffect,
    updateResourceDisplays
} from './resourceManagement.js';

// Helper function for promise-based delays
export function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

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

export const deckInfo = {
    ageOfExpansionDeck: fullDeckRegionPathMap.ageOfExpansion.deckType,
    ageOfResistanceDeck: fullDeckRegionPathMap.ageOfResistance.deckType,
    ageOfReckoningDeck: fullDeckRegionPathMap.ageOfReckoning.deckType,
    ageOfLegacyDeck: fullDeckRegionPathMap.ageOfLegacy.deckType,
    
    endOfTurnDeck: 'endOfTurnDeck'
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
//console.log("Loaded Cards:", Object.keys(CARD_DATA));

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
        //Load and shuffle Age of Expansion (Purple)
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
            onsole.log(`Failed to load Age of Resistance (ageOfResistanceDeck) cards. Data is missing, empty, or not an array.`);
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

    //console.log(`Shuffling ${deckType} deck...`);
    for (let i = deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[j]] = [deck[j], deck[i]]; // Swap
    }
};

/**
 * Draws a card from the specified deck and displays it
 * @param {string} deckType - Type of deck to draw from (e.g., 'ageOfExpansion', 'endOfTurn')
 * @param {Object} player - Player drawing the card
 * @returns {Promise} Resolves when card is drawn and displayed
 */
export function drawCard(deckType) {
    console.log('===============drawCard===============');
    if (!isActionAllowed('PLAYING, MOVING, TURN_TRANSITION, AWAITING_PATH_CHOICE')) return;
        
    const player = getCurrentPlayer();
    if (!player) {
        console.error('No current player found');
        return;
    }
    // Clear any existing card first
    if (state.currentCard) {
        //console.log('Clearing current card before drawing new one:', state.currentCard.name);
    }
    //console.log(`Drawing card from ${deckType} deck for player:`, player.name);

    // Get deck region configuration
    const deckConfig = Object.values(fullDeckRegionPathMap).find(r => r.deckType === deckType);
    if (!deckConfig) {
        console.warn(`No deck configuration found for type: ${deckType}`);
        return; // fail-safe fallback
    }

    // Pick a position (random for endOfTurnDeck)
    const positions = deckConfig.positions;
    const position = (deckType === 'endOfTurnDeck')
        ? positions[Math.floor(Math.random() * positions.length)]
        : positions[0];6

    // Get coordinates
    const { topleft, toplefty, bottomrightx, bottomright } = position;
    const cardX = topleft;
    const cardY = toplefty;
    const cardWidth = bottomrightx - topleft;
    const cardHeight = bottomright - toplefty;

    // Draw the actual card from the deck
    if (!cardState.initialized || !cardState.decks[deckType]) {
        //console.log(`Cannot draw card: Deck type ${deckType} not initialized or invalid.`);
        return;
    }

    let deck = cardState.decks[deckType];
    let discardPile = cardState.discardPiles[deckType];

    if (deck.length === 0) {
        //console.log(`${deckType} deck empty. Reshuffling discard pile...`);
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

    const card = deck.pop(); // Draw from the end (top) of the deck
    
    if (!card) {
        //console.log(`Popped an undefined card from ${deckType}. Deck state:`, deck);
        return;
    }
    
    //console.log(`Drawn card from ${deckType}: ${card.name}`);
    
    // Store the current deck type in state
    state.currentCard = card; 
    state.currentDeck = deckType;
    
    // Set flag if this is an end-of-turn card
    if (deckType === 'endOfTurnDeck') {
        // No longer setting window.hasDrawnEndOfTurnCard here
    }
    
    if (card && typeof showCard === 'function') {
        showCard(card);
       
    } else {
        console.warn('showCard function not defined or no card drawn');
    }
}

/**
 * Discards a card to the appropriate discard pile and cleans up UI elements
 * @param {Object} card - The card to discard
 * @param {string} deckType - The type of deck the card belongs to
 */
export function discardCard(card, deckType) {
    console.log('===============discardCard===============')
    //console.log(`Discarding card: ${card?.name || 'Unknown'}`);

    function clearCardDialogContent(dialog) {
        const titleEl = dialog.querySelector('#card-Title');
        const descEl = dialog.querySelector('#card-Description');
        const effectsEl = dialog.querySelector('#card-Effects');
        const choiceCols = dialog.querySelectorAll('.card-Choice-A-Column, .card-Choice-B-Column');
    
        if (titleEl) titleEl.textContent = ''; // keeps element intact
        if (descEl) {
            // Remove only paragraphs, spans, etc., but keep static UI
            descEl.querySelectorAll('p, span, li, div').forEach(node => node.remove());
        }
        if (effectsEl) {
            effectsEl.querySelectorAll('li, p, span, div').forEach(node => node.remove());
        }
        choiceCols.forEach(col => {
            col.querySelectorAll('p').forEach(node => node.remove()); // only remove effect lines
        });
    }
    
    // Try to determine deck type if not provided
    if (!deckType && card) {
        // First try to get deck type from the card object
        deckType = card.deckType || state.currentDeck;
        console.warn(`Deck type not provided, using: ${deckType || 'Unknown'}`);
    }
    
    console.warn(`Target deck: ${deckType || 'Unknown'}`);
    
    // Clear card data from all dialogs
    document.querySelectorAll('dialog').forEach(dialog => {
        if (dialog.dataset.cardData) {
            console.warn(`Removing card data from dialog: ${dialog.id || 'dialog unnamed'}`);
            delete dialog.dataset.cardData;
        }
    });
    
    // If we still don't have a valid deck type, try to find it from card state
    if (!deckType && card) {
        // Try to find which deck this card came from
        for (const [type, deck] of Object.entries(cardState.decks)) {
            if (deck.includes(card)) {
                deckType = type;
                console.warn(`Found card in ${type} deck`);
                break;
            }
        }
    }
    
    // Add card to discard pile if valid
    if (!cardState.initialized || !deckType || !cardState.discardPiles[deckType]) {
        console.warn(`Cannot discard card: Deck type ${deckType} not initialized or invalid.`);
        //console.log('Available discard piles:', Object.keys(cardState.discardPiles || {}));
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
        //console.log('Clearing current card from state');
        state.currentCard = null;
        state.currentDeck = null;
    }
    
    // Trigger UI update
    const event = new CustomEvent('cardDiscarded', { detail: { card, deckType } });
    document.dispatchEvent(event);
};

/**
 * Displays a card in the UI with appropriate animations and interactions
 * @param {Object} card - The card to display
 * @param {Object} player - The player viewing the card
 * @param {Function} onComplete - Callback when card is closed
 */
export async function showCard(card) {
    console.log('===============showCard===============')
    
    // Get current player
    const player = getCurrentPlayer();
    if (!player) {
        console.error('No current player found');
        return;
    }
    
    // Get deck type from state
    const deckType = state.currentDeck || 'unknown';
    const deckMeta = deckInfo[deckType];
    const isAI = !player.isHuman;
    const isEndOfTurnCard = deckType === 'endOfTurnDeck' || 
        (card.type && card.type.includes('endOfTurn')) ||
        (card.deck && card.deck.includes('endOfTurn'));
    const isAgeDeck = /^ageOf/i.test(deckType);
    
    // Enhanced logging for deck type detection
    //console.log(`[showCard] Deck Type Analysis:`);
    //console.log(`- deckType: ${deckType}`);
    //console.log(`- isEndOfTurnCard: ${isEndOfTurnCard} (deckType match: ${deckType === 'endOfTurnDeck'}, card.type: ${card?.type}, card.deck: ${card?.deck})`);
    //console.log(`- isAgeDeck: ${isAgeDeck} (regex test: ${/^age-Of/i.test(deckType)})`);
    //console.log(`- Card has choice: ${!!card?.choice}`);
    if (card?.choice) {
        //console.log(`  - Option A effects: ${card.choice.optionA?.effects ? 'Present' : 'None'}`);
        //console.log(`  - Option B effects: ${card.choice.optionB?.effects ? 'Present' : 'None'}`);
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
    
    // Store current card and deck type in state
    state.currentCard = card;
    state.currentDeck = deckType;
    // Also store deck type on the card for reference
    if (card) {
        card.deckType = deckType;
    }

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
            playClickSound();
            let explanationHTML = '';
            if (isEndOfTurnCard && player?.role) {
                const allRoles = ['COLONIALIST', 'REVOLUTIONARY', 'HISTORIAN', 'ENTREPRENEUR', 'POLITICIAN', 'ARTIST'];
                explanationHTML += "<div class='role-effects-container'><h3>Effects for All Roles:</h3><ul class='card--Effects'>";
                allRoles.forEach(role => {
                    const roleEffect = card.effects[role];
                    if (roleEffect) {
                        const changes = roleEffect.changes || {};
                        const changeText = [
                            changes.money !== undefined ? `${changes.money >= 0 ? '+' : ''}${changes.money} Money` : '',
                            changes.knowledge !== undefined ? `${changes.knowledge >= 0 ? '+' : ''}${changes.knowledge} Knowledge` : '',
                            changes.influence !== undefined ? `${changes.influence >= 0 ? '+' : ''}${changes.influence} influence` : ''
                        ].filter(Boolean).join(', ');

                        // Convert role to display format (PascalCase for display)
                        const displayRole = role.charAt(0) + role.slice(1).toLowerCase();
                        const fullText = `<span class='role-name'>${displayRole}:</span> <span class='resource-changes'>[${changeText}]</span> <span class='effect-explanation'>${roleEffect.explanation || ''}</span>`;
                        const currentClass = role === player.role ? 'current-role' : '';
                        explanationHTML += `<li class="role-effect ${currentClass}">${fullText}</li>`;
                    } else {
                        // Convert role to display format (PascalCase for display)
                        const displayRole = role.charAt(0) + role.slice(1).toLowerCase();
                        explanationHTML += `<li class='rcard-Effects'><span class='role-name'>${displayRole}:</span> No effect defined.</li>`;
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
            playClickSound();
            dialog.close();
            drawBoard();
            // Apply card effect with the card's deck type
            //console.log(`Applying card effect from ${card.deckType} deck`);
            applyCardEffect(card);
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
            
            freshOptionAButton.onclick = async () => {
                playClickSound();
                //console.log('Age Deck Option A selected');
                freshOptionAButton.style.display = 'none';
                
                if (card.choice.optionA.effects && Array.isArray(card.choice.optionA.effects)) {
                    card.choice.optionA.effects.forEach(effect => {
                        const p = document.createElement('p');
                        if (effect.type === 'RESOURCE_CHANGE' && effect.changes) {
                            const changeText = [
                                effect.changes.money !== undefined ? `${effect.changes.money >= 0 ? '+' : ''}${effect.changes.money} Money` : '',
                                effect.changes.knowledge !== undefined ? `${effect.changes.knowledge >= 0 ? '+' : ''}${effect.changes.knowledge} Knowledge` : '',
                                effect.changes.influence !== undefined ? `${effect.changes.influence >= 0 ? '+' : ''}${effect.changes.influence} influence` : ''
                            ].filter(Boolean).join(', ');
                            p.textContent = `Resource Change: ${changeText}`;
                        } else if (effect.type === 'MOVEMENT') {
                            p.textContent = `Movement: ${effect.spaces} spaces ${effect.target ? `(${effect.target})` : ''}`;
                        } else {
                            p.textContent = effect.type;
                        }
                        cardChoiceColumnA.appendChild(p);
                    });
                }
                
                await delay(5000);
                playClickSound();
                dialog.close();
                state.currentCard = card;
                applyAgeCardEffect(card, 'optionA');
                if (typeof onComplete === 'function') onComplete();
            };
        }
        
        // Set up Option B
        if (freshOptionBButton && card.choice.optionB) {
            freshOptionBButton.textContent = card.choice.optionB.text || 'Option B';
            freshOptionBButton.style.display = 'inline-block';
            freshOptionBButton.disabled = false;
            
            freshOptionBButton.onclick = async () => {
                playClickSound();
                //console.log('Age Deck Option B selected');
                freshOptionBButton.style.display = 'none';
                
                if (card.choice.optionB.effects && Array.isArray(card.choice.optionB.effects)) {
                    card.choice.optionB.effects.forEach(effect => {
                        const p = document.createElement('p');
                        if (effect.type === 'RESOURCE_CHANGE' && effect.changes) {
                            const changeText = [
                                effect.changes.money !== undefined ? `${effect.changes.money >= 0 ? '+' : ''}${effect.changes.money} Money` : '',
                                effect.changes.knowledge !== undefined ? `${effect.changes.knowledge >= 0 ? '+' : ''}${effect.changes.knowledge} Knowledge` : '',
                                effect.changes.influence !== undefined ? `${effect.changes.influence >= 0 ? '+' : ''}${effect.changes.influence} influence` : ''
                            ].filter(Boolean).join(', ');
                            p.textContent = `Resource Change: ${changeText}`;
                        } else if (effect.type === 'MOVEMENT') {
                            p.textContent = `Movement: ${effect.spaces} spaces ${effect.target ? `(${effect.target})` : ''}`;
                        } else {
                            p.textContent = effect.type;
                        }
                        cardChoiceColumnB.appendChild(p);
                    });
                }
                
                await delay(3000);
                playClickSound();
                dialog.close();
                state.currentCard = card;
                applyAgeCardEffect(card, 'optionB');
                if (typeof onComplete === 'function') onComplete();
            };
        }
    }
    
    // Handle AI player auto-choice
    if (isAI) {
        //console.log('AI player handling card:', card.name);
        setTimeout(() => {
            if (!dialog.open) return;
            
            //console.log('AI making choice for card:', card.name);
            
            if (isAgeDeck) {
                // Wait 3 seconds before clicking
                setTimeout(() => {
                    if (!dialog.open) return;
                    const optionAButton = dialog.querySelector('.optionAButton');
                    if (optionAButton) {
                        optionAButton.style.pointerEvents = 'none';
                        optionAButton.click(); // This will show effects for 3 seconds
                        playClickSound();
                    }
                }, 5000);
            } else {
                // For non-choice cards, just close after 3 seconds
                setTimeout(() => {
                    if (dialog.open) dialog.close();
                    optionAButton.style.pointerEvents = 'none';
                    playClickSound
                    state.currentCard = card;
                    if (isEndOfTurnCard) {
                        applyCardEffect(card);
                    }
                    if (typeof onComplete === 'function') onComplete();
                }, 6000);
            }
        }, 100); // Small delay to ensure dialog is rendered
    }
    return dialog;
}

function formatResourceChanges(changes) {
    console.log('================formatResourceChanges================');
    const result = [];
    if (changes.money !== undefined) result.push(`${changes.money >= 0 ? '+' : ''}${changes.money}💰`);
    if (changes.knowledge !== undefined) result.push(`${changes.knowledge >= 0 ? '+' : ''}${changes.knowledge}📚`);
    if (changes.influence !== undefined) result.push(`${changes.influence >= 0 ? '+' : ''}${changes.influence}🎭`);
    return result.join(', ');
}

export function isEndOfTurnCard(card) {
   // console.log('---------isEndOfTurnCard---------');
    return card && (
        (card.type && card.type.toLowerCase().includes('endofturn')) ||
        (card.deck && card.deck.replace(/\s+/g, '').toLowerCase().includes('endofturn'))
    );
}

export async function processCardEffects(card, targetPlayer = null) {
    console.log('================processCardEffects================')
    // Use provided player or get current player
    const currentPlayer = targetPlayer || getCurrentPlayer();
    
    if (!currentPlayer) {
        console.error('No current player found');
        processEndPlayerTurn(card);
        return;
    }
    
    //console.log(`Processing card effects for player ${currentPlayer.name} with role ${currentPlayer.role || 'N/A'}`);
    
    // If the card parameter is already an effect (not a card object with effects property)
    if (card && (card.type || card.changes || card.effect)) {
        //console.log('Processing direct effect:', card);
        // Handle the effect directly
        if (card.type === 'RESOURCE_CHANGE') {
            //console.log(`Applying resource change effect to ${currentPlayer.name}:`, card.changes);
            // Apply each resource change individually
            if (card.changes.money !== undefined) {
                await applyResourceChange('money', card.changes.money, 'cardEffect', currentPlayer.id);
            }
            if (card.changes.knowledge !== undefined) {
                await applyResourceChange('knowledge', card.changes.knowledge, 'cardEffect', currentPlayer.id);
            }
            if (card.changes.influence !== undefined) {
                await applyResourceChange('influence', card.changes.influence, 'cardEffect', currentPlayer.id);
            }
        } else if (card.type === 'MOVEMENT') {
            //console.log(`Applying movement effect to ${currentPlayer.name}:`, card);
            handleCardMovement(currentPlayer, card);
        } else if (card.type === 'SKIP_TURN') {
            //console.log(`Skipping turn for ${currentPlayer.name}`);
            skipPlayerTurn(currentPlayer, card.turns || 1);
        } else {
            console.warn(`Unknown effect type: ${card.type}`, card);
        }
        return;
    }
    
    // Handle case where we have a card object with effects
    if (!card.effects) {
        console.error('Card has no effects property');
        processEndPlayerTurn(card);
        return;
    }
    
    // If effects is an array, process each effect
    if (Array.isArray(card.effects)) {
        card.effects.forEach(effect => {
            if (effect.type === 'RESOURCE_CHANGE') {
                //console.log(`Applying resource change effect to ${currentPlayer.name}:`, effect.changes);
                applyResourceChange({
                    player: currentPlayer,
                    changes: effect.changes,
                    source: 'card',
                    cardId: card?.id,
                    explanation: effect.explanation
                });
            } else if (effect.type === 'MOVEMENT') {
                //console.log(`Applying movement effect to ${currentPlayer.name}:`, effect);
                handleCardMovement(currentPlayer, effect);
            } else if (effect.type === 'SKIP_TURN') {
                //console.log(`Skipping turn for ${currentPlayer.name}`);
                skipPlayerTurn(currentPlayer, effect.turns || 1);
            } else {
                console.warn(`Unknown effect type: ${effect.type}`, effect);
            }
        });
        return;
    }
    
    // Handle role-based effects
    if (typeof card.effects === 'object') {
        const playerRole = currentPlayer.role;
        if (!playerRole) {
            console.error('Player has no role assigned');
            processEndPlayerTurn(card);
            return;
        }
        
        // Try different case variants of the role name
        const roleVariants = [
            playerRole,
            playerRole.toUpperCase(),
            playerRole.toLowerCase(),
            playerRole.charAt(0).toUpperCase() + playerRole.slice(1).toLowerCase()
        ];
        
        let roleEffect = null;
        let matchedRole = null;
        
        for (const roleVariant of roleVariants) {
            if (card.effects[roleVariant]) {
                roleEffect = card.effects[roleVariant];
                matchedRole = roleVariant;
                break;
            }
        }
        
        if (roleEffect) {
            //console.log(`Found effects for role variant: ${matchedRole}`);
            if (Array.isArray(roleEffect)) {
                roleEffect.forEach(effect => handleEffect(effect, currentPlayer, card));
            } else {
                handleEffect(roleEffect, currentPlayer, card);
            }
        } else {
            //console.log(`No effects found for role: ${playerRole} (tried variants: ${roleVariants.join(', ')})`);
            //console.log('Available roles in card effects:', Object.keys(card.effects));
            processEndPlayerTurn(card);
        }
    }
    
    //console.log(`Found effects for role variant: ${matchedRole}`);
    //console.log(`Processing effect: ${roleEffect.type}`);
    
    if (roleEffect.explanation) {
        //console.log(`Effect explanation: ${roleEffect.explanation}`);
    }
    
    // Verify this is a resource change effect
    if (roleEffect.type !== 'RESOURCE_CHANGE' || !roleEffect.changes) {
        console.warn(`Effect for ${matchedRole} is not a resource change or has no changes`);
        //console.log('Available effect:', roleEffect);
        console.log('------------processCardEffects END------------')
        console.log('*****************call updateResourceDisplays*****************');
        updateResourceDisplays();
        processEndPlayerTurn(card);
        return;
    }
    
    // Apply the resource changes using your existing applyResourceChange function
    const changes = roleEffect.changes;
    
    //console.log(`Applying resource changes:`, changes);
    
    // Apply each resource change individually using your existing function
    if (changes.money !== undefined) {
        //console.log(`Applying money change: ${changes.money}`);
        await applyResourceChange('money', changes.money, 'cardEffect', currentPlayer.id);
    }
    
    if (changes.knowledge !== undefined) {
        //console.log(`Applying knowledge change: ${changes.knowledge}`);
        await applyResourceChange('knowledge', changes.knowledge, 'cardEffect', currentPlayer.id);
    }
    
    if (changes.influence !== undefined) {
        //console.log(`Applying influence change: ${changes.influence}`);
        await applyResourceChange('influence', changes.influence, 'cardEffect', currentPlayer.id);
    }
    
    // Log the changes for debugging/feedback
    //console.log(`Applied effects for ${matchedRole}:`);
    //console.log(`- Money: ${changes.money || 0}`);
    //console.log(`- Knowledge: ${changes.knowledge || 0}`);
    //console.log(`- influence: ${changes.influence || 0}`);
    //console.log(`- Explanation: ${roleEffect.explanation}`);
    
    console.log('---------processCardEffects END---------');
    // Call processEndPlayerTurn when complete, passing the card
    updatePlayerInfo(currentPlayer);
    processEndPlayerTurn(card);
  }
  
  /**
   * Validates and finalizes all age card effects, then calls handleEndTurn
   * This is the guard function that ensures all effects were properly applied
   * @param {Object} card - The original card object
   * @param {Array} effects - Array of effects that were processed
   */
  export async function processAgeCardEffects(card, effects) {
    console.log('================processAgeCardEffects================');
    //console.log('Validating effects for card:', card.name);
      
      // Validate that all effects were processed
      let allEffectsApplied = true;
      const validationErrors = [];
      
      if (effects.length === 0) {
        console.warn('No effects were found on this card');
        validationErrors.push('No effects found');
        allEffectsApplied = false;
      }
      
      // Check each effect type was handled appropriately
      effects.forEach((effect, index) => {
        if (!effect || !effect.type) {
          validationErrors.push(`Effect ${index + 1}: Missing or invalid effect type`);
          allEffectsApplied = false;
        }
      });
      
      // Log validation results
      if (!allEffectsApplied) {
        console.warn('Some age card effects may not have been properly applied:', validationErrors);
      } else {
        //console.log('All age card effects have been successfully processed');
      }
      
      // Update player resources and UI (this ensures all changes are reflected)
      const currentPlayer = getCurrentPlayer();
      if (currentPlayer) {
        // Force update of resource panel
        const resourceEvent = new CustomEvent('resourcesUpdated', {
          detail: { playerId: currentPlayer.id }
        });
        document.dispatchEvent(resourceEvent);
      }
      
      // Reset game state flags
      state.preventCardDraw = false;
      
      //console.log('processAgeCardEffects validation complete - calling handleEndTurn');
      
      // Always call handleEndTurn regardless of validation results
      updatePlayerInfo(currentPlayer);
      // This ensures the game doesn't get stuck
      console.log('---------processAgeCardEffects END---------');
      handleEndTurn();
}