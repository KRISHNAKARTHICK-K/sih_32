import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from './types';
import {
  HomeScreen,
  BookSlotScreen,
  BookingSuccessScreen,
  BookingsListScreen,
  BookingDetailsScreen,
  QueueScreen,
  NotificationsScreen,
  ProcurementsScreen,
  ProcurementDetailsScreen,
  ProfileScreen,
  HelpScreen,
} from '../screens';

const Stack = createNativeStackNavigator<MainStackParamList>();

export const MainNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="BookSlot" component={BookSlotScreen} />
      <Stack.Screen name="BookingSuccess" component={BookingSuccessScreen} />
      <Stack.Screen name="BookingsList" component={BookingsListScreen} />
      <Stack.Screen name="BookingDetails" component={BookingDetailsScreen} />
      <Stack.Screen name="Queue" component={QueueScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Procurements" component={ProcurementsScreen} />
      <Stack.Screen name="ProcurementDetails" component={ProcurementDetailsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Help" component={HelpScreen} />
    </Stack.Navigator>
  );
};

export default MainNavigator;
