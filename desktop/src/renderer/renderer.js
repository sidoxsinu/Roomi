// ROOMI Renderer Entry Point
window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('pet-container');
  const characterTarget = document.getElementById('character');
  const character = new Character(characterTarget);

  let isHovering = false;
  let isDragging = false;
  let hasDragged = false;
  let dragStartX = 0;
  let dragStartY = 0;

  // Robust forwarded-event hover detection (APP-10)
  window.addEventListener('mousemove', (event) => {
    if (isDragging) {
      const dx = event.screenX - dragStartX;
      const dy = event.screenY - dragStartY;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasDragged = true;
      }
      if (window.roomiApi) {
        window.roomiApi.dragMove({ dx, dy });
      }
      return;
    }

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
    if (isHovering && !isDragging) {
      isHovering = false;
      if (window.roomiApi) {
        window.roomiApi.setHover(false);
      }
    }
  });

  // Manual Drag and Click Interaction (APP-7)
  characterTarget.addEventListener('mousedown', (event) => {
    if (event.button !== 0) return; // Left click only
    isDragging = true;
    hasDragged = false;
    dragStartX = event.screenX;
    dragStartY = event.screenY;

    if (window.roomiApi) {
      window.roomiApi.dragStart();
    }
  });

  window.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;

    if (window.roomiApi) {
      window.roomiApi.dragEnd();
    }

    if (!hasDragged) {
      // It was a click!
      character.jump();
      if (window.roomiApi) {
        window.roomiApi.interactClick();
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
