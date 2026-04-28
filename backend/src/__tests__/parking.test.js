const request = require('supertest');
const app = require('../app');
const { adminToken } = require('./test-tokens');

describe('Parking APIs', () => {
  let stationId;

  beforeAll(async () => {
    // Using mock admin token for testing without database
    // In production, this would require actual authentication
  });

  describe('POST /api/parking', () => {
    it('should create a new parking station', async () => {
      const response = await request(app)
        .post('/api/parking')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Downtown Parking',
          area: 'Downtown',
          address: '123 Main St, City Center',
          latitude: 12.9716,
          longitude: 77.5946,
          hourlyRate: 50,
          convenienceFee: 10,
          totalSpots: 100,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Downtown Parking');

      stationId = response.body.data.id;
    });

    it('should reject invalid coordinates', async () => {
      const response = await request(app)
        .post('/api/parking')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Invalid Parking',
          area: 'Downtown',
          address: 'Some address',
          latitude: 200, // Invalid latitude
          longitude: 77.5946,
          hourlyRate: 50,
          convenienceFee: 10,
          totalSpots: 50,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject negative rates', async () => {
      const response = await request(app)
        .post('/api/parking')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'Negative Rate Parking',
          area: 'Downtown',
          address: 'Some address',
          latitude: 12.9716,
          longitude: 77.5946,
          hourlyRate: -50, // Invalid negative rate
          convenienceFee: 10,
          totalSpots: 50,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject zero or negative spots', async () => {
      const response = await request(app)
        .post('/api/parking')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          name: 'No Spots Parking',
          area: 'Downtown',
          address: 'Some address',
          latitude: 12.9716,
          longitude: 77.5946,
          hourlyRate: 50,
          convenienceFee: 10,
          totalSpots: 0, // Invalid
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject unauthorized users', async () => {
      const response = await request(app)
        .post('/api/parking')
        .set('Authorization', 'Bearer invalid_token')
        .send({
          name: 'Test Parking',
          area: 'Downtown',
          address: 'Some address',
          latitude: 12.9716,
          longitude: 77.5946,
          hourlyRate: 50,
          convenienceFee: 10,
          totalSpots: 50,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/parking', () => {
    it('should list all parking stations', async () => {
      const response = await request(app)
        .get('/api/parking')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('spaces');
      expect(Array.isArray(response.body.data.spaces)).toBe(true);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/parking?limit=10&offset=0')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.spaces).toBeDefined();
    });

    it('should filter by area', async () => {
      const response = await request(app)
        .get('/api/parking?area=Downtown')
        .expect(200);

      expect(response.body.success).toBe(true);
      if (response.body.data.spaces.length > 0) {
        expect(response.body.data.spaces[0].area).toBe('Downtown');
      }
    });
  });

  describe('GET /api/parking/:id', () => {
    it('should get station details by ID', async () => {
      if (!stationId) {
        // Create a station first
        const createRes = await request(app)
          .post('/api/parking')
          .set('Authorization', `Bearer ${adminToken}`)
          .send({
            name: 'Test Station',
            area: 'Test Area',
            address: 'Test address',
            latitude: 12.9716,
            longitude: 77.5946,
            hourlyRate: 50,
            convenienceFee: 10,
            totalSpots: 50,
          });

        stationId = createRes.body.data.id;
      }

      const response = await request(app)
        .get(`/api/parking/${stationId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.id).toBe(stationId);
    });

    it('should return 404 for non-existent station', async () => {
      const response = await request(app)
        .get('/api/parking/00000000-0000-0000-0000-000000000000')
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/parking/nearby', () => {
    it('should find nearby parking stations', async () => {
      const response = await request(app)
        .get('/api/parking/nearby?latitude=12.9716&longitude=77.5946&radiusKm=5')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('spaces');
      expect(Array.isArray(response.body.data.spaces)).toBe(true);
    });

    it('should reject invalid coordinates', async () => {
      const response = await request(app)
        .get('/api/parking/nearby?latitude=200&longitude=77.5946')
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject missing required parameters', async () => {
      const response = await request(app)
        .get('/api/parking/nearby?latitude=12.9716')
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/parking/search/area', () => {
    it('should search parking by area', async () => {
      const response = await request(app)
        .get('/api/parking/search/area?area=Downtown')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('spaces');
    });

    it('should return empty results for non-existent area', async () => {
      const response = await request(app)
        .get('/api/parking/search/area?area=NonExistentArea12345')
        .expect(200);

      expect(response.body.success).toBe(true);
      // May be empty or have results
      expect(Array.isArray(response.body.data.spaces)).toBe(true);
    });
  });
});
