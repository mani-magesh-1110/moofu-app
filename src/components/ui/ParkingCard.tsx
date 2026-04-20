import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, Radius } from "../../theme/theme";
import { ParkingLot } from "../../types/models";

type Props = {
  parking: ParkingLot;
  onPress: () => void;
};

export default function ParkingCard({ parking, onPress }: Props) {
  const availabilityPercentage = parking.totalSpots > 0 
    ? Math.round((parking.availableSpots / parking.totalSpots) * 100)
    : 0;
  const isAvailable = parking.availableSpots > 0;

  return (
    <TouchableOpacity
      activeOpacity={0.92}
      accessibilityRole="button"
      accessibilityLabel={`Parking: ${parking.name}`}
      onPress={onPress}
      style={styles.card}
    >
      <Text style={styles.name} numberOfLines={2}>
        {parking.name}
      </Text>

      <View style={styles.rowMid}>
        <Text style={styles.priceValue}>₹{parking.hourlyRate}/hr</Text>
        <Text style={styles.dot}>•</Text>
        <Text style={styles.distance}>{parking.area}</Text>
      </View>

      <View style={styles.rowBottom}>
        <Text style={[styles.open, isAvailable ? styles.openYes : styles.openNo]}>
          {isAvailable ? "Available" : "Full"}
        </Text>
        <Text style={styles.dot}>•</Text>
        <Text style={styles.avail} numberOfLines={1}>
          {parking.availableSpots}/{parking.totalSpots} spots ({availabilityPercentage}%)
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  name: { fontSize: 15, fontWeight: "700", color: Colors.text },
  rowMid: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  priceValue: { fontSize: 12, fontWeight: "700", color: Colors.brand },
  dot: { fontSize: 12, fontWeight: "700", color: Colors.mutedText },
  distance: { fontWeight: "700", color: Colors.mutedText, fontSize: 12 },
  rowBottom: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  open: { fontWeight: "700", fontSize: 12 },
  openYes: { color: "#27B07D" },
  openNo: { color: Colors.warning },
  avail: { flex: 1, fontWeight: "700", color: Colors.mutedText, fontSize: 12 },
});

