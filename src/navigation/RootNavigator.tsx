import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../context/AuthContext";
import { RootStackParamList } from "./types";
import AuthStack from "./auth/AuthStack";
import MainTabs from "./tabs/MainTabs";
import ComingSoonServiceScreen from "../screens/comingSoon/ComingSoonServiceScreen";
import NotFoundScreen from "../screens/common/NotFoundScreen";
import { LoadingState } from "../components/ui/LoadingState";
import ParkingStack from "./parking/ParkingStack";

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const { loading, loggedIn } = useAuth();

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {loading ? (
          <Stack.Screen name="AuthStack" component={LoadingState} />
        ) : loggedIn ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen name="ParkingStack" component={ParkingStack} />
            <Stack.Screen name="ComingSoonCarRent" component={ComingSoonServiceScreen} />
            <Stack.Screen name="ComingSoonDriver" component={ComingSoonServiceScreen} />
            <Stack.Screen name="NotFound" component={NotFoundScreen} />
          </>
        ) : (
          <Stack.Screen name="AuthStack" component={AuthStack} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

