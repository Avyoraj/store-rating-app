const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const { validate, schemas } = require('../middleware/validation');
const { getStoreReviews, createReview, updateReview, deleteReview, getUserReviews } = require('../controllers/reviewController');

/**
 * @route   GET /api/reviews/stores/:id/reviews
 * @desc    Get reviews for a store
 * @access  Public
 */
router.get('/stores/:id/reviews', validate(schemas.id, 'params'), getStoreReviews);

/**
 * @route   POST /api/reviews/stores/:id/reviews
 * @desc    Create a review for a store
 * @access  Private
 */
router.post('/stores/:id/reviews', 
  authenticate, 
  validate(schemas.id, 'params'),
  validate(schemas.review.create), 
  createReview
);

/**
 * @route   PUT /api/reviews/:id
 * @desc    Update user's review
 * @access  Private
 */
router.put('/:id', 
  authenticate,
  validate(schemas.id, 'params'),
  validate(schemas.review.update),
  updateReview
);

/**
 * @route   DELETE /api/reviews/:id
 * @desc    Delete user's review
 * @access  Private
 */
router.delete('/:id', 
  authenticate,
  validate(schemas.id, 'params'),
  deleteReview
);

/**
 * @route   GET /api/reviews/my-reviews
 * @desc    Get user's own reviews
 * @access  Private
 */
router.get('/my-reviews', authenticate, getUserReviews);

module.exports = router;
