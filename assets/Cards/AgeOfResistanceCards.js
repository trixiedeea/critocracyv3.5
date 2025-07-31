export const ageOfResistanceDeck = [
  {
  deck: "Age of Resistance",
  name: "Haitian Revolution",
  description: "A revolutionary museum opens. Do you fund its expansion or launch a counter-narrative?",
  choice: {
    optionA: {
      text: "Fund the museum",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { influence: 5 } },
        { type: 'MOVEMENT', target: 'SELF', spaces: 3 }
      ]
    },
    optionB: {
      text: "Promote alternative history",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { knowledge: 3 } },
        { type: 'RESOURCE_CHANGE', changes: { influence: -3 } }
      ]
    }
    }
  },
  {
  deck: "Age of Resistance",
  name: "Salt March",
  description: "Protesters block corporate distribution. Do you confront them or negotiate publicly?",
  choice: {
    optionA: {
      text: "Confront the protestors",
      effects: [
        { type: 'STEAL', target: 'OTHER', resource: 'INFLUENCE', amount: 5 },
        { type: 'MOVEMENT', target: 'SELF', spaces: -3 }
      ]
    },
    optionB: {
      text: "Hold a public dialogue",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { influence: 4 } },
        { type: 'RESOURCE_CHANGE', changes: { money: -3 } }
      ]
    }
    }
  },
  {
  deck: "Age of Resistance",
  name: "Print to Power",
  description: "An underground newspaper asks for support. Do you advertise or publish anonymously?",
  choice: {
    optionA: {
      text: "Advertise publicly",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { knowledge: 6 } },
        { type: 'MOVEMENT', target: 'SELF', spaces: 4 }
      ]
    },
    optionB: {
      text: "Support anonymously",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { influence: 3 } },
        { type: 'RESOURCE_CHANGE', changes: { knowledge: 2 } }
      ]
    }
    }
  },
  {
  deck: "Age of Resistance",
  name: "Anti-Colonial Uprising",
  description: "Statues of colonial leaders are torn down. Do you condemn the act or preserve the memory?",
  choice: {
    optionA: {
      text: "Condemn the destruction",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { influence: -3 } },
        { type: 'RESOURCE_CHANGE', changes: { money: 3 } }
      ]
    },
    optionB: {
      text: "Preserve broken fragments in museum",
      effects: [
        { type: 'MOVEMENT', target: 'SELF', moveToAge: "The Age of Reckoning" },
        { type: 'RESOURCE_CHANGE', changes: { money: -6 } }
      ]
    }
    }
  },
  {
  deck: "Age of Resistance",
  name: "Subaltern Voices",
  description: "A former colony demands reparations. Do you issue a formal apology or open restitution talks?",
  choice: {
    optionA: {
      text: "Issue symbolic apology",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { knowledge: 3, influence: 2 } }
      ]
    },
    optionB: {
      text: "Open talks on restitution",
      effects: [
        { type: 'MOVEMENT', target: 'OTHER', spaces: -5 },
        { type: 'RESOURCE_CHANGE', changes: { money: -3 } }
      ]
    }
    }
  },
  {
  deck: "Age of Resistance",
  name: "Angel of History",
  description: "A historian publishes a book reframing the past. Do you endorse it or call for censorship?",
  choice: {
    optionA: {
      text: "Endorse the work",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { influence: 6 } },
        { type: 'MOVEMENT', target: 'SELF', spaces: -3 }
      ]
    },
    optionB: {
      text: "Push for censorship",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { money: 3 } },
        { type: 'RESOURCE_CHANGE', changes: { influence: -4 } }
      ]
    }
  }
  },
  {
  deck: "Age of Resistance",
  name: "Decolonial Theory",
  description: "Activists occupy a commercial hub. Do you fund police action or offer a platform for dialogue?",
  choice: {
    optionA: {
      text: "Fund police removal",
      effects: [
        { type: 'STEAL', target: 'OTHER', resource: 'MONEY', amount: 6 },
        { type: 'SKIP_TURN', target: 'SELF' }
      ]
    },

    optionB: {
      text: "Host a public debate",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { influence: 4 } },
        { type: 'RESOURCE_CHANGE', changes: { knowledge: 2 } }
      ]
    }
  }
  },
  {
  deck: "Age of Resistance",
  name: "Disrupting Power Structures",
  description: "A leaked manifesto exposes government secrets. Do you share it or bury it?",
  choice: {
    optionA: {
      text: "Release the manifesto",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { knowledge: 6 } },
        { type: 'RESOURCE_CHANGE', changes: { influence: -5 } }
      ]
    },
    optionB: {
      text: "Suppress circulation",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { influence: 4 } },
        { type: 'RESOURCE_CHANGE', changes: { knowledge: -3 } }
      ]
    }
  }
  },
  {
  deck: "Age of Resistance",
  name: "Narrative Shift",
  description: "A filmmaker reimagines history. Do you fund its release or quietly pressure sponsors to pull out?",
  choice: {
    optionA: {
      text: "Fund the release",
      effects: [
        { type: 'MOVEMENT', target: 'SELF', spaces: 2 },
        { type: 'RESOURCE_CHANGE', changes: { money: -2 } }
      ]
    },
    optionB: {
      text: "Block distribution",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { knowledge: -2 } },
        { type: 'RESOURCE_CHANGE', changes: { influence: -4 } }
      ]
    }
    }
  },
  {
  deck: "Age of Resistance",
  name: "Revolutionary Momentum",
  description: "Riots erupt in a major city. Do you declare martial law or meet with protest leaders?",
  choice: {
    optionA: {
      text: "Declare martial law",
      effects: [
        { type: 'MOVEMENT', target: 'SELF', spaces: -3 },
        { type: 'STEAL', target: 'OTHER', resource: 'INFLUENCE', amount: 4 }
      ]
    },
    optionB: {
      text: "Open dialogue",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { knowledge: 4 } },
        { type: 'RESOURCE_CHANGE', changes: { influence: 2 } }
      ]
    }
    }
  },
  {
  deck: "Age of Resistance",
  name: "Intellectual Awakening",
  description: "Students revive a banned reading list. Do you teach it or report them?",
  choice: {
    optionA: {
      text: "Teach the banned texts",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { knowledge: 5 } },
        { type: 'MOVEMENT', target: 'SELF', spaces: 4 }
      ]
    },
    optionB: {
      text: "Report the students",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { influence: -3 } },
        { type: 'RESOURCE_CHANGE', changes: { money: 2 } }
      ]
    }
    }
  },
  {
  deck: "Age of Resistance",
  name: "Nostalgia Parade",
  description: "Citizens organize a parade celebrating the 'old days'. Do you participate or criticize it as regressive?",
  choice: {
    optionA: {
      text: "Join the parade",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { influence: 5 } }
      ]
    },
    optionB: {
      text: "Publicly criticize the event",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { knowledge: 4 } },
        { type: 'RESOURCE_CHANGE', changes: { influence: -3 } }
      ]
    }
    }
  },
  {
  deck: "Age of Resistance",
  name: "Graffiti Movement",
  description: "Street artists tag public monuments with resistance slogans. Do you commission them or have them arrested?",
  choice: {
    optionA: {
      text: "Commission their work",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { money: 5 } },
        { type: 'RESOURCE_CHANGE', changes: { influence: 2 } }
      ]
    },
    optionB: {
      text: "Order arrests",
      effects: [
        { type: 'SKIP_TURN', target: 'SELF' },
        { type: 'STEAL', target: 'OTHER', resource: 'MONEY', amount: 4 }
      ]
    }
    }
  },
  {
  deck: "Age of Resistance",
  name: "Boycott Campaign",
  description: "A mass boycott targets a key sponsor. Do you side with the activists or lobby to break the boycott?",
  choice: {
    optionA: {
      text: "Support the boycott",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { knowledge: 4 } },
        { type: 'RESOURCE_CHANGE', changes: { influence: 2 } }
      ]
    },
    optionB: {
      text: "Undermine the campaign",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { money: 5 } },
        { type: 'RESOURCE_CHANGE', changes: { influence: -3 } }
      ]
    }
    }
  }
];
      
  export const BLUE_DECK = [...ageOfResistanceDeck];