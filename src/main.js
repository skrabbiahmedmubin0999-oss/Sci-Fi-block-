import './index.css';
import { GRID_ROWS, GRID_COLUMNS, MAX_DEVICE_PIXEL_RATIO } from './config/constants.js';
import { PRESETS, PRESET_IDS, DEFAULT_PRESET_ID } from './config/presets.js';
import { Board } from './game/Board.js';
import { PieceSpawner } from './game/PieceSpawner.js';
import { ChassisRenderer } from './renderers/ChassisRenderer.js';
import { BlockRenderer, BLOCK_TYPES } from './renderers/BlockRenderer.js';
import { GemRenderer, GEM_TYPES } from './renderers/GemRenderer.js';
import { InputManager } from './engine/InputManager.js';
import { SoundManager } from './engine/SoundManager.js';
import { Engine } from './game/Engine.js';
import { GemTracker } from './game/GemTracker.js';
import { ComboTracker } from './game/ComboTracker.js';
import { Leaderboard } from './game/Leaderboard.js';

/**
 * Sci-Fi Block Puzzle - Main Game Controller
 * Faithfully applies the ADVANCED SCI-FI aesthetic (Image 2) across all elements:
 * - Orbital space station & planetary backdrop
 * - Heavy industrial gunmetal chassis with amber indicator lights
 * - Jade composite blocks & brushed titanium gem sockets
 * - Bottom staging tray with cyan energy lines
 * - Hexagonal HUD controls & 30/30/30 target gem counters
 */
class SciFiBlockPuzzleGame {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.container = document.getElementById('game-canvas-container');
    this.hudOverlay = document.getElementById('hud-overlay');

    if (!this.canvas || !this.container) {
      console.error('[SciFiGame] Required DOM elements not found.');
      return;
    }

    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) {
      console.error('[SciFiGame] 2D rendering context not supported.');
      return;
    }

    // Active visual preset: ADVANCED SCI-FI (Image 2)
    this.currentPresetId = DEFAULT_PRESET_ID;
    this.preset = PRESETS[this.currentPresetId];

    // High-DPI parameters
    this.dpr = Math.min(window.devicePixelRatio || 1, MAX_DEVICE_PIXEL_RATIO);
    this.displayWidth = 0;
    this.displayHeight = 0;

    // Game Core State
    this.board = new Board();
    this.spawner = new PieceSpawner();
    this.spawner.spawnInitialPresetPieces();
    this.sound = new SoundManager();
    this.comboTracker = new ComboTracker();
    this.leaderboard = new Leaderboard();
    this.hasSubmittedSessionScore = false;
    this.lastSessionScoreResult = null;

    // Player Progress & Goals (Image 2 target counters: 30 / 30 / 30)
    this.goals = {
      blueDiamond: 30,
      redTriangle: 30,
      purpleHexagon: 30
    };
    this.score = 0;
    this.combo = 0;

    // Drag-and-Drop state
    this.draggedPiece = null;
    this.dragPointerOffset = { x: 0, y: 0 };
    this.currentPointerPos = { x: 0, y: 0 };
    this.hoverTargetCell = null; // { r, c, isValid }

    // Line clearing animation state
    this.clearingLines = []; // array of { type: 'row'|'col', index: number, progress: number }

    // Layout metrics (dynamically computed in resize)
    this.layout = {
      hudY: 34,
      boardX: 0,
      boardY: 0,
      boardSize: 0,
      cellSize: 0,
      trayX: 0,
      trayY: 0,
      trayWidth: 0,
      trayHeight: 0,
      traySlotWidth: 0
    };

    // Modal state
    this.isSettingsOpen = false;
    this.isGameOver = false;

    this.init();
  }

  init() {
    // Initialize input manager
    this.input = new InputManager(this.canvas, {
      onPointerDown: this.onPointerDown.bind(this),
      onPointerMove: this.onPointerMove.bind(this),
      onPointerUp: this.onPointerUp.bind(this),
      onPointerCancel: this.onPointerCancel.bind(this)
    });

    // Initialize Engine to handle loop (TARGET_FPS) and context initialization
    this.engine = new Engine(this.canvas, this.container, {
      onUpdate: (dt) => this.update(dt),
      onRender: () => this.render(),
      onResize: (metrics) => this.onEngineResize(metrics)
    });

    this.onEngineResize(this.engine.getMetrics());
    this.setupHUDOverlay();
    this.engine.start();

    console.log(`[SciFiGame] Engine active with aesthetic: ${this.preset.name} (${this.engine.targetFps} FPS target)`);
  }

  onEngineResize(metrics) {
    this.displayWidth = metrics.width;
    this.displayHeight = metrics.height;
    this.dpr = metrics.dpr;

    const w = this.displayWidth;
    const h = this.displayHeight;

    // Top HUD
    this.layout.hudY = Math.max(34, h * 0.05);

    // 8x8 Board calculation using Engine's grid configuration
    this.layout.cellSize = metrics.cellSize;
    this.layout.boardSize = metrics.boardWidth;
    this.layout.boardX = Math.floor((w - this.layout.boardSize) / 2);
    this.layout.boardY = Math.floor(this.layout.hudY + 44 + (h * 0.02));

    // Bottom Tray calculation
    const trayTop = this.layout.boardY + this.layout.boardSize + 22;
    const trayH = Math.max(90, Math.min(h - trayTop - 16, 120));
    const trayW = Math.min(w * 0.92, 540);

    this.layout.trayX = Math.floor((w - trayW) / 2);
    this.layout.trayY = Math.floor(trayTop);
    this.layout.trayWidth = Math.floor(trayW);
    this.layout.trayHeight = Math.floor(trayH);
    this.layout.traySlotWidth = Math.floor(trayW / 3);

    // Recalculate tray piece base positions
    this.updateTrayPiecePositions();
  }

  updateTrayPiecePositions() {
    const pieces = this.spawner.slots;
    const slotW = this.layout.traySlotWidth;
    const trayY = this.layout.trayY;
    const trayH = this.layout.trayHeight;
    const trayX = this.layout.trayX;
    const trayCellSize = Math.max(14, Math.floor(this.layout.cellSize * 0.62));

    pieces.forEach((piece, index) => {
      if (!piece || piece.placed) return;

      const pieceW = piece.cols * trayCellSize;
      const pieceH = piece.rows * trayCellSize;

      const slotCenterX = trayX + index * slotW + slotW / 2;
      const slotCenterY = trayY + trayH / 2;

      piece.baseX = Math.floor(slotCenterX - pieceW / 2);
      piece.baseY = Math.floor(slotCenterY - pieceH / 2);

      if (!piece.isDragging) {
        piece.x = piece.baseX;
        piece.y = piece.baseY;
      }
    });
  }

  // --- Pointer & Drag-and-Drop Interaction ---

  onPointerDown(coords, event = null) {
    if (this.isSettingsOpen || this.isGameOver) return;

    // Trigger visual touch/click radial ripple indicator
    ChassisRenderer.spawnRipple(coords.x, coords.y, this.hudOverlay);

    // 1. Check HUD Button Clicks (Hex Buttons)
    const btnSize = 42;
    const hudW = Math.min(this.displayWidth * 0.92, 520);
    const hudX = (this.displayWidth - hudW) / 2;
    const hudY = this.layout.hudY;

    // Pause Button (Left)
    if (Math.hypot(coords.x - (hudX + btnSize / 2), coords.y - hudY) <= btnSize / 2 + 6) {
      this.sound.playClick();
      this.openSettingsModal();
      return;
    }

    // Settings Button (Right)
    if (Math.hypot(coords.x - (hudX + hudW - btnSize / 2), coords.y - hudY) <= btnSize / 2 + 6) {
      this.sound.playClick();
      this.openSettingsModal();
      return;
    }

    // 2. Check Tray Pieces
    const trayCellSize = Math.max(14, Math.floor(this.layout.cellSize * 0.62));
    const pieces = this.spawner.getActivePieces();

    for (const piece of pieces) {
      if (piece.containsPoint(coords.x, coords.y, trayCellSize)) {
        this.draggedPiece = piece;
        piece.isDragging = true;
        this.sound.playPickup();

        // Center piece on pointer
        const activeCellSize = this.layout.cellSize;
        const dragW = piece.cols * activeCellSize;
        const dragH = piece.rows * activeCellSize;

        this.dragPointerOffset = {
          x: dragW / 2,
          y: dragH / 2
        };

        const touchLift = event?.pointerType === 'touch' ? 60 : 0;
        piece.x = coords.x - this.dragPointerOffset.x;
        piece.y = coords.y - this.dragPointerOffset.y - touchLift;
        this.currentPointerPos = { x: coords.x, y: coords.y - touchLift };

        this.updateSnapTarget(this.currentPointerPos);
        break;
      }
    }
  }

  onPointerMove(coords) {
    if (!this.draggedPiece) return;
    this.currentPointerPos = coords;

    this.draggedPiece.x = coords.x - this.dragPointerOffset.x;
    this.draggedPiece.y = coords.y - this.dragPointerOffset.y;

    this.updateSnapTarget(coords);
  }

  updateSnapTarget(coords) {
    if (!this.draggedPiece) return;

    const bx = this.layout.boardX;
    const by = this.layout.boardY;
    const cs = this.layout.cellSize;

    // Calculate grid cell nearest to piece top-left
    const px = this.draggedPiece.x;
    const py = this.draggedPiece.y;

    const col = Math.round((px - bx) / cs);
    const row = Math.round((py - by) / cs);

    if (row >= 0 && row < GRID_ROWS && col >= 0 && col < GRID_COLUMNS) {
      const isValid = typeof this.board.canPlacePiece === 'function'
        ? this.board.canPlacePiece(this.draggedPiece, row, col)
        : false;
      if (isValid && (!this.hoverTargetCell || this.hoverTargetCell.r !== row || this.hoverTargetCell.c !== col)) {
        this.sound.playSnap();
      }
      this.hoverTargetCell = { r: row, c: col, isValid };
    } else {
      this.hoverTargetCell = null;
    }
  }

  onPointerUp(coords) {
    if (!this.draggedPiece) return;

    const piece = this.draggedPiece;
    this.draggedPiece = null;
    piece.isDragging = false;

    // Validate placement
    if (this.hoverTargetCell && this.hoverTargetCell.isValid) {
      const { r, c } = this.hoverTargetCell;
      const success = typeof this.board.placePiece === 'function'
        ? this.board.placePiece(piece, r, c)
        : false;

      if (success) {
        piece.placed = true;
        this.sound.playPlace();
        this.score += piece.getOccupiedCellCount() * 10;

        // Check for line clears
        const clearResult = typeof this.board.checkAndClearLines === 'function'
          ? this.board.checkAndClearLines()
          : { linesCleared: 0, collectedGems: {}, rows: [], cols: [] };

        if (clearResult.linesCleared > 0) {
          this.handleLineClears(clearResult);
        } else {
          this.comboTracker.resetCombo();
          this.combo = 0;
        }

        // Spawn new batch if tray is empty
        if (this.spawner.areAllPlaced()) {
          this.spawner.spawnNewBatch(this.board);
          this.updateTrayPiecePositions();
        }

        // Check game over
        this.checkGameOverState();
      } else {
        // Return to tray
        this.springPieceBack(piece);
      }
    } else {
      // Return to tray
      this.springPieceBack(piece);
    }

    this.hoverTargetCell = null;
  }

  onPointerCancel() {
    if (this.draggedPiece) {
      this.springPieceBack(this.draggedPiece);
      this.draggedPiece.isDragging = false;
      this.draggedPiece = null;
      this.hoverTargetCell = null;
    }
  }

  springPieceBack(piece) {
    piece.x = piece.baseX;
    piece.y = piece.baseY;
  }

  handleLineClears(clearResult) {
    // Board center coordinate for floating text placement
    const floatPos = {
      x: this.layout.boardX + this.layout.boardSize / 2,
      y: this.layout.boardY + this.layout.boardSize / 2
    };

    const comboRes = this.comboTracker.registerClear(clearResult.linesCleared, floatPos);
    this.combo = comboRes.combo;
    this.score += comboRes.bonusScore;
    this.sound.playClear(clearResult.linesCleared);

    // Decrement collected gem goals (e.g. from 30 toward 0)
    for (const [gemType, count] of Object.entries(clearResult.collectedGems)) {
      if (this.goals[gemType] !== undefined && count > 0) {
        this.goals[gemType] = Math.max(0, this.goals[gemType] - count);
        ChassisRenderer.triggerGemPulse(gemType);
      }
    }

    // Track gem collection events and pulse DOM counter elements via GemTracker
    if (this.gemTracker) {
      this.gemTracker.trackCollection(clearResult.collectedGems);
    }

    // Trigger visual line clear wave animation
    clearResult.rows.forEach(r => {
      this.clearingLines.push({ type: 'row', index: r, progress: 0 });
    });
    clearResult.cols.forEach(c => {
      this.clearingLines.push({ type: 'col', index: c, progress: 0 });
    });
  }

  checkGameOverState() {
    const activePieces = this.spawner.getActivePieces();
    if (
      activePieces.length > 0 &&
      typeof this.board.canAnyPieceFit === 'function' &&
      !this.board.canAnyPieceFit(activePieces)
    ) {
      this.isGameOver = true;
      this.showGameOverModal();
    }
  }


  update(dt) {
    // Update line clear animations
    for (let i = this.clearingLines.length - 1; i >= 0; i--) {
      const line = this.clearingLines[i];
      line.progress += dt * 3.5; // Complete in ~300ms
      if (line.progress >= 1.0) {
        this.clearingLines.splice(i, 1);
      }
    }

    // Update floating combo multiplier texts
    this.comboTracker?.update(dt);
  }

  render() {
    const ctx = this.ctx;
    const w = this.displayWidth;
    const h = this.displayHeight;

    ctx.clearRect(0, 0, w, h);

    // 1. Atmospheric Space Station Background (Image 2)
    ChassisRenderer.renderBackground(ctx, w, h, this.preset);

    // 2. Main 8x8 Board Chassis & Indicator Lights
    const bx = this.layout.boardX;
    const by = this.layout.boardY;
    const bs = this.layout.boardSize;
    const cs = this.layout.cellSize;

    ChassisRenderer.renderChassis(ctx, bx, by, bs, bs, this.preset);

    // 3. Render 8x8 Grid Wells
    this.renderGridWells(ctx, bx, by, bs, cs);

    // 4. Render Board Blocks & Socketed Gems
    this.renderBoardCells(ctx, bx, by, cs);

    // 5. Render Line Clearing Flash Animations
    this.renderLineClears(ctx, bx, by, bs, cs);

    // 6. Render Ghost Preview when dragging over valid cells
    if (this.draggedPiece && this.hoverTargetCell && this.hoverTargetCell.isValid) {
      this.renderGhostPreview(ctx, bx, by, cs);
    }

    // 7. Render Bottom Piece Staging Bay with Cyan Energy Accents
    ChassisRenderer.renderBottomTray(
      ctx,
      this.layout.trayX,
      this.layout.trayY,
      this.layout.trayWidth,
      this.layout.trayHeight,
      this.preset
    );

    // 8. Render Staging Tray Pieces
    this.renderTrayPieces(ctx);

    // 9. Render Dragged Piece (floating with scale)
    if (this.draggedPiece) {
      this.renderDraggedPiece(ctx);
    }

    // 10. Top HUD Controls & 3-Gem Target Pod (Image 2 aesthetic)
    const hudW = Math.min(w * 0.92, 520);
    const hudX = (w - hudW) / 2;
    ChassisRenderer.renderHUD(ctx, hudX, this.layout.hudY, hudW, this.goals, this.preset);

    // 11. Render floating combo text indicators
    this.comboTracker?.render(ctx);
  }

  renderGridWells(ctx, bx, by, bs, cs) {
    const g = this.preset.grid;
    ctx.fillStyle = g.wellColor;
    ctx.fillRect(bx, by, bs, bs);

    // 1. Batch grid cell borders into a single path
    ctx.beginPath();
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLUMNS; c++) {
        ctx.rect(bx + c * cs, by + r * cs, cs, cs);
      }
    }
    ctx.strokeStyle = g.cellBorder;
    ctx.lineWidth = 1;
    ctx.stroke();

    // High-contrast grid cell highlights under valid drag hover preview
    if (this.draggedPiece && this.hoverTargetCell && this.hoverTargetCell.isValid) {
      const piece = this.draggedPiece;
      const { r: startR, c: startC } = this.hoverTargetCell;

      ctx.save();
      ctx.fillStyle = g.highlightColor || 'rgba(56, 189, 248, 0.25)';
      ctx.strokeStyle = this.preset.chassis?.trayAccentColor || '#38bdf8';
      ctx.lineWidth = 1.5;

      for (let r = 0; r < piece.rows; r++) {
        for (let c = 0; c < piece.cols; c++) {
          if (piece.matrix[r][c] === 1) {
            const cellR = startR + r;
            const cellC = startC + c;
            if (cellR >= 0 && cellR < GRID_ROWS && cellC >= 0 && cellC < GRID_COLUMNS) {
              const x = bx + cellC * cs;
              const y = by + cellR * cs;
              ctx.fillRect(x + 1, y + 1, cs - 2, cs - 2);
              ctx.strokeRect(x + 1, y + 1, cs - 2, cs - 2);
            }
          }
        }
      }
      ctx.restore();
    }

    // 2. Batch center locator dots into a single path
    ctx.beginPath();
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLUMNS; c++) {
        ctx.rect(bx + c * cs + cs / 2 - 1, by + r * cs + cs / 2 - 1, 2, 2);
      }
    }
    ctx.fillStyle = g.centerDotColor;
    ctx.fill();
  }

  renderBoardCells(ctx, bx, by, cs) {
    for (let r = 0; r < GRID_ROWS; r++) {
      for (let c = 0; c < GRID_COLUMNS; c++) {
        if (this.board.isOccupied(r, c)) {
          const x = bx + c * cs;
          const y = by + r * cs;
          const gem = typeof this.board.getGem === 'function' ? this.board.getGem(r, c) : null;
          BlockRenderer.drawBlock(
            ctx,
            x,
            y,
            cs,
            gem ? BLOCK_TYPES.SOCKET : BLOCK_TYPES.STANDARD,
            gem,
            this.preset
          );
        }
      }
    }
  }

  renderLineClears(ctx, bx, by, bs, cs) {
    if (this.clearingLines.length === 0) return;

    const accentColor = this.preset.chassis?.trayAccentColor || '#38bdf8';
    const accentGlow = this.preset.chassis?.trayAccentGlow || 'rgba(56, 189, 248, 0.5)';

    this.clearingLines.forEach(line => {
      ctx.save();
      const sinProgress = Math.sin(line.progress * Math.PI);
      const alpha = sinProgress * 0.85;

      ctx.shadowColor = accentGlow;
      ctx.shadowBlur = Math.floor(12 * sinProgress);

      if (line.type === 'row') {
        const y = by + line.index * cs;
        // Inner glowing flash beam
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
        ctx.fillRect(bx, y + cs * 0.25, bs, cs * 0.5);

        // Outer aura pulse matching preset accent
        ctx.fillStyle = accentColor;
        ctx.globalAlpha = alpha * 0.45;
        ctx.fillRect(bx, y, bs, cs);
      } else {
        const x = bx + line.index * cs;
        // Inner glowing flash beam
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.9})`;
        ctx.fillRect(x + cs * 0.25, by, cs * 0.5, bs);

        // Outer aura pulse matching preset accent
        ctx.fillStyle = accentColor;
        ctx.globalAlpha = alpha * 0.45;
        ctx.fillRect(x, by, cs, bs);
      }
      ctx.restore();
    });
  }

  renderGhostPreview(ctx, bx, by, cs) {
    const piece = this.draggedPiece;
    const { r: startR, c: startC } = this.hoverTargetCell;

    for (let r = 0; r < piece.rows; r++) {
      for (let c = 0; c < piece.cols; c++) {
        if (piece.matrix[r][c] === 1) {
          const x = bx + (startC + c) * cs;
          const y = by + (startR + r) * cs;
          const gem = piece.getGemAt(r, c);

          BlockRenderer.drawBlock(ctx, x, y, cs, gem ? BLOCK_TYPES.SOCKET : BLOCK_TYPES.STANDARD, gem, this.preset, {
            alpha: 0.5,
            isGhost: true
          });
        }
      }
    }
  }

  renderTrayPieces(ctx) {
    const pieces = this.spawner.slots;
    const trayCellSize = Math.max(14, Math.floor(this.layout.cellSize * 0.62));

    pieces.forEach(piece => {
      if (!piece || piece.placed || piece.isDragging) return;

      for (let r = 0; r < piece.rows; r++) {
        for (let c = 0; c < piece.cols; c++) {
          if (piece.matrix[r][c] === 1) {
            const x = piece.x + c * trayCellSize;
            const y = piece.y + r * trayCellSize;
            const gem = piece.getGemAt(r, c);

            BlockRenderer.drawBlock(
              ctx,
              x,
              y,
              trayCellSize,
              gem ? BLOCK_TYPES.SOCKET : BLOCK_TYPES.STANDARD,
              gem,
              this.preset
            );
          }
        }
      }
    });
  }

  renderDraggedPiece(ctx) {
    const piece = this.draggedPiece;
    const cs = this.layout.cellSize; // Enlarged to board scale when lifted!

    ctx.save();
    // Drop shadow under floating piece
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 14;
    ctx.shadowOffsetY = 10;

    for (let r = 0; r < piece.rows; r++) {
      for (let c = 0; c < piece.cols; c++) {
        if (piece.matrix[r][c] === 1) {
          const x = piece.x + c * cs;
          const y = piece.y + r * cs;
          const gem = piece.getGemAt(r, c);

          BlockRenderer.drawBlock(
            ctx,
            x,
            y,
            cs,
            gem ? BLOCK_TYPES.SOCKET : BLOCK_TYPES.STANDARD,
            gem,
            this.preset
          );
        }
      }
    }
    ctx.restore();
  }

  // --- HUD & Futuristic Overlay System ---

  setupHUDOverlay() {
    this.hudOverlay.innerHTML = `
      <!-- DOM Gem Counter Elements for GemTracker animations -->
      <div id="hud-gem-counters" class="pointer-events-none absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-3 opacity-0">
        <div data-gem-counter="blueDiamond" class="gem-counter-badge"></div>
        <div data-gem-counter="redTriangle" class="gem-counter-badge"></div>
        <div data-gem-counter="purpleHexagon" class="gem-counter-badge"></div>
      </div>

      <div id="game-modal" class="hidden pointer-events-auto fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity">
        <div class="relative w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900/95 p-6 shadow-2xl text-slate-100">
          <div class="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <h2 id="modal-title" class="text-lg font-bold tracking-wider text-teal-400">COMMAND CONSOLE</h2>
            <button id="modal-close-btn" class="p-1 rounded text-slate-400 hover:text-white transition">✕</button>
          </div>

          <div id="modal-body" class="space-y-4">
            <button id="modal-resume-btn" class="w-full py-2.5 rounded-lg border border-teal-500/50 bg-teal-950/50 text-teal-200 text-sm font-bold tracking-wide hover:bg-teal-900/60 transition">
              RESUME GAME
            </button>

            <!-- Preset Selector -->
            <div>
              <label class="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Visual Aesthetic Mode</label>
              <div class="grid grid-cols-1 gap-2">
                <button data-preset="${PRESET_IDS.ADVANCED}" class="preset-btn flex items-center justify-between p-3 rounded-lg border border-teal-500/50 bg-teal-950/40 text-teal-200 text-sm font-semibold hover:bg-teal-900/60 transition">
                  <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-teal-400"></span>
                    <span>ADVANCED SCI-FI (Definitive)</span>
                  </div>
                  <span class="text-xs text-teal-400/80">Image 2</span>
                </button>
                <button data-preset="${PRESET_IDS.ULTRA}" class="preset-btn flex items-center justify-between p-3 rounded-lg border border-slate-700 bg-slate-800/40 text-slate-300 text-sm font-semibold hover:bg-slate-800 transition">
                  <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-amber-400"></span>
                    <span>ULTRA SCI-FI (Gold/Cosmic)</span>
                  </div>
                  <span class="text-xs text-slate-400">Image 1</span>
                </button>
                <button data-preset="${PRESET_IDS.NORMAL}" class="preset-btn flex items-center justify-between p-3 rounded-lg border border-slate-700 bg-slate-800/40 text-slate-300 text-sm font-semibold hover:bg-slate-800 transition">
                  <div class="flex items-center gap-2">
                    <span class="w-3 h-3 rounded-full bg-slate-400"></span>
                    <span>NORMAL SCI-FI (Slate/Tactical)</span>
                  </div>
                  <span class="text-xs text-slate-400">Image 3</span>
                </button>
              </div>
            </div>

            <!-- Sound & Controls -->
            <div class="pt-2 border-t border-slate-800 flex items-center justify-between">
              <span class="text-sm text-slate-300 font-medium">Synthesizer Audio</span>
              <button id="toggle-sound-btn" class="px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-200 hover:border-slate-500 transition">
                ACTIVE
              </button>
            </div>

            <!-- Reset Matrix -->
            <button id="restart-game-btn" class="w-full mt-2 py-2.5 rounded-lg border border-rose-900/50 bg-rose-950/40 text-rose-300 text-sm font-bold tracking-wide hover:bg-rose-900/60 transition">
              RESET MATRIX
            </button>
          </div>
        </div>
      </div>
    `;

    // Bind Modal Events
    const modal = document.getElementById('game-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    const soundBtn = document.getElementById('toggle-sound-btn');
    const restartBtn = document.getElementById('restart-game-btn');
    const presetBtns = document.querySelectorAll('.preset-btn');

    closeBtn?.addEventListener('click', () => this.closeSettingsModal());

    const resumeBtn = document.getElementById('modal-resume-btn');
    resumeBtn?.addEventListener('click', () => this.closeSettingsModal());

    presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-preset');
        if (targetId && PRESETS[targetId]) {
          this.switchPreset(targetId);
        }
      });
    });

    soundBtn?.addEventListener('click', () => {
      this.sound.enabled = !this.sound.enabled;
      soundBtn.textContent = this.sound.enabled ? 'ACTIVE' : 'MUTED';
      soundBtn.className = this.sound.enabled
        ? 'px-3 py-1.5 rounded-lg border border-teal-500/50 bg-teal-950/60 text-xs font-semibold text-teal-300 transition'
        : 'px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800 text-xs font-semibold text-slate-400 transition';
    });

    restartBtn?.addEventListener('click', () => {
      this.resetGame();
      this.closeSettingsModal();
    });

    // Initialize GemTracker logic module bound to HUD overlay
    this.gemTracker = new GemTracker(this.hudOverlay);
  }

  openSettingsModal() {
    this.isSettingsOpen = true;
    this.engine?.pause();
    const modal = document.getElementById('game-modal');
    if (modal) modal.classList.remove('hidden');
    this.updateModalPresetButtons();
  }

  closeSettingsModal() {
    this.isSettingsOpen = false;
    const modal = document.getElementById('game-modal');
    if (modal) modal.classList.add('hidden');
    if (!this.isGameOver) this.engine?.resume();
  }

  updateModalPresetButtons() {
    const presetBtns = document.querySelectorAll('.preset-btn');
    presetBtns.forEach(btn => {
      const pid = btn.getAttribute('data-preset');
      if (pid === this.currentPresetId) {
        btn.className = 'preset-btn flex items-center justify-between p-3 rounded-lg border border-teal-500 bg-teal-950/60 text-teal-200 text-sm font-semibold transition';
      } else {
        btn.className = 'preset-btn flex items-center justify-between p-3 rounded-lg border border-slate-700 bg-slate-800/40 text-slate-300 text-sm font-semibold hover:bg-slate-800 transition';
      }
    });
  }

  switchPreset(presetId) {
    if (!PRESETS[presetId]) return;
    this.currentPresetId = presetId;
    this.preset = PRESETS[presetId];
    this.sound.playClick();
    this.updateModalPresetButtons();
    console.log(`[SciFiGame] Switched aesthetic to: ${this.preset.name}`);
  }

  showGameOverModal() {
    this.openSettingsModal();
    const title = document.getElementById('modal-title');
    if (title) {
      title.textContent = 'NO MOVES REMAINING';
      title.className = 'text-lg font-bold tracking-wider text-rose-400';
    }

    // Submit session final score exactly ONCE per game session
    if (!this.hasSubmittedSessionScore) {
      this.hasSubmittedSessionScore = true;
      this.lastSessionScoreResult = this.leaderboard.addScore(this.score);
    }

  }

  resetGame() {
    this.board.init();
    this.spawner.spawnInitialPresetPieces();
    this.updateTrayPiecePositions();
    this.comboTracker?.destroy();
    this.hasSubmittedSessionScore = false;
    this.lastSessionScoreResult = null;
    this.goals = {
      blueDiamond: 30,
      redTriangle: 30,
      purpleHexagon: 30
    };
    this.score = 0;
    this.combo = 0;
    this.isGameOver = false;
    this.engine?.resume();
    this.sound.playClear(2);
  }

  destroy() {
    this.engine?.destroy();
    this.input?.destroy();
  }
}

// Bootstrap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new SciFiBlockPuzzleGame());
} else {
  new SciFiBlockPuzzleGame();
}
