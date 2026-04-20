import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../theme/theme";

type Props = {
  label: string;
  value: string;
};

export default function SummaryRow({ label, value }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", gap: 12, paddingVertical: 10 },
  label: { fontWeight: "800", color: Colors.mutedText, fontSize: 12 },
  value: { fontWeight: "900", color: Colors.text, fontSize: 13, textAlign: "right" },
});

