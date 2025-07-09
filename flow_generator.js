// flow_generator.js
// This script contains the logic for procedurally generating rap flow patterns.
// It defines different "flow elements" (like syllables, pauses, rhymes) and uses
// genre-specific rules to arrange these elements into 4-bar patterns.

// --- Core Definitions ---

// FLOW_ELEMENTS: Defines the types of rhythmic/lyrical events that can occur in a flow.
export const FLOW_ELEMENTS = [
    'SYLLABLE',       // Represents a standard spoken syllable.
    'EMPHASIS'        // A stressed or accented syllable.
];

// STEPS_PER_BAR: The resolution of the pattern grid, 16 steps = 16th notes in a 4/4 bar.
export const STEPS_PER_BAR = 16;
// NUM_BARS: The total number of bars generated for a single pattern idea.
export const NUM_BARS = 4;
// TOTAL_STEPS: Total number of steps in the entire pattern.
export const TOTAL_STEPS = STEPS_PER_BAR * NUM_BARS;


// --- Helper Functions ---

/**
 * Creates an array representing a single flow element's track, initialized to inactive (0).
 * @param {number} steps - The number of steps for this element track (defaults to TOTAL_STEPS).
 * @returns {Array<number>} An array of 0s.
 */
function createEmptyElementPattern(steps = TOTAL_STEPS) {
    return Array(steps).fill(0);
}

/**
 * Creates a complete empty flow pattern object.
 * Each flow element gets its own track (array of steps).
 * @returns {Object} An object where keys are flow element names and values are empty step arrays.
 */
export function createEmptyFlowPattern() {
    const pattern = {};
    FLOW_ELEMENTS.forEach(element => {
        pattern[element] = createEmptyElementPattern();
    });
    return pattern;
}


// --- Single-Bar Rap Style Generation Functions ---
// These functions generate a single bar (16 steps) of a flow pattern
// specific to a given rap subgenre. They operate on a `barPattern` object.

/**
 * Generates a single bar of a Boom Bap style flow.
 * Characteristics: Steady rhythm, clear emphasis, classic rhyme setups.
 * @param {Object} barPattern - The pattern object for a single bar to be populated.
 * @param {number} [seed] - Optional seed for varied generation within the style (not heavily used yet).
 */
function generateSingleBarBoomBapFlow(barPattern, seed = Math.random()) {
    // Boom Bap: Relatively steady syllable placement, often on beat or simple syncopation.
    // Clear emphasis, typically on beats equivalent to kick and snare in a drum pattern.
    // Pauses for breath and to add weight to phrases.
    // Place syllables with higher probability on strong beats (0, 4, 8, 12) and some common off-beats.
    const commonSyllablePositions = [0, 2, 3, 4, 6, 7, 8, 10, 11, 12, 14, 15]; // Example positions
    commonSyllablePositions.forEach(pos => {
        if (Math.random() < 0.65) barPattern.SYLLABLE[pos] = 1;
    });

    // Emphasis often on beats 1 & 3 (kick-like) or 2 & 4 (snare-like).
    if (Math.random() < 0.7) barPattern.EMPHASIS[0] = 1;
    if (Math.random() < 0.6) barPattern.EMPHASIS[4] = 1;
    if (Math.random() < 0.6) barPattern.EMPHASIS[8] = 1;
    if (Math.random() < 0.6) barPattern.EMPHASIS[12] = 1;
    // Add some syncopated emphasis.
    if (Math.random() < 0.3) barPattern.EMPHASIS[Math.random() < 0.5 ? 3 : 7] = 1;
    if (Math.random() < 0.3) barPattern.EMPHASIS[Math.random() < 0.5 ? 11 : 15] = 1;

    // Ensure any step marked for EMPHASIS also has a SYLLABLE active.
    // And if both are active, EMPHASIS takes precedence for any specific logic, SYLLABLE underpins it.
    for(let i=0; i<STEPS_PER_BAR; i++) {
        if(barPattern.EMPHASIS[i]) barPattern.SYLLABLE[i] = 1;
    }
    // No PAUSE, RHYME, MULTI_SYLLABLE, or ADLIB_SLOT specific logic needed here anymore.
    return barPattern;
}

/**
 * Generates a single bar of a Trap style flow.
 * Characteristics: More SYLLABLE density, varied EMPHASIS. (Original: Triplets, fast rhythms, varied pauses, ad-lib setups)
 * @param {Object} barPattern - The pattern object for a single bar.
 */
function generateSingleBarTrapFlow(barPattern, seed = Math.random()) {
    const baseSyllableProb = 0.4; // Base probability for a single syllable, slightly higher for trap.

    for (let i = 0; i < STEPS_PER_BAR; i++) {
        if (Math.random() < baseSyllableProb) {
            barPattern.SYLLABLE[i] = 1;
        }
        // Emphasis can occur on any syllable.
        if (barPattern.SYLLABLE[i] && Math.random() < 0.25) barPattern.EMPHASIS[i] = 1;
    }

    // Ensure any step marked for EMPHASIS also has a SYLLABLE active.
    for(let i=0; i<STEPS_PER_BAR; i++) {
        if(barPattern.EMPHASIS[i]) barPattern.SYLLABLE[i] = 1;
    }
    // Removed PAUSE, RHYME, MULTI_SYLLABLE, ADLIB_SLOT logic.
    return barPattern;
}

/**
 * Generates a single bar of a Mumble Rap style flow.
 * Characteristics: Sparser SYLLABLEs, less distinct EMPHASIS. (Original: Sparser syllables, more pauses, less distinct emphasis, muddled multi-syllables)
 * @param {Object} barPattern - The pattern object for a single bar.
 */
function generateSingleBarMumbleFlow(barPattern, seed = Math.random()) {
    const syllableProb = 0.3; // Sparser syllables.
    const emphasisProb = 0.1; // Less emphasis.

    for (let i = 0; i < STEPS_PER_BAR; i++) {
        if (Math.random() < syllableProb) {
            barPattern.SYLLABLE[i] = 1;
            if (Math.random() < emphasisProb) barPattern.EMPHASIS[i] = 1;
        }
    }
    // Ensure any step marked for EMPHASIS also has a SYLLABLE active.
    for(let i=0; i<STEPS_PER_BAR; i++) {
        if(barPattern.EMPHASIS[i]) barPattern.SYLLABLE[i] = 1;
    }
    // Removed PAUSE, RHYME, MULTI_SYLLABLE logic.
    return barPattern;
}

/**
 * Generates a single bar of a Conscious Hip-Hop style flow.
 * Characteristics: Clear diction (more SYLLABLEs), consistent EMPHASIS. (Original: Clear diction, consistent syllable density, meaningful pauses, structured rhymes)
 * @param {Object} barPattern - The pattern object for a single bar.
 */
function generateSingleBarConsciousFlow(barPattern, seed = Math.random()) {
    const syllableProb = 0.7; // Higher syllable density.
    const emphasisProb = 0.3; // Clearer emphasis.

    for (let i = 0; i < STEPS_PER_BAR; i++) {
        if (Math.random() < syllableProb) {
            barPattern.SYLLABLE[i] = 1;
            // Emphasis often aligns with strong beats (0, 4, 8, 12) or key syncopated points.
            if (i % 4 === 0 || i % 4 === 2) { // Stronger beats
                if (Math.random() < emphasisProb) barPattern.EMPHASIS[i] = 1;
            } else if (Math.random() < 0.15) { // Other syncopated points
                 barPattern.EMPHASIS[i] = 1;
            }
        }
    }
    // Ensure any step marked for EMPHASIS also has a SYLLABLE active.
    for(let i=0; i<STEPS_PER_BAR; i++) {
        if(barPattern.EMPHASIS[i]) barPattern.SYLLABLE[i] = 1;
    }
    // Removed PAUSE, RHYME logic.
    return barPattern;
}

/**
 * Generates a single bar of a Grime style flow.
 * Characteristics: High energy (dense SYLLABLEs), sharp EMPHASIS. (Original: High energy, fast syllable rate, sharp on-beat/off-beat emphasis, quick multi-syllable bursts)
 * @param {Object} barPattern - The pattern object for a single bar.
 */
function generateSingleBarGrimeFlow(barPattern, seed = Math.random()) {
    const syllableProb = 0.75; // High syllable density.
    const emphasisProb = 0.4;  // Strong and frequent emphasis.

    for (let i = 0; i < STEPS_PER_BAR; i++) {
        if (Math.random() < syllableProb) {
            barPattern.SYLLABLE[i] = 1;
        }
        if (barPattern.SYLLABLE[i]) { // Emphasis on any active syllable.
            if (Math.random() < emphasisProb) barPattern.EMPHASIS[i] = 1;
        }
    }
    // Ensure any step marked for EMPHASIS also has a SYLLABLE active.
    for(let i=0; i<STEPS_PER_BAR; i++) {
        if(barPattern.EMPHASIS[i]) barPattern.SYLLABLE[i] = 1;
    }
    // Removed PAUSE, RHYME, MULTI_SYLLABLE logic.
    return barPattern;
}

/**
 * Generates a 4-bar experimental flow pattern with high randomness.
 * @param {Object} pattern - The full 4-bar pattern object to be populated.
 */
function generateFullExperimentalFlowPattern(pattern) {
    FLOW_ELEMENTS.forEach(element => {
        for (let i = 0; i < TOTAL_STEPS; i++) {
            let prob = 0.1; // Default low probability.
            if (element === 'SYLLABLE') prob = 0.4; // Adjusted for fewer elements
            if (element === 'EMPHASIS') prob = 0.2; // Adjusted for fewer elements

            if (Math.random() < prob) {
                pattern[element][i] = 1;
            }
        }
    });
    // Coherence cleanup for experimental patterns.
    for (let i = 0; i < TOTAL_STEPS; i++) {
        if (pattern.EMPHASIS[i]) {
            pattern.SYLLABLE[i] = 1; // Emphasis implies Syllable.
        }
    }
    return pattern;
}

// --- Main Pattern Generation Function ---

/**
 * Generates a complete 4-bar rap flow pattern based on selected style and options.
 * @param {string} style - The primary rap style selected (e.g., "boombap", "trap").
 * @param {Array<string>} [fusionStyles=[]] - Array of two styles for "flow-fusion" mode.
 * @returns {Object} The generated 4-bar flow pattern.
 */
export function generateFlowPattern(style, fusionStyles = []) {
    let fullPattern = createEmptyFlowPattern(); // Initialize the 4-bar pattern structure.

    let singleBarGenFunc; // Function to generate individual bars.
    let baseStyleSource = style;

    if (style === "flow-fusion" && fusionStyles.length === 2) {
        baseStyleSource = fusionStyles[0]; // TODO: Define how fusion works (e.g., rhythm from one, density from another)
    }

    switch (baseStyleSource) {
        case 'boombap': singleBarGenFunc = generateSingleBarBoomBapFlow; break;
        case 'trap': singleBarGenFunc = generateSingleBarTrapFlow; break;
        case 'mumble': singleBarGenFunc = generateSingleBarMumbleFlow; break;
        case 'conscious': singleBarGenFunc = generateSingleBarConsciousFlow; break;
        case 'grime': singleBarGenFunc = generateSingleBarGrimeFlow; break;
        case 'experimental-flow':
            generateFullExperimentalFlowPattern(fullPattern);
            return fullPattern; // Return early for experimental
        default:
            console.warn(`Unknown base style: ${baseStyleSource}, defaulting to Boom Bap.`);
            singleBarGenFunc = generateSingleBarBoomBapFlow;
    }

    // Generate and tile the first NUM_BARS - 1 bars (main loop)
    for (let bar = 0; bar < NUM_BARS - 1; bar++) {
        const barOffset = bar * STEPS_PER_BAR;
        let singleBarPattern = createEmptyFlowPattern(); // Create a temporary 16-step pattern for flow elements
        // Initialize only the 16 steps for the single bar
        FLOW_ELEMENTS.forEach(el => singleBarPattern[el] = createEmptyElementPattern(STEPS_PER_BAR));

        singleBarGenFunc(singleBarPattern); // Populate the 16-step pattern

        FLOW_ELEMENTS.forEach(el => {
            for (let step = 0; step < STEPS_PER_BAR; step++) {
                if (singleBarPattern[el][step] === 1) {
                    fullPattern[el][barOffset + step] = 1;
                }
            }
        });
    }

    // Add a "fill" or variation in the last bar
    // For now, let's generate another bar using the same style, but could be different
    const fillBarOffset = (NUM_BARS - 1) * STEPS_PER_BAR;
    let fillBarPattern = createEmptyFlowPattern();
    FLOW_ELEMENTS.forEach(el => fillBarPattern[el] = createEmptyElementPattern(STEPS_PER_BAR));
    singleBarGenFunc(fillBarPattern); // Generate a bar, could add more variation here for a "fill"

    // Slightly increase density or add specific fill elements for the last bar
    if(style !== 'experimental-flow'){ // Don't double-modify experimental
        for(let step=0; step < STEPS_PER_BAR; step++){
            if(Math.random() < 0.15) fillBarPattern.EMPHASIS[step] = 1; // More emphasis in fills
             if (fillBarPattern.EMPHASIS[step]) { // If EMPHASIS is added, ensure SYLLABLE is also there.
                fillBarPattern.SYLLABLE[step] = 1;
            }
        }
    }
    // Attempt to make the fill slightly different
    if (style !== 'experimental-flow') {
        let fillSpecificSeed = Math.random(); // To make fill generation slightly different from main loop bars
        let tempFillBarPattern = createEmptyFlowPattern();
        FLOW_ELEMENTS.forEach(el => tempFillBarPattern[el] = createEmptyElementPattern(STEPS_PER_BAR));

        singleBarGenFunc(tempFillBarPattern, fillSpecificSeed); // Populate with the style's logic

        // Example: Increase chance of EMPHASIS in the fill for some styles
        if (style === 'trap' || style === 'grime' || style === 'boombap' || style === 'conscious') {
             for(let step=0; step < STEPS_PER_BAR; step++){
                if(Math.random() < 0.20) tempFillBarPattern.EMPHASIS[step] = 1; // Higher chance of emphasis in fill
                 if(tempFillBarPattern.EMPHASIS[step]) tempFillBarPattern.SYLLABLE[step] = 1; // Ensure SYLLABLE if EMPHASIS
            }
        }
        // Copy from tempFillBarPattern to fullPattern's fill section
        FLOW_ELEMENTS.forEach(el => {
            for (let step = 0; step < STEPS_PER_BAR; step++) {
                fullPattern[el][fillBarOffset + step] = 0; // Clear existing
                if (tempFillBarPattern[el][step] === 1) {
                    fullPattern[el][fillBarOffset + step] = 1;
                }
            }
        });
    } else { // For experimental, the pattern is already fully generated for TOTAL_STEPS
        // No specific fill override needed here.
    }

    /*
    FLOW_ELEMENTS.forEach(el => { // This loop seems redundant now after the specific fill logic above.
        for (let step = 0; step < STEPS_PER_BAR; step++) {
            // if (fillBarPattern[el][step] === 1) { // fillBarPattern might not be what we want here for experimental
            //    fullPattern[el][fillBarOffset + step] = 1;
            // }
            }
        }
    });
    */

    // --- Rhyme Scheme Application (AABB, ABAB) ---
    // REMOVED - RHYME_A and RHYME_B elements are no longer part of FLOW_ELEMENTS.


    // --- Flow Fusion Logic ---
    // Simplified: Fusion will now just alternate bars between two styles,
    // or could take SYLLABLE from one and EMPHASIS from another.
    // For now, let's try taking SYLLABLE pattern from style1 and EMPHASIS from style2.
    if (style === "flow-fusion" && fusionStyles.length === 2) {
        let fusionGen1, fusionGen2;

        const getGenerator = (styleName) => {
            switch (styleName) {
                case 'boombap': return generateSingleBarBoomBapFlow;
                case 'trap': return generateSingleBarTrapFlow;
                case 'mumble': return generateSingleBarMumbleFlow;
                case 'conscious': return generateSingleBarConsciousFlow;
                case 'grime': return generateSingleBarGrimeFlow;
                default: return generateSingleBarBoomBapFlow;
            }
        };
        fusionGen1 = getGenerator(fusionStyles[0]);
        fusionGen2 = getGenerator(fusionStyles[1]);

        for (let bar = 0; bar < NUM_BARS; bar++) {
            const barOffset = bar * STEPS_PER_BAR;
            let tempBar1 = createEmptyFlowPattern(); FLOW_ELEMENTS.forEach(el => tempBar1[el] = createEmptyElementPattern(STEPS_PER_BAR));
            let tempBar2 = createEmptyFlowPattern(); FLOW_ELEMENTS.forEach(el => tempBar2[el] = createEmptyElementPattern(STEPS_PER_BAR));

            fusionGen1(tempBar1); // Generates SYLLABLE and EMPHASIS for style 1
            fusionGen2(tempBar2); // Generates SYLLABLE and EMPHASIS for style 2

            for (let step = 0; step < STEPS_PER_BAR; step++) {
                // Take SYLLABLE base from style 1
                if (tempBar1.SYLLABLE[step]) fullPattern.SYLLABLE[barOffset + step] = 1;
                else fullPattern.SYLLABLE[barOffset + step] = 0;

                // Overlay EMPHASIS from style 2, but only if there's a SYLLABLE from style 1
                // Or, more simply, take emphasis from style2 and ensure syllable is on.
                if (tempBar2.EMPHASIS[step]) {
                    fullPattern.EMPHASIS[barOffset + step] = 1;
                    fullPattern.SYLLABLE[barOffset + step] = 1; // Ensure syllable if emphasis is on
                } else {
                    fullPattern.EMPHASIS[barOffset + step] = 0;
                    // If style1 didn't have a syllable here, but style2 had emphasis, we added a syllable.
                    // If style1 had a syllable and style2 had no emphasis, syllable remains.
                }
            }
        }
        // The fill logic for the main style is overwritten by this fusion.
        // This is acceptable for now given the simplification.
    }


    // Final cleanup: Ensure logical consistency
    for (let i = 0; i < TOTAL_STEPS; i++) {
        // Ensure EMPHASIS implies a SYLLABLE.
        if (fullPattern.EMPHASIS[i]) {
            fullPattern.SYLLABLE[i] = 1;
        }
    }
    return fullPattern;
}


export const RAP_STYLE_LIST = [
    "boombap", "trap", "mumble", "conscious", "grime", "experimental-flow"
];

export const ALL_RAP_STYLES_INCLUDING_SPECIAL = [
    ...RAP_STYLE_LIST, "flow-fusion"
];

// Potential for tempo/speed mapping if desired
export const RAP_STYLE_SPEED_MAP = {
    "boombap": { default: 90, range: [80, 100] }, // BPM equivalent for typical feel
    "trap": { default: 140, range: [120, 160] }, // Often feels like 70-80 due to half-time
    "mumble": { default: 130, range: [110, 150] },
    "conscious": { default: 95, range: [85, 110] },
    "grime": { default: 140, range: [135, 145] },
    "experimental-flow": { default: 120, range: [70, 200] },
    "flow-fusion": { default: 120, range: [90, 150] }
};

// Quick test (can be run by flow_app.js later)
// setTimeout(() => {
//     console.log("Boom Bap Flow (4 bars):", generateFlowPattern("boombap"));
//     console.log("Trap Flow (4 bars):", generateFlowPattern("trap"));
//     console.log("Experimental Flow (4 bars):", generateFlowPattern("experimental-flow"));
// }, 100);
