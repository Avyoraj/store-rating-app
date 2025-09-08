const { pool } = require('../config/database');

/**
 * Simple Review model for basic CRUD operations
 */
class Review {
  /**
   * Find reviews by store ID
   */
  static async findByStoreId(storeId, options = {}) {
    const { page = 1, limit = 10 } = options;
    const offset = (page - 1) * limit;

    const query = `
      SELECT r.id, r.rating, r.comment, r.created_at,
             u.name as user_name
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.store_id = $1
      ORDER BY r.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await pool.query(query, [storeId, limit, offset]);
    return result.rows;
  }

  /**
   * Create a new review
   */
  static async create(data) {
    const { userId, storeId, rating, comment } = data;
    
    const query = `
      INSERT INTO reviews (user_id, store_id, rating, comment, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id, rating, comment, created_at
    `;

    const result = await pool.query(query, [userId, storeId, rating, comment]);
    return result.rows[0];
  }

  /**
   * Update a review
   */
  static async update(id, data) {
    const { rating, comment } = data;
    
    const query = `
      UPDATE reviews 
      SET rating = $1, comment = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING id, rating, comment, updated_at
    `;

    const result = await pool.query(query, [rating, comment, id]);
    return result.rows[0];
  }

  /**
   * Delete a review
   */
  static async delete(id) {
    const query = 'DELETE FROM reviews WHERE id = $1';
    await pool.query(query, [id]);
    return true;
  }

  /**
   * Find review by ID
   */
  static async findById(id) {
    const query = 'SELECT * FROM reviews WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

module.exports = Review;
