/**
 * Sci-Fi Block Puzzle - Focused Unit Tests for Step 2.2
 * Shape Validation and Safe Piece-Placement Validation
 */

import assert from 'node:assert/strict';
import { Board } from '../src/game/Board.js';
import { Piece } from '../src/game/Piece.js';
import {
  SHAPES,
  SHAPE_O,
  SHAPE_I,
  SHAPE_T,
  SHAPE_L,
  SHAPE_J,
  SHAPE_S,
  SHAPE_Z,
  SHAPE_CROSS
} from '../src/config/shapes.js';

console.log('--- Starting Step 2.2 Shape & Placement Validation Tests ---');

// Test 1: Shape Matrix Validation with Standard Shapes
{
  const board = new Board();

  // All 8 standard shapes must validate successfully
  const standardShapes = [
    SHAPE_O,
    SHAPE_I,
    SHAPE_T,
    SHAPE_L,
    SHAPE_J,
    SHAPE_S,
    SHAPE_Z,
    SHAPE_CROSS
  ];

  for (const shape of standardShapes) {
    const validated = board.validateShapeMatrix(shape);
    assert.ok(Array.isArray(validated), 'Must return 2D array');
  }

  // Also validate when wrapped in a Piece instance
  const piece = new Piece('p_cross', SHAPE_CROSS);
  const validatedPiece = board.validateShapeMatrix(piece);
  assert.deepEqual(validatedPiece, SHAPE_CROSS);

  console.log('✓ Test 1: Standard shape matrices validation passed');
}

// Test 2: Malformed Shape Matrix Rejections
{
  const board = new Board();

  // Null, undefined, non-objects
  assert.throws(() => board.validateShapeMatrix(null), TypeError);
  assert.throws(() => board.validateShapeMatrix(undefined), TypeError);
  assert.throws(() => board.validateShapeMatrix(123), TypeError);
  assert.throws(() => board.validateShapeMatrix('shape'), TypeError);

  // Empty matrices
  assert.throws(() => board.validateShapeMatrix([]), RangeError);
  assert.throws(() => board.validateShapeMatrix([[]]), RangeError);
  assert.throws(() => board.validateShapeMatrix({ matrix: [] }), RangeError);

  // Non-rectangular (ragged) matrices
  assert.throws(
    () => board.validateShapeMatrix([[1, 1, 1], [1, 0]]),
    RangeError,
    'Ragged rows must throw RangeError'
  );

  // Invalid cell values (non 0/1)
  assert.throws(() => board.validateShapeMatrix([[2, 1]]), TypeError);
  assert.throws(() => board.validateShapeMatrix([[0, -1]]), TypeError);
  assert.throws(() => board.validateShapeMatrix([['1', 0]]), TypeError);
  assert.throws(() => board.validateShapeMatrix([[null, 1]]), TypeError);

  // All-zero matrix (no occupied cells)
  assert.throws(
    () => board.validateShapeMatrix([[0, 0], [0, 0]]),
    RangeError,
    'All-zero shape must throw RangeError'
  );

  console.log('✓ Test 2: Malformed shape matrix rejections passed');
}

// Test 3: Boundary Validation (canPlacePiece)
{
  const board = new Board();

  // Valid placements within 8x8
  assert.equal(board.canPlacePiece(SHAPE_O, 0, 0), true, '2x2 O-shape at (0, 0) should be valid');
  assert.equal(board.canPlacePiece(SHAPE_O, 6, 6), true, '2x2 O-shape at (6, 6) should be valid');
  assert.equal(board.canPlacePiece(SHAPE_I, 0, 4), true, '1x4 I-shape at (0, 4) should be valid (cols 4,5,6,7)');

  // Right boundary violation
  // 1x4 I-shape at col 5 spans cols 5,6,7,8 (8 is out of bounds)
  assert.equal(board.canPlacePiece(SHAPE_I, 0, 5), false, '1x4 at col 5 must exceed right boundary');
  // 2x2 O-shape at col 7 spans cols 7,8
  assert.equal(board.canPlacePiece(SHAPE_O, 0, 7), false, '2x2 at col 7 must exceed right boundary');

  // Bottom boundary violation
  // L-shape is 3x2 (rows 0,1,2). Placed at row 6 spans rows 6,7,8 (8 is out of bounds)
  assert.equal(board.canPlacePiece(SHAPE_L, 6, 0), false, '3x2 L-shape at row 6 must exceed bottom boundary');
  assert.equal(board.canPlacePiece(SHAPE_L, 5, 0), true, '3x2 L-shape at row 5 spans rows 5,6,7 (valid)');

  // Negative coordinates
  assert.equal(board.canPlacePiece(SHAPE_O, -1, 0), false, 'Negative row must fail');
  assert.equal(board.canPlacePiece(SHAPE_O, 0, -1), false, 'Negative col must fail');

  // Non-integer coordinates
  assert.equal(board.canPlacePiece(SHAPE_O, 1.5, 2), false, 'Float row must fail');
  assert.equal(board.canPlacePiece(SHAPE_O, 2, '3'), false, 'String col must fail');
  assert.equal(board.canPlacePiece(SHAPE_O, null, 0), false, 'Null row must fail');
  assert.equal(board.canPlacePiece(SHAPE_O, NaN, 0), false, 'NaN row must fail');

  console.log('✓ Test 3: Boundary validation passed');
}

// Test 4: Occupied-Cell Collision Validation
{
  const board = new Board();

  // Pre-occupy cell (2, 2)
  board.set(2, 2, 1);

  // Placing 2x2 O-shape at (1, 1) covers (1,1), (1,2), (2,1), (2,2) -> collides at (2,2)
  assert.equal(board.canPlacePiece(SHAPE_O, 1, 1), false, 'Must reject collision at (2, 2)');

  // Placing 2x2 O-shape at (0, 0) covers (0,0), (0,1), (1,0), (1,1) -> no collision!
  assert.equal(board.canPlacePiece(SHAPE_O, 0, 0), true, 'Adjacent placement without collision must be valid');

  // Matrix empty cells (0) overlapping occupied board cells:
  // T-shape is:
  // [1, 1, 1]
  // [0, 1, 0]
  // Position (0, 0) is 1, position (1, 0) is 0!
  // If we pre-occupy board (4, 4), and place T-shape at (3, 4):
  // T-shape cells:
  // (3, 4) -> 1
  // (3, 5) -> 1
  // (3, 6) -> 1
  // (4, 4) -> 0 in T-shape! (empty cell)
  // (4, 5) -> 1
  // (4, 6) -> 0 in T-shape!
  // So T-shape cell at (4, 4) is 0, while board (4, 4) is 1!
  board.set(4, 4, 1);
  assert.equal(
    board.canPlacePiece(SHAPE_T, 3, 4),
    true,
    'Empty cells (0) in shape matrix must not trigger collision with occupied board cells'
  );

  // But if board (3, 5) is occupied (which is 1 in T-shape), it MUST collide
  board.set(3, 5, 1);
  assert.equal(
    board.canPlacePiece(SHAPE_T, 3, 4),
    false,
    'Occupied cell (1) in shape matrix overlapping occupied board cell must collide'
  );

  console.log('✓ Test 4: Occupied-cell collision validation passed');
}

// Test 5: Atomic Placement Execution & Zero Partial Modification on Failure
{
  const board = new Board();
  assert.equal(board.getOccupiedCount(), 0);

  // 1. Valid placement: 2x2 Square at (0, 0)
  const success = board.placePiece(SHAPE_O, 0, 0);
  assert.equal(success, true, 'placePiece must return true on success');
  assert.equal(board.getOccupiedCount(), 4, 'Board must have exactly 4 occupied cells');
  assert.equal(board.get(0, 0), 1);
  assert.equal(board.get(0, 1), 1);
  assert.equal(board.get(1, 0), 1);
  assert.equal(board.get(1, 1), 1);

  // Save snapshot of current board state
  const snapshotBeforeFailed = board.toArray();

  // 2. Invalid placement: Collision with existing square
  const failCollision = board.placePiece(SHAPE_CROSS, 0, 0);
  assert.equal(failCollision, false, 'placePiece must return false on collision');
  assert.deepEqual(
    board.toArray(),
    snapshotBeforeFailed,
    'Board state must remain completely identical after collision failure'
  );
  assert.equal(board.getOccupiedCount(), 4);

  // 3. Invalid placement: Out of bounds (starts inside, runs outside)
  // I-shape 1x4 at (0, 6) covers cols 6, 7, 8, 9 (cols 6,7 are on board and empty, cols 8,9 out of bounds)
  const failBoundary = board.placePiece(SHAPE_I, 0, 6);
  assert.equal(failBoundary, false, 'placePiece must return false on boundary overflow');
  assert.deepEqual(
    board.toArray(),
    snapshotBeforeFailed,
    'Cells 6 and 7 must NOT have been partially modified when cols 8 and 9 were out of bounds'
  );
  assert.equal(board.get(0, 6), 0, 'Cell (0, 6) must remain 0');
  assert.equal(board.get(0, 7), 0, 'Cell (0, 7) must remain 0');
  assert.equal(board.getOccupiedCount(), 4);

  // 4. Invalid placement: Malformed shape
  const failMalformed = board.placePiece([[1, 2]], 3, 3);
  assert.equal(failMalformed, false, 'placePiece must return false on malformed shape');
  assert.deepEqual(
    board.toArray(),
    snapshotBeforeFailed,
    'Board must remain untouched after malformed shape placement attempt'
  );

  console.log('✓ Test 5: Atomic placement execution & zero partial modification passed');
}

// Test 6: Placement with Piece Instance
{
  const board = new Board();
  const crossPiece = new Piece('cross_1', SHAPE_CROSS, { '1,1': 'blueDiamond' });

  assert.equal(board.canPlacePiece(crossPiece, 2, 2), true);
  const success = board.placePiece(crossPiece, 2, 2);
  assert.equal(success, true);

  // Cross has 5 occupied cells
  assert.equal(board.getOccupiedCount(), 5);
  assert.equal(board.get(2, 3), 1); // top
  assert.equal(board.get(3, 2), 1); // left
  assert.equal(board.get(3, 3), 1); // center
  assert.equal(board.get(3, 4), 1); // right
  assert.equal(board.get(4, 3), 1); // bottom
  // Corners of the 3x3 bounding box must remain 0
  assert.equal(board.get(2, 2), 0);
  assert.equal(board.get(2, 4), 0);
  assert.equal(board.get(4, 2), 0);
  assert.equal(board.get(4, 4), 0);

  console.log('✓ Test 6: Piece instance placement and bounding box cell verification passed');
}

console.log('--- ALL STEP 2.2 SHAPE & PLACEMENT TESTS PASSED SUCCESSFULLY ---');
