/**
 * Sci-Fi Block Puzzle - Chassis & Scene Renderer
 * Faithfully constructs the Image 2 (ADVANCED SCI-FI) environment:
 * - Orbital space station & planet crescent backdrop
 * - Heavy industrial gunmetal chassis with corner brackets & hex bolts
 * - Amber status indicator lights along vertical side rails
 * - Lower staging tray with cyan energy lines
 * - Hexagonal HUD controls & 3-gem objective display pod
 */

import { GemRenderer, GEM_TYPES } from './GemRenderer.js';

export class ChassisRenderer {
  static gradientCache = new Map();
  static pulsedGems = new Map();

  /**
   * Helper: Triggers a subtle pulse animation for a specific gem goal counter
   * @param {string} gemType
   */
  static triggerGemPulse(gemType) {
    this.pulsedGems.set(gemType, performance.now());
  }

  /**
   * Helper: Applies .hud-pulse class to a DOM element for non-canvas HUD elements
   * @param {HTMLElement} el
   */
  static triggerPulse(el) {
    if (!el) return;
    el.classList.remove('hud-pulse');
    void el.offsetWidth;
    el.classList.add('hud-pulse');
  }

  /**
   * Helper: Spawns a radial touch/click ripple animation on the HUD overlay
   * @param {number} x - Container-relative X coordinate
   * @param {number} y - Container-relative Y coordinate
   * @param {HTMLElement} container - The DOM container element (#hud-overlay)
   */
  static spawnRipple(x, y, container) {
    if (!container) return;
    const ripple = document.createElement('div');
    ripple.className = 'radial-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    container.appendChild(ripple);
    ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
  }

  static getGemPulseScale(gemType) {
    const startTime = this.pulsedGems.get(gemType);
    if (!startTime) return 1.0;
    const elapsed = (performance.now() - startTime) / 1000;
    const duration = 0.4; // 400ms subtle pulse
    if (elapsed >= duration) {
      this.pulsedGems.delete(gemType);
      return 1.0;
    }
    return 1.0 + Math.sin((elapsed / duration) * Math.PI) * 0.22;
  }

  static getBackgroundGradient(ctx, height, palette) {
    if (!ctx || typeof ctx.createLinearGradient !== 'function') {
      return palette.background.skyGradient[0];
    }
    const key = `BG_${Math.round(height)}_${palette.name}`;
    let grad = this.gradientCache.get(key);
    if (!grad) {
      try {
        grad = ctx.createLinearGradient(0, 0, 0, height);
        grad.addColorStop(0, palette.background.skyGradient[0]);
        grad.addColorStop(0.5, palette.background.skyGradient[1]);
        grad.addColorStop(1, palette.background.skyGradient[2]);
        this.gradientCache.set(key, grad);
      } catch {
        return palette.background.skyGradient[0];
      }
    }
    return grad;
  }

  /**
   * Render space station backdrop, planetary limb, and distant cosmic scenery.
   */
  static renderBackground(ctx, width, height, palette) {
    // Deep Space Gradient (cached)
    ctx.fillStyle = this.getBackgroundGradient(ctx, height, palette);
    ctx.fillRect(0, 0, width, height);

    if (palette.background.showOrbitalStation) {
      this.drawOrbitalStationScene(ctx, width, height, palette);
    }
  }

  /**
   * Orbital citadel and planetary limb in upper-right (from Image 2)
   */
  static drawOrbitalStationScene(ctx, width, height, palette) {
    ctx.save();

    // Planetary Atmosphere Arc (Upper Right)
    const arcCenterX = width * 1.15;
    const arcCenterY = height * 0.18;
    const arcRadius = Math.min(width, height) * 0.75;

    ctx.beginPath();
    ctx.arc(arcCenterX, arcCenterY, arcRadius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 29, 45, 0.3)';
    ctx.fill();

    // Orbital Station Silhouette (Upper Right, Image 2)
    const stX = width * 0.78;
    const stY = height * 0.085;
    const stScale = Math.min(width / 600, 1.2);

    ctx.save();
    ctx.translate(stX, stY);
    ctx.scale(stScale, stScale);

    ctx.fillStyle = '#0e1724';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;

    // Station central spire
    ctx.fillRect(20, -25, 4, 30);
    ctx.fillRect(16, -15, 12, 4);

    // Station main superstructure
    ctx.beginPath();
    ctx.moveTo(0, 5);
    ctx.lineTo(15, -4);
    ctx.lineTo(35, -4);
    ctx.lineTo(45, 5);
    ctx.lineTo(38, 12);
    ctx.lineTo(8, 12);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Station docking bay / antennae
    ctx.fillRect(26, -38, 2, 14);
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(26, -39, 2, 2); // Station beacon light

    ctx.restore();

    // Diagonal support beam (Top-Left, Image 2)
    ctx.fillStyle = '#0a1017';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(width * 0.18, 0);
    ctx.lineTo(0, height * 0.18);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#1a2636';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.restore();
  }

  /**
   * Main 8x8 Grid Chassis (Chassis with amber indicator lights from Image 2)
   */
  static renderChassis(ctx, bx, by, bw, bh, palette) {
    const c = palette.chassis;
    const thick = 14;

    ctx.save();

    // Outer heavy chassis casing
    ctx.strokeStyle = c.outerBorder;
    ctx.lineWidth = 3;
    ctx.strokeRect(bx - thick, by - thick, bw + thick * 2, bh + thick * 2);

    // Inner bevel rim
    ctx.strokeStyle = c.innerBorder;
    ctx.lineWidth = 2;
    ctx.strokeRect(bx - 3, by - 3, bw + 6, bh + 6);

    // Corner brackets / armor plates
    const cornerSize = Math.max(12, Math.floor(thick * 1.5));
    ctx.fillStyle = c.cornerAccent;

    // Top-Left, Top-Right, Bottom-Left, Bottom-Right Brackets
    this.drawCornerBracket(ctx, bx - thick, by - thick, cornerSize, 'tl', c.boltColor);
    this.drawCornerBracket(ctx, bx + bw + thick - cornerSize, by - thick, cornerSize, 'tr', c.boltColor);
    this.drawCornerBracket(ctx, bx - thick, by + bh + thick - cornerSize, cornerSize, 'bl', c.boltColor);
    this.drawCornerBracket(ctx, bx + bw + thick - cornerSize, by + bh + thick - cornerSize, cornerSize, 'br', c.boltColor);

    // Side Vertical Rails with Amber Indicator Status Lights (Image 2 detail)
    const indW = 4;
    const indH = Math.max(16, Math.floor(bh * 0.08));
    const leftX = bx - thick + 4;
    const rightX = bx + bw + thick - 8;

    ctx.fillStyle = c.sideIndicatorColor;
    ctx.shadowColor = c.sideIndicatorGlow;
    ctx.shadowBlur = 6;

    // 2 indicator bars per side
    ctx.fillRect(leftX, by + bh * 0.28, indW, indH);
    ctx.fillRect(leftX, by + bh * 0.62, indW, indH);
    ctx.fillRect(rightX, by + bh * 0.28, indW, indH);
    ctx.fillRect(rightX, by + bh * 0.62, indW, indH);

    ctx.shadowBlur = 0;
    ctx.restore();
  }

  static drawCornerBracket(ctx, x, y, size, corner, boltColor) {
    ctx.fillStyle = '#223040';
    ctx.fillRect(x, y, size, size);
    ctx.strokeStyle = '#3d4f63';
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, size, size);

    // Allen bolt in center
    ctx.fillStyle = boltColor;
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, 2.5, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Top HUD Bar: Hexagonal buttons (Pause & Settings) + Target Gem Pod (Image 2)
   */
  static renderHUD(ctx, x, y, width, goals, palette) {
    const hud = palette.hud;
    const btnSize = 42;

    // Left: Hexagonal Pause Button (||)
    this.drawHexButton(ctx, x + btnSize / 2, y, btnSize, hud, '||');

    // Right: Hexagonal Settings Button (Gear)
    this.drawHexButton(ctx, x + width - btnSize / 2, y, btnSize, hud, '⚙');

    // Center: Target Gem Pod (Diamond, Triangle, Hexagon with 30 / 30 / 30)
    const podW = Math.min(width * 0.58, 260);
    const podH = 46;
    const podX = x + (width - podW) / 2;
    const podY = y - podH / 2;

    ctx.save();
    // Chamfered Target Pod Container
    ctx.beginPath();
    const cut = 8;
    ctx.moveTo(podX + cut, podY);
    ctx.lineTo(podX + podW - cut, podY);
    ctx.lineTo(podX + podW, podY + cut);
    ctx.lineTo(podX + podW, podY + podH - cut);
    ctx.lineTo(podX + podW - cut, podY + podH);
    ctx.lineTo(podX + cut, podY + podH);
    ctx.lineTo(podX, podY + podH - cut);
    ctx.lineTo(podX, podY + cut);
    ctx.closePath();

    ctx.fillStyle = hud.podBg;
    ctx.fill();
    ctx.strokeStyle = hud.podBorder;
    ctx.lineWidth = 2;
    ctx.stroke();

    // 3 Target Slots
    const slotW = podW / 3;
    const targetGems = [
      { type: GEM_TYPES.BLUE_DIAMOND, count: goals.blueDiamond ?? 30 },
      { type: GEM_TYPES.RED_TRIANGLE, count: goals.redTriangle ?? 30 },
      { type: GEM_TYPES.PURPLE_HEXAGON, count: goals.purpleHexagon ?? 30 }
    ];

    targetGems.forEach((target, index) => {
      const cx = podX + slotW * index + slotW / 2;
      const cy = podY + 16;
      const scale = this.getGemPulseScale(target.type);

      ctx.save();
      if (scale > 1.0) {
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);
        ctx.translate(-cx, -cy);
      }

      // Draw mini gem
      GemRenderer.drawGem(ctx, target.type, cx, cy, 20, palette.gems);

      // Numeric counter
      ctx.fillStyle = scale > 1.0 ? '#38bdf8' : hud.counterText;
      ctx.font = '700 13px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(target.count), cx, podY + 34);
      ctx.restore();
    });

    ctx.restore();
  }

  /**
   * Draw Hexagonal HUD Button
   */
  static drawHexButton(ctx, cx, cy, size, hud, icon) {
    const r = size * 0.44;
    ctx.save();
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 6;
      const px = cx + r * Math.cos(angle);
      const py = cy + r * Math.sin(angle);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fillStyle = hud.buttonBg;
    ctx.fill();
    ctx.strokeStyle = hud.buttonBorder;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Icon
    ctx.fillStyle = hud.iconColor;
    ctx.font = icon === '⚙' ? '18px sans-serif' : '700 15px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(icon, cx, cy);
    ctx.restore();
  }

  /**
   * Bottom Piece Staging Bay with Cyan Energy Line Accents (Image 2)
   */
  static renderBottomTray(ctx, x, y, width, height, palette) {
    const c = palette.chassis;
    const cut = 12;

    ctx.save();
    // Chamfered Bottom Enclosure
    ctx.beginPath();
    ctx.moveTo(x + cut, y);
    ctx.lineTo(x + width - cut, y);
    ctx.lineTo(x + width, y + cut);
    ctx.lineTo(x + width, y + height - cut);
    ctx.lineTo(x + width - cut, y + height);
    ctx.lineTo(x + cut, y + height);
    ctx.lineTo(x, y + height - cut);
    ctx.lineTo(x, y + cut);
    ctx.closePath();

    ctx.fillStyle = '#0b131c';
    ctx.fill();
    ctx.strokeStyle = c.outerBorder;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Cyan horizontal accent lights (Image 2 detail)
    ctx.fillStyle = c.trayAccentColor;
    ctx.shadowColor = c.trayAccentGlow;
    ctx.shadowBlur = 8;

    const accentW = Math.max(24, Math.floor(width * 0.12));
    ctx.fillRect(x + width / 2 - accentW / 2, y + height - 3, accentW, 2);

    // Left and right vertical edge accents
    ctx.fillRect(x + 4, y + height / 2 - 8, 2, 16);
    ctx.fillRect(x + width - 6, y + height / 2 - 8, 2, 16);

    ctx.shadowBlur = 0;
    ctx.restore();
  }
}
