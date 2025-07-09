export const competitionLevels = {
    showjumping: {
        intro: {
            maxHeight: 0.6,
            minHeight: 0.4,
            maxJumps: 10,
            description: "Beginner level (0.4-0.6m)",
            value: 'intro',
        },
        novice: {
            maxHeight: 0.9,
            minHeight: 0.7,
            maxJumps: 12,
            description: "Basic competition (0.7-0.9m)",
            value: 'novice',
        },
        elementary: {
            maxHeight: 1.0,
            minHeight: 0.8,
            maxJumps: 12,
            description: "Intermediate (0.8-1.0m)",
            value: 'elementary',
        },
        medium: {
            maxHeight: 1.15,
            minHeight: 0.95,
            maxJumps: 14,
            description: "Advanced amateur (0.95-1.15m)",
            value: 'medium',
        },
        advanced: {
            maxHeight: 1.35,
            minHeight: 1.05,
            maxJumps: 15,
            description: "Advanced (1.05-1.35m)",
            value: 'advanced',
        },
        grand_prix: {
            maxHeight: 1.6,
            minHeight: 1.4,
            maxJumps: 16,
            description: "Professional (1.4-1.6m)",
            value: 'grand_prix',
        },
    },

    eventing: {
        "1star": {
            maxHeight: 1.05,
            minHeight: 0.9,
            maxJumps: 25,
            description: "International 1-star (0.9-1.05m)",
        },
        "2star": {
            maxHeight: 1.15,
            minHeight: 1.0,
            maxJumps: 30,
            description: "International 2-star (1.0-1.15m)",
        },
        "3star": {
            maxHeight: 1.25,
            minHeight: 1.1,
            maxJumps: 35,
            description: "International 3-star (1.1-1.25m)",
        },
        "4star": {
            maxHeight: 1.25,
            minHeight: 1.15,
            maxJumps: 40,
            description: "International 4-star (1.15-1.25m)",
        },
        "5star": {
            maxHeight: 1.25,
            minHeight: 1.2,
            maxJumps: 45,
            description: "Olympic level (1.2-1.25m)",
        },
    },

    ponyclub: {
        lead_rein: {
            maxHeight: 0.3,
            minHeight: 0.2,
            maxJumps: 6,
            description: "Tiny tots (0.2-0.3m)",
        },
        first_rung: {
            maxHeight: 0.4,
            minHeight: 0.3,
            maxJumps: 8,
            description: "Beginner riders (0.3-0.4m)",
        },
        minimus: {
            maxHeight: 0.5,
            minHeight: 0.4,
            maxJumps: 8,
            description: "Young riders (0.4-0.5m)",
        },
        novice_pc: {
            maxHeight: 0.7,
            minHeight: 0.5,
            maxJumps: 10,
            description: "Developing riders (0.5-0.7m)",
        },
        intermediate_pc: {
            maxHeight: 0.9,
            minHeight: 0.7,
            maxJumps: 12,
            description: "Competent riders (0.7-0.9m)",
        },
    },
};

// Jump types with properties
//   prettier-ignore
export const jumpTypes = [
    { id: 'vertical', name: 'Vertical', color: '#8B4513', width: 4, spread: 0, technicality: 0, difficulty: 1 },
    { id: 'oxer', name: 'Oxer', color: '#CD853F', width: 4, spread: 1.5, technicality: 1, difficulty: 2 },
    { id: 'triple', name: 'Triple Bar', color: '#DEB887', width: 6, spread: 2.0, technicality: 2, difficulty: 3 },
    { id: 'water', name: 'Water Jump', color: '#4169E1', width: 4, spread: 3.0, technicality: 1, difficulty: 4 },
    { id: 'liverpool', name: 'Liverpool', color: '#2E8B57', width: 4, spread: 2.0, technicality: 2, difficulty: 3 },
    { id: 'wall', name: 'Wall', color: '#696969', width: 4, spread: 0, technicality: 0, difficulty: 1 }
];


