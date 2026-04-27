const {
  assert,
  closeDbPool,
  createCustomerViaOtp,
  requestJson,
  startServer,
  stopServer,
  uniqueDigits,
} = require('./test-helpers');

async function runAuthScenario(baseUrl) {
  const phoneNumber = `8${uniqueDigits(9)}`;
  const authData = await createCustomerViaOtp(baseUrl, phoneNumber);

  assert(!!authData.token, 'OTP verification did not return a token');
  assert(authData.user.phoneNumber === phoneNumber, 'Verified user phone number mismatch');

  const profile = await requestJson(baseUrl, '/auth/me', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${authData.token}`,
    },
  });

  assert(profile.phoneNumber === phoneNumber, 'Authenticated profile phone number mismatch');
  return { phoneNumber, authData, profile };
}

async function main() {
  const { server, baseUrl } = await startServer();

  try {
    await runAuthScenario(baseUrl);
    console.log('Auth API test passed.');
  } finally {
    await stopServer(server);
    await closeDbPool();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Auth API test failed.', error);
    process.exit(1);
  });
}

module.exports = {
  runAuthScenario,
};
