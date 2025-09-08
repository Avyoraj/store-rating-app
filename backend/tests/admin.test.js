const request = require('supertest');
const app = require('../server');
const { pool } = require('../config/database');
const { generateToken } = require('../utils/authHelpers');

describe('Admin API Endpoints', () => {
  let adminToken;
  let userToken;
  let testUserId;
  let testStoreId;

  beforeAll(async () => {
    // Create test admin user
    const adminResult = await pool.query(
      `INSERT INTO users (username, email, password_hash, role, is_active, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      ['testadmin', 'admin@test.com', 'hashedpassword', 'admin', true, true]
    );
    const adminId = adminResult.rows[0].id;
    adminToken = generateToken({ id: adminId, role: 'admin' });

    // Create test regular user
    const userResult = await pool.query(
      `INSERT INTO users (username, email, password_hash, role, is_active, email_verified)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
      ['testuser', 'user@test.com', 'hashedpassword', 'user', true, true]
    );
    testUserId = userResult.rows[0].id;
    userToken = generateToken({ id: testUserId, role: 'user' });

    // Create test category
    const categoryResult = await pool.query(
      `INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING id`,
      ['Test Category', 'Test category description']
    );
    const categoryId = categoryResult.rows[0].id;

    // Create test store
    const storeResult = await pool.query(
      `INSERT INTO stores (name, description, address, city, state, zip_code, category_id, owner_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
      ['Test Store', 'Test store description', '123 Test St', 'Test City', 'Test State', '12345', categoryId, testUserId, true]
    );
    testStoreId = storeResult.rows[0].id;

    // Create test reviews
    await pool.query(
      `INSERT INTO reviews (store_id, user_id, rating, title, comment)
       VALUES ($1, $2, $3, $4, $5)`,
      [testStoreId, testUserId, 5, 'Great store!', 'Really enjoyed shopping here.']
    );
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM reviews WHERE store_id = $1', [testStoreId]);
    await pool.query('DELETE FROM stores WHERE id = $1', [testStoreId]);
    await pool.query('DELETE FROM categories WHERE name = $1', ['Test Category']);
    await pool.query('DELETE FROM users WHERE username IN ($1, $2)', ['testadmin', 'testuser']);
  });

  describe('User Management', () => {
    describe('GET /api/admin/users', () => {
      it('should get all users for admin', async () => {
        const response = await request(app)
          .get('/api/admin/users')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.users).toBeInstanceOf(Array);
        expect(response.body.data.pagination).toBeDefined();
      });

      it('should deny access to non-admin users', async () => {
        await request(app)
          .get('/api/admin/users')
          .set('Authorization', `Bearer ${userToken}`)
          .expect(403);
      });

      it('should support pagination and filtering', async () => {
        const response = await request(app)
          .get('/api/admin/users?page=1&limit=5&role=user')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.data.pagination.limit).toBe(5);
        expect(response.body.data.pagination.page).toBe(1);
      });
    });

    describe('GET /api/admin/users/:id', () => {
      it('should get user by ID for admin', async () => {
        const response = await request(app)
          .get(`/api/admin/users/${testUserId}`)
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user.id).toBe(testUserId);
        expect(response.body.data.user.reviewCount).toBeDefined();
      });

      it('should return 404 for non-existent user', async () => {
        await request(app)
          .get('/api/admin/users/99999')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(404);
      });
    });

    describe('PUT /api/admin/users/:id/status', () => {
      it('should update user status for admin', async () => {
        const response = await request(app)
          .put(`/api/admin/users/${testUserId}/status`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            isActive: false,
            reason: 'Test deactivation'
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.user.isActive).toBe(false);

        // Reactivate for other tests
        await request(app)
          .put(`/api/admin/users/${testUserId}/status`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ isActive: true })
          .expect(200);
      });

      it('should validate request body', async () => {
        await request(app)
          .put(`/api/admin/users/${testUserId}/status`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            isActive: 'invalid'
          })
          .expect(400);
      });
    });
  });

  describe('Analytics', () => {
    describe('GET /api/admin/analytics/dashboard', () => {
      it('should get dashboard analytics for admin', async () => {
        const response = await request(app)
          .get('/api/admin/analytics/dashboard')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.overview).toBeDefined();
        expect(response.body.data.overview.users).toBeDefined();
        expect(response.body.data.overview.stores).toBeDefined();
        expect(response.body.data.overview.reviews).toBeDefined();
      });

      it('should support timeframe filtering', async () => {
        const response = await request(app)
          .get('/api/admin/analytics/dashboard?timeframe=7d')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.data.timeframe).toBe('7d');
      });
    });

    describe('GET /api/admin/analytics/stores', () => {
      it('should get store analytics for admin', async () => {
        const response = await request(app)
          .get('/api/admin/analytics/stores')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.stores).toBeInstanceOf(Array);
        expect(response.body.data.pagination).toBeDefined();
      });
    });

    describe('GET /api/admin/analytics/reviews', () => {
      it('should get review analytics for admin', async () => {
        const response = await request(app)
          .get('/api/admin/analytics/reviews')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.reviews).toBeInstanceOf(Array);
        expect(response.body.data.pagination).toBeDefined();
      });
    });
  });

  describe('Data Export', () => {
    describe('GET /api/admin/export', () => {
      it('should export users data in JSON format', async () => {
        const response = await request(app)
          .get('/api/admin/export?type=users&format=json')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.users).toBeInstanceOf(Array);
        expect(response.body.exportInfo).toBeDefined();
      });

      it('should export stores data in CSV format', async () => {
        const response = await request(app)
          .get('/api/admin/export?type=stores&format=csv')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.headers['content-type']).toContain('text/csv');
        expect(response.text).toContain('# STORES');
      });

      it('should validate export parameters', async () => {
        await request(app)
          .get('/api/admin/export?type=invalid')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(400);
      });

      it('should support date range filtering', async () => {
        const response = await request(app)
          .get('/api/admin/export?type=reviews&date_from=2024-01-01&date_to=2024-12-31')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
      });
    });
  });

  describe('Store Moderation', () => {
    describe('GET /api/admin/stores/pending', () => {
      it('should get stores pending approval', async () => {
        const response = await request(app)
          .get('/api/admin/stores/pending')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.stores).toBeInstanceOf(Array);
        expect(response.body.data.pagination).toBeDefined();
      });
    });

    describe('PUT /api/admin/stores/:id/moderate', () => {
      it('should approve a store', async () => {
        const response = await request(app)
          .put(`/api/admin/stores/${testStoreId}/moderate`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            action: 'approve',
            reason: 'Store meets all requirements'
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.store.isActive).toBe(true);
      });

      it('should reject a store', async () => {
        const response = await request(app)
          .put(`/api/admin/stores/${testStoreId}/moderate`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            action: 'reject',
            reason: 'Incomplete information'
          })
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.store.isActive).toBe(false);

        // Reactivate for cleanup
        await request(app)
          .put(`/api/admin/stores/${testStoreId}/moderate`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({ action: 'approve' })
          .expect(200);
      });

      it('should validate moderation action', async () => {
        await request(app)
          .put(`/api/admin/stores/${testStoreId}/moderate`)
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            action: 'invalid'
          })
          .expect(400);
      });
    });
  });

  describe('Security Monitoring', () => {
    describe('GET /api/admin/security/suspicious-activity', () => {
      it('should get flagged suspicious activity', async () => {
        const response = await request(app)
          .get('/api/admin/security/suspicious-activity')
          .set('Authorization', `Bearer ${adminToken}`)
          .expect(200);

        expect(response.body.success).toBe(true);
        expect(response.body.data.flaggedItems).toBeInstanceOf(Array);
        expect(response.body.data.summary).toBeDefined();
      });
    });
  });

  describe('Authorization', () => {
    it('should deny access without token', async () => {
      await request(app)
        .get('/api/admin/users')
        .expect(401);
    });

    it('should deny access with invalid token', async () => {
      await request(app)
        .get('/api/admin/users')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });

    it('should deny access to non-admin users', async () => {
      await request(app)
        .get('/api/admin/users')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);
    });
  });
});