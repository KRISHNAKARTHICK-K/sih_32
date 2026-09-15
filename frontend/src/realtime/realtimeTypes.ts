export type RealtimeEventType =
  | 'QUEUE_UPDATED'
  | 'TOKEN_CALLED'
  | 'TOKEN_UPDATED'
  | 'TOKEN_STATUS_CHANGED'
  | 'BOOKING_CREATED'
  | 'BOOKING_UPDATED'
  | 'WEIGHMENT_COMPLETED'
  | 'QUALITY_COMPLETED'
  | 'PROCUREMENT_COMPLETED'
  | 'INTAKE_STATUS_UPDATED'
  | 'PAYMENT_PROCESSED'
  | 'PAYMENT_UPDATED'
  | 'SLOT_UPDATED'
  | 'NOTIFICATION_CREATED';

export interface RealtimeEvent<T = unknown> {
  eventId: string;
  eventType: RealtimeEventType;
  centreId?: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  payload: T;
}

export type ConnectionStatus = 'CONNECTED' | 'CONNECTING' | 'DISCONNECTED' | 'RECONNECTING';

export interface WebSocketContextValue {
  status: ConnectionStatus;
  subscribe: (destination: string, callback: (event: RealtimeEvent) => void) => () => void;
  send: (destination: string, body: unknown) => void;
}
