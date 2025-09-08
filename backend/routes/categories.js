const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { securityMiddleware } = require('../middleware/security');
const { getAllCategories, getCategoryById } = require('../controllers/categoryController');

// Apply security middleware to all routes
router.use(securityMiddleware);

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/', getAllCategories);

/**
 * @route   GET /api/categories/:id
 * @desc    Get category by ID
 * @access  Public
 */
router.get('/:id', 
  validate(schemas.id, 'params'), 
  getCategoryById
);

/**
 * @route   POST /api/categories
 * @desc    Create new category
 * @access  Private (Admin only)
 */
router.post('/', 
  authenticate,
  authorize(['admin']),
  validate(schemas.category.create), 
  (req, res) => {
    // TODO: Implement create category controller
    res.json({
      success: true,
      message: 'Create category endpoint - to be implemented',
      body: req.body,
      user: req.user
    });
  }
);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category
 * @access  Private (Admin only)
 */
router.put('/:id', 
  authenticate,
  authorize(['admin']),
  validate(schemas.id, 'params'),
  validate(schemas.category.create), // Same validation as create
  (req, res) => {
    // TODO: Implement update category controller
    res.json({
      success: true,
      message: 'Update category endpoint - to be implemented',
      params: req.params,
      body: req.body,
      user: req.user
    });
  }
);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category
 * @access  Private (Admin only)
 */
router.delete('/:id', 
  authenticate,
  authorize(['admin']),
  validate(schemas.id, 'params'), 
  (req, res) => {
    // TODO: Implement delete category controller
    res.json({
      success: true,
      message: 'Delete category endpoint - to be implemented',
      params: req.params,
      user: req.user
    });
  }
);

module.exports = router;