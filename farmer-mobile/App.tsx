import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { LanguageProvider } from './src/i18n';
import { NetworkProvider, AuthProvider } from './src/context';
import { AppNavigator } from './src/navigation';

export default function App() {
  return (
    <SafeAreaProvider>
      <NetworkProvider>
        <LanguageProvider>
          <AuthProvider>
            <StatusBar style="dark" />
            <AppNavigator />
          </AuthProvider>
        </LanguageProvider>
      </NetworkProvider>
    </SafeAreaProvider>
  );
}
