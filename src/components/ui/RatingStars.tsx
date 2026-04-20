import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../theme/theme";

type Props = {
  rating: number;
  size?: number;
  showValue?: boolean;
};

export default function RatingStars({ rating, size = 14, showValue = true }: Props) {
  const rounded = Math.round(rating * 10) / 10;
  const filled = Math.round(rating); // simple

  return (
    <View style={styles.row}>
      <View style={styles.stars}>
        {Array.from({ length: 5 }).map((_, idx) => {
          const isFilled = idx < filled;
          return (
            <Ionicons
              key={idx}
              name={isFilled ? "star" : "star-outline"}
              size={size}
              color={isFilled ? "#F59E0B" : "rgba(245,158,11,0.35)"}
            />
          );
        })}
      </View>
      {showValue ? <Text style={styles.value}>{rounded.toFixed(1)}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8 },
  stars: { flexDirection: "row", gap: 1 },
  value: { fontWeight: "900", color: Colors.text },
});

