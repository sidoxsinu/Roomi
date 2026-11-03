// ROOMI Renderer Entry Point
window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('pet-container');
  const characterTarget = document.getElementById('character');
  const character = new Character(characterTarget);

  let isHovering = false;

  // Robust forwarded-event hover detection (APP-10)
  window.addEventListener('mousemove', (event) => {
    const target = document.elementFromPoint(event.clientX, event.clientY);
    const isOverCharacter = target && (target.closest('#character') || target.closest('#speech-bubble') || target.closest('#info-panel'));

    if (isOverCharacter && !isHovering) {
      isHovering = true;
      if (window.roomiApi) {
        window.roomiApi.setHover(true);
      }
    } else if (!isOverCharacter && isHovering) {
      isHovering = false;
      if (window.roomiApi) {
        window.roomiApi.setHover(false);
      }
    }
  });

  document.addEventListener('mouseleave', () => {
    if (isHovering) {
      isHovering = false;
      if (window.roomiApi) {
        window.roomiApi.setHover(false);
      }
    }
  });

  if (window.roomiApi) {
    // Listen to walker direction updates
    window.roomiApi.onWalkerDirection(({ dir, walking }) => {
      character.setDirection(dir, walking);
    });

    // Listen to character state updates
    window.roomiApi.onCharacterState(({ state }) => {
      character.setState(state);
    });
  }

  // Expose character for testing and interaction
  window.character = character;
});
