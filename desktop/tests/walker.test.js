const { describe, it } = require('node:test');
const assert = require('node:assert');
const { stepWalker, clampToWorkArea } = require('../src/main/walker');

describe('Walker step math and edge turning (APP-2)', () => {
  const workArea = { x: 0, y: 0, width: 1920, height: 1080 };
  const windowWidth = 200;
  const windowHeight = 220;

  it('moves right smoothly when not near edges', () => {
    const res = stepWalker({
      x: 500,
      y: 860,
      dir: 'right',
      speedPxPerSec: 50,
      dtSec: 0.1,
      workArea,
      windowWidth,
      windowHeight
    });

    assert.strictEqual(res.x, 505);
    assert.strictEqual(res.y, 860);
    assert.strictEqual(res.dir, 'right');
    assert.strictEqual(res.turned, false);
  });

  it('moves left smoothly when not near edges', () => {
    const res = stepWalker({
      x: 500,
      y: 860,
      dir: 'left',
      speedPxPerSec: 50,
      dtSec: 0.1,
      workArea,
      windowWidth,
      windowHeight
    });

    assert.strictEqual(res.x, 495);
    assert.strictEqual(res.y, 860);
    assert.strictEqual(res.dir, 'left');
    assert.strictEqual(res.turned, false);
  });

  it('turns around at the right screen edge', () => {
    const maxX = workArea.width - windowWidth; // 1720
    const res = stepWalker({
      x: 1718,
      y: 860,
      dir: 'right',
      speedPxPerSec: 50,
      dtSec: 0.1, // step would be +5 -> 1723 > 1720
      workArea,
      windowWidth,
      windowHeight
    });

    assert.strictEqual(res.x, maxX);
    assert.strictEqual(res.dir, 'left');
    assert.strictEqual(res.turned, true);
  });

  it('turns around at the left screen edge', () => {
    const minX = workArea.x; // 0
    const res = stepWalker({
      x: 2,
      y: 860,
      dir: 'left',
      speedPxPerSec: 50,
      dtSec: 0.1, // step would be -5 -> -3 < 0
      workArea,
      windowWidth,
      windowHeight
    });

    assert.strictEqual(res.x, minX);
    assert.strictEqual(res.dir, 'right');
    assert.strictEqual(res.turned, true);
  });

  it('keeps the window inside the display work area', () => {
    const res = clampToWorkArea({
      x: 900,
      y: 1200,
      workArea,
      windowWidth,
      windowHeight
    });

    assert.deepStrictEqual(res, { x: 900, y: 860 });
  });

  it('strictly clamps to integer pixel borders under Windows fractional DPI workAreas', () => {
    // Simulating Windows 125% scaling: 1920x1080 -> 1536 x 825.6
    const fractionalWorkArea = { x: 0, y: 0, width: 1536, height: 825.6 };
    const res = clampToWorkArea({
      x: 2000,
      y: 900,
      workArea: fractionalWorkArea,
      windowWidth,
      windowHeight
    });

    const expectedMaxX = Math.floor(1536 - windowWidth); // 1336
    const expectedMaxY = Math.floor(825.6 - windowHeight); // 605
    assert.strictEqual(res.x, expectedMaxX);
    assert.strictEqual(res.y, expectedMaxY);
    assert.ok(res.x + windowWidth <= fractionalWorkArea.width, 'Window must not exceed right border');
    assert.ok(res.y + windowHeight <= fractionalWorkArea.height, 'Window must not exceed bottom border');
  });

  it('recovers strictly into bounds when starting from an out-of-bounds position', () => {
    const res = stepWalker({
      x: 2500, // starting far past right border
      y: 860,
      dir: 'left',
      speedPxPerSec: 50,
      dtSec: 0.1,
      workArea,
      windowWidth,
      windowHeight
    });

    const maxX = workArea.width - windowWidth;
    assert.strictEqual(res.x, maxX);
    assert.strictEqual(res.dir, 'left');
    assert.ok(res.x <= maxX, 'Must clamp to maxX');
  });
});
