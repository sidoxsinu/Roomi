# Roadmap and Task List

How to use: complete tasks in order. After EACH task: run it, update STATUS.md and CHANGELOG.md, then commit with the listed message (or equivalent). Tasks marked [HW] need the real ESP32; if unavailable, finish the software side and mark "hardware-untested".

## M0: Repo bootstrap

- T0.1 `git init`, set default branch `main`. Commit: `chore: initialise repository`
- T0.2 Add `.gitignore` (node_modules, dist, .DS_Store, `firmware/**/config.h`, `*.log`, `.env`). Commit: `chore: add gitignore`
- T0.3 Copy the supplied `AGENTS.md` and `docs/` into the repo if not present, add root `README.md` linking to `docs/`. Commit: `docs: add project documentation set`
- T0.4 Create folder skeleton from 02-ARCHITECTURE.md with `.gitkeep` files. Commit: `chore: add repository skeleton`

## M1: Mock sensor server (TOOL-1)

- T1.1 `tools/mock-sensor-server`: Node server with `/data` and `/health` per contract. Commit: `feat(tools): add mock sensor server`
- T1.2 Controls: CLI flags or a small `/control` endpoint to set temperature, humidity, and failure mode; slow random drift optional. Commit: `feat(tools): add mock server controls and failure mode`
- T1.3 README section in `docs/` explaining how to run it (add to STATUS notes or a `docs/10-DEV-SETUP.md`). Commit: `docs: add mock server usage`

## M2: Firmware sensor bring-up [HW]

- T2.1 `config.example.h`, `.ino` skeleton reading DHT to Serial. Commit: `feat(firmware): read DHT sensor to serial`
- T2.2 Error handling and `SENSOR_TYPE` switch. Commit: `feat(firmware): handle sensor errors and DHT11/DHT22 switch`

## M3: Firmware networking [HW]

- T3.1 Wi-Fi connect and non-blocking reconnect. Commit: `feat(firmware): add wifi connection with reconnect`
- T3.2 `/data` and `/health` endpoints matching the contract. Commit: `feat(firmware): serve sensor data over http json`
- T3.3 mDNS and LED status. Commit: `feat(firmware): add mdns and status led`

## M4: Electron shell

- T4.1 `desktop/` project, `npm start` opens a window. Commit: `feat(desktop): scaffold electron app`
- T4.2 Transparent, frameless, always-on-top window with secure webPreferences and preload. Commit: `feat(desktop): add transparent always-on-top window`
- T4.3 Tray/menu-bar with Show/Hide and Quit. Commit: `feat(desktop): add tray menu`

## M5: Character and walking

- T5.1 Character SVG + CSS with `happy` and `idle` states. Commit: `feat(character): add base character and idle animation`
- T5.2 Walker moving the window across the work area, edge turning. Commit: `feat(desktop): walk across desktop by moving window`
- T5.3 Click-through with hover toggle. Commit: `feat(desktop): add click-through on transparent area`
- T5.4 Click reaction (jump) and manual drag. Commit: `feat(desktop): add click and drag interactions`
- T5.5 Sleep after inactivity. Commit: `feat(character): add sleeping state`

## M6: Sensor integration

- T6.1 Sensor client with polling, timeout, validation, tests. Commit: `feat(desktop): add sensor client with validation`
- T6.2 Reaction engine with tests (priority, hysteresis). Commit: `feat(desktop): add reaction engine`
- T6.3 Wire client -> engine -> renderer state. Commit: `feat(desktop): connect sensor data to character state`
- T6.4 Panel showing readings and status. Commit: `feat(desktop): add readings panel`

## M7: Remaining character states

- T7.1 `hot` and `cold`. Commit: `feat(character): add hot and cold states`
- T7.2 `humid` and `dry`. Commit: `feat(character): add humid and dry states`
- T7.3 `disconnected`. Commit: `feat(character): add disconnected state`
- T7.4 Speech bubbles. Commit: `feat(character): add state speech bubbles`

## M8: Settings and simulation

- T8.1 Settings store with validation and persistence. Commit: `feat(desktop): add persistent settings`
- T8.2 Settings window (host, interval, thresholds). Commit: `feat(desktop): add settings window`
- T8.3 Simulation mode with sliders and visible SIMULATION label. Commit: `feat(desktop): add simulation mode`

## M9: Optional sensors (four-parameter requirement) [HW]

- T9.1 Firmware LDR and sound raw readings behind config flags. Commit: `feat(firmware): add optional ldr and sound channels`
- T9.2 Show light and sound as relative values in the panel. Commit: `feat(desktop): display optional light and sound values`

## M10: Hardening and MVP demo

- T10.1 Failure drills (kill server, bad JSON, Wi-Fi drop) fixed where found. Commit: `fix(desktop): <specific fix>`
- T10.2 Performance check (idle CPU, hidden state). Commit: `perf(desktop): <specific change>`
- T10.3 `docs/10-DEV-SETUP.md` final run instructions for the demo. Commit: `docs: finalise setup and demo instructions`
- T10.4 Walk through every PRD acceptance criterion; record only real outcomes in STATUS.md. Commit: `docs: record mvp acceptance results`
- T10.5 Tag `v0.1.0-mvp`. Commit/tag message: `chore: tag mvp release`

## Later (do not start before M10)

Packaging with electron-builder, history storage, dashboard, multi-node, AI features.
