# ROOMI Product Requirements Document (PRD)

Version: 1.0 | Status: Approved for development start

## 1. Summary

ROOMI is a desktop companion. An ESP32 with a DHT temperature/humidity sensor sends readings over Wi-Fi to an Electron app. The app shows an animated character that walks on top of the user's actual desktop and changes expression and behaviour with the room's conditions.

## 2. Problem

Environmental readings are shown as raw numbers on dashboards that people rarely check. ROOMI makes the conditions of a room visible and engaging through a character, so changes are noticed without reading a dashboard.

## 3. Aim

Design and develop an IoT-enabled desktop companion that monitors real-world environmental conditions using an ESP32 and connected sensors, and represents the data through an animated virtual character on the user's desktop.

## 4. Users

| User | Need |
|---|---|
| Student at a PC | Notice a hot or humid room without checking a dashboard |
| Teacher / lab in-charge | Friendly ambient indicator of room conditions |
| Project evaluators | Clear hardware-software integration they can see working |

## 5. Scope

### In scope for MVP (v1)

- ESP32 reads DHT temperature and humidity.
- ESP32 serves latest readings as JSON over HTTP on the local Wi-Fi.
- Electron app polls the ESP32 and validates data.
- Transparent, frameless, always-on-top character window that walks across the real screen.
- Character states driven by configurable thresholds.
- Click, drag, sleep, jump interactions.
- Sensor connection status and a small readings panel.
- Settings: ESP32 address, poll interval, thresholds.
- Mock sensor server for development without hardware.
- Optional LDR (light) and sound sensor fields to reach four measured parameters for the EDI report.

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
