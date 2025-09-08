const { pool } = require('../config/database');

/**
 * Get all stores with pagination and search
 */
const getAllStores = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const { name, address } = req.query;

    let whereClause = '';
    const queryParams = [];

    // Build search conditions
    if (name || address) {
      const conditions = [];
      let paramCount = 0;

      if (name) {
        paramCount++;
        conditions.push(`name ILIKE $${paramCount}`);
        queryParams.push(`%${name}%`);
      }

      if (address) {
        paramCount++;
        conditions.push(`address ILIKE $${paramCount}`);
        queryParams.push(`%${address}%`);
      }

      whereClause = `WHERE ${conditions.join(' AND ')}`;
    }

    // Add pagination parameters
    queryParams.push(limit, offset);
    const paginationParams = queryParams.length - 1;

    // Get stores with average rating
    const storesQuery = `
      SELECT s.id, s.name, s.email, s.address, s.created_at,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as review_count
      FROM stores s
      LEFT JOIN reviews r ON s.id = r.store_id
      ${whereClause}
      GROUP BY s.id, s.name, s.email, s.address, s.created_at
      ORDER BY s.name
      LIMIT $${paginationParams} OFFSET $${paginationParams + 1}
    `;

    const countQuery = `SELECT COUNT(*) FROM stores s ${whereClause}`;
    const countParams = queryParams.slice(0, -2); // Remove limit and offset

    const [storesResult, countResult] = await Promise.all([
      pool.query(storesQuery, queryParams),
      pool.query(countQuery, countParams)
    ]);

    const totalStores = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalStores / limit);

    res.json({
      success: true,
      data: {
        stores: storesResult.rows.map(store => ({
          ...store,
          average_rating: parseFloat(store.average_rating),
          review_count: parseInt(store.review_count)
        })),
        pagination: {
          page,
          limit,
          total: totalStores,
          totalPages
        }
      }
    });

  } catch (error) {
    console.error('Get all stores error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get stores' }
    });
  }
};

/**
 * Get store by ID with details
 */
const getStoreById = async (req, res) => {
  try {
    const { id } = req.params;

    const storeQuery = `
      SELECT s.id, s.name, s.email, s.address, s.created_at,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as review_count,
             CONCAT(u.first_name, ' ', u.last_name) as owner_name
      FROM stores s
      LEFT JOIN reviews r ON s.id = r.store_id
      LEFT JOIN users u ON s.owner_id = u.id
      WHERE s.id = $1
      GROUP BY s.id, s.name, s.email, s.address, s.created_at, u.first_name, u.last_name
    `;

    const result = await pool.query(storeQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Store not found' }
      });
    }

    const store = result.rows[0];
    store.average_rating = parseFloat(store.average_rating);
    store.review_count = parseInt(store.review_count);

    res.json({
      success: true,
      data: { store }
    });

  } catch (error) {
    console.error('Get store by ID error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get store' }
    });
  }
};

/**
 * Get store dashboard stats (for store owners)
 */
const getStoreDashboard = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Verify user owns this store
    const storeCheck = await pool.query(
      'SELECT owner_id FROM stores WHERE id = $1',
      [id]
    );

    if (storeCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Store not found' }
      });
    }

    if (storeCheck.rows[0].owner_id !== userId) {
      return res.status(403).json({
        success: false,
        error: { message: 'Not authorized to access this store dashboard' }
      });
    }

    // Get dashboard stats
    const statsQuery = `
      SELECT 
        COUNT(r.id) as total_reviews,
        COALESCE(AVG(r.rating), 0) as average_rating,
        COUNT(CASE WHEN r.created_at >= NOW() - INTERVAL '30 days' THEN 1 END) as recent_reviews
      FROM reviews r
      WHERE r.store_id = $1
    `;

    // Get recent reviews with user details
    const recentReviewsQuery = `
      SELECT r.id, r.rating, r.comment, r.created_at,
             CONCAT(u.first_name, ' ', u.last_name) as user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = $1
      ORDER BY r.created_at DESC
      LIMIT 5
    `;

    const [statsResult, reviewsResult] = await Promise.all([
      pool.query(statsQuery, [id]),
      pool.query(recentReviewsQuery, [id])
    ]);

    const stats = statsResult.rows[0];

    res.json({
      success: true,
      data: {
        stats: {
          totalReviews: parseInt(stats.total_reviews),
          averageRating: parseFloat(stats.average_rating),
          recentReviews: parseInt(stats.recent_reviews)
        },
        recentReviews: reviewsResult.rows
      }
    });

  } catch (error) {
    console.error('Get store dashboard error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get store dashboard' }
    });
  }
};

/**
 * Get user's rating for a specific store
 */
const getUserStoreRating = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const result = await pool.query(
      'SELECT id, rating, comment, created_at FROM reviews WHERE user_id = $1 AND store_id = $2',
      [userId, id]
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        data: { userRating: null }
      });
    }

    res.json({
      success: true,
      data: { userRating: result.rows[0] }
    });

  } catch (error) {
    console.error('Get user store rating error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get user rating' }
    });
  }
};

/**
 * Get current user's store (for store owners)
 */
const getMyStore = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get store owned by current user
    const result = await pool.query(
      `SELECT s.id, s.name, s.email, s.address, s.created_at,
              COALESCE(AVG(r.rating), 0) as average_rating,
              COUNT(r.id) as review_count
       FROM stores s
       LEFT JOIN reviews r ON s.id = r.store_id
       WHERE s.owner_id = $1
       GROUP BY s.id, s.name, s.email, s.address, s.created_at`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'No store found for this user' }
      });
    }

    const store = result.rows[0];

    res.json({
      success: true,
      data: {
        id: store.id,
        name: store.name,
        email: store.email,
        address: store.address,
        averageRating: parseFloat(store.average_rating),
        reviewCount: parseInt(store.review_count),
        createdAt: store.created_at
      }
    });

  } catch (error) {
    console.error('Get my store error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to get store information' }
    });
  }
};

/**
 * Update user's store information
 */
const updateMyStore = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email, address, city, state, zip_code, phone, website, description } = req.body;

    // Check if user owns a store
    const storeCheck = await pool.query(
      'SELECT id FROM stores WHERE owner_id = $1',
      [userId]
    );

    if (storeCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'No store found for this user' }
      });
    }

    const storeId = storeCheck.rows[0].id;

    // Update store information
    const result = await pool.query(
      `UPDATE stores 
       SET name = $1, email = $2, address = $3, city = $4, state = $5, 
           zip_code = $6, phone = $7, website = $8, description = $9, updated_at = NOW()
       WHERE id = $10 AND owner_id = $11
       RETURNING id, name, email, address, city, state, zip_code, phone, website, description`,
      [name, email, address, city, state, zip_code, phone, website, description, storeId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'Store not found or you do not have permission to update it' }
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: 'Store information updated successfully'
    });

  } catch (error) {
    console.error('Update my store error:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Failed to update store information' }
    });
  }
};

module.exports = {
  getAllStores,
  getStoreById,
  getStoreDashboard,
  getUserStoreRating,
  getMyStore,
  updateMyStore
};
