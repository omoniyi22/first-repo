// Complete array of countries, governing bodies, and all their levels
// Based on the international dressage systems document

const DRESSAGE_COUNTRIES_DATA = [
    {
        country: "United Kingdom",
        flag: "🇬🇧",
        governingBody: {
            name: "British Dressage",
            abbreviation: "BD"
        },
        levels: [
            // Introductory (3 tests)
            { name: "Intro A", category: "Introductory", difficulty: 1, arenaSize: "20x40" },
            { name: "Intro B", category: "Introductory", difficulty: 1, arenaSize: "20x40" },
            { name: "Intro C", category: "Introductory", difficulty: 1, arenaSize: "20x40" },

            // Preliminary (19 tests)
            { name: "Prelim 1", category: "Preliminary", difficulty: 2, arenaSize: "20x40" },
            { name: "Prelim 2", category: "Preliminary", difficulty: 2, arenaSize: "20x40" },
            { name: "Prelim 3", category: "Preliminary", difficulty: 2, arenaSize: "20x40" },
            { name: "Prelim 4", category: "Preliminary", difficulty: 2, arenaSize: "20x40" },
            { name: "Prelim 5", category: "Preliminary", difficulty: 2, arenaSize: "20x40" },
            { name: "Prelim 6", category: "Preliminary", difficulty: 2, arenaSize: "20x40" },
            { name: "Prelim 7", category: "Preliminary", difficulty: 2, arenaSize: "20x40" },
            { name: "Prelim 8", category: "Preliminary", difficulty: 2, arenaSize: "20x40" },
            { name: "Prelim 9", category: "Preliminary", difficulty: 2, arenaSize: "20x40" },
            { name: "Prelim 10", category: "Preliminary", difficulty: 2, arenaSize: "20x40" },
            { name: "Prelim 11", category: "Preliminary", difficulty: 2, arenaSize: "20x40" },
            { name: "Prelim 12", category: "Preliminary", difficulty: 2, arenaSize: "20x40" },
            { name: "Prelim 13", category: "Preliminary", difficulty: 2, arenaSize: "20x40" },
            { name: "Prelim 14", category: "Preliminary", difficulty: 2, arenaSize: "20x40" },
            { name: "Prelim 15", category: "Preliminary", difficulty: 2, arenaSize: "20x40" },
            { name: "Prelim 16", category: "Preliminary", difficulty: 2, arenaSize: "20x40" },
            { name: "Prelim 17", category: "Preliminary", difficulty: 2, arenaSize: "20x40" },
            { name: "Prelim 18", category: "Preliminary", difficulty: 2, arenaSize: "20x40" },
            { name: "Prelim 19", category: "Preliminary", difficulty: 2, arenaSize: "20x40" },

            // Novice (19 tests)
            { name: "Novice 21", category: "Novice", difficulty: 3, arenaSize: "20x40" },
            { name: "Novice 22", category: "Novice", difficulty: 3, arenaSize: "20x40" },
            { name: "Novice 23", category: "Novice", difficulty: 3, arenaSize: "20x40" },
            { name: "Novice 24", category: "Novice", difficulty: 3, arenaSize: "20x40" },
            { name: "Novice 25", category: "Novice", difficulty: 3, arenaSize: "20x40" },
            { name: "Novice 26", category: "Novice", difficulty: 3, arenaSize: "20x40" },
            { name: "Novice 27", category: "Novice", difficulty: 3, arenaSize: "20x40" },
            { name: "Novice 28", category: "Novice", difficulty: 3, arenaSize: "20x40" },
            { name: "Novice 29", category: "Novice", difficulty: 3, arenaSize: "20x40" },
            { name: "Novice 30", category: "Novice", difficulty: 3, arenaSize: "20x40" },
            { name: "Novice 31", category: "Novice", difficulty: 3, arenaSize: "20x40" },
            { name: "Novice 32", category: "Novice", difficulty: 3, arenaSize: "20x40" },
            { name: "Novice 33", category: "Novice", difficulty: 3, arenaSize: "20x40" },
            { name: "Novice 34", category: "Novice", difficulty: 3, arenaSize: "20x40" },
            { name: "Novice 35", category: "Novice", difficulty: 3, arenaSize: "20x40" },
            { name: "Novice 36", category: "Novice", difficulty: 3, arenaSize: "20x40" },
            { name: "Novice 37", category: "Novice", difficulty: 3, arenaSize: "20x40" },
            { name: "Novice 38", category: "Novice", difficulty: 3, arenaSize: "20x40" },
            { name: "Novice 39", category: "Novice", difficulty: 3, arenaSize: "20x40" },

            // Elementary (10 tests)
            { name: "Elementary 40", category: "Elementary", difficulty: 4, arenaSize: "20x60" },
            { name: "Elementary 41", category: "Elementary", difficulty: 4, arenaSize: "20x60" },
            { name: "Elementary 42", category: "Elementary", difficulty: 4, arenaSize: "20x60" },
            { name: "Elementary 43", category: "Elementary", difficulty: 4, arenaSize: "20x60" },
            { name: "Elementary 44", category: "Elementary", difficulty: 4, arenaSize: "20x60" },
            { name: "Elementary 45", category: "Elementary", difficulty: 4, arenaSize: "20x60" },
            { name: "Elementary 46", category: "Elementary", difficulty: 4, arenaSize: "20x60" },
            { name: "Elementary 47", category: "Elementary", difficulty: 4, arenaSize: "20x60" },
            { name: "Elementary 48", category: "Elementary", difficulty: 4, arenaSize: "20x60" },
            { name: "Elementary 49", category: "Elementary", difficulty: 4, arenaSize: "20x60" },

            // Medium (10 tests)
            { name: "Medium 50", category: "Medium", difficulty: 6, arenaSize: "20x60" },
            { name: "Medium 51", category: "Medium", difficulty: 6, arenaSize: "20x60" },
            { name: "Medium 52", category: "Medium", difficulty: 6, arenaSize: "20x60" },
            { name: "Medium 53", category: "Medium", difficulty: 6, arenaSize: "20x60" },
            { name: "Medium 54", category: "Medium", difficulty: 6, arenaSize: "20x60" },
            { name: "Medium 55", category: "Medium", difficulty: 6, arenaSize: "20x60" },
            { name: "Medium 56", category: "Medium", difficulty: 6, arenaSize: "20x60" },
            { name: "Medium 57", category: "Medium", difficulty: 6, arenaSize: "20x60" },
            { name: "Medium 58", category: "Medium", difficulty: 6, arenaSize: "20x60" },
            { name: "Medium 59", category: "Medium", difficulty: 6, arenaSize: "20x60" },

            // Advanced Medium (10 tests)
            { name: "Advanced Medium 60", category: "Advanced Medium", difficulty: 8, arenaSize: "20x60" },
            { name: "Advanced Medium 61", category: "Advanced Medium", difficulty: 8, arenaSize: "20x60" },
            { name: "Advanced Medium 62", category: "Advanced Medium", difficulty: 8, arenaSize: "20x60" },
            { name: "Advanced Medium 63", category: "Advanced Medium", difficulty: 8, arenaSize: "20x60" },
            { name: "Advanced Medium 64", category: "Advanced Medium", difficulty: 8, arenaSize: "20x60" },
            { name: "Advanced Medium 65", category: "Advanced Medium", difficulty: 8, arenaSize: "20x60" },
            { name: "Advanced Medium 66", category: "Advanced Medium", difficulty: 8, arenaSize: "20x60" },
            { name: "Advanced Medium 67", category: "Advanced Medium", difficulty: 8, arenaSize: "20x60" },
            { name: "Advanced Medium 68", category: "Advanced Medium", difficulty: 8, arenaSize: "20x60" },
            { name: "Advanced Medium 69", category: "Advanced Medium", difficulty: 8, arenaSize: "20x60" },

            // Advanced (10 tests)
            { name: "Advanced 70", category: "Advanced", difficulty: 8, arenaSize: "20x60" },
            { name: "Advanced 71", category: "Advanced", difficulty: 8, arenaSize: "20x60" },
            { name: "Advanced 72", category: "Advanced", difficulty: 8, arenaSize: "20x60" },
            { name: "Advanced 73", category: "Advanced", difficulty: 8, arenaSize: "20x60" },
            { name: "Advanced 74", category: "Advanced", difficulty: 8, arenaSize: "20x60" },
            { name: "Advanced 75", category: "Advanced", difficulty: 8, arenaSize: "20x60" },
            { name: "Advanced 76", category: "Advanced", difficulty: 8, arenaSize: "20x60" },
            { name: "Advanced 77", category: "Advanced", difficulty: 8, arenaSize: "20x60" },
            { name: "Advanced 78", category: "Advanced", difficulty: 8, arenaSize: "20x60" },
            { name: "Advanced 79", category: "Advanced", difficulty: 8, arenaSize: "20x60" }
        ]
    },

    {
        country: "United States",
        flag: "🇺🇸",
        governingBody: {
            name: "United States Dressage Federation",
            abbreviation: "USDF"
        },
        levels: [
            // Introductory (3 tests)
            { name: "Intro Test A", category: "Introductory", difficulty: 1, arenaSize: "20x40" },
            { name: "Intro Test B", category: "Introductory", difficulty: 1, arenaSize: "20x40" },
            { name: "Intro Test C", category: "Introductory", difficulty: 1, arenaSize: "20x40" },

            // Training Level (3 tests)
            { name: "Training Level Test 1", category: "Training Level", difficulty: 3, arenaSize: "20x40" },
            { name: "Training Level Test 2", category: "Training Level", difficulty: 3, arenaSize: "20x40" },
            { name: "Training Level Test 3", category: "Training Level", difficulty: 3, arenaSize: "20x40" },

            // First Level (3 tests)
            { name: "First Level Test 1", category: "First Level", difficulty: 4, arenaSize: "20x60" },
            { name: "First Level Test 2", category: "First Level", difficulty: 4, arenaSize: "20x60" },
            { name: "First Level Test 3", category: "First Level", difficulty: 4, arenaSize: "20x60" },

            // Second Level (3 tests)
            { name: "Second Level Test 1", category: "Second Level", difficulty: 5, arenaSize: "20x60" },
            { name: "Second Level Test 2", category: "Second Level", difficulty: 5, arenaSize: "20x60" },
            { name: "Second Level Test 3", category: "Second Level", difficulty: 5, arenaSize: "20x60" },

            // Third Level (3 tests)
            { name: "Third Level Test 1", category: "Third Level", difficulty: 7, arenaSize: "20x60" },
            { name: "Third Level Test 2", category: "Third Level", difficulty: 7, arenaSize: "20x60" },
            { name: "Third Level Test 3", category: "Third Level", difficulty: 7, arenaSize: "20x60" },

            // Fourth Level (3 tests)
            { name: "Fourth Level Test 1", category: "Fourth Level", difficulty: 8, arenaSize: "20x60" },
            { name: "Fourth Level Test 2", category: "Fourth Level", difficulty: 8, arenaSize: "20x60" },
            { name: "Fourth Level Test 3", category: "Fourth Level", difficulty: 8, arenaSize: "20x60" }
        ]
    },

    {
        country: "Germany",
        flag: "🇩🇪",
        governingBody: {
            name: "Deutsche Reiterliche Vereinigung",
            abbreviation: "FN"
        },
        levels: [
            // Class E - Eingangsstufe (9 tests)
            { name: "E1", category: "Class E", difficulty: 1, arenaSize: "20x40" },
            { name: "E2", category: "Class E", difficulty: 1, arenaSize: "20x40" },
            { name: "E3", category: "Class E", difficulty: 1, arenaSize: "20x40" },
            { name: "E4", category: "Class E", difficulty: 2, arenaSize: "20x40" },
            { name: "E5", category: "Class E", difficulty: 2, arenaSize: "20x40" },
            { name: "E6", category: "Class E", difficulty: 2, arenaSize: "20x40" },
            { name: "E7", category: "Class E", difficulty: 2, arenaSize: "20x40" },
            { name: "E8", category: "Class E", difficulty: 2, arenaSize: "20x40" },
            { name: "E9", category: "Class E", difficulty: 2, arenaSize: "20x40" },

            // Class A - Anfänger (9 tests)
            { name: "A1", category: "Class A", difficulty: 3, arenaSize: "20x40" },
            { name: "A2", category: "Class A", difficulty: 3, arenaSize: "20x40" },
            { name: "A3", category: "Class A", difficulty: 3, arenaSize: "20x40" },
            { name: "A4", category: "Class A", difficulty: 3, arenaSize: "20x40" },
            { name: "A5", category: "Class A", difficulty: 3, arenaSize: "20x40" },
            { name: "A6", category: "Class A", difficulty: 3, arenaSize: "20x40" },
            { name: "A7", category: "Class A", difficulty: 3, arenaSize: "20x40" },
            { name: "A8", category: "Class A", difficulty: 3, arenaSize: "20x40" },
            { name: "A9", category: "Class A", difficulty: 3, arenaSize: "20x40" },

            // Class L - Leicht (9 tests)
            { name: "L1", category: "Class L", difficulty: 4, arenaSize: "20x60" },
            { name: "L2", category: "Class L", difficulty: 4, arenaSize: "20x60" },
            { name: "L3", category: "Class L", difficulty: 4, arenaSize: "20x60" },
            { name: "L4", category: "Class L", difficulty: 5, arenaSize: "20x60" },
            { name: "L5", category: "Class L", difficulty: 5, arenaSize: "20x60" },
            { name: "L6", category: "Class L", difficulty: 5, arenaSize: "20x60" },
            { name: "L7", category: "Class L", difficulty: 5, arenaSize: "20x60" },
            { name: "L8", category: "Class L", difficulty: 5, arenaSize: "20x60" },
            { name: "L9", category: "Class L", difficulty: 5, arenaSize: "20x60" },

            // Class M - Mittel (9 tests)
            { name: "M1", category: "Class M", difficulty: 6, arenaSize: "20x60" },
            { name: "M2", category: "Class M", difficulty: 6, arenaSize: "20x60" },
            { name: "M3", category: "Class M", difficulty: 6, arenaSize: "20x60" },
            { name: "M4", category: "Class M", difficulty: 7, arenaSize: "20x60" },
            { name: "M5", category: "Class M", difficulty: 7, arenaSize: "20x60" },
            { name: "M6", category: "Class M", difficulty: 7, arenaSize: "20x60" },
            { name: "M7", category: "Class M", difficulty: 8, arenaSize: "20x60" },
            { name: "M8", category: "Class M", difficulty: 8, arenaSize: "20x60" },
            { name: "M9", category: "Class M", difficulty: 8, arenaSize: "20x60" },

            // Class S - Schwer (9 tests)
            { name: "S1", category: "Class S", difficulty: 9, arenaSize: "20x60" },
            { name: "S2", category: "Class S", difficulty: 9, arenaSize: "20x60" },
            { name: "S3", category: "Class S", difficulty: 9, arenaSize: "20x60" },
            { name: "S4", category: "Class S", difficulty: 9, arenaSize: "20x60" },
            { name: "S5", category: "Class S", difficulty: 9, arenaSize: "20x60" },
            { name: "S6", category: "Class S", difficulty: 9, arenaSize: "20x60" },
            { name: "S7", category: "Class S", difficulty: 9, arenaSize: "20x60" },
            { name: "S8", category: "Class S", difficulty: 9, arenaSize: "20x60" },
            { name: "S9", category: "Class S", difficulty: 9, arenaSize: "20x60" }
        ]
    },

    {
        country: "Australia",
        flag: "🇦🇺",
        governingBody: {
            name: "Equestrian Australia",
            abbreviation: "EA"
        },
        levels: [
            // Preparatory (3 tests)
            { name: "Prep A", category: "Preparatory", difficulty: 1, arenaSize: "20x40" },
            { name: "Prep B", category: "Preparatory", difficulty: 1, arenaSize: "20x40" },
            { name: "Prep C", category: "Preparatory", difficulty: 1, arenaSize: "20x40" },

            // Preliminary (8 tests)
            { name: "Preliminary 1.1", category: "Preliminary", difficulty: 3, arenaSize: "20x40" },
            { name: "Preliminary 1.2", category: "Preliminary", difficulty: 3, arenaSize: "20x40" },
            { name: "Preliminary 1.3", category: "Preliminary", difficulty: 3, arenaSize: "20x40" },
            { name: "Preliminary 1.4", category: "Preliminary", difficulty: 3, arenaSize: "20x40" },
            { name: "Preliminary 1.5", category: "Preliminary", difficulty: 3, arenaSize: "20x40" },
            { name: "Preliminary 1.6", category: "Preliminary", difficulty: 3, arenaSize: "20x40" },
            { name: "Preliminary 1.7", category: "Preliminary", difficulty: 3, arenaSize: "20x40" },
            { name: "Preliminary 1.8", category: "Preliminary", difficulty: 3, arenaSize: "20x40" },

            // Novice (8 tests)
            { name: "Novice 2.1", category: "Novice", difficulty: 4, arenaSize: "20x40" },
            { name: "Novice 2.2", category: "Novice", difficulty: 4, arenaSize: "20x40" },
            { name: "Novice 2.3", category: "Novice", difficulty: 4, arenaSize: "20x40" },
            { name: "Novice 2.4", category: "Novice", difficulty: 4, arenaSize: "20x40" },
            { name: "Novice 2.5", category: "Novice", difficulty: 4, arenaSize: "20x40" },
            { name: "Novice 2.6", category: "Novice", difficulty: 4, arenaSize: "20x40" },
            { name: "Novice 2.7", category: "Novice", difficulty: 4, arenaSize: "20x40" },
            { name: "Novice 2.8", category: "Novice", difficulty: 4, arenaSize: "20x40" },

            // Elementary (8 tests)
            { name: "Elementary 3.1", category: "Elementary", difficulty: 5, arenaSize: "20x60" },
            { name: "Elementary 3.2", category: "Elementary", difficulty: 5, arenaSize: "20x60" },
            { name: "Elementary 3.3", category: "Elementary", difficulty: 5, arenaSize: "20x60" },
            { name: "Elementary 3.4", category: "Elementary", difficulty: 5, arenaSize: "20x60" },
            { name: "Elementary 3.5", category: "Elementary", difficulty: 5, arenaSize: "20x60" },
            { name: "Elementary 3.6", category: "Elementary", difficulty: 5, arenaSize: "20x60" },
            { name: "Elementary 3.7", category: "Elementary", difficulty: 5, arenaSize: "20x60" },
            { name: "Elementary 3.8", category: "Elementary", difficulty: 5, arenaSize: "20x60" },

            // Medium (8 tests)
            { name: "Medium 4.1", category: "Medium", difficulty: 7, arenaSize: "20x60" },
            { name: "Medium 4.2", category: "Medium", difficulty: 7, arenaSize: "20x60" },
            { name: "Medium 4.3", category: "Medium", difficulty: 7, arenaSize: "20x60" },
            { name: "Medium 4.4", category: "Medium", difficulty: 7, arenaSize: "20x60" },
            { name: "Medium 4.5", category: "Medium", difficulty: 7, arenaSize: "20x60" },
            { name: "Medium 4.6", category: "Medium", difficulty: 7, arenaSize: "20x60" },
            { name: "Medium 4.7", category: "Medium", difficulty: 7, arenaSize: "20x60" },
            { name: "Medium 4.8", category: "Medium", difficulty: 7, arenaSize: "20x60" },

            // Advanced (8 tests)
            { name: "Advanced 5.1", category: "Advanced", difficulty: 8, arenaSize: "20x60" },
            { name: "Advanced 5.2", category: "Advanced", difficulty: 8, arenaSize: "20x60" },
            { name: "Advanced 5.3", category: "Advanced", difficulty: 8, arenaSize: "20x60" },
            { name: "Advanced 5.4", category: "Advanced", difficulty: 8, arenaSize: "20x60" },
            { name: "Advanced 5.5", category: "Advanced", difficulty: 8, arenaSize: "20x60" },
            { name: "Advanced 5.6", category: "Advanced", difficulty: 8, arenaSize: "20x60" },
            { name: "Advanced 5.7", category: "Advanced", difficulty: 8, arenaSize: "20x60" },
            { name: "Advanced 5.8", category: "Advanced", difficulty: 8, arenaSize: "20x60" }
        ]
    },

    {
        country: "Spain",
        flag: "🇪🇸",
        governingBody: {
            name: "Real Federación Hípica Española",
            abbreviation: "RFHE"
        },
        levels: [
            { name: "Iniciación", category: "Iniciación", difficulty: 1, arenaSize: "20x40" },
            { name: "Promoción", category: "Promoción", difficulty: 3, arenaSize: "20x40" },
            { name: "Básico", category: "Básico", difficulty: 4, arenaSize: "20x60" },
            { name: "Medio", category: "Medio", difficulty: 7, arenaSize: "20x60" },
            { name: "Avanzado", category: "Avanzado", difficulty: 8, arenaSize: "20x60" }
        ]
    },

    {
        country: "France",
        flag: "🇫🇷",
        governingBody: {
            name: "Fédération Française d'Équitation",
            abbreviation: "FFE"
        },
        levels: [
            // Club Levels
            { name: "Club 4", category: "Club", difficulty: 1, arenaSize: "20x40" },
            { name: "Club 3", category: "Club", difficulty: 2, arenaSize: "20x40" },
            { name: "Club 2", category: "Club", difficulty: 3, arenaSize: "20x40" },
            { name: "Club 1", category: "Club", difficulty: 3, arenaSize: "20x40" },

            // Ponam Levels
            { name: "Ponam 4", category: "Ponam", difficulty: 4, arenaSize: "20x60" },
            { name: "Ponam 3", category: "Ponam", difficulty: 4, arenaSize: "20x60" },
            { name: "Ponam 2", category: "Ponam", difficulty: 5, arenaSize: "20x60" },
            { name: "Ponam 1", category: "Ponam", difficulty: 5, arenaSize: "20x60" },

            // Amateur Levels
            { name: "Amateur 4", category: "Amateur", difficulty: 6, arenaSize: "20x60" },
            { name: "Amateur 3", category: "Amateur", difficulty: 6, arenaSize: "20x60" },
            { name: "Amateur 2", category: "Amateur", difficulty: 7, arenaSize: "20x60" },
            { name: "Amateur 1", category: "Amateur", difficulty: 8, arenaSize: "20x60" },

            // Pro Levels
            { name: "Pro 4", category: "Pro", difficulty: 8, arenaSize: "20x60" },
            { name: "Pro 3", category: "Pro", difficulty: 9, arenaSize: "20x60" },
            { name: "Pro 2", category: "Pro", difficulty: 9, arenaSize: "20x60" },
            { name: "Pro 1", category: "Pro", difficulty: 9, arenaSize: "20x60" }
        ]
    },

    {
        country: "Netherlands",
        flag: "🇳🇱",
        governingBody: {
            name: "Koninklijke Nederlandse Hippische Sportfederatie",
            abbreviation: "KNHS"
        },
        levels: [
            // Basic Levels
            { name: "B", category: "Basic", difficulty: 1, arenaSize: "20x40" },
            { name: "L1", category: "Light", difficulty: 3, arenaSize: "20x40" },
            { name: "L2", category: "Light", difficulty: 4, arenaSize: "20x60" },
            { name: "M1", category: "Medium", difficulty: 5, arenaSize: "20x60" },
            { name: "M2", category: "Medium", difficulty: 6, arenaSize: "20x60" },
            { name: "Z1", category: "Heavy", difficulty: 7, arenaSize: "20x60" },
            { name: "Z2", category: "Heavy", difficulty: 8, arenaSize: "20x60" },
            { name: "ZZ-Licht", category: "Very Heavy Light", difficulty: 9, arenaSize: "20x60" },
            { name: "ZZ-Zwaar", category: "Very Heavy", difficulty: 9, arenaSize: "20x60" }
        ]
    }
];

// FEI International Levels (same for all countries)
const FEI_LEVELS = [
    { name: "Prix St Georges", category: "FEI Small Tour", difficulty: 9, arenaSize: "20x60" },
    { name: "Intermediate I", category: "FEI Small Tour", difficulty: 9, arenaSize: "20x60" },
    { name: "Intermediate II", category: "FEI Big Tour", difficulty: 10, arenaSize: "20x60" },
    { name: "Grand Prix", category: "FEI Big Tour", difficulty: 10, arenaSize: "20x60" }
];

// Helper functions to get data
export function getCountriesList() {
    return DRESSAGE_COUNTRIES_DATA.map(country => ({
        name: country.country,
        flag: country.flag
    }));
}

function getGoverningBodyByCountry(countryName) {
    const country = DRESSAGE_COUNTRIES_DATA.find(c => c.country === countryName);
    return country ? country.governingBody : null;
}

function getLevelsByCountry(countryName) {
    const country = DRESSAGE_COUNTRIES_DATA.find(c => c.country === countryName);
    return country ? country.levels : [];
}

function getLevelsByGoverningBody(abbreviation) {
    const country = DRESSAGE_COUNTRIES_DATA.find(c => c.governingBody.abbreviation === abbreviation);
    return country ? country.levels : [];
}

function getAllCountriesWithLevels() {
    return DRESSAGE_COUNTRIES_DATA;
}

// Example usage:
// Get all countries for dropdown
const countries = getCountriesList();

// Get governing body for UK
const ukGoverningBody = getGoverningBodyByCountry('United Kingdom');

// Get all UK levels
const ukLevels = getLevelsByCountry('United Kingdom');

// Get levels by governing body abbreviation
const bdLevels = getLevelsByGoverningBody('BD');

// Export for use in modules
export {
    DRESSAGE_COUNTRIES_DATA,
    FEI_LEVELS,
    countries,
    getGoverningBodyByCountry,
    getLevelsByCountry,
    getLevelsByGoverningBody,
    getAllCountriesWithLevels
};