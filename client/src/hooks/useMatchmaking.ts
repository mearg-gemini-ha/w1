import { useEffect, useCallback } from 'react';
import { socketService } from '../services/socket';
import { useMatchmakingStore } from '../store/matchmakingStore';

export const useMatchmaking = (userId: string | null) => {
  const {
    isInQueue,
    queuePosition,
    queueSize,
    estimatedWaitTime,
    matchFound,
    error,
    setInQueue,
    setQueueInfo,
    setQueueSize,
    setMatchFound,
    setError,
    reset,
  } = useMatchmakingStore();

  useEffect(() => {
    const socket = socketService.getSocket();
    if (!socket) return;

    socket.on(
      'matchmaking:joined',
      (data: { position: number; queueSize: number; estimatedWaitTime: number }) => {
        setInQueue(true);
        setQueueInfo(data.position, data.queueSize, data.estimatedWaitTime);
      }
    );

    socket.on('matchmaking:left', () => {
      reset();
    });

    socket.on('matchmaking:queue-update', (data: { queueSize: number }) => {
      setQueueSize(data.queueSize);
    });

    socket.on('matchmaking:found', (data: unknown) => {
      setMatchFound(data as typeof matchFound);
      setInQueue(false);
    });

    socket.on('matchmaking:error', (data: { message: string }) => {
      setError(data.message);
      setInQueue(false);
    });

    return () => {
      socket.off('matchmaking:joined');
      socket.off('matchmaking:left');
      socket.off('matchmaking:queue-update');
      socket.off('matchmaking:found');
      socket.off('matchmaking:error');
    };
  }, [setInQueue, setQueueInfo, setQueueSize, setMatchFound, setError, reset]);

  const joinQueue = useCallback(() => {
    if (!userId) {
      setError('You must be logged in to join matchmaking');
      return;
    }

    const socket = socketService.getSocket();
    if (!socket) {
      setError('Not connected to server');
      return;
    }

    socket.emit('matchmaking:join', { userId });
  }, [userId, setError]);

  const leaveQueue = useCallback(() => {
    if (!userId) return;

    const socket = socketService.getSocket();
    if (!socket) return;

    socket.emit('matchmaking:leave', { userId });
  }, [userId]);

  return {
    isInQueue,
    queuePosition,
    queueSize,
    estimatedWaitTime,
    matchFound,
    error,
    joinQueue,
    leaveQueue,
    clearError: () => setError(null),
  };
};
