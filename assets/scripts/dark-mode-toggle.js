// Dark mode toggle handler
// The button in the header toggles the "light-mode" class on the body. When
// the class is present, CSS variables defined in .light-mode override the
// default dark values, flipping the colours. We also update the emoji on
// the button to provide a visual cue for the current mode.
document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('mode-toggle');
  const body = document.body;
  if (!toggleButton) return;
  toggleButton.addEventListener('click', () => {
    body.classList.toggle('light-mode');
    // swap the icon between sun and moon
    if (body.classList.contains('light-mode')) {
      toggleButton.textContent = '🌙';
    } else {
      toggleButton.textContent = '🌞';
    }
  });
});
