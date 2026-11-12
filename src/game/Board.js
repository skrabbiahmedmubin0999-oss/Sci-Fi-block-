/**
 * Sci-Fi Block Puzzle - Independent 8x8 Board Data Structure
 * Step 2.1 — Board Encapsulation Fix
 * 
 * Rules:
 * - Uses existing constants GRID_ROWS (8) and GRID_COLUMNS (8)
 * - 0 = Empty cell
 * - 1 = Occupied cell
 * - Internal grid is private (#grid) to prevent external tampering
 * - Dimensions are read-only getters (cannot be altered externally)
 * - Preserves all public methods and 8x8 behavior
 * - Validates dimensions and cell values strictly
 * - Pure data structure: No rendering, piece placement, scoring, or line clearing
 */

import { GRID_ROWS, GRID_COLUMNS } from '../config/constants.js';

export class Board {
  /**
   * Private internal 2D grid matrix.
   * Completely inaccessible and immutable from outside the Board class.
   * @type {number[][]}
   */
  #grid;

  /**
   * Private internal parallel 2D gem grid.
   * Stores gem type string (e.g. 'blueDiamond') or null for each cell.
   * @type {(string|null)[][]}
   */
  #gemGrid;

  /**
   * Initializes an independent 8x8 board with fully encapsulated private grids.
   */
  constructor() {
    this.validateDimensions(GRID_ROWS, GRID_COLUMNS);
    this.init();
    Object.seal(this);
  }

  /**
   * Read-only getter for row count.
   * @returns {number}
   */
  get rows() {
    return GRID_ROWS;
  }

  /**
   * Read-only getter for column count.
   * @returns {number}
   */
  get cols() {
    return GRID_COLUMNS;
  }

  /**
   * Read-only getter returning a defensive clone of the grid.
   * Prevents external mutation of the internal private state.
   * @returns {number[][]}
   */
  get grid() {
    return this.toArray();
  }

  /**
   * Read-only getter returning a defensive clone of the gem grid.
   * @returns {(string|null)[][]}
   */
  get gemGrid() {
    return this.getGemGrid();
  }

  /**
   * Initializes or resets the internal matrix filled with 0 (empty)
   * and the parallel gem matrix filled with null.
   */
  init() {
    this.#grid = [];
    this.#gemGrid = [];
    for (let r = 0; r < this.rows; r++) {
      const row = new Array(this.cols).fill(0);
      const gemRow = new Array(this.cols).fill(null);
      this.#grid.push(row);
      this.#gemGrid.push(gemRow);
    }
  }

  /**
   * Validates row and column dimension configuration.
   * @param {number} rows
   * @param {number} cols
   */
  validateDimensions(rows, cols) {
    if (!Number.isInteger(rows) || rows <= 0) {
      throw new RangeError(`Invalid row dimension: ${rows}. Must be positive integer.`);
    }
    if (!Number.isInteger(cols) || cols <= 0) {
      throw new RangeError(`Invalid column dimension: ${cols}. Must be positive integer.`);
    }
    if (rows !== GRID_ROWS || cols !== GRID_COLUMNS) {
      throw new RangeError(`Board dimensions must match constants: expected ${GRID_ROWS}x${GRID_COLUMNS}, got ${rows}x${cols}`);
    }
  }

  /**
   * Validates if the given coordinates fall within the 8x8 bounds.
   * @param {number} row
   * @param {number} col
   * @returns {boolean}
   */
  isValidCoord(row, col) {
    return (
      Number.isInteger(row) &&
      Number.isInteger(col) &&
      row >= 0 &&
      row < this.rows &&
      col >= 0 &&
      col < this.cols
    );
  }

  /**
   * Asserts that coordinates are within 8x8 bounds; throws RangeError if invalid.
   * @param {number} row
   * @param {number} col
   */
  assertValidCoord(row, col) {
    if (!this.isValidCoord(row, col)) {
      throw new RangeError(
        `Coordinate out of bounds: (${row}, ${col}). Expected row [0..${this.rows - 1}] and col [0..${this.cols - 1}].`
      );
    }
  }

  /**
   * Validates that cell value is strictly 0 (empty) or 1 (occupied).
   * @param {number} value
   */
  validateValue(value) {
    if (value !== 0 && value !== 1) {
      throw new TypeError(`Invalid cell value: ${value}. Cell values must strictly be 0 (empty) or 1 (occupied).`);
    }
  }

  /**
   * Returns cell value at (row, col).
   * @param {number} row
   * @param {number} col
   * @returns {0 | 1}
   */
  get(row, col) {
    this.assertValidCoord(row, col);
    return this.#grid[row][col];
  }

  /**
   * Sets cell value at (row, col) to 0 or 1.
   * All cell mutations must go through this method.
   * If value is 0, also clears any socketed gem at this coordinate.
   * @param {number} row
   * @param {number} col
   * @param {0 | 1} value
   */
  set(row, col, value) {
    this.assertValidCoord(row, col);
    this.validateValue(value);
    this.#grid[row][col] = value;
    if (value === 0) {
      this.#gemGrid[row][col] = null;
    }
  }

  /**
   * Returns gem type at (row, col) or null.
   * @param {number} row
   * @param {number} col
   * @returns {string | null}
   */
  getGem(row, col) {
    this.assertValidCoord(row, col);
    return this.#gemGrid[row][col];
  }

  /**
   * Returns a defensive deep clone of the 8x8 parallel gem grid.
   * Mutating the returned array will not affect internal board state.
   * @returns {(string | null)[][]}
   */
  getGemGrid() {
    return this.#gemGrid.map(row => [...row]);
  }

  /**
   * Checks if cell is occupied (value === 1).
   * @param {number} row
   * @param {number} col
   * @returns {boolean}
   */
  isOccupied(row, col) {
    return this.get(row, col) === 1;
  }

  /**
   * Checks if cell is empty (value === 0).
   * @param {number} row
   * @param {number} col
   * @returns {boolean}
   */
  isEmpty(row, col) {
    return this.get(row, col) === 0;
  }

  /**
   * Clears all cells to 0 (empty) and clears all gem data to null.
   */
  clear() {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.#grid[r][c] = 0;
        this.#gemGrid[r][c] = null;
      }
    }
  }

  /**
   * Returns total count of occupied cells (value === 1).
   * @returns {number}
   */
  getOccupiedCount() {
    let count = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.#grid[r][c] === 1) count++;
      }
    }
    return count;
  }

  /**
   * Returns total count of empty cells (value === 0).
   * @returns {number}
   */
  getEmptyCount() {
    return (this.rows * this.cols) - this.getOccupiedCount();
  }

  /**
   * Returns a deep clone of the 8x8 matrix array.
   * Mutating the returned array will not affect internal board state.
   * @returns {number[][]}
   */
  toArray() {
    return this.#grid.map(row => [...row]);
  }

  /**
   * Loads an external 8x8 matrix, validating dimensions and all cell values.
   * Atomically assigns #grid and resets every cell in #gemGrid to null.
   * If validation fails, neither grid is modified.
   * @param {number[][]} matrix
   */
  loadMatrix(matrix) {
    if (!Array.isArray(matrix) || matrix.length !== this.rows) {
      throw new RangeError(`Matrix must have exactly ${this.rows} rows.`);
    }

    for (let r = 0; r < this.rows; r++) {
      if (!Array.isArray(matrix[r]) || matrix[r].length !== this.cols) {
        throw new RangeError(`Matrix row ${r} must have exactly ${this.cols} columns.`);
      }
      for (let c = 0; c < this.cols; c++) {
        this.validateValue(matrix[r][c]);
      }
    }

    // Assign after full validation passes
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        this.#grid[r][c] = matrix[r][c];
        this.#gemGrid[r][c] = null;
      }
    }
  }

  /**
   * Validates and returns a normalized rectangular 2D shape matrix.
   * Throws TypeError or RangeError if the shape or matrix is malformed.
   * 
   * Rules:
   * - pieceOrMatrix must be a 2D array or an object with a .matrix 2D array
   * - Matrix must be non-empty (rows > 0, cols > 0)
   * - Matrix must be strictly rectangular (all rows equal length)
   * - Every cell value must strictly be 0 or 1
   * - Matrix must contain at least one occupied cell (value 1)
   * 
   * @param {number[][] | { matrix: number[][] }} pieceOrMatrix
   * @returns {number[][]}
   */
  validateShapeMatrix(pieceOrMatrix) {
    if (!pieceOrMatrix || typeof pieceOrMatrix !== 'object') {
      throw new TypeError('Piece or matrix must be a non-null object or 2D array.');
    }

    const matrix = Array.isArray(pieceOrMatrix)
      ? pieceOrMatrix
      : pieceOrMatrix.matrix;

    if (!Array.isArray(matrix) || matrix.length === 0) {
      throw new RangeError('Shape matrix must be a non-empty 2D array.');
    }

    const colCount = Array.isArray(matrix[0]) ? matrix[0].length : 0;
    if (colCount === 0) {
      throw new RangeError('Shape matrix rows must be non-empty arrays.');
    }

    let occupiedCount = 0;
    for (let r = 0; r < matrix.length; r++) {
      const row = matrix[r];
      if (!Array.isArray(row) || row.length !== colCount) {
        throw new RangeError(`Shape matrix must be rectangular. Row ${r} has length ${row?.length}, expected ${colCount}.`);
      }
      for (let c = 0; c < colCount; c++) {
        const val = row[c];
        if (val !== 0 && val !== 1) {
          throw new TypeError(`Invalid cell value at shape (${r}, ${c}): ${val}. Must strictly be 0 or 1.`);
        }
        if (val === 1) {
          occupiedCount++;
        }
      }
    }

    if (occupiedCount === 0) {
      throw new RangeError('Shape matrix must contain at least one occupied cell (value 1).');
    }

    return matrix;
  }

  /**
   * Validates whether a piece can be placed at board position (row, col).
   * 
   * Checks:
   * 1. Valid rectangular 0/1 shape matrix
   * 2. Integer row and col board coordinates
   * 3. Board boundaries for all occupied cells (value 1) of the shape
   * 4. Cell collision (target board cells must be unoccupied/0)
   * 
   * Returns false if any check fails; does NOT throw.
   * 
   * @param {number[][] | { matrix: number[][] }} piece
   * @param {number} row - Top-left row coordinate on board
   * @param {number} col - Top-left column coordinate on board
   * @returns {boolean}
   */
  canPlacePiece(piece, row, col) {
    if (!Number.isInteger(row) || !Number.isInteger(col)) {
      return false;
    }

    let matrix;
    try {
      matrix = this.validateShapeMatrix(piece);
    } catch {
      return false;
    }

    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c] === 1) {
          const targetR = row + r;
          const targetC = col + c;

          // Boundary check
          if (!this.isValidCoord(targetR, targetC)) {
            return false;
          }

          // Occupied-cell collision check
          if (this.#grid[targetR][targetC] === 1) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * Safely places a piece at board position (row, col).
   * Atomically stamps all occupied cells (value 1) into the board.
   * 
   * If placement is invalid for any reason (out of bounds, collision, malformed shape, non-integer coords),
   * returns false and GUARANTEES the board is never partially modified.
   * 
   * @param {number[][] | { matrix: number[][] }} piece
   * @param {number} row - Top-left row coordinate on board
   * @param {number} col - Top-left column coordinate on board
   * @returns {boolean} true if placed successfully, false if placement was invalid
   */
  placePiece(piece, row, col) {
    if (!this.canPlacePiece(piece, row, col)) {
      return false;
    }

    const matrix = this.validateShapeMatrix(piece);
    for (let r = 0; r < matrix.length; r++) {
      for (let c = 0; c < matrix[r].length; c++) {
        if (matrix[r][c] === 1) {
          const targetR = row + r;
          const targetC = col + c;
          this.set(targetR, targetC, 1);

          // Preserve gem data during valid Piece placement; raw matrices use null
          let gem = null;
          if (piece && typeof piece.getGemAt === 'function') {
            gem = piece.getGemAt(r, c);
          } else if (piece && piece.gemMap && typeof piece.gemMap === 'object') {
            gem = piece.gemMap[`${r},${c}`] || null;
          }
          this.#gemGrid[targetR][targetC] = typeof gem === 'string' ? gem : null;
        }
      }
    }

    return true;
  }

  /**
   * Checks for and clears all fully occupied rows and columns.
   * 
   * Rules:
   * - Scans all 8 rows and all 8 columns for complete occupancy (all cells === 1)
   * - Supports simultaneous row and column clears
   * - Deduplicates intersection cells so each cell and socketed gem is cleared and collected exactly once
   * - Resets cleared cells to 0 (empty) and clears gem data to null
   * - Leaves all non-cleared cells in their exact coordinates (no gravity)
   * 
   * @returns {{ linesCleared: number, collectedGems: Record<string, number>, rows: number[], cols: number[] }}
   */
  checkAndClearLines() {
    const fullRows = [];
    const fullCols = [];

    // 1. Identify fully occupied rows
    for (let r = 0; r < this.rows; r++) {
      let isFull = true;
      for (let c = 0; c < this.cols; c++) {
        if (this.#grid[r][c] !== 1) {
          isFull = false;
          break;
        }
      }
      if (isFull) {
        fullRows.push(r);
      }
    }

    // 2. Identify fully occupied columns
    for (let c = 0; c < this.cols; c++) {
      let isFull = true;
      for (let r = 0; r < this.rows; r++) {
        if (this.#grid[r][c] !== 1) {
          isFull = false;
          break;
        }
      }
      if (isFull) {
        fullCols.push(c);
      }
    }

    const linesCleared = fullRows.length + fullCols.length;
    const collectedGems = {};

    if (linesCleared === 0) {
      return {
        linesCleared: 0,
        collectedGems,
        rows: fullRows,
        cols: fullCols
      };
    }

    // 3. Deduplicate target cells across all cleared rows and columns
    // Set ensures crossing intersection cells are traversed only once
    const clearedCoords = new Set();
    for (const r of fullRows) {
      for (let c = 0; c < this.cols; c++) {
        clearedCoords.add(`${r},${c}`);
      }
    }
    for (const c of fullCols) {
      for (let r = 0; r < this.rows; r++) {
        clearedCoords.add(`${r},${c}`);
      }
    }

    // 4. Collect socketed gems and clear cells
    for (const coord of clearedCoords) {
      const [rStr, cStr] = coord.split(',');
      const r = Number.parseInt(rStr, 10);
      const c = Number.parseInt(cStr, 10);

      // Collect gem if present
      const gem = this.#gemGrid[r][c];
      if (gem) {
        collectedGems[gem] = (collectedGems[gem] || 0) + 1;
      }

      // Reset cell in both grids
      this.#grid[r][c] = 0;
      this.#gemGrid[r][c] = null;
    }

    return {
      linesCleared,
      collectedGems,
      rows: fullRows,
      cols: fullCols
    };
  }

  /**
   * Checks whether at least one supplied piece can legally fit anywhere on the current board.
   * 
   * Rules:
   * - Reuses existing placement validation (canPlacePiece).
   * - Scans all board coordinates (0..rows-1, 0..cols-1) for each piece.
   * - Returns true immediately on first valid placement found.
   * - Returns false if no supplied piece can legally fit anywhere.
   * - Safely returns false for empty or non-array inputs.
   * - Does NOT modify the board or place any pieces during checking.
   * 
   * @param {Array<number[][] | { matrix: number[][] }>} pieces - Array of pieces or shape matrices
   * @returns {boolean} true if at least one piece can legally fit; false otherwise
   */
  canAnyPieceFit(pieces) {
    if (!Array.isArray(pieces) || pieces.length === 0) {
      return false;
    }

    for (const piece of pieces) {
      if (!piece) continue;

      // Validate shape structure; skip malformed pieces
      try {
        this.validateShapeMatrix(piece);
      } catch {
        continue;
      }

      for (let r = 0; r < this.rows; r++) {
        for (let c = 0; c < this.cols; c++) {
          if (this.canPlacePiece(piece, r, c)) {
            return true;
          }
        }
      }
    }

    return false;
  }
}
