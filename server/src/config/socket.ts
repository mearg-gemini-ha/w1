import { AuthService } from '../services/authService';
import { Server, Socket } from 'socket.io';
import { MatchmakingService } from '../services/MatchmakingService';
import { GameSessionService } from '../services/GameSessionService';

export const setupSocketEvents = (io: Server): void => {
  io.use(async (socket: Socket, next: any) => {
    const token = socket.handshake.auth?.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = AuthService.verifyToken(token);
      socket.data.userId = decoded.userId;
      next();
    } catch (error) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  MatchmakingService.initialize(io);
  GameSessionService.initialize(io);

  io.on('connection', (socket: Socket) => {
    console.info(`Authenticated client connected: ${socket.id} (userId: ${socket.data.userId})`);

    socket.on('disconnect', () => {
      console.info(`Client disconnected: ${socket.id}`);
    });
  });
};

export const sendToRoom = (io: Server, room: string, event: string, data: any): void => {
  io.to(room).emit(event, data);
};

export const sendToSocket = (io: Server, socketId: string, event: string, data: any): void => {
  io.to(socketId).emit(event, data);
};