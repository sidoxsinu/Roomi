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
   * @param {Object} params.bounds { minX, maxX }
   * @param {Function} params.onStep Callback on every physics tick ({ x, y, vx, vy })
   * @param {Function} params.onBounce Callback on floor/wall impact ({ impactVelocity, x, y })
   * @param {Function} params.onRest Callback when physical movement has fully settled ({ x, y })
   */
  drop({
    startX,
    startY,
    vx = 0,
    vy = 0,
    floorY,
    bounds = { minX: 0, maxX: 1920 },
    onStep = () => {},
    onBounce = () => {},
    onRest = () => {}
  }) {
    this.stop();

    // Already on or below the floor
    if (startY >= floorY && Math.abs(vy) < 10) {
      onStep({ x: Math.max(bounds.minX, Math.min(bounds.maxX, startX)), y: floorY, vx: 0, vy: 0, isAirborne: false });
      onRest({ x: Math.max(bounds.minX, Math.min(bounds.maxX, startX)), y: floorY });
      return;
    }

    this.isRunning = true;
    let x = startX;
    let y = startY;
    let currentVx = Math.max(-1000, Math.min(1000, vx));
    let currentVy = Math.max(-1200, Math.min(1200, vy));

    let lastTime = Date.now();
    const intervalMs = 16; // ~60 FPS update loop

    this.timer = setInterval(() => {
      const now = Date.now();
      const dt = Math.min(0.05, Math.max(0.001, (now - lastTime) / 1000)); // Delta time in seconds
      lastTime = now;

      // Apply Gravity
      currentVy += this.gravity * dt;

      // Apply Horizontal Air Drag
      currentVx -= currentVx * this.airDrag * dt;

      // Update positions
      x += currentVx * dt;
      y += currentVy * dt;

      // Wall Collisions
      if (x < bounds.minX) {
        x = bounds.minX;
        currentVx = -currentVx * this.wallRestitution;
        onBounce({ impactVelocity: Math.abs(currentVx), x, y, type: 'wall' });
      } else if (x > bounds.maxX) {
        x = bounds.maxX;
        currentVx = -currentVx * this.wallRestitution;
        onBounce({ impactVelocity: Math.abs(currentVx), x, y, type: 'wall' });
      }

      // Floor Collision
      if (y >= floorY) {
        y = floorY;
        const impactSpeed = Math.abs(currentVy);

        // Check if settled
        if (impactSpeed < this.minBounceVelocity) {
          currentVy = 0;
          currentVx = 0;
          this.stop();
          onBounce({ impactVelocity: impactSpeed, x, y, type: 'floor', final: true });
          onStep({ x, y, vx: 0, vy: 0, isAirborne: false });
          onRest({ x, y });
          return;
        } else {
          // Bounce
          currentVy = -impactSpeed * this.restitution;
          onBounce({ impactVelocity: impactSpeed, x, y, type: 'floor', final: false });
        }
      }

      onStep({ x, y, vx: currentVx, vy: currentVy, isAirborne: y < floorY });
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
