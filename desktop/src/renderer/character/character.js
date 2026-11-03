// ROOMI Character SVG and State Manager

const CHARACTER_SVG = `
<svg id="roomi-svg" viewBox="0 0 160 160" width="150" height="150" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <!-- Normal / Happy Body Gradient -->
    <linearGradient id="bodyGradHappy" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#70e1f5" />
      <stop offset="100%" stop-color="#ffd194" />
    </linearGradient>

    <!-- Hot Body Gradient (Flushed Warm) -->
    <linearGradient id="bodyGradHot" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ff9a9e" />
      <stop offset="100%" stop-color="#fecfef" />
    </linearGradient>

    <!-- Cold Body Gradient (Chilly Ice) -->
    <linearGradient id="bodyGradCold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#a1c4fd" />
      <stop offset="100%" stop-color="#c2e9fb" />
    </linearGradient>

    <!-- Humid Gradient (Muggy/Droopy) -->
    <linearGradient id="bodyGradHumid" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#cfd9df" />
      <stop offset="100%" stop-color="#e2ebf0" />
    </linearGradient>

    <!-- Dry Gradient (Thirsty Sand) -->
    <linearGradient id="bodyGradDry" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fddb92" />
      <stop offset="100%" stop-color="#d1fdff" />
    </linearGradient>

    <!-- Disconnected Gradient (Lost Signal) -->
    <linearGradient id="bodyGradDisc" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#bdc3c7" />
      <stop offset="100%" stop-color="#7f8c8d" />
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

    <!-- Cold Chattering Eyes / Face -->
    <g id="eyes-cold" class="state-overlay" style="display: none;">
      <path d="M 50,80 L 66,84" stroke="#2d3436" stroke-width="3" stroke-linecap="round" />
      <path d="M 110,80 L 94,84" stroke="#2d3436" stroke-width="3" stroke-linecap="round" />
    </g>

    <!-- Mouth -->
    <g id="mouth-group">
      <!-- Happy Open Smile -->
      <path id="mouth-happy" d="M 72,96 Q 80,107 88,96 Q 80,114 72,96 Z" fill="#d63031" />
      <!-- Hot Panting Mouth -->
      <path id="mouth-hot" d="M 70,96 Q 80,115 90,96 Z" fill="#eb4d4b" style="display: none;" />
      <!-- Cold Chattering Zig-Zag Mouth -->
      <path id="mouth-cold" d="M 71,100 L 75,96 L 79,100 L 83,96 L 87,100" stroke="#2d3436" stroke-width="2.5" fill="none" stroke-linecap="round" style="display: none;" />
      <!-- Droopy Humid Mouth -->
      <path id="mouth-humid" d="M 72,104 Q 80,97 88,104" stroke="#2d3436" stroke-width="2.5" fill="none" stroke-linecap="round" style="display: none;" />
      <!-- Dry Thirsty Tongue Out Mouth -->
      <g id="mouth-dry" style="display: none;">
        <path d="M 72,98 Q 80,95 88,98" stroke="#2d3436" stroke-width="2.5" fill="none" stroke-linecap="round" />
        <ellipse cx="80" cy="103" rx="4" ry="5" fill="#ff7675" />
      </g>
      <!-- Disconnected Mouth (O shaped) -->
      <circle id="mouth-disc" cx="80" cy="100" r="5" fill="#2d3436" style="display: none;" />
    </g>

    <!-- Sweat Drops (Hot State) -->
    <g id="sweat-drops" class="state-overlay" style="display: none;">
      <path d="M 125,55 C 122,62 118,68 123,73 C 128,78 135,74 133,67 C 131,61 125,55 125,55 Z" fill="#0984e3" />
      <path d="M 35,62 C 32,68 30,73 34,77 C 38,81 44,77 43,72 C 41,67 35,62 35,62 Z" fill="#0984e3" />
    </g>

    <!-- Shiver Lines (Cold State) -->
    <g id="shiver-lines" class="state-overlay" style="display: none;">
      <path d="M 16,88 L 10,94 L 16,100" stroke="#74b9ff" stroke-width="2.5" fill="none" stroke-linecap="round" />
      <path d="M 144,88 L 150,94 L 144,100" stroke="#74b9ff" stroke-width="2.5" fill="none" stroke-linecap="round" />
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
    this.eyesCold = document.getElementById('eyes-cold');
    this.sweatDrops = document.getElementById('sweat-drops');
    this.shiverLines = document.getElementById('shiver-lines');
    this.discMark = document.getElementById('disconnected-mark');
    this.mouthHappy = document.getElementById('mouth-happy');
    this.mouthHot = document.getElementById('mouth-hot');
    this.mouthCold = document.getElementById('mouth-cold');
    this.mouthHumid = document.getElementById('mouth-humid');
    this.mouthDry = document.getElementById('mouth-dry');
    this.mouthDisc = document.getElementById('mouth-disc');

    this.currentState = 'happy';
    this.facingDirection = 'right';
    this.isWalking = false;

    this.initAnimations();
  }

  initAnimations() {
    // Random idle blink every 4 seconds
    setInterval(() => {
      if (['idle', 'happy', 'hot', 'humid', 'dry'].includes(this.currentState)) {
        this.blink();
      }
    }, 4000);
  }

  blink() {
    if (this.currentState === 'sleeping' || this.currentState === 'cold') return;
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

  hideAllMouths() {
    this.mouthHappy.style.display = 'none';
    this.mouthHot.style.display = 'none';
    this.mouthCold.style.display = 'none';
    this.mouthHumid.style.display = 'none';
    this.mouthDry.style.display = 'none';
    this.mouthDisc.style.display = 'none';
  }

  setState(state) {
    this.currentState = state;

    // Reset overlays
    this.sweatDrops.style.display = 'none';
    this.shiverLines.style.display = 'none';
    this.discMark.style.display = 'none';
    this.eyesGroup.style.display = 'block';
    this.eyesGroup.style.transform = 'scaleY(1)';
    this.eyesSleeping.style.display = 'none';
    this.eyesCold.style.display = 'none';
    this.hideAllMouths();
    this.container.classList.remove('shivering', 'sleeping');

    switch (state) {
      case 'happy':
      case 'idle':
        this.blob.setAttribute('fill', 'url(#bodyGradHappy)');
        this.mouthHappy.style.display = 'block';
        break;
      case 'hot':
        this.blob.setAttribute('fill', 'url(#bodyGradHot)');
        this.sweatDrops.style.display = 'block';
        this.mouthHot.style.display = 'block';
        break;
      case 'cold':
        this.blob.setAttribute('fill', 'url(#bodyGradCold)');
        this.shiverLines.style.display = 'block';
        this.eyesGroup.style.display = 'none';
        this.eyesCold.style.display = 'block';
        this.mouthCold.style.display = 'block';
        this.container.classList.add('shivering');
        break;
      case 'humid':
        this.blob.setAttribute('fill', 'url(#bodyGradHumid)');
        this.eyesGroup.style.transform = 'scaleY(0.75)';
        this.eyesGroup.style.transformOrigin = '80px 82px';
        this.mouthHumid.style.display = 'block';
        break;
      case 'dry':
        this.blob.setAttribute('fill', 'url(#bodyGradDry)');
        this.eyesGroup.style.transform = 'scaleY(0.85)';
        this.eyesGroup.style.transformOrigin = '80px 82px';
        this.mouthDry.style.display = 'block';
        break;
      case 'disconnected':
        this.blob.setAttribute('fill', 'url(#bodyGradDisc)');
        this.discMark.style.display = 'block';
        this.mouthDisc.style.display = 'block';
        break;
      case 'sleeping':
        this.blob.setAttribute('fill', 'url(#bodyGradHappy)');
        this.eyesGroup.style.display = 'none';
        this.eyesSleeping.style.display = 'block';
        this.mouthHappy.style.display = 'block';
        this.container.classList.add('sleeping');
        break;
      default:
        this.blob.setAttribute('fill', 'url(#bodyGradHappy)');
        this.mouthHappy.style.display = 'block';
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
