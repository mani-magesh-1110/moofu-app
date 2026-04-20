import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ParkingStackParamList } from "../types";
import ParkingSearchMapScreen from "../../screens/parking/ParkingSearchMapScreen";
import ParkingDetailsScreen from "../../screens/parking/ParkingDetailsScreen";
import CalendarTimePickerScreen from "../../screens/parking/CalendarTimePickerScreen";
import BookingSummaryScreen from "../../screens/parking/BookingSummaryScreen";
import PaymentScreen from "../../screens/parking/PaymentScreen";
import SuccessScreen from "../../screens/parking/SuccessScreen";

const Stack = createNativeStackNavigator<ParkingStackParamList>();

export default function ParkingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ParkingSearchMap" component={ParkingSearchMapScreen} />
      <Stack.Screen name="ParkingDetails" component={ParkingDetailsScreen} />
      <Stack.Screen
        name="CalendarTimePicker"
        component={CalendarTimePickerScreen}
        options={{ presentation: "transparentModal" as any }}
      />
      <Stack.Screen name="BookingSummary" component={BookingSummaryScreen} />
      <Stack.Screen
        name="Payment"
        component={PaymentScreen}
        options={{ presentation: "transparentModal" as any }}
      />
      <Stack.Screen name="Success" component={SuccessScreen} />
    </Stack.Navigator>
  );
}

