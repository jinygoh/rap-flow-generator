// Procedural Drum Pattern Generator

export const INSTRUMENTS = ['kick', 'snare', 'hiHat', 'crash', 'tom'];
const STEPS_PER_BAR = 16;
const NUM_BARS = 4;
const TOTAL_STEPS = STEPS_PER_BAR * NUM_BARS;

// Helper function to create an empty pattern for one instrument
function createEmptyInstrumentPattern(steps = TOTAL_STEPS) {
    return Array(steps).fill(0);
}

// Helper function to create a full empty pattern
function createEmptyPattern() {
    const pattern = {};
    INSTRUMENTS.forEach(inst => {
        pattern[inst] = createEmptyInstrumentPattern();
    });
    return pattern;
}

// Helper function to generate a generic fill for the last bar
function addGenericFill(pattern, instrument, barOffset, density = 0.5, includeSnare = true, includeToms = true) {
    const fillStartStep = barOffset + STEPS_PER_BAR * (NUM_BARS - 1);
    for (let i = 0; i < STEPS_PER_BAR; i++) {
        if (includeSnare && Math.random() < density * 0.6) { // Snare hits more likely
            pattern.snare[fillStartStep + i] = 1;
        }
        if (includeToms && Math.random() < density * 0.5) {
            pattern.tom[fillStartStep + i] = 1;
        }
        // Occasional kick in fills
        if (Math.random() < density * 0.2) {
            pattern.kick[fillStartStep + i] = 1;
        }
        // Hi-hats can also be part of fills
        if (Math.random() < density * 0.4) {
            pattern.hiHat[fillStartStep + i] = 1;
        }
    }
    // Ensure a crash at the beginning of the fill bar or main loop, if fill is active
    if (Math.random() < 0.6) pattern.crash[fillStartStep] = 1;
    else if (Math.random() < 0.3) pattern.crash[0] =1; // Or at the very beginning of the 4 bars
}


// --- Genre Specific Generation Logics (now for 1 bar, to be repeated) ---
// These functions will generate a single bar pattern, which will then be tiled
// and a fill will be added in the main generatePattern function.

function generateSingleBarHousePattern(barPattern) {
    for (let i = 0; i < STEPS_PER_BAR; i += 4) barPattern.kick[i] = 1;
    barPattern.snare[4] = 1; barPattern.snare[12] = 1;
    for (let i = 0; i < STEPS_PER_BAR; i++) {
        if (i % 2 !== 0 && Math.random() < 0.8) barPattern.hiHat[i] = 1;
        if (i % 2 === 0 && Math.random() < 0.2) barPattern.hiHat[i] = 1;
    }
    if (Math.random() < 0.1) barPattern.crash[0] = 1; // Less frequent for single bar
    return barPattern;
}

function generateSingleBarTechnoPattern(barPattern) {
    for (let i = 0; i < STEPS_PER_BAR; i += 4) barPattern.kick[i] = 1;
    if (Math.random() < 0.15) barPattern.kick[Math.random() < 0.5 ? 6 : 14] = 1;
    barPattern.snare[4] = 1; barPattern.snare[12] = 1;
    if (Math.random() < 0.1) barPattern.snare[Math.random() < 0.5 ? 7 : 15] =1;
    const hiHatMode = Math.random();
    if (hiHatMode < 0.6) { for (let i = 0; i < STEPS_PER_BAR; i++) if (Math.random() < 0.85) barPattern.hiHat[i] = 1; }
    else { const offBeat = Math.random() < 0.5; for (let i = offBeat ? 1 : 0; i < STEPS_PER_BAR; i += 2) if (Math.random() < 0.9) barPattern.hiHat[i] = 1; }
    if (Math.random() < 0.05) barPattern.crash[0] = 1;
    return barPattern;
}

function generateSingleBarHipHopPattern(barPattern) {
    barPattern.kick[0] = 1;
    if (Math.random() < 0.7) barPattern.kick[Math.random() < 0.5 ? 3:2] = 1;
    if (Math.random() < 0.6) barPattern.kick[Math.random() < 0.5 ? 5:6] = 1;
    if (Math.random() < 0.8) barPattern.kick[8] = 1;
    if (Math.random() < 0.5) barPattern.kick[Math.random() < 0.5 ? 10:11] = 1;
    if (Math.random() < 0.7) barPattern.kick[Math.random() < 0.5 ? 13:14] = 1;
    barPattern.snare[4] = 1; barPattern.snare[12] = 1;
    if (Math.random() < 0.3) barPattern.snare[Math.random() < 0.5 ? 11 : 13] = (Math.random() < 0.5 ? 1:0);
    const hiHatDensity = Math.random();
    if (hiHatDensity < 0.4) { for (let i = 0; i < STEPS_PER_BAR; i += 2) if (Math.random() < 0.6) barPattern.hiHat[i] = 1; }
    else if (hiHatDensity < 0.8) { for (let i = 0; i < STEPS_PER_BAR; i++) { if (i % 2 === 0 && Math.random() < 0.7) barPattern.hiHat[i] = 1; else if (i % 2 !== 0 && Math.random() < 0.3) barPattern.hiHat[i] = 1; }}
    if (Math.random() < 0.1) barPattern.crash[0] = 1;
    return barPattern;
}

function generateSingleBarTrapPattern(barPattern) {
    barPattern.kick[0] = 1;
    if (Math.random() < 0.6) barPattern.kick[6] = 1;
    if (Math.random() < 0.4) barPattern.kick[7] = 1;
    if (Math.random() < 0.7) barPattern.kick[10] = 1;
    if (Math.random() < 0.5) barPattern.kick[14] = 1;
    if (Math.random() < 0.8) barPattern.snare[4] = 1; else barPattern.snare[6] = 1;
    barPattern.snare[12] = 1;
    if (Math.random() < 0.3) barPattern.snare[Math.floor(Math.random()*3) + 13] = 1;
    for (let i = 0; i < STEPS_PER_BAR; i++) {
        if (i % 2 === 0 && Math.random() < 0.7) barPattern.hiHat[i] = 1;
        else if (Math.random() < 0.5) barPattern.hiHat[i] = 1;
        if (Math.random() < 0.15 && i < STEPS_PER_BAR -1) { barPattern.hiHat[i] = 1; barPattern.hiHat[i+1] = (Math.random() < 0.8 ? 1:0) ; i++; }
    }
    for(let i=0; i<STEPS_PER_BAR; i++) if(Math.random() < 0.1) barPattern.hiHat[i] = 0;
    if (Math.random() < 0.05) barPattern.crash[0] = 1;
    return barPattern;
}

function generateSingleBarRockPattern(barPattern) {
    barPattern.kick[0] = 1; barPattern.kick[8] = 1;
    if (Math.random() < 0.3) barPattern.kick[2] = 1;
    if (Math.random() < 0.2) barPattern.kick[6] = 1;
    if (Math.random() < 0.2) barPattern.kick[10] = 1;
    if (Math.random() < 0.1) barPattern.kick[14] = 1;
    barPattern.snare[4] = 1; barPattern.snare[12] = 1;
    for (let i = 0; i < STEPS_PER_BAR; i += 2) if (Math.random() < 0.9) barPattern.hiHat[i] = 1;
    if (Math.random() < 0.2) { const openHatPos = (Math.floor(Math.random()*4) * 2) + 1; if(openHatPos < STEPS_PER_BAR) barPattern.hiHat[openHatPos] = 1; }
    if (Math.random() < 0.15) barPattern.crash[0] = 1;
    return barPattern;
}

function generateSingleBarFunkPattern(barPattern) {
    barPattern.kick[0] = 1;
    for (let i = 1; i < STEPS_PER_BAR; i++) if (Math.random() < 0.25) barPattern.kick[i] = 1;
    if (Math.random() < 0.6) barPattern.kick[6] = 1;
    if (Math.random() < 0.5) barPattern.kick[10] = 1;
    barPattern.snare[4] = 1; barPattern.snare[12] = 1;
    for (let i = 0; i < STEPS_PER_BAR; i++) if (i !== 4 && i !== 12 && Math.random() < 0.15) barPattern.snare[i] = 1;
    for (let i = 0; i < STEPS_PER_BAR; i++) if (Math.random() < 0.75) barPattern.hiHat[i] = 1;
    if(Math.random() < 0.5) barPattern.hiHat[Math.floor(Math.random()*STEPS_PER_BAR)] = 0;
    if(Math.random() < 0.5) barPattern.hiHat[Math.floor(Math.random()*STEPS_PER_BAR)] = 0;
    if (Math.random() < 0.1) barPattern.crash[Math.random() < 0.5 ? 0 : Math.floor(Math.random()*STEPS_PER_BAR)] = 1;
    return barPattern;
}

function generateSingleBarReggaetonPattern(barPattern) {
    for(let i=0; i<STEPS_PER_BAR; i+=4) barPattern.kick[i] = 1;
    barPattern.snare[3] = 1; barPattern.snare[7] = 1; barPattern.snare[11] = 1; barPattern.snare[14] = 1;
    for (let i = 0; i < STEPS_PER_BAR; i += 2) if (Math.random() < 0.8) barPattern.hiHat[i] = 1;
    if (Math.random() < 0.05) barPattern.crash[0] = 1;
    return barPattern;
}

function generateSingleBarJazzPattern(barPattern) {
    if (Math.random() < 0.3) barPattern.kick[0] = 1;
    const kickPlacements = [3, 7, 10, 11, 14, 15];
    kickPlacements.forEach(p => { if (Math.random() < 0.15) barPattern.kick[p] = 1; });
    const snarePlacements = [2, 3, 5, 6, 7, 9, 10, 11, 13, 14, 15];
    snarePlacements.forEach(p => { if (Math.random() < 0.12) barPattern.snare[p] = 1; });
    if(barPattern.snare.every(s => s === 0) && Math.random() < 0.5) barPattern.snare[Math.random() < 0.5 ? 4 : 12] = 1;
    barPattern.hiHat[0] = 1; if (Math.random() < 0.8) barPattern.hiHat[3] = 1;
    barPattern.hiHat[4] = 1; if (Math.random() < 0.8) barPattern.hiHat[7] = 1;
    barPattern.hiHat[8] = 1; if (Math.random() < 0.8) barPattern.hiHat[11] = 1;
    barPattern.hiHat[12] = 1; if (Math.random() < 0.8) barPattern.hiHat[15] = 1;
    if(Math.random() < 0.4) { barPattern.hiHat[4] = 1; barPattern.hiHat[12] = 1; }
    if (Math.random() < 0.02) barPattern.crash[0] = 1; // Very rare for single bar context
    return barPattern;
}

function generateSingleBarBossaNovaPattern(barPattern) {
    barPattern.kick[0] = 1;
    if (Math.random() < 0.7) barPattern.kick[7] = 1;
    if (Math.random() < 0.4) barPattern.kick[8] = 1;
    if (Math.random() < 0.7) barPattern.kick[15] = 1;
    barPattern.snare[2] = 1; barPattern.snare[5] = 1; barPattern.snare[8] = 1; barPattern.snare[11] = 1; barPattern.snare[14] = 1;
    for (let i = 0; i < STEPS_PER_BAR; i += 2) if (Math.random() < 0.9) barPattern.hiHat[i] = 1;
    if(Math.random() < 0.3) barPattern.hiHat[3] = 1; if(Math.random() < 0.3) barPattern.hiHat[7] = 1;
    if(Math.random() < 0.3) barPattern.hiHat[11] = 1; if(Math.random() < 0.3) barPattern.hiHat[15] = 1;
    if (Math.random() < 0.02) barPattern.crash[0] = 1;
    return barPattern;
}

// Experimental (No Rules): Creative chaos - now for the full 4 bars.
function generateFullExperimentalPattern(pattern) { // Operates on the full 64-step pattern
    INSTRUMENTS.forEach(inst => {
        for (let i = 0; i < TOTAL_STEPS; i++) {
            const threshold = 0.1 + Math.random() * 0.4;
            if (Math.random() < threshold) {
                pattern[inst][i] = 1;
            }
        }
    });
    for(let k=0; k<20; k++){ // More adjustments for longer pattern
        let inst = INSTRUMENTS[Math.floor(Math.random() * INSTRUMENTS.length)];
        let step = Math.floor(Math.random() * TOTAL_STEPS);
        pattern[inst][step] = Math.random() < 0.6 ? 1:0;
    }
    // Add a more chaotic fill for experimental
    const fillStartStep = STEPS_PER_BAR * (NUM_BARS - 1);
    for (let i = 0; i < STEPS_PER_BAR; i++) {
        INSTRUMENTS.forEach(instrument => {
            if (Math.random() < 0.35) { // Higher chance for any instrument in experimental fill
                pattern[instrument][fillStartStep + i] = 1;
            }
        });
    }
    if (Math.random() < 0.5) pattern.crash[fillStartStep] = 1; // Crash at fill start
    return pattern;
}

// --- Main Generator Function ---
export function generatePattern(genre, fusionGenres = []) {
    let fullPattern = createEmptyPattern(); // This is now 64 steps

    // Determine the single-bar generation function
    let singleBarGenFunc;
    let basePatternSource = genre;
    if (genre === "genre-fusion" && fusionGenres.length === 2) {
        basePatternSource = fusionGenres[0];
    }

    switch (basePatternSource) {
        case 'house': singleBarGenFunc = generateSingleBarHousePattern; break;
        case 'techno': singleBarGenFunc = generateSingleBarTechnoPattern; break;
        case 'hiphop': singleBarGenFunc = generateSingleBarHipHopPattern; break;
        case 'trap': singleBarGenFunc = generateSingleBarTrapPattern; break;
        case 'rock': singleBarGenFunc = generateSingleBarRockPattern; break;
        case 'funk': singleBarGenFunc = generateSingleBarFunkPattern; break;
        case 'reggaeton': singleBarGenFunc = generateSingleBarReggaetonPattern; break;
        case 'jazz': singleBarGenFunc = generateSingleBarJazzPattern; break;
        case 'bossa-nova': singleBarGenFunc = generateSingleBarBossaNovaPattern; break;
        case 'experimental':
            // Experimental is handled differently as it's not usually a repeated 1-bar pattern.
            generateFullExperimentalPattern(fullPattern);
            // Final check for experimental after full generation
            let totalHitsExp = 0;
            INSTRUMENTS.forEach(inst => { totalHitsExp += fullPattern[inst].reduce((sum, hit) => sum + hit, 0); });
            if (totalHitsExp < 8) { // Increased minimum for 4 bars
                console.log("Experimental pattern too sparse, regenerating...");
                fullPattern = createEmptyPattern();
                generateFullExperimentalPattern(fullPattern);
            }
            return fullPattern; // Return early for experimental
        default:
            console.warn(`Unknown base genre: ${basePatternSource}, defaulting to House.`);
            singleBarGenFunc = generateSingleBarHousePattern;
    }

    // Generate and tile the first NUM_BARS - 1 bars
    for (let bar = 0; bar < NUM_BARS -1; bar++) {
        const barOffset = bar * STEPS_PER_BAR;
        let singleBarPattern = createEmptyPattern(STEPS_PER_BAR); // Temp 16-step pattern
        singleBarGenFunc(singleBarPattern); // Populate the 16-step pattern

        INSTRUMENTS.forEach(inst => {
            for (let step = 0; step < STEPS_PER_BAR; step++) {
                if (singleBarPattern[inst][step] === 1) {
                    fullPattern[inst][barOffset + step] = 1;
                }
            }
        });
    }

    // Add a genre-appropriate fill in the last bar
    // For simplicity, using a generic fill function now, can be specialized later
    // The `0` for barOffset in addGenericFill is because it calculates its own offset based on NUM_BARS-1
    let fillDensity = 0.5;
    let includeSnareInFill = true;
    let includeTomsInFill = true;

    if (basePatternSource === 'rock' || basePatternSource === 'funk') fillDensity = 0.7;
    if (basePatternSource === 'techno' || basePatternSource === 'trap') fillDensity = 0.6;
    if (basePatternSource === 'jazz' || basePatternSource === 'bossa-nova') {
        fillDensity = 0.3;
        includeTomsInFill = Math.random() < 0.5; // Toms less common in their fills
    }
    if (basePatternSource === 'hiphop') fillDensity = 0.55;


    addGenericFill(fullPattern, basePatternSource, 0, fillDensity, includeSnareInFill, includeTomsInFill);


    // If Genre Fusion, apply hi-hat, cymbal, tom rules from the second genre for the main loop part
    if (genre === "genre-fusion" && fusionGenres.length === 2) {
        const secondaryGenre = fusionGenres[1];
        let secondarySingleBarGenFunc;
        switch (secondaryGenre) {
            case 'house': secondarySingleBarGenFunc = generateSingleBarHousePattern; break;
            case 'techno': secondarySingleBarGenFunc = generateSingleBarTechnoPattern; break;
            case 'hiphop': secondarySingleBarGenFunc = generateSingleBarHipHopPattern; break;
            case 'trap': secondarySingleBarGenFunc = generateSingleBarTrapPattern; break;
            case 'rock': secondarySingleBarGenFunc = generateSingleBarRockPattern; break;
            case 'funk': secondarySingleBarGenFunc = generateSingleBarFunkPattern; break;
            case 'reggaeton': secondarySingleBarGenFunc = generateSingleBarReggaetonPattern; break;
            case 'jazz': secondarySingleBarGenFunc = generateSingleBarJazzPattern; break;
            case 'bossa-nova': secondarySingleBarGenFunc = generateSingleBarBossaNovaPattern; break;
            // Experimental secondary elements are tricky for a tiled pattern, could make just the fill experimental
            // Or, for now, let's use a standard one if experimental is secondary.
            default:
                console.warn(`Unknown secondary fusion genre: ${secondaryGenre}, using House for secondary elements.`);
                secondarySingleBarGenFunc = generateSingleBarHousePattern;
        }

        if (secondaryGenre === 'experimental') {
            // If secondary is experimental, make the fill experimental and keep primary hi-hats etc. for loop.
            // Or, make hi-hats, toms, crash experimental for the loop section too.
            // For now, let's make the fill experimental.
            const fillStartStep = STEPS_PER_BAR * (NUM_BARS - 1);
            INSTRUMENTS.forEach(inst => { // Clear previous fill for these instruments
                if (inst === 'hiHat' || inst === 'crash' || inst === 'tom') {
                    for(let i=0; i<STEPS_PER_BAR; i++) fullPattern[inst][fillStartStep + i] = 0;
                }
            });
            let tempExpFillPattern = createEmptyPattern(STEPS_PER_BAR);
            // A mini-experimental pattern for the fill
            INSTRUMENTS.forEach(inst => {
                if (inst === 'hiHat' || inst === 'crash' || inst === 'tom') {
                    for (let i = 0; i < STEPS_PER_BAR; i++) {
                        if (Math.random() < 0.4) tempExpFillPattern[inst][i] = 1;
                    }
                    for (let step = 0; step < STEPS_PER_BAR; step++) {
                         if (tempExpFillPattern[inst][step] === 1) fullPattern[inst][fillStartStep + step] = 1;
                    }
                }
            });
             if (Math.random() < 0.7) fullPattern.crash[fillStartStep] = 1;


        } else if (secondarySingleBarGenFunc) {
            // Apply secondary genre's hi-hat, crash, tom for the first 3 bars
            for (let bar = 0; bar < NUM_BARS - 1; bar++) {
                const barOffset = bar * STEPS_PER_BAR;
                let secondaryBarPattern = createEmptyPattern(STEPS_PER_BAR);
                secondarySingleBarGenFunc(secondaryBarPattern);

                ['hiHat', 'crash', 'tom'].forEach(inst => {
                    // Clear existing secondary parts for this bar first
                    for(let step = 0; step < STEPS_PER_BAR; step++) {
                        fullPattern[inst][barOffset + step] = 0;
                    }
                    // Add new secondary parts
                    for (let step = 0; step < STEPS_PER_BAR; step++) {
                        if (secondaryBarPattern[inst][step] === 1) {
                            fullPattern[inst][barOffset + step] = 1;
                        }
                    }
                });
            }
            // The fill part (last bar) for hiHat, crash, tom will still be from the primary genre's fill logic.
            // If specific fill style for secondary is needed, it would require more complex merging here.
        }
    }

    // Ensure crash on the very first beat of the 4-bar loop for most genres
    if (genre !== 'jazz' && genre !== 'bossa-nova' && genre !== 'experimental' && Math.random() < 0.4) {
        fullPattern.crash[0] = 1;
    }


    return fullPattern;
}

// For "Genre Fusion", app.js will need to pick two random genres (excluding "Genre Fusion" itself and "Experimental")
// and pass their string names as the `fusionGenres` array.
// Example: generatePattern("genre-fusion", ["hiphop", "techno"])
// This would use hiphop for kick/snare, and techno for hihat/crash/tom.
// If "Experimental" is one of the chosen fusion genres, its rules will apply to its designated part.
// For example, ["rock", "experimental"] would be rock kick/snare, experimental hihats/toms/crash for the loop, and an experimental fill.
// ["experimental", "house"] would be experimental kick/snare for the loop, house hihats/toms/crash for the loop, and an experimental fill.

export const GENRE_LIST = [
    "house", "techno", "hiphop", "trap", "rock", "funk", "reggaeton", "jazz", "bossa-nova"
]; // For fusion mode to pick from these standard ones. Experimental is not included here for fusion base.

export const ALL_GENRES_INCLUDING_SPECIAL = [
    ...GENRE_LIST, "experimental", "genre-fusion"
];

export const GENRE_BPM_MAP = {
    "house": { default: 125, range: [118, 130] },
    "techno": { default: 135, range: [125, 150] },
    "hiphop": { default: 90, range: [80, 100] }, // Boom Bap
    "trap": { default: 140, range: [130, 160] }, // Often uses half-time feel, so effective BPM can feel like 70-80
    "rock": { default: 120, range: [90, 150] },
    "funk": { default: 110, range: [95, 120] },
    "reggaeton": { default: 95, range: [85, 105] },
    "jazz": { default: 130, range: [100, 180] }, // Wide range for jazz
    "bossa-nova": { default: 115, range: [100, 130] }, // Often more relaxed
    "experimental": { default: 120, range: [70, 200] }, // Wildly variable
    "genre-fusion": { default: 120, range: [90, 150] } // Generic fallback for fusion
};


// Simple test (run in browser console if testing this file standalone for basic output)
// setTimeout(() => {
//     console.log("House Pattern (4 bars):", generatePattern("house"));
//     console.log("Experimental Pattern (4 bars):", generatePattern("experimental"));
//     console.log("Genre Fusion (HipHop K/S, Techno HH/C/T - 4 bars):", generatePattern("genre-fusion", ["hiphop", "techno"]));
//     console.log("Genre Fusion (Rock K/S, Experimental Secondary - 4 bars):", generatePattern("genre-fusion", ["rock", "experimental"]));
// }, 100);
