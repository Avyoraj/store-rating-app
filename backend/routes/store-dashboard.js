const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { getStoreDashboard, getMyStore, updateMyStore } = require('../controllers/storeController');

/**
 * @route   GET /api/store/profile
 * @desc    Get current user's store information (for store owners)
 * @access  Private
 */
router.get('/profile', authenticate, getMyStore);

/**
 * @route   PUT /api/store/profile
 * @desc    Update current user's store information (for store owners)
 * @access  Private
 */
router.put('/profile', authenticate, validate(schemas.store.update, 'body'), updateMyStore);

/**
 * @route   GET /api/store/:id
 * @desc    Get store dashboard stats (for store owners)
 * @access  Private
 */
router.get('/:id', 
  authenticate, 
  validate(schemas.id, 'params'), 
  getStoreDashboard
);

module.exports = router;
