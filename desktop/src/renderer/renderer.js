// ROOMI Renderer Entry Point
window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('pet-container');
  const characterTarget = document.getElementById('character');
  const character = new Character(characterTarget);

  if (window.roomiApi) {
    // Notify main when pointer enters/leaves pet bounds to toggle click-through (APP-10)
    container.addEventListener('mouseenter', () => {
      window.roomiApi.setHover(true);
    });

    container.addEventListener('mouseleave', () => {
      window.roomiApi.setHover(false);
    });

    // Listen to walker direction updates
    window.roomiApi.onWalkerDirection(({ dir, walking }) => {
      character.setDirection(dir, walking);
    });

    // Listen to character state updates
    window.roomiApi.onCharacterState(({ state }) => {
      character.setState(state);
    });
  }

  // Expose character for tests/interactions
  window.character = character;
});
