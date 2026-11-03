# 12. Audio System & Sound Design Specification

This document details the procedural audio engine designed for ROOMI, providing synthesized sound effects for all companion pets, emotional reactions, interactions, and question dialogues.

---

## 1. Architectural Overview

ROOMI uses the **Web Audio API** (`AudioContext`) built directly into Chromium:

### Architectural Advantages:
1. **Zero External Audio Files**: Eliminates missing file errors, asset path resolution bugs across OS platforms, network latency, and large audio file bundles.
2. **Sub-Millisecond Latency**: Synthesizer nodes schedule audio directly on the hardware audio clock, ensuring instant feedback upon pet click, drag, or environmental state change.
3. **Dynamic Parameter Control**: Pitch, resonance, and attack/decay envelopes dynamically morph according to the pet model and temperature/humidity severity.
4. **Volume Normalization & Safety**: A master gain node limits maximum output amplitude to safe levels (effective peak $\le 0.35$) with exponential decay ramps to prevent speaker popping.
5. **Autoplay Compliance**: Automatically initializes and resumes the audio context upon the first user interaction (click, hover, or drag).

---

## 2. Emotional Reaction Sound Profiles

Whenever the companion transitions into a new environmental or system state, the audio engine plays a distinctive reaction chime:

| State | Musical / Acoustic Design | Synthesis Parameters | Emotional Feel |
|---|---|---|---|
| **Happy** | Ascending major triad arpeggio (C5 $\to$ E5 $\to$ G5) | 3 sine tones at 523.25 Hz, 659.25 Hz, 783.99 Hz with 70 ms offsets | Cheerful, upbeat, comfortable |
| **Hot** | Descending lethargic sigh | Triangle wave gliding 340 Hz $\to$ 220 Hz $\to$ 160 Hz over 350 ms | Tired, panting, heat-exhausted |
| **Cold** | Rapid staccato teeth chattering & icy resonance | 4 high-frequency 950 Hz pings with 60 ms intervals | Shivering, frosted, crisp |
| **Humid** | Resonant water-drop bloop | Sine sweep ramping from 320 Hz up to 880 Hz with quick resonance decay | Wet, splashy, condensation |
| **Dry** | Hollow percussive wooden click | Triangle wave sliding 480 Hz down to 260 Hz with fast 5 ms attack | Thirsty, sandy, arid |
| **Disconnected** | Confused descending tritone chime | Dissonant dual tones at 440 Hz (A4) and 311.13 Hz (Eb4) | Puzzled, searching, offline |
| **Sleeping** | Gentle soothing lullaby hum | Low sine wave at 261.63 Hz gliding down to 220 Hz over 500 ms | Peacefully snoozing, resting |
| **Wake** | Rising morning chirp | Sine wave sliding from 380 Hz to 580 Hz over 160 ms | Alert, refreshing, awake |

---

## 3. Companion Pet Vocalizations

Each companion pet has a distinct vocal identity played upon clicking/jumping or switching pets:

| Companion | Vocalization | Audio Implementation |
|---|---|---|
| **Roomi Spirit (`blob`)** | *Bubbly Squish* | Sine wave frequency modulated from 260 Hz $\to$ 420 Hz $\to$ 310 Hz, mimicking a soft gelatinous bloop. |
| **Mochi Neko (`cat`)** | *Kitten Meow* | Harmonic sine sweep starting at 640 Hz, arching up to 890 Hz, and easing down to 680 Hz with soft decay. |
| **Pengu (`penguin`)** | *Arctic Squawk* | Triangle wave with sharp pitch modulation from 340 Hz $\to$ 520 Hz $\to$ 390 Hz, mimicking a playful penguin honk. |
| **Robo-Node (`robot`)** | *8-Bit Chiptune Bleep* | 3 retro square-wave pulses stepped across 587.33 Hz (D5), 880 Hz (A5), and 1174.66 Hz (D6). |

---

## 4. Interaction & Speech Dialogue Audio

Interactions and dialogue bubbles emit specialized auditory feedback:

- **Jump / Click**: Springy rising bounce tone (sine 220 Hz $\to$ 540 Hz) triggering accompanied by the pet's signature vocalization.
- **Dialogue Pop**: Soft transient click with a 480 Hz tone when a standard speech bubble appears.
- **Question Inflection (`?`)**: Inquisitive rising tone inflection (triangle wave 380 Hz $\to$ 450 Hz $\to$ 680 Hz) played whenever a message contains a question mark (e.g. sensor disconnect search, curious clicks).

---

## 5. User Configuration & Persistence

Sound preferences are persisted in `%APPDATA%/ROOMI/settings.json` (Windows) or `~/Library/Application Support/ROOMI/settings.json` (macOS):

```json
{
  "soundEnabled": true,
  "soundVolume": 70
}
```

### Controls in Settings Window:
- **Enable Audio Checkbox**: Instantly toggles audio output across the application.
- **Master Volume Slider (0% – 100%)**: Adjusts master gain in 5% increments with real-time feedback.
- **Live Sound Previews**:
  - `🔊 Preview Pet Voice`: Plays the voice of the currently selected pet.
  - `✨ Preview Reaction Chime`: Plays the happy reaction arpeggio at the selected volume.
