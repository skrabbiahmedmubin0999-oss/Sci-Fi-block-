/**
 * Sci-Fi Block Puzzle - Game Engine Loop & Context Manager
 * 
 * Responsibilities:
 * - Manages the primary game loop with fixed delta timing referencing TARGET_FPS
 * - Initializes the Canvas 2D context using GRID_ROWS & GRID_COLUMNS dimensions
 * - Handles high-DPI scaling strictly capped at MAX_DEVICE_PIXEL_RATIO
 * - Provides lifecycle controls: start(), stop(), pause(), resume(), destroy()
 */

import {
  GRID_ROWS,
  GRID_COLUMNS,
  MAX_DEVICE_PIXEL_RATIO,
  TARGET_FPS
} from '../config/constants.js';

export class Engine {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {HTMLElement} container
   * @param {object} [callbacks] - Optional update, render, and resize hooks
   * @param {function(number): void} [callbacks.onUpdate] - Update hook receiving delta time in seconds
   * @param {function(CanvasRenderingContext2D, object): void} [callbacks.onRender] - Render hook
   * @param {function(object): void} [callbacks.onResize] - Resize notification hook
   */
  constructor(canvas, container, callbacks = {}) {
    if (!canvas) {
      throw new Error('[Engine] A valid HTMLCanvasElement must be provided.');
    }
    if (!container) {
      throw new Error('[Engine] A valid container HTMLElement must be provided.');
    }

    this.canvas = canvas;
    this.container = container;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) {
      throw new Error('[Engine] 2D rendering context is not supported.');
    }

    // Grid configuration & constants
    this.gridRows = GRID_ROWS;
    this.gridColumns = GRID_COLUMNS;
    this.targetFps = TARGET_FPS;
    this.maxDpr = MAX_DEVICE_PIXEL_RATIO;
    this.targetFrameDuration = 1000 / this.targetFps; // e.g. ~16.667ms for 60 FPS

    // Viewport & High-DPI metrics
    this.dpr = Math.min(window.devicePixelRatio || 1, this.maxDpr);
    this.width = 0;
    this.height = 0;
    this.cellSize = 0;
    this.boardWidth = 0;
    this.boardHeight = 0;

    // Loop state
    this.isRunning = false;
    this.isPaused = false;
    this.animationFrameId = null;
    this.lastTimestamp = 0;

    // Callbacks
    this.callbacks = callbacks;

    // Method bindings
    this.loop = this.loop.bind(this);
    this.handleResize = this.handleResize.bind(this);

    this.init();
  }

  /**
   * Initialize context scaling and resize listeners.
   */
  init() {
    this.handleResize();
    window.addEventListener('resize', this.handleResize);
    window.addEventListener('orientationchange', this.handleResize);
  }

  /**
   * Recalculates canvas buffer resolution, high-DPI transform, and grid-based cell dimensions.
   */
  handleResize() {
    const rect = this.container.getBoundingClientRect();
    this.width = Math.floor(rect.width);
    this.height = Math.floor(rect.height);

    this.dpr = Math.min(window.devicePixelRatio || 1, this.maxDpr);

    // Physical pixel backing store
    this.canvas.width = Math.floor(this.width * this.dpr);
    this.canvas.height = Math.floor(this.height * this.dpr);

    // Logical CSS display size
    this.canvas.style.width = `${this.width}px`;
    this.canvas.style.height = `${this.height}px`;

    // Scale canvas context coordinate system to match DPR
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

    // Calculate cell and board sizing from grid configuration
    const maxBoardW = Math.min(this.width * 0.88, 480);
    const maxBoardH = Math.min(this.height * 0.54, 480);
    const boardDimension = Math.floor(Math.min(maxBoardW, maxBoardH));

    this.cellSize = Math.floor(boardDimension / this.gridColumns);
    this.boardWidth = this.cellSize * this.gridColumns;
    this.boardHeight = this.cellSize * this.gridRows;

    if (typeof this.callbacks.onResize === 'function') {
      this.callbacks.onResize(this.getMetrics());
    }
  }

  /**
   * Returns current layout and dimension metrics.
   * @returns {object}
   */
  getMetrics() {
    return {
      width: this.width,
      height: this.height,
      dpr: this.dpr,
      gridRows: this.gridRows,
      gridColumns: this.gridColumns,
      cellSize: this.cellSize,
      boardWidth: this.boardWidth,
      boardHeight: this.boardHeight,
      targetFps: this.targetFps
    };
  }

  /**
   * Starts the animation loop.
   */
  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.lastTimestamp = performance.now();
    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  /**
   * Stops the animation loop.
   */
  stop() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  /**
   * Pauses simulation updates and rendering without terminating the loop.
   */
  pause() {
    this.isPaused = true;
  }

  /**
   * Resumes simulation updates.
   */
  resume() {
    if (!this.isRunning) {
      this.start();
      return;
    }
    this.isPaused = false;
    this.lastTimestamp = performance.now();
  }

  /**
   * Main game loop iteration running via requestAnimationFrame.
   * Clamps delta time to prevent physics/animation instability on tab-switching.
   * @param {DOMHighResTimeStamp} timestamp
   */
  loop(timestamp) {
    if (!this.isRunning) return;

    const elapsed = timestamp - this.lastTimestamp;

    // Frame pacing: if RAF fires faster than target FPS (e.g. 120Hz/144Hz displays), throttle to TARGET_FPS
    if (elapsed < this.targetFrameDuration - 1) {
      this.animationFrameId = requestAnimationFrame(this.loop);
      return;
    }

    const rawDelta = elapsed / 1000;
    this.lastTimestamp = timestamp;

    // Clamp delta time to maximum 50ms (equivalent to 20 FPS lower threshold)
    const dt = Math.min(rawDelta, 0.05);

    if (!this.isPaused) {
      this.update(dt);
      this.render();
    }

    this.animationFrameId = requestAnimationFrame(this.loop);
  }

  /**
   * Invokes the registered update callback with elapsed delta time.
   * @param {number} dt - Delta time in seconds
   */
  update(dt) {
    if (typeof this.callbacks.onUpdate === 'function') {
      this.callbacks.onUpdate(dt);
    }
  }

  /**
   * Invokes the registered render callback with canvas context and layout metrics.
   */
  render() {
    if (typeof this.callbacks.onRender === 'function') {
      this.callbacks.onRender(this.ctx, this.getMetrics());
    }
  }

  /**
   * Clean up event listeners and stop the animation loop.
   */
  destroy() {
    this.stop();
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('orientationchange', this.handleResize);
  }
}
