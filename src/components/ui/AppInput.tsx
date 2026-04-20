import React from "react";
import { StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { Colors, Radius, Typography } from "../../theme/theme";

type Props = {
  label?: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: TextInputProps["keyboardType"];
  error?: string | null;
  inputMode?: TextInputProps["inputMode"];
  rightAccessory?: React.ReactNode;
  autoCapitalize?: TextInputProps["autoCapitalize"];
  secureTextEntry?: boolean;
} & Omit<TextInputProps, "value" | "onChangeText">;

export default function AppInput({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  error,
  inputMode,
  rightAccessory,
  autoCapitalize = "none",
  secureTextEntry,
  ...rest
}: Props) {
  return (
    <View style={styles.wrap}>
      {label ? <Text style={Typography.caption}>{label}</Text> : null}
      <View style={[styles.inputWrap, error ? { borderColor: Colors.danger } : null]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={Colors.mutedText}
          keyboardType={keyboardType}
          inputMode={inputMode}
          autoCapitalize={autoCapitalize}
          secureTextEntry={secureTextEntry}
          style={styles.input}
          {...rest}
        />
        {rightAccessory ? rightAccessory : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 14,
    height: 48,
  },
  input: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    paddingVertical: 0,
  },
  errorText: {
    color: Colors.danger,
    fontSize: 12,
    fontWeight: "700",
  },
});

