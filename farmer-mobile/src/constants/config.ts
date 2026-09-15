import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getApiBaseUrl = (): string => {
  // If explicitly set via environment variable
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }

  // Dynamic LAN IP extraction from Expo Metro host
  const hostUri = Constants.expoConfig?.hostUri || (Constants as any).manifest2?.extra?.expoClient?.hostUri || (Constants as any).manifest?.debuggerHost;
  if (hostUri) {
    const hostIp = hostUri.split(':')[0];
    if (hostIp && hostIp !== 'localhost' && hostIp !== '127.0.0.1') {
      return `http://${hostIp}:8080/api`;
    }
  }

  // Android Emulator fallback
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080/api';
  }
  return 'http://localhost:8080/api';
};

export const AppConfig = {
  appName: 'AgriProcure Farmer',
  version: '1.0.0',
  apiBaseUrl: getApiBaseUrl(),
  apiTimeoutMs: 15000,
  storageKeys: {
    authToken: 'agriprocure_farmer_auth_token',
    userSession: 'agriprocure_farmer_user_session',
  },
} as const;
