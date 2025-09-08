const request = require('supertest');
const { pool } = require('../config/database');
const app = require('../server');
const { generateToken } = require('../utils/authHelpers');

describe('User API Endpoints', () => {
  let testUserId;
  let testUserToken;
  let testAdminToken;
  let testOwnerId;
  let testOwnerToken;

  const testUser = {
    id: 1001,
    username: 'testuser',
    email: 'testuser@example.com',
    role: 'user',
    firstName: 'Test',
    lastName: 'User'
  };

  const testAdmin = {
    id: 1002,
    username: 'testadmin',
    email: 'testadmin@example.com',
    role: 'admin',
    firstName: 'Test',
    lastName: 'Admin'
  };

  const testOwner = {
    id: 1003,
    username: 'testowner',
    email: 'testowner@example.com',
    role: 'owner',
    firstName: 'Test',
    lastName: 'Owner'
  };

  beforeAll(async () => {
    // Clean up existing test data
    await pool.query('DELETE FROM users WHERE id IN ($1, $2, $3)', [testUser.id, testAdmin.id, testOwner.id]);

    // Create test users
    await pool.query(`
      INSERT INTO users (id, username, email, password_hash, role, first_name, last_name, is_active, email_verified) 
      VALUES 
        ($1, $2, $3, '$2b$10$hash', $4, $5, $6, true, true),
        ($7, $8, $9, '$2b$10$hash', $10, $11, $12, true, true),
        ($13, $14, $15, '$2b$10$hash', $16, $17, $18, true, true)
    `, [
      testUser.id, testUser.username, testUser.email, testUser.role, testUser.firstName, testUser.lastName,
      testAdmin.id, testAdmin.username, testAdmin.email, testAdmin.role, testAdmin.firstName, testAdmin.lastName,
      testOwner.id, testOwner.username, testOwner.email, testOwner.role, testOwner.firstName, testOwner.lastName
    ]);

    // Generate tokens
    testUserToken = generateToken(testUser);
    testAdminToken = generateToken(testAdmin);
    testOwnerToken = generateToken(testOwner);
    testUserId = testUser.id;
    testOwnerId = testOwner.id;
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM users WHERE id IN ($1, $2, $3)', [testUser.id, testAdmin.id, testOwner.id]);
  });

  describe('GET /api/users/profile', () => {
    test('should get current user profile', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.username).toBe(testUser.username);
      expect(response.body.data.email).toBe(testUser.email);
      expect(response.body.data.role).toBe(testUser.role);
      expect(response.body.data.password_hash).toBeUndefined();
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/users/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NO_TOKEN');
    });

    test('should reject invalid token', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_TOKEN');
    });
  });

  describe('PUT /api/users/profile', () => {
    test('should update user profile with valid data', async () => {
      const updateData = {
        firstName: 'Updated',
        lastName: 'Name',
        phone: '+1234567890'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.first_name).toBe(updateData.firstName);
      expect(response.body.data.last_name).toBe(updateData.lastName);
      expect(response.body.data.phone).toBe(updateData.phone);
    });

    test('should reject invalid phone number', async () => {
      const updateData = {
        phone: 'invalid-phone'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should reject XSS attempts', async () => {
      const updateData = {
        firstName: '<script>alert("xss")</script>',
        lastName: '<img src=x onerror=alert("xss")>'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(updateData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .send({ firstName: 'Test' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/reviews', () => {
    test('should get current user reviews', async () => {
      const response = await request(app)
        .get('/api/users/reviews')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.reviews).toBeDefined();
      expect(response.body.data.pagination).toBeDefined();
      expect(Array.isArray(response.body.data.reviews)).toBe(true);
    });

    test('should handle pagination parameters', async () => {
      const response = await request(app)
        .get('/api/users/reviews?page=1&limit=5')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(5);
    });

    test('should validate pagination parameters', async () => {
      const response = await request(app)
        .get('/api/users/reviews?page=0&limit=101')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/users/reviews');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/users/:id/reviews', () => {
    test('should get public user reviews', async () => {
      const response = await request(app)
        .get(`/api/users/${testUserId}/reviews`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.reviews).toBeDefined();
      expect(response.body.data.pagination).toBeDefined();
      expect(Array.isArray(response.body.data.reviews)).toBe(true);
    });

    test('should handle pagination for public reviews', async () => {
      const response = await request(app)
        .get(`/api/users/${testUserId}/reviews?page=1&limit=10`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(10);
    });

    test('should validate user ID parameter', async () => {
      const response = await request(app)
        .get('/api/users/invalid/reviews');

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should return 404 for non-existent user', async () => {
      const response = await request(app)
        .get('/api/users/99999/reviews');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('USER_NOT_FOUND');
    });
  });

  describe('POST /api/users/deactivate', () => {
    test('should deactivate user account with valid reason', async () => {
      const deactivateData = {
        reason: 'No longer needed',
        password: 'SecurePass123!'
      };

      const response = await request(app)
        .post('/api/users/deactivate')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(deactivateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('deactivated');
    });

    test('should require password confirmation', async () => {
      const deactivateData = {
        reason: 'No longer needed'
        // Missing password
      };

      const response = await request(app)
        .post('/api/users/deactivate')
        .set('Authorization', `Bearer ${testOwnerToken}`)
        .send(deactivateData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should reject wrong password', async () => {
      const deactivateData = {
        reason: 'No longer needed',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/users/deactivate')
        .set('Authorization', `Bearer ${testOwnerToken}`)
        .send(deactivateData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_PASSWORD');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .post('/api/users/deactivate')
        .send({ reason: 'Test', password: 'password' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Admin User Management', () => {
    describe('GET /api/users', () => {
      test('should get all users for admin', async () => {
        const response = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${testAdminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('Get all users');
      });

      test('should reject non-admin access', async () => {
        const response = await request(app)
          .get('/api/users')
          .set('Authorization', `Bearer ${testUserToken}`);

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
      });

      test('should require authentication', async () => {
        const response = await request(app)
          .get('/api/users');

        expect(response.status).toBe(401);
        expect(response.body.success).toBe(false);
      });
    });

    describe('GET /api/users/:id', () => {
      test('should get user by ID for admin', async () => {
        const response = await request(app)
          .get(`/api/users/${testUserId}`)
          .set('Authorization', `Bearer ${testAdminToken}`);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('Get user by ID');
      });

      test('should reject non-admin access', async () => {
        const response = await request(app)
          .get(`/api/users/${testUserId}`)
          .set('Authorization', `Bearer ${testUserToken}`);

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
      });

      test('should validate user ID parameter', async () => {
        const response = await request(app)
          .get('/api/users/invalid')
          .set('Authorization', `Bearer ${testAdminToken}`);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });
    });

    describe('PUT /api/users/:id/status', () => {
      test('should update user status for admin', async () => {
        const statusData = {
          isActive: false,
          reason: 'Suspended for violation'
        };

        const response = await request(app)
          .put(`/api/users/${testUserId}/status`)
          .set('Authorization', `Bearer ${testAdminToken}`)
          .send(statusData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('Update user status');
      });

      test('should reject non-admin access', async () => {
        const response = await request(app)
          .put(`/api/users/${testUserId}/status`)
          .set('Authorization', `Bearer ${testUserToken}`)
          .send({ isActive: false });

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
      });

      test('should validate status data', async () => {
        const invalidData = {
          isActive: 'not-boolean'
        };

        const response = await request(app)
          .put(`/api/users/${testUserId}/status`)
          .set('Authorization', `Bearer ${testAdminToken}`)
          .send(invalidData);

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });
    });

    describe('POST /api/users/:id/reactivate', () => {
      test('should reactivate user account for admin', async () => {
        const reactivateData = {
          reason: 'Appeal approved'
        };

        const response = await request(app)
          .post(`/api/users/${testUserId}/reactivate`)
          .set('Authorization', `Bearer ${testAdminToken}`)
          .send(reactivateData);

        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.message).toContain('reactivated');
      });

      test('should reject non-admin access', async () => {
        const response = await request(app)
          .post(`/api/users/${testUserId}/reactivate`)
          .set('Authorization', `Bearer ${testUserToken}`)
          .send({ reason: 'Test' });

        expect(response.status).toBe(403);
        expect(response.body.success).toBe(false);
      });

      test('should validate reactivation data', async () => {
        const response = await request(app)
          .post(`/api/users/${testUserId}/reactivate`)
          .set('Authorization', `Bearer ${testAdminToken}`)
          .send({}); // Missing reason

        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.error.code).toBe('VALIDATION_ERROR');
      });
    });
  });
});

describe('User Security Tests', () => {
  let testUserToken;

  const testUser = {
    id: 2001,
    username: 'securitytest',
    email: 'security@example.com',
    role: 'user'
  };

  beforeAll(async () => {
    await pool.query('DELETE FROM users WHERE id = $1', [testUser.id]);
    await pool.query(`
      INSERT INTO users (id, username, email, password_hash, role, is_active, email_verified) 
      VALUES ($1, $2, $3, '$2b$10$hash', $4, true, true)
    `, [testUser.id, testUser.username, testUser.email, testUser.role]);

    testUserToken = generateToken(testUser);
  });

  afterAll(async () => {
    await pool.query('DELETE FROM users WHERE id = $1', [testUser.id]);
  });

  describe('Input Validation and Sanitization', () => {
    test('should prevent XSS in profile update', async () => {
      const xssData = {
        firstName: '<script>alert("xss")</script>',
        lastName: '<img src=x onerror=alert("xss")>',
        phone: '<svg onload=alert("xss")>'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send(xssData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should prevent SQL injection in user ID', async () => {
      const response = await request(app)
        .get("/api/users/1'; DROP TABLE users; --/reviews");

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('Authorization Tests', () => {
    test('should prevent user from accessing admin endpoints', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });

    test('should prevent user from modifying other users', async () => {
      const response = await request(app)
        .put('/api/users/999/status')
        .set('Authorization', `Bearer ${testUserToken}`)
        .send({ isActive: false });

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('INSUFFICIENT_PERMISSIONS');
    });
  });

  describe('Data Privacy', () => {
    test('should not expose sensitive data in profile response', async () => {
      const response = await request(app)
        .get('/api/users/profile')
        .set('Authorization', `Bearer ${testUserToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.password_hash).toBeUndefined();
      expect(response.body.data.password).toBeUndefined();
    });

    test('should not expose other users sensitive data', async () => {
      const response = await request(app)
        .get(`/api/users/${testUser.id}/reviews`);

      expect(response.status).toBe(200);
      // Should not include sensitive user data in public reviews
      if (response.body.data.reviews.length > 0) {
        const review = response.body.data.reviews[0];
        expect(review.user_email).toBeUndefined();
        expect(review.user_phone).toBeUndefined();
      }
    });
  });
});