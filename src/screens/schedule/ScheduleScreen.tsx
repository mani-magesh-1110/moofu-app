import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "../../components/ui/ScreenContainer";
import { Colors, Radius } from "../../theme/theme";
import { useBooking } from "../../context/BookingContext";
import { useToast } from "../../context/ToastContext";
import AppButton from "../../components/ui/AppButton";

export default function ScheduleScreen() {
  const { lastBooking, cancelLastBooking } = useBooking();
  const { showToast } = useToast();

  const handleCancel = async () => {
    try {
      await cancelLastBooking();
      showToast("Booking cancelled.", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to cancel booking", "error");
    }
  };

  return (
    <ScreenContainer scroll={false}>
      <View style={styles.inner}>
        <View style={styles.iconWrap}>
          <Ionicons name="calendar-outline" size={40} color={Colors.brand} />
        </View>
        <Text style={styles.title}>Schedule</Text>
        <Text style={styles.sub}>Your active parking bookings and reminders appear here.</Text>

        {lastBooking ? (
          <View style={styles.bookingCard}> 
            <Text style={styles.bookingCardTitle}>Upcoming Booking</Text>
            <View style={styles.bookingDetailRow}>
              <Text style={styles.bookingLabel}>Token No</Text>
              <Text style={styles.bookingValue}>{lastBooking.tokenNo}</Text>
            </View>
            <View style={styles.bookingDetailRow}>
              <Text style={styles.bookingLabel}>Vehicle</Text>
              <Text style={styles.bookingValue}>{lastBooking.vehicleNumber}</Text>
            </View>
            <View style={styles.bookingDetailRow}>
              <Text style={styles.bookingLabel}>Arrival</Text>
              <Text style={styles.bookingValue}>{lastBooking.arrivalTimeLabel}</Text>
            </View>
            <View style={styles.bookingDetailRow}>
              <Text style={styles.bookingLabel}>Departure</Text>
              <Text style={styles.bookingValue}>{lastBooking.departureTimeLabel}</Text>
            </View>
            <View style={styles.bookingDetailRow}>
              <Text style={styles.bookingLabel}>Duration</Text>
              <Text style={styles.bookingValue}>{lastBooking.durationHours} hrs</Text>
            </View>
            <View style={{ marginTop: 18 }}>
              <AppButton title="Cancel Booking" variant="secondary" onPress={handleCancel} />
            </View>
          </View>
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No scheduled bookings yet</Text>
            <Text style={styles.emptyText}>Book parking from the home page and it will appear here.</Text>
          </View>
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  inner: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 48,
    alignItems: "center",
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: Radius.lg,
    backgroundColor: Colors.brandTint,
    alignItems: "center",
    justifyContent: "center",
  },
  title: { marginTop: 20, fontSize: 22, fontWeight: "900", color: Colors.text },
  sub: { marginTop: 10, fontSize: 14, fontWeight: "600", color: Colors.mutedText, textAlign: "center", lineHeight: 20 },
  bookingCard: {
    marginTop: 20,
    padding: 18,
    backgroundColor: Colors.surface,
    borderRadius: Radius.md,
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  bookingCardTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: Colors.text,
    marginBottom: 14,
  },
  bookingDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  bookingLabel: {
    fontSize: 13,
    color: Colors.mutedText,
    fontWeight: "700",
  },
  bookingValue: {
    fontSize: 13,
    color: Colors.text,
    fontWeight: "900",
  },
  emptyCard: {
    marginTop: 22,
    padding: 24,
    width: "100%",
    borderRadius: Radius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: Colors.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.mutedText,
    textAlign: "center",
    lineHeight: 20,
  },
});
