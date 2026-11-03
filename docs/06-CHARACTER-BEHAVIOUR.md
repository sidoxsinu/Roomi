# Robotic Companion Behaviour Specification

ROOMI's primary desktop entity is **`Robo-Node` (The Digital Robot Twin)**. It mirrors the physical desk robot's environmental monitoring state through dynamic pixel visor expressions, status antenna pulses, procedural audio bleeps, and synchronized reactions.

## 1. Robotic Art & Design Rules

- **Design Concept**: Cybernetic retro-futuristic desktop automaton (`Robo-Node`). Features a rounded CRT-style head chassis, dual pixel visor eyes, and a glowing top status antenna LED.
- **Synchronized Dual Expression**:
  - The digital robot's pixel visor and antenna pulse mirror the physical robot's hardware beacon:
    - Normal Comfort: Steady green beacon on physical robot $\leftrightarrow$ cheerful cyan visor on digital twin.
    - Alert / Thermal Warning: Flashing indicator $\leftrightarrow$ amber/orange overheating visor.
    - Disconnected / Fault: Rapid blink $\leftrightarrow$ white-noise glitch static visor with question mark.
- **Multi-Model Support**: While `Robo-Node` is the default Digital Robot Twin, users can also choose alternative companion skins (`blob`, `cat`, `penguin`).
- **Vector Fidelity**: Pure SVG vector art with GPU-accelerated CSS animations.

## 2. Robotic Reaction States

| State | Trigger (default) | Look and behaviour |
|---|---|---|
| `happy` | Temp and humidity inside comfort range, connected | Smile, bounce, walks at normal speed |
| `hot` | temp > tempHigh | Sweat drops, flushed, slower walk, fanning |
| `cold` | temp < tempLow | Shivering, blue tint, small steps |
| `humid` | humidity > humidityHigh | Sticky/uncomfortable face, droopy |
| `dry` | humidity < humidityLow | Dry/thirsty face, tongue out |
| `disconnected` | Sensor client disconnected or `sensor_status = error` | Confused face with question mark, stands still or wanders slowly |
| `sleeping` | Inactivity timeout and state is `happy` | Closed eyes, Zzz, no walking |
| `idle` | Between walks | Blinks, looks around |

One-shot overlays: `jump` (on click), `wake`, `startled` (on drag start).

## Priority (highest wins for the main face)

1. `disconnected`
2. `hot` / `cold` (temperature outranks humidity)
3. `humid` / `dry`
4. `happy`
5. `sleeping` only applies when the resolved state would be `happy`; any alert state wakes the pet.

If both temperature and humidity are out of range, the main state follows priority and the panel lists all reasons (for example "Temperature high, humidity high").

## Hysteresis

To prevent flicker near thresholds, use a 1.0 C and 3 %RH hysteresis band: enter a state at the threshold, leave it only after crossing back past the band. Also require 2 consecutive readings before changing state. Both values configurable constants.

## Reaction engine contract

```js
resolveState({ temperature, humidity, status, connected }, thresholds, previousState)
  -> { state: 'happy'|'hot'|'cold'|'humid'|'dry'|'disconnected', reasons: string[] }
```

Pure function, fully unit-tested, no Electron imports.

## Speech bubbles

Short friendly text per state (for example "It's toasty in here"). Keep wording neutral and non-medical; never claim health or air-quality conclusions.

## Sound (optional)

Off by default. Small original or properly licensed sounds only; log sources in docs if any are added.
