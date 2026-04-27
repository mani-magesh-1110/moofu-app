import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Booking, BookingDraft, ParkingLot, PaymentMethodId, VehicleTypeId } from "../types/models";
import { bookingAPI, parkingAPI } from "../services/api";
import { toTimeLabel } from "../utils/formatters";

const STORAGE_KEY = "moofu_booking_v1";

type BookingContextValue = {
  draft: BookingDraft | null;
  lastBooking: Booking | null;
  parkingLots: ParkingLot[];
  startDraftForParking: (parkingId: string) => void;
  clearDraft: () => void;
  cancelLastBooking: (bookingId?: string) => Promise<void>;
  setVehicleType: (type: VehicleTypeId) => void;
  setVehicleNumber: (vehicleNumber: string) => void;
  setArrivalAndDeparture: (args: {
    arrivalDateISO: string;
    arrivalTimeLabel: string;
    departureDateISO: string;
    departureTimeLabel: string;
  }) => void;
  setDraftParkingId: (parkingId: string) => void;
  createBookingAndClearDraft: (paymentMethodId: PaymentMethodId) => Promise<Booking | null>;
};

type StoredBookingState = {
  lastBooking: Booking | null;
};

const BookingContext = createContext<BookingContextValue | null>(null);

function getParkingById(parkingId: string, parkingLots: ParkingLot[]) {
  return parkingLots.find((parking) => parking.id === parkingId) ?? null;
}

function getLocalDateISO(date: Date) {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function timeLabelToISOString(dateISO: string, timeLabel: string) {
  const [timePart, periodPart] = timeLabel.trim().split(" ");
  const [hourPart, minutePart] = timePart.split(":");

  let hours = Number(hourPart);
  const minutes = Number(minutePart);
  const period = periodPart.toUpperCase();

  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;

  const [year, month, day] = dateISO.split("-").map(Number);
  return new Date(year, month - 1, day, hours, minutes, 0, 0).toISOString();
}

function getDurationHoursFromWindow(startTime: string, endTime: string) {
  const start = new Date(startTime);
  const end = new Date(endTime);
  return Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (60 * 60 * 1000)));
}

function getVehicleHourlyRate(parking: ParkingLot, vehicleType: VehicleTypeId | null) {
  if (vehicleType === "bike") {
    return Math.max(10, Math.round(parking.hourlyRate * 0.6));
  }

  return parking.hourlyRate;
}

function computeTotals(parking: ParkingLot, draft: BookingDraft) {
  const durationHours = Math.max(1, draft.durationHours || 1);
  const convenienceFee = parking.convenienceFee;
  const estimatedSubtotal = getVehicleHourlyRate(parking, draft.vehicleType) * durationHours;
  const totalAmount = estimatedSubtotal + convenienceFee;

  return { estimatedSubtotal, convenienceFee, totalAmount };
}

function buildBookingFromResponse(response: any, fallbackPaymentMethodId: PaymentMethodId): Booking {
  const startTime = response.startTime;
  const endTime = response.endTime;
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);

  return {
    id: response.id,
    tokenNo: response.tokenNo,
    parkingId: response.parkingId,
    vehicleType: response.vehicleType,
    vehicleNumber: response.vehicleNumber,
    arrivalDateISO: getLocalDateISO(startDate),
    arrivalTimeLabel: toTimeLabel(startDate),
    departureDateISO: getLocalDateISO(endDate),
    departureTimeLabel: toTimeLabel(endDate),
    durationHours: response.durationHours,
    estimatedSubtotal: response.estimatedSubtotal,
    convenienceFee: response.convenienceFee,
    totalAmount: response.totalAmount,
    paymentMethodId: response.paymentMethodId || fallbackPaymentMethodId,
    startTime,
    endTime,
    status: response.status || "confirmed",
    createdAtISO: response.createdAtISO || new Date().toISOString(),
  };
}

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [draft, setDraft] = useState<BookingDraft | null>(null);
  const [lastBooking, setLastBooking] = useState<Booking | null>(null);
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed = JSON.parse(raw) as StoredBookingState;
        setLastBooking(parsed.lastBooking ?? null);
      } catch {
        // ignore
      }
    })();

    (async () => {
      try {
        const response = await parkingAPI.getAllParkings();
        const transformed = (response.spaces || []).map((space: any) => ({
          id: space.id,
          name: space.name,
          area: space.area,
          hourlyRate: Number(space.hourlyRate),
          convenienceFee: Number(space.convenienceFee || 0),
          availableSpots: Number(space.availableSpots || 0),
          totalSpots: Number(space.totalSpots || 0),
        }));

        setParkingLots(transformed);
      } catch (error) {
        console.error("[BookingContext] Failed to fetch parkings:", error);
      }
    })();
  }, []);

  const persist = useCallback(async (next: StoredBookingState) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const startDraftForParking = useCallback((parkingId: string) => {
    const parking = getParkingById(parkingId, parkingLots);
    if (!parking) return;

    const baseDraft: BookingDraft = {
      parkingId,
      vehicleType: "bike",
      vehicleNumber: "",
      arrivalDateISO: null,
      arrivalTimeLabel: null,
      departureDateISO: null,
      departureTimeLabel: null,
      durationHours: 2,
      estimatedSubtotal: getVehicleHourlyRate(parking, "bike") * 2,
      convenienceFee: parking.convenienceFee,
      totalAmount: getVehicleHourlyRate(parking, "bike") * 2 + parking.convenienceFee,
    };

    setDraft(baseDraft);
  }, [parkingLots]);

  const clearDraft = useCallback(() => {
    setDraft(null);
  }, []);

  const setDraftParkingId = useCallback((parkingId: string) => {
    setDraft((prev) => (prev ? { ...prev, parkingId } : prev));
  }, []);

  const recalc = useCallback((nextDraft: BookingDraft) => {
    const parking = getParkingById(nextDraft.parkingId, parkingLots);
    if (!parking) return nextDraft;

    return {
      ...nextDraft,
      ...computeTotals(parking, nextDraft),
    };
  }, [parkingLots]);

  const setVehicleType = useCallback((type: VehicleTypeId) => {
    setDraft((prev) => (prev ? recalc({ ...prev, vehicleType: type }) : prev));
  }, [recalc]);

  const setVehicleNumber = useCallback((vehicleNumber: string) => {
    setDraft((prev) => (prev ? { ...prev, vehicleNumber } : prev));
  }, []);

  const setArrivalAndDeparture = useCallback((args: {
    arrivalDateISO: string;
    arrivalTimeLabel: string;
    departureDateISO: string;
    departureTimeLabel: string;
  }) => {
    setDraft((prev) => {
      if (!prev) return prev;

      const startTime = timeLabelToISOString(args.arrivalDateISO, args.arrivalTimeLabel);
      const endTime = timeLabelToISOString(args.departureDateISO, args.departureTimeLabel);

      return recalc({
        ...prev,
        arrivalDateISO: args.arrivalDateISO,
        arrivalTimeLabel: args.arrivalTimeLabel,
        departureDateISO: args.departureDateISO,
        departureTimeLabel: args.departureTimeLabel,
        durationHours: getDurationHoursFromWindow(startTime, endTime),
      });
    });
  }, [recalc]);

  const createBookingAndClearDraft = useCallback(async (paymentMethodId: PaymentMethodId) => {
    if (!draft || !draft.vehicleType) return null;
    if (!draft.arrivalDateISO || !draft.arrivalTimeLabel || !draft.departureDateISO || !draft.departureTimeLabel) {
      return null;
    }

    try {
      const response = await bookingAPI.createBooking({
        parkingId: draft.parkingId,
        vehicleType: draft.vehicleType,
        vehicleNumber: draft.vehicleNumber,
        startTime: timeLabelToISOString(draft.arrivalDateISO, draft.arrivalTimeLabel),
        endTime: timeLabelToISOString(draft.departureDateISO, draft.departureTimeLabel),
        paymentMethodId,
      });

      const booking = buildBookingFromResponse(response, paymentMethodId);
      setLastBooking(booking);
      await persist({ lastBooking: booking });
      setDraft(null);
      return booking;
    } catch (error: any) {
      const message = error.message || "Failed to create booking";
      console.error("[BookingContext] createBookingAndClearDraft error:", message);
      throw new Error(message);
    }
  }, [draft, persist]);

  const cancelLastBooking = useCallback(async (bookingId?: string) => {
    const idToCancel = bookingId || lastBooking?.id;
    if (!idToCancel) return;

    try {
      await bookingAPI.cancelBooking(idToCancel);
      setLastBooking(null);
      await persist({ lastBooking: null });
    } catch (error: any) {
      const message = error.message || "Failed to cancel booking";
      console.error("[BookingContext] cancelLastBooking error:", message);
      setLastBooking(null);
      await persist({ lastBooking: null });
      throw new Error(message);
    }
  }, [lastBooking, persist]);

  const value = useMemo<BookingContextValue>(() => ({
    draft,
    lastBooking,
    parkingLots,
    startDraftForParking,
    clearDraft,
    cancelLastBooking,
    setVehicleType,
    setVehicleNumber,
    setArrivalAndDeparture,
    setDraftParkingId,
    createBookingAndClearDraft,
  }), [
    draft,
    lastBooking,
    parkingLots,
    startDraftForParking,
    clearDraft,
    cancelLastBooking,
    setVehicleType,
    setVehicleNumber,
    setArrivalAndDeparture,
    setDraftParkingId,
    createBookingAndClearDraft,
  ]);

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}
