/**
 * Sci-Fi Block Puzzle - Piece Spawner
 * Generates and manages the 3 piece slots in the lower staging tray.
 * Initially seeds the authoritative pieces from Image 2 (ADVANCED SCI-FI),
 * followed by balanced procedural generation.
 */

import { SHAPES, SHAPE_L, SHAPE_CROSS, SHAPE_O } from '../config/shapes.js';
import { GEM_TYPES } from '../renderers/GemRenderer.js';
import { Piece } from './Piece.js';

export class PieceSpawner {
  constructor() {
    this.slots = [null, null, null];
    this.pieceCounter = 0;
  }

  /**
   * Initial spawn: Directly recreates the 3 pieces seen in Image 2
   */
  spawnInitialPresetPieces() {
    // Piece 1 (Left): L-Shape with blue diamonds and amber octagon
    const p1 = new Piece(`piece_${++this.pieceCounter}`, SHAPE_L, {
      '0,0': GEM_TYPES.BLUE_DIAMOND,
      '0,1': GEM_TYPES.AMBER_OCTAGON
    });

    // Piece 2 (Center): Cross with purple hexagon top, red triangle bottom, jade arms
    const p2 = new Piece(`piece_${++this.pieceCounter}`, SHAPE_CROSS, {
      '0,1': GEM_TYPES.PURPLE_HEXAGON,
      '2,1': GEM_TYPES.RED_TRIANGLE
    });

    // Piece 3 (Right): 2x2 Square with 4 amber octagons
    const p3 = new Piece(`piece_${++this.pieceCounter}`, SHAPE_O, {
      '0,0': GEM_TYPES.AMBER_OCTAGON,
      '0,1': GEM_TYPES.AMBER_OCTAGON,
      '1,0': GEM_TYPES.AMBER_OCTAGON,
      '1,1': GEM_TYPES.AMBER_OCTAGON
    });

    this.slots = [p1, p2, p3];
    return this.slots;
  }

  /**
   * Spawn a new batch of 3 pieces with balanced variety and gem socketing.
   */
  spawnNewBatch(board) {
    const shapeKeys = Object.keys(SHAPES);
    const gemTypes = Object.values(GEM_TYPES);

    this.slots = [null, null, null].map((_, index) => {
      // Pick random shape
      const key = shapeKeys[Math.floor(Math.random() * shapeKeys.length)];
      const matrix = SHAPES[key];

      // Randomly assign 1-2 gems to blocks
      const gemMap = {};
      const occupiedCoords = [];
      for (let r = 0; r < matrix.length; r++) {
        for (let c = 0; c < matrix[r].length; c++) {
          if (matrix[r][c] === 1) occupiedCoords.push({ r, c });
        }
      }

      // 65% chance of containing embedded gems
      if (Math.random() < 0.65 && occupiedCoords.length > 0) {
        const gemCount = Math.min(occupiedCoords.length, Math.random() < 0.5 ? 1 : 2);
        // Shuffle coords
        occupiedCoords.sort(() => Math.random() - 0.5);
        for (let i = 0; i < gemCount; i++) {
          const coord = occupiedCoords[i];
          const randomGem = gemTypes[Math.floor(Math.random() * gemTypes.length)];
          gemMap[`${coord.r},${coord.c}`] = randomGem;
        }
      }

      return new Piece(`piece_${++this.pieceCounter}`, matrix, gemMap);
    });

    return this.slots;
  }

  areAllPlaced() {
    return this.slots.every(p => !p || p.placed);
  }

  getActivePieces() {
    return this.slots.filter(p => p && !p.placed);
  }
}
