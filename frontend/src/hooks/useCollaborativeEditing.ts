import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

interface EditLock {
  field: string;
  userId: string;
}

interface EditChange {
  field: string;
  value: any;
  userId: string;
}

export const useCollaborativeEditing = (recordId: string) => {
  const [locks, setLocks] = useState<EditLock[]>([]);
  const [changes, setChanges] = useState<Record<string, any>>({});
  const { socket, subscribe, joinRoom, leaveRoom } = useWebSocket();

  useEffect(() => {
    if (recordId) {
      joinRoom(`record:${recordId}`);
      return () => leaveRoom(`record:${recordId}`);
    }
  }, [recordId, joinRoom, leaveRoom]);

  useEffect(() => {
    const unsubscribeLock = subscribe('edit-lock', (data: EditLock) => {
      setLocks(prev => [...prev.filter(l => l.field !== data.field), data]);
    });

    const unsubscribeUnlock = subscribe('edit-unlock', (data: { field: string }) => {
      setLocks(prev => prev.filter(l => l.field !== data.field));
    });

    const unsubscribeChange = subscribe('edit-change', (data: EditChange) => {
      setChanges(prev => ({ ...prev, [data.field]: data.value }));
    });

    return () => {
      unsubscribeLock();
      unsubscribeUnlock();
      unsubscribeChange();
    };
  }, [subscribe]);

  const startEditing = useCallback((field: string) => {
    socket?.emit('edit-start', { recordId, field });
  }, [socket, recordId]);

  const stopEditing = useCallback((field: string) => {
    socket?.emit('edit-end', { recordId, field });
  }, [socket, recordId]);

  const broadcastChange = useCallback((field: string, value: any) => {
    socket?.emit('edit-change', { recordId, field, value });
  }, [socket, recordId]);

  const isFieldLocked = useCallback((field: string) => {
    return locks.some(lock => lock.field === field);
  }, [locks]);

  const getFieldLock = useCallback((field: string) => {
    return locks.find(lock => lock.field === field);
  }, [locks]);

  return {
    locks,
    changes,
    startEditing,
    stopEditing,
    broadcastChange,
    isFieldLocked,
    getFieldLock,
  };
};