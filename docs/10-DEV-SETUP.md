# ROOMI Development and Demonstration Setup Guide

This guide provides end-to-end instructions to set up, test, and demonstrate ROOMI on **macOS**, **Windows**, and **Linux**.

---

## 1. Prerequisites

- **Node.js**: v18.x or v20.x+ LTS (includes `npm`).
- **Git**: Installed and configured.
- **Hardware (Optional for initial demo)**:
  - ESP32 Development Board (NodeMCU / WROOM-32).
  - DHT11 or DHT22 Temperature and Humidity Sensor.
  - Micro-USB cable, breadboard, jumper wires.

Verify tools on your command line:
```bash
node -v
npm -v
git --version
```

---

## 2. Desktop App Setup

### A. Install Dependencies

Open a terminal in the project root:

**macOS / Linux:**
```bash
cd desktop
npm install
```

**Windows (Command Prompt / PowerShell):**
```cmd
cd desktop
npm install
```

### B. Run the Unit Test Suite

Execute the automated test suite covering walker physics, sensor validation, priority rules, hysteresis, and failure handling:

```bash
npm test
```
*Expected: All 27 unit tests pass with 0 failures.*

---

## 3. Demo Mode 1: Using the Mock Sensor Server (TOOL-1)

This mode allows complete demonstration of all IoT reactions without physical hardware.

### Step 1: Start the Mock Sensor Server

Open Terminal 1:

**macOS / Linux:**
```bash
node tools/mock-sensor-server/server.js --port 8080 --drift
```

**Windows:**
```cmd
node tools\mock-sensor-server\server.js --port 8080 --drift
```

The mock server will start on `http://localhost:8080` with initial conditions:
`Temp: 24.5 °C | Humidity: 55% | Status: online`.

### Step 2: Start ROOMI Desktop App

Open Terminal 2:

```bash
cd desktop
npm start
```

### Step 3: What You Should See
1. **Desktop Companion**: ROOMI appears at the bottom-right of your screen above all windows.
2. **Walking Animation**: ROOMI walks left and right across your real screen, waddling cutely and turning smoothly at screen edges.
3. **Hover & Info Panel**: Move your mouse over ROOMI. A semi-transparent info bubble displays live temperature, humidity, and an "Online" green status dot.
4. **Click-Through**: Move your cursor outside ROOMI's body; your clicks pass directly through to windows underneath.
5. **Click & Drag**:
   - **Click** ROOMI: He performs an expressive jump reaction and chirps a friendly message.
   - **Drag** ROOMI: Left-click and drag him anywhere on your desktop; releasing snaps him gracefully back to the work area bottom.

---

## 4. Live Environmental Failure & Reaction Drills

With both the server and app running, open Terminal 3 to simulate environmental changes:

### Test A: Warming Up (Hot State Reaction)
Set temperature to 33.5 °C (above 30.0 °C threshold):
```bash
curl "http://localhost:8080/control?temp=33.5"
```
*Result: Within 2 poll intervals (~6s), ROOMI turns pink/flushed, sweat drops appear, walking speed slows to a panting waddle, speech bubble reads "It's toasty in here!", and the info panel highlights the high temperature.*

### Test B: Cooling Down (Cold State Reaction)
Set temperature to 16.0 °C (below 18.0 °C threshold):
```bash
curl "http://localhost:8080/control?temp=16.0"
```
*Result: ROOMI turns icy blue, shiver lines appear, he chatters his teeth, and shivers across the screen.*

### Test C: High Humidity (Muggy/Humid State)
Set humidity to 82% (above 70% threshold):
```bash
curl "http://localhost:8080/control?temp=24.0&humidity=82"
```
*Result: ROOMI shows a droopy, muggy face with speech bubble "Feels muggy! 💧".*

### Test D: Hardware Disconnect / Network Failure
Simulate sensor disconnection or network drop:
```bash
curl "http://localhost:8080/control?status=error"
```
*Result: ROOMI turns monochrome slate gray, a question mark appears over his head, mouth becomes an 'O', and he wanders confusedly. Info panel marks "Offline".*

Restore normal signal:
```bash
curl "http://localhost:8080/control?status=online&temp=24.5&humidity=55"
```
*Result: ROOMI immediately recovers to his smiling, happy self!*

---

## 5. Demo Mode 2: Built-in Simulation Mode (APP-12)

You can run ROOMI completely standalone with GUI simulation sliders:

```bash
cd desktop
npm run start:sim
```
* Or right-click the system tray icon (menu bar on macOS / taskbar tray on Windows) and select **Settings...**.
* Enable the **"Hardware Simulation (Demo Mode)"** checkbox.
* Move the temperature and humidity sliders in real-time, or click **"Simulate Sensor Disconnect"** to see instant character reactions!

---

## 6. Physical ESP32 Hardware Bring-Up (When Hardware is Ready)

### Pin Connections (per `docs/03-HARDWARE.md`)
| Sensor Pin | ESP32 Pin |
|---|---|
| DHT VCC | 3V3 |
| DHT GND | GND |
| DHT DATA | GPIO 4 |
| Status LED | GPIO 2 (onboard LED) |
| LDR (optional) | GPIO 34 (ADC1) |
| Sound (optional) | GPIO 35 (ADC1) |

### Flashing Firmware
1. Open `firmware/roomi_esp32/roomi_esp32.ino` in Arduino IDE or VS Code with PlatformIO.
2. Create `firmware/roomi_esp32/config.h` (copy from `config.example.h`) and fill in your local Wi-Fi SSID and Password.
3. Select board: **ESP32 Dev Module**, upload speed 921600, Serial monitor 115200.
4. Upload sketch and note the printed IP address (e.g. `192.168.1.120`).
5. Open ROOMI Settings on your desktop, set Host to `192.168.1.120` (or `roomi.local`), click Save.
6. ROOMI will connect to the physical ESP32 and reflect your real room conditions!
