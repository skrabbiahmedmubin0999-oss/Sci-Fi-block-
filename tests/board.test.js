/**
 * Sci-Fi Block Puzzle - Focused Unit Tests for Step 2.1
 * Testing independent 8x8 Board data structure
 */

import assert from 'node:assert/strict';
import { Board } from '../src/game/Board.js';
import { GRID_ROWS, GRID_COLUMNS } from '../src/config/constants.js';

console.log('--- Starting Step 2.1 Board Data Structure Tests ---');

// Test 1: Dimensions and initialization
{
  const board = new Board();
  assert.equal(board.rows, 8, 'Board rows should equal 8');
  assert.equal(board.cols, 8, 'Board cols should equal 8');
  assert.equal(board.rows, GRID_ROWS, 'Board rows must match GRID_ROWS constant');
  assert.equal(board.cols, GRID_COLUMNS, 'Board cols must match GRID_COLUMNS constant');

  // Verify all 64 cells are initially 0 (empty)
  for (let r = 0; r < board.rows; r++) {
    for (let c = 0; c < board.cols; c++) {
      assert.equal(board.get(r, c), 0, `Cell (${r}, ${c}) should be 0 on initialization`);
      assert.equal(board.isEmpty(r, c), true, `Cell (${r}, ${c}) should report isEmpty=true`);
      assert.equal(board.isOccupied(r, c), false, `Cell (${r}, ${c}) should report isOccupied=false`);
    }
  }

  assert.equal(board.getOccupiedCount(), 0, 'Initial occupied count must be 0');
  assert.equal(board.getEmptyCount(), 64, 'Initial empty count must be 64 (8x8)');
  console.log('✓ Test 1: Dimensions and empty initialization passed');
}

// Test 2: Valid cell setting and retrieval (0 and 1)
{
  const board = new Board();

  // Set cell (0, 0) to 1
  board.set(0, 0, 1);
  assert.equal(board.get(0, 0), 1, 'Cell (0, 0) should be 1');
  assert.equal(board.isOccupied(0, 0), true, 'Cell (0, 0) should report occupied');
  assert.equal(board.isEmpty(0, 0), false, 'Cell (0, 0) should not report empty');

  // Set cell (7, 7) to 1 (boundary corner)
  board.set(7, 7, 1);
  assert.equal(board.get(7, 7), 1, 'Cell (7, 7) should be 1');
  assert.equal(board.isOccupied(7, 7), true, 'Cell (7, 7) should report occupied');

  // Set cell (3, 4) to 1 and back to 0
  board.set(3, 4, 1);
  assert.equal(board.get(3, 4), 1);
  board.set(3, 4, 0);
  assert.equal(board.get(3, 4), 0, 'Cell (3, 4) should be reset back to 0');
  assert.equal(board.isEmpty(3, 4), true);

  assert.equal(board.getOccupiedCount(), 2, 'Should have exactly 2 occupied cells');
  assert.equal(board.getEmptyCount(), 62, 'Should have exactly 62 empty cells');
  console.log('✓ Test 2: Valid cell mutations (0 and 1) passed');
}

// Test 3: Coordinate bounds validation
{
  const board = new Board();

  // Test out-of-bounds coordinates
  const invalidCoords = [
    [-1, 0],
    [0, -1],
    [8, 0],
    [0, 8],
    [8, 8],
    [10, 20],
    [1.5, 2],
    [null, 3],
    [NaN, 0]
  ];

  invalidCoords.forEach(([r, c]) => {
    assert.equal(board.isValidCoord(r, c), false, `Coord (${r}, ${c}) must be invalid`);
    assert.throws(() => board.get(r, c), RangeError, `get(${r}, ${c}) must throw RangeError`);
    assert.throws(() => board.set(r, c, 1), RangeError, `set(${r}, ${c}, 1) must throw RangeError`);
  });

  console.log('✓ Test 3: Coordinate boundaries and rejection passed');
}

// Test 4: Cell value validation (only 0 or 1 allowed)
{
  const board = new Board();

  const invalidValues = [2, -1, 3, 0.5, '1', '0', true, false, null, undefined, {}, []];

  invalidValues.forEach(val => {
    assert.throws(
      () => board.set(0, 0, val),
      TypeError,
      `Setting invalid value ${JSON.stringify(val)} must throw TypeError`
    );
  });

  // Cell (0, 0) should remain untouched (0)
  assert.equal(board.get(0, 0), 0);
  console.log('✓ Test 4: Strict cell value validation (0 and 1 only) passed');
}

// Test 5: Clear and count consistency
{
  const board = new Board();

  // Occupy a pattern
  board.set(1, 1, 1);
  board.set(2, 2, 1);
  board.set(3, 3, 1);
  assert.equal(board.getOccupiedCount(), 3);
  assert.equal(board.getEmptyCount(), 61);

  // Clear board
  board.clear();
  assert.equal(board.getOccupiedCount(), 0);
  assert.equal(board.getEmptyCount(), 64);
  assert.equal(board.isOccupied(1, 1), false);
  assert.equal(board.isOccupied(2, 2), false);
  assert.equal(board.isOccupied(3, 3), false);

  console.log('✓ Test 5: Clear and cell counts passed');
}

// Test 6: toArray() deep immutability
{
  const board = new Board();
  board.set(2, 3, 1);

  const arr = board.toArray();
  assert.equal(arr.length, 8);
  assert.equal(arr[0].length, 8);
  assert.equal(arr[2][3], 1);

  // Mutating the returned array must not mutate the board
  arr[2][3] = 0;
  arr[0][0] = 1;
  assert.equal(board.get(2, 3), 1, 'Board cell (2, 3) must remain 1');
  assert.equal(board.get(0, 0), 0, 'Board cell (0, 0) must remain 0');

  console.log('✓ Test 6: toArray() clone isolation passed');
}

// Test 7: loadMatrix() validation
{
  const board = new Board();

  // Valid 8x8 matrix
  const validMatrix = Array.from({ length: 8 }, (_, r) =>
    Array.from({ length: 8 }, (_, c) => (r === c ? 1 : 0))
  );

  board.loadMatrix(validMatrix);
  assert.equal(board.getOccupiedCount(), 8);
  assert.equal(board.get(0, 0), 1);
  assert.equal(board.get(1, 1), 1);
  assert.equal(board.get(0, 1), 0);

  // Invalid row count (7 rows)
  assert.throws(() => {
    board.loadMatrix(validMatrix.slice(0, 7));
  }, RangeError);

  // Invalid col count (first row has 7 cols)
  const badCols = validMatrix.map(row => [...row]);
  badCols[0] = [1, 0, 1];
  assert.throws(() => {
    board.loadMatrix(badCols);
  }, RangeError);

  // Invalid cell value (contains 5)
  const badVal = validMatrix.map(row => [...row]);
  badVal[4][4] = 5;
  assert.throws(() => {
    board.loadMatrix(badVal);
  }, TypeError);

  console.log('✓ Test 7: loadMatrix() validation passed');
}

// Test 8: Dimension Immutability (rows and cols cannot be reassigned)
{
  const board = new Board();
  assert.throws(() => {
    board.rows = 12;
  }, TypeError, 'Assigning to read-only rows getter must throw TypeError');

  assert.throws(() => {
    board.cols = 12;
  }, TypeError, 'Assigning to read-only cols getter must throw TypeError');

  assert.equal(board.rows, 8, 'Board rows must strictly remain 8');
  assert.equal(board.cols, 8, 'Board cols must strictly remain 8');
  console.log('✓ Test 8: Dimension immutability (rows/cols cannot be reassigned) passed');
}

// Test 9: Internal Grid Encapsulation (cannot bypass set() validation)
{
  const board = new Board();

  // board.grid returns a defensive clone
  const extGrid = board.grid;
  extGrid[0][0] = 1;
  assert.equal(board.get(0, 0), 0, 'Internal cell must remain 0 despite external grid mutation');
  assert.equal(board.isOccupied(0, 0), false);

  // Attempting to overwrite the grid property directly throws in strict mode
  assert.throws(() => {
    board.grid = [[1]];
  }, TypeError, 'Assigning to read-only grid getter must throw TypeError');

  // Instance is sealed: arbitrary new properties cannot be attached
  assert.throws(() => {
    board.tamperField = true;
  }, TypeError, 'Adding new properties to sealed board instance must throw TypeError');

  console.log('✓ Test 9: Internal grid encapsulation and tamper protection passed');
}

console.log('--- ALL STEP 2.1 BOARD TESTS PASSED SUCCESSFULLY ---');

