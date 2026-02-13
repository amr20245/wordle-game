// game.js
// This module encapsulates the Wordle game logic. It keeps track of the
// configuration (number of rows and columns), the game state (current
// attempt, position and target word) and exposes functions to validate
// guesses and query the state.

const gameConfig = {
  rows: 6,
  cols: 5,
  wordLength: 5,
};

// Game state: holds the target word, the grid of guesses and current
// cursor position.
const gameState = {
  targetWord: '',
  currentRow: 0,
  currentCol: 0,
  grid: [],
};

// A simple list of fallback words to use if network requests fail. These
// words must be five letters long.
const fallbackWords = [
  'apple',
  'grape',
  'vital',
  'spice',
  'quick',
  'proxy',
  'flame',
  'serve',
  'crane',
  'blaze',
];

/**
 * Choose a random word from the API or fallback list.
 * @returns {Promise<string>} resolves to a 5-letter word
 */
async function getRandomWord() {
  const endpoint =
    'https://random-word-api.herokuapp.com/word?length=' +
    gameConfig.wordLength;
  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return data[0].toLowerCase();
    }
  } catch (err) {
    console.warn('Random word API failed; using fallback list', err);
  }
  // Fallback: pick a random word from the local array
  return fallbackWords[Math.floor(Math.random() * fallbackWords.length)];
}

/**
 * Check if a word exists in the English dictionary. This uses an external
 * dictionary API. If the API fails, the function returns false for
 * non-fallback words. For demonstration we only check against the
 * fallback list to avoid excessive network calls during development.
 * @param {string} word
 * @returns {Promise<boolean>}
 */
async function isWordValid(word) {
  // Use fallback list for offline validation. In a production build you
  // could call `https://api.dictionaryapi.dev/api/v2/entries/en/<word>`
  // and check if it returns definitions.
  return fallbackWords.includes(word.toLowerCase());
}

/**
 * Compare the guess to the target and return an array describing each
 * letter state: 'correct', 'misplaced' or 'wrong'.
 * @param {string} guess
 * @param {string} target
 * @returns {('correct' | 'misplaced' | 'wrong')[]}
 */
function checkGuess(guess, target) {
  const result = Array(gameConfig.wordLength).fill('wrong');
  const targetLetters = target.split('');
  const guessLetters = guess.split('');
  // First pass: mark correct letters and remove them from consideration
  for (let i = 0; i < guessLetters.length; i++) {
    if (guessLetters[i] === targetLetters[i]) {
      result[i] = 'correct';
      targetLetters[i] = null; // remove matched letter
      guessLetters[i] = null;
    }
  }
  // Second pass: mark misplaced letters
  for (let i = 0; i < guessLetters.length; i++) {
    if (guessLetters[i] && targetLetters.includes(guessLetters[i])) {
      result[i] = 'misplaced';
      // remove the first occurrence to handle duplicates correctly
      const index = targetLetters.indexOf(guessLetters[i]);
      targetLetters[index] = null;
    }
  }
  return result;
}

// Initialise game state by generating the target word and resetting the
// counters. This function should be called once at the start of the game.
async function initialiseGame() {
  gameState.targetWord = await getRandomWord();
  gameState.currentRow = 0;
  gameState.currentCol = 0;
  gameState.grid = Array.from({ length: gameConfig.rows }, () =>
    Array(gameConfig.cols).fill('')
  );
  console.log('Target word for debugging:', gameState.targetWord);
}

// Export objects and functions to be used by main.js
window.gameConfig = gameConfig;
window.gameState = gameState;
window.gameLogic = {
  initialiseGame,
  isWordValid,
  checkGuess,
};
