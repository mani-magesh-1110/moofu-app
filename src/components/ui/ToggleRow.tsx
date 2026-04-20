import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Switch } from "react-native";
import { Colors } from "../../theme/theme";

type Props = {
  label: string;
  value: boolean;
  onChange: (next: boolean) => void;
};

export default function ToggleRow({ label, value, onChange }: Props) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: "rgba(100,116,139,0.20)", true: "rgba(79,211,194,0.35)" }}
        thumbColor={value ? Colors.brandDark : "#ffffff"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    paddingVertical: 12,
  },
  label: { fontWeight: "800", color: Colors.text, fontSize: 13 },
});

