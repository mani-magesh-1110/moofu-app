import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, Radius } from "../../theme/theme";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  label: string;
  iconName: string;
  selected?: boolean;
  onPress: () => void;
};

export default function PaymentMethodCard({ label, iconName, selected, onPress }: Props) {
  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      style={[styles.card, selected ? styles.cardSelected : null]}
    >
      <Text style={styles.label}>{label}</Text>
      <Ionicons name={iconName as any} size={20} color={Colors.text} />
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
    height: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardSelected: { borderColor: Colors.brandDark },
  label: { fontWeight: "700", color: Colors.text, fontSize: 13 },
});

