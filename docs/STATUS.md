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
| FW-6 | mDNS roomi.local | Planned | |
| FW-7 | LED indicator | Planned | |
| FW-8 | Optional LDR and sound | Planned | |
| APP-1 | Transparent always-on-top window | Planned | |
| APP-2 | Walks across real desktop | Planned | |
| APP-3 | Poll ESP32 | Planned | |
| APP-4 | Validate and detect disconnect | Planned | |
| APP-5 | Threshold-driven states | Planned | |
| APP-6 | Readings panel | Planned | |
| APP-7 | Click and drag | Planned | |
| APP-8 | Idle and sleep | Planned | |
| APP-9 | Settings window | Planned | |
| APP-10 | Click-through | Planned | |
| APP-11 | Tray / menu-bar | Planned | |
| APP-12 | Simulation mode | Planned | |
| APP-13 | Mouse-follow | Planned | |
| APP-14 | Persistent settings | Planned | |
| TOOL-1 | Mock sensor server | Implemented (mock-tested) | /data, /health, /control, and failure mode verified (2026-11-03) |

## Milestones

| Milestone | Status | Notes |
|---|---|---|
| M0 Repo bootstrap | Implemented | Initialised git, .gitignore, docs set, skeleton created (2026-11-03) |
| M1 Mock server | Implemented | Server endpoints, controls, and docs verified (2026-11-03) |
| M2 Firmware sensor | Written, not flashed | Error handling and DHT11/22 switch implemented (2026-11-03) |
| M3 Firmware networking | Planned |
| M4 Electron shell | Planned |
| M5 Character and walking | Planned |
| M6 Sensor integration | Planned |
| M7 Remaining states | Planned |
| M8 Settings and simulation | Planned |
| M9 Optional sensors | Planned |
| M10 Hardening and MVP | Planned |

## Measured results

None yet. Add only real measurements, with date and instrument used.
