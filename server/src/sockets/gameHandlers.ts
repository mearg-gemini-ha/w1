import { Server as SocketIOServer, Socket } from 'socket.io';

interface GamePlayerState {
  userId: string;
  x: number;
  y: number;
  team?: 'A' | 'B';
}

interface GameSessionState {
  sessionId: string;
  players: Map<string, GamePlayerState>;
}

const sessionStates = new Map<string, GameSessionState>();

export const setupGameHandlers = (io: SocketIOServer, socket: Socket): void => {
  socket.on(
    'game:join-session',
    (data: { sessionId: string; userId: string; team?: 'A' | 'B' }) => {
      const { sessionId, userId, team } = data;
      const sessionState = getOrCreateSession(sessionId);

      const playerState = createPlayerState(sessionState, userId, team);
      sessionState.players.set(userId, playerState);

      socket.join(getRoomName(sessionId));
      socket.data.sessionId = sessionId;
      socket.data.userId = userId;

      socket.emit('game:state', {
        sessionId,
        players: Array.from(sessionState.players.values()),
      });

      socket.to(getRoomName(sessionId)).emit('game:player-joined', playerState);
    }
  );

  socket.on(
    'game:player-move',
    (data: { sessionId: string; userId: string; x: number; y: number }) => {
      const { sessionId, userId, x, y } = data;
      const sessionState = sessionStates.get(sessionId);
      if (!sessionState) return;

      const playerState = sessionState.players.get(userId);
      if (!playerState) return;

      playerState.x = x;
      playerState.y = y;

      socket.to(getRoomName(sessionId)).emit('game:player-update', playerState);
    }
  );

  socket.on('game:leave-session', (data: { sessionId: string; userId: string }) => {
    removePlayerFromSession(io, data.sessionId, data.userId);
  });

  socket.on('disconnect', () => {
    const sessionId = socket.data.sessionId as string | undefined;
    const userId = socket.data.userId as string | undefined;
    if (sessionId && userId) {
      removePlayerFromSession(io, sessionId, userId);
    }
  });
};

const getRoomName = (sessionId: string): string => `session:${sessionId}`;

const getOrCreateSession = (sessionId: string): GameSessionState => {
  const existing = sessionStates.get(sessionId);
  if (existing) return existing;

  const state: GameSessionState = {
    sessionId,
    players: new Map(),
  };
  sessionStates.set(sessionId, state);
  return state;
};

const createPlayerState = (
  sessionState: GameSessionState,
  userId: string,
  team?: 'A' | 'B'
): GamePlayerState => {
  const safeTeam: 'A' | 'B' = team ?? (sessionState.players.size % 2 === 0 ? 'A' : 'B');
  const teamIndex = Array.from(sessionState.players.values()).filter(
    (player) => player.team === safeTeam
  ).length;

  const baseX = safeTeam === 'A' ? 220 : 1060;
  const baseY = 200 + teamIndex * 90;

  return {
    userId,
    x: baseX,
    y: baseY,
    team: safeTeam,
  };
};

const removePlayerFromSession = (io: SocketIOServer, sessionId: string, userId: string): void => {
  const sessionState = sessionStates.get(sessionId);
  if (!sessionState) return;

  const removed = sessionState.players.delete(userId);
  if (!removed) return;

  io.to(getRoomName(sessionId)).emit('game:player-left', { userId });

  if (sessionState.players.size === 0) {
    sessionStates.delete(sessionId);
  }
};
