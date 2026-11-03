# 11. Pets and Visual Assets Specification

This document details the multi-pet companion system introduced to provide animation-rich, open-source desktop companions for ROOMI.

---

## 1. System Architecture

The desktop companion character is rendered as responsive vector SVG elements dynamically inserted into `#pet-container` within `desktop/src/renderer/index.html`. 

### Key Design Goals:
1. **Crisp High-DPI Rendering**: SVGs maintain perfect fidelity on 100%, 125%, 150%, and Retina 200%+ display scaling across Windows, macOS, and Linux without pixelation.
2. **Hardware-Accelerated CSS Animations**: Continuous idle animations (breathing, ear twitches, tail swaying, flipper flapping, antenna pulses) run on the GPU via CSS `transform` and `opacity` keyframes with sub-1% idle CPU utilization.
3. **Power Efficiency (T10.2)**: All continuous keyframe animations inherit the `.paused-anim` class whenever the pet window is hidden, freezing CSS recalculations.
4. **Zero-Latency Live Hot-Swapping**: Selecting a companion in the Settings window broadcasts an IPC event (`character:pet`) that re-renders the active pet structure instantly without requiring an app restart.

---

## 2. Companion Catalog

ROOMI ships with four distinct, animation-rich open-source companions:

| Companion ID | Display Name | Archetype | Visual Characteristics | Key Animations |
|---|---|---|---|---|
| `blob` | Roomi Spirit | Ambient Elemental | Emerald rounded slime body, floating highlight droplet, blush cheeks, expressive round eyes. | Gentle body squash-stretch breathing (`blob-idle-breathe`), shiver in cold, heavy sag in hot. |
| `cat` | Mochi Neko | Feline Companion | Calico/Cream kitten with pointed inner-pink ears, whisker pads, curved tail, paw pads. | Dynamic tail sway (`cat-tail-sway`), independent ear twitches (`cat-ear-twitch-left`, `cat-ear-twitch-right`), rhythmic purr breathing. |
| `penguin` | Pengu | Arctic Bird | Indigo/white tuxedo plumage, golden beak, webbed feet, curved flippers. | Wing/flipper flapping (`penguin-wing-flap-left`, `wing-flap-right`), waddle body tilt (`penguin-body-waddle`), head bob. |
| `robot` | Robo-Node | Cybernetic Automaton | Retro CRT rounded monitor chassis, glowing top antenna with status LED, dual pixel visor eyes. | Antenna pulse glow (`robot-antenna-glow`), eye visor scanline blink (`robot-eye-blink`), hover float bobbing. |

---

## 3. Emotional State Reactions Across Pets

Every pet implements the standardized 7 environmental and system reaction states required by `06-CHARACTER-BEHAVIOUR.md`:

```
                       ┌──────────────┐
                       │    HAPPY     │ (Comfort zone)
                       └──────┬───────┘
          ┌───────────────────┼───────────────────┐
          ▼                   ▼                   ▼
     ┌─────────┐         ┌─────────┐         ┌─────────┐
     │   HOT   │         │  COLD   │         │  HUMID  │
     └─────────┘         └─────────┘         └─────────┘
          │                   │                   │
          ▼                   ▼                   ▼
     ┌─────────┐         ┌─────────┐         ┌─────────┐
     │   DRY   │         │DISCONN. │         │SLEEPING │
     └─────────┘         └─────────┘         └─────────┘
```

### Detailed State Matrix:

1. **Happy (Default Comfort Zone)**:
   - **Blob**: Energetic emerald glow (`#34d399`), open smiling mouth, cheerful eyes.
   - **Cat**: Perky upright ears, rhythmic tail wave, playful smile.
   - **Penguin**: Relaxed upright posture, occasional wing flutter, bright eyes.
   - **Robot**: Bright cyan visor (`#38bdf8`), steady green antenna light (`#10b981`), cheerful digital mouth curve.

2. **Hot (`temp > tempHigh`)**:
   - **Blob**: Heated reddish-amber tone (`#f87171`), heavy drooping posture, sweat droplet appearing on forehead.
   - **Cat**: Drooping flattened ears, panting open tongue, exhausted tail drag.
   - **Penguin**: Outstretched wings trying to dissipate heat, drooped beak, flushed cheeks.
   - **Robot**: Overheating orange visor (`#fb923c`), blinking red thermal warning antenna LED (`#ef4444`), exhaust vent steam puff.

3. **Cold (`temp < tempLow`)**:
   - **Blob**: Ice blue palette (`#93c5fd`), intense rapid shiver oscillation (`anim-cold`), tiny shivering mouth.
   - **Cat**: Shivering tucked-in posture, ears pinned back against cold, curled tail.
   - **Penguin**: Native home resilience: frosty cheek highlights, tiny cute shivering beak chatter.
   - **Robot**: Freezing cyan/indigo palette (`#cffafe`), frosted visor pattern, power-saver slow antenna pulse.

4. **Humid (`humidity > humidityHigh`)**:
   - **Blob**: Deep teal-blue water-logged hue (`#38bdf8`), condensation droplets dripping, sticky squish.
   - **Cat**: Frizzy fur state, annoyed ear angle, grooming paw motion, damp tail.
   - **Penguin**: Loved element: extra shiny water-repellent plumage highlight, proud posture.
   - **Robot**: Moisture warning yellow visor (`#facc15`), short-circuit static spark animation near antenna.

5. **Dry (`humidity < humidityLow`)**:
   - **Blob**: Sandy muted amber hue (`#fbbf24`), slight shrivel/crackle contour lines, thirsty expression.
   - **Cat**: Puffed electrostatic whiskers, dry squinting eyes, requesting water bowl.
   - **Penguin**: Longing for ice/water: parched beak, squinted eyes.
   - **Robot**: Static electricity icon on visor display, dust filter notification indicator.

6. **Disconnected / Sensor Error**:
   - **Blob**: Desaturated translucent ghost grey (`#94a3b8`), floating query question mark (`?`), wandering aimlessly.
   - **Cat**: Tilted head, question mark above ear, searching looking left and right with paws raised.
   - **Penguin**: Confused penguin waddle spin, looking around with floating signal search icon.
   - **Robot**: No-signal glitch static visor with white noise scanlines, blinking yellow beacon, radar dish scanning symbol.

7. **Sleeping (Inactivity Timeout)**:
   - **Blob**: Flattened jelly pancake, gently floating `Zzz` bubbles drifting upward.
   - **Cat**: Loaf or curled position with eyes peacefully shut, slow tail swish, rising `Zzz`.
   - **Penguin**: Beak tucked under wing, rocking slowly with floating sleep runes.
   - **Robot**: Visor turns off into low-power standby mode (soft dim `_ _` display), antenna breathing slowly.

---

## 4. Open-Source Provenance & Licensing

All graphics and character definitions in ROOMI adhere to strict open-source standards:

- **License**: Creative Commons Zero 1.0 Universal (CC0 1.0) / MIT Compatible.
- **Original Authorship**: Designed and vectorized natively for the ROOMI open-source project.
- **No Third-Party Binary Blobs**: No proprietary fonts, raster bitmaps, or heavy runtime libraries (e.g. Spine, Lottie, or Pixi.js) are used.
- **Payload Size**: Total footprint for all 4 companions combined is under **15 KB** of raw SVG code.
- **Zero Asset Loading Flaws**: Embedded directly in `desktop/src/renderer/character/pets.js`, eliminating network requests, missing texture bugs, or broken asset paths during cross-platform installation.

---

## 5. Adding New Pet Models

Developers can easily contribute new companion characters to ROOMI by following these steps:

1. **Add Pet Identifier**:
   In `desktop/src/main/settings.js`, add your new companion ID to `ALLOWED_PETS`:
   ```javascript
   const ALLOWED_PETS = ['blob', 'cat', 'penguin', 'robot', 'yourpet'];
   ```

2. **Define Pet Model**:
   In `desktop/src/renderer/character/pets.js`, register your character in the `PETS` dictionary:
   ```javascript
   yourpet: {
     id: 'yourpet',
     name: 'Your Pet Name',
     getSvg: () => `...valid SVG string with viewbox 0 0 100 100...`,
     applyState: (container, state) => {
       // update SVG element attributes or classes based on state
     },
     getCustomDialogue: (state) => {
       // return string or null to override speech bubble
     }
   }
   ```

3. **Add CSS Animations**:
   In `desktop/src/renderer/style.css`, specify `@keyframes` for any distinct body part movements using `transform-origin` to ensure natural pivoting.

4. **Add to Settings UI**:
   In `desktop/src/settings/settings.html`, add a `<label class="pet-card">` entry under the Companion Character section with the corresponding radio input.
