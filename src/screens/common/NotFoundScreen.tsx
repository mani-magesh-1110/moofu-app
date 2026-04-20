import React from "react";
import { StyleSheet, Text, View } from "react-native";
import ScreenContainer from "../../components/ui/ScreenContainer";
import { Colors } from "../../theme/theme";
import AppButton from "../../components/ui/AppButton";
import { useNavigation } from "@react-navigation/native";

export default function NotFoundScreen() {
  const navigation = useNavigation<any>();
  return (
    <ScreenContainer scroll={false}>
      <View style={styles.wrap}>
        <Text style={styles.title}>Oops!</Text>
        <Text style={styles.body}>This screen doesn’t exist.</Text>
        <View style={{ height: 14 }} />
        <AppButton title="Go Home" onPress={() => navigation.navigate("MainTabs")} />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, alignItems: "center", justifyContent: "center", gap: 10, paddingHorizontal: 18 },
  title: { fontWeight: "900", fontSize: 24, color: Colors.text },
  body: { fontWeight: "800", color: Colors.mutedText, textAlign: "center" },
});

