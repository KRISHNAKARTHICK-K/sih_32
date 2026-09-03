import { Platform } from 'react-native';

const getLocalhostUrl = (): string => {
  // Android Emulator uses 10.0.2.2 to access host machine localhost
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080/api';
  }
  return 'http://localhost:8080/api';
};

export const AppConfig = {
  appName: 'AgriProcure Farmer',
  version: '1.0.0',
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || getLocalhostUrl(),
  apiTimeoutMs: 15000,
  storageKeys: {
    authToken: 'agriprocure_farmer_auth_token',
    userSession: 'agriprocure_farmer_user_session',
  },
} as const;
