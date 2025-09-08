const Joi = require('joi');

/**
 * Simple validation middleware
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true
    });

    if (error) {
      const details = {};
      error.details.forEach(detail => {
        const key = detail.path.join('.');
        details[key] = detail.message;
      });

      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details
        }
      });
    }

    req[property] = value;
    next();
  };
};

/**
 * Simple validation schemas for store rating app
 */
const schemas = {
  // ID parameter
  id: Joi.object({
    id: Joi.number().integer().positive().required()
  }),

  // User schemas
  user: {
    register: Joi.object({
      username: Joi.string().min(3).max(20).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).max(16)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required(),
      address: Joi.string().max(400).required(),
      role: Joi.string().valid('user', 'owner', 'admin').default('user')
    }),

    login: Joi.object({
      email: Joi.string().email().required(),
      password: Joi.string().required()
    }),

    updateProfile: Joi.object({
      username: Joi.string().min(3).max(20).optional(),
      email: Joi.string().email().optional(),
      address: Joi.string().max(400).optional()
    }),

    updatePassword: Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: Joi.string().min(8).max(16)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required()
    })
  },

  // Review schemas
  review: {
    create: Joi.object({
      rating: Joi.number().integer().min(1).max(5).required(),
      comment: Joi.string().max(500).optional()
    }),

    update: Joi.object({
      rating: Joi.number().integer().min(1).max(5).optional(),
      comment: Joi.string().max(500).optional()
    })
  },

  // Admin schemas
  admin: {
    createUser: Joi.object({
      name: Joi.string().min(20).max(60).required(),
      email: Joi.string().email().required(),
      password: Joi.string().min(8).max(16)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
        .required(),
      address: Joi.string().max(400).required(),
      role: Joi.string().valid('user', 'owner', 'admin').default('user')
    }),

    createStore: Joi.object({
      name: Joi.string().min(1).max(100).required(),
      email: Joi.string().email().required(),
      address: Joi.string().max(400).required(),
      city: Joi.string().min(1).max(50).required(),
      state: Joi.string().min(1).max(50).required(),
      zip_code: Joi.string().min(1).max(10).required(),
      ownerName: Joi.string().min(20).max(60).required(),
      ownerPassword: Joi.string().min(8).max(16)
        .pattern(/^(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,16}$/)
        .required()
    }),

    userStatus: Joi.object({
      isActive: Joi.boolean().required(),
      reason: Joi.string().max(255).optional()
    })
  },

  // Category schemas
  category: {
    create: Joi.object({
      name: Joi.string().min(2).max(50).required(),
      description: Joi.string().max(200).optional()
    }),

    update: Joi.object({
      name: Joi.string().min(2).max(50).optional(),
      description: Joi.string().max(200).optional()
    })
  },

  // Store schemas  
  store: {
    create: Joi.object({
      name: Joi.string().min(2).max(100).required(),
      address: Joi.string().min(5).max(400).required(),
      category_id: Joi.number().integer().positive().required(),
      description: Joi.string().max(500).optional()
    }),

    update: Joi.object({
      name: Joi.string().min(2).max(100).optional(),
      email: Joi.string().email().optional(),
      address: Joi.string().min(5).max(400).optional(),
      city: Joi.string().min(2).max(100).optional(),
      state: Joi.string().min(2).max(100).optional(),
      zip_code: Joi.string().min(5).max(10).optional(),
      phone: Joi.string().min(10).max(15).optional(),
      website: Joi.string().uri().optional().allow(''),
      category_id: Joi.number().integer().positive().optional(),
      description: Joi.string().max(500).optional().allow('')
    }),

    search: Joi.object({
      name: Joi.string().max(100).optional(),
      address: Joi.string().max(400).optional(),
      category_id: Joi.number().integer().positive().optional(),
      page: Joi.number().integer().min(1).default(1),
      limit: Joi.number().integer().min(1).max(100).default(10)
    })
  },

  // Token schemas
  token: {
    refresh: Joi.object({
      refreshToken: Joi.string().required()
    }),

    logout: Joi.object({
      refreshToken: Joi.string().optional()
    })
  }
};

module.exports = {
  validate,
  schemas
};