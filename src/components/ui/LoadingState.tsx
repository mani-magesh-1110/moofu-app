import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Colors } from "../../theme/theme";

// Works as a screen component.
export function LoadingState() {
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color={Colors.brandDark} />
      <Text style={styles.text}>Loading...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: Colors.background, padding: 20, gap: 12 },
  text: { fontWeight: "900", color: Colors.mutedText },
});

