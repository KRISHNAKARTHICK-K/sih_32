import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { Client, type IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useAuth } from '../auth/AuthContext';
import type { ConnectionStatus, RealtimeEvent, WebSocketContextValue } from './realtimeTypes';

const WebSocketContext = createContext<WebSocketContextValue | null>(null);

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8080/ws';

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, token } = useAuth();
  const [status, setStatus] = useState<ConnectionStatus>('DISCONNECTED');
  const clientRef = useRef<Client | null>(null);
  const subscriptionsRef = useRef<Map<string, Set<(event: RealtimeEvent) => void>>>(new Map());
  const activeStompSubsRef = useRef<Map<string, { unsubscribe: () => void }>>(new Map());

  // Connect or reconnect when auth token or user changes
  useEffect(() => {
    if (!token || !user) {
      if (clientRef.current) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
      setStatus('DISCONNECTED');
      return;
    }

    setStatus('CONNECTING');

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: (str) => {
        if (import.meta.env.DEV) {
          console.debug('[STOMP Debug]', str);
        }
      },
      onConnect: () => {
        setStatus('CONNECTED');

        // Re-establish existing registered subscriptions upon connection/reconnection
        subscriptionsRef.current.forEach((callbacks, destination) => {
          if (callbacks.size > 0 && !activeStompSubsRef.current.has(destination)) {
            try {
              const stompSub = client.subscribe(destination, (message: IMessage) => {
                try {
                  const event: RealtimeEvent = JSON.parse(message.body);
                  callbacks.forEach((cb) => cb(event));
                } catch (err) {
                  console.error('[STOMP] Failed to parse message body:', err);
                }
              });
              activeStompSubsRef.current.set(destination, stompSub);
            } catch (err) {
              console.error(`[STOMP] Failed to subscribe to destination ${destination}:`, err);
            }
          }
        });
      },
      onDisconnect: () => {
        setStatus('DISCONNECTED');
        activeStompSubsRef.current.clear();
      },
      onStompError: (frame) => {
        console.error('[STOMP Error]', frame.headers['message'], frame.body);
        setStatus('RECONNECTING');
      },
      onWebSocketClose: () => {
        setStatus((prev) => (prev === 'CONNECTED' ? 'RECONNECTING' : 'DISCONNECTED'));
        activeStompSubsRef.current.clear();
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      activeStompSubsRef.current.clear();
      client.deactivate();
      clientRef.current = null;
      setStatus('DISCONNECTED');
    };
  }, [token, user]);

  const subscribe = useCallback((destination: string, callback: (event: RealtimeEvent) => void) => {
    let callbacks = subscriptionsRef.current.get(destination);
    if (!callbacks) {
      callbacks = new Set();
      subscriptionsRef.current.set(destination, callbacks);
    }
    callbacks.add(callback);

    // If client is currently connected and this is the first callback for this destination, subscribe via STOMP
    const client = clientRef.current;
    if (client && client.connected && !activeStompSubsRef.current.has(destination)) {
      try {
        const stompSub = client.subscribe(destination, (message: IMessage) => {
          try {
            const event: RealtimeEvent = JSON.parse(message.body);
            const currentCallbacks = subscriptionsRef.current.get(destination);
            if (currentCallbacks) {
              currentCallbacks.forEach((cb) => cb(event));
            }
          } catch (err) {
            console.error('[STOMP] Failed to parse message body:', err);
          }
        });
        activeStompSubsRef.current.set(destination, stompSub);
      } catch (err) {
        console.error(`[STOMP] Subscription error for ${destination}:`, err);
      }
    }

    // Unsubscribe function
    return () => {
      const currentCallbacks = subscriptionsRef.current.get(destination);
      if (currentCallbacks) {
        currentCallbacks.delete(callback);
        if (currentCallbacks.size === 0) {
          subscriptionsRef.current.delete(destination);
          const activeSub = activeStompSubsRef.current.get(destination);
          if (activeSub) {
            activeSub.unsubscribe();
            activeStompSubsRef.current.delete(destination);
          }
        }
      }
    };
  }, []);

  const send = useCallback((destination: string, body: unknown) => {
    const client = clientRef.current;
    if (client && client.connected) {
      client.publish({
        destination,
        body: JSON.stringify(body),
      });
    } else {
      console.warn('[STOMP] Cannot send message: client is not connected.');
    }
  }, []);

  return (
    <WebSocketContext.Provider value={{ status, subscribe, send }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = (): WebSocketContextValue => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};
