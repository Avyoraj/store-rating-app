const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { getAllStores, getStoreById, getUserStoreRating } = require('../controllers/storeController');

/**
 * @route   GET /api/stores
 * @desc    Get all stores with search and pagination
 * @access  Public
 */
router.get('/', validate(schemas.store.search, 'query'), getAllStores);

/**
 * @route   GET /api/stores/:id
 * @desc    Get store by ID
 * @access  Public
 */
router.get('/:id', validate(schemas.id, 'params'), getStoreById);

/**
 * @route   GET /api/stores/:id/rating
 * @desc    Get user's rating for a store
 * @access  Private
 */
router.get('/:id/rating', authenticate, validate(schemas.id, 'params'), getUserStoreRating);

module.exports = router;