# Desktop App Specification (Electron)

Tooling: Node LTS, Electron (current stable), electron-builder later for packaging. Plain HTML/CSS/JS. Dev scripts: `npm start`, `npm run start:sim`, `npm test`.

## Main window (character window)

Create a small BrowserWindow (about 200x220 px) with:

```js
{
  transparent: true, frame: false, hasShadow: false, resizable: false,
  alwaysOnTop: true, skipTaskbar: true,
  webPreferences: { preload, contextIsolation: true, nodeIntegration: false }
}
win.setAlwaysOnTop(true, 'screen-saver');
win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
```

Notes:
- macOS: hide the Dock icon for the pet (`app.dock.hide()`), keep a menu-bar tray item. Verify behaviour over full-screen apps and report what you observe.
- Windows: `skipTaskbar` true; tray icon in the notification area.
- Keep all of this inside `window.js` so platform fixes stay in one place.

## Click-through (APP-10)

Default state: `win.setIgnoreMouseEvents(true, { forward: true })` so empty transparent areas pass clicks to apps below. When the pointer enters the character's bounding box (renderer detects with `mousemove` forwarded events), renderer sends `hover:set(true)`; main calls `setIgnoreMouseEvents(false)`. On leave, restore. Do not use `-webkit-app-region: drag` on the character, because it swallows click events; implement drag manually.

## Walker (APP-2)

- Use `screen.getPrimaryDisplay().workArea` (and handle display changes). Pet walks along the bottom of the work area by default.
- Tick at about 30-60 fps using a single timer in main; move with `win.setPosition(Math.round(x), Math.round(y))`. Speed configurable (default about 40-60 px/s).
- Direction flips at left/right edges; emit `walker:direction` to renderer.
- Random behaviour scheduler: walk, pause/idle, occasionally sit, never rapidly toggle.
- Pause walking while: dragged, clicked reaction playing, sleeping, or in states that specify standing still (see 06).
- Optional (could): follow mouse when enabled in settings.

## Interactions

| Action | Result |
|---|---|
| Click | Jump + reaction bubble; wakes from sleep |
| Drag | Pet follows pointer; on release, resume walking from new spot (snap y to work area bottom unless free-roam setting on) |
| Right-click or tray menu | Show/Hide, Settings, Simulation toggle, Quit |
| 5 min no interaction (configurable) | Sleeping state; wakes on click or on state change to alert |

## Panel (APP-6)

A small bubble that appears on hover or click above the character: temperature, humidity, optional light/sound, connection status, last update time. Uses plain text, readable size, auto-hides after a few seconds. Never fabricate values; show `--` when unknown.

## Sensor Client (APP-3, APP-4)

- Poll `http://<host>/data` every `pollIntervalMs` (default 3000) using Node `fetch` with `AbortController` timeout (default 2500 ms).
- Validate: object shape, numbers finite, temperature -40..85, humidity 0..100, `sensor_status` string. Reject and log invalid payloads.
- Connection state: connected after a valid response; disconnected after N consecutive failures (default 3) or if last valid data is older than `staleAfterMs` (default 10000).
- Emits `sensor:update` and `sensor:status`. Never throws into the main loop.
- Host configurable; default `roomi.local`, fallback to a saved IP.

## Settings (APP-9, APP-14)

Stored as JSON in `app.getPath('userData')/settings.json`. Defaults:

```json
{
  "host": "roomi.local",
  "pollIntervalMs": 3000,
  "thresholds": {
    "tempHigh": 30, "tempLow": 18,
    "humidityHigh": 70, "humidityLow": 30
  },
  "walkSpeedPxPerSec": 50,
  "sleepAfterMinutes": 5,
  "sound": false,
  "simulation": false
}
```

Validation on load and save; fall back to defaults for bad fields. Threshold values are illustrative indoor-comfort markers, not medical or safety limits, and the settings UI should say so.

## Simulation mode (APP-12)

When enabled, the sensor client is bypassed and temperature/humidity come from sliders in the settings window (and a "disconnect" toggle). Visibly marked "SIMULATION" in the panel so simulated values are never mistaken for real readings.

## Tests

Unit tests (Node test runner or Jest) for: reaction engine mapping and priority, validation, settings merge, walker edge-turn math. Run `npm test` before every commit that touches these modules.
