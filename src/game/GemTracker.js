/**
 * Sci-Fi Block Puzzle - Gem Collection Event Tracker Module
 * Tracks gem collection events, maps them to HUD gem counters,
 * and manages visual pulse animations on specific DOM elements.
 */

export class GemTracker {
  /**
   * @param {HTMLElement|null} container - Optional parent HUD overlay container element
   * @param {Record<string, HTMLElement>} elementsMap - Optional map of gemType -> HTMLElement
   */
  constructor(container = null, elementsMap = {}) {
    this.container = container;
    this.elements = new Map();
    this.activeTimeouts = new Map();
    this.listeners = new Map();

    for (const [gemType, el] of Object.entries(elementsMap)) {
      if (el) this.elements.set(gemType, el);
    }

    if (container) {
      this.registerFromContainer(container);
    }
  }

  /**
   * Register a DOM element for a specific gem type counter
   * @param {string} gemType
   * @param {HTMLElement} element
   */
  registerElement(gemType, element) {
    if (!gemType || !element) return;
    this.elements.set(gemType, element);
  }

  /**
   * Automatically register elements from container by data attributes or classes
   * @param {HTMLElement} container
   */
  registerFromContainer(container) {
    if (!container || typeof container.querySelectorAll !== 'function') return;
    this.container = container;

    const nodes = container.querySelectorAll('[data-gem-counter], [data-gem-type]');
    nodes.forEach(node => {
      const gemType = node.getAttribute('data-gem-counter') || node.getAttribute('data-gem-type');
      if (gemType) {
        this.elements.set(gemType, node);
      }
    });
  }

  /**
   * Retrieve the registered DOM element for a gem type
   * @param {string} gemType
   * @returns {HTMLElement|null}
   */
  getElement(gemType) {
    if (this.elements.has(gemType)) {
      return this.elements.get(gemType);
    }

    if (this.container && typeof this.container.querySelector === 'function') {
      const found = this.container.querySelector(`[data-gem-counter="${gemType}"], [data-gem-type="${gemType}"]`);
      if (found) {
        this.elements.set(gemType, found);
        return found;
      }
    }

    if (typeof document !== 'undefined' && typeof document.querySelector === 'function') {
      const found = document.querySelector(`[data-gem-counter="${gemType}"], [data-gem-type="${gemType}"]`);
      if (found) {
        this.elements.set(gemType, found);
        return found;
      }
    }

    return null;
  }

  /**
   * Track collection event and trigger hud-pulse on specific gem counter elements
   * @param {Record<string, number>|string[]|null|undefined} collectedGems
   * @returns {string[]} Array of gem types that successfully triggered pulse animations
   */
  trackCollection(collectedGems) {
    if (!collectedGems) return [];

    const pulsed = [];

    if (Array.isArray(collectedGems)) {
      for (const gemType of collectedGems) {
        if (this.pulseCounter(gemType)) {
          pulsed.push(gemType);
        }
      }
    } else if (typeof collectedGems === 'object') {
      for (const [gemType, count] of Object.entries(collectedGems)) {
        if (count > 0 && this.pulseCounter(gemType)) {
          pulsed.push(gemType);
        }
      }
    }

    return pulsed;
  }

  /**
   * Adds the 'hud-pulse' class to the specific gem counter DOM element,
   * removing it automatically after the animation sequence completes.
   * @param {string} gemType
   * @returns {boolean} True if class was added to element
   */
  pulseCounter(gemType) {
    const element = this.getElement(gemType);
    if (!element || !element.classList) return false;

    // Clear any existing active timeout for this gemType to avoid premature removal
    if (this.activeTimeouts.has(gemType)) {
      clearTimeout(this.activeTimeouts.get(gemType));
      this.activeTimeouts.delete(gemType);
    }

    // Reset class for re-triggering animation sequence
    element.classList.remove('hud-pulse');
    if (typeof element.offsetWidth === 'number') {
      void element.offsetWidth; // Force reflow
    }
    element.classList.add('hud-pulse');

    const cleanup = () => {
      element.classList.remove('hud-pulse');
      if (typeof element.removeEventListener === 'function' && this.listeners.has(gemType)) {
        element.removeEventListener('animationend', this.listeners.get(gemType));
        this.listeners.delete(gemType);
      }
      if (this.activeTimeouts.has(gemType)) {
        clearTimeout(this.activeTimeouts.get(gemType));
        this.activeTimeouts.delete(gemType);
      }
    };

    // Listen for animation completion
    if (typeof element.addEventListener === 'function') {
      if (this.listeners.has(gemType)) {
        element.removeEventListener('animationend', this.listeners.get(gemType));
      }
      this.listeners.set(gemType, cleanup);
      element.addEventListener('animationend', cleanup, { once: true });
    }

    // Safety fallback timeout (450ms matching 400ms css duration)
    const timeoutId = setTimeout(cleanup, 450);
    this.activeTimeouts.set(gemType, timeoutId);

    return true;
  }

  /**
   * Cleanup registered listeners and active timeouts
   */
  destroy() {
    for (const [gemType, timeoutId] of this.activeTimeouts.entries()) {
      clearTimeout(timeoutId);
    }
    this.activeTimeouts.clear();

    for (const [gemType, listener] of this.listeners.entries()) {
      const el = this.elements.get(gemType);
      if (el && typeof el.removeEventListener === 'function') {
        el.removeEventListener('animationend', listener);
      }
    }
    this.listeners.clear();
    this.elements.clear();
  }
}
