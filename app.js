import { generatePattern, GENRE_LIST, INSTRUMENTS as INSTRUMENT_NAMES, GENRE_BPM_MAP } from './generator.js';

// --- Tone.js Synthesizer Setup ---
const synths = {
    kick: new Tone.MembraneSynth({
        pitchDecay: 0.03,
        octaves: 6,
        oscillator: { type: 'fmsine' },
        envelope: { attack: 0.001, decay: 0.3, sustain: 0.01, release: 0.2 }
    }).toDestination(),
    snare: {
        noise: new Tone.NoiseSynth({
            noise: { type: 'pink' },
            envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.1 }
        }).toDestination(),
        membrane: new Tone.MembraneSynth({ // Adds body to the snare
            pitchDecay: 0.08,
            octaves: 5,
            oscillator: {type: "sine"},
            envelope: {attack: 0.002, decay: 0.1, sustain: 0, release: 0.05}
        }).toDestination()
    },
    hiHat: new Tone.NoiseSynth({ // Closed Hi-Hat
        noise: { type: 'white' },
        envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.03 },
        filter: new Tone.Filter(8000, "highpass")
    }).toDestination(),
    crash: new Tone.MetalSynth({ // Crash Cymbal
        frequency: 150,
        envelope: { attack: 0.002, decay: 1.5, release: 2 },
        harmonicity: 4.1,
        modulationIndex: 20,
        resonance: 3000,
        octaves: 1.2
    }).toDestination(),
    tom: new Tone.MembraneSynth({ // Tom
        pitchDecay: 0.08,
        octaves: 4,
        oscillator: { type: 'sine' },
        envelope: { attack: 0.005, decay: 0.25, sustain: 0.01, release: 0.1 },
        volume: -6 // Toms can be loud
    }).toDestination()
};
// Connect snare components (noise synth already connected)
// synths.snare.noise.connect(synths.snare.membrane); // This is incorrect, synths don't have inputs. They are triggered in parallel.
// Initial volume settings (can be adjusted further based on testing)
// Aiming for snare to be more prominent. Kick around -3dB to -0dB as a reference.
// Snare components will be boosted. Other elements might be slightly reduced to create headroom.

synths.kick.volume.value = -2; // Kick slightly less than max to leave room

synths.snare.membrane.volume.value = -5;    // Significantly boosted membrane for more body
synths.snare.noise.volume.value = -2;      // Significantly boosted noise for more snap, matching kick level

synths.hiHat.volume.value = -20;      // Hi-hats significantly quieter
// synths.hiHat.filter.Q.value = 1; // Default Q is 1, can increase for more resonance if needed

synths.crash.volume.value = -12;       // Crashes also slightly more controlled

synths.tom.volume.value = -9;          // Toms boosted slightly relative to previous


// --- DOM Element References ---
const generateButton = document.getElementById('generate-all');
const genreSelect = document.getElementById('genre-select');
const bpmInput = document.getElementById('bpm-input');
const playStopButton = document.getElementById('play-stop');
const randomizeGenreButton = document.getElementById('randomize-genre'); // New button reference
const exportMidiButton = document.getElementById('export-midi');
const exportWavButton = document.getElementById('export-wav');
const midiGridDiv = document.getElementById('midi-grid');
const playheadDiv = document.getElementById('playhead');

// --- Application State ---
let currentPattern = null;
let isPlaying = false;
const STEPS_PER_BAR = 16;
const NUM_BARS = 4;
const TOTAL_STEPS = STEPS_PER_BAR * NUM_BARS; // 64 steps
const instrumentParts = {}; // To hold Tone.Part for each instrument

// --- MIDI Grid Creation ---
function createMidiGrid() {
    midiGridDiv.innerHTML = ''; // Clear existing grid

    // Create Bar Indicator Row
    const barIndicatorRow = document.createElement('div');
    barIndicatorRow.classList.add('bar-indicator-row');
    const emptyLabelCell = document.createElement('div'); // For alignment with instrument labels
    emptyLabelCell.classList.add('instrument-label', 'bar-header-empty');
    barIndicatorRow.appendChild(emptyLabelCell);

    for (let bar = 0; bar < NUM_BARS; bar++) {
        const barNumberDiv = document.createElement('div');
        barNumberDiv.classList.add('bar-number');
        barNumberDiv.textContent = `Bar ${bar + 1}`;
        barNumberDiv.style.gridColumn = `span ${STEPS_PER_BAR}`;
        barIndicatorRow.appendChild(barNumberDiv);
    }
    midiGridDiv.appendChild(barIndicatorRow);

    // Create Instrument Rows and Step Cells
    INSTRUMENT_NAMES.forEach(instrumentName => {
        const labelDiv = document.createElement('div');
        labelDiv.classList.add('instrument-label');
        labelDiv.textContent = instrumentName.charAt(0).toUpperCase() + instrumentName.slice(1);
        midiGridDiv.appendChild(labelDiv);

        for (let step = 0; step < TOTAL_STEPS; step++) { // Use TOTAL_STEPS
            const stepDiv = document.createElement('div');
            stepDiv.classList.add('step');
            stepDiv.dataset.instrument = instrumentName;
            stepDiv.dataset.step = step;

            // Add class for bar separator lines (on the right edge of steps 15, 31, 47)
            if ((step + 1) % STEPS_PER_BAR === 0 && step < TOTAL_STEPS - 1) {
                stepDiv.classList.add('bar-separator-step');
            }

            // Allow toggling steps manually (optional, but good for interaction)
            stepDiv.addEventListener('click', () => {
                if (currentPattern) {
                    currentPattern[instrumentName][step] = currentPattern[instrumentName][step] === 1 ? 0 : 1;
                    stepDiv.classList.toggle('active');
                    updateToneParts(); // Re-sync Tone.js if manually changed
                }
            });
            midiGridDiv.appendChild(stepDiv);
        }
    });
    // Calculate playhead width per step
    const firstStepCell = midiGridDiv.querySelector('.step');
    if (firstStepCell) {
        playheadDiv.style.width = `${firstStepCell.offsetWidth}px`;
        // Opacity is now handled by play/stop logic directly for initial show/hide
    }
    // Initial playhead position needs to be set considering the label width
    const labelWidth = midiGridDiv.querySelector('.instrument-label')?.offsetWidth || 80;
    playheadDiv.style.transform = `translateX(${labelWidth}px)`;
    playheadDiv.style.opacity = '0'; // Start hidden
}

// --- Update Visual Grid from Pattern Data ---
function updateVisualGrid() {
    if (!currentPattern) return;
    INSTRUMENT_NAMES.forEach(instrumentName => {
        currentPattern[instrumentName].forEach((isActive, step) => {
            const cell = midiGridDiv.querySelector(`.step[data-instrument='${instrumentName}'][data-step='${step}']`);
            if (cell) {
                if (isActive) cell.classList.add('active');
                else cell.classList.remove('active');
            }
        });
    });
}

// --- Tone.js Playback Setup ---
function updateToneParts() {
    if (!currentPattern) return;

    // Clear existing parts
    Object.values(instrumentParts).forEach(part => part.dispose());
    Tone.Transport.cancel(0); // Clear any scheduled events

    INSTRUMENT_NAMES.forEach(instrumentName => {
        const partData = [];
        currentPattern[instrumentName].forEach((isActive, step) => {
            if (isActive) {
                // Calculate time correctly for 64 steps
                const bar = Math.floor(step / STEPS_PER_BAR);
                const beatInBar = Math.floor((step % STEPS_PER_BAR) / 4);
                const sixteenthInBeat = step % 4;
                partData.push({ time: `${bar}:${beatInBar}:${sixteenthInBeat}` });
            }
        });

        instrumentParts[instrumentName] = new Tone.Part((time) => {
            if (instrumentName === 'snare') {
                synths.snare.noise.triggerAttackRelease(time);
                synths.snare.membrane.triggerAttackRelease("C2", "16n", time + 0.001); // membrane slightly delayed
            } else {
                // Default trigger for MembraneSynths (kick, tom)
                let note = 'C2'; // Default kick/tom pitch
                let duration = '16n';
                if(instrumentName === 'tom') note = 'G2'; // Higher pitch for tom
                if(instrumentName === 'crash') duration = '1n'; // Longer release for crash

                if (synths[instrumentName] instanceof Tone.MembraneSynth || synths[instrumentName] instanceof Tone.MetalSynth) {
                     synths[instrumentName].triggerAttackRelease(note, duration, time);
                } else if (synths[instrumentName] instanceof Tone.NoiseSynth) { // hiHat
                     synths[instrumentName].triggerAttackRelease(time);
                }
            }
        }, partData).start(0);
        instrumentParts[instrumentName].loop = true;
        instrumentParts[instrumentName].loopEnd = `${NUM_BARS}m`; // Loop for NUM_BARS measures (e.g., '4m')
    });
}


// --- Playhead Visualization ---
let playheadEventId = null;
function setupPlayhead() {
    const stepWidth = midiGridDiv.querySelector('.step')?.offsetWidth || 15; // Updated fallback
    const labelWidth = midiGridDiv.querySelector('.instrument-label.bar-header-empty')?.offsetWidth || // Use the empty header cell for consistent width
                       midiGridDiv.querySelector('.instrument-label')?.offsetWidth || 80;


    if (playheadEventId !== null) {
        Tone.Transport.clear(playheadEventId);
    }

    playheadEventId = Tone.Transport.scheduleRepeat(audioTime => { // Renamed 'time' to 'audioTime' for clarity
        Tone.Draw.schedule(() => {
            // const currentTick = Tone.Transport.ticks;
            // const totalTicksInLoop = Tone.Transport.PPQ * 4 * NUM_BARS;
            // const loopProgressOld = (currentTick % totalTicksInLoop) / totalTicksInLoop; // Progress within the current loop iteration

            // Use Tone.Transport.progress for potentially more direct synchronization
            const transportProgress = Tone.Transport.progress; // This is normalized 0-1 over the loop duration

            const calculatedPlayheadX = labelWidth + (transportProgress * (stepWidth * TOTAL_STEPS));
            playheadDiv.style.transform = `translateX(${calculatedPlayheadX}px)`;

            const currentGlobalStep = Math.floor(transportProgress * TOTAL_STEPS);

            // Logging
            // console.log(`AudioTime: ${audioTime.toFixed(4)}, TransportProgress: ${transportProgress.toFixed(4)}, CalcX: ${calculatedPlayheadX.toFixed(2)}, Step: ${currentGlobalStep}, Actual StepWidth: ${midiGridDiv.querySelector('.step')?.offsetWidth}`);


            document.querySelectorAll('.step.playing').forEach(cell => cell.classList.remove('playing'));
            document.querySelectorAll(`.step[data-step='${currentGlobalStep}']`).forEach(cell => {
                if (cell.classList.contains('active')) {
                    cell.classList.add('playing');
                }
            });

        }, audioTime); // Use the audioTime passed by scheduleRepeat
    }, '16n'); // Update every 16th note
}


// --- Event Handlers ---
async function handleGenerate() {
    await Tone.start(); // Ensure AudioContext is running

    let genreToGenerate = genreSelect.value;
    let fusionPair = [];
    // This flag indicates if handleGenerate was called by the "Generate All" button,
    // which is now passed via handleGenerateWrapper.
    // We'll use this to decide if we need to pick a random genre.
    // The autoPlay parameter in handleGenerateWrapper serves a dual purpose now:
    // 1. Trigger auto-play
    // 2. Indicate that "Generate All" was the source, thus potentially randomizing genre.

    // The first argument to handleGenerate is now `isGenerateAllContext`
    const isGenerateAllClick = arguments.length > 0 && arguments[0] === true;

    if (isGenerateAllClick) {
        // "Generate All" button was clicked, so pick a random base genre.
        const randomBaseGenreIndex = Math.floor(Math.random() * GENRE_LIST.length);
        genreToGenerate = GENRE_LIST[randomBaseGenreIndex];
        genreSelect.value = genreToGenerate; // Update dropdown to reflect the randomly chosen genre
    }
    // If not from "Generate All", genreToGenerate remains genreSelect.value (i.e., what user manually selected)

    if (genreToGenerate === "genre-fusion") {
        // This block will now only be entered if the user *manually* selected "Genre Fusion"
        // from the dropdown and then either hit play (if no pattern) or it was triggered by genre change.
        // "Generate All" now bypasses "genre-fusion" and "experimental" for direct generation.
        let genre1 = GENRE_LIST[Math.floor(Math.random() * GENRE_LIST.length)];
        let genre2 = GENRE_LIST[Math.floor(Math.random() * GENRE_LIST.length)];
        while (genre2 === genre1) {
            genre2 = GENRE_LIST[Math.floor(Math.random() * GENRE_LIST.length)];
        }
        fusionPair = [genre1, genre2];
        console.log(`Fusion selected: ${genre1} (K/S) + ${genre2} (HH/C/T)`);
        // The dropdown already shows "genre-fusion" because the user selected it.
        // genreToGenerate is correctly "genre-fusion" for generatePattern()
    }
    // If genreToGenerate is "experimental" (manually selected by user), it will also pass through.

    currentPattern = generatePattern(genreToGenerate, fusionPair);
    updateVisualGrid();
    updateToneParts();

    // Update BPM for the genre that was actually used for generation.
    let genreForBpmUpdate = genreToGenerate;
    if (genreToGenerate === "genre-fusion" && fusionPair.length > 0) {
        genreForBpmUpdate = fusionPair[0]; // Use first genre of fusion pair for BPM
    } else if (genreToGenerate === "genre-fusion") { // Fallback if fusion pair empty (shouldn't happen)
        genreForBpmUpdate = "house";
    }
    // If genreToGenerate was a random one from "Generate All", it's already set correctly.
    updateBpmForGenre(genreForBpmUpdate);
}


// The main logic is now inside handleGenerateWrapper's call to the modified handleGenerate.

function handlePlayStop() {
    if (!currentPattern) { // Generate a pattern first if none exists
        handleGenerateWrapper(false).then(() => { // isGenerateAllContext = false
             if (currentPattern) togglePlayback();
        });
    } else {
        togglePlayback();
    }
}

function togglePlayback() {
    if (isPlaying) {
        Tone.Transport.stop();
        playStopButton.textContent = 'Play';
        playheadDiv.style.opacity = '0'; // Hide playhead when stopped
        document.querySelectorAll('.step.playing').forEach(cell => cell.classList.remove('playing'));
    } else {
        Tone.Transport.start(); // Restart from the beginning
        playStopButton.textContent = 'Stop';
        playheadDiv.style.opacity = '0.5'; // Show playhead
        setupPlayhead(); // Restart playhead scheduling
    }
    isPlaying = !isPlaying;
}

// Wrapper for handleGenerate to manage autoPlay flag and context
async function handleGenerateWrapper(isGenerateAllContext = false) { // Renamed autoPlay to isGenerateAllContext
    await handleGenerate(isGenerateAllContext); // Pass the context flag

    if (isGenerateAllContext && currentPattern) { // Auto-play if "Generate All"
        if (isPlaying) {
            Tone.Transport.stop();
        }
        Tone.Transport.position = 0; // Restart from the beginning
        Tone.Transport.start();
        isPlaying = true;
        playStopButton.textContent = 'Stop';
        playheadDiv.style.opacity = '0.5';
        setupPlayhead();
    }
}


function handleBpmChange() {
    Tone.Transport.bpm.value = parseInt(bpmInput.value, 10);
}

function handleGenreChange() {
    const selectedGenre = genreSelect.value;
    if (selectedGenre === 'jazz') {
        Tone.Transport.swing = 0.5; // Apply swing for Jazz
    } else {
        Tone.Transport.swing = 0; // No swing for others
    }
    updateBpmForGenre(selectedGenre);
    handleGenerateWrapper(false); // Do not auto-play on manual genre change
}

// --- BPM Update Function ---
function updateBpmForGenre(genre) {
    const genreSettings = GENRE_BPM_MAP[genre];
    let newBpm = 120; // Default fallback

    if (genreSettings) {
        // Select a random BPM from the range if available, otherwise use default
        if (genreSettings.range && genreSettings.range.length === 2) {
            newBpm = Math.floor(Math.random() * (genreSettings.range[1] - genreSettings.range[0] + 1)) + genreSettings.range[0];
        } else {
            newBpm = genreSettings.default;
        }
    }
    bpmInput.value = newBpm;
    Tone.Transport.bpm.value = newBpm;
}


// --- Export Functions ---
function exportMIDI() {
    if (!currentPattern) {
        alert("Please generate a pattern first.");
        return;
    }

    const track = new MidiWriter.Track();
    track.setTempo(Tone.Transport.bpm.value);

    // MIDI instrument mapping (General MIDI Percussion Key Map)
    // Using channel 10 (usually percussion channel)
    const instrumentMidiNotes = {
        kick: 36,   // Acoustic Bass Drum
        snare: 38,  // Acoustic Snare
        hiHat: 42,  // Closed Hi-Hat
        crash: 49,  // Crash Cymbal 1
        tom: 45     // Low Tom
    };

    INSTRUMENT_NAMES.forEach(instrumentName => {
        const midiNote = instrumentMidiNotes[instrumentName];
        if(midiNote === undefined) return; // Skip if no MIDI note defined

        const events = [];
        currentPattern[instrumentName].forEach((isActive, step) => {
            if (isActive) {
                // Calculate ticks based on TOTAL_STEPS for a 4-bar loop
                // Each step is a 16th note. Tone.Transport.PPQ is ticks per quarter note.
                // So, ticks per 16th note = Tone.Transport.PPQ / 4.
                // startTimeTicks = step * (Tone.Transport.PPQ / 4)
                // However, MidiWriter's startTick is often based on a PPQ defined for the track.
                // If MidiWriter's default PPQ (often 128 or higher) is different from Tone's, direct scaling might be needed.
                // For simplicity, let's assume MidiWriter uses a PPQ where '16' duration means a 16th note.
                // The startTick needs to be scaled according to the number of 16th notes.
                // Each bar has 16 sixteenths. Total sixteenths = TOTAL_STEPS.
                // If Tone.Transport.PPQ is, for example, 192 (default for Tone.js), then a 16th note is 192/4 = 48 ticks.
                // MidiWriter.NoteEvent startTick expects absolute ticks from the start of the track.
                const ticksPerSixteenth = Tone.Transport.PPQ / 4;
                const startTimeTicks = step * ticksPerSixteenth;

                 events.push(new MidiWriter.NoteEvent({
                    pitch: [midiNote],
                    duration: '16', // 16th note duration (MidiWriter format)
                    startTick: startTimeTicks,
                    channel: 10 // Percussion channel
                }));
            }
        });
        track.addEvent(events, (event, index) => ({
            sequential: false // Add events based on their startTick
        }));
    });

    const write = new MidiWriter.Writer([track]);
    const blob = new Blob([write.buildFile()], { type: 'audio/midi' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `drum-pattern-${genreSelect.value}-${bpmInput.value}bpm.mid`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

async function exportWAV() {
    if (!currentPattern) {
        alert("Please generate a pattern first.");
        return;
    }
    if (isPlaying) {
        alert("Please stop playback before exporting WAV.");
        return;
    }

    playStopButton.disabled = true; // Disable controls during render
    exportWavButton.textContent = "Rendering...";

    try {
        const buffer = await Tone.Offline(async (offlineTransport) => {
            // Setup synths and parts within the offline context
            const offlineSynths = { // Recreate synths for offline context
                kick: new Tone.MembraneSynth().toDestination(),
                snare: {
                    noise: new Tone.NoiseSynth({envelope: {decay:0.15}}).toDestination(),
                    membrane: new Tone.MembraneSynth({envelope: {decay:0.1}}).toDestination()
                },
                hiHat: new Tone.NoiseSynth({envelope: {decay:0.05}, filter: new Tone.Filter(8000, "highpass")}).toDestination(),
                crash: new Tone.MetalSynth({envelope: {decay:1.5}}).toDestination(),
                tom: new Tone.MembraneSynth({envelope: {decay:0.25}}).toDestination()
            };
            // offlineSynths.snare.noise.connect(offlineSynths.snare.membrane); // This is incorrect
            // Apply similar volume adjustments to offline synths
            offlineSynths.kick.volume.value = -2;
            offlineSynths.snare.membrane.volume.value = -5; // Matched to live synth
            offlineSynths.snare.noise.volume.value = -2;    // Matched to live synth
            offlineSynths.hiHat.volume.value = -20; // Matched to live synth
            offlineSynths.crash.volume.value = -12; // Matched to live synth
            offlineSynths.tom.volume.value = -9;


            INSTRUMENT_NAMES.forEach(instrumentName => {
                const partData = [];
                currentPattern[instrumentName].forEach((isActive, step) => {
                    if (isActive) partData.push(`0:0:${step}`);
                });

                new Tone.Part((time) => {
                     if (instrumentName === 'snare') {
                        offlineSynths.snare.noise.triggerAttackRelease(time);
                        offlineSynths.snare.membrane.triggerAttackRelease("C2", "16n", time + 0.001);
                    } else {
                        let note = 'C2'; let duration = '16n';
                        if(instrumentName === 'tom') note = 'G2';
                        if(instrumentName === 'crash') duration = '1n';
                        if (offlineSynths[instrumentName] instanceof Tone.MembraneSynth || offlineSynths[instrumentName] instanceof Tone.MetalSynth) {
                             offlineSynths[instrumentName].triggerAttackRelease(note, duration, time);
                        } else if (offlineSynths[instrumentName] instanceof Tone.NoiseSynth) {
                             offlineSynths[instrumentName].triggerAttackRelease(time);
                        }
                    }
                }, partData).start(0).loop = false; // No loop for offline render of one bar
            });
            offlineTransport.bpm.value = Tone.Transport.bpm.value;
            offlineTransport.swing = Tone.Transport.swing; // Apply swing if active
            offlineTransport.start();
        }, Tone.Time(`${NUM_BARS}m`).toSeconds()); // Render for the duration of NUM_BARS measures

        // Convert AudioBuffer to WAV
        const wavBlob = audioBufferToWav(buffer);
        const url = URL.createObjectURL(wavBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `drum-pattern-${genreSelect.value}-${bpmInput.value}bpm.wav`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

    } catch (e) {
        console.error("Error rendering WAV:", e);
        alert("Could not export WAV. See console for details.");
    } finally {
        playStopButton.disabled = false;
        exportWavButton.textContent = "Export WAV";
    }
}

// Helper function: AudioBuffer to WAV (from standard web examples)
function audioBufferToWav(buffer) {
    let numOfChan = buffer.numberOfChannels,
        len = buffer.length * numOfChan * 2 + 44,
        abuffer = new ArrayBuffer(len),
        view = new DataView(abuffer),
        channels = [], i, sample,
        offset = 0,
        pos = 0;

    // write WAV container
    setUint32(0x46464952); // "RIFF"
    setUint32(len - 8); // file length - 8
    setUint32(0x45564157); // "WAVE"

    setUint32(0x20746d66); // "fmt " chunk
    setUint32(16); // length = 16
    setUint16(1); // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(buffer.sampleRate);
    setUint32(buffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2); // block-align
    setUint16(16); // 16-bit track

    setUint32(0x61746164); // "data" - chunk
    setUint32(len - pos - 4); // chunk length

    // write interleaved data
    for (i = 0; i < buffer.numberOfChannels; i++)
        channels.push(buffer.getChannelData(i));

    while (pos < len) {
        for (i = 0; i < numOfChan; i++) { // interleave channels
            sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767) | 0; // scale to 16-bit signed int
            view.setInt16(pos, sample, true); // write 16-bit sample
            pos += 2;
        }
        offset++; // next source sample
        if (offset >= buffer.length) break; // Check to prevent reading past buffer length
    }

    function setUint16(data) {
        view.setUint16(pos, data, true);
        pos += 2;
    }

    function setUint32(data) {
        view.setUint32(pos, data, true);
        pos += 4;
    }
    return new Blob([view], {type: 'audio/wav'});
}


// --- Initialization ---
function init() {
    createMidiGrid();
    Tone.Transport.loop = true;
    Tone.Transport.loopEnd = `${NUM_BARS}m`; // Set loop end for NUM_BARS measures
    Tone.Transport.bpm.value = parseInt(bpmInput.value, 10);

    generateButton.addEventListener('click', () => handleGenerateWrapper(true)); // isGenerateAllContext = true (random genre, auto-play)
    playStopButton.addEventListener('click', handlePlayStop);
    bpmInput.addEventListener('change', handleBpmChange);
    bpmInput.addEventListener('input', handleBpmChange); // For more responsive BPM update
    genreSelect.addEventListener('change', handleGenreChange);
    exportMidiButton.addEventListener('click', exportMIDI);
    exportWavButton.addEventListener('click', exportWAV);

    randomizeGenreButton.addEventListener('click', async () => {
        await Tone.start(); // Ensure audio context is running
        const currentGenre = genreSelect.value;

        // Update BPM for the current genre (will pick a random one from its range)
        updateBpmForGenre(currentGenre);

        // Generate pattern for the current genre (isGenerateAllContext = false, so it uses selected genre)
        await handleGenerate(false);

        // Auto-play logic (similar to what's in handleGenerateWrapper)
        if (currentPattern) {
            if (isPlaying) {
                Tone.Transport.stop();
            }
            Tone.Transport.position = 0; // Restart from the beginning
            Tone.Transport.start();
            isPlaying = true;
            playStopButton.textContent = 'Stop';
            playheadDiv.style.opacity = '0.5';
            setupPlayhead();
        }
    });

    // Generate an initial pattern on load
    updateBpmForGenre(genreSelect.value); // Set initial BPM based on default selected genre
    handleGenreChange(); // This will call handleGenerate

    // Adjust playhead related calculations on window resize
    window.addEventListener('resize', () => {
        // Recalculate and set the visual width of the playhead line/bar itself
        const firstStepCell = midiGridDiv.querySelector('.step');
        if (firstStepCell) {
            playheadDiv.style.width = `${firstStepCell.offsetWidth}px`;
        }

        // If playing, the playhead's movement calculation needs to be updated
        // with the new step and label widths.
        // Clearing and re-scheduling setupPlayhead will ensure it uses fresh measurements.
        if (isPlaying) {
            if (playheadEventId !== null) {
                Tone.Transport.clear(playheadEventId);
                playheadEventId = null; // Important to nullify before recall
            }
            setupPlayhead(); // Re-initialize with new dimensions
        } else {
            // If stopped, still update the initial transform in case labels resized
            const labelWidth = midiGridDiv.querySelector('.instrument-label.bar-header-empty')?.offsetWidth ||
                               midiGridDiv.querySelector('.instrument-label')?.offsetWidth || 80;
            playheadDiv.style.transform = `translateX(${labelWidth}px)`;
        }
    });
    console.log("Drum Machine Initialized. Tone.js version:", Tone.version);
}

// Start the application after DOM is ready
document.addEventListener('DOMContentLoaded', init);
