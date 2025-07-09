import { generateFlowPattern, FLOW_ELEMENTS, ALL_RAP_STYLES_INCLUDING_SPECIAL, RAP_STYLE_SPEED_MAP, STEPS_PER_BAR, NUM_BARS, TOTAL_STEPS } from './flow_generator.js';

// --- Tone.js Synthesizer Setup for Audio Cues ---
// These synths provide simple auditory feedback during playback.
const mainClick = new Tone.PluckSynth({ // For regular syllables and rhymes
    attackNoise: 0.5,
    dampening: 4000,
    resonance: 0.7,
    release: 0.3,
}).toDestination();
mainClick.volume.value = -10;

const emphasisClick = new Tone.PluckSynth({ // For emphasized syllables
    attackNoise: 0.6,
    dampening: 3000,
    resonance: 0.6,
    release: 0.3,
}).toDestination();
emphasisClick.volume.value = -8;

const multiClick = new Tone.MembraneSynth({ // For multi-syllable bursts
    pitchDecay: 0.01,
    octaves: 3,
    oscillator: { type: "triangle" },
    envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.1 }
}).toDestination();
multiClick.volume.value = -12;


// --- DOM Element References ---
// Connections to the HTML elements for UI interaction.
const generateFlowButton = document.getElementById('generate-flow');
const rapStyleSelect = document.getElementById('rap-style-select');
const flowSpeedInput = document.getElementById('flow-speed-input'); // Changed from bpm-input
const playStopButton = document.getElementById('play-stop');
const randomizeStyleButton = document.getElementById('randomize-style');
const exportPatternButton = document.getElementById('export-pattern'); // Changed from export-midi
const flowGridDiv = document.getElementById('flow-grid'); // Changed from midi-grid
const playheadDiv = document.getElementById('playhead');

// --- Application State ---
let currentFlowPattern = null;
let isPlaying = false;
// TOTAL_STEPS, STEPS_PER_BAR, NUM_BARS are imported from flow_generator.js for consistency.

// --- Flow Grid Creation ---
// Dynamically builds the visual grid in HTML based on FLOW_ELEMENTS and step constants.
function createFlowGrid() {
    flowGridDiv.innerHTML = ''; // Clear existing grid before redrawing

    // Create Bar Indicator Row (displays "Bar 1", "Bar 2", etc.)
    const barIndicatorRow = document.createElement('div');
    barIndicatorRow.classList.add('bar-indicator-row');
    const emptyLabelCell = document.createElement('div');
    emptyLabelCell.classList.add('instrument-label', 'bar-header-empty');
    barIndicatorRow.appendChild(emptyLabelCell);

    for (let bar = 0; bar < NUM_BARS; bar++) {
        const barNumberDiv = document.createElement('div');
        barNumberDiv.classList.add('bar-number');
        barNumberDiv.textContent = `Bar ${bar + 1}`;
        barNumberDiv.style.gridColumn = `span ${STEPS_PER_BAR}`; // Makes each bar number span 16 step columns
        barIndicatorRow.appendChild(barNumberDiv);
    }
    flowGridDiv.appendChild(barIndicatorRow);

    // Create Rows for each Flow Element and their corresponding Step Cells
    FLOW_ELEMENTS.forEach(elementName => {
        const labelDiv = document.createElement('div');
        labelDiv.classList.add('instrument-label'); // Uses same styling as instrument labels in original app
        labelDiv.textContent = elementName.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase()); // Format for display (e.g., "Syllable Word")
        flowGridDiv.appendChild(labelDiv);

        for (let step = 0; step < TOTAL_STEPS; step++) {
            const stepDiv = document.createElement('div');
            stepDiv.classList.add('step');
            stepDiv.dataset.element = elementName;
            stepDiv.dataset.step = step;

            // Add a class for styling bar separator lines
            if ((step + 1) % STEPS_PER_BAR === 0 && step < TOTAL_STEPS - 1) {
                stepDiv.classList.add('bar-separator-step');
            }

            // Optional: Allow toggling steps manually.
            stepDiv.addEventListener('click', () => {
                if (currentFlowPattern) {
                    currentFlowPattern[elementName][step] = currentFlowPattern[elementName][step] === 1 ? 0 : 1; // Toggle state
                    stepDiv.classList.toggle('active');
                    // if (isPlaying) updatePlaybackLogic(); // If playback logic needs re-syncing
                }
            });
            flowGridDiv.appendChild(stepDiv);
        }
    });

    // Adjust playhead width and initial position based on rendered grid
    const firstStepCell = flowGridDiv.querySelector('.step');
    if (firstStepCell) {
        playheadDiv.style.width = `${firstStepCell.offsetWidth}px`;
    }
    const labelWidth = flowGridDiv.querySelector('.instrument-label')?.offsetWidth || 100; // Default if not rendered yet
    playheadDiv.style.transform = `translateX(${labelWidth}px)`;
    playheadDiv.style.opacity = '0'; // Start hidden until playback
}

// --- Update Visual Grid from Pattern Data ---
// Reflects the currentFlowPattern onto the visual grid by adding/removing 'active' classes.
function updateFlowVisualGrid() {
    if (!currentFlowPattern) return; // Do nothing if no pattern is loaded

    FLOW_ELEMENTS.forEach(elementName => {
        currentFlowPattern[elementName].forEach((isActive, step) => {
            const cell = flowGridDiv.querySelector(`.step[data-element='${elementName}'][data-step='${step}']`);
            if (cell) {
                if (isActive) {
                    cell.classList.add('active');
                    // Add specific class for styling based on element type (e.g., 'element-syllable')
                    cell.classList.add(`element-${elementName.toLowerCase().replace('_', '-')}`);
                } else {
                    cell.classList.remove('active');
                    cell.classList.remove(`element-${elementName.toLowerCase().replace('_', '-')}`); // Remove specific styling class
                }
            }
        });
    });
}

// --- Playback Logic ---
// Manages the visual playhead animation and triggers audio cues.
let playheadEventId = null; // Stores the ID of the scheduled Tone.Transport event for playhead updates.

// Sets up or resets the playhead animation using Tone.Transport.scheduleRepeat.
function setupPlayheadAnimation() {
    const stepWidth = flowGridDiv.querySelector('.step')?.offsetWidth || 15; // Width of a single step cell
    const labelWidth = flowGridDiv.querySelector('.instrument-label.bar-header-empty')?.offsetWidth ||
                       flowGridDiv.querySelector('.instrument-label')?.offsetWidth || 100; // Width of the flow element label column

    if (playheadEventId !== null) {
        Tone.Transport.clear(playheadEventId); // Clear previous animation schedule if any
    }

    // Schedule a repeating event synchronized with Tone.Transport's 16th note ticks.
    playheadEventId = Tone.Transport.scheduleRepeat(audioTime => {
        // Tone.Draw.schedule ensures visual updates are synchronized with the audio thread.
        Tone.Draw.schedule(() => {
            const transportProgress = Tone.Transport.progress; // Normalized progress (0-1) through the loop
            // Calculate playhead's X position based on progress and grid dimensions
            const calculatedPlayheadX = labelWidth + (transportProgress * (stepWidth * TOTAL_STEPS));
            playheadDiv.style.transform = `translateX(${calculatedPlayheadX}px)`;

            const currentGlobalStep = Math.floor(transportProgress * TOTAL_STEPS); // Determine which step the playhead is currently over

            // Highlight active steps under the playhead and trigger sounds
            document.querySelectorAll('.step.playing').forEach(cell => cell.classList.remove('playing')); // Clear previous highlights
            document.querySelectorAll(`.step[data-step='${currentGlobalStep}']`).forEach(cell => {
                if (cell.classList.contains('active')) {
                    cell.classList.add('playing'); // Highlight current step
                    const elementType = cell.dataset.element;
                    // Trigger corresponding sound based on the flow element type
                    if (elementType === 'EMPHASIS') {
                        emphasisClick.triggerAttackRelease("C4", "32n", audioTime);
                    } else if (elementType === 'MULTI_SYLLABLE') {
                        multiClick.triggerAttackRelease("G3", "32n", audioTime);
                    } else if (elementType === 'SYLLABLE' || elementType === 'RHYME_A' || elementType === 'RHYME_B') {
                        mainClick.triggerAttackRelease("C3", "32n", audioTime);
                    }
                }
            });
        }, audioTime);
    }, '16n'); // Update frequency: every 16th note
}


// --- Event Handlers ---
// Functions that respond to user interactions with UI elements.

// Handles the "Generate Flow" button click and randomization logic.
async function handleGenerateEvent(isRandomizeAllOnClick = false) {
    // Ensure Tone.js AudioContext is running (required for Transport and sounds)
    if (Tone.context.state !== 'running') {
        await Tone.start();
        console.log("AudioContext started by Tone.js for generation.");
    }

    let styleToGenerate = rapStyleSelect.value; // Get selected style from dropdown

    // If called from "Generate Flow" (isRandomizeAllOnClick = true), pick a random style.
    if (isRandomizeAllOnClick) {
        const availableStyles = ALL_RAP_STYLES_INCLUDING_SPECIAL.filter(s => s !== "flow-fusion");
        styleToGenerate = availableStyles[Math.floor(Math.random() * availableStyles.length)];
        rapStyleSelect.value = styleToGenerate; // Update dropdown to reflect the choice
    }

    let fusionPair = []; // For "Flow Fusion" style
    if (styleToGenerate === "flow-fusion") {
        let style1 = RAP_STYLE_LIST[Math.floor(Math.random() * RAP_STYLE_LIST.length)];
        let style2 = RAP_STYLE_LIST[Math.floor(Math.random() * RAP_STYLE_LIST.length)];
        while (style2 === style1) { // Ensure two different styles for fusion
            style2 = RAP_STYLE_LIST[Math.floor(Math.random() * RAP_STYLE_LIST.length)];
        }
        fusionPair = [style1, style2];
        console.log(`Flow Fusion selected: ${style1} (Rhythm) + ${style2} (Pauses/Adlibs)`);
    }

    currentFlowPattern = generateFlowPattern(styleToGenerate, fusionPair); // Generate the pattern
    updateFlowVisualGrid(); // Update the grid display
    updateSpeedForStyle(styleToGenerate, fusionPair.length > 0 ? fusionPair[0] : null); // Adjust speed based on genre

    // Auto-play if "Generate Flow" button initiated this
    if (isRandomizeAllOnClick && currentFlowPattern) {
        if (isPlaying) Tone.Transport.stop();
        Tone.Transport.position = 0; // Reset transport to the beginning
        Tone.Transport.start();
        isPlaying = true;
        playStopButton.textContent = 'Stop';
        playheadDiv.style.opacity = '0.5'; // Make playhead visible
        setupPlayheadAnimation(); // Start playhead animation
    }
}

// Handles the "Play/Stop" button.
function handlePlayStop() {
    if (!currentFlowPattern) { // If no pattern exists, generate one first
        handleGenerateEvent(false).then(() => {  // Generate with current settings, don't randomize all styles
            if (currentFlowPattern) toggleVisualPlayback();
        });
    } else {
        toggleVisualPlayback();
    }
}

// Toggles the playback state (visual and audio cues).
function toggleVisualPlayback() {
    if (isPlaying) {
        Tone.Transport.stop();
        playStopButton.textContent = 'Play';
        playheadDiv.style.opacity = '0'; // Hide playhead
        document.querySelectorAll('.step.playing').forEach(cell => cell.classList.remove('playing')); // Clear highlights
    } else {
        // Ensure Tone.js context is running before starting transport
        if (Tone.context.state !== 'running') {
            Tone.start().then(() => {
                console.log("AudioContext started by Tone.js for playback.");
                Tone.Transport.start();
            });
        } else {
            Tone.Transport.start();
        }
        playStopButton.textContent = 'Stop';
        playheadDiv.style.opacity = '0.5'; // Show playhead
        setupPlayheadAnimation(); // Start/restart playhead animation
    }
    isPlaying = !isPlaying; // Toggle state
}

// Handles changes to the "Flow Speed" input.
function handleFlowSpeedChange() {
    // The "Flow Speed" input directly controls Tone.Transport's BPM, affecting playhead speed.
    Tone.Transport.bpm.value = parseInt(flowSpeedInput.value, 10);
}

// Handles changes in the "Rap Style Select" dropdown.
function handleStyleChange() {
    const selectedStyle = rapStyleSelect.value;
    // Future: Could apply style-specific swing here (Tone.Transport.swing)
    updateSpeedForStyle(selectedStyle); // Update speed to match typical for the new style
    handleGenerateEvent(false); // Regenerate pattern for the newly selected style
}

// Updates the "Flow Speed" input based on typical speeds for the selected rap style.
function updateSpeedForStyle(style, fusionBaseStyle = null) {
    const styleForSpeedLookup = fusionBaseStyle || style; // For fusion, use the base rhythmic style for speed
    const styleSettings = RAP_STYLE_SPEED_MAP[styleForSpeedLookup];
    let newSpeed = 100; // Default fallback speed

    if (styleSettings) { // If settings exist for the style
        if (styleSettings.range && styleSettings.range.length === 2) { // Pick a random speed from the defined range
            newSpeed = Math.floor(Math.random() * (styleSettings.range[1] - styleSettings.range[0] + 1)) + styleSettings.range[0];
        } else {
            newSpeed = styleSettings.default; // Use default if no range
        }
    } else if (style === "flow-fusion" && !fusionBaseStyle) { // Fallback for "Flow Fusion" itself if no base style
        newSpeed = RAP_STYLE_SPEED_MAP["flow-fusion"].default;
    }

    flowSpeedInput.value = newSpeed; // Update the input field
    Tone.Transport.bpm.value = newSpeed; // Update Tone.js transport BPM
}

// Handles the "Export Pattern (Text)" button.
function handleExportPattern() {
    if (!currentFlowPattern) {
        alert("Please generate a flow pattern first.");
        return;
    }
    // Format the pattern data into a readable string
    let textOutput = `Rap Flow Pattern - Style: ${rapStyleSelect.value} - Speed: ${flowSpeedInput.value}\n`;
    textOutput += "--------------------------------------------------\n";
    FLOW_ELEMENTS.forEach(element => {
        textOutput += `${element.padEnd(16)}: `;
        for (let step = 0; step < TOTAL_STEPS; step++) {
            textOutput += currentFlowPattern[element][step] === 1 ? 'X' : '.'; // 'X' for active, '.' for inactive
            if ((step + 1) % STEPS_PER_BAR === 0 && step < TOTAL_STEPS - 1) {
                textOutput += ' | '; // Bar separator
            } else if ((step + 1) % 4 === 0) { // Beat separator (every 4 steps)
                textOutput += ' ';
            }
        }
        textOutput += '\n';
    });
    textOutput += "--------------------------------------------------\n";

    // Create a Blob and trigger download
    const blob = new Blob([textOutput], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `rap-flow-${rapStyleSelect.value}-${flowSpeedInput.value}.txt`; // Filename
    document.body.appendChild(a);
    a.click(); // Simulate click to download
    document.body.removeChild(a); // Clean up the link element
    URL.revokeObjectURL(url); // Release the object URL
}


// --- Initialization ---
// Sets up the application when the DOM is ready.
function init() {
    createFlowGrid(); // Build the visual grid
    Tone.Transport.loop = true; // Enable looping for playback
    Tone.Transport.loopEnd = `${NUM_BARS}m`; // Set loop duration (e.g., "4m" for 4 measures)
    Tone.Transport.bpm.value = parseInt(flowSpeedInput.value, 10); // Set initial BPM

    // Attach event listeners to UI elements
    generateFlowButton.addEventListener('click', () => handleGenerateEvent(true)); // "Generate Flow" randomizes all
    playStopButton.addEventListener('click', handlePlayStop);
    flowSpeedInput.addEventListener('change', handleFlowSpeedChange);
    flowSpeedInput.addEventListener('input', handleFlowSpeedChange); // Update on every input change for responsiveness
    rapStyleSelect.addEventListener('change', handleStyleChange);
    exportPatternButton.addEventListener('click', handleExportPattern);

    // "Randomize Current Style" button: Regenerates pattern for current style with new random params
    randomizeStyleButton.addEventListener('click', async () => {
        if (Tone.context.state !== 'running') await Tone.start();

        const currentSelectedStyle = rapStyleSelect.value;
        updateSpeedForStyle(currentSelectedStyle); // Get a new random speed for this style

        // Regenerate the pattern for the *currently selected style* with new random variations.
        await handleGenerateEvent(false); // 'false' means don't pick a new random style from the list.

        if (currentFlowPattern) { // Auto-play the newly randomized pattern
            if (isPlaying) Tone.Transport.stop();
            Tone.Transport.position = 0;
            Tone.Transport.start();
            isPlaying = true;
            playStopButton.textContent = 'Stop';
            playheadDiv.style.opacity = '0.5';
            setupPlayheadAnimation();
        }
    });

    // Generate an initial pattern on page load
    updateSpeedForStyle(rapStyleSelect.value); // Set initial speed based on default selected style
    handleStyleChange(); // This will trigger generation of the initial pattern

    // Handle window resize to keep playhead dimensions correct
    window.addEventListener('resize', () => {
        const firstStepCell = flowGridDiv.querySelector('.step');
        if (firstStepCell) {
            playheadDiv.style.width = `${firstStepCell.offsetWidth}px`; // Adjust playhead line width
        }
        // If playing, re-initialize playhead animation to use new dimensions
        if (isPlaying) {
            if (playheadEventId !== null) {
                Tone.Transport.clear(playheadEventId);
                playheadEventId = null;
            }
            setupPlayheadAnimation();
        } else { // If stopped, still update initial transform in case labels resized
            const labelWidth = flowGridDiv.querySelector('.instrument-label.bar-header-empty')?.offsetWidth ||
                               flowGridDiv.querySelector('.instrument-label')?.offsetWidth || 100;
            playheadDiv.style.transform = `translateX(${labelWidth}px)`;
        }
    });
    console.log("Rap Flow Idea Generator Initialized. Tone.js version:", Tone.version);
}

// Start the application after the DOM is fully loaded.
document.addEventListener('DOMContentLoaded', init);
