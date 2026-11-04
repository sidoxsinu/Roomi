const { screen } = require('electron');

/**
 * Pure math helper to compute next walker position and handle edge turning.
 * Exported for unit testing without Electron runtime.
 */
function stepWalker({ x, y, dir, speedPxPerSec, dtSec, workArea, windowWidth, windowHeight }) {
  const minX = Math.ceil(workArea.x);
  const maxX = Math.floor(workArea.x + workArea.width - windowWidth);
  const targetY = Math.floor(workArea.y + workArea.height - windowHeight);

  let nextDir = dir;
  let nextX = x + (dir === 'right' ? 1 : -1) * speedPxPerSec * dtSec;

  if (nextX >= maxX) {
    nextX = maxX;
    nextDir = 'left';
  } else if (nextX <= minX) {
    nextX = minX;
    nextDir = 'right';
  }

  // Strict clamp ensures coordinates strictly obey screen borders
  nextX = Math.max(minX, Math.min(maxX, nextX));

  return {
    x: nextX,
    y: targetY,
    dir: nextDir,
    turned: nextDir !== dir
  };
}

function clampToWorkArea({ x, y, workArea, windowWidth, windowHeight }) {
  const minX = Math.ceil(workArea.x);
  const maxX = Math.floor(workArea.x + workArea.width - windowWidth);
  const minY = Math.ceil(workArea.y);
  const maxY = Math.floor(workArea.y + workArea.height - windowHeight);

  const safeX = Number.isFinite(x) ? Math.round(x) : minX;
  const safeY = Number.isFinite(y) ? Math.round(y) : maxY;

  return {
    x: Math.max(minX, Math.min(maxX, safeX)),
    y: Math.max(minY, Math.min(maxY, safeY))
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
    const clamped = clampToWorkArea({
      x: initX,
      y: workArea.y + workArea.height - this.windowHeight,
      workArea,
      windowWidth: this.windowWidth,
      windowHeight: this.windowHeight
    });
    this.x = clamped.x;
    this.y = clamped.y;
    this.window.setPosition(Math.round(this.x), Math.round(this.y));

    // Handle screen resolution changes and multi-monitor additions/removals
    this.onDisplayChange = () => {
      this.repositionToWorkArea();
    };
    screen.on('display-metrics-changed', this.onDisplayChange);
    screen.on('display-added', this.onDisplayChange);
    screen.on('display-removed', this.onDisplayChange);
  }

  getWorkArea() {
    if (this.window && !this.window.isDestroyed()) {
      return screen.getDisplayMatching(this.window.getBounds()).workArea;
    }
    return screen.getPrimaryDisplay().workArea;
  }

  repositionToWorkArea() {
    const workArea = this.getWorkArea();
    const clamped = clampToWorkArea({
      x: this.x,
      y: workArea.y + workArea.height - this.windowHeight,
      workArea,
      windowWidth: this.windowWidth,
      windowHeight: this.windowHeight
    });
    this.x = clamped.x;
    this.y = clamped.y;
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
    if (this.onDisplayChange) {
      screen.removeListener('display-metrics-changed', this.onDisplayChange);
      screen.removeListener('display-added', this.onDisplayChange);
      screen.removeListener('display-removed', this.onDisplayChange);
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
    const workArea = this.getWorkArea();
    const clamped = clampToWorkArea({
      x,
      y,
      workArea,
      windowWidth: this.windowWidth,
      windowHeight: this.windowHeight
    });
    this.x = clamped.x;
    this.y = clamped.y;
    if (this.window && !this.window.isDestroyed()) {
      this.window.setPosition(Math.round(this.x), Math.round(this.y));
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
