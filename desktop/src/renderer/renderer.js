// ROOMI Renderer Entry Point
window.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('pet-container');

  if (window.roomiApi) {
    // Notify main when pointer enters/leaves pet bounds to toggle click-through
    container.addEventListener('mouseenter', () => {
      window.roomiApi.setHover(true);
    });

    container.addEventListener('mouseleave', () => {
      window.roomiApi.setHover(false);
    });
  }
});
