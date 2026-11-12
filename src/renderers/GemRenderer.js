/**
 * Sci-Fi Block Puzzle - Gem Renderer
 * High-precision procedural faceted crystal rendering directly matching Image 2 reference:
 * - Blue Diamond (Rhombus facet)
 * - Red Triangle (Trihedral pyramid)
 * - Purple Hexagon (6-sided brilliant)
 * - Amber Octagon (8-sided table cut)
 * - Green Emerald (Crystalline socketed jewel)
 */

export const GEM_TYPES = Object.freeze({
  BLUE_DIAMOND: 'blueDiamond',
  RED_TRIANGLE: 'redTriangle',
  PURPLE_HEXAGON: 'purpleHexagon',
  AMBER_OCTAGON: 'amberOctagon',
  GREEN_EMERALD: 'greenEmerald'
});

export class GemRenderer {
  static outerPts = Array.from({ length: 8 }, () => ({ x: 0, y: 0 }));
  static innerPts = Array.from({ length: 8 }, () => ({ x: 0, y: 0 }));

  /**
   * Render a gem centered at (cx, cy) with given outer radius/size.
   * @param {CanvasRenderingContext2D} ctx
   * @param {string} gemType - Key from GEM_TYPES
   * @param {number} cx - Center X
   * @param {number} cy - Center Y
   * @param {number} size - Outer diameter / bounding dimension
   * @param {object} palette - Theme palette for gems
   */
  static drawGem(ctx, gemType, cx, cy, size, palette) {
    ctx.save();
    const colors = palette[gemType] || palette.blueDiamond;

    switch (gemType) {
      case GEM_TYPES.BLUE_DIAMOND:
        this.drawBlueDiamond(ctx, cx, cy, size, colors);
        break;
      case GEM_TYPES.RED_TRIANGLE:
        this.drawRedTriangle(ctx, cx, cy, size, colors);
        break;
      case GEM_TYPES.PURPLE_HEXAGON:
        this.drawPurpleHexagon(ctx, cx, cy, size, colors);
        break;
      case GEM_TYPES.AMBER_OCTAGON:
        this.drawAmberOctagon(ctx, cx, cy, size, colors);
        break;
      case GEM_TYPES.GREEN_EMERALD:
        this.drawGreenEmerald(ctx, cx, cy, size, colors);
        break;
      default:
        this.drawBlueDiamond(ctx, cx, cy, size, colors);
        break;
    }

    ctx.restore();
  }

  /**
   * Blue Diamond: 4-way rhomboid table cut with specular highlights
   */
  static drawBlueDiamond(ctx, cx, cy, size, colors) {
    const half = size * 0.46;
    const inner = half * 0.45;

    // Top facet (light)
    ctx.beginPath();
    ctx.moveTo(cx, cy - half);
    ctx.lineTo(cx + half, cy);
    ctx.lineTo(cx + inner, cy);
    ctx.lineTo(cx, cy - inner);
    ctx.closePath();
    ctx.fillStyle = colors.highlight;
    ctx.fill();

    // Left facet (mid-light)
    ctx.beginPath();
    ctx.moveTo(cx, cy - half);
    ctx.lineTo(cx - half, cy);
    ctx.lineTo(cx - inner, cy);
    ctx.lineTo(cx, cy - inner);
    ctx.closePath();
    ctx.fillStyle = colors.primary;
    ctx.fill();

    // Bottom-Left facet (mid-shadow)
    ctx.beginPath();
    ctx.moveTo(cx - half, cy);
    ctx.lineTo(cx, cy + half);
    ctx.lineTo(cx, cy + inner);
    ctx.lineTo(cx - inner, cy);
    ctx.closePath();
    ctx.fillStyle = colors.shadow;
    ctx.fill();

    // Bottom-Right facet (deep shadow)
    ctx.beginPath();
    ctx.moveTo(cx + half, cy);
    ctx.lineTo(cx, cy + half);
    ctx.lineTo(cx, cy + inner);
    ctx.lineTo(cx + inner, cy);
    ctx.closePath();
    ctx.fillStyle = colors.shadow;
    ctx.fill();

    // Center table facet
    ctx.beginPath();
    ctx.moveTo(cx, cy - inner);
    ctx.lineTo(cx + inner, cy);
    ctx.lineTo(cx, cy + inner);
    ctx.lineTo(cx - inner, cy);
    ctx.closePath();
    ctx.fillStyle = colors.highlight;
    ctx.fill();

    // Specular edge lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  /**
   * Red Triangle: Trihedral pyramid cut with sharp ridges and high contrast
   */
  static drawRedTriangle(ctx, cx, cy, size, colors) {
    const r = size * 0.44;
    const yOffset = r * 0.2; // Visual balance

    // 3 vertices of equilateral triangle
    const topX = cx, topY = cy - r + yOffset;
    const leftX = cx - r * 0.866, leftY = cy + r * 0.5 + yOffset;
    const rightX = cx + r * 0.866, rightY = cy + r * 0.5 + yOffset;
    const midX = cx, midY = cy + yOffset * 0.2;

    // Left face
    ctx.beginPath();
    ctx.moveTo(topX, topY);
    ctx.lineTo(leftX, leftY);
    ctx.lineTo(midX, midY);
    ctx.closePath();
    ctx.fillStyle = colors.highlight;
    ctx.fill();

    // Bottom face
    ctx.beginPath();
    ctx.moveTo(leftX, leftY);
    ctx.lineTo(rightX, rightY);
    ctx.lineTo(midX, midY);
    ctx.closePath();
    ctx.fillStyle = colors.shadow;
    ctx.fill();

    // Right face
    ctx.beginPath();
    ctx.moveTo(rightX, rightY);
    ctx.lineTo(topX, topY);
    ctx.lineTo(midX, midY);
    ctx.closePath();
    ctx.fillStyle = colors.primary;
    ctx.fill();

    // Ridge lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  /**
   * Purple Hexagon: 6-sided facet crystal with inner table
   */
  static drawPurpleHexagon(ctx, cx, cy, size, colors) {
    const r = size * 0.42;
    const innerR = r * 0.52;
    const sides = 6;

    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      this.outerPts[i].x = cx + r * Math.cos(angle);
      this.outerPts[i].y = cy + r * Math.sin(angle);
      this.innerPts[i].x = cx + innerR * Math.cos(angle);
      this.innerPts[i].y = cy + innerR * Math.sin(angle);
    }

    // Outer trapezoid facets
    for (let i = 0; i < sides; i++) {
      const next = (i + 1) % sides;
      ctx.beginPath();
      ctx.moveTo(this.outerPts[i].x, this.outerPts[i].y);
      ctx.lineTo(this.outerPts[next].x, this.outerPts[next].y);
      ctx.lineTo(this.innerPts[next].x, this.innerPts[next].y);
      ctx.lineTo(this.innerPts[i].x, this.innerPts[i].y);
      ctx.closePath();

      if (i === 0 || i === 5) {
        ctx.fillStyle = colors.highlight;
      } else if (i === 1 || i === 4) {
        ctx.fillStyle = colors.primary;
      } else {
        ctx.fillStyle = colors.shadow;
      }
      ctx.fill();
    }

    // Inner table
    ctx.beginPath();
    ctx.moveTo(this.innerPts[0].x, this.innerPts[0].y);
    for (let i = 1; i < sides; i++) {
      ctx.lineTo(this.innerPts[i].x, this.innerPts[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = colors.highlight;
    ctx.fill();

    // Crisp facet outline
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  /**
   * Amber Octagon: 8-sided faceted table cut
   */
  static drawAmberOctagon(ctx, cx, cy, size, colors) {
    const r = size * 0.42;
    const innerR = r * 0.58;
    const sides = 8;

    for (let i = 0; i < sides; i++) {
      const angle = (Math.PI / 4) * i - Math.PI / 8;
      this.outerPts[i].x = cx + r * Math.cos(angle);
      this.outerPts[i].y = cy + r * Math.sin(angle);
      this.innerPts[i].x = cx + innerR * Math.cos(angle);
      this.innerPts[i].y = cy + innerR * Math.sin(angle);
    }

    // Outer facets
    for (let i = 0; i < sides; i++) {
      const next = (i + 1) % sides;
      ctx.beginPath();
      ctx.moveTo(this.outerPts[i].x, this.outerPts[i].y);
      ctx.lineTo(this.outerPts[next].x, this.outerPts[next].y);
      ctx.lineTo(this.innerPts[next].x, this.innerPts[next].y);
      ctx.lineTo(this.innerPts[i].x, this.innerPts[i].y);
      ctx.closePath();

      if (i === 7 || i === 0 || i === 1) {
        ctx.fillStyle = colors.highlight;
      } else if (i === 2 || i === 6) {
        ctx.fillStyle = colors.primary;
      } else {
        ctx.fillStyle = colors.shadow;
      }
      ctx.fill();
    }

    // Center table
    ctx.beginPath();
    ctx.moveTo(this.innerPts[0].x, this.innerPts[0].y);
    for (let i = 1; i < sides; i++) {
      ctx.lineTo(this.innerPts[i].x, this.innerPts[i].y);
    }
    ctx.closePath();
    ctx.fillStyle = colors.highlight;
    ctx.fill();

    // Subtle edge shine
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  /**
   * Green Emerald: Brilliant emerald jewel with step cut
   */
  static drawGreenEmerald(ctx, cx, cy, size, colors) {
    const half = size * 0.40;
    const cut = half * 0.4;
    const inner = half * 0.6;
    const innerCut = inner * 0.4;

    // Outer chamfered box
    ctx.beginPath();
    ctx.moveTo(cx - half + cut, cy - half);
    ctx.lineTo(cx + half - cut, cy - half);
    ctx.lineTo(cx + half, cy - half + cut);
    ctx.lineTo(cx + half, cy + half - cut);
    ctx.lineTo(cx + half - cut, cy + half);
    ctx.lineTo(cx - half + cut, cy + half);
    ctx.lineTo(cx - half, cy + half - cut);
    ctx.lineTo(cx - half, cy - half + cut);
    ctx.closePath();

    const grad = ctx.createLinearGradient(cx - half, cy - half, cx + half, cy + half);
    grad.addColorStop(0, colors.highlight);
    grad.addColorStop(0.5, colors.primary);
    grad.addColorStop(1, colors.shadow);
    ctx.fillStyle = grad;
    ctx.fill();

    // Inner table
    ctx.beginPath();
    ctx.moveTo(cx - inner + innerCut, cy - inner);
    ctx.lineTo(cx + inner - innerCut, cy - inner);
    ctx.lineTo(cx + inner, cy - inner + innerCut);
    ctx.lineTo(cx + inner, cy + inner - innerCut);
    ctx.lineTo(cx + inner - innerCut, cy + inner);
    ctx.lineTo(cx - inner + innerCut, cy + inner);
    ctx.lineTo(cx - inner, cy + inner - innerCut);
    ctx.lineTo(cx - inner, cy - inner + innerCut);
    ctx.closePath();
    ctx.fillStyle = colors.primary;
    ctx.fill();

    // Inner specular line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}
