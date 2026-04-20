import type { NavigatorScreenParams } from "@react-navigation/native";

export type ParkingStackParamList = {
  ParkingSearchMap: undefined;
  ParkingDetails: { parkingId: string };
  CalendarTimePicker: undefined;
  BookingSummary: undefined;
  Payment: undefined;
  Success: undefined;
};

export type RootStackParamList = {
  AuthStack: undefined;
  MainTabs: undefined;
  ParkingStack: NavigatorScreenParams<ParkingStackParamList> | undefined;
  ComingSoonCarRent: undefined;
  ComingSoonDriver: undefined;
  NotFound: undefined;
};

