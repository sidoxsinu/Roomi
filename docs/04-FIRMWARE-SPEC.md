# Firmware Specification

Framework: Arduino core for ESP32. Libraries: `WiFi`, `WebServer`, `ESPmDNS` (bundled), `DHT sensor library` and `Adafruit Unified Sensor` (Adafruit), `ESP32Servo` (for quadruped walking servos).

## Files

- `roomi_esp32.ino` main sketch (combines sensor webserver and quadruped walking engine)
- `config.example.h` committed template
- `config.h` real values, gitignored

`config.example.h` must define: `WIFI_SSID`, `WIFI_PASSWORD`, `SENSOR_TYPE` (DHT11 or DHT22), `DHT_PIN` (4), `LED_PIN` (2), `LDR_PIN` (34), `SOUND_PIN` (35), `ENABLE_LDR`, `ENABLE_SOUND`, `DEVICE_ID`, `HOSTNAME` ("roomi").

## Concurrency & FreeRTOS Dual-Core Architecture

The ESP32 runs two concurrent subsystems:
1. **Core 0 (Sensor & Network Subsystem - `roomiSetup` / `roomiLoop`)**:
   - Manages Wi-Fi connection with non-blocking auto-reconnect every 5000 ms.
   - Samples DHT sensor every 2000 ms non-blockingly using `millis()`.
   - Serves `GET /data`, `GET /health`, and mDNS `roomi.local`.
   - Manages optical status beacon LED state machine.
2. **Core 1 (Quadruped Walking Locomotion - `robotSetup` / `robotLoop`)**:
   - Created via `xTaskCreatePinnedToCore(robotTask, "robot", 4096, NULL, 1, NULL, 1)`.
   - Drives 4 servos on GPIO 18 (FL), 21 (FR), 19 (BL), 22 (BR) with 50 Hz PWM.
   - Executes push-and-snap walking gait: slow synchronized push forward, alternating snap return of diagonal servo pairs (`PAIR_A` = FL+BR, `PAIR_B` = FR+BL).

## Behaviour & Safety

1. Setup: Serial 115200, init DHT, connect Wi-Fi with timeout and retry, start mDNS, start server. Pinned robot task initializes servos and calibration.
2. Loop: `server.handleClient()`; every 2000 ms read sensor; update cached reading; non-blocking (use `millis()`, no long `delay`).
3. Sensor read failure: set `sensor_status = "error"`, readings null, keep serving. Retry next cycle.
4. Wi-Fi drop: attempt reconnect every 5 s without blocking the server loop.
5. `/data`: build JSON from the cached reading; no sensor read inside the request handler.
6. Optional channels: when disabled, `light_raw` and `sound_raw` are `null`.
7. LED: slow blink = connecting, solid = connected and sensor OK, fast blink = sensor error.
8. Serial log: one line per reading and per connection event, to help debugging.

## Verification (agent must state what was actually run)

- Compile check if toolchain available; otherwise mark "Written, not compiled".
- Student verification: open `http://<esp32-ip>/data` in a browser, confirm valid JSON.
- Test error state by disconnecting the DATA wire briefly; expect `sensor_status: "error"` and nulls.

## Constraints

- No hardcoded credentials. No fabricated fallback values.
- Keep JSON building simple (snprintf or ArduinoJson if added to docs as a dependency).
