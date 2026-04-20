export function formatINR(amount: number) {
  // Keep it simple for mock data. Real app can use Intl.NumberFormat if desired.
  const rounded = Math.round(amount);
  return `₹${rounded.toLocaleString("en-IN")}`;
}

export function formatKm(km: number) {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(km >= 10 ? 0 : 1)} km`;
}

export function formatDateShort(date: Date) {
  const d = date.getDate();
  const m = date.toLocaleString("en-US", { month: "short" });
  return `${d} ${m}`;
}

export function formatDayDate(iso: string) {
  const date = new Date(iso);
  const day = date.toLocaleString("en-US", { weekday: "short" });
  const d = date.getDate();
  const m = date.toLocaleString("en-US", { month: "short" });
  return `${day}, ${m} ${d}`;
}

export function addMinutes(date: Date, minutes: number) {
  const copy = new Date(date);
  copy.setMinutes(copy.getMinutes() + minutes);
  return copy;
}

export function addHours(date: Date, hours: number) {
  return addMinutes(date, hours * 60);
}

export function toTimeLabel(date: Date) {
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

