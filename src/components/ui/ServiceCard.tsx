import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors, Radius } from "../../theme/theme";
import StatusBadge from "./StatusBadge";

type Props = {
  title: string;
  description: string;
  badgeText?: string;
  badgeTone?: "success" | "muted" | "warning";
  iconName?: string;
  onPress?: () => void;
  disabled?: boolean;
  highlighted?: boolean;
};

export default function ServiceCard({
  title,
  description,
  badgeText,
  badgeTone = "muted",
  iconName = "sparkles",
  onPress,
  disabled,
  highlighted = false,
}: Props) {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={title}
      style={[
        styles.card,
        highlighted ? { borderColor: Colors.brand } : null,
        disabled ? { opacity: 0.75 } : null,
      ]}
    >
      <View style={styles.row}>
        <View style={styles.iconWrap}>
          <Ionicons name={iconName as any} size={18} color={Colors.brandDark} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.desc}>{description}</Text>
        </View>
      </View>
      {badgeText ? <View style={{ marginTop: 10 }}>{<StatusBadge text={badgeText} tone={badgeTone} />}</View> : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#DFF5F1",
    backgroundColor: "#FFFFFF",
    padding: 16,
    minHeight: 94,
  },
  row: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: Radius.md,
    backgroundColor: "#DFF5F1",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    color: Colors.text,
  },
  desc: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
    color: Colors.mutedText,
  },
});

