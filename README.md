# Rap Flow Idea Generator

This web application procedurally generates ideas for rap flow patterns. Users can select different rap subgenres (styles) to influence the generated patterns, visualize them on a grid, and get simple audio cues during playback.

## Features

*   **Multiple Rap Styles**: Generate flow patterns inspired by styles like:
    *   Boom Bap
    *   Trap
    *   Mumble
    *   Conscious
    *   Grime
    *   Experimental (highly random)
    *   Flow Fusion (combines elements from two styles)
*   **Visual Grid**: Displays the generated flow pattern across 4 bars (64 steps). Each row represents a different "flow element":
    *   `SYLLABLE`: A regular spoken syllable.
    *   `PAUSE_SHORT`: A brief pause.
    *   `PAUSE_LONG`: A longer pause.
    *   `EMPHASIS`: A stressed/accented syllable.
    *   `RHYME_A` / `RHYME_B`: Placeholders for syllables in different rhyme groups (AABB or ABAB scheme applied).
    *   `MULTI_SYLLABLE`: Represents a rapid burst of syllables (e.g., triplets).
    *   `ADLIB_SLOT`: A designated spot for an ad-lib.
*   **Playback with Audio Cues**: A playhead moves across the grid, and simple click sounds are triggered for syllables, emphasis, and multi-syllable bursts to provide a rhythmic feel.
*   **Controls**:
    *   **Generate Flow**: Generates a new flow pattern, picking a random style and speed.
    *   **Rap Style Select**: Choose a specific rap style to generate.
    *   **Randomize Current Style**: Keeps the selected style but generates a new pattern with randomized speed and internal variations.
    *   **Flow Speed**: Adjust the tempo of the playback (visual and audio cues).
    *   **Play/Stop**: Control playback of the visual pattern and audio cues.
    *   **Export Pattern (Text)**: Download the current pattern as a formatted text file.
*   **Dynamic Fill Generation**: The last bar of the 4-bar pattern is generated with slight variations to act as a "fill" or switch-up.
*   **Rhyme Scheme Application**: For most styles, an AABB or ABAB rhyme scheme is applied across the 4 bars.

## How It Works

The generator uses JavaScript and the Tone.js library for timing and basic audio.

1.  **`flow_generator.js`**: Contains the core logic for generating patterns.
    *   Defines `FLOW_ELEMENTS` and constants for musical timing (`STEPS_PER_BAR`, `NUM_BARS`).
    *   Includes functions like `generateSingleBar[StyleName]Flow()` that use probabilities and rules to place flow elements for a single bar based on the characteristics of that rap style.
    *   The main `generateFlowPattern()` function orchestrates the process:
        *   It calls the appropriate single-bar generator to create the first 3 bars.
        *   It then generates a slightly varied "fill" for the last bar.
        *   It applies a rhyme scheme (AABB or ABAB) across the 4 bars.
        *   It handles "Flow Fusion" by taking rhythmic elements from one style and pause/ad-lib patterns from another.
        *   A final cleanup pass ensures logical consistency (e.g., a pause doesn't occur on the same step as a syllable).

2.  **`flow_app.js`**: Handles the user interface, rendering, and playback.
    *   Builds the visual grid dynamically.
    *   Updates the grid to display the `currentFlowPattern`.
    *   Manages playback using `Tone.Transport` for accurate timing.
    *   The playhead animates across the grid, and simple `Tone.PluckSynth` and `Tone.MembraneSynth` sounds are triggered for different flow elements.
    *   Handles all user interactions (button clicks, dropdown changes).

3.  **`index.html`**: The main HTML file that structures the page elements.
4.  **`style.css`**: Provides the styling for the application.

## Running the Application

1.  Clone or download the repository.
2.  Open `index.html` in a modern web browser that supports JavaScript Modules and the Web Audio API (e.g., Chrome, Firefox, Edge, Safari).

    *No server is strictly required for local use, as it's a client-side application.*

## Potential Future Enhancements

*   More sophisticated sound design for audio cues.
*   More nuanced rules for each rap style.
*   Ability to save/load patterns.
*   More complex fusion options.
*   Visual customization of flow elements.
*   Representation of pitch contours or intonation (more advanced).

This project was inspired by a procedural drum pattern generator and aims to apply similar generative principles to the domain of rap flows.
