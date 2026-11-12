/**
 * Sci-Fi Block Puzzle - Block Renderer
 * Renders beveled composite blocks and metallic jewel sockets
 * faithfully matching the Image 2 (ADVANCED SCI-FI) aesthetic.
 */

import { GemRenderer, GEM_TYPES } from './GemRenderer.js';

export const BLOCK_TYPES = Object.freeze({
  STANDARD: 'standard',
  SOCKET: 'socket'
});

export class BlockRenderer {
  static gradientCache = new Map();

  /**
   * Caches and reuses linear gradient objects based on dimensions and color stops
   */
  static getLinearGradient(ctx, w, h, c1, c2, c3) {
    if (!ctx || typeof ctx.createLinearGradient !== 'function') {
      return c2 || c1;
    }
    const key = `${Math.round(w)}_${Math.round(h)}_${c1}_${c2 || ''}_${c3 || ''}`;
    let grad = this.gradientCache.get(key);
    if (!grad) {
      try {
        grad = ctx.createLinearGradient(0, 0, w, h);
        grad.addColorStop(0, c1);
        if (c3 !== undefined) {
          grad.addColorStop(0.35, c2);
          grad.addColorStop(1, c3);
        } else if (c2 !== undefined) {
          grad.addColorStop(1, c2);
        }
        this.gradientCache.set(key, grad);
      } catch {
        return c2 || c1;
      }
    }
    return grad;
  }

  /**
   * Draw a single block at (x, y) with specified dimensions and theme.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} x - Top-left X
   * @param {number} y - Top-left Y
   * @param {number} size - Width/Height of the cell
   * @param {string} blockType - 'standard' or 'socket'
   * @param {string|null} gemType - Key from GEM_TYPES if socketed
   * @param {object} palette - Theme palette
   * @param {object} [options] - Optional opacity, scale, isGhost, isHighlighted
   */
  static drawBlock(ctx, x, y, size, blockType, gemType, palette, options = {}) {
    const pad = Math.max(1, Math.floor(size * 0.04));
    const bx = x + pad;
    const by = y + pad;
    const bsize = size - pad * 2;
    const chamfer = Math.max(2, Math.floor(bsize * 0.12));

    ctx.save();
    if (options.alpha !== undefined) {
      ctx.globalAlpha = options.alpha;
    }

    if (blockType === BLOCK_TYPES.SOCKET || gemType) {
      this.drawSocketBlock(ctx, bx, by, bsize, chamfer, palette);
      if (gemType) {
        const gemSize = bsize * 0.76;
        GemRenderer.drawGem(ctx, gemType, bx + bsize / 2, by + bsize / 2, gemSize, palette.gems);
      }
    } else {
      this.drawStandardBlock(ctx, bx, by, bsize, chamfer, palette, options.isGhost);
    }

    ctx.restore();
  }

  /**
   * Standard Jade Green Composite Block (Image 2 style)
   */
  static drawStandardBlock(ctx, x, y, size, chamfer, palette, isGhost = false) {
    const colors = palette.blocks.standard;

    ctx.save();
    ctx.translate(x, y);

    // Outer Chamfer Path
    this.createChamferPath(ctx, 0, 0, size, chamfer);

    if (isGhost) {
      ctx.fillStyle = 'rgba(20, 184, 166, 0.35)';
      ctx.fill();
      ctx.strokeStyle = '#2dd4bf';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
      return;
    }

    // Base Fill with subtle diagonal gradient (cached)
    const baseGrad = this.getLinearGradient(ctx, size, size, colors.light, colors.base, colors.dark);
    ctx.fillStyle = baseGrad;
    ctx.fill();

    // Top-Left Bevel Highlight
    ctx.beginPath();
    ctx.moveTo(chamfer, 0);
    ctx.lineTo(size - chamfer, 0);
    ctx.lineTo(size - chamfer - 3, 3);
    ctx.lineTo(chamfer + 2, 3);
    ctx.lineTo(3, chamfer + 2);
    ctx.lineTo(3, size - chamfer - 3);
    ctx.lineTo(0, size - chamfer);
    ctx.lineTo(0, chamfer);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.fill();

    // Bottom-Right Bevel Shadow
    ctx.beginPath();
    ctx.moveTo(size, chamfer);
    ctx.lineTo(size, size - chamfer);
    ctx.lineTo(size - chamfer, size);
    ctx.lineTo(chamfer, size);
    ctx.lineTo(chamfer + 3, size - 3);
    ctx.lineTo(size - chamfer - 2, size - 3);
    ctx.lineTo(size - 3, size - chamfer - 2);
    ctx.lineTo(size - 3, chamfer + 3);
    ctx.closePath();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fill();

    // Inner Raised Plate
    const innerPad = Math.max(3, Math.floor(size * 0.16));
    const innerSize = size - innerPad * 2;
    const innerChamfer = Math.max(1, chamfer - 2);
    this.createChamferPath(ctx, innerPad, innerPad, innerSize, innerChamfer);

    const innerGrad = this.getLinearGradient(ctx, innerSize, innerSize, colors.light, colors.base, colors.dark);
    ctx.fillStyle = innerGrad;
    ctx.fill();

    // Outer Crisp Rim
    this.createChamferPath(ctx, 0, 0, size, chamfer);
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Brushed Titanium / Steel Socket Block for Gems (Image 2 style)
   */
  static drawSocketBlock(ctx, x, y, size, chamfer, palette) {
    const colors = palette.blocks.socket;

    ctx.save();
    ctx.translate(x, y);

    // Outer Titanium Mount
    this.createChamferPath(ctx, 0, 0, size, chamfer);
    const outerGrad = this.getLinearGradient(ctx, size, size, colors.light, colors.base, colors.dark);
    ctx.fillStyle = outerGrad;
    ctx.fill();

    // Outer Bevel Highlight & Shadow
    ctx.strokeStyle = colors.border;
    ctx.lineWidth = 1;
    ctx.stroke();

    // Inner Recessed Gem Cradle (dark well where jewel is seated)
    const recessPad = Math.max(3, Math.floor(size * 0.14));
    const recessSize = size - recessPad * 2;
    const recessChamfer = Math.max(1, chamfer - 2);

    this.createChamferPath(ctx, recessPad, recessPad, recessSize, recessChamfer);
    ctx.fillStyle = colors.recessBg;
    ctx.fill();

    // Subtle inner bevel shadow
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Corner industrial bolts/rivets
    const boltRadius = Math.max(1, Math.floor(size * 0.04));
    const boltOffset = Math.max(2, Math.floor(chamfer * 0.7));
    ctx.fillStyle = '#cbd5e1';

    // 4 Corner Rivets
    ctx.beginPath();
    ctx.arc(boltOffset, boltOffset, boltRadius, 0, Math.PI * 2);
    ctx.arc(size - boltOffset, boltOffset, boltRadius, 0, Math.PI * 2);
    ctx.arc(boltOffset, size - boltOffset, boltRadius, 0, Math.PI * 2);
    ctx.arc(size - boltOffset, size - boltOffset, boltRadius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  /**
   * Helper: Path for chamfered rectangle
   */
  static createChamferPath(ctx, x, y, size, chamfer) {
    ctx.beginPath();
    ctx.moveTo(x + chamfer, y);
    ctx.lineTo(x + size - chamfer, y);
    ctx.lineTo(x + size, y + chamfer);
    ctx.lineTo(x + size, y + size - chamfer);
    ctx.lineTo(x + size - chamfer, y + size);
    ctx.lineTo(x + chamfer, y + size);
    ctx.lineTo(x, y + size - chamfer);
    ctx.lineTo(x, y + chamfer);
    ctx.closePath();
  }
}
