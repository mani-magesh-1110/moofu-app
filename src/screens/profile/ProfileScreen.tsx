import React, { useEffect, useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from "../../context/AuthContext";
import ScreenContainer from "../../components/ui/ScreenContainer";
import AppInput from "../../components/ui/AppInput";
import { Colors, Radius } from "../../theme/theme";
import { profileSettings } from "../../data/mockData";
import ToggleRow from "../../components/ui/ToggleRow";
import AppButton from "../../components/ui/AppButton";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const { user, logout, setUserProfile } = useAuth();
  const [settings, setSettings] = useState(profileSettings);
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name ?? "");
  const [location, setLocation] = useState(user?.location ?? "");
  const [vehicleNumber, setVehicleNumber] = useState(user?.vehicleNumber ?? "");

  const phone = user?.phone ?? "9876543210";

  useEffect(() => {
    setName(user?.name ?? "");
    setLocation(user?.location ?? "");
    setVehicleNumber(user?.vehicleNumber ?? "");
  }, [user]);

  const saveProfile = async () => {
    await setUserProfile({ name, location, vehicleNumber });
    setIsEditing(false);
  };

  return (
    <ScreenContainer scroll={true} preset="surface">
      <View style={styles.topBar}>
        <TouchableOpacity accessibilityRole="button" accessibilityLabel="Back" onPress={() => {}} hitSlop={12} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.title}>Profile</Text>
        <View style={{ width: 34 }} />
      </View>

      <View style={styles.centerHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarEmoji}>🤓</Text>
        </View>
        <Text style={styles.hello}>Hello!</Text>
        <Text style={styles.phoneBig}>{phone}</Text>
      </View>

      <View style={styles.sectionCard}>
        <View style={styles.sectionRowTop}>
          <Text style={styles.sectionCardTitle}>Personal Information</Text>
          <TouchableOpacity
            onPress={() => setIsEditing((prev) => !prev)}
            accessibilityRole="button"
            accessibilityLabel="Edit personal information"
            hitSlop={10}
          >
            <View style={styles.editBtn}>
              <Ionicons name="create-outline" size={18} color={Colors.text} />
            </View>
          </TouchableOpacity>
        </View>

        {isEditing ? (
          <>
            <AppInput
              value={name}
              onChangeText={setName}
              placeholder="Name"
              style={styles.editInput}
            />
            <AppInput
              value={`+91 ${phone}`}
              editable={false}
              onChangeText={() => {}}
              placeholder="Phone"
              style={styles.editInput}
            />
            <AppInput
              value={location}
              onChangeText={setLocation}
              placeholder="Location"
              style={styles.editInput}
            />
            <AppInput
              value={vehicleNumber}
              onChangeText={setVehicleNumber}
              placeholder="Vehicle Number"
              autoCapitalize="characters"
              style={styles.editInput}
            />
          </>
        ) : (
          <>
            <InfoLine label="Name" value={user?.name ?? "xxxxxxxxxx"} />
            <InfoLine label="Phone" value={`+91 ${phone}`} />
            <InfoLine label="Location" value={user?.location ?? "xxxxxxxxxxxxxxxxxxxx"} />
            <InfoLine label="Vehicle Number" value={user?.vehicleNumber ?? "TN 00 AA 0000"} />
          </>
        )}
      </View>

      {isEditing ? (
        <View style={styles.actionRow}>
          <AppButton title="Save" onPress={saveProfile} />
          <AppButton title="Cancel" variant="secondary" onPress={() => setIsEditing(false)} style={{ marginTop: 10 }} />
        </View>
      ) : null}

      <View style={styles.sectionCard}>
        <Text style={styles.sectionCardTitle}>Settings</Text>
        <View style={{ height: 8 }} />
        {settings.map((s) => (
          <View key={s.id} style={{ borderBottomWidth: s.id === "product_updates" ? 0 : 1, borderBottomColor: "rgba(0,0,0,0.08)" }}>
            <ToggleRow
              label={s.label}
              value={s.enabled}
              onChange={(next) => {
                setSettings((prev) => prev.map((p) => (p.id === s.id ? { ...p, enabled: next } : p)));
              }}
            />
          </View>
        ))}
      </View>

      <TouchableRow icon="call-outline" title="Contact Support" onPress={() => Alert.alert("Contact Support", "Mock support link for demo.")} />
      <TouchableRow icon="shield-outline" title="Privacy & Security" onPress={() => Alert.alert("Privacy & Security", "Mock page for demo.")} />

      <View style={{ height: 14 }} />

      <TouchableOpacity
        onPress={async () => {
          await logout();
        }}
        accessibilityRole="button"
        accessibilityLabel="Logout"
        style={styles.logoutOutline}
      >
        <Ionicons name="log-out-outline" size={18} color="#EF4444" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScreenContainer>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function TouchableRow({ icon, title, onPress }: { icon: any; title: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.9} style={styles.simpleRow} accessibilityRole="button" accessibilityLabel={title}>
      <Ionicons name={icon} size={18} color={Colors.text} />
      <Text style={styles.simpleTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 10 },
  backBtn: { width: 34, height: 34, alignItems: "center", justifyContent: "center" },
  title: { fontWeight: "800", fontSize: 18, color: Colors.text },
  centerHeader: { alignItems: "center", marginTop: 10, paddingHorizontal: 16 },
  avatarCircle: { width: 64, height: 64, borderRadius: 32, alignItems: "center", justifyContent: "center" },
  avatarEmoji: { fontSize: 34 },
  hello: { marginTop: 6, fontWeight: "700", color: Colors.text },
  phoneBig: { marginTop: 4, fontWeight: "700", color: Colors.text },
  sectionCard: {
    marginHorizontal: 16,
    marginTop: 14,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    backgroundColor: Colors.surface,
    padding: 14,
  },
  sectionRowTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sectionCardTitle: { fontWeight: "800", color: Colors.text, fontSize: 14 },
  editBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.10)",
    backgroundColor: "rgba(0,0,0,0.02)",
    alignItems: "center",
    justifyContent: "center",
  },
  infoRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10, gap: 12 },
  infoLabel: { fontWeight: "600", color: Colors.mutedText, fontSize: 12 },
  infoValue: { fontWeight: "700", color: Colors.text, fontSize: 12, textAlign: "right" },
  simpleRow: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    backgroundColor: Colors.surface,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  simpleTitle: { fontWeight: "700", color: Colors.text, fontSize: 13 },
  actionRow: {
    marginHorizontal: 16,
    marginTop: 16,
  },
  editInput: {
    marginTop: 12,
  },
  logoutOutline: {
    marginHorizontal: 16,
    borderRadius: Radius.pill,
    borderWidth: 1,
    borderColor: "#EF4444",
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 10,
    backgroundColor: "transparent",
  },
  logoutText: { fontWeight: "700", color: "#EF4444" },
});

