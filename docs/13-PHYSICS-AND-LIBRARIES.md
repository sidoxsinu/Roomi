# 13. Open-Source Libraries, Physics Engine & Real-Life Animations

This document details the open-source libraries and physical simulation engine integrated into ROOMI to provide realistic drag-and-drop movement, gravitational acceleration, collision restitution, and particle celebrations.

---

## 1. Open-Source Libraries Overview

| Library | Version | License | Primary Purpose in ROOMI |
|---|---|---|---|
| **animejs** | `^4.5.0` | MIT | Complex CSS keyframe morphing, elastic easing curves, and SVG path transformations. |
| **popmotion** | `^11.0.5` | MIT | Functional spring physics, decay, and momentum calculations. |
| **canvas-confetti** | `^1.9.4` | ISC | Physics-driven celebratory particle bursts upon comfort transitions. |
| **howler** | `^2.2.4` | MIT | Audio pipeline abstraction and spatial audio foundation. |

---

## 2. Real-World Gravity & Drop Physics Engine (`physics.js`)

When the user lifts the companion character and releases it in mid-air, ROOMI engages a real-time 60 FPS physics loop instead of snapping directly to the bottom taskbar:

### Mathematical Model:

1. **Gravitational Downward Acceleration**:
   $$\Delta v_y = g \times \Delta t \quad \text{where } g = 2200 \text{ px/s}^2$$
   $$y_{t} = y_{t - \Delta t} + v_y \times \Delta t$$

2. **Horizontal Throw Momentum & Air Resistance**:
   $$\Delta v_x = -v_x \times \mu_{\text{air}} \times \Delta t \quad \text{where } \mu_{\text{air}} = 0.85 \text{ s}^{-1}$$
   $$x_{t} = x_{t - \Delta t} + v_x \times \Delta t$$

3. **Floor Impact & Elastic Bounce Restitution**:
   When $y \ge \text{floorY}$:
   $$v_y' = -v_y \times e \quad \text{where } e = 0.42$$
   If $|v_y| < 45 \text{ px/s}$, the character transitions to rest ($v_y = 0, v_x = 0$), snaps cleanly to the floor, and signals the Walker engine to resume normal walking.

4. **Ceiling & Screen Edge Bouncing**:
   - **Top Ceiling Collision**: When thrown violently upwards ($v_y < 0$ and $y \le \text{minY}$), the pet rebounds downward off the ceiling under natural gravity:
     $$v_y' = |v_y| \times e \quad \text{where } e = 0.42$$
   - **Side Wall Collisions**: When $x \le \text{minX}$ or $x \ge \text{maxX}$:
     $$v_x' = -v_x \times e_{\text{wall}} \quad \text{where } e_{\text{wall}} = 0.50$$

---

## 3. Real-Life Drag & Airborne Movements

While interacting with the pet via mouse drag:

1. **Momentum Throwing**:
   - The engine continuously samples the cursor's instantaneous drag velocity vector $(v_x, v_y)$.
   - Releasing the mouse flick tosses the character into a physical parabolic trajectory.

2. **Airborne Dangle & Dynamic Tilt**:
   - While airborne, the character enters `.pet-airborne` mode: body parts wobble with dangling spring keyframes (`@keyframes airborne-dangle`).
   - The character tilts dynamically in the direction of horizontal momentum:
     $$\theta_{\text{tilt}} = \text{clamp}(-25^{\circ}, 25^{\circ}, v_x \times 0.04)$$

3. **Landing Impact (Squash & Stretch)**:
   - When hitting the floor, the character triggers a dynamic elastic squash-and-stretch animation (`@keyframes landing-impact`):
     - Initial impact compression: $y: 65\%, x: 135\%$ with a 6px floor flatten.
     - Elastic rebound: $y: 110\%, x: 92\%$ at 45% of the curve.
     - Settle back to $1.0\times$ resting dimensions.

4. **Velocity-Scaled Impact Audio**:
   - The audio engine computes the normalized impact velocity:
     $$\text{norm} = \text{clamp}(0.2, 1.0, \frac{v_{\text{impact}}}{800})$$
   - Plays a deep sub-bass thump ($120\text{--}160\text{ Hz} \to 45\text{ Hz}$) with amplitude proportional to the fall height.
   - For fast horizontal tosses ($v > 480\text{ px/s}$), an airborne whoosh sound plays.
   - For high-impact landings ($v > 450\text{ px/s}$), the pet utters playful recovery phrases ("Oof!", "Safe landing! ✨", "Bounce! 🐾").

---

## 4. Joyful Celebrations (`canvas-confetti`)

When room conditions improve into the `happy` comfort zone, or upon positive milestones, ROOMI triggers a celebratory multi-colored confetti burst accompanied by an ascending 4-tone celebration chime ($C_5, E_5, G_5, C_6$).

