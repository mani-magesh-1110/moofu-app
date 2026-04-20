import React from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleProp, StyleSheet, View, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  preset?: "default" | "surface";
  scroll?: boolean;
  contentContainerStyle?: StyleProp<ViewStyle>;
  keyboardAware?: boolean;
};

export default function ScreenContainer({
  children,
  style,
  preset = "default",
  scroll = false,
  contentContainerStyle,
  keyboardAware = false,
}: Props) {
  const content = (
    <View style={[styles.base, preset === "surface" ? styles.surface : styles.default, style]}>{children}</View>
  );

  const wrapped = keyboardAware ? (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20} style={{ flex: 1 }}>
      {content}
    </KeyboardAvoidingView>
  ) : (
    content
  );

  if (!scroll) {
    return <SafeAreaView style={{ flex: 1 }}>{wrapped}</SafeAreaView>;
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
        showsVerticalScrollIndicator={false}
      >
        {wrapped}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  base: { flex: 1 },
  surface: { backgroundColor: "#FFFFFF" },
  default: { backgroundColor: "#FFFFFF" },
  scrollContent: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 24,
    minHeight: "100%",
  },
});

