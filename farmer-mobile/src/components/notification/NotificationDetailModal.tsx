import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { AppCard } from '../common/AppCard';
import { AppText } from '../common/AppText';
import { AppButton } from '../common/AppButton';
import { theme } from '../../theme';
import { NotificationItem } from '../../types';

export interface NotificationDetailModalProps {
  notification: NotificationItem | null;
  visible: boolean;
  onClose: () => void;
  onMarkAsRead: (notificationId: string) => Promise<void>;
}

export const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  notification,
  visible,
  onClose,
  onMarkAsRead,
}) => {
  const [marking, setMarking] = useState<boolean>(false);

  if (!notification) return null;

  const handleMark = async () => {
    setMarking(true);
    try {
      await onMarkAsRead(notification.id);
    } finally {
      setMarking(false);
      onClose();
    }
  };

  const formatDate = (isoString: string): string => {
    try {
      const d = new Date(isoString);
      return `${d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })} at ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch {
      return isoString;
    }
  };

  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <AppCard style={styles.modalCard}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <View style={styles.typeBadge}>
                  <AppText variant="caption" weight="bold" color={theme.colors.primaryDark}>
                    ● {notification.type} ALERT
                  </AppText>
                </View>

                <TouchableOpacity onPress={onClose} style={styles.closeIconBtn}>
                  <AppText variant="body" color={theme.colors.textMuted} weight="bold">
                    ✕
                  </AppText>
                </TouchableOpacity>
              </View>

              {/* Title & Date */}
              <AppText variant="h2" weight="bold" color={theme.colors.textPrimary} style={styles.title}>
                {notification.title}
              </AppText>

              <AppText variant="caption" color={theme.colors.textMuted} style={styles.dateText}>
                📅 {formatDate(notification.createdAt)}
              </AppText>

              <View style={styles.divider} />

              {/* Message Body */}
              <View style={styles.messageBox}>
                <AppText variant="body" color={theme.colors.textPrimary} style={styles.messageText}>
                  {notification.message}
                </AppText>
              </View>

              {/* Footer Actions */}
              <View style={styles.footer}>
                {!notification.read ? (
                  <AppButton
                    title="Mark as Read"
                    onPress={handleMark}
                    loading={marking}
                    style={styles.actionBtn}
                  />
                ) : (
                  <View style={styles.readIndicator}>
                    <AppText variant="caption" color={theme.colors.success} weight="semibold">
                      ✓ Marked as Read
                    </AppText>
                  </View>
                )}

                <AppButton
                  title="Close"
                  variant="outline"
                  onPress={onClose}
                  disabled={marking}
                  style={styles.actionBtn}
                />
              </View>
            </AppCard>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    padding: theme.spacing.xl,
    gap: theme.spacing.xs,
    borderRadius: theme.borderRadius.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  typeBadge: {
    backgroundColor: theme.colors.primaryMuted,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 3,
    borderRadius: theme.borderRadius.sm,
  },
  closeIconBtn: {
    padding: theme.spacing.xs,
  },
  title: {
    marginTop: theme.spacing.xs,
    letterSpacing: -0.5,
  },
  dateText: {
    marginBottom: theme.spacing.xs,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.sm,
  },
  messageBox: {
    backgroundColor: theme.colors.surfaceSubtle,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginVertical: theme.spacing.xs,
  },
  messageText: {
    lineHeight: 22,
  },
  footer: {
    gap: theme.spacing.sm,
    marginTop: theme.spacing.md,
  },
  actionBtn: {
    width: '100%',
  },
  readIndicator: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xs,
  },
});

export default NotificationDetailModal;
