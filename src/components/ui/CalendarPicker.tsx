import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Calendar } from "react-native-calendars";
import { Colors, Radius } from "../../theme/theme";
import { toTimeLabel } from "../../utils/formatters";

type Props = {
  selectedDateISO: string; // yyyy-mm-dd
  onSelectedDateISOChange: (iso: string) => void;
  selectedMinutesFromMidnight: number;
  onSelectedMinutesFromMidnightChange: (minutesFromMidnight: number) => void;
  onConfirm: () => void;
  confirmTitle?: string;
};

function minutesToLocalDate(minutesFromMidnight: number) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  now.setMinutes(minutesFromMidnight);
  return now;
}

export default function CalendarPicker({
  selectedDateISO,
  onSelectedDateISOChange,
  selectedMinutesFromMidnight,
  onSelectedMinutesFromMidnightChange,
  onConfirm,
  confirmTitle = "Save",
}: Props) {
  const [timeText, setTimeText] = useState(() => {
    const date = minutesToLocalDate(selectedMinutesFromMidnight);
    return `${String(date.getHours() % 12 || 12).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
  });
  const [period, setPeriod] = useState(() => (selectedMinutesFromMidnight >= 12 * 60 ? "PM" : "AM"));

  useEffect(() => {
    const date = minutesToLocalDate(selectedMinutesFromMidnight);
    setTimeText(`${String(date.getHours() % 12 || 12).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`);
    setPeriod(selectedMinutesFromMidnight >= 12 * 60 ? "PM" : "AM");
  }, [selectedMinutesFromMidnight]);

  const parseTimeValue = (value: string, selectedPeriod: string) => {
    const normalized = value.trim().replace(/[^0-9:]/g, "");
    const parts = normalized.split(":");
    if (parts.length !== 2) return null;
    const hour = Number(parts[0]);
    const minute = Number(parts[1]);
    if (!Number.isInteger(hour) || !Number.isInteger(minute) || hour < 1 || hour > 12 || minute < 0 || minute > 59) return null;
    let minutes = hour % 12 === 0 ? 0 : hour % 12 * 60;
    if (selectedPeriod === "PM") minutes += 12 * 60;
    return minutes + minute;
  };

  const updateTime = (value: string, selectedPeriod: string) => {
    const parsed = parseTimeValue(value, selectedPeriod);
    if (parsed === null) return;
    onSelectedMinutesFromMidnightChange(parsed);
  };

  return (
    <View style={styles.wrap}>
      <Calendar
        current={selectedDateISO}
        onDayPress={(day) => onSelectedDateISOChange(day.dateString)}
        markedDates={{
          [selectedDateISO]: { selected: true, selectedColor: Colors.brandDark },
        }}
        theme={{
          selectedDayBackgroundColor: Colors.brandDark,
          todayTextColor: Colors.brandDark,
          dayTextColor: Colors.text,
          textMonthFontWeight: "900",
          textDayFontWeight: "800",
          textDayHeaderFontWeight: "800",
        }}
        hideExtraDays
      />

      <View style={styles.timeHeader}>
        <Text style={styles.timeTitle}>Time</Text>
        <Text style={styles.timeHint}>Enter exact time</Text>
      </View>

      <View style={styles.timeInputRow}>
        <TextInput
          value={timeText}
          onChangeText={(text) => {
            setTimeText(text);
            updateTime(text, period);
          }}
          placeholder="09:30"
          placeholderTextColor={Colors.mutedText}
          keyboardType="numeric"
          style={styles.timeInput}
        />
        <View style={styles.periodPicker}>
          {(["AM", "PM"] as const).map((item) => (
            <TouchableOpacity
              key={item}
              onPress={() => {
                setPeriod(item);
                updateTime(timeText, item);
              }}
              style={[styles.periodBtn, period === item ? styles.periodBtnActive : null]}
              accessibilityRole="button"
              accessibilityLabel={item}
            >
              <Text style={[styles.periodText, period === item ? styles.periodTextActive : null]}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity
        onPress={onConfirm}
        style={styles.confirmBtn}
        accessibilityRole="button"
        accessibilityLabel={confirmTitle}
      >
        <Text style={styles.confirmText}>{confirmTitle}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  timeHeader: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 6, marginTop: 2 },
  timeTitle: { fontWeight: "900", color: Colors.text, fontSize: 14 },
  timeHint: { fontWeight: "800", color: Colors.mutedText, fontSize: 12 },
  timeInputRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginTop: 10,
  },
  timeInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "900",
    color: Colors.text,
    paddingVertical: 12,
  },
  periodPicker: { flexDirection: "row", gap: 8 },
  periodBtn: {
    minWidth: 58,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  periodBtnActive: { backgroundColor: Colors.brandTint, borderColor: Colors.brand },
  periodText: { fontWeight: "700", color: Colors.mutedText },
  periodTextActive: { color: Colors.brandDark },
  confirmBtn: {
    height: 50,
    borderRadius: Radius.pill,
    backgroundColor: Colors.brand,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  confirmText: { fontWeight: "900", fontSize: 16, color: "#0B3B35" },
});

