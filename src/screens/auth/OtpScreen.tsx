import React, { useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, StyleSheet, Text, TouchableOpacity, View, TextInput, ScrollView } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useAuth } from "../../context/AuthContext";
import AppButton from "../../components/ui/AppButton";
import { Colors, Radius, FontFamily } from "../../theme/theme";
import { isValidOtp, normalizePhoneInput } from "../../utils/validators";

type Props = NativeStackScreenProps<any, any>;

const DIGIT_COUNT = 4;

export default function OtpScreen({ navigation }: Props) {
  const { pendingPhone, verifyOtp, loginWithPhone } = useAuth();
  const [otp, setOtp] = useState<string[]>(Array.from({ length: DIGIT_COUNT }).map(() => ""));
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<TextInput[]>([]);
  const [resendLoading, setResendLoading] = useState(false);

  const otpValue = useMemo(() => otp.join(""), [otp]);
  const canVerify = useMemo(() => isValidOtp(otpValue), [otpValue]);

  const phoneText = pendingPhone ? `+91 ${pendingPhone}` : "your number";

  const setDigitAt = (idx: number, digit: string) => {
    setOtp((prev) => {
      const next = [...prev];
      next[idx] = digit;
      return next;
    });
  };

  const focusIndex = (idx: number) => {
    const ref = inputRefs.current[idx];
    ref?.focus();
  };

  const onVerify = async () => {
    setError(null);
    if (!canVerify) {
      setError("Enter the 4-digit OTP.");
      return;
    }
    try {
      setLoading(true);
      const ok = await verifyOtp(otpValue);
      if (!ok) {
        setError("Wrong OTP. Please try again.");
        return;
      }
      const parentNav = navigation.getParent();
      if (parentNav) {
        parentNav.reset({ index: 0, routes: [{ name: "MainTabs" }] });
      }
    } catch {
      setError("Could not verify OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    if (!pendingPhone) return;
    setError(null);
    try {
      setResendLoading(true);
      await loginWithPhone(normalizePhoneInput(pendingPhone));
      setOtp(Array.from({ length: DIGIT_COUNT }).map(() => ""));
      focusIndex(0);
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"} keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}>
      <ScrollView contentContainerStyle={styles.root} scrollEnabled={true} keyboardShouldPersistTaps="handled">
        <View style={{ flex: 1 }} />

        <View style={styles.card}>
          <Text style={styles.title}>Enter OTP</Text>
          <Text style={styles.subtitle}>sent to {phoneText.replace("+91 ", "")}</Text>

          <View style={styles.otpGroup}>
            {Array.from({ length: DIGIT_COUNT }).map((_, idx) => {
              const isFirst = idx === 0;
              const isLast = idx === DIGIT_COUNT - 1;
              return (
                <TextInput
                  key={idx}
                  ref={(r) => {
                    if (r) inputRefs.current[idx] = r;
                  }}
                  value={otp[idx]}
                  onChangeText={(t) => {
                    const digit = t.replace(/\D/g, "").slice(-1);
                    setDigitAt(idx, digit);
                    if (digit && idx < DIGIT_COUNT - 1) focusIndex(idx + 1);
                  }}
                  keyboardType="number-pad"
                  maxLength={1}
                  style={[
                    styles.otpBox,
                    isFirst ? styles.otpFirst : null,
                    isLast ? styles.otpLast : null,
                    error ? { borderColor: Colors.danger } : null,
                  ]}
                  accessibilityLabel={`OTP digit ${idx + 1}`}
                  returnKeyType="done"
                />
              );
            })}
          </View>

          <TouchableOpacity onPress={onResend} accessibilityRole="button" accessibilityLabel="Resend code" style={{ marginTop: 12 }}>
            <Text style={[styles.resend, resendLoading ? { opacity: 0.6 } : null]}>
              {resendLoading ? "Resending..." : "Resend code"}
            </Text>
          </TouchableOpacity>

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <AppButton
            title={loading ? "" : "Verify"}
            onPress={onVerify}
            disabled={!canVerify || loading}
            loading={loading}
            style={{ marginTop: 18, alignSelf: "stretch" }}
            accessibilityLabel="Verify OTP"
          />
        </View>
        <View style={{ flex: 1 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flexGrow: 1, backgroundColor: "rgba(0,0,0,0.12)", paddingHorizontal: 18, paddingVertical: 28, justifyContent: "center" },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: Radius.lg,
    paddingVertical: 18,
    paddingHorizontal: 18,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.10)",
  },
  title: { fontSize: 20, fontWeight: "800" as const, color: Colors.text, ...FontFamily.montserratExtraBold },
  subtitle: { marginTop: 6, fontWeight: "600" as const, color: Colors.mutedText, fontSize: 12, ...FontFamily.interMedium },
  otpGroup: { flexDirection: "row", marginTop: 14, borderRadius: 12, overflow: "hidden", borderWidth: 1, borderColor: "rgba(0,0,0,0.25)" },
  otpBox: {
    width: 54,
    height: 42,
    backgroundColor: Colors.surface,
    textAlign: "center",
    fontWeight: "800",
    fontSize: 16,
    color: Colors.text,
    borderRightWidth: 1,
    borderRightColor: "rgba(0,0,0,0.20)",
    ...FontFamily.montserratBold,
  },
  otpFirst: {},
  otpLast: { borderRightWidth: 0 },
  resend: { fontWeight: "700" as const, color: Colors.brandDark, textDecorationLine: "underline", marginTop: 6, ...FontFamily.montserratBold },
  errorText: { marginTop: 10, color: Colors.danger, fontWeight: "700" as const, ...FontFamily.montserratBold },
});

