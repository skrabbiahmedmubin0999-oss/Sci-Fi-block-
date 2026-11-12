/**
 * Sci-Fi Block Puzzle - Focused Unit Tests for ComboTracker Module
 */

import assert from 'node:assert/strict';
import { ComboTracker } from '../src/game/ComboTracker.js';

console.log('--- Starting ComboTracker Module Tests ---');

// Test 1: Initial state
{
  const tracker = new ComboTracker();
  assert.equal(tracker.getCombo(), 0);
  assert.equal(tracker.getMultiplier(), 1);
  console.log('✓ Test 1: Initial combo state passed');
}

// Test 2: Single line clear on turn 1
{
  const tracker = new ComboTracker();
  const res = tracker.registerClear(1);

  assert.equal(res.combo, 1);
  assert.equal(res.multiplier, 1);
  assert.equal(res.bonusScore, 100);
  assert.equal(res.isMultiplierBonus, false);
  console.log('✓ Test 2: Single line clear on turn 1 passed');
}

// Test 3: Successive line clears trigger multiplier bonus
{
  const tracker = new ComboTracker();
  const centerPos = { x: 200, y: 200 };

  // Turn 1: 1 line clear -> combo 1
  tracker.registerClear(1, centerPos);

  // Turn 2: 1 line clear -> combo 2 (multiplier 2x)
  const res2 = tracker.registerClear(1, centerPos);

  assert.equal(res2.combo, 2);
  assert.equal(res2.multiplier, 2);
  assert.equal(res2.bonusScore, 200);
  assert.equal(res2.isMultiplierBonus, true);
  assert.equal(res2.label, 'COMBO x2!');
  assert.equal(tracker.floatingTexts.length, 1);
  assert.equal(tracker.floatingTexts[0].text, 'COMBO x2!');

  // Turn 3: 1 line clear -> combo 3 (multiplier 3x)
  const res3 = tracker.registerClear(1, centerPos);
  assert.equal(res3.combo, 3);
  assert.equal(res3.multiplier, 3);
  assert.equal(res3.bonusScore, 300);
  assert.equal(res3.isMultiplierBonus, true);
  assert.equal(res3.label, 'COMBO x3!');
  assert.equal(tracker.floatingTexts.length, 2);

  console.log('✓ Test 3: Successive line clears trigger multiplier bonus passed');
}

// Test 4: Placement with zero lines cleared resets combo count
{
  const tracker = new ComboTracker();
  tracker.registerClear(1);
  tracker.registerClear(1);
  assert.equal(tracker.getCombo(), 2);

  // Placement with 0 lines cleared
  const resReset = tracker.registerClear(0);
  assert.equal(resReset.combo, 0);
  assert.equal(resReset.multiplier, 1);
  assert.equal(tracker.getCombo(), 0);

  console.log('✓ Test 4: Zero lines cleared resets combo count passed');
}

// Test 5: Multi-line clear multiplier bonus
{
  const tracker = new ComboTracker();
  const resMulti = tracker.registerClear(2, { x: 150, y: 150 });

  assert.equal(resMulti.combo, 1);
  assert.equal(resMulti.isMultiplierBonus, true);
  assert.equal(resMulti.label, 'MULTI CLEAR 2L!');
  assert.equal(tracker.floatingTexts.length, 1);

  console.log('✓ Test 5: Multi-line clear multiplier bonus passed');
}

// Test 6: Floating text position update and lifetime decay
{
  const tracker = new ComboTracker();
  tracker.addFloatingText('TEST FLOAT', 100, 200, { duration: 1.0 });

  assert.equal(tracker.floatingTexts[0].y, 200);
  assert.equal(tracker.floatingTexts[0].alpha, 1.0);

  // Advance time by 0.5s
  tracker.update(0.5);
  assert.equal(tracker.floatingTexts.length, 1);
  assert.ok(tracker.floatingTexts[0].y < 200, 'Floating text must move upward');

  // Advance time past 1.0s
  tracker.update(0.6);
  assert.equal(tracker.floatingTexts.length, 0, 'Floating text must auto-remove after lifetime expires');

  console.log('✓ Test 6: Floating text position update and lifetime decay passed');
}

console.log('--- ALL COMBO TRACKER TESTS PASSED SUCCESSFULLY ---');
