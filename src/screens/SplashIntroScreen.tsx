import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Colors, Radius } from "../theme/theme";
import { useToast } from "../context/ToastContext";

export default function SplashIntroScreen({ navigation }: any) {
  const { showToast } = useToast();
  return (
    <View style={styles.container}>
      <View style={styles.topMint} />
      <View style={styles.bottomWhite}>
        <Text style={styles.welcome}>Welcome</Text>
        <Text style={styles.lets}>Let’s start</Text>

        <TouchableOpacity
          onPress={() => {
            showToast("Opening Login…", "info");
            navigation.navigate("Login" as any);
          }}
          accessibilityRole="button"
          accessibilityLabel="Login"
          style={styles.loginBtn}
        >
          <Text style={styles.loginText}>Login</Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }} />
        <Text style={styles.from}>from</Text>
        <Text style={styles.tn}>தமிழ்நாடு</Text>
      </View>

      <Text style={styles.brandTop}>MOOFU</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.brand },
  topMint: { flex: 1 },
  brandTop: {
    position: "absolute",
    top: 140,
    left: 0,
    right: 0,
    textAlign: "center",
    fontSize: 44,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 3,
  },
  bottomWhite: {
    height: 420,
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 70,
    paddingTop: 64,
    paddingHorizontal: 22,
    alignItems: "center",
  },
  welcome: { fontSize: 22, fontWeight: "800", color: Colors.text },
  lets: { marginTop: 8, fontSize: 13, fontWeight: "700", color: Colors.mutedText },
  loginBtn: {
    marginTop: 28,
    width: "78%",
    height: 46,
    borderRadius: Radius.pill,
    backgroundColor: Colors.brand,
    alignItems: "center",
    justifyContent: "center",
  },
  loginText: { fontWeight: "800", fontSize: 16, color: "#FFFFFF" },
  from: { fontWeight: "700", fontSize: 11, color: Colors.text, marginBottom: 2 },
  tn: { fontWeight: "800", fontSize: 14, color: Colors.text, marginBottom: 18 },
});

