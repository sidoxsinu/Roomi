// ROOMI Character Manager supporting multiple selectable pets

class Character {
  constructor(containerEl, petId = 'blob') {
    this.container = containerEl;
    this.currentPetId = petId;
    this.currentState = 'happy';
    this.facingDirection = 'right';
    this.isWalking = false;

    this.render();
    this.initBlinkTimer();
  }

  render() {
    const petDef = (typeof PETS !== 'undefined' && PETS[this.currentPetId])
      ? PETS[this.currentPetId]
      : (typeof PETS !== 'undefined' ? PETS.blob : null);

    if (petDef) {
      this.container.innerHTML = petDef.svg;
    }

    this.svg = this.container.querySelector('svg');
    this.applyCurrentState();
    this.setDirection(this.facingDirection, this.isWalking);
  }

  setPet(petId) {
    if (this.currentPetId === petId) return;
    this.currentPetId = petId;
    this.render();
  }

  initBlinkTimer() {
    setInterval(() => {
      if (['idle', 'happy', 'hot', 'humid', 'dry'].includes(this.currentState)) {
        this.blink();
      }
    }, 4200);
  }

  blink() {
    if (this.currentState === 'sleeping' || this.currentState === 'cold') return;
    const eyes = this.container.querySelector('.eyes-normal');
    if (!eyes) return;

    eyes.style.transform = 'scaleY(0.1)';
    eyes.style.transformOrigin = '80px 80px';
    setTimeout(() => {
      eyes.style.transform = 'scaleY(1)';
    }, 140);
  }

  setDirection(dir, walking = false) {
    this.facingDirection = dir;
    this.isWalking = walking;

    if (this.svg) {
      this.svg.style.transform = dir === 'left' ? 'scaleX(-1)' : 'scaleX(1)';
    }

    if (walking) {
      this.container.classList.add('walking');
    } else {
      this.container.classList.remove('walking');
    }
  }

  applyCurrentState() {
    if (!this.svg) return;

    this.container.classList.remove('shivering', 'sleeping');
    if (this.currentState === 'cold') {
      this.container.classList.add('shivering');
    } else if (this.currentState === 'sleeping') {
      this.container.classList.add('sleeping');
    }

    if (typeof applyPetState === 'function') {
      applyPetState(this.svg, this.currentPetId, this.currentState);
    }
  }

  setState(state) {
    this.currentState = state;
    this.applyCurrentState();
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
