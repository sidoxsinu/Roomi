# Physical Robot Hardware Guide

Status: Hardware reference for Part 1 of ROOMI (The Physical Robot Node).

ROOMI's physical component is an IoT desktop robot that sits on the user's workstation. It houses the ESP32 controller, 4 quadruped walking servos, sensory organs (DHT temperature & humidity sensor, optional LDR light and sound modules), and an optical status beacon LED.

---

## 1. Physical Robot Architecture & Enclosure

- **Form Factor**: Quadruped desk robot chassis.
- **Locomotion**: 4 micro-servos controlling front and rear leg pairs with push-and-snap gait.
- **Sensor Porting & Ventilation**: The DHT sensor is positioned near external ventilation grills or atop the robot chassis to isolate ambient airflow from internal microcontroller heat dissipation.
- **Optical Status Beacon (Robot Eye)**: An LED indicator on GPIO 2 acts as the physical robot's visual beacon:
  - *Solid ON*: Robot online and healthy, telemetry broadcasting normally.
  - *Slow Blink (1 Hz)*: Robot attempting Wi-Fi network connection.
  - *Fast Blink (5 Hz)*: Sensor read error or hardware fault alert.

---

## 2. Bill of Materials (Physical Robot Node)

| Item | Use in Physical Robot | Status |
|---|---|---|
| ESP32 Dev Board | Main robot compute core + Wi-Fi radio | Have |
| 4x Micro Servos (SG90/MG90S) | Quadruped leg actuators (FL, FR, BL, BR) | Have |
| DHT11 or DHT22 | Temperature & humidity environmental organ | Have (model switch in firmware) |
| Physical Robot Enclosure / Breadboard | Chassis assembly | Have |
| USB-C / Micro-USB cable | Power (5V) & programming link | Have |
| Status Beacon LED + Resistor | Physical robot optical eye / status beacon | Have (GPIO 2 / onboard) |
| 10k ohm Resistor | DHT pull-up & LDR voltage divider | If needed |
| LDR Light Sensor | Parameter 3 (Ambient lighting detection) | Optional / ADC1 GPIO 34 |
| Analog Sound Sensor Module | Parameter 4 (Acoustic room disturbance) | Optional / ADC1 GPIO 35 |

---

## 3. Pin Map & Electrical Wiring

| Function | ESP32 pin | Notes |
|---|---|---|
| Front Left Servo (FL) | GPIO 18 | PWM servo control (50 Hz period, 500-2400 us) |
| Front Right Servo (FR) | GPIO 21 | PWM servo control (mirrored angle) |
| Back Left Servo (BL) | GPIO 19 | PWM servo control |
| Back Right Servo (BR) | GPIO 22 | PWM servo control (mirrored angle) |
| DHT VCC | 3V3 | Use 3.3V |
| DHT GND | GND | |
| DHT DATA | GPIO 4 | 10k pull-up to 3V3 for a bare 4-pin sensor. 3-pin modules usually have one built in |
| Status LED | GPIO 2 | Through a current-limiting resistor to GND (many boards have an onboard LED here) |
| LDR divider midpoint | GPIO 34 | ADC1, input only |
| Sound sensor analog out | GPIO 35 | ADC1, input only |

Use ADC1 pins (GPIO 32-39) for analog reads. ADC2 pins are unreliable while Wi-Fi is active. Servos must be powered by a dedicated 5V rail if drawing more than USB board limits.

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
