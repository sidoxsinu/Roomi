# Physical Robot Firmware Specification

Firmware running on Part 1 of ROOMI: **The Physical Robot Node** (ESP32 core).

Framework: Arduino core for ESP32. Libraries: `WiFi`, `WebServer`, `ESPmDNS` (bundled), `DHT sensor library` and `Adafruit Unified Sensor` (Adafruit). Can be built with Arduino IDE or PlatformIO.

---

## 1. Physical Robot Firmware Roles

1. **Environmental Sampling**: Non-blocking scheduled sampling of ambient temperature, humidity, and optional light/sound sensors.
2. **Optical Beacon State Machine**: Drives the physical robot's LED eye indicator on GPIO 2 to signal hardware health and network status.
3. **Telemetry Server**: Serves cached JSON telemetry over HTTP for the Digital Robot Twin desktop client.

## 2. Files

- `roomi_esp32.ino` main sketch
- `config.example.h` committed template
- `config.h` real values, gitignored

`config.example.h` must define: `WIFI_SSID`, `WIFI_PASSWORD`, `SENSOR_TYPE` (DHT11 or DHT22), `DHT_PIN` (4), `LED_PIN` (2), `LDR_PIN` (34), `SOUND_PIN` (35), `ENABLE_LDR`, `ENABLE_SOUND`, `DEVICE_ID`, `HOSTNAME` ("roomi").

## Behaviour

1. Setup: Serial 115200, init DHT, connect Wi-Fi with timeout and retry, start mDNS, start server.
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
