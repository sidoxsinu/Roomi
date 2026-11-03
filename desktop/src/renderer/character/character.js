// ROOMI Character SVG and State Manager

const CHARACTER_SVG = `
<svg id="roomi-svg" viewBox="0 0 160 160" width="150" height="150" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Normal / Happy Body Gradient -->
    <linearGradient id="bodyGradHappy" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#70e1f5" />
      <stop offset="100%" stop-color="#ffd194" />
    </linearGradient>

    <!-- Hot Body Gradient -->
    <linearGradient id="bodyGradHot" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ff758c" />
      <stop offset="100%" stop-color="#ff7eb3" />
    </linearGradient>

    <!-- Cold Body Gradient -->
    <linearGradient id="bodyGradCold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#89f7fe" />
      <stop offset="100%" stop-color="#66a6ff" />
    </linearGradient>

    <!-- Humid Gradient -->
    <linearGradient id="bodyGradHumid" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#a8edea" />
      <stop offset="100%" stop-color="#fed6e3" />
    </linearGradient>

    <!-- Dry Gradient -->
    <linearGradient id="bodyGradDry" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fddb92" />
      <stop offset="100%" stop-color="#d1fdff" />
    </linearGradient>

    <!-- Disconnected Gradient -->
    <linearGradient id="bodyGradDisc" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#bdc3c7" />
      <stop offset="100%" stop-color="#2c3e50" />
    </linearGradient>

    <!-- Drop Shadow Filter -->
    <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="3" flood-opacity="0.18" />
    </filter>
  </defs>

  <!-- Ground Shadow -->
  <ellipse id="ground-shadow" cx="80" cy="148" rx="42" ry="7" fill="rgba(0,0,0,0.18)" />

  <g id="pet-body-group" filter="url(#softShadow)">
    <!-- Tiny Feet -->
    <ellipse id="foot-left" class="foot" cx="62" cy="142" rx="9" ry="6" fill="#5cb3cc" />
    <ellipse id="foot-right" class="foot" cx="98" cy="142" rx="9" ry="6" fill="#5cb3cc" />

    <!-- Main Blob Body -->
    <path id="body-blob" d="M 80,30 C 122,30 138,65 138,102 C 138,135 118,142 80,142 C 42,142 22,135 22,102 C 22,65 38,30 80,30 Z"
          fill="url(#bodyGradHappy)" />

    <!-- Cute Blush Cheeks -->
    <ellipse id="cheek-left" class="cheek" cx="48" cy="98" rx="8" ry="5" fill="#ff7675" opacity="0.6" />
    <ellipse id="cheek-right" class="cheek" cx="112" cy="98" rx="8" ry="5" fill="#ff7675" opacity="0.6" />

    <!-- Eyes (Default Happy/Idle Eyes) -->
    <g id="eyes-group">
      <!-- Left Eye -->
      <g id="eye-left" class="eye">
        <ellipse cx="58" cy="82" rx="8" ry="11" fill="#2d3436" />
        <circle cx="56" cy="78" r="3.5" fill="#ffffff" />
        <circle cx="61" cy="87" r="1.5" fill="#ffffff" />
      </g>
      <!-- Right Eye -->
      <g id="eye-right" class="eye">
        <ellipse cx="102" cy="82" rx="8" ry="11" fill="#2d3436" />
        <circle cx="100" cy="78" r="3.5" fill="#ffffff" />
        <circle cx="105" cy="87" r="1.5" fill="#ffffff" />
      </g>
    </g>

    <!-- Sleeping Eyes (hidden by default) -->
    <g id="eyes-sleeping" class="state-overlay" style="display: none;">
      <path d="M 50,84 Q 58,92 66,84" stroke="#2d3436" stroke-width="3" stroke-linecap="round" fill="none" />
      <path d="M 94,84 Q 102,92 110,84" stroke="#2d3436" stroke-width="3" stroke-linecap="round" fill="none" />
      <text x="116" y="60" class="zzz-text" font-family="sans-serif" font-weight="bold" font-size="16" fill="#34495e">Zzz</text>
    </g>

    <!-- Mouth -->
    <g id="mouth-group">
      <!-- Happy Open Smile -->
      <path id="mouth-happy" d="M 72,96 Q 80,107 88,96 Q 80,114 72,96 Z" fill="#d63031" />
      <!-- Disconnected Mouth (O shaped) -->
      <circle id="mouth-disc" cx="80" cy="100" r="5" fill="#2d3436" style="display:none;" />
    </g>

    <!-- Sweat Drops (Hot State) -->
    <g id="sweat-drops" class="state-overlay" style="display: none;">
      <path d="M 125,55 C 122,62 118,68 123,73 C 128,78 135,74 133,67 C 131,61 125,55 125,55 Z" fill="#0984e3" />
    </g>

    <!-- Shiver Lines (Cold State) -->
    <g id="shiver-lines" class="state-overlay" style="display: none;">
      <path d="M 18,90 L 12,96 L 18,102" stroke="#74b9ff" stroke-width="2.5" fill="none" stroke-linecap="round" />
      <path d="M 142,90 L 148,96 L 142,102" stroke="#74b9ff" stroke-width="2.5" fill="none" stroke-linecap="round" />
    </g>

    <!-- Question Mark (Disconnected State) -->
    <g id="disconnected-mark" class="state-overlay" style="display: none;">
      <text x="73" y="24" font-family="sans-serif" font-weight="bold" font-size="24" fill="#e74c3c">?</text>
    </g>
  </g>
</svg>
`;

class Character {
  constructor(containerEl) {
    this.container = containerEl;
    this.container.innerHTML = CHARACTER_SVG;
    this.svg = document.getElementById('roomi-svg');
    this.blob = document.getElementById('body-blob');
    this.eyesGroup = document.getElementById('eyes-group');
    this.eyesSleeping = document.getElementById('eyes-sleeping');
    this.sweatDrops = document.getElementById('sweat-drops');
    this.shiverLines = document.getElementById('shiver-lines');
    this.discMark = document.getElementById('disconnected-mark');
    this.mouthHappy = document.getElementById('mouth-happy');
    this.mouthDisc = document.getElementById('mouth-disc');

    this.currentState = 'happy';
    this.facingDirection = 'right';
    this.isWalking = false;

    this.initAnimations();
  }

  initAnimations() {
    // Random idle blink every 3 to 6 seconds
    setInterval(() => {
      if (this.currentState === 'idle' || this.currentState === 'happy') {
        this.blink();
      }
    }, 4000);
  }

  blink() {
    if (this.currentState === 'sleeping') return;
    this.eyesGroup.style.transform = 'scaleY(0.1)';
    this.eyesGroup.style.transformOrigin = '80px 82px';
    setTimeout(() => {
      this.eyesGroup.style.transform = 'scaleY(1)';
    }, 150);
  }

  setDirection(dir, walking = false) {
    this.facingDirection = dir;
    this.isWalking = walking;

    // Horizontal flip
    if (dir === 'left') {
      this.svg.style.transform = 'scaleX(-1)';
    } else {
      this.svg.style.transform = 'scaleX(1)';
    }

    if (walking) {
      this.container.classList.add('walking');
    } else {
      this.container.classList.remove('walking');
    }
  }

  setState(state) {
    this.currentState = state;

    // Reset overlays
    this.sweatDrops.style.display = 'none';
    this.shiverLines.style.display = 'none';
    this.discMark.style.display = 'none';
    this.eyesGroup.style.display = 'block';
    this.eyesSleeping.style.display = 'none';
    this.mouthHappy.style.display = 'block';
    this.mouthDisc.style.display = 'none';
    this.container.classList.remove('shivering', 'sleeping');

    switch (state) {
      case 'happy':
      case 'idle':
        this.blob.setAttribute('fill', 'url(#bodyGradHappy)');
        break;
      case 'hot':
        this.blob.setAttribute('fill', 'url(#bodyGradHot)');
        this.sweatDrops.style.display = 'block';
        break;
      case 'cold':
        this.blob.setAttribute('fill', 'url(#bodyGradCold)');
        this.shiverLines.style.display = 'block';
        this.container.classList.add('shivering');
        break;
      case 'humid':
        this.blob.setAttribute('fill', 'url(#bodyGradHumid)');
        break;
      case 'dry':
        this.blob.setAttribute('fill', 'url(#bodyGradDry)');
        break;
      case 'disconnected':
        this.blob.setAttribute('fill', 'url(#bodyGradDisc)');
        this.discMark.style.display = 'block';
        this.mouthHappy.style.display = 'none';
        this.mouthDisc.style.display = 'block';
        break;
      case 'sleeping':
        this.blob.setAttribute('fill', 'url(#bodyGradHappy)');
        this.eyesGroup.style.display = 'none';
        this.eyesSleeping.style.display = 'block';
        this.container.classList.add('sleeping');
        break;
      default:
        this.blob.setAttribute('fill', 'url(#bodyGradHappy)');
    }
  }

  jump() {
    this.container.classList.add('jumping');
    setTimeout(() => {
      this.container.classList.remove('jumping');
    }, 600);
  }
}

if (typeof module !== 'undefined') {
  module.exports = { Character };
}
