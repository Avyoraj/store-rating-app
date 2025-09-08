// Middleware exports for easy importing
const errorHandler = require('./errorHandler');
const { validate, schemas } = require('./validation');
const { 
  generalLimiter, 
  authLimiter, 
  reviewLimiter, 
  storeLimiter 
} = require('./rateLimiter');
const {
  authenticate,
  optionalAuth,
  authorize,
  authorizeOwnership,
  requireEmailVerification,
  requirePermission,
  authenticateApiKey
} = require('./auth');

module.exports = {
  errorHandler,
  validate,
  schemas,
  rateLimiters: {
    general: generalLimiter,
    auth: authLimiter,
    review: reviewLimiter,
    store: storeLimiter
  },
  auth: {
    authenticate,
    optionalAuth,
    authorize,
    authorizeOwnership,
    requireEmailVerification,
    requirePermission,
    authenticateApiKey
  }
};