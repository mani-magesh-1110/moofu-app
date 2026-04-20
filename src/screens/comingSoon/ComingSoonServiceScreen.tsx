import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Header from "../../components/ui/Header";
import ScreenContainer from "../../components/ui/ScreenContainer";
import { Colors } from "../../theme/theme";
import { Ionicons } from "@expo/vector-icons";

type RouteNames = "ComingSoonCarRent" | "ComingSoonDriver";

export default function ComingSoonServiceScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const name: RouteNames = route.name;

  const isCarRent = name === "ComingSoonCarRent";
  const title = isCarRent ? "Rent a Car" : "Driver";

  return (
    <ScreenContainer scroll={false}>
      <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 6 }}>
        <Header onBack={() => navigation.goBack()} title={title} />
        <View style={styles.center}>
          <View style={styles.iconCircle}>
            <Ionicons name={isCarRent ? "car-outline" : "person-outline"} size={26} color={Colors.text} />
          </View>
          <Text style={styles.soon}>Coming soon</Text>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(0,0,0,0.03)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    alignItems: "center",
    justifyContent: "center",
  },
  soon: { marginTop: 12, fontWeight: "700", color: Colors.mutedText, fontSize: 14 },
});

