/**
 * Sci-Fi Block Puzzle - Local Storage Backed Leaderboard Module
 * Tracks, persists, and ranks top 5 high scores for game sessions.
 */

export class Leaderboard {
  /**
   * @param {string} [storageKey='scifi_block_puzzle_high_scores']
   * @param {number} [maxEntries=5]
   * @param {Storage|null} [storageEngine=null]
   */
  constructor(storageKey = 'scifi_block_puzzle_high_scores', maxEntries = 5, storageEngine = null) {
    this.storageKey = storageKey;
    this.maxEntries = maxEntries;
    this._inMemoryScores = [];

    // Allow custom or mocked storage engine for unit testing / fallback
    if (storageEngine) {
      this.storage = storageEngine;
    } else {
      try {
        if (typeof window !== 'undefined' && window.localStorage) {
          this.storage = window.localStorage;
        } else {
          this.storage = null;
        }
      } catch {
        this.storage = null; // Handles security/sandbox quota exceptions
      }
    }
  }

  /**
   * Utility to safely escape untrusted string values before rendering in HTML templates
   * @param {string} str
   * @returns {string}
   */
  static escapeHTML(str) {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /**
   * Load top high scores from localStorage (or in-memory fallback)
   * @returns {Array<{score: number, date: string, timestamp: number}>}
   */
  getScores() {
    if (!this.storage) {
      return [...this._inMemoryScores];
    }

    try {
      const raw = this.storage.getItem(this.storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];

      // Sanitize and sort descending by score
      const valid = parsed
        .filter(item => item && typeof item === 'object' && typeof item.score === 'number' && Number.isFinite(item.score) && item.score >= 0)
        .map(item => ({
          score: Math.floor(item.score),
          date: typeof item.date === 'string' ? Leaderboard.escapeHTML(item.date) : new Date().toLocaleDateString(),
          timestamp: typeof item.timestamp === 'number' && Number.isFinite(item.timestamp) ? item.timestamp : Date.now()
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, this.maxEntries);

      return valid;
    } catch {
      // Quiet fail-safe for corrupted data
      return [...this._inMemoryScores];
    }
  }

  /**
   * Check if a given score qualifies for the top high scores list
   * @param {number} score
   * @returns {boolean}
   */
  isHighScore(score) {
    if (typeof score !== 'number' || !Number.isFinite(score) || score <= 0) return false;
    const scores = this.getScores();
    if (scores.length < this.maxEntries) return true;
    return score > scores[scores.length - 1].score;
  }

  /**
   * Submit a new score to the leaderboard
   * @param {number} score
   * @returns {{ isHighScore: boolean, rank: number, scores: Array }}
   */
  addScore(score) {
    if (typeof score !== 'number' || !Number.isFinite(score) || score <= 0) {
      return { isHighScore: false, rank: -1, scores: this.getScores() };
    }

    const currentScores = this.getScores();
    const now = new Date();
    const newEntry = {
      score: Math.floor(score),
      date: now.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      timestamp: now.getTime()
    };

    // Combine and sort descending
    const updated = [...currentScores, newEntry]
      .sort((a, b) => b.score - a.score)
      .slice(0, this.maxEntries);

    const rank = updated.findIndex(entry => entry.timestamp === newEntry.timestamp && entry.score === newEntry.score) + 1;
    const isHighScore = rank > 0;

    // Persist
    this._saveScores(updated);

    return {
      isHighScore,
      rank: rank > 0 ? rank : -1,
      scores: updated
    };
  }

  /**
   * Internal helper to save scores to localStorage and in-memory cache
   * @param {Array} scores
   */
  _saveScores(scores) {
    this._inMemoryScores = [...scores];
    if (!this.storage) return;

    try {
      this.storage.setItem(this.storageKey, JSON.stringify(scores));
    } catch {
      // Fail-safe storage write catch
    }
  }

  /**
   * Reset all stored high scores
   */
  clearScores() {
    this._inMemoryScores = [];
    if (!this.storage) return;

    try {
      this.storage.removeItem(this.storageKey);
    } catch {
      // Fail-safe storage remove catch
    }
  }
}
