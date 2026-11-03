const { screen } = require('electron');

/**
 * Pure math helper to compute next walker position and handle edge turning.
 * Exported for unit testing without Electron runtime.
 */
function stepWalker({ x, y, dir, speedPxPerSec, dtSec, workArea, windowWidth, windowHeight }) {
  const minX = workArea.x;
  const maxX = workArea.x + workArea.width - windowWidth;
  const targetY = workArea.y + workArea.height - windowHeight;

  let nextDir = dir;
  let nextX = x + (dir === 'right' ? 1 : -1) * speedPxPerSec * dtSec;

  if (nextX >= maxX) {
    nextX = maxX;
    nextDir = 'left';
  } else if (nextX <= minX) {
    nextX = minX;
    nextDir = 'right';
  }

  return {
    x: nextX,
    y: targetY,
    dir: nextDir,
    turned: nextDir !== dir
  };
}

function clampToWorkArea({ x, y, workArea, windowWidth, windowHeight }) {
  const minX = workArea.x;
  const maxX = workArea.x + workArea.width - windowWidth;
  const minY = workArea.y;
  const maxY = workArea.y + workArea.height - windowHeight;

  return {
    x: Math.max(minX, Math.min(maxX, Number.isFinite(x) ? x : minX)),
    y: Math.max(minY, Math.min(maxY, Number.isFinite(y) ? y : maxY))
  };
}

class Walker {
  constructor(window, options = {}) {
    this.window = window;
    this.speedPxPerSec = options.speedPxPerSec || 50;
    this.dir = options.dir || 'right';
    this.isWalking = true;
    this.isPaused = false;
    this.pausedReason = null;

    this.timer = null;
    this.behaviourTimer = null;
    this.lastTickTime = Date.now();

    const [w, h] = this.window.getSize();
    this.windowWidth = w;
    this.windowHeight = h;

    const workArea = this.getWorkArea();
    const [initX, initY] = this.window.getPosition();
    this.x = initX;
    this.y = workArea.y + workArea.height - this.windowHeight;
    this.window.setPosition(Math.round(this.x), Math.round(this.y));

    // Handle screen resolution changes
    screen.on('display-metrics-changed', () => {
      this.repositionToWorkArea();
    });
  }

  getWorkArea() {
    if (this.window && !this.window.isDestroyed()) {
      return screen.getDisplayMatching(this.window.getBounds()).workArea;
    }
    return screen.getPrimaryDisplay().workArea;
  }

  repositionToWorkArea() {
    const workArea = this.getWorkArea();
    this.y = workArea.y + workArea.height - this.windowHeight;
    const minX = workArea.x;
    const maxX = workArea.x + workArea.width - this.windowWidth;
    this.x = Math.max(minX, Math.min(maxX, this.x));
    if (this.window && !this.window.isDestroyed()) {
      this.window.setPosition(Math.round(this.x), Math.round(this.y));
    }
  }

  start() {
    if (this.timer) return;
    this.lastTickTime = Date.now();
    this.timer = setInterval(() => this.tick(), 33); // ~30 fps
    this.scheduleBehaviour();
    this.emitState();
  }

  stop() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    if (this.behaviourTimer) {
      clearTimeout(this.behaviourTimer);
      this.behaviourTimer = null;
    }
  }

  pause(reason = 'external') {
    this.isPaused = true;
    this.pausedReason = reason;
    this.emitState();
  }

  resume(reason = 'external') {
    if (this.pausedReason === reason || reason === 'force') {
      this.isPaused = false;
      this.pausedReason = null;
      this.lastTickTime = Date.now();
      this.emitState();
    }
  }

  setPosition(x, y) {
    this.x = x;
    this.y = y;
    if (this.window && !this.window.isDestroyed()) {
      this.window.setPosition(Math.round(x), Math.round(y));
    }
  }

  scheduleBehaviour() {
    if (this.behaviourTimer) clearTimeout(this.behaviourTimer);

    // Random walk duration (5 to 10s) vs pause duration (2 to 4s)
    const nextDuration = this.isWalking
      ? (Math.random() * 5000 + 5000)
      : (Math.random() * 2000 + 2000);

    this.behaviourTimer = setTimeout(() => {
      if (!this.isPaused) {
        this.isWalking = !this.isWalking;
        this.emitState();
      }
      this.scheduleBehaviour();
    }, nextDuration);
  }

  tick() {
    const now = Date.now();
    const dt = Math.min((now - this.lastTickTime) / 1000, 0.1);
    this.lastTickTime = now;

    if (this.isPaused || !this.isWalking || !this.window || this.window.isDestroyed() || !this.window.isVisible()) {
      return;
    }

    const workArea = this.getWorkArea();
    const result = stepWalker({
      x: this.x,
      y: this.y,
      dir: this.dir,
      speedPxPerSec: this.speedPxPerSec,
      dtSec: dt,
      workArea,
      windowWidth: this.windowWidth,
      windowHeight: this.windowHeight
    });

    this.x = result.x;
    this.y = result.y;

    if (result.turned) {
      this.dir = result.dir;
      this.emitState();
    }

    this.window.setPosition(Math.round(this.x), Math.round(this.y));
  }

  emitState() {
    if (this.window && !this.window.isDestroyed()) {
      this.window.webContents.send('walker:direction', {
        dir: this.dir,
        walking: !this.isPaused && this.isWalking
      });
    }
  }
}

module.exports = { Walker, stepWalker, clampToWorkArea };
