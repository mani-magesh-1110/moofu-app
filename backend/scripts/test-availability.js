const {
  addSlots,
  assert,
  closeDbPool,
  createAdmin,
  createStation,
  requestJson,
  startServer,
  stopServer,
} = require('./test-helpers');

async function runAvailabilityScenario(baseUrl) {
  const adminAuth = await createAdmin(baseUrl);
  const station = await createStation(baseUrl, adminAuth.token, { totalSpots: 4 });

  await addSlots(baseUrl, adminAuth.token, station.id, [
    { slotNumber: 'A1', vehicleType: 'car' },
    { slotNumber: 'A2', vehicleType: 'car' },
    { slotNumber: 'B1', vehicleType: 'bike' },
  ]);

  const startTime = new Date(Date.now() + 60 * 60 * 1000).toISOString();
  const endTime = new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString();

  const availability = await requestJson(
    baseUrl,
    `/slots/${station.id}/availability?vehicleType=car&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`,
    { method: 'GET' }
  );

  assert(availability.availableCount === 2, 'Expected two available car slots');
  assert(availability.startTime === startTime, 'Availability startTime mismatch');
  assert(availability.endTime === endTime, 'Availability endTime mismatch');

  return { adminAuth, station, availability, startTime, endTime };
}

async function main() {
  const { server, baseUrl } = await startServer();

  try {
    await runAvailabilityScenario(baseUrl);
    console.log('Availability API test passed.');
  } finally {
    await stopServer(server);
    await closeDbPool();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Availability API test failed.', error);
    process.exit(1);
  });
}

module.exports = {
  runAvailabilityScenario,
};
