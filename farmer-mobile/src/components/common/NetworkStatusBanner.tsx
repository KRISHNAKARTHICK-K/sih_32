import React from 'react';
import { View, StyleSheet } from 'react-native';
import { AppText } from './AppText';
import { theme } from '../../theme';
import { useNetworkStatus } from '../../context';
import { useTranslation } from '../../i18n';

export const NetworkStatusBanner: React.FC = () => {
  const { isOnline, isReconnecting } = useNetworkStatus();
  const { t } = useTranslation();

  if (isOnline && !isReconnecting) {
    return null;
  }

  return (
    <View
      style={[
        styles.banner,
        isReconnecting ? styles.reconnectingBanner : styles.offlineBanner,
      ]}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
    >
      <AppText
        variant="caption"
        weight="bold"
        color={isReconnecting ? theme.colors.success : theme.colors.warning}
        style={styles.text}
      >
        {isReconnecting
          ? `🟢 ${t('offline.bannerOnline')}`
          : `📡 ${t('offline.bannerOffline')}`}
      </AppText>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    paddingVertical: 6,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
  },
  offlineBanner: {
    backgroundColor: '#FEF3C7', // Amber-100
    borderBottomColor: '#FDE68A',
  },
  reconnectingBanner: {
    backgroundColor: '#DCFCE7', // Green-100
    borderBottomColor: '#BBF7D0',
  },
  text: {
    textAlign: 'center',
  },
});

export default NetworkStatusBanner;
