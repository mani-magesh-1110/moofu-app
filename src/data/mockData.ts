import { BookingDraft, ComingSoonService, PaymentMethod, ProfileSetting, Service } from "../types/models";

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

