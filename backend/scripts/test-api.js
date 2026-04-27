const { closeDbPool, startServer, stopServer } = require('./test-helpers');
const { runAuthScenario } = require('./test-auth');
const { runAvailabilityScenario } = require('./test-availability');
const { runBookingScenario } = require('./test-booking');

async function main() {
  const { server, baseUrl } = await startServer();

  try {
    await runAuthScenario(baseUrl);
    await runAvailabilityScenario(baseUrl);
    await runBookingScenario(baseUrl);
    console.log('All API tests passed.');
  } finally {
    await stopServer(server);
    await closeDbPool();
  }
}

main().catch((error) => {
  console.error('API test suite failed.', error);
  process.exit(1);
});
