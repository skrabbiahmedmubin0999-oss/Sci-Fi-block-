/**
 * Sci-Fi Block Puzzle - Focused Unit Tests for Step 2.4
 * Testing Board.canAnyPieceFit(pieces)
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
import { GEM_TYPES } from '../src/renderers/GemRenderer.js';

console.log('--- Starting Step 2.4 Board.canAnyPieceFit Tests ---');

// Test 1: Empty board accepts any standard shape
{
  const board = new Board();

  // Single shapes
  assert.equal(board.canAnyPieceFit([SHAPE_O]), true, '2x2 square must fit on empty board');
  assert.equal(board.canAnyPieceFit([SHAPE_I]), true, '1x4 line must fit on empty board');
  assert.equal(board.canAnyPieceFit([SHAPE_CROSS]), true, 'Cross must fit on empty board');

  // List of all shapes
  const allShapes = Object.values(SHAPES);
  assert.equal(board.canAnyPieceFit(allShapes), true, 'All shapes list must fit on empty board');

  // Piece instances with gem metadata
  const piece1 = new Piece('p1', SHAPE_L, { '0,0': GEM_TYPES.BLUE_DIAMOND });
  const piece2 = new Piece('p2', SHAPE_CROSS, { '1,1': GEM_TYPES.PURPLE_HEXAGON });
  assert.equal(board.canAnyPieceFit([piece1, piece2]), true, 'Piece instances must fit on empty board');

  console.log('✓ Test 1: Empty board fits standard shapes and Piece instances passed');
}

// Test 2: Full board rejects all pieces
{
  const board = new Board();

  // Fill all 64 cells
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      board.set(r, c, 1);
    }
  }
  assert.equal(board.getOccupiedCount(), 64);

  // No piece should fit on a completely occupied board
  assert.equal(board.canAnyPieceFit([SHAPE_O]), false);
  assert.equal(board.canAnyPieceFit([SHAPE_I]), false);
  assert.equal(board.canAnyPieceFit([SHAPE_CROSS]), false);
  assert.equal(board.canAnyPieceFit(Object.values(SHAPES)), false);
  assert.equal(board.canAnyPieceFit([[[1]]]), false, 'Even 1x1 block cannot fit on full board');

  console.log('✓ Test 2: Full board rejects all pieces passed');
}

// Test 3: Constrained grid fitting & non-fitting patterns
{
  const board = new Board();

  // Fill board leaving only a 2x2 hole at (0, 0)
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (r < 2 && c < 2) continue; // Leave (0,0), (0,1), (1,0), (1,1) open
      board.set(r, c, 1);
    }
  }
  assert.equal(board.getOccupiedCount(), 60);

  // 2x2 O-shape CAN fit in the 2x2 hole
  assert.equal(board.canAnyPieceFit([SHAPE_O]), true, '2x2 O-shape must fit in 2x2 open space');

  // 1x4 I-shape CANNOT fit (hole is only 2x2)
  assert.equal(board.canAnyPieceFit([SHAPE_I]), false, '1x4 I-shape cannot fit in 2x2 hole');

  // 3x3 Cross shape CANNOT fit
  assert.equal(board.canAnyPieceFit([SHAPE_CROSS]), false, '3x3 Cross cannot fit in 2x2 hole');

  // Multi-piece list: [cannot fit, can fit] -> should return true!
  assert.equal(
    board.canAnyPieceFit([SHAPE_I, SHAPE_CROSS, SHAPE_O]),
    true,
    'List containing at least one piece that fits must return true'
  );

  // Multi-piece list: [cannot fit, cannot fit] -> should return false!
  assert.equal(
    board.canAnyPieceFit([SHAPE_I, SHAPE_CROSS]),
    false,
    'List where no piece can fit must return false'
  );

  console.log('✓ Test 3: Constrained grid pattern fitting and rejection passed');
}

// Test 4: Board Immutability & Zero Mutation during checking
{
  const board = new Board();

  // Seed board with partial blocks and a gem
  const seedPiece = new Piece('seed', SHAPE_CROSS, { '1,1': GEM_TYPES.BLUE_DIAMOND });
  board.placePiece(seedPiece, 2, 2);

  const snapshotGrid = board.toArray();
  const snapshotGems = board.getGemGrid();
  const occupiedBefore = board.getOccupiedCount();

  // Run multiple checks for both fitting and non-fitting shapes
  board.canAnyPieceFit([SHAPE_O, SHAPE_I]);
  board.canAnyPieceFit([SHAPE_CROSS]);
  board.canAnyPieceFit([[[1, 1, 1, 1, 1, 1, 1, 1]]]); // 1x8 line

  // Board state must remain 100% strictly identical
  assert.equal(board.getOccupiedCount(), occupiedBefore, 'Occupied count must not change');
  assert.deepEqual(board.toArray(), snapshotGrid, '#grid must remain completely unchanged');
  assert.deepEqual(board.getGemGrid(), snapshotGems, '#gemGrid must remain completely unchanged');

  console.log('✓ Test 4: Board immutability & zero mutation during check passed');
}

// Test 5: Safe Handling of Invalid and Empty Inputs
{
  const board = new Board();

  // Empty array
  assert.equal(board.canAnyPieceFit([]), false, 'Empty array must return false');

  // Non-array inputs
  assert.equal(board.canAnyPieceFit(null), false, 'null must return false');
  assert.equal(board.canAnyPieceFit(undefined), false, 'undefined must return false');
  assert.equal(board.canAnyPieceFit(123), false, 'number must return false');
  assert.equal(board.canAnyPieceFit('piece'), false, 'string must return false');
  assert.equal(board.canAnyPieceFit({}), false, 'object must return false');

  // Array containing null or malformed shapes
  assert.equal(board.canAnyPieceFit([null]), false, 'Array of null must return false');
  assert.equal(board.canAnyPieceFit([[[2, 0]]]), false, 'Malformed shape must return false');
  assert.equal(board.canAnyPieceFit([null, undefined, [[1, 2]]]), false);

  // Array containing malformed shape AND valid fitting shape -> valid shape allows return true
  assert.equal(
    board.canAnyPieceFit([null, [[2, 0]], SHAPE_O]),
    true,
    'Valid shape after malformed entries must still be evaluated'
  );

  console.log('✓ Test 5: Safe handling of invalid and empty inputs passed');
}

console.log('--- ALL STEP 2.4 canAnyPieceFit TESTS PASSED SUCCESSFULLY ---');
