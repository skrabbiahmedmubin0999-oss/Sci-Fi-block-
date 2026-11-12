/**
 * Sci-Fi Block Puzzle - Input Manager
 * Handles responsive pointer events (touch & mouse), coordinate normalization,
 * piece drag-and-drop, mobile thumb lift offset, and grid snapping.
 */

export class InputManager {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {object} callbacks - { onDragStart, onDragMove, onDragEnd, onButtonClick }
   */
  constructor(canvas, callbacks) {
    this.canvas = canvas;
    this.callbacks = callbacks;

    this.activePointerId = null;
    this.isDragging = false;
    this.draggedPiece = null;
    this.pointerType = 'mouse';

    // Touch lift offset so the user's thumb doesn't cover the piece
    this.touchLiftY = 60;
    this.dragOffsetX = 0;
    this.dragOffsetY = 0;

    // Reusable coords object to prevent GC allocations on high-frequency pointermove events
    this.coords = { x: 0, y: 0 };

    this.bindEvents();
  }

  bindEvents() {
    this.handlePointerDown = this.handlePointerDown.bind(this);
    this.handlePointerMove = this.handlePointerMove.bind(this);
    this.handlePointerUp = this.handlePointerUp.bind(this);
    this.handlePointerCancel = this.handlePointerCancel.bind(this);

    this.canvas.addEventListener('pointerdown', this.handlePointerDown);
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp);
    window.addEventListener('pointercancel', this.handlePointerCancel);
  }

  getCanvasCoords(e) {
    const rect = this.canvas.getBoundingClientRect();
    this.coords.x = e.clientX - rect.left;
    this.coords.y = e.clientY - rect.top;
    return this.coords;
  }

  handlePointerDown(e) {
    if (this.activePointerId !== null) return;
    this.activePointerId = e.pointerId;
    this.pointerType = e.pointerType;

    const coords = this.getCanvasCoords(e);
    // Keep the initial hit-test on the real pointer position. The game controller
    // applies the same touch lift to the piece on pickup and to later move/up events.
    this.callbacks.onPointerDown(coords, e);
  }

  handlePointerMove(e) {
    if (e.pointerId !== this.activePointerId) return;
    const coords = this.getCanvasCoords(e);

    // Apply the same mobile ergonomic lift used when the piece was picked up.
    if (this.pointerType === 'touch') {
      coords.y -= this.touchLiftY;
    }

    this.callbacks.onPointerMove(coords, e);
  }

  handlePointerUp(e) {
    if (e.pointerId !== this.activePointerId) return;
    this.activePointerId = null;
    const coords = this.getCanvasCoords(e);

    if (this.pointerType === 'touch') {
      coords.y -= this.touchLiftY;
    }

    this.callbacks.onPointerUp(coords, e);
  }

  handlePointerCancel(e) {
    if (e.pointerId !== this.activePointerId) return;
    this.activePointerId = null;
    this.callbacks.onPointerCancel(e);
  }

  destroy() {
    this.canvas.removeEventListener('pointerdown', this.handlePointerDown);
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
    window.removeEventListener('pointercancel', this.handlePointerCancel);
  }
}
