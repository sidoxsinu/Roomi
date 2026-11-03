# Hardware Guide

Status: wiring is a proposal. Verify against the exact modules before powering. The exact ESP32 board and DHT model are not yet confirmed.

## Bill of materials

| Item | Use | Status |
|---|---|---|
| ESP32 dev board | Controller + Wi-Fi | Have |
| DHT11 or DHT22 | Temperature + humidity | Have (model unconfirmed) |
| Breadboard, jumper wires | Assembly | Have |
| USB cable | Power + programming | Have |
| LED + 220-330 ohm resistor | Status indicator | Optional |
| 10k ohm resistor | DHT pull-up (bare sensor), LDR divider | If needed |
| LDR | Light (parameter 3) | May borrow |
| Analog sound sensor module | Sound level (parameter 4) | May borrow |
| OLED, buzzer, relay, fan | Future | Not for MVP |

## Pin map

| Function | ESP32 pin | Notes |
|---|---|---|
| DHT VCC | 3V3 | Use 3.3V |
| DHT GND | GND | |
| DHT DATA | GPIO 4 | 10k pull-up to 3V3 for a bare 4-pin sensor. 3-pin modules usually have one built in |
| Status LED | GPIO 2 | Through a current-limiting resistor to GND (many boards have an onboard LED here) |
| LDR divider midpoint | GPIO 34 | ADC1, input only |
| Sound sensor analog out | GPIO 35 | ADC1, input only |

Use ADC1 pins (GPIO 32-39) for analog reads. ADC2 pins are unreliable while Wi-Fi is active.

## LDR divider

3V3 -> LDR -> GPIO 34 node -> 10k resistor -> GND. Brighter light gives a higher raw value in this orientation. Values are relative until calibrated against a light meter.

## DHT11 vs DHT22

| | DHT11 | DHT22 |
|---|---|---|
| Temperature accuracy | about +/-2 C | about +/-0.5 C |
| Humidity accuracy | about +/-5 %RH | about +/-2-5 %RH |
| Min read interval | about 1 s | about 2 s |

Confirm figures from the datasheet of the actual part before quoting them in the report. Firmware uses a `SENSOR_TYPE` switch and reads no faster than every 2 s for safety.

## Bring-up checklist

1. Check board and sensor labels. Confirm 3.3V supply to the sensor.
2. Wire per the pin map, USB unplugged.
3. Flash the sensor-only sketch (M2) and read Serial at 115200.
4. Confirm sane values. Breathe on the sensor and see humidity rise.
5. Only then enable Wi-Fi and the HTTP server.
6. Record the real board and sensor model in STATUS.md.
