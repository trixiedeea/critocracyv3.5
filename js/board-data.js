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
      pathName: 'ageOfExpansionPath',
      pathButtonLabel: 'Age of Expansion',
      positions: [
        {
          topleft: 568, toplefty: 478,
          toprightx: 652, topright: 478,
          bottomrightx: 652, bottomright: 616,
          bottomleftx: 568, bottomleft: 616
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
      pathName: 'ageOfLegacyPath',
      pathButtonLabel: 'Age of Legacy',
      positions: [
        {
          topleft: 695, toplefty: 257,
          toprightx: 802, topright: 257,
          bottomrightx: 802, bottomright: 396,
          bottomleftx: 695, bottomleft: 396
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
      pathName: 'ageOfResistancePath',
      pathButtonLabel: 'Age of Resistance',
      positions: [
        {
          topleft: 847, toplefty: 477,
          toprightx: 938, topright: 477,
          bottomrightx:938, bottomright: 616,
          bottomleftx: 847, bottomleft: 616
        }
      ],
      type: 'age'
    },
  
    ageOfReckoning: {
      deckType: 'ageOfReckoningDeck',
      regionId: 'ageOfReckoningRegion',
      name: 'Age of Reckoning',
      pathColorKey: 'cyanPath',
      pathName: 'ageOfReckoningPath',
      pathButtonLabel: 'Age of Reckoning',
      positions: [
        {
          topleft: 694, toplefty: 703,
          toprightx: 802, topright: 703,
          bottomrightx: 802, bottomright: 864,
          bottomleftx: 694, bottomleft: 864
        }
      ],
      type: 'age'
    },
  
    endOfTurn: {
      deckType: 'endOfTurnDeck',
      regionId: 'endOfTurnRegion', // Changed to match the key in fullDeckRegionMap
      name: 'End of Turn',
      pathColorKey: 'gold',
      pathName: null,
      pathButtonLabel: null,
      positions: [
        {
          topleft: 307, toplefty: 450,
          toprightx: 383, topright: 450,
          bottomrightx: 383, bottomright: 578,
          bottomleftx: 307, bottomleft: 578
        },
        {
          topleft: 1131, toplefty: 463,
          toprightx: 1207, topright: 463,
          bottomrightx: 1207, bottomright: 591,
          bottomleftx: 1131, bottomleft: 591
        }
      ],
      type: 'endOfTurn'
    }
};

export function getPathOptionsFromStart() {
    //console.log('---------getPathOptionsFromStart---------');
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
    regular: "regular",
    draw: "draw",
    choicepoint: "choicepoint",
    start: "start",
    finish: "finish"
};

// Start and Finish spaces
export const START_SPACE = {
    coordinates: [104, 512],
    type: SPACE_TYPE.start,
    nextCoordOptions: {
        ageOfExpansion: [104, 512],
        ageOfResistance: [104, 512],
        ageOfReckoning: [104, 512],
        ageOfLegacy: [104, 512]
    }
};

export const FINISH_SPACE = {
    coordinates: [1384, 512],
    type: SPACE_TYPE.finish
};

// Path Definitions
export const ageOfExpansionPath = {
    color: 'purple',
    name: 'Age of Expansion',
    startCoord: [104, 512],
    endCoord: FINISH_SPACE.coordinates,
    segments: [
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[104, 512]], Next: [[144, 457]], Type: "start", spaceId: "start" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[144, 457]], Next: [[154, 428]], Type: "draw", spaceId: "1P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[154, 428]], Next: [[166, 398]], Type: "regular", spaceId: "2P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[166, 398]], Next: [[180, 366]], Type: "draw", spaceId: "3P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[180, 366]], Next: [[194, 337]], Type: "draw", spaceId: "4P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[194, 337]], Next: [[213, 309]], Type: "regular", spaceId: "5P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[213, 309]], Next: [[244, 286]], Type: "regular", spaceId: "6P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[244, 286]], Next: [[272, 269]], Type: "draw", spaceId: "7P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[272, 269]], Next: [[308, 257]], Type: "regular", spaceId: "8P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[308, 257]], Next: [[343, 252]], Type: "draw", spaceId: "9P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[343, 252]], Next: [[378, 250]], Type: "draw", spaceId: "10P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[378, 250]], Next: [[413, 250]], Type: "regular", spaceId: "11P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[413, 250]], Next: [[447, 253]], Type: "regular", spaceId: "12P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[447, 253]], Next: [[479, 266]], Type: "draw", spaceId: "13P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[479, 266]], Next: [[511, 281]], Type: "regular", spaceId: "14P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[511, 281]], Next: [[534, 302]], Type: "draw", spaceId: "15P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[534, 302]], Next: [[567, 328], [544, 259]], Type: "choicepoint", pathNames: ["ageOfExpansionPath, ageOfReckoningPath"] , spaceId: "16P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[567, 328]], Next: [[590, 345]], Type: "regular" , spaceId: "17P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[590, 345]], Next: [[610, 371]], Type: "regular" , spaceId: "18P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[610, 371]], Next: [[633, 400]], Type: "draw" , spaceId: "19P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[633, 400]], Next: [[648, 430]], Type: "regular", spaceId: "20P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[648, 430]], Next: [[667, 464]], Type: "draw" , spaceId: "21P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[667, 464]], Next: [[681, 492]], Type: "regular" , spaceId: "22P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[681, 492]], Next: [[701, 518]], Type: "draw" , spaceId: "23P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[701, 518]], Next: [[724, 541]], Type: "regular" , spaceId: "24P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[724, 541]], Next: [[744, 558]], Type: "regular" , spaceId: "25P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[744, 558]], Next: [[774, 599], [769, 541]], Type: "choicepoint", pathNames: ["ageOfExpansionPath, ageOfLegacyPath"] , spaceId: "26P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[774, 599]], Next: [[793, 632]], Type: "regular" , spaceId: "27P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[793, 632]], Next: [[816, 658]], Type: "regular" , spaceId: "28P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[816, 658]], Next: [[833, 685]], Type: "draw" , spaceId: "29P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[833, 685]], Next: [[859, 708]], Type: "regular" , spaceId: "30P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[859, 708]], Next: [[881, 729]], Type: "regular" , spaceId: "31P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[881, 729]], Next: [[915, 747]], Type: "regular" , spaceId: "32P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[915, 747]], Next: [[931, 756]], Type: "draw" , spaceId: "33P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[931, 756]], Next: [[962, 766]], Type: "regular" , spaceId: "34P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[962, 766]], Next: [[996, 780], [975, 738]], Type: "choicepoint", pathNames: ["ageOfExpansionPath, ageOfResistancePath"] , spaceId: "35P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[996, 780]], Next: [[1016, 789]], Type: "regular" , spaceId: "36P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[1016, 789]], Next: [[1047, 770]], Type: "draw" , spaceId: "37P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[1047, 770]], Next: [[1075, 774]], Type: "regular" , spaceId: "38P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[1075, 774]], Next: [[1107, 772]], Type: "regular" , spaceId: "39P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[1107, 772]], Next: [[1137, 770]], Type: "draw" , spaceId: "40P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[1137, 770]], Next: [[1170, 762]], Type: "regular" , spaceId: "41P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[1170, 762]], Next: [[1199, 752]], Type: "draw" , spaceId: "42P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[1199, 752]], Next: [[1221, 740]], Type: "regular" , spaceId: "43P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[1221, 740]], Next: [[1245, 720]], Type: "regular" , spaceId: "44P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[1245, 720]], Next: [[1268, 704]], Type: "regular" , spaceId: "45P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[1268, 704]], Next: [[1289, 683]], Type: "draw" , spaceId: "46P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[1289, 683]], Next: [[1308, 662]], Type: "regular" , spaceId: "47P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[1308, 662]], Next: [[1325, 633]], Type: "regular" , spaceId: "48P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[1325, 633]], Next: [[1339, 600]], Type: "draw" , spaceId: "49P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[1339, 600]], Next: [[1345, 570]], Type: "regular" , spaceId: "50P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[1345, 570]], Next: [[1384, 512]], Type: "draw" , spaceId: "51P" },
      { pathColor: "purple", pathName: "ageOfExpansionPath", coordinates: [[1384, 512]], Type: "FINISH_SPACE", spaceId: "finish" }
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
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[104, 512]], Next: [[195, 475]], Type: "start", spaceId: "start" },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[195, 475]], Next: [[222, 450]], Type: "draw" , spaceId: "1B" },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[222, 450]], Next: [[245, 424]], Type: "regular" , spaceId: "2B" },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[245, 424]], Next: [[271, 399]], Type: "draw" , spaceId: "3B" },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[271, 399]], Next: [[301, 370]], Type: "regular" , spaceId: "4B" },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[301, 370]], Next: [[334, 340]], Type: "draw" , spaceId: "5B" },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[334, 340]], Next: [[380, 317]], Type: "regular" , spaceId: "6B" },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[380, 317]], Next: [[419, 338]], Type: "regular" , spaceId: "7B" },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[419, 338]], Next: [[442, 368]], Type: "draw" , spaceId: "8B" },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[442, 368]], Next: [[457, 402]], Type: "regular" , spaceId: "9B" },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[457, 402]], Next: [[475, 443]], Type: "draw" , spaceId: "10B" },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[475, 443]], Next: [[478, 483]], Type: "draw" , spaceId: "11B" },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[478, 483]], Next: [[502, 532], [511, 457]], Type: "choicepoint", pathNames: ["ageOfResistancePath, ageOfReckoningPath"] , spaceId: "12B" },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[502, 532]], Next: [[514, 566]], Type: "regular" , spaceId: "13B" },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[514, 566]], Next: [[523, 602]], Type: "draw" , spaceId: "14B" },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[523, 602]], Next: [[533, 637]], Type: "draw" , spaceId: "15B" },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[533, 637]], Next: [[541, 675]], Type: "regular" , spaceId: "16B" },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[541, 675]], Next: [[549, 711]], Type: "regular" , spaceId: "17B" },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[549, 711]], Next: [[556, 742]], Type: "draw" , spaceId: "18B" },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[556, 742]], Next: [[563, 772]], Type: "regular", spaceId: "19B" },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[563, 772]], Next: [[572, 810], [585, 739]], Type: "choicepoint", pathNames: ["ageOfResistancePath, ageOfLegacyPath"] , spaceId: "20B" },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[572, 810]], Next: [[588, 840]], Type: "draw" , spaceId: "21B" },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[588, 840]], Next: [[606, 869]], Type: "regular" , spaceId: "22B" },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[606, 869]], Next: [[641, 895]], Type: "regular" , spaceId: "23B" },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[641, 895]], Next: [[679, 910]], Type: "regular" , spaceId: "24B" },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[679, 910]], Next: [[715, 918]], Type: "draw" , spaceId: "25B" },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[715, 918]], Next: [[752, 918]], Type: "draw" , spaceId: "26B" },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[752, 918]], Next: [[794, 897]], Type: "regular" , spaceId: "27B" },	
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[794, 897]], Next: [[829, 885]], Type: "draw" , spaceId: "28B" },	
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[829, 885]], Next: [[862, 869]], Type: "regular" , spaceId: "29B" },	
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[862, 869]], Next: [[892, 851]], Type: "regular" , spaceId: "30B" },	
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[892, 851]], Next: [[911, 829]], Type: "draw" , spaceId: "31B" },	
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[911, 829]], Next: [[929, 799]], Type: "draw" , spaceId: "32B" },	
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[929, 799]], Next: [[948, 770]], Type: "draw" , spaceId: "33B" },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[948, 770]], Next: [[975, 738], [996, 780]], Type: "choicepoint", pathNames: ["ageOfResistancePath, ageOfExpansionPath"] },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[975, 738]], Next: [[971, 705]], Type: "regular" , spaceId: "34B" },	
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[971, 705]], Next: [[973, 673]], Type: "regular" , spaceId: "35B" },	
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[973, 673]], Next: [[974, 642]], Type: "draw" , spaceId: "36B" },	
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[974, 642]], Next: [[974, 618]], Type: "regular" , spaceId: "37B" },	
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[974, 618]], Next: [[962, 578]], Type: "regular" , spaceId: "38B" },	
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[962, 578]], Next: [[959, 539]], Type: "draw" , spaceId: "39B" },	
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[959, 539]], Next: [[1019, 534]], Type: "regular" , spaceId: "40B" },	
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1019, 534]], Next: [[1045, 532], [1031, 574]], Type: "choicepoint", pathNames: ["ageOfResistancePath, ageOfReckoningPath"] },
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1045, 532]], Next: [[1065, 509]], Type:"regular", spaceId: "41B"},
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1065, 509]], Next: [[1089, 500]], Type:"regular", spaceId: "42B"},
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1089, 500]], Next: [[1078, 473]], Type:"draw", spaceId: "43B"},
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1078, 473]], Next: [[1054, 437]], Type:"regular", spaceId: "44B"},
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1054, 437]], Next: [[1050, 400]], Type:"regular", spaceId: "45B"},
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1050, 400]], Next: [[1066, 366]], Type:"draw", spaceId: "46B"},
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1066, 366]], Next: [[1096, 340]], Type:"regular", spaceId: "47B"},
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1096, 340]], Next: [[1132, 334]], Type:"draw", spaceId: "48B"},
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1132, 334]], Next: [[1173, 349]], Type:"regular", spaceId: "49B"},
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1173, 349]], Next: [[1201, 375]], Type:"draw", spaceId: "50B"},
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1201, 375]], Next: [[1222, 405]], Type:"regular", spaceId: "51B"},
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1222, 405]], Next: [[1247, 432]], Type:"draw", spaceId: "52B"},
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1247, 432]], Next: [[1268, 449]], Type:"regular", spaceId: "53B"},
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1268, 449]], Next: [[1297, 472]], Type:"regular", spaceId: "54B"},
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1297, 472]], Next: [[1319, 490]], Type:"draw", spaceId: "55B"},
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1319, 490]], Next: [[1384, 512]], Type:"regular", spaceId: "56B"},
      { pathColor: "blue", pathName: "ageOfResistancePath", coordinates: [[1384, 512]], Type:"FINISH_SPACE", spaceId: "finish"},
// NOTE: Last space should implicitly lead to FINISH based on coordinates
]
};

export const ageOfReckoningPath = {
    color: 'cyan',
    name: 'Age of Reckoning',
    startCoord: [104, 512],
    endCoord: FINISH_SPACE.coordinates,
    segments: [
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[104, 512]], Next: [[186, 528]], Type:"start", spaceId: "start" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[186, 528]], Next: [[206, 538]], Type:"regular", spaceId: "1C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[206, 538]], Next: [[228, 565]], Type:"draw", spaceId: "2C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[228, 565]], Next: [[247, 590]], Type:"regular", spaceId: "3C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[247, 590]], Next: [[266, 611]], Type:"draw", spaceId: "4C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[266, 611]], Next: [[294, 636]], Type:"regular", spaceId: "5C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[294, 636]], Next: [[317, 641]], Type:"regular", spaceId: "6C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[317, 641]], Next: [[348, 646]], Type:"draw", spaceId: "7C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[348, 646]], Next: [[377, 647]], Type:"regular", spaceId: "8C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[377, 647]], Next: [[400, 649]], Type:"draw", spaceId: "9C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[400, 649]], Next: [[419, 641]], Type:"draw", spaceId: "10C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[419, 641]], Next: [[425, 632]], Type:"regular", spaceId: "11C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[425, 632]], Next: [[427, 612]], Type:"draw", spaceId: "12C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[427, 612]], Next: [[420, 584]], Type:"regular", spaceId: "13C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[420, 584]], Next: [[409, 553]], Type:"regular", spaceId: "14C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[409, 553]], Next: [[406, 514]], Type:"draw", spaceId: "15C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[406, 514]], Next: [[438, 488]], Type:"regular", spaceId: "16C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[438, 488]], Next: [[482, 480]], Type:"draw", spaceId: "17C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[482, 480]], Next: [[511, 457], [502, 532]], Type: "choicepoint", pathNames: ["ageOfReckoningPath, ageOfResistancePath"] , spaceId: "18C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[511, 457]], Next: [[506, 439]], Type:"regular", spaceId: "19C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[506, 439]], Next: [[497, 415]], Type: "draw", spaceId: "20C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[497, 415]], Next: [[490, 384]], Type:"regular", spaceId: "21C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[490, 384]], Next: [[498, 345]], Type:"regular", spaceId: "22C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[498, 345]], Next: [[528, 299]], Type: "draw", spaceId: "23C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[528, 299]], Next: [[544, 259], [567, 328]], Type: "choicepoint", pathNames: ["ageOfReckoningPath, ageOfExpansionPath"] , spaceId: "24C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[544, 259]], Next: [[576, 223]], Type:"regular", spaceId: "25C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[576, 223]], Next: [[602, 207]], Type:"draw", spaceId: "26C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[602, 207]], Next: [[633, 191]], Type:"regular", spaceId: "27C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[633, 191]], Next: [[665, 180]], Type:"draw", spaceId: "28C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[665, 180]], Next: [[698, 171]], Type:"regular", spaceId: "29C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[698, 171]], Next: [[735, 168]], Type:"regular", spaceId: "30C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[735, 168]], Next: [[767, 168]], Type:"draw", spaceId: "31C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[767, 168]], Next: [[803, 171]], Type:"regular", spaceId: "32C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[803, 171]], Next: [[835, 176]], Type:"regular", spaceId: "33C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[835, 176]], Next: [[865, 188]], Type:"draw", spaceId: "34C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[865, 188]], Next: [[898, 206]], Type:"draw", spaceId: "35C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[898, 206]], Next: [[930, 231]], Type:"regular", spaceId: "36C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[930, 231]], Next: [[950, 254]], Type:"regular", spaceId: "37C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[950, 254]], Next: [[971, 294]], Type:"draw", spaceId: "38C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[971, 294]], Next: [[973, 340], [973, 269]], Type: "choicepoint", pathNames: ["ageOfReckoningPath, ageOfLegacyPath"] , spaceId: "39C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[973, 340]], Next: [[980, 378]], Type: "regular", spaceId: "40C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[980, 378]], Next: [[985, 415]], Type: "regular", spaceId: "41C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[985, 415]], Next: [[989, 446]], Type: "draw", spaceId: "42C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[989, 446]], Next: [[994, 477]], Type: "regular", spaceId: "43C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[994, 477]], Next: [[1003, 522]], Type: "regular", spaceId: "44C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[1003, 522]], Next: [[1031, 574], [1045, 532]], Type: "choicepoint", pathNames: ["ageOfReckoningPath, ageOfResistancePath"] , spaceId: "45C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[1031, 574]], Next: [[1055, 591]], Type: "draw", spaceId: "46C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[1055, 591]], Next: [[1076, 613]], Type: "regular", spaceId: "47C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[1076, 613]], Next: [[1098, 628]], Type: "regular", spaceId: "48C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[1098, 628]], Next: [[1128, 633]], Type: "draw", spaceId: "49C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[1128, 633]], Next: [[1154, 635]], Type: "regular", spaceId: "50C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[1154, 635]], Next: [[1180, 633]], Type: "draw", spaceId: "51C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[1180, 633]], Next: [[1213, 619]], Type: "regular", spaceId: "52C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[1213, 619]], Next: [[1238, 603]], Type: "draw", spaceId: "53C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[1238, 603]], Next: [[1263, 576]], Type: "regular", spaceId: "54C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[1263, 576]], Next: [[1290, 556]], Type: "regular", spaceId: "55C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[1290, 556]], Next: [[1310, 540]], Type: "draw", spaceId: "56C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[1310, 540]], Next: [[1384, 512]], Type: "regular", spaceId: "57C" },
      { pathColor: "cyan", pathName: "ageOfReckoningPath", coordinates: [[1384, 512]], Type: "FINISH_SPACE", spaceId: "finish_space" },
// NOTE: Last space should implicitly lead to FINISH based on coordinates
]
};

export const ageOfLegacyPath = {
    color: 'pink',
    name: 'Age of Legacy',
    startCoord: [104, 512],
    endCoord: FINISH_SPACE.coordinates,
    segments: [
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[104, 512]], Next: [[157, 545]], Type: "start", spaceId: "start" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[157, 545]], Next: [[155, 583]], Type: "regular", spaceId: "1PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[155, 583]], Next: [[162, 611]], Type: "draw", spaceId: "2PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[162, 611]], Next: [[173, 641]], Type: "regular", spaceId: "3PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[173, 641]], Next: [[186, 673]], Type: "draw", spaceId: "4PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[186, 673]], Next: [[218, 698]], Type: "regular", spaceId: "5PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[218, 698]], Next: [[240, 729]], Type: "draw", spaceId: "6PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[240, 729]], Next: [[263, 748]], Type: "regular", spaceId: "7PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[263, 748]], Next: [[286, 765]], Type: "regular", spaceId: "8PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[286, 765]], Next: [[316, 771]], Type: "draw", spaceId: "9PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[316, 771]], Next: [[347, 775]], Type: "regular", spaceId: "10PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[347, 775]], Next: [[379, 777]], Type: "draw", spaceId: "11PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[379, 777]], Next: [[414, 779]], Type: "regular", spaceId: "12PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[414, 779]], Next: [[449, 775]], Type: "regular", spaceId: "13PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[449, 775]], Next: [[483, 769]], Type: "draw", spaceId: "14PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[483, 769]], Next: [[513, 760]], Type: "regular", spaceId: "15PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[513, 760]], Next: [[559, 760]], Type: "draw", spaceId: "16PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[559, 760]], Next: [[585, 739], [572, 810]], Type: "choicepoint", pathNames: ["ageOfLegacyPath, ageOfResistancePath"] , spaceId: "17PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[585, 739]], Next: [[604, 718]], Type: "draw", spaceId: "18PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[604, 718]], Next: [[625, 697]], Type: "draw", spaceId: "19PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[625, 697]], Next: [[647, 677]], Type: "regular", spaceId: "20PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[647, 677]], Next: [[667, 651]], Type: "draw", spaceId: "21PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[667, 651]], Next: [[689, 622]], Type: "regular", spaceId: "22PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[689, 622]], Next: [[704, 594]], Type: "regular", spaceId: "23PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[704, 594]], Next: [[731, 573]], Type: "draw", spaceId: "24PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[731, 573]], Next: [[769, 541], [774, 599]], Type: "choicepoint", pathNames: ["ageOfLegacyPath, ageOfExpansionPath"] , spaceId: "25PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[769, 541]], Next: [[766, 491]], Type: "draw" , spaceId: "26PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[766, 491]], Next: [[795, 462]], Type: "regular" , spaceId: "27PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[795, 462]], Next: [[815, 440]], Type: "draw" , spaceId: "28PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[815, 440]], Next: [[829, 415]], Type: "regular" , spaceId: "29PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[829, 415]], Next: [[851, 379]], Type: "draw" , spaceId: "30PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[851, 379]], Next: [[872, 353]], Type: "regular" , spaceId: "31PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[872, 353]], Next: [[893, 332]], Type: "regular" , spaceId: "32PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[893, 332]], Next: [[916, 310]], Type: "draw" , spaceId: "33PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[916, 310]], Next: [[953, 295]], Type: "regular" , spaceId: "34PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[953, 295]], Next: [[973, 269], [973, 340]], Type: "choicepoint", pathNames: ["ageOfLegacyPath, ageOfReckoningPath"] , spaceId: "35PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[973, 269]], Next: [[1011, 261]], Type: "regular" , spaceId: "36PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[1011, 261]], Next: [[1049, 253]], Type: "regular" , spaceId: "37PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[1049, 253]], Next: [[1075, 248]], Type: "regular" , spaceId: "38PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[1075, 248]], Next: [[1117, 250]], Type: "draw" , spaceId: "39PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[1117, 250]], Next: [[1147, 249]], Type: "regular" , spaceId: "40PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[1147, 249]], Next: [[1180, 258]], Type: "draw" , spaceId: "41PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[1180, 258]], Next: [[1209, 270]], Type: "regular" , spaceId: "42PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[1209, 270]], Next: [[1237, 282]], Type: "regular" , spaceId: "43PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[1237, 282]], Next: [[1263, 304]], Type: "draw" , spaceId: "44PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[1263, 304]], Next: [[1276, 351]], Type: "regular" , spaceId: "45PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[1276, 351]], Next: [[1298, 376]], Type: "regular" , spaceId: "46PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[1298, 376]], Next: [[1308, 406]], Type: "regular" , spaceId: "47PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[1308, 406]], Next: [[1315, 430]], Type: "draw" , spaceId: "48PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[1315, 430]], Next: [[1337, 459]], Type: "regular" , spaceId: "49PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[1337, 459]], Next: [[1384, 512]], Type: "regular" , spaceId: "50PK" },
      { pathColor: "pink", pathName: "ageOfLegacyPath", coordinates: [[1384, 512]], Type: "FINISH_SPACE" , spaceId: "finish" },
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






