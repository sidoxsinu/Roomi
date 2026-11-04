const { describe, it } = require('node:test');
const assert = require('node:assert');
const { PhysicsDropEngine } = require('../src/main/physics');

describe('Physics Drop & Gravity Engine', () => {
  it('accelerates downward under gravity and lands on the floor', (t, done) => {
    const physics = new PhysicsDropEngine({ gravity: 3000, restitution: 0.4 });
    let bounceCount = 0;
    let reachedFloor = false;

    physics.drop({
      startX: 500,
      startY: 200,
      vx: 0,
      vy: 0,
      floorY: 600,
      bounds: { minX: 0, maxX: 1920 },
      onStep: ({ y, isAirborne }) => {
        if (y >= 600) reachedFloor = true;
      },
      onBounce: ({ impactVelocity, type }) => {
        if (type === 'floor') bounceCount++;
        assert.ok(impactVelocity > 0);
      },
      onRest: ({ x, y }) => {
        assert.strictEqual(y, 600);
        assert.strictEqual(x, 500);
        assert.ok(bounceCount >= 1);
        assert.ok(reachedFloor);
        done();
      }
    });
  });

  it('bounces off side walls when thrown with horizontal momentum', (t, done) => {
    const physics = new PhysicsDropEngine({ gravity: 2000, wallRestitution: 0.6 });
    let hitWall = false;

    physics.drop({
      startX: 90,
      startY: 300,
      vx: -400, // Thrown towards left wall at minX: 100
      vy: 0,
      floorY: 600,
      bounds: { minX: 100, maxX: 1000 },
      onBounce: ({ type }) => {
        if (type === 'wall') hitWall = true;
      },
      onRest: () => {
        assert.ok(hitWall, 'Expected bounce off the left wall boundary');
        done();
      }
    });
  });

  it('immediately settles when already placed on the floor', (t, done) => {
    const physics = new PhysicsDropEngine();
    let restCalled = false;

    physics.drop({
      startX: 300,
      startY: 700,
      vx: 0,
      vy: 0,
      floorY: 700,
      bounds: { minX: 0, maxX: 1920 },
      onRest: ({ x, y }) => {
        restCalled = true;
        assert.strictEqual(x, 300);
        assert.strictEqual(y, 700);
        done();
      }
    });

    assert.ok(restCalled);
  });

  it('rebounds downward off the ceiling when thrown upwards to the top of the screen', (t, done) => {
    const physics = new PhysicsDropEngine({ gravity: 3000, restitution: 0.5 });
    let hitCeiling = false;

    physics.drop({
      startX: 400,
      startY: 50,
      vx: 0,
      vy: -800, // Thrown violently upwards towards top ceiling at minY: 20
      floorY: 600,
      bounds: { minX: 0, maxX: 1920, minY: 20 },
      onBounce: ({ type }) => {
        if (type === 'ceiling') hitCeiling = true;
      },
      onRest: ({ x, y }) => {
        assert.ok(hitCeiling, 'Expected ceiling bounce when reaching top');
        assert.strictEqual(y, 600);
        assert.strictEqual(x, 400);
        done();
      }
    });
  });

  it('safely handles NaN and non-finite coordinates without throwing or emitting NaN', (t, done) => {
    const physics = new PhysicsDropEngine();

    physics.drop({
      startX: NaN,
      startY: NaN,
      vx: NaN,
      vy: NaN,
      floorY: NaN,
      bounds: { minX: 0, maxX: 1920, minY: 0 },
      onStep: ({ x, y, vx, vy }) => {
        assert.ok(Number.isFinite(x), `Expected x to be finite, got ${x}`);
        assert.ok(Number.isFinite(y), `Expected y to be finite, got ${y}`);
        assert.ok(Number.isFinite(vx), `Expected vx to be finite, got ${vx}`);
        assert.ok(Number.isFinite(vy), `Expected vy to be finite, got ${vy}`);
      },
      onRest: ({ x, y }) => {
        assert.ok(Number.isFinite(x));
        assert.ok(Number.isFinite(y));
        done();
      }
    });
  });

  it('strictly bounds all step positions within bounds even with extreme velocities', (t, done) => {
    const physics = new PhysicsDropEngine();
    const minX = 100;
    const maxX = 1600;
    const minY = 50;
    const floorY = 800;

    physics.drop({
      startX: 99999, // starting out of bounds
      startY: -99999,
      vx: 50000, // extreme velocity
      vy: -50000,
      floorY,
      bounds: { minX, maxX, minY },
      onStep: ({ x, y }) => {
        assert.ok(x >= minX, `x (${x}) must be >= minX (${minX})`);
        assert.ok(x <= maxX, `x (${x}) must be <= maxX (${maxX})`);
        assert.ok(y >= minY, `y (${y}) must be >= minY (${minY})`);
        assert.ok(y <= floorY, `y (${y}) must be <= floorY (${floorY})`);
      },
      onRest: ({ x, y }) => {
        assert.ok(x >= minX && x <= maxX);
        assert.strictEqual(y, floorY);
        done();
      }
    });
  });
});

