# Testing and EDI Report Support

## Test levels

| Level | What | How |
|---|---|---|
| Unit | Reaction engine, validation, settings merge, walker math | `npm test` |
| Mock integration | App against mock server incl. failure mode | Manual checklist below |
| Hardware integration | App against real ESP32 | Manual checklist below, results recorded by the student |
| Measurement | Accuracy versus references | Observation table below |

## Manual checklist (record Pass/Fail with date and who ran it)

1. App starts, character visible over other windows.
2. Character walks the full width and turns at both edges.
3. Clicking transparent area reaches the app underneath.
4. Click makes the character jump; drag repositions it.
5. Mock: set temp above tempHigh, `hot` appears within two polls.
6. Mock: enable failure mode, `disconnected` appears within timeout; disable, it recovers.
7. Mock: malformed JSON does not crash the app.
8. [HW] Real readings appear and update.
9. [HW] Warm the sensor (hands or warm object), `hot` or humidity reaction appears.
10. [HW] Unplug ESP32, `disconnected`; replug, recovery.
11. Settings persist after restart.
12. Simulation label is visible whenever simulation is active.

## Observation table (EDI report)

The college format asks for at least four measured parameters. DHT provides two. Add LDR and a sound sensor, or agree an alternative with the guide.

| Sl. No. | Parameter | Measured Value | Reference/Actual Value | Percentage Error |
|---|---|---|---|---|
| 1 | Temperature | measure | reference thermometer | calculate |
| 2 | Relative humidity | measure | reference hygrometer | calculate |
| 3 | Light intensity (if added) | measure | light meter | calculate |
| 4 | Relative sound level (if added) | measure | reference instrument | calculate |

Percentage Error = |Measured - Reference| / |Reference| x 100

Rules:
- Enter only values the team actually measured. The agent must leave cells as "to be measured" and must never invent data.
- Do not report calculated statuses (for example "hot") as independently measured parameters.
- Raw LDR and sound ADC counts are relative; state this unless calibrated.
- Add screenshots only after they are captured from the running system.

## Report material the agent may prepare (text only, no invented results)

- Block diagram and circuit diagram descriptions from 02 and 03.
- Methodology from the data flow.
- Limitations from the PRD.
- IEEE-format references only for sources actually consulted: ESP32 documentation (Espressif), the exact DHT datasheet, Electron BrowserWindow docs, Arduino docs, libraries used.
- SDG mapping: SDG 3, SDG 9, SDG 11.
