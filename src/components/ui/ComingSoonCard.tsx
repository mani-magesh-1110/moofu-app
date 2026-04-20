import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Radius } from "../../theme/theme";
import StatusBadge from "./StatusBadge";

type Props = {
  title: string;
  subtitle: string;
};

export default function ComingSoonCard({ title, subtitle }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <StatusBadge text="Coming Soon" tone="warning" />
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: "rgba(15,23,42,0.10)",
    backgroundColor: Colors.background,
    padding: 18,
    minHeight: 104,
  },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { marginTop: 10, fontWeight: "900", fontSize: 16, color: Colors.text },
  subtitle: { marginTop: 6, fontWeight: "700", color: Colors.mutedText, fontSize: 12 },
});

