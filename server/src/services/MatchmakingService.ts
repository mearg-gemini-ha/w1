import { Server, Socket } from 'socket.io';
import { GameSessionService } from './GameSessionService';
import { PlayerStatsModel } from '../models/PlayerStats';
import { UserProfileModel } from '../models/UserProfile';

interface QueuePlayer {
  userId: string;
  socketId: string;
  mmr: number;
  timestamp: number;
  username: string;
}

export class MatchmakingService {
  private static queue: QueuePlayer[] = [];
  private static isProcessing = false;
  private static matchmakingTimeout = 30000;
  private static minPlayers = 6;

  static initialize(io: Server): void {
    io.on('connection', (socket: Socket) => {
      socket.on('matchmaking:join', (data: { userId: string; token: string }) => {
        void this.handleJoinQueue(socket, io, data);
      });

      socket.on('matchmaking:cancel', (data: { userId: string }) => {
        this.handleCancelQueue(socket, io, data);
      });

      socket.on('disconnect', () => {
        this.handleDisconnect(socket);
      });
    });

    setInterval(() => this.processMatchmaking(io), 5000);
  }

  private static async handleJoinQueue(
    socket: Socket,
    io: Server,
    data: { userId: string; token: string }
  ): Promise<void> {
    try {
      const existingPlayer = this.queue.find(p => p.userId === data.userId);
      if (existingPlayer) {
        socket.emit('matchmaking:error', { message: 'Already in queue' });
        return;
      }

      const playerStats = await PlayerStatsModel.findByUserId(data.userId);
      const userProfile = await UserProfileModel.findByUserId(data.userId);

      if (!playerStats) {
        socket.emit('matchmaking:error', { message: 'Player stats not found' });
        return;
      }

      const queuePlayer: QueuePlayer = {
        userId: data.userId,
        socketId: socket.id,
        mmr: playerStats.current_mmr || 1500,
        timestamp: Date.now(),
        username: userProfile?.display_name || data.userId,
      };

      this.queue.push(queuePlayer);
      socket.join('matchmaking');

      const position = this.getQueuePosition(data.userId);
      socket.emit('matchmaking:joined', { position, estimatedWait: this.getEstimatedWaitTime() });

      this.broadcastQueueStatus(io);

      if (this.queue.length >= this.minPlayers) {
        setTimeout(() => this.processMatchmaking(io), 1000);
      }
    } catch (error) {
      socket.emit('matchmaking:error', { message: 'Failed to join queue' });
    }
  }

  private static handleCancelQueue(
    socket: Socket,
    io: Server,
    data: { userId: string }
  ): void {
    const playerIndex = this.queue.findIndex(p => p.userId === data.userId);
    if (playerIndex === -1) {
      socket.emit('matchmaking:error', { message: 'Not in queue' });
      return;
    }

    this.queue.splice(playerIndex, 1);
    socket.leave('matchmaking');
    socket.emit('matchmaking:cancelled');
    this.broadcastQueueStatus(io);
  }

  private static handleDisconnect(socket: Socket): void {
    const playerIndex = this.queue.findIndex(p => p.socketId === socket.id);
    if (playerIndex !== -1) {
      this.queue.splice(playerIndex, 1);
    }
  }

  private static async processMatchmaking(io: Server): Promise<void> {
    if (this.isProcessing || this.queue.length < this.minPlayers) {
      return;
    }

    this.isProcessing = true;

    try {
      const sortedQueue = [...this.queue].sort((a, b) => a.mmr - b.mmr);
      const selectedPlayers = this.selectFairMatch(sortedQueue);

      if (selectedPlayers.length >= this.minPlayers) {
        await this.createMatch(selectedPlayers.slice(0, this.minPlayers), io);
        this.queue = this.queue.filter(p => !selectedPlayers.find(sp => sp.userId === p.userId));
      }
    } catch (error) {
      console.error('Matchmaking error:', error);
    } finally {
      this.isProcessing = false;
    }
  }

  private static selectFairMatch(queue: QueuePlayer[]): QueuePlayer[] {
    const selected: QueuePlayer[] = [];

    for (let i = 0; i < queue.length && selected.length < this.minPlayers; i++) {
      const player = queue[i];
      const avgMMR =
        selected.reduce((sum, p) => sum + p.mmr, 0) / (selected.length || 1);

      const mmrDiff = Math.abs(player.mmr - avgMMR);
      const timeInQueue = Date.now() - player.timestamp;

      const bracket = timeInQueue > this.matchmakingTimeout ? 300 : timeInQueue > 15000 ? 150 : 100;

      if (selected.length === 0 || mmrDiff <= bracket) {
        if (!selected.find(p => p.userId === player.userId)) {
          selected.push(player);
        }
      }
    }

    return selected;
  }

  private static async createMatch(players: QueuePlayer[], io: Server): Promise<void> {
    const teamA: QueuePlayer[] = [];
    const teamB: QueuePlayer[] = [];

    const sortedPlayers = [...players].sort((a, b) => b.mmr - a.mmr);

    for (let i = 0; i < sortedPlayers.length; i++) {
      if (i % 2 === 0) {
        if (this.getTeamMMR(teamA) <= this.getTeamMMR(teamB)) {
          teamA.push(sortedPlayers[i]);
        } else {
          teamB.push(sortedPlayers[i]);
        }
      } else {
        if (this.getTeamMMR(teamB) <= this.getTeamMMR(teamA)) {
          teamB.push(sortedPlayers[i]);
        } else {
          teamA.push(sortedPlayers[i]);
        }
      }
    }

    while (teamA.length < 3 && sortedPlayers.length > 0) {
      const player = sortedPlayers.pop();
      if (player) teamA.push(player);
    }
    while (teamB.length < 3 && sortedPlayers.length > 0) {
      const player = sortedPlayers.pop();
      if (player) teamB.push(player);
    }

    try {
      const session = await GameSessionService.createSession({
        team_a_ids: teamA.map(p => p.userId),
        team_b_ids: teamB.map(p => p.userId),
      });

      const matchData = {
        sessionId: session.id,
        teamA: teamA.map(p => ({ userId: p.userId, username: p.username, mmr: p.mmr })),
        teamB: teamB.map(p => ({ userId: p.userId, username: p.username, mmr: p.mmr })),
      };

      [...teamA, ...teamB].forEach(player => {
        io.to(player.socketId).emit('match:found', matchData);
        const socket = io.sockets.sockets.get(player.socketId);
        if (socket) {
          socket.leave('matchmaking');
          socket.join(`game:${session.id}`);
        }
      });

      io.to('matchmaking').emit('notification:queue-update', {
        playersInQueue: this.queue.length,
      });
    } catch (error) {
      console.error('Failed to create match:', error);
      [...teamA, ...teamB].forEach(player => {
        io.to(player.socketId).emit('matchmaking:error', { message: 'Failed to create match' });
      });
    }
  }

  private static getTeamMMR(team: QueuePlayer[]): number {
    if (team.length === 0) return 0;
    return team.reduce((sum, player) => sum + player.mmr, 0) / team.length;
  }

  private static getQueuePosition(userId: string): number {
    return this.queue.findIndex(p => p.userId === userId) + 1;
  }

  private static getEstimatedWaitTime(): number {
    if (this.queue.length < this.minPlayers) {
      return Math.ceil((this.minPlayers - this.queue.length) * 30);
    }
    return 30;
  }

  private static broadcastQueueStatus(io: Server): void {
    io.to('matchmaking').emit('notification:queue-update', {
      playersInQueue: this.queue.length,
      estimatedWait: this.getEstimatedWaitTime(),
    });
  }

  static getQueueStatus(): { playersInQueue: number; estimatedWait: number } {
    return {
      playersInQueue: this.queue.length,
      estimatedWait: this.getEstimatedWaitTime(),
    };
  }

  static removePlayer(userId: string): void {
    const playerIndex = this.queue.findIndex(p => p.userId === userId);
    if (playerIndex !== -1) {
      this.queue.splice(playerIndex, 1);
    }
  }
}