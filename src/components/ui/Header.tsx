import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Radius, Typography } from "../../theme/theme";

type Props = {
  title?: string;
  brand?: boolean;
  onBack?: () => void;
  right?: React.ReactNode;
};

export default function Header({ title, brand, onBack, right }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={styles.left}>
        {onBack ? (
          <TouchableOpacity onPress={onBack} hitSlop={12} accessibilityRole="button" accessibilityLabel="Back">
            <Ionicons name="chevron-back" size={22} color={Colors.text} />
          </TouchableOpacity>
        ) : null}
      </View>
      <View style={styles.center}>
        {brand ? <Text style={styles.brand}>MOOFU</Text> : title ? <Text style={Typography.h2}>{title}</Text> : null}
      </View>
      <View style={styles.right}>{right ? right : <View style={{ width: 32 }} />}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 56,
    alignItems: "center",
    justifyContent: "space-between",
    flexDirection: "row",
    paddingHorizontal: 16,
  },
  left: { width: 48, alignItems: "flex-start" },
  center: { flex: 1, alignItems: "center" },
  right: { width: 48, alignItems: "flex-end" },
  brand: {
    fontWeight: "900",
    fontSize: 22,
    color: Colors.brand,
    letterSpacing: 1,
  },
});

