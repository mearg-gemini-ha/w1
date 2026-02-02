import { Server as SocketIOServer, Socket } from 'socket.io';
import { MatchmakingService } from '../services/matchmakingService';
import { UserModel } from '../models/User';
import { PlayerStatsModel } from '../models/PlayerStats';
import { MatchmakingPlayer } from '../types';

const userSocketMap = new Map<string, string>();

export const setupMatchmakingHandlers = (io: SocketIOServer, socket: Socket): void => {
  socket.on('matchmaking:join', async (data: { userId: string }) => {
    try {
      const { userId } = data;

      let username = userId;
      let rankPoints = 1000;

      const user = await UserModel.findById(userId);
      if (user) {
        username = user.username;
        const stats = await PlayerStatsModel.getOrCreate(userId);
        rankPoints = stats.rank_points;
      } else {
        username = userId.substring(0, 12);
      }

      const player: MatchmakingPlayer = {
        userId,
        username,
        rankPoints,
        socketId: socket.id,
        joinedQueueAt: new Date(),
      };

      MatchmakingService.addToQueue(player);
      userSocketMap.set(userId, socket.id);

      const queueSize = MatchmakingService.getQueueSize();
      const position = MatchmakingService.getPlayerPosition(userId);

      socket.emit('matchmaking:joined', {
        position,
        queueSize,
        estimatedWaitTime: Math.ceil((6 - queueSize) * 10),
      });

      io.emit('matchmaking:queue-update', {
        queueSize,
      });

      tryMatchmaking(io);
    } catch (error) {
      console.error('Error joining matchmaking:', error);
      socket.emit('matchmaking:error', { message: 'Failed to join matchmaking' });
    }
  });

  socket.on('matchmaking:leave', async (data: { userId: string }) => {
    try {
      const { userId } = data;
      const removed = MatchmakingService.removeFromQueue(userId);

      if (removed) {
        userSocketMap.delete(userId);
        socket.emit('matchmaking:left');

        const queueSize = MatchmakingService.getQueueSize();
        io.emit('matchmaking:queue-update', {
          queueSize,
        });
      }
    } catch (error) {
      console.error('Error leaving matchmaking:', error);
      socket.emit('matchmaking:error', { message: 'Failed to leave matchmaking' });
    }
  });

  socket.on('disconnect', () => {
    for (const [userId, socketId] of userSocketMap.entries()) {
      if (socketId === socket.id) {
        MatchmakingService.removeFromQueue(userId);
        userSocketMap.delete(userId);

        const queueSize = MatchmakingService.getQueueSize();
        io.emit('matchmaking:queue-update', {
          queueSize,
        });
        break;
      }
    }
  });
};

async function tryMatchmaking(io: SocketIOServer): Promise<void> {
  const match = await MatchmakingService.attemptMatch();

  if (match) {
    const allPlayers = [...match.teamA, ...match.teamB];

    for (const player of allPlayers) {
      const playerSocket = io.sockets.sockets.get(player.socketId);
      if (playerSocket) {
        playerSocket.emit('matchmaking:found', {
          sessionId: match.sessionId,
          teamA: match.teamA.map((p) => ({
            userId: p.userId,
            username: p.username,
            rankPoints: p.rankPoints,
          })),
          teamB: match.teamB.map((p) => ({
            userId: p.userId,
            username: p.username,
            rankPoints: p.rankPoints,
          })),
          yourTeam: match.teamA.some((p) => p.userId === player.userId) ? 'A' : 'B',
        });

        userSocketMap.delete(player.userId);
      }
    }

    const queueSize = MatchmakingService.getQueueSize();
    io.emit('matchmaking:queue-update', {
      queueSize,
    });
  }
}
