/**
 * JWT Configuration
 */

const config = {
  // JWT Secret Keys
  accessTokenSecret: process.env.JWT_SECRET,
  refreshTokenSecret: process.env.JWT_REFRESH_SECRET,
  
  // Token Expiration Times
  accessTokenExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  refreshTokenExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // Token Issuer and Audience
  issuer: 'store-rating-app',
  audience: 'store-rating-users',
  
  // Algorithm
  algorithm: 'HS256',
  
  // Token validation options
  clockTolerance: 30, // 30 seconds clock tolerance
  
  // Refresh token rotation
  rotateRefreshTokens: true,
  
  // Maximum number of refresh tokens per user
  maxRefreshTokensPerUser: 5
};

// Validate required configuration
const validateConfig = () => {
  const requiredFields = ['accessTokenSecret', 'refreshTokenSecret'];
  const missingFields = requiredFields.filter(field => !config[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required JWT configuration: ${missingFields.join(', ')}`);
  }
  
  if (config.accessTokenSecret === config.refreshTokenSecret) {
    throw new Error('Access token secret and refresh token secret must be different');
  }
  
  if (config.accessTokenSecret.length < 32) {
    console.warn('JWT access token secret should be at least 32 characters long for security');
  }
  
  if (config.refreshTokenSecret.length < 32) {
    console.warn('JWT refresh token secret should be at least 32 characters long for security');
  }
};

// Validate configuration on module load
try {
  validateConfig();
} catch (error) {
  console.error('JWT Configuration Error:', error.message);
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
}

module.exports = config;