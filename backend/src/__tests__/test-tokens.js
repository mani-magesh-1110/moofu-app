// Mock tokens for testing without database connection
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'test_secret_key_12345';

const mockUserPayload = {
  id: 'user-123',
  phone: '+919876543210',
  role: 'user'
};

const mockAdminPayload = {
  id: 'admin-123',
  phone: '+919999999999',
  role: 'admin'
};

const userToken = jwt.sign(mockUserPayload, JWT_SECRET, { expiresIn: '7d' });
const adminToken = jwt.sign(mockAdminPayload, JWT_SECRET, { expiresIn: '7d' });

module.exports = {
  userToken,
  adminToken,
  mockUserPayload,
  mockAdminPayload,
  JWT_SECRET
};
