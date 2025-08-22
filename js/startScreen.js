/* ========================= */
/*        JAVASCRIPT         */
/* ========================= */


document.addEventListener("DOMContentLoaded", () => {
    // Get references to start screen and player count screen
    const startScreen = document.getElementById("start-Screen"); 
    const startButton = document.getElementById("start-Button");
    const playerCountScreen = document.getElementById("player-Count-Screen");  
    // Hide the player count screen initially
    playerCountScreen.style.display = "none";

    startButton.addEventListener("click", () => {
        startScreen.style.display = "none";
        playerCountScreen.style.display = "block";
    });

    const rulesButton = document.getElementById("rules-Button");
  
    // YOUR ORIGINAL START BUTTON FUNCTIONALITY
    rulesButton.addEventListener("click", () => {
        rulesModal.classList.remove("hidden");
    });
  
    // ========== ADDED RULES FUNCTIONALITY BELOW ==========
    
    // Rules modal elements
    const rulesModal = document.getElementById("rules-Modal");
    const closeRulesButton = document.getElementById("close-Rules-Button");
    const prevCardButton = document.getElementById("previous-Card-Button");
    const nextCardButton = document.getElementById("next-Card-Button");
    const rulesCardContent = document.getElementById("rules-Card-Content");
    const cardIndicator = document.getElementById("card-Indicator");
    const rulesCards = document.querySelectorAll(".rules-card-item");
    
    // Rules data for dynamic cards (first card is in HTML)
    const additionalRulesCards = [
        {
            title: "Setup & Components",
            content: `
                <h3>Game Setup</h3>
                <p><strong>What's Included:</strong></p>
                <ul>
                    <li>Main deck of cards</li>
                    <li>Player boards</li>
                    <li>Scoring tokens</li>
                    <li>Reference cards</li>
                </ul>
                <p><strong>Setup Steps:</strong></p>
                <ol>
                    <li>Each player receives a starting hand</li>
                    <li>Place the main deck in the center</li>
                    <li>Distribute player boards and tokens</li>
                    <li>Randomly determine the first player</li>
                </ol>
            `
        },
        {
            title: "Turn Structure",
            content: `
                <h3>How to Play</h3>
                <p><strong>Each turn consists of:</strong></p>
                <ol>
                    <li><strong>Draw Phase:</strong> Draw cards from the deck</li>
                    <li><strong>Action Phase:</strong> Play cards and take actions</li>
                    <li><strong>Resolve Phase:</strong> Apply card effects</li>
                    <li><strong>End Phase:</strong> Discard excess cards</li>
                </ol>
                <p><strong>Turn Order:</strong> Play proceeds clockwise around the table.</p>
            `
        },
        {
            title: "Card Types & Actions",
            content: `
                <h3>Understanding Cards</h3>
                <p><strong>Action Cards:</strong> Immediate effects when played</p>
                <p><strong>Resource Cards:</strong> Provide ongoing benefits</p>
                <p><strong>Attack Cards:</strong> Target other players</p>
                <p><strong>Defense Cards:</strong> Protect against attacks</p>
                <p><strong>Special Cards:</strong> Unique effects that can change the game</p>
                <br>
                <p><strong>Playing Cards:</strong> Most cards have a cost and must be paid to play them.</p>
            `
        },
        {
            title: "Winning Conditions",
            content: `
                <h3>How to Win</h3>
                <p>Victory can be achieved through multiple paths:</p>
                <ul>
                    <li><strong>Point Victory:</strong> First to reach the target score</li>
                    <li><strong>Elimination Victory:</strong> Last player remaining</li>
                    <li><strong>Special Victory:</strong> Complete unique win conditions</li>
                </ul>
                <p><strong>End Game:</strong> The game ends immediately when any player achieves a victory condition.</p>
                <p><strong>Tie Breaking:</strong> In case of ties, the player with the most cards in hand wins.</p>
            `
        }
    ];
    
    let currentCardIndex = 0;
    let totalCards = 5; // 1 in HTML + 4 dynamic cards
    let dynamicCardsCreated = false;
    
    // Hide rules modal initially
    if (rulesModal) rulesModal.classList.add("hidden");
    
    // Rules button functionality
    if (rulesButton) {
        rulesButton.addEventListener("click", () => {
            showRulesModal();
        });
    }
    
    // Close rules modal
    if (closeRulesButton) {
        closeRulesButton.addEventListener("click", () => {
            hideRulesModal();
        });
    }
    
    // Navigation buttons
    if (prevCardButton) {
        prevCardButton.addEventListener("click", () => {
            if (currentCardIndex > 0) {
                currentCardIndex--;
                updateRulesCard();
            }
        });
    }
    
    if (nextCardButton) {
        nextCardButton.addEventListener("click", () => {
            if (currentCardIndex < totalCards - 1) {
                currentCardIndex++;
                updateRulesCard();
            }
        });
    }
    
    // Close modal when clicking outside of it
    if (rulesModal) {
        rulesModal.addEventListener("click", (e) => {
            if (e.target === rulesModal) {
                hideRulesModal();
            }
        });
    }
    
    // Keyboard navigation
    document.addEventListener("keydown", (e) => {
        if (rulesModal && !rulesModal.classList.contains("hidden")) {
            if (e.key === "Escape") {
                hideRulesModal();
            } else if (e.key === "ArrowLeft" && currentCardIndex > 0) {
                currentCardIndex--;
                updateRulesCard();
            } else if (e.key === "ArrowRight" && currentCardIndex < totalCards - 1) {
                currentCardIndex++;
                updateRulesCard();
            }
        }
    });
    
    // Rules Functions
    function showRulesModal() {
        currentCardIndex = 0; // Reset to first card
        
        // Create dynamic cards if not already created
        if (!dynamicCardsCreated) {
            createDynamicCards();
            dynamicCardsCreated = true;
        }
        
        updateRulesCard();
        if (rulesModal) {
            rulesModal.classList.remove("hidden");
            document.body.classList.add("no-scroll");
        }
    }
    
    function hideRulesModal() {
        if (rulesModal) {
            rulesModal.classList.add("hidden");
            document.body.classList.remove("no-scroll");
        }
    }
    
    function createDynamicCards() {
        if (!rulesCardContent) return;
        
        // Create additional cards dynamically
        additionalRulesCards.forEach((cardData, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'rules-card-item';
            cardElement.setAttribute('data-card', (index + 1).toString());
            cardElement.innerHTML = `
                <h2>${cardData.title}</h2>
                ${cardData.content}
            `;
            rulesCardContent.appendChild(cardElement);
        });
    }
    
    function updateRulesCard() {
        // Get all cards (including dynamically created ones)
        const allCards = document.querySelectorAll(".rules-card-item");
        
        // Hide all cards
        allCards.forEach(card => {
            card.classList.remove("active");
        });
        
        // Show current card
        if (allCards[currentCardIndex]) {
            allCards[currentCardIndex].classList.add("active");
        }
        
        // Update indicator
        if (cardIndicator) {
            cardIndicator.textContent = `${currentCardIndex + 1} of ${totalCards}`;
        }
        
        // Update navigation buttons
        if (prevCardButton) {
            if (currentCardIndex === 0) {
                prevCardButton.classList.add("disabled");
                prevCardButton.disabled = true;
            } else {
                prevCardButton.classList.remove("disabled");
                prevCardButton.disabled = false;
            }
        }
        
        if (nextCardButton) {
            if (currentCardIndex === totalCards - 1) {
                nextCardButton.classList.add("disabled");
                nextCardButton.disabled = true;
            } else {
                nextCardButton.classList.remove("disabled");
                nextCardButton.disabled = false;
            }
        }
    }
        // Show current card
        if (rulesCards[currentCardIndex]) {
            rulesCards[currentCardIndex].classList.add("active");
        }
        
        // Update indicator
        if (cardIndicator) {
            cardIndicator.textContent = `${currentCardIndex + 1} of ${totalCards}`;
        }
        
        // Update navigation buttons
        if (prevCardButton) {
            if (currentCardIndex === 0) {
                prevCardButton.classList.add("disabled");
                prevCardButton.disabled = true;
            } else {
                prevCardButton.classList.remove("disabled");
                prevCardButton.disabled = false;
            }
        }
        
        if (nextCardButton) {
            if (currentCardIndex === totalCards - 1) {
                nextCardButton.classList.add("disabled");
                nextCardButton.disabled = true;
            } else {
                nextCardButton.classList.remove("disabled");
                nextCardButton.disabled = false;
            }
        }
    }
);
