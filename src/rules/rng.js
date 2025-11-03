/**
 * Seedable random number generator using xorshift32 algorithm
 * Provides deterministic randomness for testing and reproducibility
 */
export class RNG {
  /**
   * @param {number} [seed=Date.now()] - Seed for random generation
   */
  constructor(seed = Date.now()) {
    this.state = seed >>> 0; // Ensure unsigned 32-bit integer
    if (this.state === 0) {
      this.state = 1; // Avoid zero state
    }
  }

  /**
   * Generate next random number (xorshift32)
   * @returns {number} Random number between 0 and 1
   */
  next() {
    let x = this.state;
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    this.state = x >>> 0;
    return this.state / 2 ** 32;
  }

  /**
   * Roll a single six-sided die
   * @returns {number} Number between 1 and 6
   */
  d6() {
    return 1 + Math.floor(this.next() * 6);
  }

  /**
   * Roll a single ten-sided die
   * @returns {number} Number between 1 and 10
   */
  d10() {
    return 1 + Math.floor(this.next() * 10);
  }

  /**
   * Roll two six-sided dice
   * @returns {number} Sum of two dice (2-12)
   */
  roll2d6() {
    return this.d6() + this.d6();
  }

  /**
   * Get a random integer between min and max (inclusive)
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Random integer
   */
  randomInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  /**
   * Choose a random element from an array
   * @template T
   * @param {T[]} array - Array to choose from
   * @returns {T} Random element
   */
  choice(array) {
    return array[Math.floor(this.next() * array.length)];
  }

  /**
   * Get current seed state (for saving/loading)
   * @returns {number} Current state
   */
  getState() {
    return this.state;
  }

  /**
   * Set seed state (for loading saved games)
   * @param {number} state - State to restore
   */
  setState(state) {
    this.state = state >>> 0;
  }
}
