import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { Colors, Typography } from "../../theme/theme";

type Props = {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
};

export default function SectionTitle({ title, subtitle, right }: Props) {
  return (
    <View style={styles.wrap}>
      <View style={{ flex: 1 }}>
        <Text style={Typography.h2}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle]}>{subtitle}</Text> : null}
      </View>
      {right ? <View>{right}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "flex-end", gap: 10, marginBottom: 12 },
  subtitle: { marginTop: 4, fontWeight: "700", color: Colors.mutedText, fontSize: 12 },
});

