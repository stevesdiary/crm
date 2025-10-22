import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface UseWebSocketOptions {
  userId?: string;
  tenantId?: string;
  onNotification?: (notification: any) => void;
  onDataUpdate?: (update: any) => void;
}

export const useWebSocket = (options: UseWebSocketOptions) => {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!options.userId || !options.tenantId) return;

    const socket = io('http://localhost:3004', {
      query: {
        userId: options.userId,
        tenantId: options.tenantId,
      },
    });

    socket.on('connect', () => {
      setConnected(true);
    });

    socket.on('disconnect', () => {
      setConnected(false);
    });

    socket.on('notification', (notification) => {
      options.onNotification?.(notification);
    });

    socket.on('data:update', (update) => {
      options.onDataUpdate?.(update);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, [options.userId, options.tenantId]);

  const lockField = (entity: string, id: string, field: string) => {
    socketRef.current?.emit('lock:field', { entity, id, field });
  };

  const unlockField = (entity: string, id: string, field: string) => {
    socketRef.current?.emit('unlock:field', { entity, id, field });
  };

  return { connected, lockField, unlockField };
};