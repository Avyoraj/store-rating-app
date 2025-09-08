const express = require('express');
const router = express.Router();
const { authenticate, authorize } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { securityMiddleware } = require('../middleware/security');
const AdminController = require('../controllers/adminController');

// Apply security middleware to all routes
router.use(securityMiddleware);

// All admin routes require authentication and admin role
router.use(authenticate);
router.use(authorize(['admin']));

// Dashboard Routes
/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics
 * @access  Private (Admin only)
 */
router.get('/stats', AdminController.getDashboardStats);

/**
 * @route   GET /api/admin/stores
 * @desc    Get all stores for admin dashboard
 * @access  Private (Admin only)
 */
router.get('/stores', AdminController.getAllStores);

/**
 * @route   POST /api/admin/stores
 * @desc    Create new store
 * @access  Private (Admin only)
 */
router.post('/stores', 
  validate(schemas.admin.createStore),
  AdminController.createStore
);

// User Management Routes
/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination and filtering
 * @access  Private (Admin only)
 */
router.get('/users', AdminController.getAllUsers);

/**
 * @route   POST /api/admin/users
 * @desc    Create new user
 * @access  Private (Admin only)
 */
router.post('/users', 
  validate(schemas.admin.createUser),
  AdminController.createUser
);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user by ID with detailed information
 * @access  Private (Admin only)
 */
router.get('/users/:id', 
  validate(schemas.id, 'params'),
  AdminController.getUserById
);

/**
 * @route   PUT /api/admin/users/:id/status
 * @desc    Update user status (activate/deactivate)
 * @access  Private (Admin only)
 */
router.put('/users/:id/status', 
  validate(schemas.id, 'params'),
  AdminController.updateUserStatus
);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user
 * @access  Private (Admin only)
 */
router.delete('/users/:id', 
  validate(schemas.id, 'params'),
  AdminController.deleteUser
);

module.exports = router;
