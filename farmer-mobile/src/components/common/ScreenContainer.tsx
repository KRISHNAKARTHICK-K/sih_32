import {
  View,
  ScrollView,
  StyleSheet,
  ViewStyle,
  KeyboardAvoidingView,
  Platform,
  RefreshControlProps,
} from 'react-native';
import { SafeAreaView, Edge } from 'react-native-safe-area-context';
import { theme } from '../../theme';
import { NetworkStatusBanner } from './NetworkStatusBanner';

export interface ScreenContainerProps {
  children: React.ReactNode;
  scrollable?: boolean;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  edges?: Edge[];
  backgroundColor?: string;
  hideNetworkBanner?: boolean;
  refreshControl?: React.ReactElement<RefreshControlProps>;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  children,
  scrollable = false,
  style,
  contentContainerStyle,
  edges = ['top', 'left', 'right', 'bottom'],
  backgroundColor = theme.colors.background,
  hideNetworkBanner = false,
  refreshControl,
}) => {
  const containerStyle = [styles.container, { backgroundColor }, style];

  const content = scrollable ? (
    <ScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[styles.scrollContent, contentContainerStyle]}
      refreshControl={refreshControl}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[styles.staticContent, contentContainerStyle]}>{children}</View>
  );

  return (
    <SafeAreaView edges={edges} style={containerStyle}>
      {!hideNetworkBanner && <NetworkStatusBanner />}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardAvoid}
      >
        {content}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.layout.screenPadding,
  },
  staticContent: {
    flex: 1,
    padding: theme.layout.screenPadding,
  },
});

export default ScreenContainer;
