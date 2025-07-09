// flow_generator.js
// This script contains the logic for procedurally generating rap flow patterns.
// It defines different "flow elements" (like syllables, pauses, rhymes) and uses
// genre-specific rules to arrange these elements into 4-bar patterns.

// --- Core Definitions ---

// FLOW_ELEMENTS: Defines the types of rhythmic/lyrical events that can occur in a flow.
export const FLOW_ELEMENTS = [
    'SYLLABLE',       // Represents a standard spoken syllable.
    'PAUSE_SHORT',    // A brief pause, typically equivalent to a 16th note rest.
    'PAUSE_LONG',     // A longer pause, e.g., an 8th note rest or more.
    'EMPHASIS',       // A stressed or accented syllable.
    'RHYME_A',        // Placeholder marking a syllable intended for rhyme group 'A'.
    'RHYME_B',        // Placeholder marking a syllable intended for rhyme group 'B'.
    'MULTI_SYLLABLE', // Represents a rapid burst of syllables (e.g., triplet, 32nd notes) over a single or few steps.
    'ADLIB_SLOT'      // A designated space in the flow where an ad-lib might be placed.
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
    for(let i=0; i<STEPS_PER_BAR; i++) {
        if(barPattern.EMPHASIS[i]) barPattern.SYLLABLE[i] = 1;
    }

    // Mark potential rhyme spots, typically towards the end of 2-beat or 4-beat phrases.
    // The main `generateFlowPattern` function will use these to apply AABB/ABAB schemes.
    if (Math.random() < 0.7) barPattern.RHYME_A[STEPS_PER_BAR - 1 - Math.floor(Math.random() * 2)] = 1;
    if (Math.random() < 0.5) barPattern.RHYME_B[STEPS_PER_BAR / 2 - 1 - Math.floor(Math.random() * 2)] = 1;

    // Add short pauses for breath control and rhythmic variation.
    if (Math.random() < 0.25) barPattern.PAUSE_SHORT[Math.random() < 0.5 ? 5 : 13] = 1;
    if (Math.random() < 0.15) barPattern.PAUSE_SHORT[Math.floor(Math.random() * STEPS_PER_BAR)] = 1;

    // Cleanup: If a pause is set, clear any other activity (syllable, emphasis, etc.) on that step.
    for(let i=0; i<STEPS_PER_BAR; i++) {
        if(barPattern.PAUSE_SHORT[i] || barPattern.PAUSE_LONG[i]) {
            barPattern.SYLLABLE[i] = 0;
            barPattern.EMPHASIS[i] = 0;
            barPattern.RHYME_A[i] = 0;
            barPattern.RHYME_B[i] = 0;
            barPattern.MULTI_SYLLABLE[i] = 0;
        }
    }
    return barPattern;
}

/**
 * Generates a single bar of a Trap style flow.
 * Characteristics: Triplets, fast rhythms (MULTI_SYLLABLE), varied pauses, ad-lib setups.
 * @param {Object} barPattern - The pattern object for a single bar.
 */
function generateSingleBarTrapFlow(barPattern, seed = Math.random()) {
    const baseSyllableProb = 0.3; // Base probability for a single syllable.
    const multiSyllableProb = 0.35; // Probability for a multi-syllable burst.

    for (let i = 0; i < STEPS_PER_BAR; i++) {
        // Generate multi-syllable bursts (representing triplets or fast doubles).
        if (Math.random() < multiSyllableProb) {
            barPattern.MULTI_SYLLABLE[i] = 1;
            // These bursts can span multiple steps.
            if (i + 1 < STEPS_PER_BAR && Math.random() < 0.6) {
                barPattern.MULTI_SYLLABLE[i+1] = 1;
                if (i + 2 < STEPS_PER_BAR && Math.random() < 0.4) {
                    barPattern.MULTI_SYLLABLE[i+2] = 1;
                    i += 2; continue; // Advance loop counter past the 3-step burst.
                }
                i += 1; continue; // Advance past 2-step burst.
            }
        } else if (Math.random() < baseSyllableProb) { // Otherwise, chance for a regular syllable.
            barPattern.SYLLABLE[i] = 1;
        }

        // Emphasis can occur on single syllables or at the start of multi-syllable bursts.
        if (barPattern.SYLLABLE[i] && Math.random() < 0.2) barPattern.EMPHASIS[i] = 1;
        if (barPattern.MULTI_SYLLABLE[i] && Math.random() < 0.25) barPattern.EMPHASIS[i] = 1;
    }

    // Place ADLIB_SLOTS, often preceded by a short or long pause.
    for (let i = 0; i < STEPS_PER_BAR - 2; i++) {
        if (Math.random() < 0.20) {
            if (Math.random() < 0.7) barPattern.PAUSE_SHORT[i] = 1; else barPattern.PAUSE_LONG[i] =1;
            barPattern.ADLIB_SLOT[i + 1 + Math.floor(Math.random()*2)] = 1; // Adlib after pause, with slight random offset.
            i += (1 + Math.floor(Math.random()*2));
        }
    }

    // Trap rhymes are often simpler, frequently at the end of the bar.
    const rhymeSpot = STEPS_PER_BAR - 1 - Math.floor(Math.random() * 3);
    if (Math.random() < 0.8) barPattern.RHYME_A[rhymeSpot] = 1;
    if (barPattern.RHYME_A[rhymeSpot]) barPattern.SYLLABLE[rhymeSpot] = 1; // Ensure syllable if rhyme is marked.

    // Cleanup logic specific to Trap flow.
    for(let i=0; i<STEPS_PER_BAR; i++) {
        if(barPattern.MULTI_SYLLABLE[i] || barPattern.ADLIB_SLOT[i]) {
            barPattern.SYLLABLE[i] = 0; // Multi-syllable or Adlib slot overrides a plain syllable.
        }
        // Any active element (syllable, emphasis, rhyme, multi, adlib) should clear pauses.
        if(barPattern.SYLLABLE[i] || barPattern.EMPHASIS[i] || barPattern.RHYME_A[i] || barPattern.RHYME_B[i] || barPattern.MULTI_SYLLABLE[i] || barPattern.ADLIB_SLOT[i]) {
            barPattern.PAUSE_SHORT[i] = 0;
            barPattern.PAUSE_LONG[i] = 0;
        }
        // Emphasis implies a syllable unless it's on a multi-syllable element (which is its own kind of syllable activity).
        if(barPattern.EMPHASIS[i] && !barPattern.MULTI_SYLLABLE[i]) barPattern.SYLLABLE[i] = 1;
    }
    return barPattern;
}

/**
 * Generates a single bar of a Mumble Rap style flow.
 * Characteristics: Sparser syllables, more pauses, less distinct emphasis, muddled multi-syllables.
 * @param {Object} barPattern - The pattern object for a single bar.
 */
function generateSingleBarMumbleFlow(barPattern, seed = Math.random()) {
    const syllableProb = 0.25;
    const multiProb = 0.15; // Mumble might have short, less defined bursts.
    const longPauseProb = 0.1;

    for (let i = 0; i < STEPS_PER_BAR; i++) {
        if (Math.random() < multiProb) {
            barPattern.MULTI_SYLLABLE[i] = 1;
            if (i + 1 < STEPS_PER_BAR && Math.random() < 0.5) barPattern.MULTI_SYLLABLE[i+1] = 1;
            i++;
        } else if (Math.random() < syllableProb) {
            barPattern.SYLLABLE[i] = 1;
            if (Math.random() < 0.1) barPattern.EMPHASIS[i] = 1; // Emphasis is rare and less pronounced.
        } else if (Math.random() < longPauseProb) {
            barPattern.PAUSE_LONG[i] = 1;
            if (i + 1 < STEPS_PER_BAR && Math.random() < 0.5) barPattern.PAUSE_LONG[i+1] = 1;
            i++;
        } else if (Math.random() < 0.2) { // Higher chance of short, ambiguous pauses.
            barPattern.PAUSE_SHORT[i] = 1;
        }
    }
    // Rhymes are often simple, if present, at the end of phrases/bar.
    if (Math.random() < 0.5) barPattern.RHYME_A[STEPS_PER_BAR - 1 - Math.floor(Math.random()*2)] = 1;

    // General cleanup for mumble style.
    for(let i=0; i<STEPS_PER_BAR; i++) {
        if(barPattern.MULTI_SYLLABLE[i] || barPattern.ADLIB_SLOT[i]) barPattern.SYLLABLE[i] = 0;
        if(barPattern.SYLLABLE[i] || barPattern.EMPHASIS[i] || barPattern.RHYME_A[i] || barPattern.RHYME_B[i] || barPattern.MULTI_SYLLABLE[i] || barPattern.ADLIB_SLOT[i]) {
            barPattern.PAUSE_SHORT[i] = 0; barPattern.PAUSE_LONG[i] = 0;
        }
        if(barPattern.EMPHASIS[i] && !barPattern.MULTI_SYLLABLE[i]) barPattern.SYLLABLE[i] = 1;
    }
    return barPattern;
}

/**
 * Generates a single bar of a Conscious Hip-Hop style flow.
 * Characteristics: Clear diction, consistent syllable density, meaningful pauses, structured rhymes.
 * @param {Object} barPattern - The pattern object for a single bar.
 */
function generateSingleBarConsciousFlow(barPattern, seed = Math.random()) {
    const syllableProb = 0.7; // Higher syllable density.
    const emphasisProb = 0.3; // Clearer emphasis.

    for (let i = 0; i < STEPS_PER_BAR; i++) {
        if (Math.random() < syllableProb) {
            barPattern.SYLLABLE[i] = 1;
            // Emphasis often aligns with strong beats (0, 4, 8, 12) or key syncopated points.
            if (i % 4 === 0 || i % 4 === 2) {
                if (Math.random() < emphasisProb) barPattern.EMPHASIS[i] = 1;
            } else if (Math.random() < 0.15) {
                 barPattern.EMPHASIS[i] = 1;
            }
        }
    }
    // Conscious rap often employs more structured rhyme schemes (e.g., ABAB over two bars).
    // These markers indicate potential spots for such rhymes.
    if (Math.random() < 0.8) barPattern.RHYME_A[STEPS_PER_BAR / 2 - 1 - Math.floor(Math.random() * 2)] = 1;
    if (Math.random() < 0.8) barPattern.RHYME_B[STEPS_PER_BAR - 1 - Math.floor(Math.random() * 2)] = 1;

    // Pauses are often more deliberate, for thought or breath.
    if (Math.random() < 0.15) barPattern.PAUSE_SHORT[7] = 1; // Mid-bar pause.
    if (Math.random() < 0.1) barPattern.PAUSE_LONG[15] = 1; // End-of-bar pause.

    // Cleanup.
    for(let i=0; i<STEPS_PER_BAR; i++) {
        if(barPattern.EMPHASIS[i] || barPattern.RHYME_A[i] || barPattern.RHYME_B[i]) barPattern.SYLLABLE[i] = 1;
        if(barPattern.PAUSE_SHORT[i] || barPattern.PAUSE_LONG[i]) {
            barPattern.SYLLABLE[i] = 0; barPattern.EMPHASIS[i] = 0; barPattern.RHYME_A[i] = 0; barPattern.RHYME_B[i] = 0; barPattern.MULTI_SYLLABLE[i] = 0;
        }
    }
    return barPattern;
}

/**
 * Generates a single bar of a Grime style flow.
 * Characteristics: High energy, fast syllable rate, sharp on-beat/off-beat emphasis, quick multi-syllable bursts.
 * @param {Object} barPattern - The pattern object for a single bar.
 */
function generateSingleBarGrimeFlow(barPattern, seed = Math.random()) {
    const syllableProb = 0.75; // High syllable density.
    const multiProb = 0.25;    // Frequent, short multi-syllable bursts.
    const emphasisProb = 0.4;  // Strong and frequent emphasis.

    for (let i = 0; i < STEPS_PER_BAR; i++) {
        if (Math.random() < multiProb && i < STEPS_PER_BAR -1) {
            barPattern.MULTI_SYLLABLE[i] = 1;
            barPattern.MULTI_SYLLABLE[i+1] = (Math.random() < 0.7 ? 1:0) ;
            if(barPattern.MULTI_SYLLABLE[i+1] && i < STEPS_PER_BAR -2 && Math.random() < 0.3) barPattern.MULTI_SYLLABLE[i+2] =1;
            i = barPattern.MULTI_SYLLABLE[i+2] ? i+2 : (barPattern.MULTI_SYLLABLE[i+1] ? i+1 : i); // Advance index.
        } else if (Math.random() < syllableProb) {
            barPattern.SYLLABLE[i] = 1;
        }

        if (barPattern.SYLLABLE[i] || barPattern.MULTI_SYLLABLE[i]) { // Emphasis on any active syllable/burst.
            if (Math.random() < emphasisProb) barPattern.EMPHASIS[i] = 1;
        }
    }
    // Grime rhymes are often aggressive and can be internal or at the end of short, punchy lines.
    if (Math.random() < 0.7) barPattern.RHYME_A[STEPS_PER_BAR - 1 - Math.floor(Math.random()*2)] = 1;
    if (Math.random() < 0.3) barPattern.RHYME_A[STEPS_PER_BAR - 2 - Math.floor(Math.random()*2)] = 1;

    // Grime flows are typically dense; long pauses are rare. Short, sharp pauses might occur.
    if (Math.random() < 0.1) barPattern.PAUSE_SHORT[Math.floor(Math.random() * STEPS_PER_BAR)] = 1;

    // Cleanup.
    for(let i=0; i<STEPS_PER_BAR; i++) {
        if(barPattern.MULTI_SYLLABLE[i]) barPattern.SYLLABLE[i] = 0; // Multi overrides plain syllable.
        // Emphasis or rhyme implies a syllable if not part of a multi-burst.
        if(barPattern.EMPHASIS[i] || barPattern.RHYME_A[i] || barPattern.RHYME_B[i]) barPattern.SYLLABLE[i] = barPattern.MULTI_SYLLABLE[i] ? 0 : 1;
        // Active content (syllable, emphasis, rhyme, multi, adlib) clears pauses.
        if(barPattern.PAUSE_SHORT[i] || barPattern.PAUSE_LONG[i] || barPattern.ADLIB_SLOT[i]) {
            barPattern.SYLLABLE[i] = 0; barPattern.EMPHASIS[i] = 0; barPattern.RHYME_A[i] = 0; barPattern.RHYME_B[i] = 0; barPattern.MULTI_SYLLABLE[i] = 0;
        }
    }
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
            // Adjust probabilities for different elements to create varied experimental patterns.
            if (element === 'SYLLABLE') prob = 0.3;
            if (element === 'EMPHASIS') prob = 0.15;
            if (element === 'MULTI_SYLLABLE') prob = 0.1;
            if (element === 'PAUSE_SHORT') prob = 0.08;
            if (element === 'PAUSE_LONG') prob = 0.05;
            if (element === 'ADLIB_SLOT') prob = 0.07;

            if (Math.random() < prob) {
                pattern[element][i] = 1;
            }
        }
    });
    // Coherence cleanup for experimental patterns.
    for (let i = 0; i < TOTAL_STEPS; i++) {
        if (pattern.EMPHASIS[i] || pattern.RHYME_A[i] || pattern.RHYME_B[i]) {
            if(!pattern.MULTI_SYLLABLE[i]) pattern.SYLLABLE[i] = 1;
            pattern.PAUSE_SHORT[i] = 0; pattern.PAUSE_LONG[i] = 0;
        }
         if (pattern.MULTI_SYLLABLE[i] || pattern.ADLIB_SLOT[i]) {
            pattern.SYLLABLE[i] = 0;
            pattern.PAUSE_SHORT[i] = 0; pattern.PAUSE_LONG[i] = 0;
        }
        // If it's just a plain syllable (no other markers), ensure no pauses.
        if (pattern.SYLLABLE[i] && !(pattern.EMPHASIS[i] || pattern.RHYME_A[i] || pattern.RHYME_B[i] || pattern.MULTI_SYLLABLE[i] || pattern.ADLIB_SLOT[i])) {
            pattern.PAUSE_SHORT[i] = 0; pattern.PAUSE_LONG[i] = 0;
        }
        if (pattern.PAUSE_LONG[i]) pattern.PAUSE_SHORT[i] = 0; // Long pause overrides short.
        if (pattern.ADLIB_SLOT[i]) {pattern.PAUSE_SHORT[i] = 0; pattern.PAUSE_LONG[i] = 0;} // Adlib clears pauses.
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
            if(Math.random() < 0.1) fillBarPattern.MULTI_SYLLABLE[step] = 1;
             if (fillBarPattern.EMPHASIS[step] || fillBarPattern.MULTI_SYLLABLE[step]) {
                fillBarPattern.SYLLABLE[step] = 1;
                fillBarPattern.PAUSE_SHORT[step] = 0; fillBarPattern.PAUSE_LONG[step] = 0;
            }
        }
    }
    // Attempt to make the fill slightly different
    if (style !== 'experimental-flow') {
        let fillSpecificSeed = Math.random(); // To make fill generation slightly different from main loop bars
        // Use a temporary object for the fill bar pattern to avoid modifying the main loop's singleBarPattern instance
        let tempFillBarPattern = createEmptyFlowPattern();
        FLOW_ELEMENTS.forEach(el => tempFillBarPattern[el] = createEmptyElementPattern(STEPS_PER_BAR));

        // It's important that singleBarGenFunc populates tempFillBarPattern, not singleBarPattern here
        singleBarGenFunc(tempFillBarPattern, fillSpecificSeed);

        // Example: Increase chance of MULTI_SYLLABLE or ADLIB_SLOT in the fill for some styles
        if (style === 'trap' || style === 'grime') {
            for(let step=0; step < STEPS_PER_BAR; step++){
                if(Math.random() < 0.2) tempFillBarPattern.MULTI_SYLLABLE[step] = 1;
                if(Math.random() < 0.1) tempFillBarPattern.ADLIB_SLOT[step] = 1;
            }
        } else if (style === 'boombap' || style === 'conscious') {
             for(let step=0; step < STEPS_PER_BAR; step++){
                if(Math.random() < 0.15) tempFillBarPattern.EMPHASIS[step] = 1; // More emphasis
            }
        }
        // Copy from tempFillBarPattern to fullPattern's fill section
        FLOW_ELEMENTS.forEach(el => {
            for (let step = 0; step < STEPS_PER_BAR; step++) {
                // Ensure fill section is clean before applying, then copy active steps
                fullPattern[el][fillBarOffset + step] = 0;
                if (tempFillBarPattern[el][step] === 1) {
                    fullPattern[el][fillBarOffset + step] = 1;
                }
            }
        });
    } else { // For experimental, the pattern is already fully generated for TOTAL_STEPS
        // No specific fill override needed here as experimental-flow generates all 4 bars at once.
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
    if (style !== 'experimental-flow' && style !== 'mumble') {
        const rhymeSchemeType = Math.random() < 0.5 ? 'AABB' : 'ABAB';
        const endOfBarPositions = [STEPS_PER_BAR-1, STEPS_PER_BAR*2-1, STEPS_PER_BAR*3-1, STEPS_PER_BAR*4-1];

        const clearRhymes = (barIndex) => {
            for(let i=0; i<STEPS_PER_BAR; i++) {
                fullPattern.RHYME_A[barIndex * STEPS_PER_BAR + i] = 0;
                fullPattern.RHYME_B[barIndex * STEPS_PER_BAR + i] = 0;
            }
        };
        const placeRhyme = (barIndex, rhymeType) => {
            let rhymePlaced = false;
            for (let step = STEPS_PER_BAR - 1; step >= 0; step--) {
                let currentGlobalStep = barIndex * STEPS_PER_BAR + step;
                if (fullPattern.SYLLABLE[currentGlobalStep] || fullPattern.EMPHASIS[currentGlobalStep] || fullPattern.MULTI_SYLLABLE[currentGlobalStep]) {
                    fullPattern[rhymeType][currentGlobalStep] = 1;
                    fullPattern.SYLLABLE[currentGlobalStep] = 1;
                    rhymePlaced = true;
                    break;
                }
            }
            if (!rhymePlaced) {
                 fullPattern[rhymeType][endOfBarPositions[barIndex]] = 1;
                 fullPattern.SYLLABLE[endOfBarPositions[barIndex]] = 1;
            }
        };

        for(let i=0; i<NUM_BARS; i++) clearRhymes(i);

        if (rhymeSchemeType === 'AABB') {
            placeRhyme(0, 'RHYME_A'); placeRhyme(1, 'RHYME_A');
            placeRhyme(2, 'RHYME_B'); placeRhyme(3, 'RHYME_B');
        } else { // ABAB
            placeRhyme(0, 'RHYME_A'); placeRhyme(1, 'RHYME_B');
            placeRhyme(2, 'RHYME_A'); placeRhyme(3, 'RHYME_B');
        }
    }


    // --- Flow Fusion Logic ---
    if (style === "flow-fusion" && fusionStyles.length === 2) {
        let pattern1_rhythm = createEmptyFlowPattern();
        let pattern2_pause_adlib = createEmptyFlowPattern();
        let fusionGen1, fusionGen2;

        switch (fusionStyles[0]) {
            case 'boombap': fusionGen1 = generateSingleBarBoomBapFlow; break;
            case 'trap': fusionGen1 = generateSingleBarTrapFlow; break;
            case 'mumble': fusionGen1 = generateSingleBarMumbleFlow; break;
            case 'conscious': fusionGen1 = generateSingleBarConsciousFlow; break;
            case 'grime': fusionGen1 = generateSingleBarGrimeFlow; break;
            default: fusionGen1 = generateSingleBarBoomBapFlow;
        }
        switch (fusionStyles[1]) {
            case 'boombap': fusionGen2 = generateSingleBarBoomBapFlow; break;
            case 'trap': fusionGen2 = generateSingleBarTrapFlow; break;
            case 'mumble': fusionGen2 = generateSingleBarMumbleFlow; break;
            case 'conscious': fusionGen2 = generateSingleBarConsciousFlow; break;
            case 'grime': fusionGen2 = generateSingleBarGrimeFlow; break;
            default: fusionGen2 = generateSingleBarTrapFlow;
        }

        for (let bar = 0; bar < NUM_BARS; bar++) {
            const barOffset = bar * STEPS_PER_BAR;
            let tempBar1 = createEmptyFlowPattern(); FLOW_ELEMENTS.forEach(el => tempBar1[el] = createEmptyElementPattern(STEPS_PER_BAR));
            let tempBar2 = createEmptyFlowPattern(); FLOW_ELEMENTS.forEach(el => tempBar2[el] = createEmptyElementPattern(STEPS_PER_BAR));

            fusionGen1(tempBar1);
            fusionGen2(tempBar2);

            for (let step = 0; step < STEPS_PER_BAR; step++) {
                ['SYLLABLE', 'EMPHASIS', 'MULTI_SYLLABLE', 'RHYME_A', 'RHYME_B'].forEach(el => {
                    if (tempBar1[el][step]) fullPattern[el][barOffset + step] = 1;
                    else fullPattern[el][barOffset + step] = 0;
                });
                ['PAUSE_SHORT', 'PAUSE_LONG', 'ADLIB_SLOT'].forEach(el => {
                     if (tempBar2[el][step]) fullPattern[el][barOffset + step] = 1;
                     else fullPattern[el][barOffset + step] = 0;
                });
            }
        }
        // The fill logic and rhyme scheme from the primary style (fusionStyles[0]) would ideally be reapplied here
        // For simplicity in this iteration, the fusion overwrites the previously generated fullPattern.
        // A more advanced fusion might selectively apply the fill from primary and rhymes too.
    }


    // Final cleanup: Ensure logical consistency
    for (let i = 0; i < TOTAL_STEPS; i++) {
        let hasActiveSyllableContent = fullPattern.SYLLABLE[i] || fullPattern.EMPHASIS[i] || fullPattern.RHYME_A[i] || fullPattern.RHYME_B[i] || fullPattern.MULTI_SYLLABLE[i];
        let isAdlib = fullPattern.ADLIB_SLOT[i];

        if (isAdlib) { // Adlib slot takes precedence and clears other syllable types and pauses
            fullPattern.SYLLABLE[i] = 0; fullPattern.EMPHASIS[i] = 0; fullPattern.RHYME_A[i] = 0; fullPattern.RHYME_B[i] = 0; fullPattern.MULTI_SYLLABLE[i] = 0;
            fullPattern.PAUSE_SHORT[i] = 0; fullPattern.PAUSE_LONG[i] = 0;
            hasActiveSyllableContent = false;
        }

        if (hasActiveSyllableContent) { // Any active syllable content clears pauses
            fullPattern.PAUSE_SHORT[i] = 0;
            fullPattern.PAUSE_LONG[i] = 0;
        } else if (fullPattern.PAUSE_LONG[i]) { // If no syllable content and long pause, clear short pause
            fullPattern.PAUSE_SHORT[i] = 0;
        }

        // Ensure EMPHASIS or RHYME implies a SYLLABLE if not MULTI_SYLLABLE or ADLIB_SLOT
        if ((fullPattern.EMPHASIS[i] || fullPattern.RHYME_A[i] || fullPattern.RHYME_B[i]) && !fullPattern.MULTI_SYLLABLE[i] && !isAdlib) {
            fullPattern.SYLLABLE[i] = 1;
        }

        // MULTI_SYLLABLE takes precedence over plain SYLLABLE (if not an adlib slot)
        if (fullPattern.MULTI_SYLLABLE[i] && !isAdlib) {
            fullPattern.SYLLABLE[i] = 0;
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
