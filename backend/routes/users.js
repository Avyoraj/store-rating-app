const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { getProfile, updateProfile } = require('../controllers/userController');
const { updatePassword } = require('../controllers/authController');

/**
 * @route   GET /api/users/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', authenticate, getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put('/profile', 
  authenticate, 
  validate(schemas.user.updateProfile), 
  updateProfile
);

/**
 * @route   PUT /api/users/password
 * @desc    Update user password
 * @access  Private
 */
router.put('/password', 
  authenticate, 
  validate(schemas.user.updatePassword), 
  updatePassword
);

module.exports = router;
