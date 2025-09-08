const request = require('supertest');
const { pool } = require('../config/database');
const Review = require('../models/Review');
const Store = require('../models/Store');
const app = require('../server');
const { generateToken } = require('../utils/authHelpers');

// Test data
const testStore = {
  name: 'Test Review Store',
  description: 'A test store for review testing',
  address: '123 Review Street',
  city: 'Review City',
  state: 'Review State',
  zipCode: '12345',
  phone: '555-0123',
  email: 'test@reviewstore.com',
  categoryId: 1,
  ownerId: 2
};

const testUser = {
  id: 1,
  username: 'testuser',
  email: 'test@user.com',
  role: 'user'
};

const testOwner = {
  id: 2,
  username: 'storeowner',
  email: 'owner@store.com',
  role: 'owner'
};

const testAdmin = {
  id: 3,
  username: 'admin',
  email: 'admin@system.com',
  role: 'admin'
};

const testReview = {
  rating: 5,
  title: 'Great store!',
  comment: 'This is an excellent store with great service.'
};

describe('Review Model', () => {
  let testStoreId;
  let testReviewId;
  let userToken;
  let ownerToken;
  let adminToken;

  beforeAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM review_helpfulness WHERE review_id IN (SELECT id FROM reviews WHERE store_id IN (SELECT id FROM stores WHERE name LIKE \'%Test Review%\'))');
    await pool.query('DELETE FROM reviews WHERE store_id IN (SELECT id FROM stores WHERE name LIKE \'%Test Review%\')');
    await pool.query('DELETE FROM stores WHERE name LIKE \'%Test Review%\'');
    
    // Create test category if it doesn't exist
    await pool.query(`
      INSERT INTO categories (id, name, description) 
      VALUES (1, 'Test Category', 'Test category for testing')
      ON CONFLICT (id) DO NOTHING
    `);

    // Create test users if they don't exist
    await pool.query(`
      INSERT INTO users (id, username, email, password_hash, role, is_active, email_verified) 
      VALUES 
        (1, 'testuser', 'test@user.com', '$2b$10$hash', 'user', true, true),
        (2, 'storeowner', 'owner@store.com', '$2b$10$hash', 'owner', true, true),
        (3, 'admin', 'admin@system.com', '$2b$10$hash', 'admin', true, true)
      ON CONFLICT (id) DO NOTHING
    `);

    // Create test store
    const store = await Store.create(testStore);
    testStoreId = store.id;

    // Generate tokens
    userToken = generateToken(testUser);
    ownerToken = generateToken(testOwner);
    adminToken = generateToken(testAdmin);
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM review_helpfulness WHERE review_id IN (SELECT id FROM reviews WHERE store_id = $1)', [testStoreId]);
    await pool.query('DELETE FROM reviews WHERE store_id = $1', [testStoreId]);
    await pool.query('DELETE FROM stores WHERE id = $1', [testStoreId]);
  });

  describe('Review.create', () => {
    test('should create a new review', async () => {
      const reviewData = {
        storeId: testStoreId,
        userId: testUser.id,
        rating: 5,
        title: 'Great store!',
        comment: 'Excellent service and products.'
      };

      const review = await Review.create(reviewData);
      testReviewId = review.id;

      expect(review).toBeDefined();
      expect(review.id).toBeDefined();
      expect(review.store_id).toBe(testStoreId);
      expect(review.user_id).toBe(testUser.id);
      expect(review.rating).toBe(5);
      expect(review.title).toBe('Great store!');
      expect(review.comment).toBe('Excellent service and products.');
    });

    test('should prevent duplicate reviews from same user', async () => {
      const reviewData = {
        storeId: testStoreId,
        userId: testUser.id,
        rating: 4,
        title: 'Another review',
        comment: 'This should fail.'
      };

      await expect(Review.create(reviewData)).rejects.toThrow('already reviewed');
    });
  });

  describe('Review.findById', () => {
    test('should find review by ID with user and store info', async () => {
      const review = await Review.findById(testReviewId);

      expect(review).toBeDefined();
      expect(review.id).toBe(testReviewId);
      expect(review.username).toBe(testUser.username);
      expect(review.store_name).toBe(testStore.name);
    });

    test('should return null for non-existent review', async () => {
      const review = await Review.findById(99999);
      expect(review).toBeNull();
    });
  });

  describe('Review.findByStoreId', () => {
    test('should get reviews for a store with pagination', async () => {
      const result = await Review.findByStoreId(testStoreId, { page: 1, limit: 10 });

      expect(result).toBeDefined();
      expect(result.reviews).toBeInstanceOf(Array);
      expect(result.reviews.length).toBe(1);
      expect(result.pagination).toBeDefined();
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('Review.update', () => {
    test('should update review fields', async () => {
      const updateData = {
        rating: 4,
        title: 'Updated title',
        comment: 'Updated comment'
      };

      const updatedReview = await Review.update(testReviewId, updateData);

      expect(updatedReview).toBeDefined();
      expect(updatedReview.rating).toBe(4);
      expect(updatedReview.title).toBe('Updated title');
      expect(updatedReview.comment).toBe('Updated comment');
    });
  });

  describe('Review.addOwnerResponse', () => {
    test('should add owner response to review', async () => {
      const response = 'Thank you for your feedback!';
      const updatedReview = await Review.addOwnerResponse(testReviewId, response);

      expect(updatedReview).toBeDefined();
      expect(updatedReview.owner_response).toBe(response);
      expect(updatedReview.owner_response_date).toBeDefined();
    });
  });

  describe('Review.voteHelpfulness', () => {
    test('should record helpfulness vote', async () => {
      const vote = await Review.voteHelpfulness(testReviewId, testOwner.id, true);

      expect(vote).toBeDefined();
      expect(vote.review_id).toBe(testReviewId);
      expect(vote.user_id).toBe(testOwner.id);
      expect(vote.is_helpful).toBe(true);
    });

    test('should update existing helpfulness vote', async () => {
      const vote = await Review.voteHelpfulness(testReviewId, testOwner.id, false);

      expect(vote).toBeDefined();
      expect(vote.is_helpful).toBe(false);
    });
  });

  describe('Review.getRatingDistribution', () => {
    test('should get rating distribution for store', async () => {
      const distribution = await Review.getRatingDistribution(testStoreId);

      expect(distribution).toBeDefined();
      expect(distribution.total).toBe(1);
      expect(distribution[4]).toBe(1); // Our review has rating 4 after update
      expect(distribution.average).toBe('4.00');
    });
  });

  describe('Review.getStoreStats', () => {
    test('should get comprehensive store statistics', async () => {
      const stats = await Review.getStoreStats(testStoreId);

      expect(stats).toBeDefined();
      expect(stats.totalReviews).toBe(1);
      expect(stats.averageRating).toBe('4.00');
      expect(stats.distribution).toBeDefined();
      expect(stats.responsesCount).toBe(1);
    });
  });

  describe('Review.isOwner', () => {
    test('should correctly identify review owner', async () => {
      const isOwner = await Review.isOwner(testReviewId, testUser.id);
      expect(isOwner).toBe(true);

      const isNotOwner = await Review.isOwner(testReviewId, testOwner.id);
      expect(isNotOwner).toBe(false);
    });
  });

  describe('Review.isStoreOwner', () => {
    test('should correctly identify store owner', async () => {
      const isStoreOwner = await Review.isStoreOwner(testReviewId, testOwner.id);
      expect(isStoreOwner).toBe(true);

      const isNotStoreOwner = await Review.isStoreOwner(testReviewId, testUser.id);
      expect(isNotStoreOwner).toBe(false);
    });
  });

  describe('Review.delete', () => {
    test('should delete review', async () => {
      const deleted = await Review.delete(testReviewId);
      expect(deleted).toBe(true);

      const review = await Review.findById(testReviewId);
      expect(review).toBeNull();
    });
  });
});

describe('Review API Endpoints', () => {
  let testStoreId;
  let testReviewId;
  let userToken;
  let ownerToken;
  let adminToken;

  beforeAll(async () => {
    // Create test store for API tests
    const store = await Store.create({
      ...testStore,
      name: 'API Test Store'
    });
    testStoreId = store.id;

    userToken = generateToken(testUser);
    ownerToken = generateToken(testOwner);
    adminToken = generateToken(testAdmin);
  });

  afterAll(async () => {
    // Clean up
    await pool.query('DELETE FROM review_helpfulness WHERE review_id IN (SELECT id FROM reviews WHERE store_id = $1)', [testStoreId]);
    await pool.query('DELETE FROM reviews WHERE store_id = $1', [testStoreId]);
    await pool.query('DELETE FROM stores WHERE id = $1', [testStoreId]);
  });

  describe('POST /api/stores/:storeId/reviews', () => {
    test('should create a new review', async () => {
      const response = await request(app)
        .post(`/api/stores/${testStoreId}/reviews`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(testReview);

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.rating).toBe(testReview.rating);
      expect(response.body.data.title).toBe(testReview.title);
      
      testReviewId = response.body.data.id;
    });

    test('should prevent store owner from reviewing own store', async () => {
      const response = await request(app)
        .post(`/api/stores/${testStoreId}/reviews`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send(testReview);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('FORBIDDEN');
    });

    test('should prevent duplicate reviews', async () => {
      const response = await request(app)
        .post(`/api/stores/${testStoreId}/reviews`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(testReview);

      expect(response.status).toBe(409);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('DUPLICATE_REVIEW');
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .post(`/api/stores/${testStoreId}/reviews`)
        .send(testReview);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/stores/:storeId/reviews', () => {
    test('should get store reviews', async () => {
      const response = await request(app)
        .get(`/api/stores/${testStoreId}/reviews`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.reviews).toBeInstanceOf(Array);
      expect(response.body.data.pagination).toBeDefined();
    });

    test('should handle pagination', async () => {
      const response = await request(app)
        .get(`/api/stores/${testStoreId}/reviews?page=1&limit=5`);

      expect(response.status).toBe(200);
      expect(response.body.data.pagination.page).toBe(1);
      expect(response.body.data.pagination.limit).toBe(5);
    });
  });

  describe('GET /api/reviews/:id', () => {
    test('should get review by ID', async () => {
      const response = await request(app)
        .get(`/api/reviews/${testReviewId}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(testReviewId);
    });

    test('should return 404 for non-existent review', async () => {
      const response = await request(app)
        .get('/api/reviews/99999');

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/reviews/:id', () => {
    test('should update own review', async () => {
      const updateData = {
        rating: 4,
        title: 'Updated review',
        comment: 'Updated comment'
      };

      const response = await request(app)
        .put(`/api/reviews/${testReviewId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.rating).toBe(4);
      expect(response.body.data.title).toBe('Updated review');
    });

    test('should prevent updating others reviews', async () => {
      const response = await request(app)
        .put(`/api/reviews/${testReviewId}`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ rating: 1 });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/reviews/:id/response', () => {
    test('should allow store owner to respond', async () => {
      const response = await request(app)
        .post(`/api/reviews/${testReviewId}/response`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ response: 'Thank you for your feedback!' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.owner_response).toBe('Thank you for your feedback!');
    });

    test('should prevent non-owners from responding', async () => {
      const response = await request(app)
        .post(`/api/reviews/${testReviewId}/response`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ response: 'Not allowed' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/reviews/:id/helpful', () => {
    test('should record helpfulness vote', async () => {
      const response = await request(app)
        .post(`/api/reviews/${testReviewId}/helpful`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ isHelpful: true });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.is_helpful).toBe(true);
    });

    test('should prevent voting on own review', async () => {
      const response = await request(app)
        .post(`/api/reviews/${testReviewId}/helpful`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ isHelpful: true });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/stores/:storeId/reviews/stats', () => {
    test('should get store review statistics', async () => {
      const response = await request(app)
        .get(`/api/stores/${testStoreId}/reviews/stats`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.totalReviews).toBeDefined();
      expect(response.body.data.averageRating).toBeDefined();
      expect(response.body.data.distribution).toBeDefined();
    });
  });

  describe('DELETE /api/reviews/:id', () => {
    test('should allow review owner to delete', async () => {
      const response = await request(app)
        .delete(`/api/reviews/${testReviewId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should return 404 for already deleted review', async () => {
      const response = await request(app)
        .delete(`/api/reviews/${testReviewId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
    });
  });
});