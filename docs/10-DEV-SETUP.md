# Development and Setup Guide

This document provides complete instructions to set up, run, and test ROOMI on **macOS**, **Windows**, and **Linux**.

---

## 1. Prerequisites

- **Node.js**: v18.x or v20.x+ LTS (includes `npm`).
- **Git**: Installed and configured.

Verify your environment:
```bash
node -v
npm -v
git --version
```

---

## 2. Mock Sensor Server (TOOL-1)

The mock sensor server allows development, testing, and demonstration without physical ESP32 hardware. It implements the exact HTTP contract specified in `docs/02-ARCHITECTURE.md`.

### Starting the Server

The server has **zero third-party dependencies** and runs on any platform:

**macOS / Linux:**
```bash
node tools/mock-sensor-server/server.js
```

**Windows (cmd / PowerShell):**
```cmd
node tools\mock-sensor-server\server.js
```

By default, the server listens on `http://localhost:8080` (or `0.0.0.0:8080`).

### Command-Line Options

You can pass CLI flags when starting the server:

| Flag | Default | Description |
|---|---|---|
| `--port <number>` | `8080` | Port to listen on (or set `PORT` environment variable) |
| `--temp <number>` | `24.5` | Initial temperature in °C |
| `--humidity <number>` | `55.0` | Initial relative humidity in % |
| `--fail` | (off) | Start with `sensor_status: "error"` and null readings |
| `--drift` | (off) | Enable realistic gentle random drift every 3 seconds |
| `--light <number>` | `null` | Optional initial raw ADC light reading (0-4095) |
| `--sound <number>` | `null` | Optional initial raw ADC sound reading (0-4095) |

**Examples:**

```bash
# Start on port 8080 with high temperature (hot state testing)
node tools/mock-sensor-server/server.js --temp 32.5 --humidity 50

# Start in failure mode (disconnected / error testing)
node tools/mock-sensor-server/server.js --fail

# Start on port 9000 with random drift enabled
node tools/mock-sensor-server/server.js --port 9000 --drift
```

---

### Dynamic Control Endpoints

You can dynamically adjust readings and simulate hardware events while the server is running without restarting it:

#### 1. Querying Data
- `GET http://localhost:8080/data`  
  Returns the JSON payload conforming to the contract:
  ```json
  {
    "device_id": "roomi-mock-node",
    "temperature": 24.5,
    "humidity": 55,
    "light_raw": null,
    "sound_raw": null,
    "sensor_status": "online",
    "uptime_s": 42
  }
  ```

- `GET http://localhost:8080/health`  
  Returns `200 ok`.

#### 2. Changing Conditions via URL (Quick Browser / Curl)
- Set temperature to 31°C and humidity to 75%:
  ```bash
  curl "http://localhost:8080/control?temp=31&humidity=75"
  ```
- Simulate sensor failure (sensor disconnected):
  ```bash
  curl "http://localhost:8080/control?status=error"
  ```
- Restore normal sensor operation:
  ```bash
  curl "http://localhost:8080/control?status=online"
  ```

#### 3. Changing Conditions via JSON (POST)
```bash
curl -X POST http://localhost:8080/control \
  -H "Content-Type: application/json" \
  -d '{"temperature": 16.0, "humidity": 40.0, "sensor_status": "online"}'
```
