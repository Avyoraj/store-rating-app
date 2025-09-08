/**
 * Additional authentication helper utilities
 */

const crypto = require('crypto');
const { pool } = require('../config/database');

class AuthHelpers {
  /**
   * Generate a secure random token for various purposes
   * @param {number} length - Token length in bytes (default: 32)
   * @returns {string} Hex encoded random token
   */
  generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Generate email verification token
   * @param {number} userId - User ID
   * @returns {Promise<string>} Verification token
   */
  async generateEmailVerificationToken(userId) {
    const token = this.generateSecureToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

    // Store token in database (you would need to create a verification_tokens table)
    // For now, we'll just return the token
    return token;
  }

  /**
   * Generate password reset token
   * @param {number} userId - User ID
   * @returns {Promise<string>} Reset token
   */
  async generatePasswordResetToken(userId) {
    const token = this.generateSecureToken();
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiry

    // Store token in database (you would need to create a password_reset_tokens table)
    // For now, we'll just return the token
    return token;
  }

  /**
   * Check if user account is locked due to failed login attempts
   * @param {string} identifier - Username or email
   * @returns {Promise<Object>} Lock status and remaining time
   */
  async checkAccountLockStatus(identifier) {
    // This would check a login_attempts table
    // For now, return unlocked status
    return {
      isLocked: false,
      remainingTime: 0,
      attempts: 0
    };
  }

  /**
   * Record failed login attempt
   * @param {string} identifier - Username or email
   * @param {string} ipAddress - Client IP address
   * @returns {Promise<Object>} Updated attempt count and lock status
   */
  async recordFailedLoginAttempt(identifier, ipAddress) {
    // This would update a login_attempts table
    // For now, return default values
    return {
      attempts: 1,
      isLocked: false,
      lockUntil: null
    };
  }

  /**
   * Clear failed login attempts after successful login
   * @param {string} identifier - Username or email
   * @returns {Promise<void>}
   */
  async clearFailedLoginAttempts(identifier) {
    // This would clear records from login_attempts table
    // For now, just return
    return;
  }

  /**
   * Log security event
   * @param {number} userId - User ID
   * @param {string} event - Event type
   * @param {string} ipAddress - Client IP address
   * @param {string} userAgent - Client user agent
   * @param {Object} metadata - Additional event data
   * @returns {Promise<void>}
   */
  async logSecurityEvent(userId, event, ipAddress, userAgent, metadata = {}) {
    // This would log to a security_events table
    console.log(`Security Event: ${event} for user ${userId} from ${ipAddress}`);
    return;
  }

  /**
   * Validate session and check for suspicious activity
   * @param {number} userId - User ID
   * @param {string} ipAddress - Client IP address
   * @param {string} userAgent - Client user agent
   * @returns {Promise<Object>} Validation result
   */
  async validateSession(userId, ipAddress, userAgent) {
    // This would check for suspicious patterns
    // For now, return valid
    return {
      isValid: true,
      riskScore: 0,
      warnings: []
    };
  }

  /**
   * Check if user has required permissions for a resource
   * @param {Object} user - User object
   * @param {string} resource - Resource identifier
   * @param {string} action - Action to perform
   * @returns {boolean} Permission granted
   */
  hasPermission(user, resource, action) {
    // Basic role-based permission check
    const permissions = {
      admin: ['*'], // Admin can do everything
      owner: ['store:read', 'store:update', 'review:read', 'review:respond'],
      user: ['store:read', 'review:read', 'review:create', 'review:update', 'review:delete']
    };

    const userPermissions = permissions[user.role] || [];
    
    // Check for wildcard permission
    if (userPermissions.includes('*')) {
      return true;
    }

    // Check for specific permission
    const permission = `${resource}:${action}`;
    return userPermissions.includes(permission);
  }

  /**
   * Generate API key for programmatic access
   * @param {number} userId - User ID
   * @param {string} name - API key name
   * @param {Array<string>} scopes - API key scopes
   * @returns {Promise<Object>} API key details
   */
  async generateApiKey(userId, name, scopes = []) {
    const apiKey = 'sk_' + this.generateSecureToken(24);
    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');

    // This would store in an api_keys table
    return {
      id: Date.now(), // Would be actual database ID
      key: apiKey,
      name,
      scopes,
      userId,
      createdAt: new Date(),
      lastUsed: null
    };
  }

  /**
   * Validate API key
   * @param {string} apiKey - API key to validate
   * @returns {Promise<Object|null>} API key details or null if invalid
   */
  async validateApiKey(apiKey) {
    if (!apiKey || !apiKey.startsWith('sk_')) {
      return null;
    }

    const hashedKey = crypto.createHash('sha256').update(apiKey).digest('hex');
    
    // This would query the api_keys table
    // For now, return null (invalid)
    return null;
  }

  /**
   * Check if password has been compromised in known breaches
   * @param {string} password - Password to check
   * @returns {Promise<boolean>} True if compromised
   */
  async isPasswordCompromised(password) {
    // This would check against HaveIBeenPwned API or similar
    // For now, just check against a small list of common passwords
    const commonPasswords = [
      'password', '123456', '123456789', 'qwerty', 'abc123',
      'password123', 'admin', 'letmein', 'welcome', 'monkey',
      '1234567890', 'dragon', 'princess', 'login', 'solo'
    ];

    return commonPasswords.includes(password.toLowerCase());
  }

  /**
   * Generate secure session ID
   * @returns {string} Session ID
   */
  generateSessionId() {
    return this.generateSecureToken(32);
  }

  /**
   * Validate password complexity beyond basic requirements
   * @param {string} password - Password to validate
   * @returns {Object} Detailed validation result
   */
  validatePasswordComplexity(password) {
    const result = {
      score: 0,
      feedback: [],
      isStrong: false
    };

    if (!password) {
      result.feedback.push('Password is required');
      return result;
    }

    // Length scoring
    if (password.length >= 12) result.score += 2;
    else if (password.length >= 8) result.score += 1;
    else result.feedback.push('Password should be at least 8 characters long');

    // Character variety scoring
    if (/[a-z]/.test(password)) result.score += 1;
    else result.feedback.push('Add lowercase letters');

    if (/[A-Z]/.test(password)) result.score += 1;
    else result.feedback.push('Add uppercase letters');

    if (/\d/.test(password)) result.score += 1;
    else result.feedback.push('Add numbers');

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) result.score += 2;
    else result.feedback.push('Add special characters');

    // Pattern checks
    if (!/(.)\1{2,}/.test(password)) result.score += 1;
    else result.feedback.push('Avoid repeating characters');

    if (!/123|abc|qwe|asd|zxc/i.test(password)) result.score += 1;
    else result.feedback.push('Avoid common patterns');

    result.isStrong = result.score >= 6;
    
    return result;
  }
}

module.exports = new AuthHelpers();