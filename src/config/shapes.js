/**
 * Sci-Fi Block Puzzle - Polyomino Shape Definitions
 * 
 * Matrix format:
 * - 2D rectangular array: matrix[row][col]
 * - 1 = Occupied cell
 * - 0 = Empty cell
 * - Immutable data structures (deep frozen)
 */

/**
 * Deeply freezes an object/array to guarantee immutability.
 * @template T
 * @param {T} obj
 * @returns {Readonly<T>}
 */
function deepFreeze(obj) {
  Object.freeze(obj);
  Object.getOwnPropertyNames(obj).forEach((prop) => {
    const val = obj[prop];
    if (val !== null && (typeof val === 'object' || typeof val === 'function') && !Object.isFrozen(val)) {
      deepFreeze(val);
    }
  });
  return obj;
}

/** 2x2 Square Shape */
export const SHAPE_O = deepFreeze([
  [1, 1],
  [1, 1]
]);

/** 1x4 Line Shape */
export const SHAPE_I = deepFreeze([
  [1, 1, 1, 1]
]);

/** T-Shape */
export const SHAPE_T = deepFreeze([
  [1, 1, 1],
  [0, 1, 0]
]);

/** L-Shape */
export const SHAPE_L = deepFreeze([
  [1, 0],
  [1, 0],
  [1, 1]
]);

/** J-Shape (Mirrored L) */
export const SHAPE_J = deepFreeze([
  [0, 1],
  [0, 1],
  [1, 1]
]);

/** S-Shape */
export const SHAPE_S = deepFreeze([
  [0, 1, 1],
  [1, 1, 0]
]);

/** Z-Shape (Mirrored S) */
export const SHAPE_Z = deepFreeze([
  [1, 1, 0],
  [0, 1, 1]
]);

/** Cross / Plus Shape */
export const SHAPE_CROSS = deepFreeze([
  [0, 1, 0],
  [1, 1, 1],
  [0, 1, 0]
]);

/**
 * Registry of all available standard polyomino shapes.
 */
export const SHAPES = deepFreeze({
  O: SHAPE_O,
  I: SHAPE_I,
  T: SHAPE_T,
  L: SHAPE_L,
  J: SHAPE_J,
  S: SHAPE_S,
  Z: SHAPE_Z,
  CROSS: SHAPE_CROSS
});
