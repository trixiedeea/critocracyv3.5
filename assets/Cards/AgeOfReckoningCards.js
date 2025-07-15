// Age of Reckoning (Cyan) cards
export const ageOfReckoningDeck = [
    {
        deck: "Age of Reckoning",
        name: "End of Apartheid",
        description: "Reflects Barthes' Death of the Author, allowing narrative shifts that increase Influence and progress.",
        effects: [
            { type: 'MOVEMENT', target: 'SELF', spaces: 6 },
            { type: 'RESOURCE_CHANGE', changes: { influence: 6, money: -5 } }
        ]
    },
    {
        deck: "Age of Reckoning",
        name: "Museum Artifact Repatriation",
        description: "Embodies Tuck and Yang's insistence on real restitution, enabling resource exchange.",
        effects: [
            { type: 'RESOURCE_CHANGE', changes: { money: -6, influence: 5, knowledge: 1 } } 
        ]
    },
    {
        deck: "Age of Reckoning",
        name: "The Death of the Author",
        description: "Inspired by Barthes' work, challenging authorship and enabling Knowledge gain.",
        effects: [
            { type: 'MOVEMENT', target: 'SELF', spaces: -2 },
            { type: 'RESOURCE_CHANGE', changes: { knowledge: 5, money: -5 } }
        ]
    },
    {
        deck: "Age of Reckoning",
        name: "Postcolonial Critique",
        description: "Reflects Barthes' advocacy for multiple interpretations, advancing players while weakening opponents.",
        effects: [
            { type: 'MOVEMENT', target: 'SELF', spaces: 3 },
            { type: 'STEAL', target: 'OTHER', resource: 'influence', amount:2, }
        ]
    },
    {
        deck: "Age of Reckoning",
        name: "Decolonization Is Not a Metaphor",
        description: "Reflects Tuck and Yang's demand for action, enabling sabotage to ensure real change.",
        effects: [
            { type: 'STEAL', target: 'OTHER', resource: 'MONEY', amount:6, },
            { type: 'RESOURCE_CHANGE', changes: { money: -4, influence: 5 } }
        ]
    },
    {
        deck: "Age of Reckoning",
        name: "Queer and Now",
        description: "Draws on Sedgwick's destabilization of normativity, allowing repositioning for strategic advantage.",
        effects: [
            { type: 'MOVEMENT', target: 'SELF', spaces: 5 }
        ]
    },
    {
        deck: "Age of Reckoning",
        name: "Performative Acts",
        description: "Reflects Butler's theory of gender as performance, enabling positional swaps that challenge identity norms.",
        effects: [
            { type: 'MOVEMENT', target: 'OTHER', spaces: -5 }
        ]
    },
    {
        deck: "Age of Reckoning",
        name: "Visual Pleasure and Narrative",
        description: "Inspired by Mulvey's critique of cinematic narratives, advancing players while disrupting knowledge structures.",
        effects: [
            { type: 'RESOURCE_CHANGE', changes: { knowledge: 6, money: -5 } },
            { type: 'MOVEMENT', target: 'SELF', spaces: -6 }
        ]
    },
    {
        deck: "Age of Reckoning",
        name: "Solidarity Networks",
        description: "Highlights alliances formed during decolonization, fostering collaboration.",
        effects: [
            { type: 'STEAL', target: 'OTHER', resource: 'INFLUENCE', amount:5, },
            { type: 'RESOURCE_CHANGE', changes: { influence: -5, money: 5 } }
        ]
    },
    {
        deck: "Age of Reckoning",
        name: "Reparations Now",
        description: "Demands material reparations for historical injustices, allowing resource transfer.",
        effects: [
            { type: 'STEAL_FROM_ALL', resource: 'MONEY', amount: 3 },
            { type: 'RESOURCE_CHANGE', changes: { money: -3, influence: 5 } }
        ]
    },
    {
        deck: "Age of Reckoning",
        name: "Critical Historiography",
        description: "Challenges dominant historical narratives, rewarding critical Knowledge.",
        effects: [
            { type: 'RESOURCE_CHANGE', changes: { knowledge: 7, money: -5 } },
            { type: 'STEAL', target: 'OTHER', resource: 'KNOWLEDGE', amount:2, }
        ]
    },
    {
        deck: "Age of Reckoning",
        name: "Reclaiming Spaces",
        description: "Focuses on taking back physical and symbolic spaces, enabling movement.",
        effects: [
            { type: 'MOVEMENT', target: 'SELF', spaces: 3 },
            { type: 'RESOURCE_CHANGE', changes: { influence: 3, knowledge: -5 } }
        ]
    }
];

export const CYAN_DECK = [...ageOfReckoningDeck];