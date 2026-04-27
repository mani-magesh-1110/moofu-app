import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import ScreenContainer from "../../components/ui/ScreenContainer";
import Header from "../../components/ui/Header";
import { Colors, Radius } from "../../theme/theme";
import { useBooking } from "../../context/BookingContext";
import CalendarPicker from "../../components/ui/CalendarPicker";
import { toTimeLabel } from "../../utils/formatters";

type Field = "arrival" | "departure";

function minutesToDate(dateISO: string, minutesFromMidnight: number) {
  const d = new Date(`${dateISO}T00:00:00`);
  d.setMinutes(minutesFromMidnight);
  return d;
}

function dateToISO(date: Date) {
  const y = date.getFullYear();
  const m = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getTodayISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function CalendarTimePickerScreen({ navigation }: any) {
  const { draft, setArrivalAndDeparture } = useBooking();

  const initialArrivalISO = draft?.arrivalDateISO ?? getTodayISO();
  const initialArrivalMinutes = useMemo(() => {
    // Default to 9:30 AM feel.
    return 9 * 60 + 30;
  }, []);

  const initialDepartureISO = draft?.departureDateISO ?? initialArrivalISO;
  const initialDepartureMinutes = useMemo(() => {
    const dep = initialArrivalMinutes + (draft?.durationHours ?? 2) * 60;
    return dep <= 20 * 60 ? dep : 20 * 60;
  }, [draft?.durationHours, initialArrivalMinutes]);

  const [activeField, setActiveField] = useState<Field>("arrival");

  const [arrivalISO, setArrivalISO] = useState(initialArrivalISO);
  const [arrivalMinutes, setArrivalMinutes] = useState(initialArrivalMinutes);
  const [departureISO, setDepartureISO] = useState(initialDepartureISO);
  const [departureMinutes, setDepartureMinutes] = useState(initialDepartureMinutes);

  const [arrivalHour, setArrivalHour] = useState(() => {
    const h = Math.floor(initialArrivalMinutes / 60);
    return h === 0 || h === 12 ? 12 : h % 12;
  });
  const [arrivalMinute, setArrivalMinute] = useState(() => String(initialArrivalMinutes % 60).padStart(2, "0"));
  const [arrivalPeriod, setArrivalPeriod] = useState(() => (initialArrivalMinutes >= 12 * 60 ? "PM" : "AM"));
  const [departureHour, setDepartureHour] = useState(() => {
    const h = Math.floor(initialDepartureMinutes / 60);
    return h === 0 || h === 12 ? 12 : h % 12;
  });
  const [departureMinute, setDepartureMinute] = useState(() => String(initialDepartureMinutes % 60).padStart(2, "0"));
  const [departurePeriod, setDeparturePeriod] = useState(() => (initialDepartureMinutes >= 12 * 60 ? "PM" : "AM"));

  const arrivalLabel = useMemo(() => toTimeLabel(minutesToDate(arrivalISO, arrivalMinutes)), [arrivalISO, arrivalMinutes]);
  const departureLabel = useMemo(() => toTimeLabel(minutesToDate(departureISO, departureMinutes)), [departureISO, departureMinutes]);

  const normalizeClock = (hour: number, minute: number, period: string) => {
    const normalizedHour = Math.max(1, Math.min(12, hour));
    const normalizedMinute = Math.max(0, Math.min(59, minute));
    let totalHours = normalizedHour % 12;
    if (period === "PM") totalHours += 12;
    return totalHours * 60 + normalizedMinute;
  };

  useEffect(() => {
    setArrivalMinutes(normalizeClock(arrivalHour, Number(arrivalMinute), arrivalPeriod));
  }, [arrivalHour, arrivalMinute, arrivalPeriod]);

  useEffect(() => {
    setDepartureMinutes(normalizeClock(departureHour, Number(departureMinute), departurePeriod));
  }, [departureHour, departureMinute, departurePeriod]);

  return (
    <ScreenContainer scroll={false} preset="surface">
      <View style={{ flex: 1 }}>
        <Header onBack={() => navigation.goBack()} title="Select date & time" brand={false} />

        <View style={styles.topFields}>
          <FieldPill
            label="Arrival"
            active={activeField === "arrival"}
            value={arrivalLabel}
            onPress={() => setActiveField("arrival")}
          />
          <FieldPill
            label="Departure"
            active={activeField === "departure"}
            value={departureLabel}
            onPress={() => setActiveField("departure")}
          />
        </View>

        <View style={{ flex: 1 }}>
          <CalendarPicker
            selectedDateISO={activeField === "arrival" ? arrivalISO : departureISO}
            onSelectedDateISOChange={(iso) => {
              if (activeField === "arrival") setArrivalISO(iso);
              else setDepartureISO(iso);
            }}
            selectedMinutesFromMidnight={activeField === "arrival" ? arrivalMinutes : departureMinutes}
            onSelectedMinutesFromMidnightChange={(minutes) => {
              if (activeField === "arrival") setArrivalMinutes(minutes);
              else setDepartureMinutes(minutes);
            }}
            confirmTitle="Save"
            onConfirm={() => {
              const aDate = minutesToDate(arrivalISO, arrivalMinutes);
              let dDate = minutesToDate(departureISO, departureMinutes);

              // Ensure departure is after arrival.
              if (dDate.getTime() <= aDate.getTime()) {
                dDate = new Date(dDate.getTime() + 24 * 60 * 60 * 1000);
              }

              setArrivalAndDeparture({
                arrivalDateISO: arrivalISO,
                arrivalTimeLabel: toTimeLabel(aDate),
                departureDateISO: dateToISO(dDate),
                departureTimeLabel: toTimeLabel(dDate),
              });
              navigation.goBack();
            }}
          />
        </View>
      </View>
    </ScreenContainer>
  );
}

function FieldPill({ label, value, active, onPress }: { label: string; value: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.fieldPill, active ? { borderColor: Colors.brandDark, backgroundColor: "rgba(79,211,194,0.10)" } : null]}
    >
      <Text style={[styles.fieldLabel, active ? { color: Colors.brandDark } : null]}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  topFields: { flexDirection: "row", gap: 10, paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12 },
  fieldPill: { flex: 1, borderRadius: Radius.lg, borderWidth: 1, borderColor: "rgba(15,23,42,0.10)", backgroundColor: Colors.background, padding: 12, gap: 6 },
  fieldLabel: { fontWeight: "900", color: Colors.mutedText, fontSize: 12 },
  fieldValue: { fontWeight: "900", color: Colors.text, fontSize: 13 },
  manualTimeRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginTop: 14 },
  manualColumn: { flex: 1 },
  periodColumn: { flex: 1 },
  manualLabel: { fontSize: 12, fontWeight: "700", color: Colors.mutedText, marginBottom: 6 },
  manualInput: { marginTop: 0 },
  periodRow: { flexDirection: "row", gap: 10 },
  periodButton: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    height: 42,
  },
  periodButtonActive: {
    backgroundColor: Colors.brandTint,
    borderColor: Colors.brand,
  },
  periodText: { fontWeight: "700", color: Colors.mutedText },
  periodTextActive: { color: Colors.brandDark },
});

