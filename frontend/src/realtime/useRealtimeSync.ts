import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthContext';
import { useWebSocket } from './WebSocketContext';
import type { RealtimeEvent } from './realtimeTypes';

const MAX_SEEN_EVENTS = 200;

export const useRealtimeSync = () => {
  const queryClient = useQueryClient();
  const { user, role } = useAuth();
  const { subscribe } = useWebSocket();
  const seenEventsRef = useRef<Set<string>>(new Set());

  const handleEvent = (event: RealtimeEvent) => {
    if (!event || !event.eventId) return;

    // Deduplication check
    if (seenEventsRef.current.has(event.eventId)) {
      return;
    }
    seenEventsRef.current.add(event.eventId);
    if (seenEventsRef.current.size > MAX_SEEN_EVENTS) {
      const firstKey = seenEventsRef.current.values().next().value;
      if (firstKey) {
        seenEventsRef.current.delete(firstKey);
      }
    }

    console.info(`[Realtime Sync] Received event ${event.eventType} (${event.entityType}: ${event.entityId})`);

    switch (event.eventType) {
      case 'NOTIFICATION_CREATED':
        queryClient.invalidateQueries({ queryKey: ['unread-notifications-count'] });
        queryClient.invalidateQueries({ queryKey: ['farmer-notifications'] });
        break;

      case 'QUEUE_UPDATED':
      case 'TOKEN_CALLED':
      case 'TOKEN_UPDATED':
        queryClient.invalidateQueries({ queryKey: ['queue-overview'] });
        queryClient.invalidateQueries({ queryKey: ['operator-queue'] });
        queryClient.invalidateQueries({ queryKey: ['manager-queue'] });
        queryClient.invalidateQueries({ queryKey: ['manager-operations'] });
        queryClient.invalidateQueries({ queryKey: ['farmer-queue-tokens'] });
        queryClient.invalidateQueries({ queryKey: ['farmer-dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['operator-dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
        break;

      case 'BOOKING_CREATED':
        queryClient.invalidateQueries({ queryKey: ['centre-bookings'] });
        queryClient.invalidateQueries({ queryKey: ['manager-bookings'] });
        queryClient.invalidateQueries({ queryKey: ['farmer-bookings'] });
        queryClient.invalidateQueries({ queryKey: ['farmer-dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['admin-bookings'] });
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['queue-overview'] });
        break;

      case 'WEIGHMENT_COMPLETED':
      case 'QUALITY_COMPLETED':
      case 'PROCUREMENT_COMPLETED':
        queryClient.invalidateQueries({ queryKey: ['centre-procurements'] });
        queryClient.invalidateQueries({ queryKey: ['manager-procurement'] });
        queryClient.invalidateQueries({ queryKey: ['farmer-procurements'] });
        queryClient.invalidateQueries({ queryKey: ['operator-weighment'] });
        queryClient.invalidateQueries({ queryKey: ['operator-quality'] });
        queryClient.invalidateQueries({ queryKey: ['manager-operations'] });
        queryClient.invalidateQueries({ queryKey: ['farmer-dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['operator-dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['admin-procurement'] });
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['queue-overview'] });
        break;

      case 'PAYMENT_PROCESSED':
        queryClient.invalidateQueries({ queryKey: ['centre-payments'] });
        queryClient.invalidateQueries({ queryKey: ['manager-payments'] });
        queryClient.invalidateQueries({ queryKey: ['farmer-payments'] });
        queryClient.invalidateQueries({ queryKey: ['farmer-dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
        queryClient.invalidateQueries({ queryKey: ['admin-payments'] });
        queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
        break;

      case 'SLOT_UPDATED':
        queryClient.invalidateQueries({ queryKey: ['centre-slots'] });
        queryClient.invalidateQueries({ queryKey: ['slots'] });
        queryClient.invalidateQueries({ queryKey: ['available-slots'] });
        queryClient.invalidateQueries({ queryKey: ['manager-slots'] });
        queryClient.invalidateQueries({ queryKey: ['manager-dashboard'] });
        break;

      default:
        break;
    }
  };

  useEffect(() => {
    if (!user) return;

    const unsubs: Array<() => void> = [];

    // 1. User-specific notifications
    unsubs.push(subscribe('/user/queue/notifications', handleEvent));
    unsubs.push(subscribe('/user/queue/payments', handleEvent));

    // 2. Centre-specific topics (for Operator, Centre Manager, or Farmer assigned to centre)
    if (user.centreId) {
      unsubs.push(subscribe(`/topic/centres/${user.centreId}/queue`, handleEvent));
      unsubs.push(subscribe(`/topic/centres/${user.centreId}/bookings`, handleEvent));
      unsubs.push(subscribe(`/topic/centres/${user.centreId}/procurements`, handleEvent));
      unsubs.push(subscribe(`/topic/centres/${user.centreId}/payments`, handleEvent));
      unsubs.push(subscribe(`/topic/centres/${user.centreId}/slots`, handleEvent));
    }

    // 3. Admin-specific global telemetry topic
    if (role === 'ADMIN') {
      unsubs.push(subscribe('/topic/admin/operations', handleEvent));
    }

    return () => {
      unsubs.forEach((unsub) => unsub());
    };
  }, [user, role, subscribe]);
};
