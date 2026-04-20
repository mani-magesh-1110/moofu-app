import React, { useMemo } from "react";
import { CommonActions } from "@react-navigation/native";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "../../components/ui/ScreenContainer";
import { Colors, Radius } from "../../theme/theme";
import { useBooking } from "../../context/BookingContext";
import AppButton from "../../components/ui/AppButton";
import { formatINR } from "../../utils/formatters";
import { paymentMethods } from "../../data/mockData";

export default function SuccessScreen({ navigation }: any) {
  const { lastBooking } = useBooking();

  const paymentLabel = useMemo(() => {
    if (!lastBooking) return "—";
    return paymentMethods.find((p) => p.id === lastBooking.paymentMethodId)?.label ?? "—";
  }, [lastBooking]);

  if (!lastBooking) {
    return (
      <ScreenContainer scroll={true}>
        <View style={styles.container}>
          <Text style={styles.head}>No booking found</Text>
        </View>
      </ScreenContainer>
    );
  }

  const vehicleTypeLabel = lastBooking.vehicleType === "bike" ? "Bike" : "Car";

  return (
    <ScreenContainer scroll={false} preset="surface">
      <View style={styles.container}>
        <View style={styles.checkCard}>
          <View style={styles.checkCircle}>
            <Ionicons name="checkmark" size={26} color={Colors.brandDark} />
          </View>
          <Text style={styles.head}>Parking Reserved</Text>

          <View style={{ height: 10 }} />

          <Info label="Token No" value={lastBooking.tokenNo} />
          <Info label="Vehicle type" value={vehicleTypeLabel} />
          <Info label="Vehicle Number" value={lastBooking.vehicleNumber} />
          <Info label="Timing (H)" value={`${lastBooking.durationHours ?? "—"}`} />
          <Info label="Total Amount" value={formatINR(lastBooking.totalAmount)} />
          <Info label="Payment" value={paymentLabel} />

          <View style={{ height: 14 }} />
          <AppButton
            title="Finish"
            onPress={() => {
              let nav: any = navigation;
              while (nav?.getParent?.()) nav = nav.getParent();
              nav?.dispatch(
                CommonActions.reset({
                  index: 0,
                  routes: [
                    {
                      name: "MainTabs",
                      state: { routes: [{ name: "Home" }], index: 0 },
                    },
                  ],
                })
              );
            }}
            style={{ height: 44 }}
          />
        </View>

        <Text style={styles.note}>Note :</Text>
      </View>
    </ScreenContainer>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", padding: 16, backgroundColor: Colors.background },
  checkCard: {
    width: "100%",
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
  },
  checkCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "rgba(98,223,192,0.22)",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
  },
  head: { marginTop: 12, fontWeight: "700", fontSize: 14, color: Colors.text, textAlign: "center" },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 12, paddingVertical: 7, alignItems: "center" },
  label: { fontWeight: "600", color: Colors.mutedText, fontSize: 11 },
  value: { fontWeight: "700", color: Colors.text, fontSize: 11, flex: 1, textAlign: "right" },
  note: { alignSelf: "flex-start", marginTop: 14, fontWeight: "600", color: Colors.text, fontSize: 11 },
});

