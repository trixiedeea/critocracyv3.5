// Age of Legacy (Pink) cards
export const ageOfLegacyDeck = [
  {
  deck: "Age of Legacy",
  name: "Digital Divide",
  description: "A philanthropist offers to sponsor rural connectivity in exchange for naming rights. Do you endorse their initiative or refuse the publicity?",
  choice: {
    optionA: {
      text: "Endorse the sponsorship",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { influence: 5 } },
        { type: 'RESOURCE_CHANGE', changes: { knowledge: -3 } }
      ]
    },
    optionB: {
      text: "Refuse the publicity",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { money: -4 } },
        { type: 'RESOURCE_CHANGE', changes: { knowledge: 4 } }
      ]
    }
  }
  },
  {
  deck: "Age of Legacy",
  name: "Memory Laws",
  description: "A proposal circulates to criminalize denial of past atrocities. Do you back the law or remain neutral?",
  choice: {
    optionA: {
      text: "Support the proposal",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { influence: 6 } },
        { type: 'RESOURCE_CHANGE', changes: { money: -3 } }
      ]
    },
    optionB: {
      text: "Stay neutral",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { influence: -4 } },
        { type: 'RESOURCE_CHANGE', changes: { knowledge: 3 } }
      ]
    }
  }
  },
  {
  deck: "Age of Legacy",
  name: "Archival Silences",
  description: "Lost records resurface in a private collection. Do you purchase them or publicize their existence?",
  choice: {
    optionA: {
      text: "Acquire the records",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { money: -6 } },
        { type: 'RESOURCE_CHANGE', changes: { knowledge: 5 } }
      ]
    },
    optionB: {
      text: "Publicize the find",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { influence: 4 } },
        { type: 'RESOURCE_CHANGE', changes: { knowledge: -2 } }
      ]
    }
  }
  },
  {
  deck: "Age of Legacy",
  name: "Historical Trauma",
  description: "Communities demand reparations for past abuses. Do you pledge funding or offer symbolic recognition?",
  choice: {
    optionA: {
      text: "Provide funding",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { money: -7 } },
        { type: 'RESOURCE_CHANGE', changes: { influence: 4 } }
      ]
    },
    optionB: {
      text: "Offer recognition",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { influence: -3 } },
        { type: 'RESOURCE_CHANGE', changes: { knowledge: 3 } }
      ]
    }
  }
  },
  {
  deck: "Age of Legacy",
  name: "Victors Write History",
  description: "A publisher offers you exclusive rights to a major historical account. Do you accept their narrative or commission a competing version?",
  choice: {
    optionA: {
      text: "Accept the narrative",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { money: 5 } },
        { type: 'RESOURCE_CHANGE', changes: { influence: 5 } }
      ]
    },
    optionB: {
      text: "Commission a rival work",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { money: -4 } },
        { type: 'RESOURCE_CHANGE', changes: { knowledge: 5 } }
      ]
    }
  }
  },
  {
  deck: "Age of Legacy",
  name: "Counter-Narratives Emerge",
  description: "Activists demand space for marginalized histories. Do you fund their exhibition or restrict the debate?",
  choice: {
    optionA: {
      text: "Fund the exhibition",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { knowledge: 6 } },
        { type: 'RESOURCE_CHANGE', changes: { influence: -3 } }
      ]
    },
    optionB: {
      text: "Restrict debate",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { influence: 5 } },
        { type: 'RESOURCE_CHANGE', changes: { knowledge: -2 } }
      ]
    }
  }
  },
  {
  deck: "Age of Legacy",
  name: "Public History Debates",
  description: "A televised panel on the past invites your participation. Do you attend or decline the invitation?",
  choice: {
    optionA: {
      text: "Join the debate",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { influence: 7 } },
        { type: 'RESOURCE_CHANGE', changes: { money: -3 } }
      ]
    },
    optionB: {
      text: "Decline the invitation",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { knowledge: 3 } },
        { type: 'RESOURCE_CHANGE', changes: { influence: -5 } }
      ]
    }
  }
  },
  {
  deck: "Age of Legacy",
  name: "Legacy of Resistance",
  description: "A movement celebrating historical dissent seeks your endorsement. Do you lend your support or remain distant?",
  choice: {
    optionA: {
      text: "Endorse the movement",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { influence: 4 } },
        { type: 'MOVEMENT', target: 'SELF', spaces: 5 }
      ]
    },
    optionB: {
      text: "Stay distant",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { money: 3 } },
        { type: 'RESOURCE_CHANGE', changes: { influence: -4 } }
      ]
    }
  }
  },
  {
  deck: "Age of Legacy",
  name: "Generational Amnesia",
  description: "Education reforms remove controversial topics. Do you protest the curriculum or adapt your message?",
  choice: {
    optionA: {
      text: "Protest publicly",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { influence: 6 } },
        { type: 'RESOURCE_CHANGE', changes: { knowledge: -3 } }
      ]
    },
    optionB: {
      text: "Adapt quietly",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { knowledge: 4 } },
        { type: 'RESOURCE_CHANGE', changes: { influence: -4 } }
      ]
    }
  }
  },
  {
  deck: "Age of Legacy",
  name: "Future Histories",
  description: "Archivists offer to preserve your story for posterity. Do you invest or dismiss their overture?",
  choice: {
    optionA: {
      text: "Invest in preservation",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { money: -5 } },
        { type: 'RESOURCE_CHANGE', changes: { knowledge: 6 } }
      ]
    },
    optionB: {
      text: "Dismiss the overture",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { influence: 4 } },
        { type: 'RESOURCE_CHANGE', changes: { knowledge: -3 } }
      ]
    }
  }
  },
  {
  deck: "Age of Legacy",
  name: "Rewriting the Past",
  description: "A powerful figure proposes revising a historical account in your favor. Do you agree or refuse?",
  choice: {
    optionA: {
      text: "Agree to revisions",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { influence: 8 } },
        { type: 'RESOURCE_CHANGE', changes: { knowledge: -5 } }
      ]
    },
    optionB: {
      text: "Refuse the offer",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { knowledge: 4 } },
        { type: 'RESOURCE_CHANGE', changes: { money: -3 } }
      ]
    }
  }
  },
  {
  deck: "Age of Legacy",
  name: "The Weight of History",
  description: "A scandal resurfaces, implicating your predecessors. Do you issue an apology or deny involvement?",
  choice: {
    optionA: {
      text: "Issue an apology",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { influence: -3 } },
        { type: 'MOVEMENT', target: 'SELF', spaces: 4 }
      ]
    },
    optionB: {
      text: "Deny involvement",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { money: 4 } },
        { type: 'RESOURCE_CHANGE', changes: { influence: -5 } }
      ]
    }
  }
  },
  // NEW CARD 1
  {
  deck: "Age of Legacy",
  name: "Monuments Commission",
  description: "A committee debates whether to remove controversial statues. Do you advocate removal or preservation?",
  choice: {
    optionA: {
      text: "Advocate removal",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { influence: 5 } },
        { type: 'RESOURCE_CHANGE', changes: { money: -4 } }
      ]
    },
    optionB: {
      text: "Defend preservation",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { money: 3 } },
        { type: 'RESOURCE_CHANGE', changes: { influence: -3 } }
      ]
    }
  }
  },
  {
  deck: "Age of Legacy",
  name: "Echoes of Revolution",
  description: "A radical faction invites you to endorse their manifesto. Do you sign or distance yourself?",
  choice: {
    optionA: {
      text: "Sign the manifesto",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { knowledge: 5 } },
        { type: 'RESOURCE_CHANGE', changes: { influence: -4 } }
      ]
    },
    optionB: {
      text: "Distance yourself",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { influence: 4 } },
        { type: 'RESOURCE_CHANGE', changes: { money: 2 } }
      ]
    }
  }
  },
  {
  deck: "Age of Legacy",
  name: "Cultural Renaissance",
  description: "Artists request patronage for a movement celebrating the past. Do you fund them or invest elsewhere?",
  choice: {
    optionA: {
      text: "Fund the artists",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { money: -5 } },
        { type: 'RESOURCE_CHANGE', changes: { influence: 6 } }
      ]
    },
    optionB: {
      text: "Invest in other ventures",
      effects: [
        { type: 'RESOURCE_CHANGE', changes: { money: 4 } },
        { type: 'RESOURCE_CHANGE', changes: { knowledge: -2 } }
      ]
    }
  }
  }
] 

// Export the cards array directly
export const PINK_DECK = [...ageOfLegacyDeck];