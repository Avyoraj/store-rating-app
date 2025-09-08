/**
 * Simple in-memory refresh token store
 * In production, this should be replaced with Redis or database storage
 */
class RefreshTokenStore {
  constructor() {
    this.tokens = new Map(); // userId -> Set of refresh tokens
    this.tokenToUser = new Map(); // token -> userId
    
    // Clean up expired tokens every hour
    setInterval(() => {
      this.cleanupExpiredTokens();
    }, 60 * 60 * 1000);
  }

  /**
   * Store a refresh token for a user
   * @param {number} userId - User ID
   * @param {string} token - Refresh token
   * @param {Date} expiresAt - Token expiration date
   */
  storeToken(userId, token, expiresAt) {
    if (!this.tokens.has(userId)) {
      this.tokens.set(userId, new Map());
    }
    
    this.tokens.get(userId).set(token, expiresAt);
    this.tokenToUser.set(token, userId);
  }

  /**
   * Check if a refresh token is valid and not expired
   * @param {string} token - Refresh token
   * @returns {boolean} True if token is valid
   */
  isValidToken(token) {
    const userId = this.tokenToUser.get(token);
    if (!userId) {
      return false;
    }

    const userTokens = this.tokens.get(userId);
    if (!userTokens || !userTokens.has(token)) {
      return false;
    }

    const expiresAt = userTokens.get(token);
    if (new Date() > expiresAt) {
      this.removeToken(token);
      return false;
    }

    return true;
  }

  /**
   * Remove a specific refresh token
   * @param {string} token - Refresh token to remove
   */
  removeToken(token) {
    const userId = this.tokenToUser.get(token);
    if (userId) {
      const userTokens = this.tokens.get(userId);
      if (userTokens) {
        userTokens.delete(token);
        if (userTokens.size === 0) {
          this.tokens.delete(userId);
        }
      }
    }
    this.tokenToUser.delete(token);
  }

  /**
   * Remove all refresh tokens for a user
   * @param {number} userId - User ID
   */
  removeAllUserTokens(userId) {
    const userTokens = this.tokens.get(userId);
    if (userTokens) {
      for (const token of userTokens.keys()) {
        this.tokenToUser.delete(token);
      }
      this.tokens.delete(userId);
    }
  }

  /**
   * Get user ID from refresh token
   * @param {string} token - Refresh token
   * @returns {number|null} User ID or null if token not found
   */
  getUserIdFromToken(token) {
    return this.tokenToUser.get(token) || null;
  }

  /**
   * Get all active tokens for a user
   * @param {number} userId - User ID
   * @returns {Array<string>} Array of active tokens
   */
  getUserTokens(userId) {
    const userTokens = this.tokens.get(userId);
    return userTokens ? Array.from(userTokens.keys()) : [];
  }

  /**
   * Clean up expired tokens
   */
  cleanupExpiredTokens() {
    const now = new Date();
    const expiredTokens = [];

    for (const [userId, userTokens] of this.tokens.entries()) {
      for (const [token, expiresAt] of userTokens.entries()) {
        if (now > expiresAt) {
          expiredTokens.push(token);
        }
      }
    }

    expiredTokens.forEach(token => this.removeToken(token));
    
    if (expiredTokens.length > 0) {
      console.log(`Cleaned up ${expiredTokens.length} expired refresh tokens`);
    }
  }

  /**
   * Get statistics about stored tokens
   * @returns {Object} Token statistics
   */
  getStats() {
    let totalTokens = 0;
    for (const userTokens of this.tokens.values()) {
      totalTokens += userTokens.size;
    }

    return {
      totalUsers: this.tokens.size,
      totalTokens,
      averageTokensPerUser: this.tokens.size > 0 ? totalTokens / this.tokens.size : 0
    };
  }
}

module.exports = new RefreshTokenStore();