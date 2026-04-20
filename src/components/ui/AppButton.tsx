import React from "react";
import { ActivityIndicator, StyleProp, StyleSheet, Text, TouchableOpacity, ViewStyle } from "react-native";
import { Colors, Radius } from "../../theme/theme";

type Props = {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  accessibilityLabel?: string;
};

export default function AppButton({
  title,
  onPress,
  disabled,
  loading,
  style,
  variant = "primary",
  accessibilityLabel,
}: Props) {
  const isDisabled = disabled || loading;

  const variantStyles =
    variant === "primary"
      ? {
          backgroundColor: Colors.brand,
          borderColor: "transparent",
          color: "#FFFFFF",
        }
      : variant === "secondary"
        ? {
            backgroundColor: "#FFFFFF",
            borderColor: Colors.border,
            color: Colors.text,
          }
        : variant === "danger"
          ? {
              backgroundColor: "#FFFFFF",
              borderColor: Colors.danger,
              color: Colors.danger,
            }
        : {
            backgroundColor: "transparent",
            borderColor: "transparent",
            color: Colors.brandDark,
          };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.btn,
        { backgroundColor: variantStyles.backgroundColor, borderColor: variantStyles.borderColor },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#FFFFFF" : Colors.brandDark} />
      ) : (
        <Text style={[styles.btnText, { color: variantStyles.color }]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    height: 48,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18,
  },
  btnText: {
    fontSize: 15,
    fontWeight: "700",
  },
});

