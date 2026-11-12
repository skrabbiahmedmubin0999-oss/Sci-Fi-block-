/**
 * Sci-Fi Block Puzzle - Piece Entity
 * Draggable polyomino block piece with embedded gem sockets.
 */

export class Piece {
  /**
   * @param {string} id
   * @param {number[][]} matrix
   * @param {Record<string, string>} [gemMap] - e.g. { "0,0": "blueDiamond" }
   */
  constructor(id, matrix, gemMap = {}) {
    this.id = id;
    this.matrix = matrix;
    this.gemMap = gemMap; // key: "r,c", value: gemType
    this.rows = matrix.length;
    this.cols = matrix[0].length;

    // Spatial & Animation properties
    this.x = 0;
    this.y = 0;
    this.baseX = 0;
    this.baseY = 0;
    this.width = 0;
    this.height = 0;
    this.scale = 1.0;
    this.targetScale = 1.0;

    // Interaction state
    this.isDragging = false;
    this.placed = false;
  }

  getGemAt(r, c) {
    return this.gemMap[`${r},${c}`] || null;
  }

  getOccupiedCellCount() {
    let count = 0;
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (this.matrix[r][c] === 1) count++;
      }
    }
    return count;
  }

  /**
   * Return bounding box in local cell units
   */
  getBounds(cellSize) {
    return {
      width: this.cols * cellSize,
      height: this.rows * cellSize
    };
  }

  /**
   * Hit-test whether screen coordinate (px, py) touches this piece in the staging tray.
   */
  containsPoint(px, py, displayCellSize) {
    const w = this.cols * displayCellSize;
    const h = this.rows * displayCellSize;
    // generous touch padding for mobile thumb precision
    const pad = Math.max(8, displayCellSize * 0.2);
    return (
      px >= this.x - pad &&
      px <= this.x + w + pad &&
      py >= this.y - pad &&
      py <= this.y + h + pad
    );
  }
}
