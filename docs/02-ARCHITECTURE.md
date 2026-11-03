# Architecture

## Data flow

```
DHT sensor -> ESP32 (HTTP server) -> Wi-Fi -> Electron main process (poller + validator)
   -> IPC -> Renderer (character + panel) -> user interaction -> IPC -> main (window control)
```

## Components

| Component | Runs in | Responsibility |
|---|---|---|
| Firmware | ESP32 | Read sensor, serve JSON |
| Sensor Client | Electron main | Poll, timeout, validate, emit events |
| Reaction Engine | Electron main (pure module) | Readings + thresholds -> character state |
| Walker | Electron main | Moves the window across the work area |
| Window Manager | Electron main | Transparent window, always-on-top, click-through |
| Character Renderer | Renderer | Draws and animates the character from state |
| Panel | Renderer | Readings and status UI |
| Settings | Main + settings window | Load/save config, edit thresholds |
| Mock Server | Node (tools/) | Simulates ESP32 |

Rule: the renderer has no Node access. All communication uses a preload script with `contextBridge` and a small typed IPC surface. `contextIsolation: true`, `nodeIntegration: false`.

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
