/**
 * Sci-Fi Block Puzzle - Focused Unit Tests for Step 2.3
 * Clear Rules, Intersection Deduplication, and Gem Retention
 */

import assert from 'node:assert/strict';
import { Board } from '../src/game/Board.js';
import { Piece } from '../src/game/Piece.js';
import { SHAPE_I, SHAPE_O, SHAPE_CROSS } from '../src/config/shapes.js';
import { GEM_TYPES } from '../src/renderers/GemRenderer.js';

console.log('--- Starting Step 2.3 Clear Rules & Gem Retention Tests ---');

// Test 1: Single Row Clear
{
  const board = new Board();

  // Fill row 3 completely using two 1x4 pieces; socket a blue diamond at board (3, 2)
  const p1 = new Piece('p1', [[1, 1, 1, 1]], { '0,2': GEM_TYPES.BLUE_DIAMOND });
  const p2 = new Piece('p2', [[1, 1, 1, 1]]);

  assert.equal(board.placePiece(p1, 3, 0), true);
  assert.equal(board.placePiece(p2, 3, 4), true);

  assert.equal(board.getGem(3, 2), GEM_TYPES.BLUE_DIAMOND);
  assert.equal(board.getOccupiedCount(), 8);

  const result = board.checkAndClearLines();

  assert.equal(result.linesCleared, 1, 'Exactly 1 line should be cleared');
  assert.deepEqual(result.rows, [3], 'Row 3 should be recorded in rows');
  assert.deepEqual(result.cols, [], 'No columns should be cleared');
  assert.deepEqual(result.collectedGems, { [GEM_TYPES.BLUE_DIAMOND]: 1 }, '1 blue diamond must be collected');

  // Verify all cells in row 3 are reset to 0 and null
  for (let c = 0; c < 8; c++) {
    assert.equal(board.get(3, c), 0, `Cell (3, ${c}) must be 0 after clear`);
    assert.equal(board.getGem(3, c), null, `Gem at (3, ${c}) must be null after clear`);
  }
  assert.equal(board.getOccupiedCount(), 0);

  console.log('✓ Test 1: Single row clear & gem collection passed');
}

// Test 2: Single Column Clear
{
  const board = new Board();

  // Fill column 5 completely using two 4x1 pieces; place red triangles at board (1, 5) and (6, 5)
  const colShape = [[1], [1], [1], [1]];
  const p1 = new Piece('col_p1', colShape, { '1,0': GEM_TYPES.RED_TRIANGLE }); // lands at row 1
  const p2 = new Piece('col_p2', colShape, { '2,0': GEM_TYPES.RED_TRIANGLE }); // lands at row 6

  assert.equal(board.placePiece(p1, 0, 5), true);
  assert.equal(board.placePiece(p2, 4, 5), true);

  assert.equal(board.getGem(1, 5), GEM_TYPES.RED_TRIANGLE);
  assert.equal(board.getGem(6, 5), GEM_TYPES.RED_TRIANGLE);
  assert.equal(board.getOccupiedCount(), 8);

  const result = board.checkAndClearLines();

  assert.equal(result.linesCleared, 1);
  assert.deepEqual(result.rows, []);
  assert.deepEqual(result.cols, [5]);
  assert.deepEqual(result.collectedGems, { [GEM_TYPES.RED_TRIANGLE]: 2 });

  for (let r = 0; r < 8; r++) {
    assert.equal(board.get(r, 5), 0);
    assert.equal(board.getGem(r, 5), null);
  }
  assert.equal(board.getOccupiedCount(), 0);

  console.log('✓ Test 2: Single column clear & multi-gem collection passed');
}

// Test 3: Simultaneous Multi-Row Clears
{
  const board = new Board();

  // Fill row 1 and row 4 using 1x4 pieces
  assert.equal(board.placePiece([[1, 1, 1, 1]], 1, 0), true);
  assert.equal(board.placePiece([[1, 1, 1, 1]], 1, 4), true);
  assert.equal(board.placePiece([[1, 1, 1, 1]], 4, 0), true);
  assert.equal(board.placePiece([[1, 1, 1, 1]], 4, 4), true);

  assert.equal(board.getOccupiedCount(), 16);

  const result = board.checkAndClearLines();
  assert.equal(result.linesCleared, 2);
  assert.deepEqual(result.rows, [1, 4]);
  assert.deepEqual(result.cols, []);
  assert.equal(board.getOccupiedCount(), 0);

  console.log('✓ Test 3: Simultaneous multi-row clear passed');
}

// Test 4: Simultaneous Cross-Clearing (Row + Column) with Intersection Deduplication
{
  const board = new Board();

  // 1. Fill row 2 using two 1x4 pieces:
  // Piece A at (2, 0) covers cols 0..3:
  // amberOctagon at local (0, 0) -> board (2, 0)
  // purpleHexagon at local (0, 3) -> board (2, 3) (the intersection!)
  const rowPieceA = new Piece('row_a', [[1, 1, 1, 1]], {
    '0,0': GEM_TYPES.AMBER_OCTAGON,
    '0,3': GEM_TYPES.PURPLE_HEXAGON
  });
  const rowPieceB = new Piece('row_b', [[1, 1, 1, 1]]);

  assert.equal(board.placePiece(rowPieceA, 2, 0), true);
  assert.equal(board.placePiece(rowPieceB, 2, 4), true);

  // 2. Fill column 3 (cells (0..1, 3) and (3..7, 3)) without colliding with (2, 3):
  const colTop = new Piece('col_top', [[1], [1]]); // rows 0, 1 of col 3
  const colMid = new Piece('col_mid', [[1], [1], [1], [1]]); // rows 3, 4, 5, 6 of col 3
  const colBot = new Piece('col_bot', [[1]]); // row 7 of col 3

  assert.equal(board.placePiece(colTop, 0, 3), true);
  assert.equal(board.placePiece(colMid, 3, 3), true);
  assert.equal(board.placePiece(colBot, 7, 3), true);

  // Total unique occupied cells: 8 (row 2) + 8 (col 3) - 1 (intersection at 2,3) = 15 cells
  assert.equal(board.getOccupiedCount(), 15);
  assert.equal(board.getGem(2, 3), GEM_TYPES.PURPLE_HEXAGON, 'Intersection must hold purple hexagon');
  assert.equal(board.getGem(2, 0), GEM_TYPES.AMBER_OCTAGON, 'Cell (2, 0) must hold amber octagon');

  const result = board.checkAndClearLines();

  assert.equal(result.linesCleared, 2, 'Total lines cleared must be 2 (1 row + 1 col)');
  assert.deepEqual(result.rows, [2]);
  assert.deepEqual(result.cols, [3]);

  // CRITICAL: Intersection gem must be collected EXACTLY ONCE
  assert.equal(
    result.collectedGems[GEM_TYPES.PURPLE_HEXAGON],
    1,
    'Intersection gem must be collected exactly once, not twice!'
  );
  assert.equal(result.collectedGems[GEM_TYPES.AMBER_OCTAGON], 1);

  // All 15 cells should now be empty and cleared of gems
  assert.equal(board.getOccupiedCount(), 0);
  assert.equal(board.get(2, 3), 0);
  assert.equal(board.getGem(2, 3), null);

  console.log('✓ Test 4: Cross-clearing with intersection deduplication passed');
}

// Test 5: Preservation of Non-Cleared Cells (Strictly No Gravity)
{
  const board = new Board();

  // Pre-place isolated blocks using placePiece:
  // (0, 0), (7, 7), and (4, 2) with green emerald
  const isolatedGem = new Piece('p_emerald', [[1]], { '0,0': GEM_TYPES.GREEN_EMERALD });
  assert.equal(board.placePiece([[1]], 0, 0), true);
  assert.equal(board.placePiece([[1]], 7, 7), true);
  assert.equal(board.placePiece(isolatedGem, 4, 2), true);

  // Fill row 5 completely using two 1x4 pieces (which does NOT include row 0, 4, or 7)
  assert.equal(board.placePiece([[1, 1, 1, 1]], 5, 0), true);
  assert.equal(board.placePiece([[1, 1, 1, 1]], 5, 4), true);

  assert.equal(board.getOccupiedCount(), 11); // 8 in row 5 + 3 isolated

  const result = board.checkAndClearLines();
  assert.equal(result.linesCleared, 1);
  assert.deepEqual(result.rows, [5]);

  // Non-cleared cells MUST remain at their EXACT coordinates (no gravity!)
  assert.equal(board.get(0, 0), 1, 'Cell (0, 0) must stay occupied');
  assert.equal(board.get(7, 7), 1, 'Cell (7, 7) must stay occupied');
  assert.equal(board.get(4, 2), 1, 'Cell (4, 2) must stay occupied');
  assert.equal(board.getGem(4, 2), GEM_TYPES.GREEN_EMERALD, 'Gem at (4, 2) must remain intact');

  // Verify total occupied count is exactly 3
  assert.equal(board.getOccupiedCount(), 3);

  console.log('✓ Test 5: Preservation of non-cleared cells (no gravity) passed');
}

// Test 6: Piece Placement with Gem Retention and Raw Matrix Defaults
{
  const board = new Board();

  // 1. Piece instance with gems
  const pieceWithGems = new Piece('p_test', SHAPE_CROSS, {
    '0,1': GEM_TYPES.BLUE_DIAMOND,
    '1,1': GEM_TYPES.PURPLE_HEXAGON
  });

  const placedPiece = board.placePiece(pieceWithGems, 0, 0);
  assert.equal(placedPiece, true);

  // Occupied cells of Cross placed at (0, 0):
  // (0, 1) -> 1 with blueDiamond
  // (1, 0) -> 1 without gem (null)
  // (1, 1) -> 1 with purpleHexagon
  // (1, 2) -> 1 without gem (null)
  // (2, 1) -> 1 without gem (null)
  assert.equal(board.get(0, 1), 1);
  assert.equal(board.getGem(0, 1), GEM_TYPES.BLUE_DIAMOND);

  assert.equal(board.get(1, 0), 1);
  assert.equal(board.getGem(1, 0), null);

  assert.equal(board.get(1, 1), 1);
  assert.equal(board.getGem(1, 1), GEM_TYPES.PURPLE_HEXAGON);

  // 2. Raw 2D array matrix placement (must safely default to null gems)
  const placedRaw = board.placePiece(SHAPE_O, 5, 5);
  assert.equal(placedRaw, true);
  assert.equal(board.get(5, 5), 1);
  assert.equal(board.getGem(5, 5), null, 'Raw matrix placement must have null gem');

  console.log('✓ Test 6: Piece gem retention and raw matrix defaults passed');
}

// Test 7: Binary-only loadMatrix(matrix) resets all gems to null & preserves atomicity
{
  const board = new Board();

  // 1. Pre-place a piece with gems
  const piece = new Piece('p_gem', [[1, 1], [1, 1]], {
    '0,0': GEM_TYPES.BLUE_DIAMOND,
    '1,1': GEM_TYPES.AMBER_OCTAGON
  });
  board.placePiece(piece, 2, 2);
  assert.equal(board.getGem(2, 2), GEM_TYPES.BLUE_DIAMOND);
  assert.equal(board.getGem(3, 3), GEM_TYPES.AMBER_OCTAGON);

  // 2. Calling binary-only loadMatrix(matrix) MUST clear all previously stored gems
  const newMatrix = Array.from({ length: 8 }, (_, r) =>
    Array.from({ length: 8 }, (_, c) => (r === c ? 1 : 0))
  );
  board.loadMatrix(newMatrix);

  // Verify binary occupancy is loaded
  assert.equal(board.get(0, 0), 1);
  assert.equal(board.get(1, 1), 1);
  assert.equal(board.getOccupiedCount(), 8);

  // Verify every gem cell was reset to null
  const gemGrid = board.getGemGrid();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      assert.equal(board.getGem(r, c), null, `Gem at (${r}, ${c}) must be null after loadMatrix`);
      assert.equal(gemGrid[r][c], null);
    }
  }

  // 3. Atomic validation: An invalid matrix must throw and modify NEITHER #grid NOR #gemGrid
  const snapshotGrid = board.toArray();
  const snapshotGems = board.getGemGrid();

  // Invalid row count (7 rows)
  assert.throws(() => board.loadMatrix(newMatrix.slice(0, 7)), RangeError);
  assert.deepEqual(board.toArray(), snapshotGrid, '#grid must not be modified after failed loadMatrix');
  assert.deepEqual(board.getGemGrid(), snapshotGems, '#gemGrid must not be modified after failed loadMatrix');

  // Invalid col count (ragged row)
  const badCols = newMatrix.map(row => [...row]);
  badCols[2] = [1, 0];
  assert.throws(() => board.loadMatrix(badCols), RangeError);
  assert.deepEqual(board.toArray(), snapshotGrid);
  assert.deepEqual(board.getGemGrid(), snapshotGems);

  // Invalid cell value (value 9)
  const badVal = newMatrix.map(row => [...row]);
  badVal[3][3] = 9;
  assert.throws(() => board.loadMatrix(badVal), TypeError);
  assert.deepEqual(board.toArray(), snapshotGrid);
  assert.deepEqual(board.getGemGrid(), snapshotGems);

  console.log('✓ Test 7: Binary-only loadMatrix resets all gems & preserves atomicity passed');
}

// Test 8: Lifecycle Synchronization & Defensive Cloning
{
  const board = new Board();

  // Pre-place a piece with gem
  const p = new Piece('p_sync', [[1]], { '0,0': GEM_TYPES.BLUE_DIAMOND });
  board.placePiece(p, 1, 1);
  assert.equal(board.getGem(1, 1), GEM_TYPES.BLUE_DIAMOND);

  // Test set(r, c, 0) resets gem
  board.set(1, 1, 0);
  assert.equal(board.get(1, 1), 0);
  assert.equal(board.getGem(1, 1), null, 'set(r, c, 0) must synchronize gem to null');

  // Test clear()
  board.placePiece(p, 2, 2);
  assert.equal(board.getGem(2, 2), GEM_TYPES.BLUE_DIAMOND);
  board.clear();
  assert.equal(board.get(2, 2), 0);
  assert.equal(board.getGem(2, 2), null, 'clear() must reset all gems to null');

  // Test init()
  board.placePiece(p, 3, 3);
  assert.equal(board.getGem(3, 3), GEM_TYPES.BLUE_DIAMOND);
  board.init();
  assert.equal(board.get(3, 3), 0);
  assert.equal(board.getGem(3, 3), null, 'init() must reset all gems to null');

  // Test defensive clone of gemGrid
  const clonedGems = board.getGemGrid();
  clonedGems[0][0] = GEM_TYPES.AMBER_OCTAGON;
  assert.equal(board.getGem(0, 0), null, 'Mutating cloned gem grid must not mutate board');

  console.log('✓ Test 8: Lifecycle synchronization and defensive cloning passed');
}

// Test 9: Empty Lines Return Contract
{
  const board = new Board();
  const emptyResult = board.checkAndClearLines();
  assert.deepEqual(emptyResult, {
    linesCleared: 0,
    collectedGems: {},
    rows: [],
    cols: []
  });
  console.log('✓ Test 9: Empty lines return contract passed');
}

console.log('--- ALL STEP 2.3 CLEAR & GEM RETENTION TESTS PASSED SUCCESSFULLY ---');
