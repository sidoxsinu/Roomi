# ROOMI Product Requirements Document (PRD)

Version: 1.2 | Status: Approved (Dual Robotic Companion Architecture with 4-Servo Quadruped Locomotion)

## 1. Summary

ROOMI is an IoT robotic companion built around an ESP32 microcontroller, quadruped walking servos, and a DHT temperature/humidity sensor. It consists of two seamlessly synchronized parts:
1. **The Physical Robot Node**: A desk-mounted physical robot containing the ESP32, 4 walking servos (GPIO 18, 21, 19, 22), environmental DHT sensor, status beacon/LED, and optional sensory channels (LDR light, sound).
2. **The Digital Robot Model (Digital Twin)**: An interactive Electron desktop companion that walks across the user's actual screen, mirroring the physical robot's environmental state, expressions, and telemetry in real time.

Both the physical robot and the digital model respond synchronously to the room's temperature and humidity.

## 2. Problem

Environmental readings are traditionally shown as raw numbers on distant wall meters or web dashboards that people rarely check. ROOMI bridges the physical and digital worlds: a physical robot on your desk paired with a digital robot twin on your screen turns invisible indoor air conditions into intuitive, engaging robotic expressions and physical presence.

## 3. Aim

Design and develop a dual-component IoT robotic companion that monitors real-world environmental conditions using an ESP32-based physical robot with quadruped walking locomotion, and represents the live conditions through a synchronized digital robot twin on the user's computer desktop.

## 4. Users

| User | Need |
|---|---|
| Student at a PC | Immediate ambient awareness of hot, cold, or humid room conditions from their desktop robot |
| Teacher / lab in-charge | Visible physical and digital robotic indicator of classroom or lab environmental comfort |
| Project evaluators | Clear hardware-software integration featuring a physical IoT robot communicating with a desktop digital twin |

## 5. Scope

### In scope for MVP (v1)

- **Physical Robot Node**:
  - ESP32 reads DHT temperature and humidity.
  - ESP32 serves latest readings as JSON over HTTP on the local Wi-Fi.
  - 4-servo quadruped walking locomotion executed on a dedicated FreeRTOS core (Core 1).
  - Physical LED/beacon state machine indicating robot power, Wi-Fi link, and sensor status.
  - Optional physical LDR (light) and sound sensor channels to provide up to 4 environmental telemetry dimensions.
- **Digital Robot Twin**:
  - Electron app polls the physical robot node and validates incoming telemetry.
  - Transparent, frameless, always-on-top digital robot window that walks across the real screen.
  - Digital robot states, expressions, and audio cues driven by configurable comfort thresholds.
  - Click, drag, gravity drop, and sleeping interactions with physical landing bounce.
  - Sensor connection status and readings panel displaying physical robot telemetry.
  - Settings: Physical robot address (IP/mDNS), poll interval, comfort thresholds, audio volume.
- **Development & Verification**:
  - Mock sensor server simulating the physical robot node for rapid desktop development.
  - Hardware simulation mode for offline interactive evaluation.

### Out of scope for MVP

AI conversation, cloud, accounts, mobile app, 3D graphics, machine learning, multi-ESP32, custom PCB, database history (Year 2+).

## 6. Functional requirements

IDs are used in commits and STATUS.md.

### Firmware (FW)

| ID | Requirement | Priority |
|---|---|---|
| FW-1 | Read temperature (C) and relative humidity (%) from the DHT sensor at a safe interval | Must |
| FW-2 | Connect to Wi-Fi using credentials from an uncommitted config file, auto-reconnect | Must |
| FW-3 | Serve `GET /data` returning JSON per the API contract in 02-ARCHITECTURE.md | Must |
| FW-4 | Report `sensor_status` as `online` or `error` if the DHT read fails (never send fake values) | Must |
| FW-5 | Serve `GET /health` returning a tiny OK payload | Should |
| FW-6 | Advertise `roomi.local` via mDNS | Should |
| FW-7 | LED indicator for Wi-Fi/sensor state | Could |
| FW-8 | Optional LDR and sound readings as raw ADC values, fields null when absent | Could |
| FW-9 | 4-servo quadruped walking gait running concurrently on FreeRTOS Core 1 | Must |

### Desktop app (APP)

| ID | Requirement | Priority |
|---|---|---|
| APP-1 | Electron app with transparent, frameless, always-on-top window | Must |
| APP-2 | Character walks left/right across the real desktop by moving the window, turns at screen edges | Must |
| APP-3 | Poll ESP32 `/data` from the main process at a configurable interval | Must |
| APP-4 | Validate readings (type, range, freshness); detect timeouts and mark disconnected | Must |
| APP-5 | Map readings to character state using configurable thresholds | Must |
| APP-6 | Show current temperature, humidity, and connection status in a small panel | Must |
| APP-7 | Click to interact (jump + reaction); drag to reposition | Must |
| APP-8 | Idle animation and sleep after inactivity | Should |
| APP-9 | Settings window: ESP32 address, interval, thresholds, sound on/off | Should |
| APP-10 | Click-through on transparent areas so the window never blocks other apps | Must |
| APP-11 | Tray/menu-bar icon with Show/Hide, Settings, Quit | Must |
| APP-12 | Simulation mode with sliders for temperature/humidity (demo without hardware) | Should |
| APP-13 | Mouse-follow behaviour | Could |
| APP-14 | Persist settings between runs | Must |

### Tooling (TOOL)

| ID | Requirement | Priority |
|---|---|---|
| TOOL-1 | Mock sensor server with the same contract as the ESP32, with controllable values and failure mode | Must |

## 7. Non-functional requirements

- Runs on macOS (primary dev machine) and Windows; no platform-specific hacks without a fallback.
- Idle CPU under control: render loop only when needed, pause animation when hidden.
- App never crashes on malformed or missing sensor data.
- Setup achievable by a student in under 30 minutes using docs only.
- Plain HTML, CSS, JavaScript (no heavy frameworks required). Minimal dependencies.
- Original character art only (no copyrighted characters or assets).

## 8. Acceptance criteria for MVP

1. With the ESP32 powered and on the same Wi-Fi, readings appear in the app and update at the configured interval.
2. Raising temperature above the high threshold (for example, warming the sensor) changes the character to the hot state within two poll intervals.
3. Unplugging the ESP32 changes the character to the disconnected state within the timeout; reconnecting recovers automatically.
4. The character walks across the real desktop over other applications and turns at the screen edges.
5. Clicking the character reacts; dragging repositions it; clicking elsewhere on the transparent area reaches the app underneath.
6. The same behaviours work against the mock server without hardware.
7. Every item above is recorded in STATUS.md only after it has actually been run.

## 9. Success metrics for the report

Only after real testing: poll success rate, update latency, percentage error versus a reference thermometer/hygrometer (see 08-TESTING-AND-REPORT.md). No figures are written before measurement.

## 10. Risks and mitigations

| Risk | Mitigation |
|---|---|
| DHT inaccuracy and slow response | Document as limitation; compare against reference instrument |
| Wi-Fi unavailable or ESP32 on a different network | Mock server, USB serial fallback later, clear connection state |
| Transparent always-on-top behaviour differs by OS | Keep window logic in one module; test on macOS first |
| Window blocks user's clicks | Click-through with hover-based toggling (APP-10) |
| Hardware not ready at project start | Mock server and simulation mode |
| Exact sensor model unknown (DHT11 vs DHT22) | `SENSOR_TYPE` config switch in firmware |

## 11. Future (not MVP)

Year 2: more sensors, history, dashboard. Year 3: anomaly detection, optional AI chat, multi-node, mobile app. Year 4: PCB, enclosure, field trials. See the handoff roadmap; do not start these before MVP acceptance.
