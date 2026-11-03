# STATUS

Agent: update this file in every commit that changes status. Allowed statuses: Planned, In progress, Written (not run), Implemented (mock-tested), Implemented (hardware-tested), Blocked. Add a date and a one-line evidence note (what was actually run). Never mark hardware-tested without the student confirming a real run.

Last updated: 2026-11-03

## Hardware facts (fill when confirmed by the student)

- ESP32 board model: unconfirmed
- DHT sensor model (DHT11/DHT22): unconfirmed
- LDR available: unconfirmed
- Sound sensor available: unconfirmed

## Requirements

| ID | Requirement | Status | Evidence / notes |
|---|---|---|---|
| FW-1 | Read DHT | Written, not flashed | DHT read skeleton to Serial (2026-11-03) |
| FW-2 | Wi-Fi + reconnect | Written, not flashed | Non-blocking reconnect loop implemented (2026-11-03) |
| FW-3 | GET /data | Written, not flashed | Cached JSON response with CORS implemented (2026-11-03) |
| FW-4 | Error status, no fake values | Written, not flashed | Reports error on isnan(), never sends fabricated numbers (2026-11-03) |
| FW-5 | GET /health | Written, not flashed | Returns 200 ok (2026-11-03) |
| FW-6 | mDNS roomi.local | Written, not flashed | ESPmDNS setup with HOSTNAME (2026-11-03) |
| FW-7 | LED indicator | Written, not flashed | Fast blink (error), slow blink (Wi-Fi), solid (OK) (2026-11-03) |
| FW-8 | Optional LDR and sound | Planned | |
| APP-1 | Transparent always-on-top window | Implemented (mock-tested) | Frameless, transparent, alwaysOnTop window verified (2026-11-03) |
| APP-2 | Walks across real desktop | Implemented (mock-tested) | Walker moves window along work area, turns at screen edges (2026-11-03) |
| APP-3 | Poll ESP32 | Implemented (mock-tested) | Polling with AbortController timeout verified (2026-11-03) |
| APP-4 | Validate and detect disconnect | Implemented (mock-tested) | Strict shape/range validation and disconnect detection verified (2026-11-03) |
| APP-5 | Threshold-driven states | Implemented (mock-tested) | Priority and hysteresis reaction engine tested (2026-11-03) |
| APP-6 | Readings panel | Implemented (mock-tested) | Readings panel bubble with live temp, humidity, status verified (2026-11-03) |
| APP-7 | Click and drag | Implemented (mock-tested) | Jump reaction on click, manual drag repositioning verified (2026-11-03) |
| APP-8 | Idle and sleep | Implemented (mock-tested) | Idle animation and inactivity sleep with wake-on-interaction verified (2026-11-03) |
| APP-9 | Settings window | Planned | |
| APP-10 | Click-through | Implemented (mock-tested) | Forwarded mousemove hover toggling implemented (2026-11-03) |
| APP-11 | Tray / menu-bar | Implemented (mock-tested) | Menu bar / system tray with Show/Hide and Quit verified (2026-11-03) |
| APP-12 | Simulation mode | Planned | |
| APP-13 | Mouse-follow | Planned | |
| APP-14 | Persistent settings | Implemented (mock-tested) | Settings storage and validation module verified (2026-11-03) |
| TOOL-1 | Mock sensor server | Implemented (mock-tested) | /data, /health, /control, and failure mode verified (2026-11-03) |

## Milestones

| Milestone | Status | Notes |
|---|---|---|
| M0 Repo bootstrap | Implemented | Initialised git, .gitignore, docs set, skeleton created (2026-11-03) |
| M1 Mock server | Implemented | Server endpoints, controls, and docs verified (2026-11-03) |
| M2 Firmware sensor | Written, not flashed | Error handling and DHT11/22 switch implemented (2026-11-03) |
| M3 Firmware networking | Written, not flashed | Endpoints, Wi-Fi reconnect, mDNS, and LED implemented (2026-11-03) |
| M4 Electron shell | Implemented (mock-tested) | Window, tray, IPC, and cross-platform launcher verified (2026-11-03) |
| M5 Character and walking | Implemented (mock-tested) | Character SVG, walker, click-through, drag, jump, and sleep verified (2026-11-03) |
| M6 Sensor integration | Implemented (mock-tested) | Sensor client, reaction engine, state wiring, and info panel verified (2026-11-03) |
| M7 Remaining states | Implemented (mock-tested) | All character states (hot, cold, humid, dry, disconnected) & speech bubbles verified (2026-11-03) |
| M8 Settings and simulation | Planned |
| M9 Optional sensors | Planned |
| M10 Hardening and MVP | Planned |

## Measured results

None yet. Add only real measurements, with date and instrument used.
