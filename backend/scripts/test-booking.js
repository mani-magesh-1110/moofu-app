const {
  addSlots,
  assert,
  closeDbPool,
  createAdmin,
  createCustomerViaOtp,
  createStation,
  requestJson,
  startServer,
  stopServer,
  uniqueDigits,
} = require('./test-helpers');

async function runBookingScenario(baseUrl) {
  const adminAuth = await createAdmin(baseUrl);
  const station = await createStation(baseUrl, adminAuth.token, {
    hourlyRate: 80,
    convenienceFee: 20,
    totalSpots: 2,
  });

  await addSlots(baseUrl, adminAuth.token, station.id, [
    { slotNumber: 'C1', vehicleType: 'car' },
  ]);

  const phoneNumber = `7${uniqueDigits(9)}`;
  const customerAuth = await createCustomerViaOtp(baseUrl, phoneNumber);

  const startTime = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString();
  const endTime = new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString();

  const booking = await requestJson(baseUrl, '/booking', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${customerAuth.token}`,
    },
    body: JSON.stringify({
      parkingId: station.id,
      vehicleType: 'car',
      vehicleNumber: 'TN01AB1234',
      startTime,
      endTime,
      paymentMethodId: 'google_pay',
      estimatedSubtotal: 1,
      convenienceFee: 1,
      totalAmount: 1,
    }),
  });

  assert(booking.totalAmount === 260, 'Server-calculated total amount mismatch');
  assert(booking.estimatedSubtotal === 240, 'Server-calculated subtotal mismatch');
  assert(booking.startTime === startTime, 'Booking startTime mismatch');
  assert(booking.endTime === endTime, 'Booking endTime mismatch');

  let overlapRejected = false;
  try {
    await requestJson(baseUrl, '/booking', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${customerAuth.token}`,
      },
      body: JSON.stringify({
        parkingId: station.id,
        vehicleType: 'car',
        vehicleNumber: 'TN01AB5678',
        startTime,
        endTime,
        paymentMethodId: 'phonepe',
      }),
    });
  } catch (error) {
    overlapRejected = error.status === 409;
  }

  assert(overlapRejected, 'Expected overlapping booking request to be rejected');

  const history = await requestJson(baseUrl, '/booking/history/user', {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${customerAuth.token}`,
    },
  });

  assert(history.bookings.length >= 1, 'Expected booking history to contain the new booking');

  const availabilityAfterBooking = await requestJson(
    baseUrl,
    `/slots/${station.id}/availability?vehicleType=car&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`,
    { method: 'GET' }
  );

  assert(availabilityAfterBooking.availableCount === 0, 'Expected zero available car slots after booking');

  const cancelledBooking = await requestJson(baseUrl, `/booking/${booking.id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${customerAuth.token}`,
    },
  });

  assert(cancelledBooking.status === 'cancelled', 'Expected cancelled booking status');

  const availabilityAfterCancel = await requestJson(
    baseUrl,
    `/slots/${station.id}/availability?vehicleType=car&startTime=${encodeURIComponent(startTime)}&endTime=${encodeURIComponent(endTime)}`,
    { method: 'GET' }
  );

  assert(availabilityAfterCancel.availableCount === 1, 'Expected slot to return after cancellation');

  return {
    adminAuth,
    customerAuth,
    station,
    booking,
    cancelledBooking,
  };
}

async function main() {
  const { server, baseUrl } = await startServer();

  try {
    await runBookingScenario(baseUrl);
    console.log('Booking API test passed.');
  } finally {
    await stopServer(server);
    await closeDbPool();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Booking API test failed.', error);
    process.exit(1);
  });
}

module.exports = {
  runBookingScenario,
};
