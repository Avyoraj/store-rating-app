const { pool } = require('../config/database');

/**
 * Get all categories
 */
const getAllCategories = async (req, res) => {
  try {
    const query = `
      SELECT id, name, icon, description, created_at 
      FROM categories 
      ORDER BY name ASC
    `;
    
    const result = await pool.query(query);
    
    res.json({
      success: true,
      data: result.rows,
      message: `Found ${result.rows.length} categories`
    });
    
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CATEGORY_FETCH_ERROR',
        message: 'Failed to retrieve categories',
        details: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
};

/**
 * Get category by ID
 */
const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const query = `
      SELECT id, name, icon, description, created_at 
      FROM categories 
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'CATEGORY_NOT_FOUND',
          message: 'Category not found'
        },
        timestamp: new Date().toISOString()
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0],
      message: 'Category found'
    });
    
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CATEGORY_FETCH_ERROR',
        message: 'Failed to retrieve category',
        details: error.message
      },
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  getAllCategories,
  getCategoryById
};
