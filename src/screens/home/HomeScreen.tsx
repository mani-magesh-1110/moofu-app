import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "../../components/ui/ScreenContainer";
import AppButton from "../../components/ui/AppButton";
import { useBooking } from "../../context/BookingContext";
import { Colors, Spacing, FontFamily } from "../../theme/theme";

type Props = { navigation: any };

export default function HomeScreen({ navigation }: Props) {
  const { lastBooking } = useBooking();
  const [showNotifications, setShowNotifications] = useState(false);

  const goParking = () => {
    navigation.navigate("ParkingStack", { screen: "ParkingSearchMap" });
  };

  const goComingSoon = (name: "ComingSoonCarRent" | "ComingSoonDriver") => {
    navigation.navigate(name);
  };

  const notifications = [
    {
      id: "booking",
      title: lastBooking ? "Booking confirmed" : "No recent booking",
      body: lastBooking
        ? `Your last booking is confirmed for ${lastBooking.arrivalTimeLabel} - ${lastBooking.departureTimeLabel}.`
        : "You will see your latest booking here once you book parking.",
      time: lastBooking ? "Just now" : "Today",
    },
    {
      id: "offer",
      title: "Save with monthly plan",
      body: "Choose a monthly parking plan to save on repeated bookings.",
      time: "Today",
    },
  ];

  return (
    <ScreenContainer scroll={false}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={styles.pad}>
          <View style={styles.headerRow}>
            <Text style={styles.logo}>MOOFU</Text>
            <TouchableOpacity
              accessibilityRole="button"
              accessibilityLabel="Notifications"
              hitSlop={12}
              style={styles.bellWrap}
              onPress={() => setShowNotifications(true)}
            >
              <Ionicons name="notifications-outline" size={24} color={Colors.text} />
              <View style={styles.bellBadge} />
            </TouchableOpacity>
          </View>

          <View style={styles.welcomeCard}>
            <View style={styles.welcomeTextCol}>
              <Text style={styles.welcomeTitle}>Welcome</Text>
              <Text style={styles.welcomeSub}>
                Drive in, park easy, live easy with MOOFU.
              </Text>
            </View>
            <WelcomeIllustration />
          </View>

          <Text style={styles.sectionTitle}>Our Services</Text>

          <View style={styles.servicesRow}>
            <ServiceTile onPress={goParking} active label="Parking">
              <View style={[styles.serviceIcon, styles.serviceIconPrimary]}>
                <Text style={styles.parkingP}>P</Text>
              </View>
            </ServiceTile>

            <ServiceTile onPress={() => goComingSoon("ComingSoonCarRent")} label="Car rent">
              <View style={styles.serviceIcon}>
                <Ionicons name="car-outline" size={24} color={Colors.text} />
              </View>
            </ServiceTile>

            <ServiceTile onPress={() => goComingSoon("ComingSoonDriver")} label="Driver">
              <View style={styles.serviceIcon}>
                <Ionicons name="person-outline" size={24} color={Colors.text} />
              </View>
            </ServiceTile>
          </View>

          <View style={styles.adBanner}>
            <Text style={styles.adText}>Abt ADS</Text>
          </View>
        </View>
      </ScrollView>

      {showNotifications ? (
        <View style={styles.notificationsOverlay}>
          <TouchableOpacity style={styles.notificationsBackdrop} activeOpacity={1} onPress={() => setShowNotifications(false)} />
          <View style={styles.notificationsSheet}>
            <View style={styles.notificationsHeader}>
              <View>
                <Text style={styles.notificationsTitle}>Notifications</Text>
                <Text style={styles.notificationsMeta}>Latest updates for your bookings</Text>
              </View>
              <TouchableOpacity onPress={() => setShowNotifications(false)} accessibilityRole="button" accessibilityLabel="Close notifications" style={styles.closeBtn}>
                <Ionicons name="close" size={20} color={Colors.text} />
              </TouchableOpacity>
            </View>

            {notifications.map((item) => (
              <View key={item.id} style={styles.notificationCard}>
                <View style={styles.notificationLeading}>
                  <Ionicons name={item.id === "offer" ? "sparkles" : "checkmark-circle"} size={18} color={Colors.brandDark} />
                </View>
                <View style={styles.notificationBody}>
                  <Text style={styles.notificationTitle}>{item.title}</Text>
                  <Text style={styles.notificationText}>{item.body}</Text>
                </View>
                <Text style={styles.notificationTime}>{item.time}</Text>
              </View>
            ))}

            <AppButton title="Close" onPress={() => setShowNotifications(false)} style={styles.notificationsAction} />
          </View>
        </View>
      ) : null}
    </ScreenContainer>
  );
}

function WelcomeIllustration() {
  return (
    <View style={styles.illuWrap} accessibilityLabel="Parking garage illustration">
      <View style={styles.illuFloor} />
      <View style={[styles.illuPillar, { left: 4 }]}>
        <ChevronStripes />
      </View>
      <View style={[styles.illuPillar, { right: 18 }]}>
        <ChevronStripes />
      </View>
      <View style={styles.illuSign}>
        <Text style={styles.illuSignP}>P</Text>
        <Text style={styles.illuSignNum}>5</Text>
      </View>
      <View style={styles.illuCar1} />
      <View style={styles.illuCar2} />
      <View style={styles.illuPerson}>
        <View style={styles.illuPersonHead} />
        <View style={styles.illuPersonBody} />
      </View>
    </View>
  );
}

function ChevronStripes() {
  return (
    <View style={styles.chevrons}>
      {[0, 1, 2, 3, 4].map((i) => (
        <Text key={i} style={styles.chevronChar}>
          ›
        </Text>
      ))}
    </View>
  );
}

function ServiceTile({ label, active, onPress, children }: { label: string; active?: boolean; onPress: () => void; children: React.ReactNode }) {
  return (
    <TouchableOpacity onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={styles.serviceTile} activeOpacity={0.9}>
      <View style={[styles.serviceButton, active ? styles.serviceButtonActive : null]}>{children}</View>
      <Text style={styles.serviceLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const cardShadow =
  Platform.OS === "ios"
    ? {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
      }
    : { elevation: 4 };

const tileShadow =
  Platform.OS === "ios"
    ? {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.12,
        shadowRadius: 6,
      }
    : { elevation: 3 };

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 28 },
  pad: { paddingHorizontal: 20 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 8,
    minHeight: 52,
  },
  logo: {
    fontSize: 40,
    fontWeight: "900",
    color: Colors.brand,
    letterSpacing: 2.8,
    textDecorationLine: "none" as const,
    ...FontFamily.montserratExtraBold,
  },
  bellWrap: { position: "relative", padding: 4 },
  bellBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: Colors.danger,
    borderWidth: 1.5,
    borderColor: Colors.background,
  },
  welcomeCard: {
    marginTop: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.background,
    borderRadius: 24,
    paddingVertical: 20,
    paddingLeft: 20,
    paddingRight: 14,
    ...cardShadow,
  },
  welcomeTextCol: { flex: 1, paddingRight: 12 },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: Colors.text,
    letterSpacing: -0.5,
    ...FontFamily.montserratExtraBold,
  },
  welcomeSub: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "500" as const,
    color: Colors.text,
    lineHeight: 21,
    ...FontFamily.interRegular,
  },
  illuWrap: {
    width: 140,
    height: 110,
    borderRadius: 18,
    backgroundColor: "#EAF8F4",
    overflow: "hidden",
  },
  illuFloor: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 14,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  illuPillar: {
    position: "absolute",
    bottom: 14,
    width: 14,
    height: 52,
    backgroundColor: "#C8EEE4",
    borderRadius: 3,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  chevrons: { alignItems: "center", justifyContent: "space-between", flex: 1, paddingVertical: 4 },
  chevronChar: {
    fontSize: 10,
    fontWeight: "900",
    color: Colors.brand,
    lineHeight: 11,
  },
  illuSign: {
    position: "absolute",
    top: 10,
    left: 10,
    width: 28,
    height: 30,
    borderRadius: 8,
    backgroundColor: Colors.brand,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "column",
  },
  illuSignP: { fontSize: 12, fontWeight: "900", color: "#FFFFFF", lineHeight: 14 },
  illuSignNum: { fontSize: 10, fontWeight: "800", color: "#FFFFFF", lineHeight: 12 },
  illuCar1: {
    position: "absolute",
    bottom: 16,
    left: 36,
    width: 34,
    height: 16,
    borderRadius: 4,
    backgroundColor: "#9CA3AF",
  },
  illuCar2: {
    position: "absolute",
    bottom: 16,
    right: 12,
    width: 30,
    height: 14,
    borderRadius: 4,
    backgroundColor: "#6B7280",
  },
  illuPerson: {
    position: "absolute",
    bottom: 18,
    left: 52,
    alignItems: "center",
  },
  illuPersonHead: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.text,
  },
  illuPersonBody: {
    marginTop: 1,
    width: 12,
    height: 14,
    borderRadius: 3,
    backgroundColor: "#374151",
  },
  sectionTitle: {
    marginTop: 32,
    marginBottom: 18,
    fontSize: 22,
    fontWeight: "800" as const,
    color: Colors.text,
    letterSpacing: -0.5,
    ...FontFamily.montserratExtraBold,
  },
  notificationsOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
  },
  notificationsBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  notificationsSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 24,
    borderColor: Colors.border,
    borderWidth: 1,
  },
  notificationsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  notificationsTitle: { fontSize: 18, fontWeight: "800" as const, color: Colors.text, ...FontFamily.montserratExtraBold },
  notificationsMeta: { marginTop: 4, fontSize: 12, color: Colors.mutedText },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
  },
  notificationCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  notificationLeading: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "rgba(98,223,192,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  notificationBody: { flex: 1 },
  notificationTitle: { fontSize: 14, fontWeight: "800" as const, color: Colors.text, ...FontFamily.montserratBold },
  notificationText: { marginTop: 4, fontSize: 12, color: Colors.mutedText, lineHeight: 18 },
  notificationTime: { marginLeft: 8, fontSize: 11, color: Colors.mutedText },
  notificationsAction: { marginTop: 4, height: 44 },
  servicesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  serviceTile: {
    width: 110,
    alignItems: "center",
  },
  serviceButton: {
    width: 110,
    height: 110,
    borderRadius: 28,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    ...tileShadow,
  },
  serviceButtonActive: {
    backgroundColor: Colors.brand,
  },
  serviceIcon: {
    width: 76,
    height: 76,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.94)",
    alignItems: "center",
    justifyContent: "center",
  },
  serviceIconPrimary: {
    backgroundColor: "rgba(255,255,255,0.95)",
  },
  parkingP: {
    fontSize: 28,
    fontWeight: "900",
    color: Colors.brand,
  },
  serviceLabel: {
    marginTop: 12,
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.text,
    ...FontFamily.montserratBold,
  },
  adBanner: {
    marginTop: 28,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.adBackground,
    minHeight: 140,
    alignItems: "center",
    justifyContent: "center",
  },
  adText: {
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.text,
    ...FontFamily.montserratBold,
  },
});
