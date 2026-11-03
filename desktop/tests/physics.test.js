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
});
