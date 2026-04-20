import React from "react";
import { Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../../screens/home/HomeScreen";
import ProfileScreen from "../../screens/profile/ProfileScreen";
import ScheduleScreen from "../../screens/schedule/ScheduleScreen";
import { Colors } from "../../theme/theme";
import BottomTabBar from "../../components/ui/BottomTabBar";

type TabParamList = {
  Home: undefined;
  Profile: undefined;
  Schedule: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

export default function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.border,
          borderTopWidth: 1,
          height: 66,
          paddingBottom: Platform.select({ ios: 10, default: 6 }),
        },
        tabBarActiveTintColor: Colors.brand,
        tabBarInactiveTintColor: Colors.mutedText,
      }}
      tabBar={(props) => <BottomTabBar {...props} />}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: "Home",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: "Profile",
        }}
      />
      <Tab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{
          tabBarLabel: "Schedule",
        }}
      />
    </Tab.Navigator>
  );
}
