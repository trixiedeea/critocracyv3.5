export const ageOfReckoningDeck = [
    {
    deck: "Age of Reckoning",
    name: "End of Apartheid",
    description: "A powerful truth commission invites you to speak. Do you share openly or remain silent?",
    choice: {
        optionA: {
          text: "Speak openly",
          effects: [
            { type: 'MOVEMENT', target: 'SELF', spaces: 6 },
            { type: 'RESOURCE_CHANGE', changes: { influence: 6 } }
          ]
        },
        optionB: {
          text: "Remain silent",
          effects: [
            { type: 'RESOURCE_CHANGE', changes: { knowledge: 3 } },
            { type: 'RESOURCE_CHANGE', changes: { influence: -2 } }
          ]
        }
      }
    },
    {
    deck: "Age of Reckoning",
    name: "Museum Artifact Repatriation",
    description: "A court orders a valuable artifact returned. Do you comply or appeal?",
    choice: {
        optionA: {
          text: "Comply with order",
          effects: [
            { type: 'RESOURCE_CHANGE', changes: { money: -5, influence: 6 } }
          ]
        },
        optionB: {
          text: "Appeal the ruling",
          effects: [
            { type: 'RESOURCE_CHANGE', changes: { money: 3 } },
            { type: 'RESOURCE_CHANGE', changes: { influence: -4 } }
          ]
        }
      }
    },
    {
    deck: "Age of Reckoning",
    name: "The Death of the Author",
    description: "An anonymous essay reshapes political discourse. Do you amplify it or investigate the author?",
    choice: {
        optionA: {
          text: "Amplify the essay",
          effects: [
            { type: 'MOVEMENT', target: 'SELF', spaces: -5 },
            { type: 'RESOURCE_CHANGE', changes: { knowledge: 5 } }
          ]
        },
        optionB: {
          text: "Investigate authorship",
          effects: [
            { type: 'RESOURCE_CHANGE', changes: { influence: 3 } },
            { type: 'RESOURCE_CHANGE', changes: { knowledge: -3 } }
          ]
        }
      }
    },
    {
    deck: "Age of Reckoning",
    name: "Postcolonial Critique",
    description: "A celebrated critic turns on the new regime. Do you platform them or discredit them?",
    choice: {
        optionA: {
          text: "Offer them a platform",
          effects: [
            { type: 'MOVEMENT', target: 'SELF', spaces: 7 },
            { type: 'SABOTAGE', target: 'OTHER', changes: { influence: -5 } }
          ]
        },
        optionB: {
          text: "Discredit them publicly",
          effects: [
            { type: 'RESOURCE_CHANGE', changes: { influence: 4 } },
            { type: 'RESOURCE_CHANGE', changes: { knowledge: -3 } }
          ]
        }
      }
    },
    {
    deck: "Age of Reckoning",
    name: "Decolonization Is Not a Metaphor",
    description: "A rival demands full compensation for past misdeeds. Do you pay or offer symbolic gestures?",
    choice: {
        optionA: {
          text: "Pay the full amount",
          effects: [
            { type: 'STEAL', target: 'OTHER', resource: 'MONEY', amount: 6 },
            { type: 'RESOURCE_CHANGE', changes: { money: -4 } }
          ]
        },
        optionB: {
          text: "Offer symbolic gestures",
          effects: [
            { type: 'RESOURCE_CHANGE', changes: { influence: 4 } },
            { type: 'RESOURCE_CHANGE', changes: { money: -2 } }
          ]
        }
      }
    },
    {
    deck: "Age of Reckoning",
    name: "Queer and Now",
    description: "A marginalized movement seeks inclusion. Do you endorse them publicly or support them quietly?",
    choice: {
        optionA: {
          text: "Endorse publicly",
          effects: [
            { type: 'MOVEMENT', target: 'SELF', spaces: 5 }
          ]
        },
        optionB: {
          text: "Support quietly",
          effects: [
            { type: 'RESOURCE_CHANGE', changes: { influence: 3 } }
          ]
        }
      }
    },
    {
    deck: "Age of Reckoning",
    name: "Performative Acts",
    description: "An opponent adopts your stance to gain favor. Do you challenge them or collaborate?",
    choice: {
        optionA: {
          text: "Expose their performance",
          effects: [
            { type: 'MOVEMENT', target: 'OTHER', spaces: -5 }
          ]
        },
        optionB: {
          text: "Co-opt their support",
          effects: [
            { type: 'RESOURCE_CHANGE', changes: { influence: 4 } }
          ]
        }
      }
    },
    {
    deck: "Age of Reckoning",
    name: "Visual Pleasure and Narrative",
    description: "A controversial film reframes revolutionary heroes. Do you fund its distribution or pull support?",
    choice: {
        optionA: {
          text: "Fund distribution",
          effects: [
            { type: 'RESOURCE_CHANGE', changes: { knowledge: 6 } },
            { type: 'MOVEMENT', target: 'SELF', spaces: -6 }
          ]
        },
        optionB: {
          text: "Block the release",
          effects: [
            { type: 'RESOURCE_CHANGE', changes: { money: 2 } },
            { type: 'RESOURCE_CHANGE', changes: { knowledge: -2 } }
          ]
        }
      }
    },
    {
    deck: "Age of Reckoning",
    name: "Solidarity Networks",
    description: "Old allies request favors that would harm your new image. Do you honor your debt or distance yourself?",
    choice: {
        optionA: {
          text: "Honor your debts",
          effects: [
            { type: 'STEAL', target: 'OTHER', resource: 'INFLUENCE', amount: 5 },
            { type: 'RESOURCE_CHANGE', changes: { influence: -5 } }
          ]
        },
        optionB: {
          text: "Distance yourself",
          effects: [
            { type: 'RESOURCE_CHANGE', changes: { money: 3 } },
            { type: 'RESOURCE_CHANGE', changes: { influence: -2 } }
          ]
        }
      }
    },
    {
    deck: "Age of Reckoning",
    name: "Reparations Now",
    description: "A global agreement requires shared payouts. Do you pay your share or delay implementation?",
    choice: {
        optionA: {
          text: "Pay your share",
          effects: [
            { type: 'STEAL_FROM_ALL', resource: 'MONEY', amount: 3 },
            { type: 'RESOURCE_CHANGE', changes: { money: -3 } }
          ]
        },
        optionB: {
          text: "Delay the policy",
          effects: [
            { type: 'RESOURCE_CHANGE', changes: { influence: 3 } },
            { type: 'RESOURCE_CHANGE', changes: { money: 2 } }
          ]
        }
      }
    },
    {
    deck: "Age of Reckoning",
    name: "Critical Historiography",
    description: "A new school curriculum omits your achievements. Do you protest or revise your legacy?",
    choice: {
        optionA: {
          text: "Protest exclusion",
          effects: [
            { type: 'RESOURCE_CHANGE', changes: { knowledge: 7 } },
            { type: 'SABOTAGE', target: 'OTHER', changes: { knowledge: -3 } }
          ]
        },
        optionB: {
          text: "Rewrite your legacy",
          effects: [
            { type: 'RESOURCE_CHANGE', changes: { influence: 4 } }
          ]
        }
      }
    },
    {
    deck: "Age of Reckoning",
    name: "Reclaiming Spaces",
    description: "A monument to the revolution is defaced. Do you restore or remove it?",
    choice: {
        optionA: {
          text: "Restore the monument",
          effects: [
            { type: 'MOVEMENT', target: 'SELF', spaces: 8 },
            { type: 'RESOURCE_CHANGE', changes: { influence: 3 } }
          ]
        },
        optionB: {
          text: "Take it down quietly",
          effects: [
            { type: 'RESOURCE_CHANGE', changes: { knowledge: 4 } },
            { type: 'RESOURCE_CHANGE', changes: { influence: -2 } }
          ]
        }
      }
    },
  
    // 🆕 New Card 1
    {
    deck: "Age of Reckoning",
    name: "Forgiveness Campaign",
    description: "A new movement promotes collective forgiveness. Do you sign their pledge or critique its simplicity?",
    choice: {
        optionA: {
          text: "Sign the pledge",
          effects: [
            { type: 'RESOURCE_CHANGE', changes: { influence: 5 } }
          ]
        },
        optionB: {
          text: "Publicly critique it",
          effects: [
            { type: 'RESOURCE_CHANGE', changes: { knowledge: 5 } },
            { type: 'RESOURCE_CHANGE', changes: { influence: -2 } }
          ]
        }
      }
    },
  
    // 🆕 New Card 2
    {
    deck: "Age of Reckoning",
    name: "Unfinished Trials",
    description: "Accused collaborators are still awaiting trial. Do you reopen the cases or grant amnesty?",
    choice: {
        optionA: {
          text: "Reopen the trials",
          effects: [
            { type: 'STEAL', target: 'OTHER', resource: 'KNOWLEDGE', amount: 3 },
            { type: 'RESOURCE_CHANGE', changes: { knowledge: 3 } }
          ]
        },
        optionB: {
          text: "Grant amnesty",
          effects: [
            { type: 'RESOURCE_CHANGE', changes: { influence: 4 } },
            { type: 'RESOURCE_CHANGE', changes: { knowledge: -2 } }
          ]
        }
      }
    },
  
    // 🆕 New Card 3
    {
    deck: "Age of Reckoning",
    name: "Factory Reopening",
    description: "A derelict factory could be rebuilt. Do you invest in jobs or preserve it as a historical site?",
    choice: {
        optionA: {
          text: "Invest in new jobs",
          effects: [
            { type: 'RESOURCE_CHANGE', changes: { money: 6 } },
            { type: 'RESOURCE_CHANGE', changes: { knowledge: -2 } }
          ]
        },
        optionB: {
          text: "Protect it as heritage",
          effects: [
            { type: 'RESOURCE_CHANGE', changes: { knowledge: 4 } },
            { type: 'RESOURCE_CHANGE', changes: { money: -2 } }
          ]
        }
      }
    }
  ];
  
export const CYAN_DECK = [...ageOfReckoningDeck];