import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Booking, BookingDraft, ParkingLot, PaymentMethodId, VehicleTypeId } from "../types/models";
import { parkingAPI, bookingAPI } from "../services/api";

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
  setDurationHours: (hours: number) => void;
  setArrivalAndDeparture: (args: { arrivalDateISO: string; arrivalTimeLabel: string; departureDateISO: string; departureTimeLabel: string }) => void;
  selectMonthlyPlan: (monthlyPlanId: string | null) => void;
  setDraftParkingId: (parkingId: string) => void;
  createBookingAndClearDraft: (paymentMethodId: PaymentMethodId) => Promise<Booking | null>;
};

type StoredBookingState = {
  lastBooking: Booking | null;
};

const BookingContext = createContext<BookingContextValue | null>(null);

function getParkingById(parkingId: string, parkingLots: ParkingLot[]): ParkingLot | null {
  return parkingLots.find((p) => p.id === parkingId) ?? null;
}

function computeTotals(parking: any, draft: BookingDraft) {
  const durationHours = Math.max(1, draft.durationHours || 1);
  const convenienceFee = parking.convenienceFee;
  const baseSubtotal = parking.hourlyRate * durationHours;

  if (draft.selectedMonthlyPlanId && parking.monthlyPlans) {
    const plan = parking.monthlyPlans.find((m: any) => m.id === draft.selectedMonthlyPlanId);
    if (plan) {
      const monthlyHourly = plan.price / (30 * 24);
      const discounted = monthlyHourly * durationHours;
      const estimatedSubtotal = Math.max(discounted, parking.hourlyRate * durationHours * 0.5);
      const totalAmount = estimatedSubtotal + convenienceFee;
      return { estimatedSubtotal, convenienceFee, totalAmount };
    }
  }

  const totalAmount = baseSubtotal + convenienceFee;
  return { estimatedSubtotal: baseSubtotal, convenienceFee, totalAmount };
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

    // Fetch parking lots from backend API
    const fetchParkings = async () => {
      try {
        const response = await parkingAPI.getAllParkings();
        if (response.spaces) {
          // Transform backend response to match ParkingLot type
          const transformed = response.spaces.map((space: any) => ({
            id: space.id,
            name: space.name,
            area: space.area,
            hourlyRate: space.hourlyRate,
            convenienceFee: space.convenienceFee || 0,
            monthlyPlans: space.monthlyPlans || [],
            availableSpots: space.availableSpots || 0,
            totalSpots: space.totalSpots || 0,
          }));
          setParkingLots(transformed);
        }
      } catch (error) {
        console.error("[BookingContext] Failed to fetch parkings:", error);
      }
    };
    fetchParkings();
  }, []);

  const persist = useCallback(async (next: StoredBookingState) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  const startDraftForParking = useCallback((parkingId: string) => {
    const parking = getParkingById(parkingId, parkingLots);
    if (!parking) return;
    const base: BookingDraft = {
      parkingId,
      vehicleType: "bike",
      vehicleNumber: "",
      arrivalDateISO: null,
      arrivalTimeLabel: null,
      departureDateISO: null,
      departureTimeLabel: null,
      durationHours: 2,
      selectedMonthlyPlanId: null,
      estimatedSubtotal: (parking as any).hourlyRate * 2,
      convenienceFee: (parking as any).convenienceFee,
      totalAmount: (parking as any).hourlyRate * 2 + (parking as any).convenienceFee,
    };
    setDraft(base);
  }, [parkingLots]);

  const clearDraft = useCallback(() => setDraft(null), []);

  const setDraftParkingId = useCallback(
    (parkingId: string) => {
      if (!draft) return;
      setDraft((prev) => (prev ? { ...prev, parkingId } : prev));
    },
    [draft]
  );

  const recalc = useCallback(
    (nextDraft: BookingDraft) => {
      const parking = getParkingById(nextDraft.parkingId, parkingLots);
      if (!parking) return nextDraft;
      const totals = computeTotals(parking, nextDraft);
      return { ...nextDraft, ...totals };
    },
    [parkingLots]
  );

  const setVehicleType = useCallback(
    (type: VehicleTypeId) => {
      setDraft((prev) => (prev ? recalc({ ...prev, vehicleType: type }) : prev));
    },
    [recalc]
  );

  const setVehicleNumber = useCallback(
    (vehicleNumber: string) => {
      setDraft((prev) => (prev ? { ...prev, vehicleNumber } : prev));
    },
    []
  );

  const setDurationHours = useCallback(
    (hours: number) => {
      setDraft((prev) => (prev ? recalc({ ...prev, durationHours: Math.max(1, Math.round(hours)) }) : prev));
    },
    [recalc]
  );

  const setArrivalAndDeparture = useCallback((args: any) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const nextDraft = {
        ...prev,
        arrivalDateISO: args.arrivalDateISO,
        arrivalTimeLabel: args.arrivalTimeLabel,
        departureDateISO: args.departureDateISO,
        departureTimeLabel: args.departureTimeLabel,
      };

      // Duration is computed from labels/dates for demo simplicity:
      // If we can't compute exact diff, keep draft.durationHours as-is.
      return nextDraft;
    });
  }, []);

  const selectMonthlyPlan = useCallback(
    (monthlyPlanId: string | null) => {
      setDraft((prev) => (prev ? recalc({ ...prev, selectedMonthlyPlanId: monthlyPlanId }) : prev));
    },
    [recalc]
  );

  const createBookingAndClearDraft = useCallback(
    async (paymentMethodId: PaymentMethodId) => {
      if (!draft) return null;
      if (!draft.vehicleType) return null; // Vehicle type is required
      const parking = getParkingById(draft.parkingId, parkingLots);
      if (!parking) return null;

      try {
        // Call backend API to create booking
        const response = await bookingAPI.createBooking({
          parkingId: draft.parkingId,
          vehicleType: draft.vehicleType,
          vehicleNumber: draft.vehicleNumber,
          arrivalDateISO: draft.arrivalDateISO,
          arrivalTimeLabel: draft.arrivalTimeLabel,
          departureDateISO: draft.departureDateISO,
          departureTimeLabel: draft.departureTimeLabel,
          durationHours: draft.durationHours,
          selectedMonthlyPlanId: draft.selectedMonthlyPlanId,
          estimatedSubtotal: draft.estimatedSubtotal,
          convenienceFee: draft.convenienceFee,
          totalAmount: draft.totalAmount,
          paymentMethodId,
        });

        const booking: Booking = {
          id: response.id,
          tokenNo: response.tokenNo || `TN${Math.floor(100000 + Math.random() * 899999)}`,
          createdAtISO: response.createdAtISO || new Date().toISOString(),
          paymentMethodId,
          ...draft,
        };

        setLastBooking(booking);
        await persist({ lastBooking: booking });
        setDraft(null);
        return booking;
      } catch (error: any) {
        const message = error.message || "Failed to create booking";
        console.error("[BookingContext] createBookingAndClearDraft error:", message);
        throw new Error(message);
      }
    },
    [draft, parkingLots, persist]
  );

  const cancelLastBooking = useCallback(
    async (bookingId?: string) => {
      const idToCancel = bookingId || lastBooking?.id;
      if (!idToCancel) return;

      try {
        // Call backend API to cancel booking
        await bookingAPI.cancelBooking(idToCancel);
        setLastBooking(null);
        await persist({ lastBooking: null });
      } catch (error: any) {
        const message = error.message || "Failed to cancel booking";
        console.error("[BookingContext] cancelLastBooking error:", message);
        // Still clear local state even if API fails
        setLastBooking(null);
        await persist({ lastBooking: null });
        throw new Error(message);
      }
    },
    [lastBooking, persist]
  );

  const value = useMemo<BookingContextValue>(
    () => ({
      draft,
      lastBooking,
      parkingLots,
      startDraftForParking,
      clearDraft,
      cancelLastBooking,
      setVehicleType,
      setVehicleNumber,
      setDurationHours,
      setArrivalAndDeparture,
      selectMonthlyPlan,
      setDraftParkingId,
      createBookingAndClearDraft,
    }),
    [draft, lastBooking, parkingLots, startDraftForParking, clearDraft, setVehicleType, setVehicleNumber, setDurationHours, setArrivalAndDeparture, selectMonthlyPlan, setDraftParkingId, createBookingAndClearDraft]
  );

  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const ctx = useContext(BookingContext);
  if (!ctx) throw new Error("useBooking must be used within BookingProvider");
  return ctx;
}

