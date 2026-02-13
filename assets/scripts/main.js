// main.js
// This script ties together the DOM and the game logic. It builds the
// playing grid, handles user input and updates the UI based on game state.

document.addEventListener('DOMContentLoaded', async () => {
  const gridElement = document.getElementById('wordle-grid');
  if (!gridElement) return;

  // Build grid and initialise game
  setupGrid(gridElement);
  await window.gameLogic.initialiseGame();

  // Listen for keydown events
  document.addEventListener('keydown', handleKeydown);
});

/**
 * Build the 6x5 grid of letter cells.
 * Each cell is a div with class 'letter' and id of the form 'r-c'.
 * @param {HTMLElement} container
 */
function setupGrid(container) {
  container.innerHTML = '';
  for (let r = 0; r < window.gameConfig.rows; r++) {
    for (let c = 0; c < window.gameConfig.cols; c++) {
      const cell = document.createElement('div');
      cell.classList.add('letter');
      cell.id = `${r}-${c}`;
      container.appendChild(cell);
    }
  }
}

/**
 * Handle keyboard input. Letters add to the current position, Backspace
 * deletes the previous letter, Enter submits the guess.
 * @param {KeyboardEvent} event
 */
async function handleKeydown(event) {
  const key = event.key;
  if (isLetter(key)) {
    addLetter(key);
  } else if (key === 'Backspace') {
    removeLetter();
  } else if (key === 'Enter') {
    await submitGuess();
  }
}

/**
 * Utility function to check if the pressed key is a letter A-Z.
 * @param {string} letter
 */
function isLetter(letter) {
  return letter.length === 1 && /[a-zA-Z]/.test(letter);
}

/**
 * Add a letter to the current position in the grid and update state.
 * @param {string} letter
 */
function addLetter(letter) {
  const { currentRow, currentCol, grid } = window.gameState;
  if (currentCol >= window.gameConfig.cols || currentRow >= window.gameConfig.rows) {
    return;
  }
  grid[currentRow][currentCol] = letter.toLowerCase();
  updateCell(currentRow, currentCol, letter);
  window.gameState.currentCol++;
}

/**
 * Remove the last letter from the current guess.
 */
function removeLetter() {
  const { currentRow, currentCol, grid } = window.gameState;
  if (currentCol === 0) return;
  window.gameState.currentCol--;
  const col = window.gameState.currentCol;
  grid[currentRow][col] = '';
  updateCell(currentRow, col, '');
}

/**
 * Update a specific cell in the grid UI. Applies a bounce animation when
 * letters are placed.
 * @param {number} row
 * @param {number} col
 * @param {string} letter
 */
function updateCell(row, col, letter) {
  const cell = document.getElementById(`${row}-${col}`);
  if (!cell) return;
  cell.textContent = letter;
  cell.classList.remove('animate__bounceIn');
  if (letter) {
    // apply bounce animation
    cell.classList.add('animate__animated', 'animate__bounceIn');
    // remove animation classes once animation ends
    cell.addEventListener(
      'animationend',
      () => {
        cell.classList.remove('animate__animated', 'animate__bounceIn');
      },
      { once: true }
    );
  }
}

/**
 * Submit the current guess. Validates word length and checks if the word is in
 * the dictionary. Reveals result and advances the row or ends the game.
 */
async function submitGuess() {
  const { currentRow, grid, currentCol } = window.gameState;
  if (currentCol < window.gameConfig.cols) {
    // Not enough letters entered
    shakeMissingCells(currentRow);
    return;
  }
  const guess = grid[currentRow].join('');
  const isValid = await window.gameLogic.isWordValid(guess);
  if (!isValid) {
    // Invalid word
    shakeRow(currentRow);
        showMessage('Not a valid word');
    return;
  }
  // Compare guess with target
  const results = window.gameLogic.checkGuess(guess, window.gameState.targetWord);
  revealAttemptResult(currentRow, results);
  // Check if the guess matches the target
  if (guess === window.gameState.targetWord) {
    showMessage('You got it! 🎉');
    document.removeEventListener('keydown', handleKeydown);
    return;
  }
  // Move to next row if any remain
  window.gameState.currentRow++;
  window.gameState.currentCol = 0;
  if (window.gameState.currentRow >= window.gameConfig.rows) {
    showMessage(`Out of attempts! The word was ${window.gameState.targetWord.toUpperCase()}`);
    document.removeEventListener('keydown', handleKeydown);
  }
}

/**
 * Reveal the result of a guess by applying classes to each cell.
 * @param {number} row
 * @param {('correct'|'misplaced'|'wrong')[]} results
 */
function revealAttemptResult(row, results) {
  results.forEach((status, col) => {
    const cell = document.getElementById(`${row}-${col}`);
    if (!cell) return;
    cell.classList.remove('correct', 'misplaced', 'wrong');
    cell.classList.add(status);
  });
}

/**
 * Shake the entire row to indicate an invalid word.
 * @param {number} row
 */
function shakeRow(row) {
  for (let c = 0; c < window.gameConfig.cols; c++) {
    const cell = document.getElementById(`${row}-${c}`);
    if (!cell) continue;
    cell.classList.add('shake');
    cell.addEventListener(
      'animationend',
      () => cell.classList.remove('shake'),
      { once: true }
    );
  }
}

/**
 * Shake only the empty cells of the current row to indicate incomplete guess.
 * @param {number} row
 */
function shakeMissingCells(row) {
  for (let c = 0; c < window.gameConfig.cols; c++) {
    if (!window.gameState.grid[row][c]) {
      const cell = document.getElementById(`${row}-${c}`);
      if (!cell) continue;
      cell.classList.add('shake');
      cell.addEventListener(
        'animationend',
        () => cell.classList.remove('shake'),
        { once: true }
      );
    }
  }
}

/**
 * Display a message to the player. For simplicity we use alert(), but this
 * could be replaced with a custom overlay or toast component.
 * @param {string} message
 */
function showMessage(message) {
  setTimeout(() => {
    alert(message);
  }, 100);
}
