const xss = require('xss');
const validator = require('validator');

/**
 * XSS Protection middleware
 * Sanitizes request body, query, and params to prevent XSS attacks
 */
const xssProtection = (req, res, next) => {
  // XSS options - very restrictive for security
  const xssOptions = {
    whiteList: {}, // No HTML tags allowed
    stripIgnoreTag: true,
    stripIgnoreTagBody: ['script', 'style'],
    allowCommentTag: false,
    css: false
  };

  /**
   * Recursively sanitize object properties
   */
  const sanitizeObject = (obj) => {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'string') {
      return xss(obj, xssOptions);
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitizeObject);
    }
    
    if (typeof obj === 'object') {
      const sanitized = {};
      for (const [key, value] of Object.entries(obj)) {
        // Sanitize both key and value
        const sanitizedKey = xss(key, xssOptions);
        sanitized[sanitizedKey] = sanitizeObject(value);
      }
      return sanitized;
    }
    
    return obj;
  };

  try {
    // Sanitize request body
    if (req.body && typeof req.body === 'object') {
      req.body = sanitizeObject(req.body);
    }

    // Sanitize query parameters
    if (req.query && typeof req.query === 'object') {
      req.query = sanitizeObject(req.query);
    }

    // Sanitize URL parameters
    if (req.params && typeof req.params === 'object') {
      req.params = sanitizeObject(req.params);
    }

    next();
  } catch (error) {
    console.error('XSS Protection Error:', error);
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Invalid input detected'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * SQL Injection Protection middleware
 * Additional layer of protection against SQL injection attempts
 */
const sqlInjectionProtection = (req, res, next) => {
  // Common SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/i,
    /(--|\/\*|\*\/)/,
    /(\bOR\b|\bAND\b).*[=<>]/i,
    /['"`;]/,
    /\b(EXEC|EXECUTE)\b/i,
    /\b(CAST|CONVERT)\b/i,
    /\b(WAITFOR|DELAY)\b/i
  ];

  /**
   * Check string for SQL injection patterns
   */
  const containsSqlInjection = (str) => {
    if (typeof str !== 'string') return false;
    
    return sqlPatterns.some(pattern => pattern.test(str));
  };

  /**
   * Recursively check object for SQL injection
   */
  const checkObject = (obj, path = '') => {
    if (obj === null || obj === undefined) return false;
    
    if (typeof obj === 'string') {
      if (containsSqlInjection(obj)) {
        console.warn(`Potential SQL injection detected at ${path}:`, obj);
        return true;
      }
      return false;
    }
    
    if (Array.isArray(obj)) {
      return obj.some((item, index) => checkObject(item, `${path}[${index}]`));
    }
    
    if (typeof obj === 'object') {
      return Object.entries(obj).some(([key, value]) => {
        if (containsSqlInjection(key)) {
          console.warn(`Potential SQL injection detected in key ${path}.${key}:`, key);
          return true;
        }
        return checkObject(value, path ? `${path}.${key}` : key);
      });
    }
    
    return false;
  };

  try {
    // Check request body
    if (req.body && checkObject(req.body, 'body')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Invalid input detected'
        },
        timestamp: new Date().toISOString()
      });
    }

    // Check query parameters
    if (req.query && checkObject(req.query, 'query')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Invalid input detected'
        },
        timestamp: new Date().toISOString()
      });
    }

    // Check URL parameters
    if (req.params && checkObject(req.params, 'params')) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_INPUT',
          message: 'Invalid input detected'
        },
        timestamp: new Date().toISOString()
      });
    }

    next();
  } catch (error) {
    console.error('SQL Injection Protection Error:', error);
    return res.status(400).json({
      success: false,
      error: {
        code: 'INVALID_INPUT',
        message: 'Invalid input detected'
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Input size limiting middleware
 * Prevents large payloads that could cause DoS
 */
const inputSizeLimiter = (options = {}) => {
  const {
    maxStringLength = 10000,
    maxArrayLength = 1000,
    maxObjectDepth = 10
  } = options;

  const checkSize = (obj, depth = 0) => {
    if (depth > maxObjectDepth) {
      throw new Error('Object depth limit exceeded');
    }

    if (typeof obj === 'string' && obj.length > maxStringLength) {
      throw new Error('String length limit exceeded');
    }

    if (Array.isArray(obj)) {
      if (obj.length > maxArrayLength) {
        throw new Error('Array length limit exceeded');
      }
      obj.forEach(item => checkSize(item, depth + 1));
    }

    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      Object.values(obj).forEach(value => checkSize(value, depth + 1));
    }
  };

  return (req, res, next) => {
    try {
      if (req.body) checkSize(req.body);
      if (req.query) checkSize(req.query);
      if (req.params) checkSize(req.params);
      
      next();
    } catch (error) {
      return res.status(413).json({
        success: false,
        error: {
          code: 'PAYLOAD_TOO_LARGE',
          message: 'Request payload exceeds size limits'
        },
        timestamp: new Date().toISOString()
      });
    }
  };
};

/**
 * Content type validation middleware
 * Ensures only expected content types are processed
 */
const contentTypeValidation = (allowedTypes = ['application/json']) => {
  return (req, res, next) => {
    // Skip validation for GET, HEAD, DELETE requests and requests without body
    if (req.method === 'GET' || req.method === 'HEAD' || req.method === 'DELETE' || !req.body) {
      return next();
    }

    const contentType = req.get('Content-Type');
    
    if (!contentType) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_CONTENT_TYPE',
          message: 'Content-Type header is required'
        },
        timestamp: new Date().toISOString()
      });
    }

    const isAllowed = allowedTypes.some(type => 
      contentType.toLowerCase().includes(type.toLowerCase())
    );

    if (!isAllowed) {
      return res.status(415).json({
        success: false,
        error: {
          code: 'UNSUPPORTED_MEDIA_TYPE',
          message: `Content-Type ${contentType} is not supported`
        },
        timestamp: new Date().toISOString()
      });
    }

    next();
  };
};

/**
 * Combined security middleware
 * Applies all security measures in the correct order
 */
const securityMiddleware = [
  contentTypeValidation(),
  inputSizeLimiter(),
  xssProtection,
  sqlInjectionProtection
];

module.exports = {
  xssProtection,
  sqlInjectionProtection,
  inputSizeLimiter,
  contentTypeValidation,
  securityMiddleware
};