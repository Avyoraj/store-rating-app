const request = require('supertest');
const app = require('../server');
const { validate, schemas } = require('../middleware/validation');

describe('Validation Middleware', () => {
  describe('User Registration Validation', () => {
    test('should accept valid registration data', async () => {
      const validData = {
        username: 'testuser123',
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567890',
        role: 'user'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(validData);

      // Should not fail validation (might fail for other reasons like user exists)
      expect(response.status).not.toBe(400);
    });

    test('should reject weak password', async () => {
      const invalidData = {
        username: 'testuser123',
        email: 'test@example.com',
        password: 'weak', // Too weak
        firstName: 'John',
        lastName: 'Doe'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details.password).toContain('Password must contain');
    });

    test('should reject invalid email', async () => {
      const invalidData = {
        username: 'testuser123',
        email: 'invalid-email', // Invalid email
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details.email).toContain('valid email');
    });

    test('should reject username with special characters', async () => {
      const invalidData = {
        username: 'test@user!', // Invalid characters
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details.username).toContain('alphanumeric');
    });

    test('should reject short username', async () => {
      const invalidData = {
        username: 'ab', // Too short
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details.username).toContain('at least 3 characters');
    });

    test('should reject invalid phone number', async () => {
      const invalidData = {
        username: 'testuser123',
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        phone: 'invalid-phone' // Invalid phone
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details.phone).toContain('valid phone number');
    });

    test('should reject invalid role', async () => {
      const invalidData = {
        username: 'testuser123',
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'John',
        lastName: 'Doe',
        role: 'invalid-role' // Invalid role
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details.role).toContain('must be one of');
    });
  });

  describe('User Login Validation', () => {
    test('should accept valid login data', async () => {
      const validData = {
        username: 'testuser123',
        password: 'SecurePass123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(validData);

      // Should not fail validation (might fail for other reasons like user not found)
      expect(response.status).not.toBe(400);
    });

    test('should reject missing username', async () => {
      const invalidData = {
        password: 'SecurePass123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details.username).toContain('required');
    });

    test('should reject missing password', async () => {
      const invalidData = {
        username: 'testuser123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details.password).toContain('required');
    });
  });

  describe('Store Creation Validation', () => {
    test('should accept valid store data', async () => {
      const validData = {
        name: 'Test Store',
        description: 'A test store description',
        address: '123 Main St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        phone: '+1234567890',
        email: 'store@example.com',
        website: 'https://example.com',
        categoryId: 1,
        latitude: 40.7128,
        longitude: -74.0060,
        openingHours: {
          monday: { open: '09:00', close: '17:00', closed: false },
          tuesday: { open: '09:00', close: '17:00', closed: false }
        }
      };

      const response = await request(app)
        .post('/api/stores')
        .send(validData);

      // Should not fail validation (will fail auth since no token)
      expect(response.status).toBe(401); // Unauthorized, not validation error
    });

    test('should reject invalid ZIP code', async () => {
      const invalidData = {
        name: 'Test Store',
        address: '123 Main St',
        city: 'Test City',
        state: 'Test State',
        zipCode: 'invalid-zip', // Invalid ZIP
        categoryId: 1
      };

      const response = await request(app)
        .post('/api/stores')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details.zipCode).toContain('valid ZIP code');
    });

    test('should reject invalid latitude', async () => {
      const invalidData = {
        name: 'Test Store',
        address: '123 Main St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        categoryId: 1,
        latitude: 100 // Invalid latitude (> 90)
      };

      const response = await request(app)
        .post('/api/stores')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details.latitude).toContain('between -90 and 90');
    });

    test('should reject invalid longitude', async () => {
      const invalidData = {
        name: 'Test Store',
        address: '123 Main St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        categoryId: 1,
        longitude: 200 // Invalid longitude (> 180)
      };

      const response = await request(app)
        .post('/api/stores')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details.longitude).toContain('between -180 and 180');
    });
  });

  describe('Review Creation Validation', () => {
    test('should accept valid review data', async () => {
      const validData = {
        rating: 5,
        title: 'Great store!',
        comment: 'I had a wonderful experience at this store.'
      };

      const response = await request(app)
        .post('/api/reviews/stores/1/reviews')
        .send(validData);

      // Should not fail validation (will fail auth since no token)
      expect(response.status).toBe(401); // Unauthorized, not validation error
    });

    test('should reject invalid rating', async () => {
      const invalidData = {
        rating: 6, // Invalid rating (> 5)
        title: 'Great store!',
        comment: 'I had a wonderful experience at this store.'
      };

      const response = await request(app)
        .post('/api/reviews/stores/1/reviews')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details.rating).toContain('between 1 and 5');
    });

    test('should reject missing rating', async () => {
      const invalidData = {
        title: 'Great store!',
        comment: 'I had a wonderful experience at this store.'
      };

      const response = await request(app)
        .post('/api/reviews/stores/1/reviews')
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details.rating).toContain('required');
    });
  });

  describe('XSS Protection', () => {
    test('should sanitize XSS attempts in registration', async () => {
      const xssData = {
        username: 'testuser123',
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: '<script>alert("xss")</script>John',
        lastName: '<img src=x onerror=alert("xss")>Doe'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(xssData);

      // Should detect XSS and reject
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    test('should sanitize XSS attempts in store creation', async () => {
      const xssData = {
        name: '<script>alert("xss")</script>Evil Store',
        description: '<img src=x onerror=alert("xss")>Evil description',
        address: '123 Main St',
        city: 'Test City',
        state: 'Test State',
        zipCode: '12345',
        categoryId: 1
      };

      const response = await request(app)
        .post('/api/stores')
        .send(xssData);

      // Should detect XSS and reject
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('SQL Injection Protection', () => {
    test('should reject SQL injection attempts in username', async () => {
      const sqlInjectionData = {
        username: "admin'; DROP TABLE users; --",
        email: 'test@example.com',
        password: 'SecurePass123!'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(sqlInjectionData);

      // Should detect SQL injection and reject
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_INPUT');
    });

    test('should reject SQL injection attempts in store search', async () => {
      const response = await request(app)
        .get('/api/stores')
        .query({ q: "'; DROP TABLE stores; --" });

      // Should detect SQL injection and reject
      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('INVALID_INPUT');
    });
  });
});

describe('Security Middleware', () => {
  describe('Content Type Validation', () => {
    test('should reject unsupported content type', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .set('Content-Type', 'text/plain')
        .send('invalid data');

      expect(response.status).toBe(415);
      expect(response.body.error.code).toBe('UNSUPPORTED_MEDIA_TYPE');
    });
  });

  describe('Input Size Limiting', () => {
    test('should reject oversized payloads', async () => {
      const oversizedData = {
        username: 'testuser123',
        email: 'test@example.com',
        password: 'SecurePass123!',
        firstName: 'A'.repeat(20000) // Very long string
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(oversizedData);

      expect(response.status).toBe(413);
      expect(response.body.error.code).toBe('PAYLOAD_TOO_LARGE');
    });
  });
});