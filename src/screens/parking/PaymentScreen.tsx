import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Radius } from "../../theme/theme";
import { paymentMethods } from "../../data/mockData";
import PaymentMethodCard from "../../components/ui/PaymentMethodCard";
import AppButton from "../../components/ui/AppButton";
import { useBooking } from "../../context/BookingContext";
import { useToast } from "../../context/ToastContext";

export default function PaymentScreen({ navigation }: any) {
  const { draft, createBookingAndClearDraft } = useBooking();
  const { showToast } = useToast();

  const [selectedId, setSelectedId] = useState<(typeof paymentMethods)[number]["id"]>("google_pay");
  const [loading, setLoading] = useState(false);

  const missing =
    !draft ||
    !draft.parkingId ||
    !draft.vehicleType ||
    !draft.vehicleNumber ||
    !draft.arrivalDateISO ||
    !draft.arrivalTimeLabel ||
    !draft.departureDateISO ||
    !draft.departureTimeLabel;

  return (
    <View style={styles.overlay}>
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.sheetHeader}>
          <View>
            <Text style={styles.sheetTitle}>Select payment</Text>
            <Text style={styles.sheetSubtitle}>Pay from the bottom to complete booking.</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Close payment sheet" style={styles.closeBtn}>
            <Ionicons name="close" size={20} color={Colors.mutedText} />
          </TouchableOpacity>
        </View>

        <View style={{ gap: 10, marginTop: 8 }}>
          {paymentMethods.map((m) => (
            <PaymentMethodCard
              key={m.id}
              label={m.label}
              iconName={m.iconName}
              selected={selectedId === m.id}
              onPress={() => setSelectedId(m.id)}
            />
          ))}
        </View>

        <AppButton
          title={loading ? "" : "Confirm Booking"}
          onPress={async () => {
            if (missing) {
              showToast("Booking details are incomplete. Please go back.", "error");
              navigation.goBack();
              return;
            }
            if (!selectedId) {
              showToast("Select a payment method.", "error");
              return;
            }
            try {
              setLoading(true);
              await createBookingAndClearDraft(selectedId);
              showToast("Booking confirmed successfully!", "success");
              navigation.navigate("Success");
            } catch (error: any) {
              showToast(error.message || "Could not confirm booking. Try again.", "error");
            } finally {
              setLoading(false);
            }
          }}
          disabled={missing || loading}
          loading={loading}
          style={styles.confirmBtn}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.32)", justifyContent: "flex-end" },
  sheet: {
    paddingTop: 10,
    paddingHorizontal: 18,
    paddingBottom: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  handle: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(15,23,42,0.15)",
    alignSelf: "center",
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  sheetTitle: { fontSize: 18, fontWeight: "900", color: Colors.text },
  sheetSubtitle: { marginTop: 4, color: Colors.mutedText, fontSize: 13, maxWidth: "80%" },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.background,
  },
  confirmBtn: { height: 48, marginTop: 18 },
});

