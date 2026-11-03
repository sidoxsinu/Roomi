# Character and Behaviour Spec

## Art rules

- Original character designed for this project. No copyrighted characters, no third-party sprites unless licence is documented in docs.
- Build as layered SVG with CSS classes per state (eyes, mouth, sweat drops, shiver, cheeks, fan), or sprite sheets if the team supplies art. Prefer SVG so states are small and crisp.
- Cute and readable at about 120-160 px. Facing direction by horizontal flip.
- Suggested concept: small round "room spirit" blob with big eyes and tiny feet. Team may change it; keep the state names below stable.

## States

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
