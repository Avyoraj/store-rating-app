const { pool } = require('../config/database');

/**
 * Get reviews for a store
 */
const getStoreReviews = async (req, res) => {
  try {
    const { id: storeId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Get reviews with user details
    const reviewsQuery = `
      SELECT r.id, r.rating, r.comment, r.created_at,
             CONCAT(u.first_name, ' ', u.last_name) as user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = 'SELECT COUNT(*) FROM reviews WHERE store_id = $1';

    const [reviewsResult, countResult] = await Promise.all([
      pool.query(reviewsQuery, [storeId, limit, offset]),
      pool.query(countQuery, [storeId])
    ]);

    const totalReviews = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalReviews / limit);

    res.json({
      success: true,
      data: {
        reviews: reviewsResult.rows,
        pagination: {
          page,
          limit,
          total: totalReviews,
          totalPages
        }
      }
    });

  } catch (error) {
    console.error('Get store reviews error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get reviews' }
    });
  }
};

/**
 * Create a new review
 */
const createReview = async (req, res) => {
  try {
    const { id: storeId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // Check if user already reviewed this store
    const existingReview = await pool.query(
      'SELECT id FROM reviews WHERE user_id = $1 AND store_id = $2',
      [userId, storeId]
    );

    if (existingReview.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: { message: 'You have already reviewed this store' }
      });
    }

    // Create review
    const result = await pool.query(
      `INSERT INTO reviews (user_id, store_id, rating, comment, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING id, rating, comment, created_at`,
      [userId, storeId, rating, comment]
    );

    res.status(201).json({
      success: true,
      data: { review: result.rows[0] },
      message: 'Review created successfully'
    });

  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to create review' }
    });
  }
};

/**
 * Update user's review
 */
const updateReview = async (req, res) => {
  try {
    const { id: reviewId } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user.id;

    // Verify review belongs to user
    const reviewCheck = await pool.query(
      'SELECT user_id FROM reviews WHERE id = $1',
      [reviewId]
    );

    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Review not found' }
      });
    }

    if (reviewCheck.rows[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: 'Not authorized to update this review' }
      });
    }

    // Update review
    const result = await pool.query(
      `UPDATE reviews 
       SET rating = $1, comment = $2, updated_at = NOW()
       WHERE id = $3
       RETURNING id, rating, comment, updated_at`,
      [rating, comment, reviewId]
    );

    res.json({
      success: true,
      data: { review: result.rows[0] },
      message: 'Review updated successfully'
    });

  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update review' }
    });
  }
};

/**
 * Delete user's review
 */
const deleteReview = async (req, res) => {
  try {
    const { id: reviewId } = req.params;
    const userId = req.user.id;

    // Verify review belongs to user
    const reviewCheck = await pool.query(
      'SELECT user_id FROM reviews WHERE id = $1',
      [reviewId]
    );

    if (reviewCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Review not found' }
      });
    }

    if (reviewCheck.rows[0].user_id !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: 'Not authorized to delete this review' }
      });
    }

    // Delete review
    await pool.query('DELETE FROM reviews WHERE id = $1', [reviewId]);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });

  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to delete review' }
    });
  }
};

/**
 * Get user's own reviews
 */
const getUserReviews = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const reviewsQuery = `
      SELECT r.id, r.store_id, r.rating, r.comment, r.created_at,
             s.name as store_name, s.address as store_address
      FROM reviews r
      JOIN stores s ON r.store_id = s.id
      WHERE r.user_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const countQuery = 'SELECT COUNT(*) FROM reviews WHERE user_id = $1';

    const [reviewsResult, countResult] = await Promise.all([
      pool.query(reviewsQuery, [userId, limit, offset]),
      pool.query(countQuery, [userId])
    ]);

    const totalReviews = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalReviews / limit);

    res.json({
      success: true,
      data: {
        reviews: reviewsResult.rows,
        pagination: {
          page,
          limit,
          total: totalReviews,
          totalPages
        }
      }
    });

  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get user reviews' }
    });
  }
};

module.exports = {
  getStoreReviews,
  createReview,
  updateReview,
  deleteReview,
  getUserReviews
};