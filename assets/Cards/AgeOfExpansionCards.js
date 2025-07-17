// Special Event cards for Critocracy
// These cards are drawn when landing on special event spaces

// Age of Expansion (Purple) cards  
export const ageOfExpansionDeck = [
    {
    deck: "Age of Expansion",
    name: "Scramble for Africa",
    description: "Foreign investors want a slice of the continent. Do you open the land for development, or restrict foreign access?",
    choice: {
        optionA: {
            text: "Allow rapid development",
            effects: [
                { type: 'RESOURCE_CHANGE', changes: { money: 6 } },
                { type: 'RESOURCE_CHANGE', changes: { influence: -4 } }
                ]
        },
        optionB: {
            text: "Impose strict access controls",
            effects: [
                { type: 'RESOURCE_CHANGE', changes: { knowledge: 3 } },
                { type: 'RESOURCE_CHANGE', changes: { money: -2 } }
                ]
            }
            }
    },
    {
    deck: "Age of Expansion",
    name: "Divide and Conquer",
    description: "A rebellion is forming. Do you arm one side to weaken both, or attempt peaceful dialogue?",
    choice: {
        optionA: {
            text: "Secretly arm the weaker faction",
            effects: [
                { type: 'MOVEMENT', target: 'SELF', spaces: 3 },
                { type: 'RESOURCE_CHANGE', changes: { knowledge: -5 } }
                ]
            },
            optionB: {
                text: "Initiate peace negotiations",
                effects: [
                    { type: 'RESOURCE_CHANGE', changes: { influence: 5 } },
                    { type: 'RESOURCE_CHANGE', changes: { money: -2 } }
                ]
            }
        },
    },
    {
    deck: "Age of Expansion",
    name: "Exploitation Justified",
    description: "A report suggests forced labor may be boosting profits. Do you ignore it or expose the abuse?",
    choice: {
        optionA: {
            text: "Ignore and continue operations",
            effects: [
                { type: 'RESOURCE_CHANGE', changes: { money: 6 } },
                { type: 'RESOURCE_CHANGE', changes: { influence: -5 } }
                ]
            },
                optionB: {
                  text: "Expose the abuse publicly",
                  effects: [
                    { type: 'RESOURCE_CHANGE', changes: { knowledge: 4 } },
                    { type: 'STEAL', target: 'OTHER', resource: 'MONEY', amount: 3 }
                  ]
                }
            }
        },
        {
    deck: "Age of Expansion",
    name: "Colonial Enterprise",
    description: "A joint venture with colonial partners promises great returns. Do you invest or critique the system?",
    choice: {
        optionA: {
            text: "Invest in the enterprise",
            effects: [
                { type: 'RESOURCE_CHANGE', changes: { money: 5 } },
                { type: 'RESOURCE_CHANGE', changes: { influence: -3 } }
                  ]
                },
                optionB: {
                  text: "Publish a critique of the venture",
                  effects: [
                    { type: 'RESOURCE_CHANGE', changes: { knowledge: 5 } },
                    { type: 'RESOURCE_CHANGE', changes: { money: -2 } }
                  ]
                }
            }
        },
        {
    deck: "Age of Expansion",
    name: "Missionary Influence",
    description: "Missionaries offer to help with outreach. Do you support their schools, or focus on secular education?",
    choice: {
        optionA: {
            text: "Support missionary schools",
            effects: [
                { type: 'RESOURCE_CHANGE', changes: { influence: 5 } },
                { type: 'MOVEMENT', target: 'SELF', spaces: 3 }
                  ]
                },
                optionB: {
                  text: "Fund secular education",
                  effects: [
                    { type: 'RESOURCE_CHANGE', changes: { knowledge: 4 } },
                    { type: 'RESOURCE_CHANGE', changes: { influence: -2 } }
                  ]
                }
            }
        },
        {
    deck: "Age of Expansion",
    name: "Revolt Suppression",
    description: "An armed uprising has begun. Do you deploy troops or try to address the grievances?",
    choice: {
        optionA: {
            text: "Deploy troops",
            effects: [
                { type: 'MOVEMENT', target: 'OTHER', spaces: -2 }
                ]
                },
                optionB: {
                  text: "Address grievances",
                  effects: [
                    { type: 'RESOURCE_CHANGE', changes: { influence: 3, knowledge: 2 } }
                  ]
                }
            }
        },
        {
    deck: "Age of Expansion",
    name: "Commodification of Labor",
    description: "You can hire cheap local labor or follow new labor laws. Which path do you choose?",
    choice: {
        optionA: {
            text: "Exploit cheaper labor",
            effects: [
                { type: 'RESOURCE_CHANGE', changes: { money: 7 } },
                { type: 'SKIP_TURN', target: 'SELF' }
                  ]
                },
                optionB: {
                  text: "Follow ethical standards",
                  effects: [
                    { type: 'RESOURCE_CHANGE', changes: { influence: 4 } },
                    { type: 'RESOURCE_CHANGE', changes: { money: -3 } }
                  ]
                }
            }
        },
        {
    deck: "Age of Expansion",
    name: "Indigenous Displacement",
    description: "An indigenous group requests protection of their lands. Do you honor the request or clear the area for settlement?",
    choice: {
        optionA: {
            text: "Clear the area for settlement",
            effects: [
                { type: 'STEAL', target: 'OTHER', resource: 'MONEY', amount: 4 },
                { type: 'RESOURCE_CHANGE', changes: { influence: -6 } }
                  ]
                },
                optionB: {
                  text: "Honor the protection request",
                  effects: [
                    { type: 'RESOURCE_CHANGE', changes: { knowledge: 5 } },
                    { type: 'RESOURCE_CHANGE', changes: { money: -2 } }
                  ]
                }
            }
        },
        {
    deck: "Age of Expansion",
    name: "Control the Narrative",
    description: "Your writers propose a sweeping history of expansion. Do you fund it or include indigenous voices?",
    choice: {
        optionA: {
            text: "Fund glorified history",
            effects: [
                { type: 'MOVEMENT', target: 'SELF', spaces: 3 },
                { type: 'RESOURCE_CHANGE', changes: { knowledge: 5 } }
                  ]
                },
                optionB: {
                  text: "Include indigenous voices",
                  effects: [
                    { type: 'RESOURCE_CHANGE', changes: { influence: 5 } },
                    { type: 'RESOURCE_CHANGE', changes: { money: -2 } }
                  ]
                }
            }
        },
        {
    deck: "Age of Expansion",
    name: "Mercantile Expansion",
    description: "A foreign firm proposes a trading agreement. Do you enforce local taxes or give them a free hand?",
    choice: {
        optionA: {
            text: "Give free trade access",
            effects: [
                { type: 'STEAL', target: 'OTHER', resource: 'MONEY', amount: 2 },
                { type: 'RESOURCE_CHANGE', changes: { money: -2 } }
                  ]
                },
                optionB: {
                  text: "Enforce taxation",
                  effects: [
                    { type: 'RESOURCE_CHANGE', changes: { money: 3 } },
                    { type: 'RESOURCE_CHANGE', changes: { influence: -2 } }
                  ]
                }
            }
        },
        {
    deck: "Age of Expansion",
    name: "Plantation Economy",
    description: "Plantation owners seek new subsidies. Do you support them or redirect funds to smallholders?",
    choice: {
        optionA: {
            text: "Subsidize plantations",
            effects: [
                { type: 'RESOURCE_CHANGE', changes: { money: 6 } },
                { type: 'RESOURCE_CHANGE', changes: { knowledge: -5 } }
                  ]
                },
                optionB: {
                  text: "Support smallholders",
                  effects: [
                    { type: 'RESOURCE_CHANGE', changes: { knowledge: 4 } },
                    { type: 'RESOURCE_CHANGE', changes: { money: -2 } }
                  ]
                }
            }
        },
        {
    deck: "Age of Expansion",
    name: "Imperial Propaganda",
    description: "Your press office wants to launch a new campaign. Do you celebrate national glory or promote critical literacy?",
    choice: {
        optionA: {
            text: "Celebrate glory",
            effects: [
                { type: 'STEAL', target: 'OTHER', resource: 'INFLUENCE', amount: 4 },
                { type: 'RESOURCE_CHANGE', changes: { influence: -4 } }
                  ]
                },
                optionB: {
                  text: "Promote critical literacy",
                  effects: [
                    { type: 'RESOURCE_CHANGE', changes: { knowledge: 5 } },
                    { type: 'RESOURCE_CHANGE', changes: { money: -1 } }
                  ]
                }
            }
        },
        {
    deck: "Age of Expansion",
    name: "Expedition or Extraction?",
    description: "A remote region is rich in resources and history. Do you fund archaeological work or send mining teams?",
    choice: {
        optionA: {
            text: "Send mining teams",
            effects: [
                    { type: 'RESOURCE_CHANGE', changes: { money: 5 } },
                    { type: 'RESOURCE_CHANGE', changes: { knowledge: -3 } }
                  ]
                },
                optionB: {
                  text: "Fund archaeological expedition",
                  effects: [
                    { type: 'RESOURCE_CHANGE', changes: { knowledge: 5 } },
                    { type: 'RESOURCE_CHANGE', changes: { influence: 2 } }
                  ]
                }
            }
        },
        {
    deck: "Age of Expansion",
    name: "Colonial Currency Reform",
    description: "You're asked to replace local currencies with standardized coin. Do you approve or oppose it?",
    choice: {
        optionA: {
            text: "Standardize currency",
            effects: [
                    { type: 'RESOURCE_CHANGE', changes: { money: 4, knowledge: -2 } }
                  ]
                },
                optionB: {
                  text: "Preserve local systems",
                  effects: [
                    { type: 'RESOURCE_CHANGE', changes: { influence: 3, knowledge: 2 } }
                  ]
                }
            }
        },
        {
    deck: "Age of Expansion",
    name: "Empire Expo",
    description: "You're organizing a world expo. Do you showcase imperial strength or cultural diversity?",
    choice: {
        optionA: {
            text: "Showcase imperial strength",
            effects: [
                    { type: 'RESOURCE_CHANGE', changes: { money: 4 } },
                    { type: 'RESOURCE_CHANGE', changes: { influence: -2 } }
                  ]
                },
                optionB: {
                  text: "Highlight cultural diversity",
                  effects: [
                    { type: 'RESOURCE_CHANGE', changes: { influence: 4 } },
                    { type: 'RESOURCE_CHANGE', changes: { money: -1 } }
                  ]
                }
            }
        }
    ];
          

// Export the cards array directly
export const PURPLE_DECK = [...ageOfExpansionDeck];

