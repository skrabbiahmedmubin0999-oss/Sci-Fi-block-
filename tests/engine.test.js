/**
 * Sci-Fi Block Puzzle - Focused Unit Tests for Engine.js
 */

import assert from 'node:assert/strict';
import { Engine } from '../src/game/Engine.js';
import {
  GRID_ROWS,
  GRID_COLUMNS,
  MAX_DEVICE_PIXEL_RATIO,
  TARGET_FPS
} from '../src/config/constants.js';

console.log('--- Starting Engine.js Tests ---');

// Mock DOM elements for headless Node.js test environment
function createMockCanvas() {
  return {
    width: 0,
    height: 0,
    style: {},
    getContext: (type) => {
      if (type === '2d') {
        return {
          setTransform: () => {},
          clearRect: () => {},
          fillRect: () => {},
          strokeRect: () => {},
          beginPath: () => {},
          closePath: () => {},
          stroke: () => {},
          fill: () => {}
        };
      }
      return null;
    }
  };
}

function createMockContainer(width = 400, height = 700) {
  return {
    getBoundingClientRect: () => ({
      width,
      height,
      top: 0,
      left: 0,
      right: width,
      bottom: height
    })
  };
}

// Test 1: Parameter validation
{
  assert.throws(() => new Engine(null, createMockContainer()), Error);
  assert.throws(() => new Engine(createMockCanvas(), null), Error);
  console.log('✓ Test 1: Parameter null validation passed');
}

// Test 2: Target FPS and Grid Dimensions Initialization
{
  // Polyfill global window & requestAnimationFrame for headless node test
  global.window = {
    devicePixelRatio: 2,
    addEventListener: () => {},
    removeEventListener: () => {}
  };
  global.requestAnimationFrame = (fn) => setTimeout(() => fn(performance.now()), 16);
  global.cancelAnimationFrame = (id) => clearTimeout(id);

  let resizeMetrics = null;
  const canvas = createMockCanvas();
  const container = createMockContainer(400, 700);

  const engine = new Engine(canvas, container, {
    onResize: (metrics) => {
      resizeMetrics = metrics;
    }
  });

  assert.equal(engine.targetFps, TARGET_FPS, 'Engine targetFps must equal TARGET_FPS constant (60)');
  assert.equal(engine.gridRows, GRID_ROWS, 'Engine gridRows must equal GRID_ROWS constant (8)');
  assert.equal(engine.gridColumns, GRID_COLUMNS, 'Engine gridColumns must equal GRID_COLUMNS constant (8)');
  assert.equal(engine.maxDpr, MAX_DEVICE_PIXEL_RATIO, 'Engine maxDpr must equal MAX_DEVICE_PIXEL_RATIO (2)');

  assert.ok(resizeMetrics, 'onResize callback was triggered');
  assert.equal(resizeMetrics.gridRows, 8);
  assert.equal(resizeMetrics.gridColumns, 8);
  assert.ok(resizeMetrics.cellSize > 0, 'Cell size must be calculated from grid config');
  assert.equal(resizeMetrics.boardWidth, resizeMetrics.cellSize * 8);
  assert.equal(resizeMetrics.boardHeight, resizeMetrics.cellSize * 8);

  console.log('✓ Test 2: TARGET_FPS and grid-based context initialization passed');
}

// Test 3: Loop Lifecycle Controls (start, pause, resume, stop, destroy)
{
  const canvas = createMockCanvas();
  const container = createMockContainer();
  let updateCalls = 0;

  const engine = new Engine(canvas, container, {
    onUpdate: (dt) => {
      updateCalls++;
      assert.ok(dt >= 0 && dt <= 0.05, 'Delta time must be clamped to safe threshold');
    }
  });

  assert.equal(engine.isRunning, false);
  engine.start();
  assert.equal(engine.isRunning, true);
  assert.equal(engine.isPaused, false);

  engine.pause();
  assert.equal(engine.isPaused, true);

  engine.resume();
  assert.equal(engine.isPaused, false);

  engine.stop();
  assert.equal(engine.isRunning, false);

  engine.destroy();
  console.log('✓ Test 3: Loop lifecycle controls (start/pause/resume/stop/destroy) passed');
}

console.log('--- ALL ENGINE.JS TESTS PASSED SUCCESSFULLY ---');
