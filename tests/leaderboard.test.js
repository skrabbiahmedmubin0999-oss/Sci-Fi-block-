/**
 * Sci-Fi Block Puzzle - Focused Unit Tests for Leaderboard & Session Guard System
 */

import assert from 'node:assert/strict';
import { Leaderboard } from '../src/game/Leaderboard.js';

console.log('--- Starting Leaderboard & Session Guard Tests ---');

// Mock localStorage engine
function createMockStorage() {
  const store = new Map();
  return {
    getItem: (key) => store.get(key) || null,
    setItem: (key, val) => store.set(key, String(val)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear()
  };
}

// Test 1: Initial empty state
{
  const mockStore = createMockStorage();
  const board = new Leaderboard('test_key', 5, mockStore);

  assert.deepEqual(board.getScores(), []);
  assert.equal(board.isHighScore(100), true, 'Any positive score qualifies when list is empty');
  console.log('✓ Test 1: Initial empty state passed');
}

// Test 2: Adding scores & maintaining descending sort
{
  const mockStore = createMockStorage();
  const board = new Leaderboard('test_key', 5, mockStore);

  const res1 = board.addScore(300);
  assert.equal(res1.isHighScore, true);
  assert.equal(res1.rank, 1);

  const res2 = board.addScore(500);
  assert.equal(res2.isHighScore, true);
  assert.equal(res2.rank, 1);

  const res3 = board.addScore(200);
  assert.equal(res3.isHighScore, true);
  assert.equal(res3.rank, 3);

  const scores = board.getScores();
  assert.equal(scores.length, 3);
  assert.equal(scores[0].score, 500);
  assert.equal(scores[1].score, 300);
  assert.equal(scores[2].score, 200);

  console.log('✓ Test 2: Adding scores and descending sort passed');
}

// Test 3: Trimming to top 5 max entries & isHighScore threshold
{
  const mockStore = createMockStorage();
  const board = new Leaderboard('test_key', 5, mockStore);

  board.addScore(100);
  board.addScore(200);
  board.addScore(300);
  board.addScore(400);
  board.addScore(500);
  board.addScore(600); // 6th entry

  const scores = board.getScores();
  assert.equal(scores.length, 5, 'Must cap list at top 5 entries');
  assert.equal(scores[0].score, 600);
  assert.equal(scores[4].score, 200);

  // Score of 150 should NOT qualify as high score now (lowest is 200)
  assert.equal(board.isHighScore(150), false);
  // Score of 250 SHOULD qualify
  assert.equal(board.isHighScore(250), true);

  console.log('✓ Test 3: Trimming to top 5 max entries passed');
}

// Test 4: Defensive handling of corrupted data
{
  const mockStore = createMockStorage();
  mockStore.setItem('test_key', 'invalid json string');

  const board = new Leaderboard('test_key', 5, mockStore);
  assert.deepEqual(board.getScores(), [], 'Corrupted JSON must safely return empty array');

  // Adding valid score recovers safely
  board.addScore(450);
  assert.equal(board.getScores()[0].score, 450);

  console.log('✓ Test 4: Defensive handling of corrupted data passed');
}

// Test 5: Storage unavailable fallback (in-memory mode)
{
  const board = new Leaderboard('test_fallback', 5, null);
  board.addScore(750);
  assert.equal(board.getScores().length, 1);
  assert.equal(board.getScores()[0].score, 750);
  console.log('✓ Test 5: Storage unavailable fallback passed');
}

// Test 6: HTML string escaping helper for untrusted data
{
  const escaped = Leaderboard.escapeHTML('<script>alert("xss")</script>');
  assert.equal(escaped.includes('<script>'), false);
  assert.equal(escaped.includes('&lt;script&gt;'), true);
  console.log('✓ Test 6: HTML string escaping passed');
}

// Test 7: Session score submission guard pattern logic
{
  const mockStore = createMockStorage();
  const leaderboard = new Leaderboard('test_session_guard', 5, mockStore);

  let hasSubmittedSessionScore = false;
  let lastSessionScoreResult = null;
  const currentScore = 800;

  function handleGameOver() {
    if (!hasSubmittedSessionScore) {
      hasSubmittedSessionScore = true;
      lastSessionScoreResult = leaderboard.addScore(currentScore);
    }
    return lastSessionScoreResult;
  }

  // 1st Game Over call in session
  const res1 = handleGameOver();
  assert.equal(leaderboard.getScores().length, 1);

  // 2nd Game Over call in SAME session (should NOT re-add score)
  const res2 = handleGameOver();
  assert.equal(leaderboard.getScores().length, 1, 'Repeated call must not re-submit score');
  assert.strictEqual(res1, res2);

  // Reset for NEW game session
  hasSubmittedSessionScore = false;
  lastSessionScoreResult = null;

  // New game session submits new score
  const newScore = 950;
  function handleGameOver2() {
    if (!hasSubmittedSessionScore) {
      hasSubmittedSessionScore = true;
      lastSessionScoreResult = leaderboard.addScore(newScore);
    }
    return lastSessionScoreResult;
  }

  handleGameOver2();
  assert.equal(leaderboard.getScores().length, 2, 'New game session must submit its score');
  assert.equal(leaderboard.getScores()[0].score, 950);

  console.log('✓ Test 7: Session score submission guard logic passed');
}

console.log('--- ALL LEADERBOARD TESTS PASSED SUCCESSFULLY ---');
