import React, { useEffect, useMemo, useState } from "react";
import { Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "../../components/ui/ScreenContainer";
import { Colors, Radius } from "../../theme/theme";
import { useBooking } from "../../context/BookingContext";
import AppInput from "../../components/ui/AppInput";
import AppButton from "../../components/ui/AppButton";
import { formatINR, formatDayDate } from "../../utils/formatters";
import { isValidVehicleNumber, normalizeVehicleNumber } from "../../utils/validators";

export default function ParkingDetailsScreen({ route, navigation }: any) {
  const parkingId = route?.params?.parkingId as string | undefined;
  const { draft, startDraftForParking, setVehicleType, setVehicleNumber, selectMonthlyPlan } = useBooking();
  const [parking, setParking] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [planMode, setPlanMode] = useState<"timing" | "monthly">("timing");

  useEffect(() => {
    // TODO: Fetch parking details from backend API
    // const fetchParking = async () => {
    //   const response = await api.get(`/parking/${parkingId}`);
    //   setParking(response.data.data);
    // };
    // if (parkingId) fetchParking();
  }, [parkingId]);

  useEffect(() => {
    if (!parkingId) return;
    if (!draft || draft.parkingId !== parkingId) startDraftForParking(parkingId);
  }, [draft, parkingId, startDraftForParking]);

  if (!parking || !draft) {
    return (
      <ScreenContainer scroll={false}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.background }}>
          <Text style={{ fontWeight: "700", color: Colors.text }}>Loading…</Text>
        </View>
      </ScreenContainer>
    );
  }

  const vehicleType = draft.vehicleType ?? "car";
  const vehicleNumber = draft.vehicleNumber ?? "";

  const arrivalDay = draft.arrivalDateISO ? formatDayDate(draft.arrivalDateISO) : "Select date";
  const arrivalTime = draft.arrivalTimeLabel ?? "10:00 AM";
  const departureDay = draft.departureDateISO ? formatDayDate(draft.departureDateISO) : "Select date";
  const departureTime = draft.departureTimeLabel ?? "3:30 PM";

  const durationLabel = `${draft.durationHours ?? 0}h`;
  const estimatedPrice = formatINR(draft.totalAmount);

  const hourlyCar = parking.pricing.hourlyRate;
  const hourlyBike = Math.max(10, Math.round(hourlyCar * 0.6));

  const planA = parking.pricing.monthlyPlans[0];
  const planB = parking.pricing.monthlyPlans[1];

  return (
    <ScreenContainer scroll={false}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.hero}>
          <View style={styles.heroImage} accessibilityLabel="Parking image">
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
                {parking.location.area}
              </Text>
            </View>
          </View>

          <View style={styles.rateRow}>
            <PillMini label={`₹${hourlyBike}/hr`} />
            <PillMini label={`₹${hourlyCar}/hr`} />
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
            onChangeText={(t) => {
              setVehicleNumber(normalizeVehicleNumber(t));
              setError(null);
            }}
            placeholder="TN 00 XX 0000"
            autoCapitalize="characters"
            error={error && (!vehicleNumber || !isValidVehicleNumber(vehicleNumber)) ? error : null}
          />

          <View style={{ height: 12 }} />

          <Text style={styles.sectionTitle}>Booking Duration</Text>
          <View style={styles.durationGrid}>
            <DateTimeBox label="From" day={arrivalDay} time={arrivalTime} onPress={() => navigation.navigate("CalendarTimePicker")} />
            <DateTimeBox label="To" day={departureDay} time={departureTime} onPress={() => navigation.navigate("CalendarTimePicker")} />
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Total Duration</Text>
              <Text style={styles.metricValue}>{durationLabel}</Text>
            </View>
            <View style={styles.metric}>
              <Text style={styles.metricLabel}>Estimated Price</Text>
              <Text style={[styles.metricValue, { color: Colors.brandDark }]}>{estimatedPrice}</Text>
            </View>
          </View>

          <AppButton
            title="Book Parking"
            onPress={() => {
              const v = (draft.vehicleNumber ?? "").trim().toUpperCase();
              if (!v || !isValidVehicleNumber(v)) {
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

          <View style={styles.planModeRow}>
            <TouchableOpacity
              style={[styles.planModeButton, planMode === "timing" ? styles.planModeButtonActive : null]}
              onPress={() => {
                setPlanMode("timing");
                selectMonthlyPlan(null);
                setError(null);
              }}
              accessibilityRole="button"
              accessibilityLabel="Book by timing"
            >
              <Text style={[styles.planModeText, planMode === "timing" ? styles.planModeTextActive : null]}>By timing</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.planModeButton, planMode === "monthly" ? styles.planModeButtonActive : null]}
              onPress={() => {
                setPlanMode("monthly");
                if (!draft.selectedMonthlyPlanId && planA) selectMonthlyPlan(planA.id);
                setError(null);
              }}
              accessibilityRole="button"
              accessibilityLabel="Book monthly"
            >
              <Text style={[styles.planModeText, planMode === "monthly" ? styles.planModeTextActive : null]}>Monthly</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.planNote}>
            {planMode === "monthly"
              ? "Choose a monthly plan for ongoing parking access and savings."
              : "Select your duration above and book parking by hour/day. Monthly plan is optional."}
          </Text>

          <View style={styles.planCard}>
            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>Monthly Plan</Text>
              <View style={styles.savePill}>
                <Text style={styles.saveText}>Save 25%</Text>
              </View>
            </View>

            <View style={styles.planGrid}>
              {planA ? (
                <PlanOption
                  title={planA.label}
                  price={formatINR(planA.monthlyPrice)}
                  active={draft.selectedMonthlyPlanId === planA.id}
                  onPress={() => selectMonthlyPlan(planA.id)}
                />
              ) : null}
              {planB ? (
                <PlanOption
                  title={planB.label}
                  price={formatINR(planB.monthlyPrice)}
                  active={draft.selectedMonthlyPlanId === planB.id}
                  onPress={() => selectMonthlyPlan(planB.id)}
                />
              ) : null}
            </View>

            <View style={styles.planDivider} />

            {FEATURES.map((t) => (
              <View key={t} style={styles.featureRow}>
                <Ionicons name="checkmark-circle" size={16} color={Colors.brandDark} />
                <Text style={styles.featureText}>{t}</Text>
              </View>
            ))}

            <TouchableOpacity onPress={() => selectMonthlyPlan(null)} accessibilityRole="button" accessibilityLabel="Clear monthly plan">
              <Text style={styles.clearPlan}>Tap to select Monthly Plan</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const FEATURES = ["24/7 Access", "Reserved spot", "Cancel anytime"] as const;

function PillMini({ label }: { label: string }) {
  return (
    <View style={styles.ratePill}>
      <Text style={styles.rateText}>{label}</Text>
    </View>
  );
}

function SegmentButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={[styles.segmentBtn, active ? styles.segmentBtnActive : null]}>
      <Text style={[styles.segmentText, active ? styles.segmentTextActive : null]}>{label}</Text>
    </TouchableOpacity>
  );
}

function DateTimeBox({ label, day, time, onPress }: { label: string; day: string; time: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={styles.dtBox}>
      <Text style={styles.dtLabel}>{label}</Text>
      <Text style={styles.dtDay}>{day}</Text>
      <Text style={styles.dtTime}>{time}</Text>
    </TouchableOpacity>
  );
}

function PlanOption({ title, price, active, onPress }: { title: string; price: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} accessibilityRole="button" accessibilityLabel={title} style={[styles.planOption, active ? styles.planOptionActive : null]}>
      <Text style={styles.planOptionTitle} numberOfLines={1}>
        {title}
      </Text>
      <Text style={styles.planOptionSub}>Monthly cost</Text>
      <Text style={[styles.planOptionPrice, active ? { color: Colors.brandDark } : null]}>{price}</Text>
    </TouchableOpacity>
  );
}

const shadow =
  Platform.OS === "ios"
    ? { shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.08, shadowRadius: 10 }
    : { elevation: 4 };

const styles = StyleSheet.create({
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
  segmentBtn: { flex: 1, height: 44, alignItems: "center", justifyContent: "center", backgroundColor: Colors.surface },
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

  planCard: {
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(98,223,192,0.35)",
    backgroundColor: "rgba(98,223,192,0.10)",
    padding: 14,
  },
  planHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  planTitle: { fontWeight: "700", color: Colors.text, fontSize: 14 },
  savePill: {
    paddingHorizontal: 10,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#F97015",
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: { fontWeight: "700", fontSize: 10, color: "#FFFFFF" },
  planGrid: { flexDirection: "row", gap: 10, marginTop: 12 },
  planOption: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    backgroundColor: Colors.surface,
    padding: 12,
  },
  planOptionActive: { borderColor: Colors.brandDark },
  planOptionTitle: { fontWeight: "700", color: Colors.text, fontSize: 12 },
  planOptionSub: { marginTop: 6, fontWeight: "600", color: Colors.mutedText, fontSize: 10 },
  planOptionPrice: { marginTop: 6, fontWeight: "800", color: Colors.text, fontSize: 14 },
  planDivider: { height: 1, backgroundColor: "rgba(0,0,0,0.08)", marginVertical: 12 },
  planModeRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  planModeButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: "center",
  },
  planModeButtonActive: {
    backgroundColor: Colors.brandTint,
    borderColor: Colors.brand,
  },
  planModeText: { fontWeight: "700", color: Colors.mutedText },
  planModeTextActive: { color: Colors.brandDark },
  planNote: {
    marginTop: 12,
    color: Colors.mutedText,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 4 },
  featureText: { fontWeight: "700", color: Colors.mutedText, fontSize: 12 },
  clearPlan: { marginTop: 10, fontWeight: "700", color: Colors.mutedText, textAlign: "center", fontSize: 11 },
});

