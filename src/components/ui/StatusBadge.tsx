import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Radius } from "../../theme/theme";

type Props = {
  text: string;
  tone: "success" | "muted" | "warning";
};

export default function StatusBadge({ text, tone }: Props) {
  // STRICT badge styles per design
  const bg = tone === "success" ? "#DFF5F1" : tone === "warning" ? "#FFF4D6" : "#EEEEEE";
  const border = tone === "success" ? "#DFF5F1" : tone === "warning" ? "#FFF4D6" : Colors.border;
  const color = tone === "success" ? "#1FAF9A" : tone === "warning" ? "#E6A700" : Colors.mutedText;

  return (
    <View style={[styles.badge, { backgroundColor: bg, borderColor: border }]}>
      <Text style={[styles.text, { color }]}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    borderRadius: 20,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  text: {
    fontWeight: "700",
    fontSize: 12,
  },
});

