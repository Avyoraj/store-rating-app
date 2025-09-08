const request = require('supertest');
const { pool } = require('../config/database');
const Store = require('../models/Store');
const app = require('../server');

// Test data
const testStore = {
  name: 'Test Store',
  description: 'A test store for unit testing',
  address: '123 Test Street',
  city: 'Test City',
  state: 'Test State',
  zipCode: '12345',
  phone: '555-0123',
  email: 'test@teststore.com',
  website: 'https://teststore.com',
  categoryId: 1,
  ownerId: 1,
  latitude: 40.7128,
  longitude: -74.0060,
  openingHours: {
    monday: { open: '09:00', close: '17:00', closed: false },
    tuesday: { open: '09:00', close: '17:00', closed: false }
  }
};

const testAdmin = {
  id: 1,
  username: 'admin',
  role: 'admin'
};

const testOwner = {
  id: 2,
  username: 'owner',
  role: 'owner'
};

describe('Store Model', () => {
  let createdStoreId;

  beforeAll(async () => {
    // Ensure test database is clean
    await pool.query('DELETE FROM stores WHERE name LIKE \'%Test%\'');
    
    // Create test category if it doesn't exist
    await pool.query(`
      INSERT INTO categories (id, name, description) 
      VALUES (1, 'Test Category', 'Test category for testing')
      ON CONFLICT (id) DO NOTHING
    `);
    
    // Create test users if they don't exist
    await pool.query(`
      INSERT INTO users (id, username, email, password_hash, role) 
      VALUES 
        (1, 'admin', 'admin@test.com', 'hashedpassword', 'admin'),
        (2, 'owner', 'owner@test.com', 'hashedpassword', 'owner')
      ON CONFLICT (id) DO NOTHING
    `);
  });

  afterAll(async () => {
    // Clean up test data
    await pool.query('DELETE FROM stores WHERE name LIKE \'%Test%\'');
  });

  describe('Store.create()', () => {
    test('should create a new store with valid data', async () => {
      const store = await Store.create(testStore);
      
      expect(store).toBeDefined();
      expect(store.id).toBeDefined();
      expect(store.name).toBe(testStore.name);
      expect(store.address).toBe(testStore.address);
      expect(store.category_id).toBe(testStore.categoryId);
      expect(store.is_active).toBe(true);
      
      createdStoreId = store.id;
    });

    test('should create store with minimal required data', async () => {
      const minimalStore = {
        name: 'Minimal Test Store',
        address: '456 Minimal Street',
        city: 'Minimal City',
        state: 'Minimal State',
        zipCode: '54321',
        categoryId: 1
      };

      const store = await Store.create(minimalStore);
      
      expect(store).toBeDefined();
      expect(store.name).toBe(minimalStore.name);
      expect(store.phone).toBeNull();
      expect(store.email).toBeNull();
    });

    test('should throw error with invalid category', async () => {
      const invalidStore = {
        ...testStore,
        name: 'Invalid Category Store',
        categoryId: 999
      };

      await expect(Store.create(invalidStore)).rejects.toThrow();
    });
  });

  describe('Store.findById()', () => {
    test('should find store by valid ID', async () => {
      const store = await Store.findById(createdStoreId);
      
      expect(store).toBeDefined();
      expect(store.id).toBe(createdStoreId);
      expect(store.name).toBe(testStore.name);
      expect(store.category_name).toBe('Test Category');
    });

    test('should return null for non-existent ID', async () => {
      const store = await Store.findById(99999);
      expect(store).toBeNull();
    });
  });

  describe('Store.update()', () => {
    test('should update store with valid data', async () => {
      const updateData = {
        name: 'Updated Test Store',
        description: 'Updated description'
      };

      const updatedStore = await Store.update(createdStoreId, updateData);
      
      expect(updatedStore).toBeDefined();
      expect(updatedStore.name).toBe(updateData.name);
      expect(updatedStore.description).toBe(updateData.description);
    });

    test('should return null for non-existent store', async () => {
      const result = await Store.update(99999, { name: 'Non-existent' });
      expect(result).toBeNull();
    });

    test('should throw error with no valid fields', async () => {
      await expect(Store.update(createdStoreId, {})).rejects.toThrow('No valid fields to update');
    });
  });

  describe('Store.search()', () => {
    test('should return paginated results', async () => {
      const result = await Store.search({ page: 1, limit: 5 });
      
      expect(result).toBeDefined();
      expect(result.stores).toBeDefined();
      expect(result.pagination).toBeDefined();
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(5);
      expect(Array.isArray(result.stores)).toBe(true);
    });

    test('should filter by name', async () => {
      const result = await Store.search({ q: 'Updated Test Store' });
      
      expect(result.stores.length).toBeGreaterThan(0);
      expect(result.stores[0].name).toContain('Updated Test Store');
    });

    test('should filter by category', async () => {
      const result = await Store.search({ category: 1 });
      
      expect(result.stores.length).toBeGreaterThan(0);
      result.stores.forEach(store => {
        expect(store.category_id).toBe(1);
      });
    });
  });

  describe('Store.isOwner()', () => {
    test('should return true for store owner', async () => {
      // First update the store to have an owner
      await Store.update(createdStoreId, { ownerId: 2 });
      
      const isOwner = await Store.isOwner(createdStoreId, 2);
      expect(isOwner).toBe(true);
    });

    test('should return false for non-owner', async () => {
      const isOwner = await Store.isOwner(createdStoreId, 999);
      expect(isOwner).toBe(false);
    });
  });

  describe('Store.delete()', () => {
    test('should soft delete store', async () => {
      const deleted = await Store.delete(createdStoreId);
      expect(deleted).toBe(true);
      
      // Verify store is not found in normal queries
      const store = await Store.findById(createdStoreId);
      expect(store).toBeNull();
    });

    test('should return false for non-existent store', async () => {
      const deleted = await Store.delete(99999);
      expect(deleted).toBe(false);
    });
  });

  describe('Store.getCategories()', () => {
    test('should return all categories', async () => {
      const categories = await Store.getCategories();
      
      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);
      expect(categories[0]).toHaveProperty('id');
      expect(categories[0]).toHaveProperty('name');
    });
  });
});

describe('Store API Endpoints', () => {
  let authToken;
  let ownerToken;
  let storeId;

  beforeAll(async () => {
    // Create auth tokens for testing
    // This would normally be done through login, but for testing we'll mock it
    authToken = 'mock-admin-token';
    ownerToken = 'mock-owner-token';
  });

  describe('GET /api/stores', () => {
    test('should get all stores without authentication', async () => {
      const response = await request(app)
        .get('/api/stores')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.pagination).toBeDefined();
    });

    test('should filter stores by query parameters', async () => {
      const response = await request(app)
        .get('/api/stores?q=test&page=1&limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(5);
    });

    test('should validate query parameters', async () => {
      const response = await request(app)
        .get('/api/stores?page=0&limit=101')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/stores/categories', () => {
    test('should get all categories', async () => {
      const response = await request(app)
        .get('/api/stores/categories')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });

  describe('GET /api/stores/:id', () => {
    test('should get store by valid ID', async () => {
      // First create a store to test with
      const store = await Store.create({
        name: 'API Test Store',
        address: '789 API Street',
        city: 'API City',
        state: 'API State',
        zipCode: '67890',
        categoryId: 1
      });
      storeId = store.id;

      const response = await request(app)
        .get(`/api/stores/${storeId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(storeId);
      expect(response.body.data.name).toBe('API Test Store');
    });

    test('should return 404 for non-existent store', async () => {
      const response = await request(app)
        .get('/api/stores/99999')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('STORE_NOT_FOUND');
    });

    test('should validate ID parameter', async () => {
      const response = await request(app)
        .get('/api/stores/invalid')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  // Note: POST, PUT, DELETE tests would require proper authentication middleware
  // For now, we'll test the validation aspects

  describe('POST /api/stores', () => {
    test('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/stores')
        .send({
          name: 'Incomplete Store'
          // Missing required fields
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  afterAll(async () => {
    // Clean up test data
    if (storeId) {
      await pool.query('DELETE FROM stores WHERE id = $1', [storeId]);
    }
  });
});

describe('Store Search and Discovery', () => {
  let testStores = [];

  beforeAll(async () => {
    // Create test stores with different locations and categories
    const storeData = [
      {
        name: 'Downtown Coffee Shop',
        address: '100 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        categoryId: 1,
        latitude: 40.7589,
        longitude: -73.9851
      },
      {
        name: 'Brooklyn Bakery',
        address: '200 Brooklyn Ave',
        city: 'Brooklyn',
        state: 'NY',
        zipCode: '11201',
        categoryId: 2,
        latitude: 40.6892,
        longitude: -73.9442
      },
      {
        name: 'Queens Restaurant',
        address: '300 Queens Blvd',
        city: 'Queens',
        state: 'NY',
        zipCode: '11375',
        categoryId: 3,
        latitude: 40.7282,
        longitude: -73.7949
      }
    ];

    // Create categories if they don't exist
    await pool.query(`
      INSERT INTO categories (id, name, description) VALUES 
        (1, 'Coffee Shop', 'Coffee and beverages'),
        (2, 'Bakery', 'Baked goods and pastries'),
        (3, 'Restaurant', 'Full service dining')
      ON CONFLICT (id) DO NOTHING
    `);

    for (const store of storeData) {
      const created = await Store.create(store);
      testStores.push(created);
    }
  });

  afterAll(async () => {
    // Clean up test stores
    for (const store of testStores) {
      await pool.query('DELETE FROM stores WHERE id = $1', [store.id]);
    }
  });

  describe('Store.findNearby()', () => {
    test('should find stores within radius', async () => {
      const latitude = 40.7589; // Downtown Manhattan
      const longitude = -73.9851;
      const radius = 10; // 10km

      const nearbyStores = await Store.findNearby(latitude, longitude, radius);
      
      expect(Array.isArray(nearbyStores)).toBe(true);
      expect(nearbyStores.length).toBeGreaterThan(0);
      
      // Check that distance is calculated
      nearbyStores.forEach(store => {
        expect(store.distance).toBeDefined();
        expect(typeof store.distance).toBe('string');
        expect(parseFloat(store.distance)).toBeLessThanOrEqual(radius);
      });
    });

    test('should return empty array for remote location', async () => {
      const latitude = 0; // Middle of ocean
      const longitude = 0;
      const radius = 1; // 1km

      const nearbyStores = await Store.findNearby(latitude, longitude, radius);
      
      expect(Array.isArray(nearbyStores)).toBe(true);
      expect(nearbyStores.length).toBe(0);
    });
  });

  describe('Store.findPopular()', () => {
    test('should return popular stores', async () => {
      const popularStores = await Store.findPopular(5);
      
      expect(Array.isArray(popularStores)).toBe(true);
      expect(popularStores.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Store.findByCategories()', () => {
    test('should find stores by single category', async () => {
      const result = await Store.findByCategories([1], { page: 1, limit: 10 });
      
      expect(result.stores).toBeDefined();
      expect(result.pagination).toBeDefined();
      expect(Array.isArray(result.stores)).toBe(true);
      
      // All stores should have category_id = 1
      result.stores.forEach(store => {
        expect(store.category_id).toBe(1);
      });
    });

    test('should find stores by multiple categories', async () => {
      const result = await Store.findByCategories([1, 2], { page: 1, limit: 10 });
      
      expect(result.stores).toBeDefined();
      expect(Array.isArray(result.stores)).toBe(true);
      
      // All stores should have category_id in [1, 2]
      result.stores.forEach(store => {
        expect([1, 2]).toContain(store.category_id);
      });
    });

    test('should throw error with empty category array', async () => {
      await expect(Store.findByCategories([])).rejects.toThrow('Category IDs must be a non-empty array');
    });
  });

  describe('Enhanced Search', () => {
    test('should search with multiple criteria', async () => {
      const filters = {
        q: 'Coffee',
        city: 'New York',
        minRating: 0,
        page: 1,
        limit: 10
      };

      const result = await Store.search(filters);
      
      expect(result.stores).toBeDefined();
      expect(result.pagination).toBeDefined();
      expect(result.filters).toBeDefined();
      expect(Array.isArray(result.stores)).toBe(true);
    });

    test('should search with location and distance', async () => {
      const filters = {
        latitude: 40.7589,
        longitude: -73.9851,
        maxDistance: 5,
        page: 1,
        limit: 10
      };

      const result = await Store.search(filters);
      
      expect(result.stores).toBeDefined();
      expect(result.filters.coordinates).toBeDefined();
      expect(result.filters.coordinates.latitude).toBe(40.7589);
      expect(result.filters.coordinates.longitude).toBe(-73.9851);
    });
  });
});

describe('Store Discovery API Endpoints', () => {
  describe('GET /api/stores/nearby', () => {
    test('should get nearby stores with coordinates', async () => {
      const response = await request(app)
        .get('/api/stores/nearby?latitude=40.7589&longitude=-73.9851&radius=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.searchCenter).toBeDefined();
      expect(response.body.radius).toBe(10);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should return error without coordinates', async () => {
      const response = await request(app)
        .get('/api/stores/nearby')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('MISSING_COORDINATES');
    });
  });

  describe('GET /api/stores/popular', () => {
    test('should get popular stores', async () => {
      const response = await request(app)
        .get('/api/stores/popular?limit=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(5);
    });

    test('should limit results to maximum 50', async () => {
      const response = await request(app)
        .get('/api/stores/popular?limit=100')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('LIMIT_EXCEEDED');
    });
  });

  describe('GET /api/stores/categories/:categoryIds', () => {
    test('should get stores by category IDs', async () => {
      const response = await request(app)
        .get('/api/stores/categories/1,2')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.categories).toEqual([1, 2]);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should return error with invalid category IDs', async () => {
      const response = await request(app)
        .get('/api/stores/categories/invalid,abc')
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('INVALID_CATEGORIES');
    });
  });

  describe('POST /api/stores/search', () => {
    test('should perform advanced search', async () => {
      const searchData = {
        query: 'coffee',
        city: 'New York',
        minRating: 0,
        page: 1,
        limit: 10
      };

      const response = await request(app)
        .post('/api/stores/search')
        .send(searchData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.filters).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    test('should validate search parameters', async () => {
      const invalidSearchData = {
        query: 'a'.repeat(101), // Too long
        minRating: 6, // Invalid rating
        maxDistance: 2000 // Too far
      };

      const response = await request(app)
        .post('/api/stores/search')
        .send(invalidSearchData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });
});