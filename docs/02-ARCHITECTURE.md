# Architecture & System Design

ROOMI is designed as a **Dual Robotic Companion System** consisting of two synchronized entities:
1. **The Physical Robot Node**: Desk-mounted hardware unit powered by an ESP32, environmental DHT sensor, status beacon, and optional sensory channels (LDR/sound).
2. **The Digital Robot Model (Digital Twin)**: Interactive desktop companion running on Electron, walking across the real screen, mirroring physical robot telemetry, expressions, and environmental reactions.

---

## 1. System Data Flow

```
┌─────────────────────────────────┐
│     PART 1: PHYSICAL ROBOT      │
│  [ESP32 Node + DHT Sensor + LED]│
└────────────────┬────────────────┘
                 │ Wi-Fi HTTP (JSON telemetry)
                 ▼
┌─────────────────────────────────┐
│     PART 2: DIGITAL ROBOT TWIN  │
│ [Electron Main: Poller/Physics] │
│                │                │
│                ▼ IPC            │
│ [Renderer: Robot Model + Audio] │
└─────────────────────────────────┘
```

Detailed pipeline:
```
DHT sensor -> ESP32 Physical Robot (HTTP Server) -> Local Wi-Fi -> Electron Main (Poller + Validator)
   -> Reaction Engine -> IPC -> Digital Twin Renderer (Robotic Model + Audio + Confetti)
   -> User Drag/Drop Interaction -> Physics Engine (Gravity + Bounce) -> Window Movement
```

## 2. Components

| Component | Runs in | Responsibility |
|---|---|---|
| **Physical Robot Firmware** | ESP32 | Samples DHT sensor, manages physical LED beacon, serves JSON telemetry over HTTP |
| **Sensor Client** | Electron Main | Polls physical robot, handles timeouts/disconnects, validates telemetry |
| **Reaction Engine** | Electron Main (pure module) | Evaluates comfort thresholds, applies priority & hysteresis $\to$ robotic state |
| **Physics Drop Engine** | Electron Main | Simulates real gravity ($g$), drag momentum, ceiling rebound, and elastic floor bounce |
| **Walker Engine** | Electron Main | Autonomously moves the digital robot window across the real desktop work area |
| **Window Manager** | Electron Main | Transparent, frameless, always-on-top window with hover click-through |
| **Digital Twin Renderer** | Electron Renderer | Renders vector robotic model (`Robo-Node`), handles visor scanlines, squash & stretch |
| **Web Audio Synthesizer** | Electron Renderer | Synthesizes robotic bleeps, environmental reaction chimes, and impact landing thuds |
| **Settings Manager** | Electron Main + Settings UI | Configures robot host/IP, poll interval, comfort thresholds, audio volume, and pet models |
| **Mock Sensor Server** | Node.js (`tools/`) | Simulates physical robot node for offline development and failure drills |

Rule: The renderer has no direct Node access. All communication uses a secure preload script with `contextBridge` (`contextIsolation: true`, `nodeIntegration: false`, `sandbox: true`).

## API contract (ESP32 and mock server)

`GET /data` returns `200 application/json`:

```json
{
  "device_id": "roomi-node-1",
  "temperature": 29.5,
  "humidity": 65,
  "light_raw": null,
  "sound_raw": null,
  "sensor_status": "online",
  "uptime_s": 1234
}
```

Rules:
- `temperature` is Celsius, `humidity` is percent relative humidity.
- `sensor_status` is `online` or `error`. On `error`, `temperature` and `humidity` are `null`. Firmware never sends made-up numbers.
- `light_raw` and `sound_raw` are raw ADC counts (0-4095) or `null` when the sensor is not fitted. They are relative values, not calibrated units, until calibrated and documented.
- Response includes header `Access-Control-Allow-Origin: *`.

`GET /health` returns `200 text/plain` body `ok`.

## Internal events (main -> renderer)

| Channel | Payload |
|---|---|
| `sensor:update` | `{ temperature, humidity, light_raw, sound_raw, status, receivedAt }` |
| `sensor:status` | `{ connected: boolean, reason?: string }` |
| `character:state` | `{ state, reasons: string[] }` |
| `walker:direction` | `{ dir: 'left' \| 'right', walking: boolean }` |

## Renderer -> main

| Channel | Purpose |
|---|---|
| `interact:click` | User clicked the character (triggers jump, pauses walking briefly) |
| `drag:start`, `drag:move`, `drag:end` | Manual repositioning |
| `hover:set` | Pointer over/out of character (click-through toggle) |
| `settings:get`, `settings:set` | Read and write config |
| `sim:set` | Simulation mode values |

## Repository layout

```
roomi/
  AGENTS.md
  README.md                  (links to docs/ only)
  .gitignore
  docs/                      (all documentation)
  firmware/
    roomi_esp32/
      roomi_esp32.ino
      config.example.h
      config.h               (gitignored)
  desktop/
    package.json
    src/
      main/ (main.js, window.js, walker.js, sensorClient.js, reactionEngine.js, settings.js, tray.js)
      preload/preload.js
      renderer/ (index.html, style.css, renderer.js, character/)
      settings/ (settings.html, settings.js)
    tests/
  tools/
    mock-sensor-server/
      server.js
```

## Key technical decisions

| Decision | Reason |
|---|---|
| Electron | Transparent, frameless, always-on-top windows are supported natively |
| Poll from main process | Avoids renderer CORS issues and keeps renderer sandboxed |
| Walk by moving the BrowserWindow | The character must move across the real desktop |
| HTTP/JSON, pull model | Simplest to debug with a browser or curl |
| Pure reaction engine module | Unit-testable without Electron or hardware |
| Mock server | Development and demos without the ESP32 |
| CSS/SVG original character | No asset licensing, easy state animation |
