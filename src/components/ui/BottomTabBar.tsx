import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../theme/theme";

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Home: "home-outline",
  Profile: "person-outline",
  Schedule: "calendar-outline",
};

export default function BottomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const activeRoute = state.routes[state.index];
  const activeDescriptor = descriptors[activeRoute.key];
  const rawTabBarStyle = (activeDescriptor?.options as any)?.tabBarStyle;

  const isHidden =
    typeof rawTabBarStyle === "object" &&
    rawTabBarStyle !== null &&
    "display" in rawTabBarStyle &&
    (rawTabBarStyle as any).display === "none";

  if (isHidden) return null;

  return (
    <View style={[styles.wrap, rawTabBarStyle as any]}>
      {state.routes.map((route, index) => {
        const descriptor = descriptors[route.key];
        const isFocused = state.index === index;
        const label = descriptor.options.tabBarLabel ?? route.name;

        const iconName = ICONS[route.name] ?? "ellipse";
        const color = isFocused ? Colors.brand : Colors.text;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (event.defaultPrevented) return;
          navigation.navigate(route.name as never);
        };

        return (
          <TouchableOpacity key={route.key} style={styles.item} accessibilityRole="button" accessibilityLabel={String(label)} onPress={onPress}>
            <View style={[styles.iconShell, isFocused ? styles.iconShellActive : null]}>
              <Ionicons name={iconName as any} size={22} color={color} />
            </View>
            <Text style={[styles.label, { color: isFocused ? Colors.brand : Colors.mutedText }]}>{String(label).replace(/Tab$/, "")}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    height: 66,
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    backgroundColor: Colors.background,
    paddingBottom: 6,
  },
  item: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  iconShell: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  iconShellActive: {
    backgroundColor: Colors.brandTint,
  },
  label: {
    fontSize: 11,
    fontWeight: "800",
  },
});
