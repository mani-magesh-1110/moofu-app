import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors } from "../../theme/theme";

export default function EmptyState({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.sub}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingVertical: 30, alignItems: "center", justifyContent: "center", gap: 8 },
  title: { fontWeight: "900", color: Colors.text, fontSize: 16 },
  sub: { fontWeight: "800", color: Colors.mutedText, fontSize: 13, textAlign: "center", paddingHorizontal: 20 },
});

