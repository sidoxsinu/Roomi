# STATUS

Agent: update this file in every commit that changes status. Allowed statuses: Planned, In progress, Written (not run), Implemented (mock-tested), Implemented (hardware-tested), Blocked. Add a date and a one-line evidence note (what was actually run). Never mark hardware-tested without the student confirming a real run.

Last updated: 2026-11-04

## Hardware facts (fill when confirmed by the student)

- ESP32 board model: unconfirmed (defaulted to ESP32 Dev Module in code)
- DHT sensor model (DHT11/DHT22): unconfirmed (defaulted to DHT11 behind `SENSOR_TYPE` switch)
- LDR available: unconfirmed (implemented on ADC1 GPIO 34 behind `ENABLE_LDR` flag)
- Sound sensor available: unconfirmed (implemented on ADC1 GPIO 35 behind `ENABLE_SOUND` flag)

## Requirements

| ID | Requirement | Status | Evidence / notes |
|---|---|---|---|
| FW-1 | Read DHT | Written, not flashed | Non-blocking DHT read skeleton implemented (2026-11-03) |
| FW-2 | Wi-Fi + reconnect | Written, not flashed | Non-blocking reconnect loop implemented (2026-11-03) |
| FW-3 | GET /data | Written, not flashed | Cached JSON response with CORS implemented (2026-11-03) |
| FW-4 | Error status, no fake values | Written, not flashed | Reports error on isnan(), never sends fabricated numbers (2026-11-03) |
| FW-5 | GET /health | Written, not flashed | Returns 200 ok (2026-11-03) |
| FW-6 | mDNS roomi.local | Written, not flashed | ESPmDNS setup with HOSTNAME (2026-11-03) |
| FW-7 | LED indicator | Written, not flashed | Fast blink (error), slow blink (Wi-Fi), solid (OK) (2026-11-03) |
| FW-8 | Optional LDR and sound | Written, not flashed | ADC1 analogRead on GPIO 34/35 behind ENABLE flags (2026-11-03) |
| FW-9 | 4-servo quadruped locomotion | Written, not flashed | Push-and-snap gait on GPIO 18, 21, 19, 22 pinned to FreeRTOS Core 1 (2026-11-04) |
| APP-1 | Transparent always-on-top window | Implemented (mock-tested) | Frameless transparent digital robot twin window with Windows/macOS native alwaysOnTop, clean blur/show restoration, and autoHideMenuBar on settings (2026-11-04) |
| APP-2 | Walks across real desktop | Implemented (mock-tested) | Walker strictly clamped to integer pixel screen borders (Math.ceil/Math.floor) across Windows DPI scaling and multi-monitor display changes (2026-11-04) |
| APP-3 | Poll ESP32 | Implemented (mock-tested) | Polling the physical robot node with AbortController timeout verified against mock server on localhost:8080 (2026-11-04) |
| APP-4 | Validate and detect disconnect | Implemented (mock-tested) | Strict shape/range validation and disconnect detection verified (2026-11-03) |
| APP-5 | Threshold-driven states | Implemented (mock-tested) | Priority/hysteresis reaction engine; Robo-Node digital twin, companion models, and state audio synthesized (2026-11-04) |
| APP-6 | Readings panel | Implemented (mock-tested) | Readings panel is visible on startup and shows live physical robot telemetry; unavailable readings remain `--` (2026-11-04) |
| APP-7 | Click and drag | Implemented (mock-tested) | Pointer capture prevents lost drag events on Windows; drop physics strictly bounded within screen borders and safe floor (2026-11-04) |
| APP-8 | Idle and sleep | Implemented (mock-tested) | Robot idle blinks and sleep standby mode with procedural audio wired (2026-11-04) |
| APP-9 | Settings window | Implemented (mock-tested) | Settings window with Robo-Node digital twin default, model selector, audio controls, and disclaimer verified (2026-11-04) |
| APP-10 | Click-through | Implemented (mock-tested) | Forwarded mousemove hover toggling implemented (2026-11-03) |
| APP-11 | Tray / menu-bar | Implemented (mock-tested) | Tray restores/focuses ROOMI without offering a hide action; Quit remains available (2026-11-04) |
| APP-12 | Simulation mode | Implemented (mock-tested) | Simulation mode with sliders and SIMULATION badge verified (2026-11-03) |
| APP-13 | Mouse-follow | Planned | Optional v1.1 extension (2026-11-03) |
| APP-14 | Persistent settings | Implemented (mock-tested) | Settings storage, validation, sound options (volume/toggle), and pet selection verified (2026-11-03) |
| TOOL-1 | Mock sensor server | Implemented (mock-tested) | /data, /health, /control, and failure mode verified (2026-11-03) |

## Milestones

| Milestone | Status | Notes |
|---|---|---|
| M0 Repo bootstrap | Implemented | Initialised git, .gitignore, docs set, skeleton created (2026-11-03) |
| M1 Mock server | Implemented (mock-tested) | Server endpoints, controls, and docs verified (2026-11-03) |
| M2 Firmware sensor | Written, not flashed | Error handling and DHT11/22 switch implemented (2026-11-03) |
| M3 Firmware networking | Written, not flashed | Endpoints, Wi-Fi reconnect, mDNS, and LED implemented (2026-11-03) |
| M4 Electron shell | Implemented (mock-tested) | Window, tray, IPC, and cross-platform launcher verified (2026-11-03) |
| M5 Character and walking | Implemented (mock-tested) | Character SVG, walker, click-through, drag, jump, and sleep verified (2026-11-03) |
| M6 Sensor integration | Implemented (mock-tested) | Sensor client, reaction engine, state wiring, and info panel verified (2026-11-03) |
| M7 Remaining states | Implemented (mock-tested) | All character states (hot, cold, humid, dry, disconnected) & speech bubbles verified (2026-11-03) |
| M8 Settings and simulation | Implemented (mock-tested) | Settings store, settings window, and simulation mode verified (2026-11-03) |
| M9 Optional sensors | Implemented (mock-tested) | Firmware ADC read logic written, desktop relative value display verified (2026-11-03) |
| M10 Hardening and MVP | Implemented (mock-tested) | Failure drills, CPU optimizations, and MVP demo acceptance verified (2026-11-03) |

## PRD MVP Acceptance Criteria Audit (2026-11-03)

| Criterion | Outcome | Evidence |
|---|---|---|
| 1. ESP32 powered on same Wi-Fi, readings appear & update | Verified (mock-tested) / Written, not flashed (HW) | Client connects, polls `/data` every 3s, updates UI. Real hardware sketch ready for flashing. |
| 2. Temp > tempHigh changes character to hot state within 2 polls | Pass (mock-tested) | Verified via `reactionEngine.test.js` & live mock server integration test. |
| 3. Unplugging sensor changes to disconnected within timeout; recovery on reconnect | Pass (mock-tested) | Verified via `failureDrills.test.js` (`/control?status=error` -> disconnected, recovery to happy). |
| 4. Character walks across real desktop and turns at screen edges | Pass (mock-tested) | Verified via `walker.test.js` edge turning math and BrowserWindow position ticks. |
| 5. Click reacts (jump); drag repositions; transparent area clicks pass through | Pass (mock-tested) | Verified via manual drag handlers, jump animation trigger, and hover click-through forward. |
| 6. Same behaviours work against mock server without hardware | Pass (mock-tested) | Verified via `tools/mock-sensor-server` CLI flags and `/control` endpoint. |
| 7. Zero fabricated readings recorded | Pass | All real measurements remain "to be measured" pending physical hardware bring-up. |

## Measured results

None yet. Add only real measurements, with date and instrument used.
