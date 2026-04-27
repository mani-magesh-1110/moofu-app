const { toIsoString } = require('./datetime');

function serializeStation(station) {
  if (!station) return null;

  return {
    id: station.id,
    name: station.name,
    area: station.area,
    address: station.address,
    latitude: Number(station.latitude),
    longitude: Number(station.longitude),
    hourlyRate: Number(station.hourly_rate),
    convenienceFee: Number(station.convenience_fee),
    totalSpots: Number(station.total_spots),
    availableSpots: Number(station.available_spots || 0),
    distanceKm: station.distance_km === undefined ? undefined : Number(station.distance_km),
    createdBy: station.created_by,
    createdAtISO: toIsoString(station.created_at),
    updatedAtISO: toIsoString(station.updated_at),
  };
}

function serializeSlot(slot) {
  if (!slot) return null;

  return {
    id: slot.id,
    stationId: slot.station_id,
    slotNumber: slot.slot_number,
    vehicleType: slot.vehicle_type,
    isAvailable: slot.is_available,
    createdAtISO: toIsoString(slot.created_at),
    updatedAtISO: toIsoString(slot.updated_at),
  };
}

function serializeBooking(booking) {
  if (!booking) return null;

  return {
    id: booking.id,
    tokenNo: booking.id.slice(0, 8).toUpperCase(),
    userId: booking.user_id,
    parkingId: booking.station_id,
    slotId: booking.slot_id,
    vehicleType: booking.vehicle_type,
    vehicleNumber: booking.vehicle_number,
    startTime: toIsoString(booking.arrival_at),
    endTime: toIsoString(booking.departure_at),
    durationHours: Number(booking.duration_hours),
    estimatedSubtotal: Number(booking.estimated_subtotal),
    convenienceFee: Number(booking.convenience_fee),
    totalAmount: Number(booking.total_amount),
    paymentMethodId: booking.payment_method_id,
    status: booking.status,
    stationName: booking.station_name,
    stationArea: booking.station_area,
    createdAtISO: toIsoString(booking.created_at),
    updatedAtISO: toIsoString(booking.updated_at),
    cancelledAtISO: toIsoString(booking.cancelled_at),
  };
}

module.exports = {
  serializeStation,
  serializeSlot,
  serializeBooking,
};
