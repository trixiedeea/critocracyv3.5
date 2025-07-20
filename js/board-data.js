// Board data module for Critocracy - Coordinate-Based System
// Contains board layout constants and path definitions as arrays of space objects.

// Constants for board dimensions
export const ORIGINAL_WIDTH = 1536;
export const ORIGINAL_HEIGHT = 1024;

// Path colors
export const PATH_COLORS = {
    ageOfExpansionPath: "path-purple",    // purple
    ageOfResistancePath: "path-blue",   // blue
    ageOfReckoningPath: "path-cyan",    // cyan
    ageOfLegacyPath: "path-pink"        // pink
};


// Deck regions with their properties
export const fullDeckRegionPathMap = {
    ageOfExpansion: {
      deckType: 'ageOfExpansionDeck',
      regionId: 'ageOfExpansionRegion',
      name: 'Age of Expansion',
      pathColorKey: 'purplePath',
      cssClass: 'path-purple',
      pathName: 'Age of Expansion Path',
      pathKey: 'ageOfExpansionPath',
      pathButtonLabel: 'Age of Expansion',
      positions: [
        {
          topleft: 566, toplefty: 473,
          toprightx: 654, topright: 473,
          bottomrightx: 654, bottomright: 618,
          bottomleftx: 566, bottomleft: 618
        }
      ],
      type: 'age'
    },
  
    ageOfLegacy: {
      deckType: 'ageOfLegacyDeck',
      regionId: 'ageOfLegacyRegion',
      name: 'Age of Legacy',
      pathColorKey: 'pinkPath',
      cssClass: 'path-pink',
      pathName: 'Age of Legacy Path',
      pathKey: 'ageOfLegacyPath',
      pathButtonLabel: 'Age of Legacy',
      positions: [
        {
          topleft: 692, toplefty: 253,
          toprightx: 804, topright: 253,
          bottomrightx: 804, bottomright: 400,
          bottomleftx: 692, bottomleft: 400
        }
      ],
      type: 'age'
    },
  
    ageOfResistance: {
      deckType: 'ageOfResistanceDeck',
      regionId: 'ageOfResistanceRegion',
      name: 'Age of Resistance',
      pathColorKey: 'bluePath',
      cssClass: 'path-blue',
      pathName: 'Age of Resistance Path',
      pathKey: 'ageOfResistancePath',
      pathButtonLabel: 'Age of Resistance',
      positions: [
        {
          topleft: 843, toplefty: 472,
          toprightx: 941, topright: 472,
          bottomrightx:941, bottomright: 619,
          bottomleftx: 843, bottomleft: 619
        }
      ],
      type: 'age'
    },
  
    ageOfReckoning: {
      deckType: 'ageOfReckoningDeck',
      regionId: 'ageOfReckoningRegion',
      name: 'Age of Reckoning',
      pathColorKey: 'cyanPath',
      cssClass: 'path-cyan',
      pathName: 'Age of Reckoning Path',
      pathKey: 'ageOfReckoningPath',
      pathButtonLabel: 'Age of Reckoning',
      positions: [
        {
          topleft: 690, toplefty: 699,
          toprightx: 804, topright: 699,
          bottomrightx: 804, bottomright: 864,
          bottomleftx: 690, bottomleft: 864
        }
      ],
      type: 'age'
    },
  
    endOfTurn: {
      deckType: 'endOfTurnDeck',
      regionId: 'endOfTurnRegion', // Changed to match the key in fullDeckRegionMap
      name: 'End of Turn',
      pathColorKey: 'gold',
      cssClass: null,
      pathName: null,
      pathKey: null,
      pathButtonLabel: null,
      positions: [
        {
          topleft: 302, toplefty: 444,
          toprightx: 386, topright: 444,
          bottomrightx: 386, bottomright: 582,
          bottomleftx: 302, bottomleft: 582
        },
        {
          topleft: 1128, toplefty: 458,
          toprightx: 1210, topright: 458,
          bottomrightx: 1210, bottomright: 596,
          bottomleftx: 1128, bottomleft: 596
        }
      ],
      type: 'endOfTurn'
    }
};

export function getPathOptionsFromStart() {
    return Object.entries(START_SPACE.nextCoordOptions).map(([pathKey, coordsArray]) => {
        const pathInfo = fullDeckRegionPathMap[pathKey];
        if (!pathInfo) {
            console.warn(`No path info found for key: ${pathKey}`);
            return null;
        }
        return {
            text: pathInfo.pathName,
            coords: { x: coordsArray[0], y: coordsArray[1] },
            color: pathInfo.color,
            pathName: pathKey
        };
    }).filter(Boolean);
}

// Space types
export const SPACE_TYPE = {
    Regular: "Regular",
    Draw: "Draw",
    Choicepoint: "Choicepoint",
    Start: "Start",
    Finish: "Finish"
};

// Start and Finish spaces
export const START_SPACE = {
    coordinates: [104, 512],
    type: SPACE_TYPE.Start,
    nextCoordOptions: {
        ageOfExpansion: [104, 512],
        ageOfResistance: [104, 512],
        ageOfReckoning: [104, 512],
        ageOfLegacy: [104, 512]
    }
};

export const FINISH_SPACE = {
    coordinates: [1384, 512],
    type: SPACE_TYPE.Finish
};

// Path Definitions
export const ageOfExpansionPath = {
    color: 'purple',
    name: 'Age of Expansion',
    startCoord: [104, 512],
    endCoord: FINISH_SPACE.coordinates,
    segments: [
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[104, 512]], Next: [[144, 457]], Type: "Regular" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[144, 457]], Next: [[154, 428]], Type: "Regular" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[154, 428]], Next: [[166, 398]], Type: "Regular" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[166, 398]], Next: [[180, 366]], Type: "Regular" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[180, 366]], Next: [[194, 337]], Type: "Regular" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[194, 337]], Next: [[213, 309]], Type: "Regular" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[213, 309]], Next: [[244, 286]], Type: "Regular" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[244, 286]], Next: [[272, 269]], Type: "Regular" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[272, 269]], Next: [[308, 257]], Type: "Regular" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[308, 257]], Next: [[343, 252]], Type: "Regular" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[343, 252]], Next: [[378, 250]], Type: "Regular" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[378, 250]], Next: [[413, 250]], Type: "Regular" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[413, 250]], Next: [[447, 253]], Type: "Regular" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[447, 253]], Next: [[479, 266]], Type: "Regular" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[479, 266]], Next: [[511, 281]], Type: "Regular" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[511, 281]], Next: [[534, 302]], Type: "Regular" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[534, 302]], Next: [[567, 328], [544, 259]], Type: "Choicepoint", pathNames: ["ageOfExpansionPath, ageOfReckoningPath"] , spaceId: "16P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[567, 328]], Next: [[590, 345]], Type: "Regular" , spaceId: "17P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[590, 345]], Next: [[610, 371]], Type: "Regular" , spaceId: "18P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[610, 371]], Next: [[633, 400]], Type: "Draw" , spaceId: "19P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[633, 400]], Next: [[648, 430]], Type: "Regular" , spaceId: "20P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[648, 430]], Next: [[667, 464]], Type: "Regular" , spaceId: "21P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[667, 464]], Next: [[681, 492]], Type: "Regular" , spaceId: "22P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[681, 492]], Next: [[701, 518]], Type: "Draw" , spaceId: "23P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[701, 518]], Next: [[724, 541]], Type: "Regular" , spaceId: "24P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[724, 541]], Next: [[744, 558]], Type: "Regular" , spaceId: "25P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[744, 558]], Next: [[774, 599], [769, 541]], Type: "Choicepoint", pathNames: ["ageOfExpansionPath, ageOfLegacyPath"] , spaceId: "26P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[774, 599]], Next: [[793, 632]], Type: "Regular" , spaceId: "27P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[793, 632]], Next: [[816, 658]], Type: "Regular" , spaceId: "28P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[816, 658]], Next: [[833, 685]], Type: "Draw" , spaceId: "29P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[833, 685]], Next: [[859, 708]], Type: "Regular" , spaceId: "30P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[859, 708]], Next: [[881, 729]], Type: "Regular" , spaceId: "31P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[881, 729]], Next: [[915, 747]], Type: "Regular" , spaceId: "32P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[915, 747]], Next: [[931, 756]], Type: "Draw" , spaceId: "33P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[931, 756]], Next: [[962, 766]], Type: "Regular" , spaceId: "34P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[962, 766]], Next: [[996, 780], [975, 738]], Type: "Choicepoint", pathNames: ["ageOfExpansionPath, ageOfResistancePath"] , spaceId: "35P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[996, 780]], Next: [[1016, 789]], Type: "Regular" , spaceId: "36P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[1019, 768]], Next: [[1047, 770]], Type: "Regular" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[1047, 770]], Next: [[1075, 774]], Type: "Regular" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[1075, 774]], Next: [[1107, 772]], Type: "Regular" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[1107, 772]], Next: [[1137, 770]], Type: "Regular" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[1137, 770]], Next: [[1170, 762]], Type: "Regular" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[1170, 762]], Next: [[1199, 752]], Type: "Regular" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[1199, 752]], Next: [[1221, 740]], Type: "Regular" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[1221, 740]], Next: [[1245, 720]], Type: "Regular" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[1245, 720]], Next: [[1268, 704]], Type: "Regular" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[1268, 704]], Next: [[1289, 683]], Type: "Regular" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[1289, 683]], Next: [[1308, 662]], Type: "Regular" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[1308, 662]], Next: [[1325, 633]], Type: "Regular" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[1325, 633]], Next: [[1339, 600]], Type: "Regular" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[1339, 600]], Next: [[1348, 571]], Type: "Regular" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[1348, 571]], Next: [[1384, 512]], Type: "Regular" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[1384, 512]], Type: "FINISH_SPACE", spaceId: "FINISH" }
        // NOTE: Last space should implicitly lead to FINISH based on coordinates									
// NOTE: Last space should implicitly lead to FINISH based on coordinates
]
};

export const ageOfResistancePath = {
    color: 'blue',
    name: 'Age of Resistance',
    startCoord: [104, 512],
    endCoord: FINISH_SPACE.coordinates,
    segments: [
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[104, 512]], Next: [[195, 475]], spaceId: "START" },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[195, 475]], Next: [[222, 450]], Type: "Draw" ,  },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[222, 450]], Next: [[245, 424]], Type: "Draw" ,  },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[245, 424]], Next: [[271, 399]], Type: "Draw" ,  },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[271, 399]], Next: [[301, 370]], Type: "Draw" ,  },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[301, 370]], Next: [[334, 340]], Type: "Draw" ,  },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[334, 340]], Next: [[380, 317]], Type: "Draw" ,  },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[380, 317]], Next: [[419, 338]], Type: "Draw" ,  },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[419, 338]], Next: [[442, 368]], Type: "Draw" ,  },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[442, 368]], Next: [[457, 402]], Type: "Draw" ,  },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[457, 402]], Next: [[475, 443]], Type: "Draw" ,  },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[475, 443]], Next: [[488, 487]], Type: "Draw" ,  },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[488, 487]], Next: [[502, 532], [530, 478]], Type: "Choicepoint", pathNames: ["ageOfResistancePath, ageOfReckoningPath"] , spaceId: "12B" },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[502, 532]], Next: [[514, 566]], Type: "Draw" ,  },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[514, 566]], Next: [[523, 602]], Type: "Draw" ,  },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[523, 602]], Next: [[533, 637]], Type: "Draw" ,  },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[533, 637]], Next: [[541, 675]], Type: "Draw" ,  },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[541, 675]], Next: [[549, 711]], Type: "Draw" ,  },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[549, 711]], Next: [[556, 742]], Type: "Draw" ,  },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[556, 742]], Next: [[563, 772]], Type: "Draw" ,  },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[563, 772]], Next: [[572, 810], [585, 739]], Type: "Choicepoint", pathNames: ["ageOfResistancePath, ageOfLegacyPath"] , spaceId: "20B" },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[572, 810]], Next: [[588, 840]], Type: "Draw" ,  },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[588, 840]], Next: [[606, 869]], Type: "Draw" ,  },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[606, 869]], Next: [[641, 895]], Type: "Draw" ,  },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[641, 895]], Next: [[679, 910]], Type: "Draw" ,  },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[679, 910]], Next: [[715, 918]], Type: "Draw" ,  },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[715, 918]], Next: [[752, 918]], Type: "Draw" ,  },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[752, 918]], Next: [[794, 897]], Type: "Regular" },	
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[794, 897]], Next: [[829, 885]], Type: "Regular" },	
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[829, 885]], Next: [[862, 869]], Type: "Regular" },	
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[862, 869]], Next: [[892, 851]], Type: "Regular" },	
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[892, 851]], Next: [[911, 829]], Type: "Regular" },	
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[911, 829]], Next: [[928, 799]], Type: "Regular" },	
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[928, 799]], Next: [[962, 766]], Type: "Regular" },	
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[962, 766]], Next: [[975, 738], [996, 780]], Type: "Choicepoint", pathNames: ["ageOfResistancePath, ageOfExpansionPath"] , spaceId: "35B" },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[966, 729]], Next: [[971, 705]], Type: "Regular" },	
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[971, 705]], Next: [[973, 673]], Type: "Regular" },	
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[973, 673]], Next: [[974, 642]], Type: "Regular" },	
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[974, 642]], Next: [[974, 618]], Type: "Regular" },	
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[974, 618]], Next: [[962, 578]], Type: "Regular" },	
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[962, 578]], Next: [[959, 539]], Type: "Regular" },	
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[959, 539]], Next: [[1019, 534]], Type: "Regular" },	
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1019, 534]], Next: [[1045, 532], [1031, 574]], Type: "Choicepoint", pathNames: ["ageOfResistancePath, ageOfReckoningPath"] , spaceId: "43B" },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1045, 532]], Next: [[1065, 509]], Type:"Regular"},
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1065, 509]], Next: [[1089, 500]], Type:"Regular"},
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1089, 500]], Next: [[1078, 473]], Type:"Regular"},
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1078, 473]], Next: [[1054, 437]], Type:"Regular"},
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1054, 437]], Next: [[1050, 400]], Type:"Regular"},
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1050, 400]], Next: [[1066, 366]], Type:"Regular"},
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1066, 366]], Next: [[1096, 340]], Type:"Regular"},
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1096, 340]], Next: [[1132, 334]], Type:"Regular"},
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1132, 334]], Next: [[1173, 349]], Type:"Regular"},
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1173, 349]], Next: [[1201, 375]], Type:"Regular"},
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1201, 375]], Next: [[1222, 405]], Type:"Regular"},
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1222, 405]], Next: [[1247, 432]], Type:"Regular"},
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1247, 432]], Next: [[1268, 449]], Type:"Regular"},
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1268, 449]], Next: [[1297, 472]], Type:"Regular"},
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1297, 472]], Next: [[1319, 490]], Type:"Regular"},
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1319, 490]], Next: [[1384, 512]], Type:"Regular"},
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1384, 512]], Type:"FINISH_SPACE"},
// NOTE: Last space should implicitly lead to FINISH based on coordinates
]
};

export const ageOfReckoningPath = {
    color: 'cyan',
    name: 'Age of Reckoning',
    startCoord: [104, 512],
    endCoord: FINISH_SPACE.coordinates,
    segments: [

      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[104, 512]], Next: [[205, 548]], spaceId: "START" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[205, 548]], Next: [[225, 572]], Type: "Regular",	spaceId: "1C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[225, 572]], Next: [[242, 598]], Type: "Draw", spaceId: "2C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[242, 598]], Next: [[263, 618]], Type: "Regular",	spaceId: "3C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[263, 618]], Next: [[290, 639]], Type: "Regular",	spaceId: "4C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[290, 639]], Next: [[320, 658]], Type: "Regular",	spaceId: "5C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[320, 658]], Next: [[350, 669]], Type: "Draw",	spaceId: "6C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[350, 669]], Next: [[385, 671]], Type: "Regular",	spaceId: "7C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[385, 671]], Next: [[417, 668]], Type: "Regular",	spaceId: "8C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[417, 668]], Next: [[435, 667]], Type: "Regular",	spaceId: "9C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[435, 667]], Next: [[457, 644]], Type: "Draw",	spaceId: "10C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[457, 644]], Next: [[456, 611]], Type: "Regular",	spaceId: "11C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[456, 611]], Next: [[445, 579]], Type: "Regular",	spaceId: "12C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[445, 579]], Next: [[408, 558]], Type: "Regular",	spaceId: "13C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[408, 558]], Next: [[401, 506]], Type: "Draw",	spaceId: "14C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[401, 506]], Next: [[442, 480]], Type: "Regular",	spaceId: "15C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[442, 480]], Next: [[489, 483]], Type: "Regular",	spaceId: "16C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[489, 483]], Next: [[530, 478], [502, 532]], Type: "Choicepoint", pathNames: ["ageOfReckoningPath, ageOfResistancePath"] , spaceId: "17C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[530, 478]], Next: [[528, 442]], Type: "Regular",	spaceId: "18C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[528, 442]], Next: [[517, 418]], Type: "Regular", spaceId: "19C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[517, 418]], Next: [[509, 380]], Type: "Regular", spaceId: "20C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[509, 380]], Next: [[517, 352]], Type: "Draw", spaceId: "21C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[517, 352]], Next: [[537, 302]], Type: "Regular", spaceId: "22C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[537, 302]], Next: [[544, 259], [567, 328]], Type: "Choicepoint", pathNames: ["ageOfReckoningPath, ageOfExpansionPath"] , spaceId: "23C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[544, 259]], Next: [[571, 227]], Type: "Regular", spaceId: "24C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[571, 227]], Next: [[601, 207]], Type: "Regular", spaceId: "25C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[601, 207]], Next: [[633, 193]], Type: "Regular", spaceId: "26C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[633, 193]], Next: [[669, 175]], Type: "Regular", spaceId: "27C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[669, 175]], Next: [[706, 175]], Type: "Regular", spaceId: "28C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[706, 175]], Next: [[734, 171]], Type: "Draw", spaceId: "29C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[734, 171]], Next: [[767, 175]], Type: "Regular", spaceId: "30C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[767, 175]], Next: [[800, 173]], Type: "Regular", spaceId: "31C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[800, 173]], Next: [[830, 183]], Type: "Draw", spaceId: "32C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[830, 183]], Next: [[865, 193]], Type: "Regular",	spaceId: "33C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[865, 193]], Next: [[893, 204]], Type: "Regular",	spaceId: "34C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[893, 204]], Next: [[917, 225]], Type: "Regular",	spaceId: "35C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[917, 225]], Next: [[935, 250]], Type: "Draw",	spaceId: "36C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[935, 250]], Next: [[943, 270]], Type: "Regular",	spaceId: "37C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[943, 270]], Next: [[973, 340], [987, 290]], Type: "Choicepoint", pathNames: ["ageOfReckoningPath, ageOfLegacyPath"] ,	spaceId: "38C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[973, 340]], Next: [[980, 378]], Type: "Regular",	spaceId: "39C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[980, 378]], Next: [[985, 415]], Type: "Regular",	spaceId: "40C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[985, 415]], Next: [[989, 446]], Type: "Draw",	spaceId: "41C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[989, 446]], Next: [[994, 477]], Type: "Regular",	spaceId: "42C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[994, 477]], Next: [[1003, 522]], Type: "Regular",	spaceId: "43C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[1003, 522]], Next: [[1031, 574], [1045, 532]], Type: "Choicepoint", pathNames: ["ageOfReckoningPath, ageOfResistancePath"] ,	spaceId: "44C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[1031, 574]], Next: [[1040, 571]], Type: "Regular" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[1055, 591]], Next: [[1076, 613]], Type: "Regular" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[1076, 613]], Next: [[1098, 628]], Type: "Regular" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[1098, 628]], Next: [[1128, 633]], Type: "Draw" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[1128, 633]], Next: [[1154, 635]], Type: "Regular" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[1154, 635]], Next: [[1180, 633]], Type: "Regular" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[1180, 633]], Next: [[1213, 619]], Type: "Regular" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[1213, 619]], Next: [[1238, 603]], Type: "Draw" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[1238, 603]], Next: [[1263, 576]], Type: "Regular" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[1263, 576]], Next: [[1290, 556]], Type: "Regular" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[1290, 556]], Next: [[1310, 540]], Type: "Draw" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[1310, 540]], Next: [[1328, 525]], Type: "Regular" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[1328, 525]], spaceId: "FINISH" },
// NOTE: Last space should implicitly lead to FINISH based on coordinates
]
};

export const ageOfLegacyPath = {
    color: 'pink',
    name: 'Age of Legacy',
    startCoord: [104, 512],
    endCoord: FINISH_SPACE.coordinates,
    segments: [
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[104, 512]], Next: [[163, 575]], spaceId: "START" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[163, 575]], Next: [[180, 604]], Type: "Regular", spaceId: "1PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[180, 604]], Next: [[191, 638]], Type: "Draw", spaceId: "2PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[191, 638]], Next: [[206, 667]], Type: "Regular", spaceId: "3PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[206, 667]], Next: [[218, 698]], Type: "Regular", spaceId: "4PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[218, 698]], Next: [[240, 729]], Type: "Regular", spaceId: "5PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[240, 729]], Next: [[263, 748]], Type: "Regular", spaceId: "6PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[263, 748]], Next: [[286, 765]], Type: "Draw", spaceId: "7PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[286, 765]], Next: [[318, 777]], Type: "Regular", spaceId: "8PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[318, 777]], Next: [[348, 785]], Type: "Regular", spaceId: "9PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[348, 785]], Next: [[378, 790]], Type: "Draw", spaceId: "10PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[378, 790]], Next: [[419, 790]], Type: "Regular", spaceId: "11PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[419, 790]], Next: [[455, 791]], Type: "Regular", spaceId: "12PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[455, 791]], Next: [[504, 787]], Type: "Draw", spaceId: "13PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[504, 787]], Next: [[528, 781]], Type: "Regular", spaceId: "14PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[528, 781]], Next: [[562, 770]], Type: "Regular", spaceId: "15PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[562, 770]], Next: [[585, 739], [572, 810]], Type: "Choicepoint", pathNames: ["ageOfLegacyPath, ageOfResistancePath"] , spaceId: "16PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[585, 739]], Next: [[604, 718]], Type: "Regular", spaceId: "17PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[604, 718]], Next: [[625, 697]], Type: "Regular", spaceId: "18PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[625, 697]], Next: [[647, 677]], Type: "Regular", spaceId: "19PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[647, 677]], Next: [[667, 651]], Type: "Draw", spaceId: "20PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[667, 651]], Next: [[689, 622]], Type: "Regular", spaceId: "21PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[689, 622]], Next: [[704, 594]], Type: "Regular", spaceId: "22PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[704, 594]], Next: [[731, 573]], Type: "Draw", spaceId: "23PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[731, 573]], Next: [[769, 541], [774, 599]], Type: "Choicepoint", pathNames: ["ageOfLegacyPath, ageOfExpansionPath"] , spaceId: "24PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[769, 541]], Next: [[766, 491]], Type: "Draw" , spaceId: "26PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[766, 491]], Next: [[795, 462]], Type: "Regular" , spaceId: "27PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[795, 462]], Next: [[815, 440]], Type: "Regular" , spaceId: "28PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[815, 440]], Next: [[829, 415]], Type: "Regular" , spaceId: "29PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[829, 415]], Next: [[851, 379]], Type: "Draw" , spaceId: "30PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[851, 379]], Next: [[872, 353]], Type: "Regular" , spaceId: "31PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[872, 353]], Next: [[893, 332]], Type: "Regular" , spaceId: "32PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[893, 332]], Next: [[916, 310]], Type: "Regular" , spaceId: "33PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[916, 310]], Next: [[953, 295]], Type: "Regular" , spaceId: "34PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[953, 295]], Next: [[987, 290], [973, 340]], Type: "Choicepoint", pathNames: ["ageOfLegacyPath, ageOfReckoningPath"] , spaceId: "35PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[987, 290]], Next: [[1011, 261]], Type: "Regular" , spaceId: "36PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[1011, 261]], Next: [[1049, 253]], Type: "Regular" , spaceId: "37PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[1049, 253]], Next: [[1075, 248]], Type: "Regular" , spaceId: "38PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[1075, 248]], Next: [[1117, 250]], Type: "Draw" , spaceId: "39PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[1117, 250]], Next: [[1147, 249]], Type: "Regular" , spaceId: "40PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[1147, 249]], Next: [[1180, 258]], Type: "Regular" , spaceId: "41PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[1180, 258]], Next: [[1209, 270]], Type: "Regular" , spaceId: "42PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[1209, 270]], Next: [[1237, 282]], Type: "Regular" , spaceId: "43PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[1237, 282]], Next: [[1263, 304]], Type: "Draw" , spaceId: "44PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[1263, 304]], Next: [[1276, 351]], Type: "Regular" , spaceId: "45PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[1276, 351]], Next: [[1298, 376]], Type: "Regular" , spaceId: "46PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[1298, 376]], Next: [[1308, 406]], Type: "Regular" , spaceId: "47PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[1308, 406]], Next: [[1315, 430]], Type: "Draw" , spaceId: "48PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[1315, 430]], Next: [[1337, 459]], Type: "Regular" , spaceId: "49PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[1337, 459]], Next: [[1384, 512]], Type: "Regular" , spaceId: "50PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[1384, 512]], Type: "FINISH_SPACE" , spaceId: "FINISH" },
// NOTE: Last space should implicitly lead to FINISH based on coordinates
]
};

// Export paths with age names for convenience
// (Assumes these exist globally — if not, add them where paths are defined)
ageOfExpansionPath.pathName = 'ageOfExpansionPath';
ageOfResistancePath.pathName = 'ageOfResistancePath';
ageOfReckoningPath.pathName = 'ageOfReckoningPath';
ageOfLegacyPath.pathName = 'ageOfLegacyPath';

export const choicepoints = [
  {
    id: "choicepoint1",
    coords: {       
      topleft: 461, toplefty: 474,
      toprightx: 510, toprighty: 459,
      bottomleftx: 524, bottomlefty: 507,
      bottomrightx: 474, bottomrighty: 517
    },
    switchOptions: ['ageOfResistancePath', 'ageOfReckoningPath']
  },

  {
    id: "choicepoint2",
    coords:{
      topleft: 504, toplefty: 310,
      toprightx: 526, toprighty: 279,
      bottomleftx: 567, bottomlefty: 303,
      bottomrightx: 542, bottomrighty: 339
    },
    switchOptions: ['ageOfExpansionPath', 'ageOfReckoningPath']
  },
  {
    id: "choicepoint3",
    coords:{
      topleft: 533, toplefty: 758,
      toprightx: 577, toprighty: 742,
      bottomleftx: 589, bottomlefty: 785,
      bottomrightx: 544, bottomrighty: 803
    },
    switchOptions: ['ageOfResistancePath', 'ageOfLegacyPath']
  },
  {
    id: "choicepoint4",
    coords: {
      topleft: 717, toplefty: 567,
      toprightx: 749, toprighty: 538,
      bottomleftx: 775, bottomlefty: 568,
      bottomrightx: 747, bottomrighty: 605
    },
    switchOptions: ['ageOfExpansionPath', 'ageOfLegacyPath']
  },
  {
    id: "choicepoint5",
    coords: {
      topleft: 924, toplefty: 292,
      toprightx: 993, toprighty: 292,
      bottomleftx: 993, bottomlefty: 313,
      bottomrightx: 924, bottomrighty: 313
    },
    switchOptions: ['ageOfReckoningPath', 'ageOfLegacyPath']
  },
  {
    id: "choicepoint6",
    coords: {
      topleft: 930, toplefty: 786,
      toprightx: 994, toprighty: 786,
      bottomleftx: 994, bottomlefty: 759,
      bottomrightx: 930, bottomrighty: 759
    },
    switchOptions: ['ageOfExpansionPath', 'ageOfResistancePath']
  },
  {
    id: "choicepoint7",
    coords: {
      topleft: 979, toplefty: 513,
      toprightx: 1046, toprighty: 513,
      bottomleftx: 1046, bottomlefty: 555,
      bottomrightx: 979, bottomrighty: 555
    },
    switchOptions: ['ageOfReckoningPath', 'ageOfResistancePath']
  }
];






