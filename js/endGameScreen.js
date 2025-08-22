import { 
    resetGameState, 
    updatePlayer, 
    updateGameState,
    state
} from "./state.js";
import { showScreen } from "./main.js";
import { getPlayers, RESOURCES } from "./players.js";

document.addEventListener("DOMContentLoaded", () => {
    console.log("end game screen initializing");
});

export function endGame() {
    console.log('=== ENDING GAME ===');


    const endGameScreen = document.getElementById("end-Game-Screen");
    const newGameButton = document.getElementById("new-Game-Button");
    const startScreen = document.getElementById("start-Screen");

    startScreen.style.display = "none";
    endGameScreen.style.display = "block";
    newGameButton.style.display = "none";
    
    // Get players from game state
    const players = state.players || [];
    
    if (players.length === 0) {
        console.error('Cannot end game: No players found in state.players');
        // Try fallback to getPlayers() if available
        const fallbackPlayers = getPlayers ? getPlayers() : [];
        if (fallbackPlayers.length > 0) {
            console.warn('Using fallback player data from getPlayers()');
            players.push(...fallbackPlayers);
        } else {
            console.error('No players found in any data source');
            return;
        }
    }
    
    // Calculate final scores for all players
    players.forEach((player, index) => {
        const resourceTotal = player.playerFinalResourceTotal || 0;
        let rankingBonus = 0;
        
        // Assign ranking bonus based on finish position
        switch(player.playerFinalRanking) {
            case 1: rankingBonus = 25; break;  // 1st place
            case 2: rankingBonus = 20; break;  // 2nd place
            case 3: rankingBonus = 15; break;
            case 4: rankingBonus = 15; break;  // 3rd and 4th place
            case 5: rankingBonus = 10; break;
            case 6: rankingBonus = 10; break;  // 5th and 6th place
            default: rankingBonus = 0; break; // Beyond 6th place
        }
        
        // Update the player's final score using the updatePlayer function
        updatePlayer(player.id, { playerFinalScore: resourceTotal + rankingBonus });
        
        console.log(`Player ${player.name}: Resources=${player.playerFinalResourceTotal}, Ranking=${player.playerFinalRanking}, Bonus=${rankingBonus}, Final Score=${resourceTotal + rankingBonus}`);
    });
    
    // Find all players with the highest final score (handles ties)
    const maxScore = Math.max(...players.map(p => p.playerFinalScore || 0));
    const winners = players.filter(p => p.playerFinalScore === maxScore);
    
    if (winners.length === 1) {
        console.log(`Game Winner: ${winners[0].name} with score ${winners[0].playerFinalScore}`);
    } else {
        console.log(`Game Tie! Winners: ${winners.map(w => w.name).join(', ')} with score ${maxScore}`);
    }
    
    // Update game state
    updateGameState({
        ended: true,
        gameOver: true,
        winners: winners
    });
    
    // Show end game screen
    showScreen('endGameScreen');
    
    // Role image mapping
    const roleImageMap = {
        'ARTIST': './assets/tokens/A.png',
        'HISTORIAN': './assets/tokens/H.png',
        'COLONIALIST': './assets/tokens/C.png',
        'REVOLUTIONARY': './assets/tokens/R.png',
        'POLITICIAN': './assets/tokens/P.png',
        'ENTREPRENEUR': './assets/tokens/E.png'
    };
    
    // Sort players by final score (highest first)
    const sortedPlayers = [...players].sort((a, b) => b.playerFinalScore - a.playerFinalScore);
    
    // Build and populate the scores table
    const tableBody = document.getElementById('scores-Table-Body');
    const scoresTable = document.getElementById('scores-Table');
    
    if (tableBody && scoresTable) {
        // Clear existing content
        tableBody.innerHTML = '';
        
        // Populate table row by row for each player

// Fix the table population section:
        sortedPlayers.forEach((player, index) => {
            const row = document.createElement('tr');
            const rankClass = index === 0 ? 'rank-1' : index === 1 ? 'rank-2' : index === 2 ? 'rank-3' : 
                            index === 3 ? 'rank-4' : index === 4 ? 'rank-5' : index === 5 ? 'rank-6' : '';
            row.className = rankClass;
            
            const imageSrc = roleImageMap[player.role.toUpperCase()] || './assets/tokens/default.png';
            
            // Recalculate everything since updatePlayer() doesn't update the local players array
            const resourceTotal = player.playerFinalResourceTotal || 0;
            let rankingBonus = 0;
            
            // Recalculate ranking bonus
            switch(player.playerFinalRanking) {
                case 1: rankingBonus = 25; break;
                case 2: rankingBonus = 20; break;
                case 3: rankingBonus = 15; break;
                case 4: rankingBonus = 15; break;
                case 5: rankingBonus = 10; break;
                case 6: rankingBonus = 10; break;
                default: rankingBonus = 0; break;
            }
            
            const finalScore = resourceTotal + rankingBonus;
            
            console.log(`Player ${player.name}: Resources=${resourceTotal}, ranking=${player.playerFinalRanking}, Bonus=${rankingBonus}, Final Score=${finalScore}`); 
            
            row.innerHTML = `
                <td><img src="${imageSrc}" alt="${player.role}" class="table-image" onerror="this.style.display='none'"></td>
                <td><strong>${index + 1}</strong></td>
                <td>${player.name}</td>
                <td>${player.role}</td>
                <td>${resourceTotal}</td>
                <td>+${rankingBonus}</td>
                <td><strong>${finalScore}</strong></td>
            `;
            tableBody.appendChild(row);
        });
        // Make sure the table is visible
        scoresTable.classList.remove('hidden');
        
        console.log('Scores table populated and displayed');
        
        // Wait 6 seconds, then hide table and show winner display
        setTimeout(() => {
            console.log('Hiding scores table and showing winner display');
            
            // Hide the scores table
            scoresTable.classList.add('hidden');
            
            // Show winner display
            const winnerDisplay = document.getElementById('winner-Display');
            if (winnerDisplay && winners && winners.length > 0) {
                // Clear existing content
                winnerDisplay.innerHTML = '';
                
                // Create winner display content for each winner
                const winnersArray = Array.isArray(winners) ? winners : [winners];
                
                winnersArray.forEach((winner, index) => {
                    const winnerDiv = document.createElement('div');
                    winnerDiv.style.cssText = `
                        text-align: center;
                        margin: 20px;
                        ${index > 0 ? 'margin-top: 40px;' : ''}
                    `;
                    
                    const imageSrc = roleImageMap[winner.role.toUpperCase()] || './assets/tokens/default.png';
                    
                    winnerDiv.innerHTML = `
                        <img src="${imageSrc}" alt="${winner.role}" style="width: 150px; height: 150px; border-radius: 50%; border: 5px solid gold; margin-bottom: 20px;">
                        <h2 style="color: gold; text-shadow: 2px 2px 4px rgba(0,0,0,0.7);">
                            ${winnersArray.length === 1 ? 'WINNER!' : 'TIE!'}
                        </h2>
                        <h3 style="color: white; text-shadow: 1px 1px 2px rgba(0,0,0,0.7);">
                            ${winner.name}
                        </h3>
                        <p style="color: white; font-size: 1.2em;">
                            ${winner.role} - Final Score: ${winner.playerFinalScore}
                        </p>
                    `;
                    
                    winnerDisplay.appendChild(winnerDiv);
                });
                
                // Make winner display visible
                winnerDisplay.style.display = 'block';
            }
            
            // Now run the rest of the end game functions (victory celebration)
            showEndGameWithVictory(winners);
            
        }, 10000);
    } else {
        console.error('Could not find scores table elements');
    }
};

function showEndGameWithVictory(winners) {{
        console.log('=== SHOWING END GAME SCREEN ===');
        
        if (!winners || (Array.isArray(winners) && winners.length === 0)) {
            console.error('No winners provided for victory screen');
            return;
        }
        
        // Handle both single winner and array of winners
        const winnersArray = Array.isArray(winners) ? winners : [winners];
        const primaryWinner = winnersArray[0];
      
        // Start victory celebration animation
        startVictoryCelebration(winnersArray);


    function startVictoryCelebration(winners) {
            const winnersArray = Array.isArray(winners) ? winners : [winners];
            const primaryWinner = winnersArray[0];
            
            console.log(`Starting victory celebration for ${winnersArray.map(w => w.name).join(', ')}`);
            
            // Create or find celebration container
            let celebrationContainer = document.getElementById('celebrationContainer');
            if (!celebrationContainer) {
                celebrationContainer = document.createElement('div');
                celebrationContainer.id = 'celebrationContainer';
                celebrationContainer.style.cssText = `
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    pointer-events: none;
                    z-index: 1000;
                    overflow: hidden;
                `;
                document.body.appendChild(celebrationContainer);
            }
            
            // Clear any existing celebration
            celebrationContainer.innerHTML = '';
            
            // Handle winner text for single winner or tie
            const winnerText = document.createElement('div');
            if (winnersArray.length === 1) {
                winnerText.textContent = `🎉 ${primaryWinner.name} Wins! 🎉`;
            } else {
                winnerText.textContent = `🎉 TIE! ${winnersArray.map(w => w.name).join(' & ')} Win! 🎉`;
            }
            
            winnerText.style.cssText = `
                position: absolute;
                top: 20%;
                left: 50%;
                transform: translateX(-50%);
                font-size: 3em;
                font-weight: bold;
                color: #ffd700;
                text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
                animation: pulse 1.5s infinite, rainbow 3s infinite;
                text-align: center;
                white-space: nowrap;
                max-width: 90%;
                overflow: hidden;
                text-overflow: ellipsis;
            `;
            celebrationContainer.appendChild(winnerText);
            
            // Add score display
            const scoreText = document.createElement('div');
            scoreText.textContent = `Final Score: ${primaryWinner.playerFinalScore}`;
            scoreText.style.cssText = `
                position: absolute;
                top: 35%;
                left: 50%;
                transform: translateX(-50%);
                font-size: 1.5em;
                color: #fff;
                text-shadow: 1px 1px 2px rgba(0,0,0,0.7);
                text-align: center;
            `;
            celebrationContainer.appendChild(scoreText);
            
            // Create floating confetti animation
            createConfetti(celebrationContainer);
        
            // Add CSS animations if not already present
            addCelebrationStyles();
        
            // Clean up celebration after 5 seconds
            setTimeout(() => {
                if (celebrationContainer && celebrationContainer.parentNode) {
                    celebrationContainer.style.opacity = '0';
                    celebrationContainer.style.transition = 'opacity 1s ease-out';
                    setTimeout(() => {
                        if (celebrationContainer && celebrationContainer.parentNode) {
                            celebrationContainer.remove();
                        }
                    }, 500000);
                }
            }, 100000);

            // Make the new game button visible
    const newGameButton = document.getElementById('new-Game-Button');
    const endGameScreen = document.getElementById('end-Game-Screen');
    if (newGameButton) {
        newGameButton.style.display = 'block';
        newGameButton.style.visibility = 'visible';
    }
    if (endGameScreen && newGameButton) {
        newGameButton.addEventListener("click", () => {
            console.log("New game button clicked");
            startScreen.style.display = "block";
            endGameScreen.style.display = "none";
            resetGameState();
        });
    } else {
        console.error("Required elements not found!");
    }
}}};
      
function createConfetti(container) {
    const colors = [
        'rgb(66, 93, 168)',
        'rgb(10, 196, 237)',
        'rgb(101, 35, 176)',
        'rgb(216, 0, 244)',
        'rgb(226, 133, 214)',
        'rgb(33, 133, 145)',
        'rgb(0, 255, 255)',
        'rgb(0, 17, 255)',
        'rgb(74, 207, 132)',
        'rgb(12, 65, 66)',
        'rgb(111, 0, 255)',


    ];
    const count = 800; // 400 pieces

    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.classList.add('confetti-piece');
      piece.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

      // Wider horizontal drift (px)
      const driftX = (Math.random() - 0.5) * 800 + 'px';
      piece.style.setProperty('--drift-x', driftX);

      // Random position near bottom center
      piece.style.left = `${window.innerWidth / 2 + (Math.random() - 0.5) * 400}px`;
      piece.style.bottom = `0px`;

      // Random scale/rotation start using matrix
      const angle = Math.random() * 2 * Math.PI;
      const scale = 0.5 + Math.random();
      const cos = Math.cos(angle) * scale;
      const sin = Math.sin(angle) * scale;
      const matrix = `matrix(${cos.toFixed(3)}, ${sin.toFixed(3)}, ${(-sin).toFixed(3)}, ${cos.toFixed(3)}, 0, 0)`;
      piece.style.transform = matrix;

      // Slower timing
      piece.style.animationDuration = `${5 + Math.random() * 4}s`;
      piece.style.animationDelay = `${Math.random() * 2}s`;

      container.appendChild(piece);
    }
}

  window.onload = () => {
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.height = '100%';
    container.style.pointerEvents = 'none';
    container.style.zIndex = '5';
    document.body.appendChild(container);

    createConfetti(container);
};

      
/**
 * Adds CSS styles for celebration animations
 */
function addCelebrationStyles() {
        const styleId = 'celebrationStyles';
        
        // Prevent duplicate style injection
        if (document.getElementById(styleId)) return;
        
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
            @keyframes pulse {
                0% { transform: translateX(-50%) scale(1); }
                50% { transform: translateX(-50%) scale(1.05); }
                100% { transform: translateX(-50%) scale(1); }
            }
            
            @keyframes rainbow {
                0% { color:rgb(240, 59, 59); }
                16.66% { color:rgb(0, 64, 241); }
                33.33% { color:rgb(10, 196, 237); }
                50% { color:rgb(101, 35, 176); }
                66.66% { color:rgb(216, 0, 244); }
                83.33% { color:rgb(226, 133, 214); }
                100% { color:rgb(33, 133, 145); }
            }
            
            @keyframes confettiFall {
                to {
                    transform: translateY(100vh) rotate(720deg);
                }
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `;
        
        try {
            document.head.appendChild(style);
        } catch (error) {
            console.warn('Could not add celebration styles:', error);
        }
}
