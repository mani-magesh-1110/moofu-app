import React, { useMemo, useState, useEffect } from "react";
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenContainer from "../../components/ui/ScreenContainer";
import { Colors, Radius } from "../../theme/theme";
import ParkingCard from "../../components/ui/ParkingCard";
import { useBooking } from "../../context/BookingContext";
import { useToast } from "../../context/ToastContext";
import { LoadingState } from "../../components/ui/LoadingState";

export default function ParkingSearchMapScreen({ navigation }: any) {
  const { startDraftForParking, parkingLots } = useBooking();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(parkingLots.length === 0);

  useEffect(() => {
    // Update loading state when parking lots are loaded
    if (parkingLots.length > 0) {
      setLoading(false);
    }
  }, [parkingLots]);

  const [showResults, setShowResults] = useState(false);
  const [openNow, setOpenNow] = useState(true);
  const [topRated, setTopRated] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = useMemo(() => {
    let list = parkingLots.slice();
    if (openNow) list = list.filter((p) => p.isOpen);
    if (topRated) list = list.filter((p) => p.rating >= 4.5);
    const query = searchQuery.trim().toLowerCase();
    if (query.length > 0) {
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.area.toLowerCase().includes(query) ||
          p.city.toLowerCase().includes(query)
      );
    }
    return list;
  }, [parkingLots, openNow, topRated, searchQuery]);

  if (loading) {
    return (
      <ScreenContainer scroll={false}>
        <LoadingState />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll={false}>
      <View style={styles.root}>
        {/* Map area (mocked) */}
        <View style={styles.map} accessibilityLabel="Map view">
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              accessibilityRole="button"
              accessibilityLabel="Back"
              hitSlop={12}
              style={styles.backBtn}
            >
              <Ionicons name="arrow-back" size={20} color={Colors.text} />
            </TouchableOpacity>

            <View style={styles.searchPill}>
              <TextInput
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  if (!showResults) setShowResults(true);
                }}
                onFocus={() => setShowResults(true)}
                placeholder="Search parking"
                placeholderTextColor={Colors.mutedText}
                style={styles.searchInput}
                returnKeyType="search"
                accessibilityLabel="Search parking"
              />
              {searchQuery ? (
                <TouchableOpacity
                  onPress={() => setSearchQuery("")}
                  accessibilityRole="button"
                  accessibilityLabel="Clear search"
                  style={styles.clearSearchBtn}
                >
                  <Ionicons name="close-circle" size={18} color={Colors.mutedText} />
                </TouchableOpacity>
              ) : null}
            </View>

            <TouchableOpacity
              onPress={() => setShowResults((prev) => !prev)}
              accessibilityRole="button"
              accessibilityLabel="Toggle results"
              style={styles.filterBtn}
            >
              <Ionicons name={showResults ? "chevron-down" : "options-outline"} size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {/* pin markers */}
          {MARKERS.map((m, idx) => (
            <Ionicons key={idx} name="location" size={20} color="#F43F5E" style={[styles.pin, m]} />
          ))}

          <TouchableOpacity style={styles.fabHelp} accessibilityRole="button" accessibilityLabel="Help" onPress={() => showToast("Help is mocked.", "info")}>
            <Ionicons name="help" size={18} color={Colors.text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.fabGo} accessibilityRole="button" accessibilityLabel="Navigate" onPress={() => showToast("Navigation is mocked.", "info")}>
            <Ionicons name="navigate" size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* Bottom sheet */}
        <View style={styles.sheet}>
          <View style={styles.handle} />

          <TouchableOpacity onPress={() => setShowResults(true)} accessibilityRole="button" accessibilityLabel="Open results">
            <Text style={styles.sheetTitle}>Results</Text>
          </TouchableOpacity>

          <View style={styles.cards}>
            {filtered.slice(0, 3).map((p) => (
              <View key={p.id} style={{ marginBottom: 12 }}>
                <ParkingCard
                  parking={p}
                  onPress={() => {
                    startDraftForParking(p.id);
                    navigation.navigate("ParkingDetails", { parkingId: p.id });
                  }}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Full results overlay */}
        {showResults ? (
          <View style={styles.resultsOverlay}>
            <View style={styles.resultsSheet}>
              <View style={styles.resultsHeader}>
                <Text style={styles.resultsHeaderTitle}>Results</Text>
                <TouchableOpacity onPress={() => setShowResults(false)} accessibilityRole="button" accessibilityLabel="Close results" hitSlop={12}>
                  <Ionicons name="close" size={20} color={Colors.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.filtersRow}>
                <TouchableOpacity
                  onPress={() => showToast("Filters are mocked.", "info")}
                  accessibilityRole="button"
                  accessibilityLabel="Filters"
                  style={styles.iconChip}
                >
                  <Ionicons name="options-outline" size={16} color={Colors.text} />
                </TouchableOpacity>

                <FilterChip label="Open now" active={openNow} onPress={() => setOpenNow((v) => !v)} />
                <FilterChip label="Top-rated" active={topRated} onPress={() => setTopRated((v) => !v)} />

                <TouchableOpacity onPress={() => showToast("More filters are mocked.", "info")} accessibilityRole="button" accessibilityLabel="More filters">
                  <Text style={styles.moreFilters}>More filters</Text>
                </TouchableOpacity>
              </View>

              <View style={{ marginTop: 10 }}>
                {filtered.map((p) => (
                  <View key={p.id} style={{ marginBottom: 12 }}>
                    <ParkingCard
                      parking={p}
                      onPress={() => {
                        setShowResults(false);
                        startDraftForParking(p.id);
                        navigation.navigate("ParkingDetails", { parkingId: p.id });
                      }}
                    />
                  </View>
                ))}

                {filtered.length === 0 ? (
                  <View style={{ paddingVertical: 30 }}>
                    <Text style={{ fontWeight: "700", color: Colors.text, textAlign: "center" }}>No results</Text>
                  </View>
                ) : null}
              </View>
            </View>
          </View>
        ) : null}
      </View>
    </ScreenContainer>
  );
}

function FilterChip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} accessibilityRole="button" accessibilityLabel={label} style={[styles.chip, active ? styles.chipActive : null]}>
      <Text style={[styles.chipText, active ? styles.chipTextActive : null]}>{label}</Text>
    </TouchableOpacity>
  );
}

const MARKERS = [
  { top: 120, left: 64 },
  { top: 210, left: 120 },
  { top: 160, right: 80 },
  { top: 260, right: 120 },
] as const;

const shadow =
  Platform.OS === "ios"
    ? { shadowColor: "#000", shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.10, shadowRadius: 14 }
    : { elevation: 8 };

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.background },
  map: { flex: 1, backgroundColor: "#EDEFF2" },
  topBar: {
    position: "absolute",
    top: 10,
    left: 12,
    right: 12,
    zIndex: 5,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    ...shadow,
  },
  searchText: { fontWeight: "700", color: Colors.text, fontSize: 14 },
  searchPill: {
    flex: 1,
    minHeight: 42,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    ...shadow,
  },
  searchInput: {
    flex: 1,
    fontWeight: "700",
    color: Colors.text,
    minHeight: 40,
    paddingVertical: 8,
  },
  clearSearchBtn: { marginLeft: 8 },
  filterBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.08)",
    ...shadow,
  },
  pin: { position: "absolute" },
  fabHelp: {
    position: "absolute",
    right: 16,
    bottom: 150,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    alignItems: "center",
    justifyContent: "center",
    ...shadow,
  },
  fabGo: {
    position: "absolute",
    right: 18,
    bottom: 92,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#2F80ED",
    alignItems: "center",
    justifyContent: "center",
    ...shadow,
  },
  sheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingTop: 10,
    paddingHorizontal: 16,
    paddingBottom: 18,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  handle: {
    alignSelf: "center",
    width: 44,
    height: 4,
    borderRadius: 3,
    backgroundColor: "rgba(0,0,0,0.18)",
    marginBottom: 8,
  },
  sheetTitle: { fontWeight: "700", color: Colors.text, fontSize: 14, marginBottom: 10 },
  cards: { paddingBottom: 8 },
  resultsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)",
    justifyContent: "flex-end",
  },
  resultsSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 18,
  },
  resultsHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  resultsHeaderTitle: { fontWeight: "700", color: Colors.text, fontSize: 14 },
  filtersRow: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 },
  iconChip: {
    width: 34,
    height: 34,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingHorizontal: 12,
    height: 34,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  chipActive: { borderColor: Colors.brand, backgroundColor: "rgba(98,223,192,0.18)" },
  chipText: { fontWeight: "700", color: Colors.text, fontSize: 12 },
  chipTextActive: { color: Colors.text },
  moreFilters: { fontWeight: "700", color: "#2F80ED", fontSize: 12 },
});

