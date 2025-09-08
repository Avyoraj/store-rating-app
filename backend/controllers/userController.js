const { pool } = require('../config/database');

const getProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const userQuery = `
      SELECT id, username, email, role, first_name, last_name, 
             phone, address, is_active, email_verified, created_at, updated_at
      FROM users 
      WHERE id = $1
    `;
    
    const result = await pool.query(userQuery, [req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user: result.rows[0] }
    });
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    const { first_name, last_name, phone, address } = req.body;
    
    const updateQuery = `
      UPDATE users 
      SET first_name = $1, last_name = $2, phone = $3, address = $4, updated_at = NOW()
      WHERE id = $5
      RETURNING id, username, email, role, first_name, last_name, phone, address, is_active, email_verified, created_at, updated_at
    `;
    
    const result = await pool.query(updateQuery, [first_name, last_name, phone, address, req.user.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    res.json({
      success: true,
      data: { user: result.rows[0] },
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
};

module.exports = {
  getProfile,
  updateProfile
};