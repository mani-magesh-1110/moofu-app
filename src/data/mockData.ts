import { BookingDraft, ComingSoonService, ParkingLot, PaymentMethod, ProfileSetting, Service } from "../types/models";

export const services: Service[] = [
  {
    id: "parking",
    title: "Parking",
    description: "Book a spot in seconds",
    badge: { text: "Active", tone: "success" },
  },
  {
    id: "car_rent",
    title: "Car rent",
    description: "Choose a ride, drive away",
    badge: { text: "Coming Soon", tone: "warning" },
  },
  {
    id: "driver",
    title: "Driver",
    description: "Verified local drivers",
    badge: { text: "Coming Soon", tone: "warning" },
  },
];

export const comingSoonServices: ComingSoonService[] = [
  {
    id: "car_rent",
    title: "Car Rent",
    subtitle: "Reliable vehicles. Simple booking.",
  },
  {
    id: "driver",
    title: "Driver",
    subtitle: "Trusted drivers for your convenience.",
  },
];

export const paymentMethods: PaymentMethod[] = [
  { id: "google_pay", label: "Google pay", iconName: "logo-google" },
  { id: "phonepe", label: "PhonePe", iconName: "phone-portrait-outline" },
  { id: "paytm", label: "Paytm", iconName: "cash-outline" },
];

export const profileSettings: ProfileSetting[] = [
  { id: "promotions", label: "Promotions and offers", enabled: true },
  { id: "updates_sort_offers", label: "Updates on sort and offers", enabled: true },
  { id: "product_updates", label: "Product updates", enabled: false },
];

// Mock parking lots for development when backend is not available
export const mockParkingLots: ParkingLot[] = [
  {
    id: "lot_1",
    name: "Downtown Garage",
    area: "Downtown",
    hourlyRate: 50,
    convenienceFee: 10,
    availableSpots: 24,
    totalSpots: 100,
    monthlyPlans: [
      { id: "plan_1", name: "Monthly Pass", price: 1500 },
    ],
  },
  {
    id: "lot_2",
    name: "Airport Parking",
    area: "Airport",
    hourlyRate: 75,
    convenienceFee: 15,
    availableSpots: 45,
    totalSpots: 200,
    monthlyPlans: [
      { id: "plan_2", name: "Monthly Pass", price: 2000 },
    ],
  },
  {
    id: "lot_3",
    name: "Mall Parking",
    area: "Shopping District",
    hourlyRate: 35,
    convenienceFee: 5,
    availableSpots: 60,
    totalSpots: 250,
    monthlyPlans: [
      { id: "plan_3", name: "Monthly Pass", price: 1000 },
    ],
  },
];

