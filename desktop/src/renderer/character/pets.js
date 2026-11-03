// ROOMI Open-Source Desktop Pet Definitions
// Includes: 'blob' (Roomi Spirit), 'cat' (Mochi Neko), 'penguin' (Pengu), 'robot' (Robo-Node)

const PETS = {
  blob: {
    id: 'blob',
    name: 'Roomi Spirit',
    description: 'The original friendly ambient spirit blob with blushing cheeks.',
    svg: `
<svg id="pet-svg-blob" viewBox="0 0 160 160" width="150" height="150" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="blobGradHappy" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#70e1f5" />
      <stop offset="100%" stop-color="#ffd194" />
    </linearGradient>
    <linearGradient id="blobGradHot" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ff9a9e" />
      <stop offset="100%" stop-color="#fecfef" />
    </linearGradient>
    <linearGradient id="blobGradCold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#a1c4fd" />
      <stop offset="100%" stop-color="#c2e9fb" />
    </linearGradient>
    <linearGradient id="blobGradHumid" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#cfd9df" />
      <stop offset="100%" stop-color="#e2ebf0" />
    </linearGradient>
    <linearGradient id="blobGradDry" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fddb92" />
      <stop offset="100%" stop-color="#d1fdff" />
    </linearGradient>
    <linearGradient id="blobGradDisc" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#bdc3c7" />
      <stop offset="100%" stop-color="#7f8c8d" />
    </linearGradient>
  </defs>

  <ellipse class="ground-shadow" cx="80" cy="148" rx="42" ry="7" fill="rgba(0,0,0,0.18)" />

  <g class="pet-body-group">
    <!-- Tiny Feet -->
    <ellipse class="foot foot-left" cx="62" cy="142" rx="9" ry="6" fill="#5cb3cc" />
    <ellipse class="foot foot-right" cx="98" cy="142" rx="9" ry="6" fill="#5cb3cc" />

    <!-- Main Blob Body -->
    <path class="pet-body" d="M 80,30 C 122,30 138,65 138,102 C 138,135 118,142 80,142 C 42,142 22,135 22,102 C 22,65 38,30 80,30 Z" fill="url(#blobGradHappy)" />

    <!-- Blush Cheeks -->
    <ellipse class="cheek cheek-l" cx="48" cy="98" rx="8" ry="5" fill="#ff7675" opacity="0.6" />
    <ellipse class="cheek cheek-r" cx="112" cy="98" rx="8" ry="5" fill="#ff7675" opacity="0.6" />

    <!-- Eyes -->
    <g class="eyes-normal">
      <ellipse cx="58" cy="82" rx="8" ry="11" fill="#2d3436" />
      <circle cx="56" cy="78" r="3.5" fill="#ffffff" />
      <circle cx="61" cy="87" r="1.5" fill="#ffffff" />
      <ellipse cx="102" cy="82" rx="8" ry="11" fill="#2d3436" />
      <circle cx="100" cy="78" r="3.5" fill="#ffffff" />
      <circle cx="105" cy="87" r="1.5" fill="#ffffff" />
    </g>

    <!-- Sleeping Eyes -->
    <g class="eyes-sleeping" style="display: none;">
      <path d="M 50,84 Q 58,92 66,84" stroke="#2d3436" stroke-width="3" stroke-linecap="round" fill="none" />
      <path d="M 94,84 Q 102,92 110,84" stroke="#2d3436" stroke-width="3" stroke-linecap="round" fill="none" />
      <text x="116" y="60" class="zzz-text" font-family="sans-serif" font-weight="bold" font-size="16" fill="#34495e">Zzz</text>
    </g>

    <!-- Cold Eyes -->
    <g class="eyes-cold" style="display: none;">
      <path d="M 50,80 L 66,84" stroke="#2d3436" stroke-width="3" stroke-linecap="round" />
      <path d="M 110,80 L 94,84" stroke="#2d3436" stroke-width="3" stroke-linecap="round" />
    </g>

    <!-- Mouth States -->
    <path class="mouth mouth-happy" d="M 72,96 Q 80,107 88,96 Q 80,114 72,96 Z" fill="#d63031" />
    <path class="mouth mouth-hot" d="M 70,96 Q 80,115 90,96 Z" fill="#eb4d4b" style="display: none;" />
    <path class="mouth mouth-cold" d="M 71,100 L 75,96 L 79,100 L 83,96 L 87,100" stroke="#2d3436" stroke-width="2.5" fill="none" stroke-linecap="round" style="display: none;" />
    <path class="mouth mouth-humid" d="M 72,104 Q 80,97 88,104" stroke="#2d3436" stroke-width="2.5" fill="none" stroke-linecap="round" style="display: none;" />
    <g class="mouth mouth-dry" style="display: none;">
      <path d="M 72,98 Q 80,95 88,98" stroke="#2d3436" stroke-width="2.5" fill="none" stroke-linecap="round" />
      <ellipse cx="80" cy="103" rx="4" ry="5" fill="#ff7675" />
    </g>
    <circle class="mouth mouth-disc" cx="80" cy="100" r="5" fill="#2d3436" style="display: none;" />

    <!-- Overlays -->
    <g class="overlay-sweat" style="display: none;">
      <path d="M 125,55 C 122,62 118,68 123,73 C 128,78 135,74 133,67 C 131,61 125,55 125,55 Z" fill="#0984e3" />
    </g>
    <g class="overlay-shiver" style="display: none;">
      <path d="M 16,88 L 10,94 L 16,100" stroke="#74b9ff" stroke-width="2.5" fill="none" stroke-linecap="round" />
      <path d="M 144,88 L 150,94 L 144,100" stroke="#74b9ff" stroke-width="2.5" fill="none" stroke-linecap="round" />
    </g>
    <g class="overlay-disc" style="display: none;">
      <text x="73" y="24" font-family="sans-serif" font-weight="bold" font-size="24" fill="#e74c3c">?</text>
    </g>
  </g>
</svg>
`
  },

  cat: {
    id: 'cat',
    name: 'Mochi Cat (Neko)',
    description: 'Animated kitten with twitching ears, swaying tail, and expressive reactions.',
    svg: `
<svg id="pet-svg-cat" viewBox="0 0 160 160" width="150" height="150" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="catGradHappy" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffeaa7" />
      <stop offset="100%" stop-color="#fab1a0" />
    </linearGradient>
    <linearGradient id="catGradHot" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ff7675" />
      <stop offset="100%" stop-color="#fd79a8" />
    </linearGradient>
    <linearGradient id="catGradCold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#81ecec" />
      <stop offset="100%" stop-color="#74b9ff" />
    </linearGradient>
    <linearGradient id="catGradHumid" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#dfe6e9" />
      <stop offset="100%" stop-color="#b2bec3" />
    </linearGradient>
    <linearGradient id="catGradDry" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fdcb6e" />
      <stop offset="100%" stop-color="#e17055" />
    </linearGradient>
    <linearGradient id="catGradDisc" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#b2bec3" />
      <stop offset="100%" stop-color="#636e72" />
    </linearGradient>
  </defs>

  <ellipse class="ground-shadow" cx="80" cy="148" rx="44" ry="7" fill="rgba(0,0,0,0.18)" />

  <g class="pet-body-group">
    <!-- Animated Swaying Tail -->
    <path class="cat-tail" d="M 125,125 C 145,120 152,95 142,85 C 135,78 130,86 136,92 C 142,98 135,115 120,122 Z" fill="#e17055" />

    <!-- Cat Ears -->
    <g class="cat-ears">
      <!-- Left Ear -->
      <polygon class="cat-ear ear-left" points="40,65 30,22 66,42" fill="#e17055" />
      <polygon points="42,58 35,28 60,42" fill="#ff7675" opacity="0.75" />
      <!-- Right Ear -->
      <polygon class="cat-ear ear-right" points="120,65 130,22 94,42" fill="#e17055" />
      <polygon points="118,58 125,28 100,42" fill="#ff7675" opacity="0.75" />
    </g>

    <!-- Cat Body -->
    <ellipse class="pet-body" cx="80" cy="100" rx="50" ry="42" fill="url(#catGradHappy)" />

    <!-- Whiskers -->
    <g class="cat-whiskers" stroke="#2d3436" stroke-width="1.8" stroke-linecap="round">
      <line x1="28" y1="94" x2="48" y2="96" />
      <line x1="26" y1="102" x2="48" y2="101" />
      <line x1="132" y1="94" x2="112" y2="96" />
      <line x1="134" y1="102" x2="112" y2="101" />
    </g>

    <!-- Paws -->
    <ellipse class="foot foot-left" cx="62" cy="140" rx="11" ry="7" fill="#ffffff" stroke="#e17055" stroke-width="1.5" />
    <ellipse class="foot foot-right" cx="98" cy="140" rx="11" ry="7" fill="#ffffff" stroke="#e17055" stroke-width="1.5" />

    <!-- Blush Cheeks -->
    <ellipse class="cheek cheek-l" cx="50" cy="100" rx="7" ry="4" fill="#ff7675" opacity="0.6" />
    <ellipse class="cheek cheek-r" cx="110" cy="100" rx="7" ry="4" fill="#ff7675" opacity="0.6" />

    <!-- Cat Eyes -->
    <g class="eyes-normal">
      <ellipse cx="62" cy="86" rx="7" ry="9" fill="#2d3436" />
      <circle cx="60" cy="83" r="3" fill="#ffffff" />
      <circle cx="64" cy="90" r="1.2" fill="#ffffff" />
      <ellipse cx="98" cy="86" rx="7" ry="9" fill="#2d3436" />
      <circle cx="96" cy="83" r="3" fill="#ffffff" />
      <circle cx="100" cy="90" r="1.2" fill="#ffffff" />
    </g>

    <g class="eyes-sleeping" style="display: none;">
      <path d="M 54,88 Q 62,94 70,88" stroke="#2d3436" stroke-width="2.8" stroke-linecap="round" fill="none" />
      <path d="M 90,88 Q 98,94 106,88" stroke="#2d3436" stroke-width="2.8" stroke-linecap="round" fill="none" />
      <text x="114" y="62" class="zzz-text" font-family="sans-serif" font-weight="bold" font-size="16" fill="#34495e">Zzz</text>
    </g>

    <g class="eyes-cold" style="display: none;">
      <path d="M 54,84 L 70,88" stroke="#2d3436" stroke-width="3" stroke-linecap="round" />
      <path d="M 106,84 L 90,88" stroke="#2d3436" stroke-width="3" stroke-linecap="round" />
    </g>

    <!-- Tiny Cat Nose & Mouth -->
    <polygon points="77,95 83,95 80,99" fill="#ff7675" />
    <path class="mouth mouth-happy" d="M 74,99 Q 80,104 80,99 Q 80,104 86,99" stroke="#2d3436" stroke-width="2" fill="none" stroke-linecap="round" />
    <path class="mouth mouth-hot" d="M 76,99 Q 80,110 84,99 Z" fill="#d63031" style="display: none;" />
    <path class="mouth mouth-cold" d="M 74,103 L 77,100 L 80,103 L 83,100 L 86,103" stroke="#2d3436" stroke-width="2" fill="none" stroke-linecap="round" style="display: none;" />
    <path class="mouth mouth-humid" d="M 74,104 Q 80,98 86,104" stroke="#2d3436" stroke-width="2" fill="none" stroke-linecap="round" style="display: none;" />
    <g class="mouth mouth-dry" style="display: none;">
      <path d="M 74,99 Q 80,96 86,99" stroke="#2d3436" stroke-width="2" fill="none" stroke-linecap="round" />
      <ellipse cx="80" cy="104" rx="3.5" ry="5" fill="#ff7675" />
    </g>
    <circle class="mouth mouth-disc" cx="80" cy="103" r="4.5" fill="#2d3436" style="display: none;" />

    <!-- Overlays -->
    <g class="overlay-sweat" style="display: none;">
      <path d="M 120,52 C 117,58 114,64 118,68 C 122,72 128,69 127,63 Z" fill="#0984e3" />
    </g>
    <g class="overlay-shiver" style="display: none;">
      <path d="M 16,88 L 10,94 L 16,100" stroke="#74b9ff" stroke-width="2.5" fill="none" stroke-linecap="round" />
      <path d="M 144,88 L 150,94 L 144,100" stroke="#74b9ff" stroke-width="2.5" fill="none" stroke-linecap="round" />
    </g>
    <g class="overlay-disc" style="display: none;">
      <text x="73" y="24" font-family="sans-serif" font-weight="bold" font-size="24" fill="#e74c3c">?</text>
    </g>
  </g>
</svg>
`
  },

  penguin: {
    id: 'penguin',
    name: 'Pengu (Arctic Penguin)',
    description: 'Chubby penguin companion with flapping flippers and waddling webbed feet.',
    svg: `
<svg id="pet-svg-penguin" viewBox="0 0 160 160" width="150" height="150" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="penguGradHappy" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#2c3e50" />
      <stop offset="100%" stop-color="#34495e" />
    </linearGradient>
    <linearGradient id="penguGradHot" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#d63031" />
      <stop offset="100%" stop-color="#e17055" />
    </linearGradient>
    <linearGradient id="penguGradCold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0984e3" />
      <stop offset="100%" stop-color="#74b9ff" />
    </linearGradient>
    <linearGradient id="penguGradHumid" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#636e72" />
      <stop offset="100%" stop-color="#b2bec3" />
    </linearGradient>
    <linearGradient id="penguGradDry" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#e67e22" />
      <stop offset="100%" stop-color="#f39c12" />
    </linearGradient>
    <linearGradient id="penguGradDisc" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#7f8c8d" />
      <stop offset="100%" stop-color="#95a5a6" />
    </linearGradient>
  </defs>

  <ellipse class="ground-shadow" cx="80" cy="148" rx="42" ry="7" fill="rgba(0,0,0,0.18)" />

  <g class="pet-body-group">
    <!-- Webbed Feet -->
    <path class="foot foot-left" d="M 52,138 L 68,138 L 64,146 L 50,146 Z" fill="#f39c12" />
    <path class="foot foot-right" d="M 92,138 L 108,138 L 110,146 L 96,146 Z" fill="#f39c12" />

    <!-- Penguin Flippers (Wings) -->
    <ellipse class="flipper flipper-left" cx="30" cy="98" rx="10" ry="24" transform="rotate(22 30 98)" fill="#2c3e50" />
    <ellipse class="flipper flipper-right" cx="130" cy="98" rx="10" ry="24" transform="rotate(-22 130 98)" fill="#2c3e50" />

    <!-- Main Body Body -->
    <ellipse class="pet-body" cx="80" cy="92" rx="48" ry="50" fill="url(#penguGradHappy)" />

    <!-- White Belly -->
    <ellipse cx="80" cy="98" rx="34" ry="38" fill="#ffffff" />

    <!-- Cheeks -->
    <ellipse class="cheek cheek-l" cx="54" cy="92" rx="6" ry="4" fill="#ff7675" opacity="0.6" />
    <ellipse class="cheek cheek-r" cx="106" cy="92" rx="6" ry="4" fill="#ff7675" opacity="0.6" />

    <!-- Eyes -->
    <g class="eyes-normal">
      <ellipse cx="64" cy="74" rx="6" ry="8" fill="#2d3436" />
      <circle cx="62" cy="71" r="2.5" fill="#ffffff" />
      <ellipse cx="96" cy="74" rx="6" ry="8" fill="#2d3436" />
      <circle cx="94" cy="71" r="2.5" fill="#ffffff" />
    </g>

    <g class="eyes-sleeping" style="display: none;">
      <path d="M 58,76 Q 64,82 70,76" stroke="#2d3436" stroke-width="2.5" stroke-linecap="round" fill="none" />
      <path d="M 90,76 Q 96,82 102,76" stroke="#2d3436" stroke-width="2.5" stroke-linecap="round" fill="none" />
      <text x="114" y="55" class="zzz-text" font-family="sans-serif" font-weight="bold" font-size="16" fill="#34495e">Zzz</text>
    </g>

    <g class="eyes-cold" style="display: none;">
      <path d="M 58,72 L 70,76" stroke="#2d3436" stroke-width="2.5" stroke-linecap="round" />
      <path d="M 102,72 L 90,76" stroke="#2d3436" stroke-width="2.5" stroke-linecap="round" />
    </g>

    <!-- Beak -->
    <polygon class="mouth mouth-happy" points="74,84 86,84 80,94" fill="#e67e22" stroke="#d35400" stroke-width="1" />
    <polygon class="mouth mouth-hot" points="72,82 88,82 80,98" fill="#e74c3c" style="display: none;" />
    <path class="mouth mouth-cold" d="M 74,86 L 80,92 L 86,86" stroke="#d35400" stroke-width="2" fill="#e67e22" style="display: none;" />
    <polygon class="mouth mouth-humid" points="74,88 86,88 80,94" fill="#d35400" style="display: none;" />
    <g class="mouth mouth-dry" style="display: none;">
      <polygon points="74,84 86,84 80,92" fill="#e67e22" />
      <ellipse cx="80" cy="96" rx="3" ry="4" fill="#ff7675" />
    </g>
    <circle class="mouth mouth-disc" cx="80" cy="88" r="4" fill="#d35400" style="display: none;" />

    <!-- Overlays -->
    <g class="overlay-sweat" style="display: none;">
      <path d="M 115,50 C 112,56 109,61 113,65 C 117,69 123,66 122,60 Z" fill="#0984e3" />
    </g>
    <g class="overlay-shiver" style="display: none;">
      <path d="M 16,88 L 10,94 L 16,100" stroke="#74b9ff" stroke-width="2.5" fill="none" stroke-linecap="round" />
      <path d="M 144,88 L 150,94 L 144,100" stroke="#74b9ff" stroke-width="2.5" fill="none" stroke-linecap="round" />
    </g>
    <g class="overlay-disc" style="display: none;">
      <text x="73" y="24" font-family="sans-serif" font-weight="bold" font-size="24" fill="#e74c3c">?</text>
    </g>
  </g>
</svg>
`
  },

  robot: {
    id: 'robot',
    name: 'Robo-Node (IoT Bot)',
    description: 'Futuristic automaton with antenna LED status light and digital matrix eyes.',
    svg: `
<svg id="pet-svg-robot" viewBox="0 0 160 160" width="150" height="150" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="roboGradHappy" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#4facfe" />
      <stop offset="100%" stop-color="#00f2fe" />
    </linearGradient>
    <linearGradient id="roboGradHot" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ff0844" />
      <stop offset="100%" stop-color="#ffb199" />
    </linearGradient>
    <linearGradient id="roboGradCold" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#00c6fb" />
      <stop offset="100%" stop-color="#005bea" />
    </linearGradient>
    <linearGradient id="roboGradHumid" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#8baaaa" />
      <stop offset="100%" stop-color="#ae8b9c" />
    </linearGradient>
    <linearGradient id="roboGradDry" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#f83600" />
      <stop offset="100%" stop-color="#fe8c00" />
    </linearGradient>
    <linearGradient id="roboGradDisc" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#434343" />
      <stop offset="100%" stop-color="#000000" />
    </linearGradient>
  </defs>

  <ellipse class="ground-shadow" cx="80" cy="148" rx="38" ry="6" fill="rgba(0,0,0,0.2)" />

  <g class="pet-body-group">
    <!-- Antenna -->
    <line x1="80" y1="36" x2="80" y2="16" stroke="#7f8c8d" stroke-width="3" stroke-linecap="round" />
    <circle class="antenna-bulb" cx="80" cy="14" r="6" fill="#2ecc71" stroke="#27ae60" stroke-width="1.5" />

    <!-- Mechanical Feet -->
    <rect class="foot foot-left" x="52" y="136" width="16" height="10" rx="3" fill="#34495e" />
    <rect class="foot foot-right" x="92" y="136" width="16" height="10" rx="3" fill="#34495e" />

    <!-- Robot Chassis Head/Body -->
    <rect class="pet-body" x="35" y="36" width="90" height="96" rx="24" fill="url(#roboGradHappy)" stroke="#2c3e50" stroke-width="2.5" />

    <!-- Digital Visor Screen -->
    <rect x="46" y="52" width="68" height="42" rx="10" fill="#1e272e" />

    <!-- Heart / IoT Status Core -->
    <circle cx="80" cy="112" r="7" fill="#34495e" />
    <circle class="core-pulse" cx="80" cy="112" r="4.5" fill="#2ecc71" />

    <!-- Digital Pixel Matrix Eyes -->
    <g class="eyes-normal">
      <!-- Curved Happy Visor Eyes -->
      <path d="M 54,72 Q 62,64 70,72" stroke="#00d2d3" stroke-width="3.5" stroke-linecap="round" fill="none" />
      <path d="M 90,72 Q 98,64 106,72" stroke="#00d2d3" stroke-width="3.5" stroke-linecap="round" fill="none" />
    </g>

    <g class="eyes-sleeping" style="display: none;">
      <line x1="54" y1="73" x2="70" y2="73" stroke="#576574" stroke-width="3" stroke-linecap="round" />
      <line x1="90" y1="73" x2="106" y2="73" stroke="#576574" stroke-width="3" stroke-linecap="round" />
      <text x="114" y="55" class="zzz-text" font-family="monospace" font-weight="bold" font-size="15" fill="#00d2d3">Zzz</text>
    </g>

    <g class="eyes-cold" style="display: none;">
      <!-- Shivering Visor Bars -->
      <path d="M 54,68 L 70,76" stroke="#54a0ff" stroke-width="3.5" stroke-linecap="round" />
      <path d="M 106,68 L 90,76" stroke="#54a0ff" stroke-width="3.5" stroke-linecap="round" />
    </g>

    <!-- Digital Mouth Visor Display -->
    <line class="mouth mouth-happy" x1="72" y1="84" x2="88" y2="84" stroke="#00d2d3" stroke-width="2" stroke-linecap="round" />
    <path class="mouth mouth-hot" d="M 72,82 Q 80,90 88,82" stroke="#ff4757" stroke-width="2.5" fill="none" stroke-linecap="round" style="display: none;" />
    <path class="mouth mouth-cold" d="M 72,85 L 76,82 L 80,85 L 84,82 L 88,85" stroke="#54a0ff" stroke-width="2" fill="none" stroke-linecap="round" style="display: none;" />
    <path class="mouth mouth-humid" d="M 72,86 Q 80,80 88,86" stroke="#c8d6e5" stroke-width="2" fill="none" stroke-linecap="round" style="display: none;" />
    <rect class="mouth mouth-dry" x="74" y="82" width="12" height="4" rx="1" fill="#ffa502" style="display: none;" />
    <circle class="mouth mouth-disc" cx="80" cy="84" r="3" fill="#ff4757" style="display: none;" />

    <!-- Overlays -->
    <g class="overlay-sweat" style="display: none;">
      <path d="M 124,52 C 121,58 118,63 122,67 C 126,71 132,68 131,62 Z" fill="#ff4757" />
    </g>
    <g class="overlay-shiver" style="display: none;">
      <path d="M 16,88 L 10,94 L 16,100" stroke="#74b9ff" stroke-width="2.5" fill="none" stroke-linecap="round" />
      <path d="M 144,88 L 150,94 L 144,100" stroke="#74b9ff" stroke-width="2.5" fill="none" stroke-linecap="round" />
    </g>
    <g class="overlay-disc" style="display: none;">
      <text x="73" y="24" font-family="monospace" font-weight="bold" font-size="24" fill="#ff4757">!</text>
    </g>
  </g>
</svg>
`
  }
};

/**
 * Maps state to the correct gradient and overlay elements for each pet.
 */
function applyPetState(svgEl, petId, state) {
  if (!svgEl) return;

  const pet = PETS[petId] || PETS.blob;
  const capitalized = petId.charAt(0).toUpperCase() + petId.slice(1);

  // Gradient ID convention
  let gradName = `${petId}GradHappy`;
  switch (state) {
    case 'hot': gradName = `${petId}GradHot`; break;
    case 'cold': gradName = `${petId}GradCold`; break;
    case 'humid': gradName = `${petId}GradHumid`; break;
    case 'dry': gradName = `${petId}GradDry`; break;
    case 'disconnected': gradName = `${petId}GradDisc`; break;
    case 'sleeping': gradName = `${petId}GradHappy`; break;
    default: gradName = `${petId}GradHappy`; break;
  }

  const bodyEl = svgEl.querySelector('.pet-body');
  if (bodyEl) {
    bodyEl.setAttribute('fill', `url(#${gradName})`);
  }

  // Antenna LED for robot
  const antennaBulb = svgEl.querySelector('.antenna-bulb');
  const corePulse = svgEl.querySelector('.core-pulse');
  if (antennaBulb && corePulse) {
    if (state === 'disconnected') {
      antennaBulb.setAttribute('fill', '#e74c3c');
      corePulse.setAttribute('fill', '#e74c3c');
    } else if (state === 'hot') {
      antennaBulb.setAttribute('fill', '#ff9f43');
      corePulse.setAttribute('fill', '#ff9f43');
    } else {
      antennaBulb.setAttribute('fill', '#2ecc71');
      corePulse.setAttribute('fill', '#2ecc71');
    }
  }

  // Overlays & Eyes
  const eyesNormal = svgEl.querySelector('.eyes-normal');
  const eyesSleeping = svgEl.querySelector('.eyes-sleeping');
  const eyesCold = svgEl.querySelector('.eyes-cold');

  const overlaySweat = svgEl.querySelector('.overlay-sweat');
  const overlayShiver = svgEl.querySelector('.overlay-shiver');
  const overlayDisc = svgEl.querySelector('.overlay-disc');

  if (overlaySweat) overlaySweat.style.display = state === 'hot' ? 'block' : 'none';
  if (overlayShiver) overlayShiver.style.display = state === 'cold' ? 'block' : 'none';
  if (overlayDisc) overlayDisc.style.display = state === 'disconnected' ? 'block' : 'none';

  if (eyesNormal) eyesNormal.style.display = 'block';
  if (eyesSleeping) eyesSleeping.style.display = 'none';
  if (eyesCold) eyesCold.style.display = 'none';

  if (state === 'sleeping') {
    if (eyesNormal) eyesNormal.style.display = 'none';
    if (eyesSleeping) eyesSleeping.style.display = 'block';
  } else if (state === 'cold') {
    if (eyesNormal) eyesNormal.style.display = 'none';
    if (eyesCold) eyesCold.style.display = 'block';
  }

  // Mouths
  const mouths = svgEl.querySelectorAll('.mouth');
  mouths.forEach(m => m.style.display = 'none');

  const activeMouth = svgEl.querySelector(`.mouth-${state}`) || svgEl.querySelector('.mouth-happy');
  if (activeMouth) {
    activeMouth.style.display = 'block';
  }
}

if (typeof module !== 'undefined') {
  module.exports = { PETS, applyPetState };
}
