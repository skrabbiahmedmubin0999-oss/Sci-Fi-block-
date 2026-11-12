/**
 * Sci-Fi Block Puzzle - Focused Unit Tests for GemTracker Logic Module
 */

import assert from 'node:assert/strict';
import { GemTracker } from '../src/game/GemTracker.js';
import { GEM_TYPES } from '../src/renderers/GemRenderer.js';

console.log('--- Starting GemTracker Module Tests ---');

// Mock DOM Element helper
function createMockElement(gemType = null) {
  const listeners = {};
  const classListSet = new Set();

  return {
    getAttribute: (attr) => (attr === 'data-gem-counter' || attr === 'data-gem-type' ? gemType : null),
    classList: {
      add: (cls) => classListSet.add(cls),
      remove: (cls) => classListSet.delete(cls),
      contains: (cls) => classListSet.has(cls)
    },
    offsetWidth: 100,
    addEventListener: (event, fn) => {
      listeners[event] = fn;
    },
    removeEventListener: (event, fn) => {
      if (listeners[event] === fn) delete listeners[event];
    },
    triggerAnimationEnd: () => {
      if (listeners['animationend']) {
        const fn = listeners['animationend'];
        delete listeners['animationend'];
        fn();
      }
    }
  };
}

// Test 1: Element registration and lookup
{
  const mockBlueEl = createMockElement(GEM_TYPES.BLUE_DIAMOND);
  const tracker = new GemTracker(null, {
    [GEM_TYPES.BLUE_DIAMOND]: mockBlueEl
  });

  assert.equal(tracker.getElement(GEM_TYPES.BLUE_DIAMOND), mockBlueEl);
  console.log('✓ Test 1: Element registration and lookup passed');
}

// Test 2: Gem collection tracking adds hud-pulse class
{
  const mockBlueEl = createMockElement(GEM_TYPES.BLUE_DIAMOND);
  const mockRedEl = createMockElement(GEM_TYPES.RED_TRIANGLE);

  const tracker = new GemTracker();
  tracker.registerElement(GEM_TYPES.BLUE_DIAMOND, mockBlueEl);
  tracker.registerElement(GEM_TYPES.RED_TRIANGLE, mockRedEl);

  const pulsed = tracker.trackCollection({
    [GEM_TYPES.BLUE_DIAMOND]: 2,
    [GEM_TYPES.RED_TRIANGLE]: 0 // 0 count should not pulse
  });

  assert.deepEqual(pulsed, [GEM_TYPES.BLUE_DIAMOND]);
  assert.equal(mockBlueEl.classList.contains('hud-pulse'), true, 'Blue gem element must have hud-pulse class');
  assert.equal(mockRedEl.classList.contains('hud-pulse'), false, 'Red gem element with 0 count must not have hud-pulse class');

  console.log('✓ Test 2: Gem collection tracking adds hud-pulse class passed');
}

// Test 3: Automatic removal of hud-pulse class on animation completion
{
  const mockBlueEl = createMockElement(GEM_TYPES.BLUE_DIAMOND);
  const tracker = new GemTracker(null, { [GEM_TYPES.BLUE_DIAMOND]: mockBlueEl });

  tracker.trackCollection({ [GEM_TYPES.BLUE_DIAMOND]: 1 });
  assert.equal(mockBlueEl.classList.contains('hud-pulse'), true);

  // Trigger animationend event
  mockBlueEl.triggerAnimationEnd();
  assert.equal(mockBlueEl.classList.contains('hud-pulse'), false, 'hud-pulse class must be removed after animationend');

  tracker.destroy();
  console.log('✓ Test 3: Automatic removal of hud-pulse class on animation completion passed');
}

// Test 4: Container registration with querySelectorAll mock
{
  const mockBlueEl = createMockElement(GEM_TYPES.BLUE_DIAMOND);
  const mockRedEl = createMockElement(GEM_TYPES.RED_TRIANGLE);

  const mockContainer = {
    querySelectorAll: (selector) => [mockBlueEl, mockRedEl]
  };

  const tracker = new GemTracker(mockContainer);

  assert.equal(tracker.getElement(GEM_TYPES.BLUE_DIAMOND), mockBlueEl);
  assert.equal(tracker.getElement(GEM_TYPES.RED_TRIANGLE), mockRedEl);

  console.log('✓ Test 4: Container registration passed');
}

// Test 5: Handling invalid or empty inputs safely
{
  const tracker = new GemTracker();
  assert.deepEqual(tracker.trackCollection(null), []);
  assert.deepEqual(tracker.trackCollection(undefined), []);
  assert.deepEqual(tracker.trackCollection({}), []);
  assert.equal(tracker.pulseCounter('nonExistentGem'), false);

  console.log('✓ Test 5: Handling invalid or empty inputs safely passed');
}

console.log('--- ALL GEM TRACKER TESTS PASSED SUCCESSFULLY ---');
