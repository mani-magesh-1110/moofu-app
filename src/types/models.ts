export type ServiceId = "parking" | "car_rent" | "driver";

export type VehicleTypeId = "car" | "bike";

export interface User {
  id: string;
  name: string;
  phone: string; // digits only (10 digits for demo)
  location: string;
  vehicleNumber: string;
}

export interface Service {
  id: ServiceId;
  title: string;
  description: string;
  badge?: { text: string; tone: "success" | "muted" | "warning" };
}

export interface ParkingSpot {
  id: string;
  spotNumber: string;
  vehicleTypeAllowed: VehicleTypeId[];
}

export interface ParkingLot {
  id: string;
  name: string;
  area: string;
  hourlyRate: number;
  convenienceFee: number;
  monthlyPlans?: Array<{ id: string; name: string; price: number }>;
  availableSpots: number;
  totalSpots: number;
}

export interface VehicleType {
  id: VehicleTypeId;
  label: string;
}

export type PaymentMethodId = "google_pay" | "phonepe" | "paytm";

export interface PaymentMethod {
  id: PaymentMethodId;
  label: string;
  iconName: string;
}

export interface TimeSlot {
  id: string;
  label: string; // "08:30 AM"
  // minutes from day start in local time
  minutesFromMidnight: number;
}

export interface ComingSoonService {
  id: "car_rent" | "driver";
  title: string;
  subtitle: string;
}

export interface ProfileSetting {
  id: "promotions" | "updates_sort_offers" | "product_updates";
  label: string;
  enabled: boolean;
}

export interface BookingDraft {
  parkingId: string;
  vehicleType: VehicleTypeId | null;
  vehicleNumber: string;
  arrivalDateISO: string | null; // yyyy-mm-dd
  arrivalTimeLabel: string | null;
  departureDateISO: string | null;
  departureTimeLabel: string | null;
  durationHours: number;
  estimatedSubtotal: number;
  convenienceFee: number;
  totalAmount: number;
}

export interface Booking extends BookingDraft {
  id: string;
  tokenNo: string;
  paymentMethodId: PaymentMethodId;
  startTime: string;
  endTime: string;
  status: "confirmed" | "cancelled";
  createdAtISO: string;
}

