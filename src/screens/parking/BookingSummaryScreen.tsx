import React, { useMemo, useState, useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import ScreenContainer from "../../components/ui/ScreenContainer";
import Header from "../../components/ui/Header";
import { Colors, Radius } from "../../theme/theme";
import { useBooking } from "../../context/BookingContext";
import AppButton from "../../components/ui/AppButton";
import SummaryRow from "../../components/ui/SummaryRow";
import { formatINR } from "../../utils/formatters";

export default function BookingSummaryScreen({ navigation }: any) {
  const { draft } = useBooking();
  const [parking, setParking] = useState<any>(null);

  useEffect(() => {
    // TODO: Fetch parking details from backend API using draft.parkingId
    // const fetchParking = async () => {
    //   const response = await api.get(`/parking/${draft?.parkingId}`);
    //   setParking(response.data.data);
    // };
    // if (draft) fetchParking();
  }, [draft]);

  if (!draft || !parking) {
    return (
      <ScreenContainer scroll={true}>
        <View style={styles.wrap}>
          <Text style={styles.text}>Missing booking draft.</Text>
          <Text style={styles.sub}>Go back and try again.</Text>
        </View>
      </ScreenContainer>
    );
  }

  const missing =
    !draft.vehicleType ||
    !draft.vehicleNumber ||
    !draft.arrivalDateISO ||
    !draft.arrivalTimeLabel ||
    !draft.departureDateISO ||
    !draft.departureTimeLabel ||
    !draft.parkingId;

  const durationLabel = `${draft.durationHours} hr${draft.durationHours === 1 ? "" : "s"}`;
  const vehicleTypeLabel = draft.vehicleType === "bike" ? "Bike" : "Car";

  return (
    <ScreenContainer scroll={false} preset="surface">
      <View style={{ flex: 1, paddingHorizontal: 16 }}>
        <Header onBack={() => navigation.goBack()} title="Parking" brand={false} />

        <View style={styles.card}>
          <Text style={styles.title}>Booking Summary</Text>

          <View style={{ height: 10 }} />

          <SummaryRow label="Parking Name" value={parking.name} />
          <SummaryRow label="Vehicle type" value={vehicleTypeLabel} />
          <SummaryRow label="Vehicle Number" value={draft.vehicleNumber || "—"} />
          <SummaryRow label="Location" value={`${parking.location.area}, ${parking.location.city}`} />
          <SummaryRow label="Arrival Time" value={draft.arrivalTimeLabel ?? "—"} />
          <SummaryRow label="Departure Time" value={draft.departureTimeLabel ?? "—"} />
          <SummaryRow label="Duration / Days" value={durationLabel} />
          <SummaryRow label="Charges" value={formatINR(draft.estimatedSubtotal)} />
          <SummaryRow label="Convenience fees" value={formatINR(draft.convenienceFee)} />

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Amount</Text>
            <Text style={styles.totalValue}>{formatINR(draft.totalAmount)}</Text>
          </View>
        </View>

        <View style={{ flex: 1 }} />

        {missing ? (
          <AppButton title="Go back" onPress={() => navigation.goBack()} variant="secondary" />
        ) : (
          <AppButton title="Book" onPress={() => navigation.navigate("Payment")} accessibilityLabel="Proceed to payment" style={{ height: 44 }} />
        )}

        <View style={{ height: 18 }} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 8, paddingHorizontal: 20 },
  text: { fontWeight: "900", color: Colors.text, fontSize: 16, textAlign: "center" },
  sub: { fontWeight: "800", color: Colors.mutedText, textAlign: "center" },
  card: {
    marginTop: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    padding: 16,
  },
  title: { fontWeight: "700", color: Colors.text, fontSize: 14, textAlign: "center" },
  divider: { height: 1, backgroundColor: "rgba(0,0,0,0.08)", marginVertical: 8 },
  totalRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingTop: 6 },
  totalLabel: { fontWeight: "700", color: Colors.text, fontSize: 12 },
  totalValue: { fontWeight: "800", color: Colors.text, fontSize: 12 },
});

