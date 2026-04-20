import React, { useMemo, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/AuthContext";
import AppInput from "../../components/ui/AppInput";
import AppButton from "../../components/ui/AppButton";
import { Colors, Radius, FontFamily } from "../../theme/theme";
import { normalizePhoneInput } from "../../utils/validators";
import { isValidPhoneNumber } from "../../utils/validators";
import ScreenContainer from "../../components/ui/ScreenContainer";

type Props = NativeStackScreenProps<any, any>;

export default function LoginScreen({ navigation }: Props) {
  const { loginWithPhone } = useAuth();
  const [mobileDigits, setMobileDigits] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canContinue = useMemo(() => isValidPhoneNumber(normalizePhoneInput(mobileDigits)), [mobileDigits]);

  return (
    <ScreenContainer scroll={true} keyboardAware={true}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityRole="button" accessibilityLabel="Back" hitSlop={12} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color={Colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setError("Use a valid 10-digit mobile number for this demo.")}
          accessibilityRole="button"
          accessibilityLabel="Help"
          hitSlop={12}
          style={styles.helpPill}
        >
          <Ionicons name="help-circle-outline" size={16} color={Colors.text} />
          <Text style={styles.helpText}>Help</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.title}>Login</Text>

      <View style={styles.inputBlock}>
        <Text style={styles.inputLabel}>Mobile number</Text>
        <View style={styles.phoneRow}>
          <View style={styles.prefixWrap}>
            <Text style={styles.prefixText}>+91</Text>
          </View>
          <View style={{ flex: 1 }}>
            <AppInput
              label={undefined}
              value={mobileDigits}
              onChangeText={(t) => {
                const normalized = normalizePhoneInput(t);
                setMobileDigits(normalized);
                setError(null);
              }}
              placeholder="Mobile Number"
              keyboardType="phone-pad"
              error={error}
              inputMode="numeric"
            />
          </View>
        </View>
      </View>

      <Text style={styles.note}>
        You will receive a 4-digit verification{"\n"}code on the mobile number you entered.
      </Text>

      <View style={styles.illustration} accessibilityLabel="Login illustration" />

      <View style={{ flex: 1 }} />

      <AppButton
        title={loading ? "" : "Continue"}
        onPress={async () => {
          if (!canContinue) {
            setError("Enter a valid 10-digit mobile number.");
            return;
          }
          try {
            setLoading(true);
            setError(null);
            await loginWithPhone(mobileDigits);
            navigation.navigate("Otp" as never);
          } catch (e: any) {
            setError(e?.message ?? "Could not continue. Please try again.");
          } finally {
            setLoading(false);
          }
        }}
        disabled={!canContinue || loading}
        loading={loading}
        accessibilityLabel="Continue"
        style={styles.continueBtn}
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  topRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 10 },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.12)",
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  helpPill: {
    height: 30,
    paddingHorizontal: 10,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.04)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.10)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  helpText: { color: Colors.text, fontSize: 12, ...FontFamily.montserratBold },
  title: { marginTop: 34, fontSize: 30, color: Colors.text, textAlign: "center", ...FontFamily.montserratExtraBold },
  inputBlock: { marginTop: 28, paddingHorizontal: 16 },
  inputLabel: { color: Colors.mutedText, marginBottom: 8, fontSize: 12, ...FontFamily.montserratBold },
  phoneRow: { flexDirection: "row", gap: 10 },
  prefixWrap: {
    width: 64,
    borderRadius: 8,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.20)",
    alignItems: "center",
    justifyContent: "center",
    height: 48,
  },
  prefixText: { color: Colors.text, fontSize: 13, ...FontFamily.montserratBold },
  note: { marginTop: 18, paddingHorizontal: 16, textAlign: "center", color: Colors.mutedText, fontSize: 12, lineHeight: 18, ...FontFamily.interMedium },
  illustration: {
    marginTop: 18,
    marginHorizontal: 16,
    height: 170,
    borderRadius: Radius.lg,
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  continueBtn: { marginHorizontal: 16, marginBottom: 10, height: 46 },
});

