const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');

let runtime = null;
let uniqueCounter = 0;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function uniqueSuffix() {
  uniqueCounter += 1;
  return `${Date.now()}-${uniqueCounter}-${randomUUID().slice(0, 8)}`;
}

function uniqueDigits(length) {
  const digits = `${Date.now()}${uniqueCounter}${Math.floor(Math.random() * 1000000)}`
    .replace(/\D/g, '');
  return digits.slice(-length).padStart(length, '0');
}

function getSchemaSql(stripMigrations = false) {
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  if (!stripMigrations) {
    return schemaSql;
  }

  return schemaSql
    .replace(/^CREATE EXTENSION.*$/gm, '')
    .replace(/^ALTER TABLE[\s\S]*?;$/gm, '');
}

async function createMemoryRuntime() {
  const { newDb, DataType } = require('pg-mem');
  const memoryDb = newDb({ autoCreateForeignKeyIndices: true });

  memoryDb.public.registerFunction({
    name: 'gen_random_uuid',
    returns: DataType.uuid,
    implementation: () => randomUUID(),
  });
  memoryDb.public.registerFunction({
    name: 'acos',
    args: [DataType.float],
    returns: DataType.float,
    implementation: Math.acos,
  });
  memoryDb.public.registerFunction({
    name: 'cos',
    args: [DataType.float],
    returns: DataType.float,
    implementation: Math.cos,
  });
  memoryDb.public.registerFunction({
    name: 'sin',
    args: [DataType.float],
    returns: DataType.float,
    implementation: Math.sin,
  });
  memoryDb.public.registerFunction({
    name: 'radians',
    args: [DataType.float],
    returns: DataType.float,
    implementation: (value) => value * (Math.PI / 180),
  });

  const { Pool } = memoryDb.adapters.createPg();
  const pool = new Pool();
  const dbModule = {
    pool,
    isMemoryDb: true,
    query(text, params = []) {
      return pool.query(text, params);
    },
  };

  const dbPath = require.resolve('../src/config/db');
  require.cache[dbPath] = {
    id: dbPath,
    filename: dbPath,
    loaded: true,
    exports: dbModule,
  };

  delete require.cache[require.resolve('../src/app')];
  const app = require('../src/app');

  await dbModule.query(getSchemaSql(true));

  return {
    app,
    dbModule,
    usingMemoryDb: true,
  };
}

async function ensureRuntime() {
  if (runtime) {
    return runtime;
  }

  const dbModule = require('../src/config/db');

  try {
    await dbModule.query('SELECT 1');
    const app = require('../src/app');
    await dbModule.query(getSchemaSql(false));
    runtime = {
      app,
      dbModule,
      usingMemoryDb: false,
    };
    return runtime;
  } catch (error) {
    runtime = await createMemoryRuntime();
    return runtime;
  }
}

async function startServer() {
  const activeRuntime = await ensureRuntime();

  return new Promise((resolve) => {
    const server = activeRuntime.app.listen(0, () => {
      const address = server.address();
      resolve({
        server,
        baseUrl: `http://127.0.0.1:${address.port}/api`,
        usingMemoryDb: activeRuntime.usingMemoryDb,
      });
    });
  });
}

async function stopServer(server) {
  if (!server) return;

  await new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) reject(error);
      else resolve();
    });
  });
}

async function closeDbPool() {
  if (!runtime) return;

  await runtime.dbModule.pool.end();
  runtime = null;
}

async function runDbQuery(text, params = []) {
  const activeRuntime = await ensureRuntime();
  return activeRuntime.dbModule.query(text, params);
}

async function requestJson(baseUrl, endpoint, options = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers,
  });

  const rawBody = await response.text();
  let body = rawBody;

  try {
    body = rawBody ? JSON.parse(rawBody) : null;
  } catch (error) {
    body = rawBody;
  }

  if (!response.ok) {
    const requestError = new Error(body?.message || `HTTP ${response.status}`);
    requestError.status = response.status;
    requestError.body = body;
    throw requestError;
  }

  return body?.data ?? body;
}

async function createAdmin(baseUrl) {
  const suffix = uniqueSuffix();
  const email = `admin-${suffix}@moofu.app`;
  const phoneNumber = `9${uniqueDigits(9)}`;
  const password = 'AdminPass123';

  await requestJson(baseUrl, '/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      name: `Admin ${suffix}`,
      email,
      phoneNumber,
      password,
    }),
  });

  await runDbQuery(`UPDATE users SET role = 'admin' WHERE email = $1`, [email]);

  return requestJson(baseUrl, '/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email,
      password,
    }),
  });
}

async function createCustomerViaOtp(baseUrl, phoneNumber) {
  const requestData = await requestJson(baseUrl, '/auth/otp/request', {
    method: 'POST',
    body: JSON.stringify({ phoneNumber }),
  });

  assert(!!requestData.message, 'OTP request did not return a message');

  return requestJson(baseUrl, '/auth/otp/verify', {
    method: 'POST',
    body: JSON.stringify({
      phoneNumber,
      otp: process.env.DEV_OTP_CODE || '1234',
    }),
  });
}

async function createStation(baseUrl, adminToken, overrides = {}) {
  return requestJson(baseUrl, '/admin/stations/onboard', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      name: `Station ${uniqueSuffix()}`,
      area: 'Chennai Central',
      address: '1 Main Road',
      latitude: 13.0827,
      longitude: 80.2707,
      hourlyRate: 50,
      convenienceFee: 10,
      totalSpots: 6,
      ...overrides,
    }),
  });
}

async function addSlots(baseUrl, adminToken, stationId, slots) {
  return requestJson(baseUrl, `/admin/stations/${stationId}/slots`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ slots }),
  });
}

module.exports = {
  assert,
  uniqueSuffix,
  uniqueDigits,
  startServer,
  stopServer,
  closeDbPool,
  runDbQuery,
  requestJson,
  createAdmin,
  createCustomerViaOtp,
  createStation,
  addSlots,
};
