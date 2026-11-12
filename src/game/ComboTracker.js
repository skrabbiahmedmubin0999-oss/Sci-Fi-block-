/**
 * Sci-Fi Block Puzzle - Combo & Multiplier Tracking Module
 * Monitors successive block clears, calculates combo multipliers and bonus scores,
 * and manages visual floating text indicators for multiplier achievements.
 */

export class ComboTracker {
  constructor() {
    this.comboCount = 0;
    this.maxCombo = 0;
    this.floatingTexts = [];
  }

  /**
   * Resets the active combo count to 0
   */
  resetCombo() {
    this.comboCount = 0;
  }

  /**
   * Current combo streak count
   * @returns {number}
   */
  getCombo() {
    return this.comboCount;
  }

  /**
   * Current multiplier value based on combo streak
   * @returns {number}
   */
  getMultiplier() {
    return this.comboCount > 0 ? this.comboCount : 1;
  }

  /**
   * Process a line clear event and calculate multiplier bonus
   * @param {number} linesCleared - Number of lines cleared in this move
   * @param {object|null} [position] - Optional {x, y} coordinates for floating text placement
   * @returns {object} Event result with combo metrics
   */
  registerClear(linesCleared, position = null) {
    if (linesCleared <= 0) {
      this.resetCombo();
      return {
        combo: 0,
        multiplier: 1,
        bonusScore: 0,
        isMultiplierBonus: false,
        label: ''
      };
    }

    // Increment combo streak for successive clear
    this.comboCount++;
    if (this.comboCount > this.maxCombo) {
      this.maxCombo = this.comboCount;
    }

    const multiplier = this.getMultiplier();
    const baseScore = linesCleared * 100;
    const bonusScore = baseScore * multiplier;

    // Multiplier bonus triggered on successive clears (combo >= 2) or multi-line clears (linesCleared >= 2)
    const isMultiplierBonus = this.comboCount >= 2 || linesCleared >= 2;
    let label = '';

    if (isMultiplierBonus) {
      if (linesCleared >= 2 && this.comboCount >= 2) {
        label = `MEGA COMBO ${linesCleared}L x${multiplier}!`;
      } else if (linesCleared >= 2) {
        label = `MULTI CLEAR ${linesCleared}L!`;
      } else {
        label = `COMBO x${multiplier}!`;
      }

      if (position && typeof position.x === 'number' && typeof position.y === 'number') {
        this.addFloatingText(label, position.x, position.y, {
          color: this.comboCount >= 3 ? '#f59e0b' : '#38bdf8',
          shadowColor: this.comboCount >= 3 ? 'rgba(245, 158, 11, 0.9)' : 'rgba(56, 189, 248, 0.9)',
          scale: Math.min(1 + (this.comboCount * 0.15), 1.8)
        });
      }
    }

    return {
      combo: this.comboCount,
      multiplier,
      bonusScore,
      isMultiplierBonus,
      label
    };
  }

  /**
   * Spawns a floating text indicator
   * @param {string} text
   * @param {number} x
   * @param {number} y
   * @param {object} [options]
   */
  addFloatingText(text, x, y, options = {}) {
    this.floatingTexts.push({
      text,
      x,
      y,
      startY: y,
      alpha: 1.0,
      scale: options.scale || 1.0,
      lifetime: 0,
      maxLifetime: options.duration || 1.0, // 1 second lifetime
      color: options.color || '#38bdf8',
      shadowColor: options.shadowColor || 'rgba(56, 189, 248, 0.8)'
    });
  }

  /**
   * Update floating text positions and lifetimes
   * @param {number} dt - Delta time in seconds
   */
  update(dt) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const item = this.floatingTexts[i];
      item.lifetime += dt;

      const progress = item.lifetime / item.maxLifetime;
      if (progress >= 1.0) {
        this.floatingTexts.splice(i, 1);
      } else {
        // Float upward by 45 pixels over duration
        item.y = item.startY - (progress * 45);
        // Fade out in the last 40% of duration
        item.alpha = progress > 0.6 ? 1.0 - ((progress - 0.6) / 0.4) : 1.0;
      }
    }
  }

  /**
   * Render floating text indicators onto the 2D canvas context
   * @param {CanvasRenderingContext2D} ctx
   */
  render(ctx) {
    if (!ctx || this.floatingTexts.length === 0) return;

    ctx.save();
    for (const item of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, item.alpha));
      ctx.shadowColor = item.shadowColor;
      ctx.shadowBlur = 10;
      ctx.fillStyle = item.color;

      const fontSize = Math.floor(20 * item.scale);
      ctx.font = `900 ${fontSize}px system-ui, -apple-system, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Outline stroke for legibility
      ctx.strokeStyle = '#090d16';
      ctx.lineWidth = 4;
      ctx.strokeText(item.text, item.x, item.y);
      ctx.fillText(item.text, item.x, item.y);
      ctx.restore();
    }
    ctx.restore();
  }

  /**
   * Clear all active floating texts and reset combo state
   */
  destroy() {
    this.floatingTexts = [];
    this.comboCount = 0;
  }
}
