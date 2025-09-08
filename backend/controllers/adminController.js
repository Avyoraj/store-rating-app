const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * Get dashboard statistics (Admin only)
 */
const getDashboardStats = async (req, res) => {
  try {
    const statsQuery = `
      SELECT 
        (SELECT COUNT(*) FROM users) as total_users,
        (SELECT COUNT(*) FROM stores) as total_stores,
        (SELECT COUNT(*) FROM reviews) as total_ratings,
        (SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '30 days') as new_users_month,
        (SELECT COUNT(*) FROM stores WHERE created_at >= NOW() - INTERVAL '30 days') as new_stores_month,
        (SELECT COUNT(*) FROM reviews WHERE created_at >= NOW() - INTERVAL '30 days') as new_reviews_month,
        (SELECT AVG(rating) FROM reviews) as average_rating,
        (SELECT COUNT(*) FROM users WHERE role = 'admin') as admin_count,
        (SELECT COUNT(*) FROM users WHERE role = 'owner') as owner_count,
        (SELECT COUNT(*) FROM users WHERE role = 'user') as user_count
    `;
    
    const result = await pool.query(statsQuery);
    const stats = result.rows[0];

    res.json({
      success: true,
      data: {
        users: parseInt(stats.total_users) || 0,
        stores: parseInt(stats.total_stores) || 0,
        ratings: parseInt(stats.total_ratings) || 0,
        newUsersThisMonth: parseInt(stats.new_users_month) || 0,
        newStoresThisMonth: parseInt(stats.new_stores_month) || 0,
        newReviewsThisMonth: parseInt(stats.new_reviews_month) || 0,
        averageRating: parseFloat(stats.average_rating) || 0,
        userBreakdown: {
          admins: parseInt(stats.admin_count) || 0,
          owners: parseInt(stats.owner_count) || 0,
          users: parseInt(stats.user_count) || 0
        }
      },
      message: 'Dashboard statistics retrieved successfully'
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'STATS_FETCH_FAILED',
        message: 'Failed to fetch dashboard statistics'
      }
    });
  }
};

/**
 * Get all stores for admin dashboard
 */
const getAllStores = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-created_at', search } = req.query;
    const offset = (page - 1) * limit;

    // Parse sort parameter
    const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
    const sortOrder = sort.startsWith('-') ? 'DESC' : 'ASC';
    
    const validSortFields = ['created_at', 'updated_at', 'name', 'city', 'average_rating'];
    const finalSortField = validSortFields.includes(sortField) ? sortField : 'created_at';

    // Build WHERE clause
    const whereConditions = [];
    const queryParams = [];
    let paramCount = 1;

    if (search) {
      whereConditions.push(`(s.name ILIKE $${paramCount} OR s.email ILIKE $${paramCount} OR s.address ILIKE $${paramCount} OR s.city ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const storesQuery = `
      SELECT s.id, s.name, s.email, s.address, s.city, s.state, s.zip_code,
             s.phone, s.website, s.average_rating, s.total_reviews, s.created_at, s.updated_at,
             u.username as owner_username, u.email as owner_email,
             c.name as category_name
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN categories c ON s.category_id = c.id
      ${whereClause}
      ORDER BY ${finalSortField} ${sortOrder}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    
    queryParams.push(limit, offset);

    const countQuery = `
      SELECT COUNT(*) as total
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN categories c ON s.category_id = c.id
      ${whereClause}
    `;

    const [storesResult, countResult] = await Promise.all([
      pool.query(storesQuery, queryParams),
      pool.query(countQuery, queryParams.slice(0, -2)) // Remove limit and offset for count
    ]);

    const stores = storesResult.rows;
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        stores,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      },
      message: 'Stores retrieved successfully'
    });

  } catch (error) {
    console.error('Get all stores error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'STORES_FETCH_FAILED',
        message: 'Failed to fetch stores'
      }
    });
  }
};

/**
 * Get all users with pagination and filtering
 */
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-created_at', search, role } = req.query;
    const offset = (page - 1) * limit;

    // Parse sort parameter
    const sortField = sort.startsWith('-') ? sort.substring(1) : sort;
    const sortOrder = sort.startsWith('-') ? 'DESC' : 'ASC';
    
    const validSortFields = ['created_at', 'updated_at', 'username', 'email', 'role'];
    const finalSortField = validSortFields.includes(sortField) ? sortField : 'created_at';

    // Build WHERE clause
    const whereConditions = [];
    const queryParams = [];
    let paramCount = 1;

    if (search) {
      whereConditions.push(`(username ILIKE $${paramCount} OR email ILIKE $${paramCount} OR first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount})`);
      queryParams.push(`%${search}%`);
      paramCount++;
    }

    if (role) {
      whereConditions.push(`role = $${paramCount}`);
      queryParams.push(role);
      paramCount++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    const usersQuery = `
      SELECT id, username, email, role, first_name, last_name, 
             phone, address, is_active, email_verified, created_at, updated_at
      FROM users 
      ${whereClause}
      ORDER BY ${finalSortField} ${sortOrder}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    
    queryParams.push(limit, offset);

    const countQuery = `
      SELECT COUNT(*) as total
      FROM users 
      ${whereClause}
    `;

    const [usersResult, countResult] = await Promise.all([
      pool.query(usersQuery, queryParams),
      pool.query(countQuery, queryParams.slice(0, -2))
    ]);

    const users = usersResult.rows;
    const total = parseInt(countResult.rows[0].total);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      },
      message: 'Users retrieved successfully'
    });

  } catch (error) {
    console.error('Get all users error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'USERS_FETCH_FAILED',
        message: 'Failed to fetch users'
      }
    });
  }
};

/**
 * Get user by ID with detailed information
 */
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const userQuery = `
      SELECT u.id, u.username, u.email, u.role, u.first_name, u.last_name,
             u.phone, u.address, u.is_active, u.email_verified, u.created_at, u.updated_at,
             CASE 
               WHEN u.role = 'owner' THEN (
                 SELECT json_agg(
                   json_build_object(
                     'id', s.id,
                     'name', s.name,
                     'average_rating', s.average_rating,
                     'total_reviews', s.total_reviews
                   )
                 )
                 FROM stores s WHERE s.owner_id = u.id
               )
               ELSE NULL
             END as owned_stores,
             (SELECT COUNT(*) FROM reviews WHERE user_id = u.id) as reviews_given
      FROM users u
      WHERE u.id = $1
    `;

    const result = await pool.query(userQuery, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: { user },
      message: 'User details retrieved successfully'
    });

  } catch (error) {
    console.error('Get user by ID error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'USER_FETCH_FAILED',
        message: 'Failed to fetch user details'
      }
    });
  }
};

/**
 * Update user status (activate/deactivate)
 */
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const updateQuery = `
      UPDATE users 
      SET is_active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, username, email, is_active
    `;

    const result = await pool.query(updateQuery, [isActive, id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'USER_NOT_FOUND',
          message: 'User not found'
        }
      });
    }

    const user = result.rows[0];

    res.json({
      success: true,
      data: { user },
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error('Update user status error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'USER_UPDATE_FAILED',
        message: 'Failed to update user status'
      }
    });
  }
};

/**
 * Create new user (Admin only)
 */
const createUser = async (req, res) => {
  try {
    const { name, email, password, address, role = 'user' } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'Name, email, and password are required'
        }
      });
    }

    // Validate role
    const validRoles = ['user', 'admin', 'owner'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ROLE',
          message: 'Role must be one of: user, admin, owner'
        }
      });
    }

    // Check if user already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email, name]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'USER_ALREADY_EXISTS',
          message: 'User with this email or username already exists'
        }
      });
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash, address, role, created_at, updated_at, email_verified) 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW(), true) 
       RETURNING id, username, email, address, role, created_at`,
      [name, email, hashedPassword, address, role]
    );

    const newUser = result.rows[0];

    res.status(201).json({
      success: true,
      data: {
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          address: newUser.address,
          role: newUser.role,
          createdAt: newUser.created_at
        }
      },
      message: 'User created successfully'
    });

  } catch (error) {
    console.error('Create user error:', error);
    
    res.status(500).json({
      success: false,
      error: {
        code: 'USER_CREATION_FAILED',
        message: 'Failed to create user. Please try again later.'
      }
    });
  }
};

/**
 * Create new store with Store Owner account (Admin only)
 */
const createStore = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { name, email, address, city, state, zip_code, ownerName, ownerPassword } = req.body;

    // Validate required fields
    if (!name || !email || !address || !city || !state || !zip_code || !ownerName || !ownerPassword) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_REQUIRED_FIELDS',
          message: 'Store name, email, address, city, state, zip code, owner name, and owner password are required'
        }
      });
    }

    // Check if store email already exists
    const existingStore = await client.query(
      'SELECT id FROM stores WHERE email = $1',
      [email]
    );

    if (existingStore.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'STORE_EMAIL_EXISTS',
          message: 'Store with this email already exists'
        }
      });
    }

    // Check if owner email already exists
    const existingUser = await client.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'OWNER_EMAIL_EXISTS',
          message: 'User with this email already exists'
        }
      });
    }

    // Hash the owner password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(ownerPassword, saltRounds);

    // Create the Store Owner user account
    const ownerResult = await client.query(
      `INSERT INTO users (username, email, password_hash, address, role, is_active, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, 'owner', true, NOW(), NOW()) 
       RETURNING id, username, email, role, created_at`,
      [ownerName, email, hashedPassword, address]
    );

    const ownerId = ownerResult.rows[0].id;

    // Create the store and link it to the owner
    const storeResult = await client.query(
      `INSERT INTO stores (name, email, address, city, state, zip_code, owner_id, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW()) 
       RETURNING id, name, email, address, city, state, zip_code, owner_id, created_at`,
      [name, email, address, city, state, zip_code, ownerId]
    );

    const newStore = storeResult.rows[0];
    const newOwner = ownerResult.rows[0];

    await client.query('COMMIT');

    res.status(201).json({
      success: true,
      data: {
        store: {
          id: newStore.id,
          name: newStore.name,
          email: newStore.email,
          address: newStore.address,
          ownerId: newStore.owner_id,
          createdAt: newStore.created_at
        },
        owner: {
          id: newOwner.id,
          username: newOwner.username,
          email: newOwner.email,
          role: newOwner.role,
          createdAt: newOwner.created_at
        }
      },
      message: 'Store and owner account created successfully'
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create store error:', error);
    
    // Check for specific constraint violations
    if (error.code === '23505') { // Unique constraint violation
      if (error.constraint && error.constraint.includes('email')) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'EMAIL_ALREADY_EXISTS',
            message: 'Email address is already registered'
          }
        });
      }
    }
    
    res.status(500).json({
      success: false,
      error: {
        code: 'STORE_CREATION_FAILED',
        message: 'Failed to create store and owner account. Please try again later.'
      }
    });
  } finally {
    client.release();
  }
};

/**
 * Delete user (Admin only)
 */
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if user exists
    const userCheck = await pool.query('SELECT id, role FROM users WHERE id = $1', [id]);
    
    if (userCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: 'User not found' }
      });
    }

    const user = userCheck.rows[0];

    // Prevent admin from deleting themselves
    if (user.id === req.user.id) {
      return res.status(400).json({
        success: false,
        error: { message: 'Cannot delete your own account' }
      });
    }

    // Don't allow deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await pool.query('SELECT COUNT(*) FROM users WHERE role = $1', ['admin']);
      if (parseInt(adminCount.rows[0].count) <= 1) {
        return res.status(400).json({
          success: false,
          error: { message: 'Cannot delete the last admin user' }
        });
      }
    }

    // Delete user
    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      error: { message: 'Internal server error' }
    });
  }
};

module.exports = {
  getDashboardStats,
  getAllStores,
  getAllUsers,
  getUserById,
  updateUserStatus,
  createUser,
  createStore,
  deleteUser
};
