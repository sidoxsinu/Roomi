/**
 * Physics Drop Engine for ROOMI Desktop Companion
 * 
 * Simulates real-world gravity, throw momentum, air friction, and elastic bounce
 * when dropping or tossing the desktop companion character window.
 */

class PhysicsDropEngine {
  constructor(options = {}) {
    this.gravity = options.gravity || 2200; // px/s^2 downward
    this.restitution = options.restitution !== undefined ? options.restitution : 0.42; // vertical bounce elasticity
    this.wallRestitution = options.wallRestitution !== undefined ? options.wallRestitution : 0.5; // horizontal wall bounce elasticity
    this.airDrag = options.airDrag !== undefined ? options.airDrag : 0.85; // horizontal friction per second
    this.minBounceVelocity = options.minBounceVelocity || 45; // px/s threshold to rest
    this.timer = null;
    this.isRunning = false;
  }

  /**
   * Starts a physical drop simulation.
   * 
   * @param {Object} params
   * @param {number} params.startX Initial X position
   * @param {number} params.startY Initial Y position
   * @param {number} params.vx Initial horizontal velocity (px/s)
   * @param {number} params.vy Initial vertical velocity (px/s)
   * @param {number} params.floorY Target floor Y position
   * @param {Object} params.bounds { minX, maxX, minY }
   * @param {Function} params.onStep Callback on every physics tick ({ x, y, vx, vy })
   * @param {Function} params.onBounce Callback on floor/wall impact ({ impactVelocity, x, y })
   * @param {Function} params.onRest Callback when physical movement has fully settled ({ x, y })
   */
  drop({
    startX = 0,
    startY = 0,
    vx = 0,
    vy = 0,
    floorY = 600,
    bounds = { minX: 0, maxX: 1920, minY: 0 },
    onStep = () => {},
    onBounce = () => {},
    onRest = () => {}
  }) {
    this.stop();

    const minX = Math.ceil(Number.isFinite(bounds.minX) ? bounds.minX : 0);
    const maxX = Math.floor(Number.isFinite(bounds.maxX) ? bounds.maxX : 1920);
    const minY = Math.ceil(Number.isFinite(bounds.minY) ? bounds.minY : 0);
    const safeFloorY = Math.floor(Number.isFinite(floorY) ? floorY : 600);

    let x = Number.isFinite(startX) ? Math.max(minX, Math.min(maxX, startX)) : minX;
    let y = Number.isFinite(startY) ? Math.max(minY, Math.min(safeFloorY, startY)) : minY;
    let currentVx = Number.isFinite(vx) ? Math.max(-1000, Math.min(1000, vx)) : 0;
    let currentVy = Number.isFinite(vy) ? Math.max(-1400, Math.min(1400, vy)) : 0;

    // Already on or below the floor
    if (y >= safeFloorY && Math.abs(currentVy) < 10) {
      const clampedX = Math.max(minX, Math.min(maxX, Math.round(x)));
      onStep({ x: clampedX, y: safeFloorY, vx: 0, vy: 0, isAirborne: false });
      onRest({ x: clampedX, y: safeFloorY });
      return;
    }

    this.isRunning = true;
    let lastTime = Date.now();
    const intervalMs = 16; // ~60 FPS update loop

    this.timer = setInterval(() => {
      const now = Date.now();
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000)); // Delta time in seconds
      lastTime = now;

      // Apply Gravity (downward acceleration)
      currentVy += this.gravity * dt;

      // Apply Horizontal Air Drag
      currentVx -= currentVx * this.airDrag * dt;

      // Update positions
      x += currentVx * dt;
      y += currentVy * dt;

      // Ceiling Collision (Reaching Top of Screen)
      if (y <= minY) {
        y = minY;
        currentVy = Math.abs(currentVy) * this.restitution; // Rebound downward under gravity
        const bounceX = Math.max(minX, Math.min(maxX, Math.round(x)));
        onBounce({ impactVelocity: Math.abs(currentVy), x: bounceX, y: minY, type: 'ceiling' });
      }

      // Wall Collisions
      if (x <= minX) {
        x = minX;
        currentVx = Math.abs(currentVx) * this.wallRestitution;
        const bounceY = Math.max(minY, Math.min(safeFloorY, Math.round(y)));
        onBounce({ impactVelocity: Math.abs(currentVx), x: minX, y: bounceY, type: 'wall' });
      } else if (x >= maxX) {
        x = maxX;
        currentVx = -Math.abs(currentVx) * this.wallRestitution;
        const bounceY = Math.max(minY, Math.min(safeFloorY, Math.round(y)));
        onBounce({ impactVelocity: Math.abs(currentVx), x: maxX, y: bounceY, type: 'wall' });
      }

      // Floor Collision
      if (y >= safeFloorY) {
        y = safeFloorY;
        const impactSpeed = Math.abs(currentVy);

        // Check if settled
        if (impactSpeed < this.minBounceVelocity) {
          currentVy = 0;
          currentVx = 0;
          this.stop();
          const finalX = Math.max(minX, Math.min(maxX, Number.isFinite(x) ? Math.round(x) : minX));
          const finalY = safeFloorY;
          onBounce({ impactVelocity: impactSpeed, x: finalX, y: finalY, type: 'floor', final: true });
          onStep({ x: finalX, y: finalY, vx: 0, vy: 0, isAirborne: false });
          onRest({ x: finalX, y: finalY });
          return;
        } else {
          // Bounce
          currentVy = -impactSpeed * this.restitution;
          const bounceX = Math.max(minX, Math.min(maxX, Math.round(x)));
          onBounce({ impactVelocity: impactSpeed, x: bounceX, y: safeFloorY, type: 'floor', final: false });
        }
      }

      const outX = Math.max(minX, Math.min(maxX, Number.isFinite(x) ? Math.round(x) : minX));
      const outY = Math.max(minY, Math.min(safeFloorY, Number.isFinite(y) ? Math.round(y) : safeFloorY));
      onStep({ x: outX, y: outY, vx: currentVx, vy: currentVy, isAirborne: outY < safeFloorY });
    }, intervalMs);
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
  }
}

if (typeof module !== 'undefined') {
  module.exports = { PhysicsDropEngine };
}

