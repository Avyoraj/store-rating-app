const { pool } = require('../config/database');

/**
 * Simple Store model for basic CRUD operations
 */
class Store {
  /**
   * Find all stores with pagination
   */
  static async findAll(options = {}) {
    const { page = 1, limit = 10, search } = options;
    const offset = (page - 1) * limit;

    let query = `
      SELECT s.id, s.name, s.email, s.address, s.created_at,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as review_count
      FROM stores s
      LEFT JOIN reviews r ON s.id = r.store_id
    `;

    const queryParams = [];
    
    if (search) {
      query += ` WHERE s.name ILIKE $1 OR s.address ILIKE $1`;
      queryParams.push(`%${search}%`);
    }

    query += `
      GROUP BY s.id, s.name, s.email, s.address, s.created_at
      ORDER BY s.name
      LIMIT $${queryParams.length + 1} OFFSET $${queryParams.length + 2}
    `;

    queryParams.push(limit, offset);

    const result = await pool.query(query, queryParams);
    return result.rows;
  }

  /**
   * Find store by ID
   */
  static async findById(id) {
    const query = `
      SELECT s.id, s.name, s.email, s.address, s.owner_id, s.created_at,
             COALESCE(AVG(r.rating), 0) as average_rating,
             COUNT(r.id) as review_count,
             u.name as owner_name
      FROM stores s
      LEFT JOIN reviews r ON s.id = r.store_id
      LEFT JOIN users u ON s.owner_id = u.id
      WHERE s.id = $1
      GROUP BY s.id, s.name, s.email, s.address, s.owner_id, s.created_at, u.name
    `;

    const result = await pool.query(query, [id]);
    return result.rows[0];
  }

  /**
   * Create a new store
   */
  static async create(data) {
    const { name, email, address, ownerId } = data;
    
    const query = `
      INSERT INTO stores (name, email, address, owner_id, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      RETURNING id, name, email, address, owner_id, created_at
    `;

    const result = await pool.query(query, [name, email, address, ownerId]);
    return result.rows[0];
  }

  /**
   * Update a store
   */
  static async update(id, data) {
    const { name, email, address } = data;
    
    const query = `
      UPDATE stores 
      SET name = $1, email = $2, address = $3, updated_at = NOW()
      WHERE id = $4
      RETURNING id, name, email, address, updated_at
    `;

    const result = await pool.query(query, [name, email, address, id]);
    return result.rows[0];
  }

  /**
   * Delete a store
   */
  static async delete(id) {
    const query = 'DELETE FROM stores WHERE id = $1';
    await pool.query(query, [id]);
    return true;
  }

  /**
   * Count total stores
   */
  static async count(search = null) {
    let query = 'SELECT COUNT(*) FROM stores';
    const params = [];

    if (search) {
      query += ' WHERE name ILIKE $1 OR address ILIKE $1';
      params.push(`%${search}%`);
    }

    const result = await pool.query(query, params);
    return parseInt(result.rows[0].count);
  }
}

module.exports = Store;
