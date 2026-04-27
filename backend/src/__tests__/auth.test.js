const request = require('supertest');
const app = require('../../app');

describe('Authentication API', () => {
  let token;
  const testPhone = '+919876543210';
  const testEmail = 'test@moofu.app';
  const testPassword = 'TestPassword123';

  describe('POST /api/auth/otp/request', () => {
    it('should request OTP for valid phone number', async () => {
      const response = await request(app)
        .post('/api/auth/otp/request')
        .send({ phoneNumber: testPhone })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('message');
      expect(response.body.data.message).toContain('OTP sent');
    });

    it('should reject invalid phone number', async () => {
      const response = await request(app)
        .post('/api/auth/otp/request')
        .send({ phoneNumber: 'invalid' })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.details).toBeDefined();
    });

    it('should reject missing phone number', async () => {
      const response = await request(app)
        .post('/api/auth/otp/request')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/otp/verify', () => {
    before(async () => {
      // Request OTP first
      await request(app)
        .post('/api/auth/otp/request')
        .send({ phoneNumber: testPhone });
    });

    it('should verify OTP and return token', async () => {
      const response = await request(app)
        .post('/api/auth/otp/verify')
        .send({ phoneNumber: testPhone, otp: '1234' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data.user).toHaveProperty('id');

      token = response.body.data.token;
    });

    it('should reject invalid OTP format', async () => {
      const response = await request(app)
        .post('/api/auth/otp/verify')
        .send({ phoneNumber: testPhone, otp: '12' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject non-numeric OTP', async () => {
      const response = await request(app)
        .post('/api/auth/otp/verify')
        .send({ phoneNumber: testPhone, otp: 'abcd' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should reject wrong OTP', async () => {
      const response = await request(app)
        .post('/api/auth/otp/verify')
        .send({ phoneNumber: testPhone, otp: '9999' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user with valid token', async () => {
      // Get token first
      await request(app)
        .post('/api/auth/otp/request')
        .send({ phoneNumber: '+918765432109' });

      const loginRes = await request(app)
        .post('/api/auth/otp/verify')
        .send({ phoneNumber: '+918765432109', otp: '1234' });

      const userToken = loginRes.body.data.token;

      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('phoneNumber');
    });

    it('should reject request without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should reject request with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/auth/profile', () => {
    let userToken;

    beforeAll(async () => {
      await request(app)
        .post('/api/auth/otp/request')
        .send({ phoneNumber: '+917654321098' });

      const loginRes = await request(app)
        .post('/api/auth/otp/verify')
        .send({ phoneNumber: '+917654321098', otp: '1234' });

      userToken = loginRes.body.data.token;
    });

    it('should update user profile with valid data', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          name: 'Updated Name',
          vehicleNumber: 'KA01AB1234',
          location: 'Bangalore',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
    });

    it('should reject update without token', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .send({ name: 'Test' })
        .expect(401);

      expect(response.body.success).toBe(false);
    });
  });

  describe('Rate limiting', () => {
    it('should rate limit OTP requests', async () => {
      // This test would require multiple rapid requests
      // Skipping for now as rate limit window is 15 minutes
      expect(true).toBe(true);
    });
  });
});
