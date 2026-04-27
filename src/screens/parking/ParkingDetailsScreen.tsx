import React, { useEffect, useMemo, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "../../components/ui/ScreenContainer";
import { Colors } from "../../theme/theme";
import { useBooking } from "../../context/BookingContext";
import AppInput from "../../components/ui/AppInput";
import AppButton from "../../components/ui/AppButton";
import { formatINR, formatDayDate } from "../../utils/formatters";
import { isValidVehicleNumber, normalizeVehicleNumber } from "../../utils/validators";

export default function ParkingDetailsScreen({ route, navigation }: any) {
  const parkingId = route?.params?.parkingId as string | undefined;
  const { draft, startDraftForParking, setVehicleType, setVehicleNumber, parkingLots } = useBooking();
  const [error, setError] = useState<string | null>(null);

  const parking = useMemo(() => {
    if (!parkingId) return null;
    return parkingLots.find((item) => item.id === parkingId) ?? null;
  }, [parkingId, parkingLots]);

  useEffect(() => {
    if (!parkingId) return;
    if (!draft || draft.parkingId !== parkingId) {
      startDraftForParking(parkingId);
    }
  }, [draft, parkingId, startDraftForParking]);

  if (!parking || !draft) {
    return (
      <ScreenContainer scroll={false}>
        <View style={styles.loadingWrap}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </ScreenContainer>
    );
  }

  const vehicleType = draft.vehicleType ?? "car";
  const vehicleNumber = draft.vehicleNumber ?? "";
  const arrivalDay = draft.arrivalDateISO ? formatDayDate(draft.arrivalDateISO) : "Select date";
  const departureDay = draft.departureDateISO ? formatDayDate(draft.departureDateISO) : "Select date";
  const arrivalTime = draft.arrivalTimeLabel ?? "10:00 AM";
  const departureTime = draft.departureTimeLabel ?? "03:30 PM";
  const durationLabel = `${draft.durationHours ?? 0}h`;

  const hourlyCar = parking.hourlyRate;
  const hourlyBike = Math.max(10, Math.round(hourlyCar * 0.6));

  return (
    <ScreenContainer scroll={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.hero}>
          <View style={styles.heroImage}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Back"
              hitSlop={12}
              style={styles.heroBack}
            >
              <Ionicons name="arrow-back" size={18} color={Colors.text} />
            </TouchableOpacity>

            <View style={styles.heroOverlay}>
              <Text style={styles.heroName} numberOfLines={1}>
                {parking.name}
              </Text>
              <Text style={styles.heroAddr} numberOfLines={1}>
                {parking.area}
              </Text>
            </View>
          </View>

          <View style={styles.rateRow}>
            <PillMini label={`Rs ${hourlyBike}/hr`} />
            <PillMini label={`Rs ${hourlyCar}/hr`} />
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.sectionTitle}>Select Vehicle Type</Text>
          <View style={styles.segment}>
            <SegmentButton
              label="Bike"
              active={vehicleType === "bike"}
              onPress={() => {
                setVehicleType("bike");
                setError(null);
              }}
            />
            <SegmentButton
              label="Car"
              active={vehicleType === "car"}
              onPress={() => {
                setVehicleType("car");
                setError(null);
              }}
            />
          </View>

          <View style={{ height: 12 }} />

          <Text style={styles.sectionTitle}>Vehicle Number</Text>
          <AppInput
            value={vehicleNumber}
            onChangeText={(value) => {
              setVehicleNumber(normalizeVehicleNumber(value));
              setError(null);
            }}
            placeholder="TN 00 XX 0000"
            autoCapitalize="characters"
            error={error && (!vehicleNumber || !isValidVehicleNumber(vehicleNumber)) ? error : null}
          />

          <View style={{ height: 12 }} />

          <Text style={styles.sectionTitle}>Booking Duration</Text>
          <View style={styles.durationGrid}>
            <DateTimeBox
              label="From"
              day={arrivalDay}
              time={arrivalTime}
              onPress={() => navigation.navigate("CalendarTimePicker")}
            />
            <DateTimeBox
              label="To"
              day={departureDay}
              time={departureTime}
              onPress={() => navigation.navigate("CalendarTimePicker")}
            />
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Total Duration</Text>
              <Text style={styles.metricValue}>{durationLabel}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Estimated Price</Text>
              <Text style={[styles.metricValue, { color: Colors.brandDark }]}>
                {formatINR(draft.totalAmount)}
              </Text>
            </View>
          </View>

          <Text style={styles.note}>
            Final pricing is confirmed by the backend at booking time.
          </Text>

          <AppButton
            title="Book Parking"
            onPress={() => {
              const normalizedVehicleNumber = (draft.vehicleNumber ?? "").trim().toUpperCase();
              if (!normalizedVehicleNumber || !isValidVehicleNumber(normalizedVehicleNumber)) {
                setError("Enter a valid vehicle number.");
                return;
              }

              if (!draft.arrivalDateISO || !draft.arrivalTimeLabel || !draft.departureDateISO || !draft.departureTimeLabel) {
                setError("Select booking time.");
                return;
              }

              navigation.navigate("BookingSummary");
            }}
            style={{ marginTop: 12 }}
          />
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

function PillMini({ label }: { label: string }) {
  return (
    <View style={styles.ratePill}>
      <Text style={styles.rateText}>{label}</Text>
    </View>
  );
}

function SegmentButton({ label, active, onPress }: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.segmentBtn, active ? styles.segmentBtnActive : null]}
    >
      <Text style={[styles.segmentText, active ? styles.segmentTextActive : null]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function DateTimeBox({ label, day, time, onPress }: {
  label: string;
  day: string;
  time: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={styles.dtBox}>
      <Text style={styles.dtLabel}>{label}</Text>
      <Text style={styles.dtDay}>{day}</Text>
      <Text style={styles.dtTime}>{time}</Text>
    </TouchableOpacity>
  );
}

const shadow =
  Platform.OS === "ios"
    ? { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10 }
    : { elevation: 4 };

const styles = StyleSheet.create({
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
  loadingText: { fontWeight: "700", color: Colors.text },
  hero: { backgroundColor: Colors.background },
  heroImage: {
    height: 180,
    backgroundColor: "#111827",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    overflow: "hidden",
    justifyContent: "flex-end",
  },
  heroBack: {
    position: "absolute",
    top: 14,
    left: 14,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.90)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroOverlay: { paddingHorizontal: 16, paddingBottom: 14 },
  heroName: { fontWeight: "700", color: "#FFFFFF", fontSize: 16 },
  heroAddr: { marginTop: 4, fontWeight: "600", color: "rgba(255,255,255,0.85)", fontSize: 12 },
  rateRow: { flexDirection: "row", gap: 10, paddingHorizontal: 16, marginTop: -16 },
  ratePill: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    ...shadow,
  },
  rateText: { fontWeight: "700", color: Colors.text, fontSize: 12 },
  body: { paddingHorizontal: 16, paddingTop: 16 },
  sectionTitle: { fontWeight: "700", color: Colors.text, fontSize: 13, marginTop: 10 },
  segment: {
    marginTop: 10,
    flexDirection: "row",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: "hidden",
    backgroundColor: Colors.surface,
  },
  segmentBtn: {
    flex: 1,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.surface,
  },
  segmentBtnActive: { backgroundColor: Colors.brandTint, borderWidth: 1, borderColor: Colors.brand },
  segmentText: { fontWeight: "700", color: Colors.mutedText, fontSize: 13 },
  segmentTextActive: { color: Colors.brandDark },
  durationGrid: { flexDirection: "row", gap: 10, marginTop: 10 },
  dtBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    padding: 12,
  },
  dtLabel: { fontWeight: "700", color: Colors.mutedText, fontSize: 10 },
  dtDay: { marginTop: 8, fontWeight: "700", color: Colors.text, fontSize: 12 },
  dtTime: { marginTop: 4, fontWeight: "700", color: Colors.mutedText, fontSize: 11 },
  metricsRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 12 },
  metric: { flex: 1 },
  metricLabel: { fontWeight: "600", color: Colors.mutedText, fontSize: 11 },
  metricValue: { marginTop: 4, fontWeight: "700", color: Colors.text, fontSize: 13 },
  note: {
    marginTop: 14,
    color: Colors.mutedText,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
});
