import { GameSessionModel } from '../models/GameSession';
import { PlayerStatsModel } from '../models/PlayerStats';
import { UserProfileModel } from '../models/UserProfile';
import { Server, Socket } from 'socket.io';
import { GameSession } from '../types';

export interface GameState {
  players: {
    userId: string;
    health: number;
    position: { x: number; y: number; z: number };
    abilities: { abilityId: string; cooldown: number; available: boolean }[];
    characterId: string;
  }[];
  matchTime: number;
  winningTeam: 'team_a' | 'team_b' | 'draw' | null;
}

interface PlayerAction {
  sessionId: string;
  userId: string;
  action: 'attack' | 'heal' | 'use_ability';
  targetId?: string;
  abilityId?: string;
  position?: { x: number; y: number; z: number };
}

export class GameSessionService {
  private static gameStates = new Map<string, GameState>();

  static initialize(io: Server): void {
    io.on('connection', (socket: Socket) => {
      socket.on('game:player:action', (data: PlayerAction) => {
        void this.handlePlayerAction(socket, io, data);
      });

      socket.on('game:ended', (data: { sessionId: string; surrender?: boolean }) => {
        void this.handleGameEnded(socket, io, data);
      });

      socket.on('disconnect', () => {
        void this.handlePlayerDisconnect(socket, io);
      });
    });
  }

  static async createSession(data: {
    team_a_ids: string[];
    team_b_ids: string[];
    map_id?: string;
  }): Promise<GameSession> {
    const session = await GameSessionModel.create(data);

    const initialGameState: GameState = {
      players: [],
      matchTime: 0,
      winningTeam: null,
    };

    [...data.team_a_ids, ...data.team_b_ids].forEach(userId => {
      initialGameState.players.push({
        userId,
        health: 100,
        position: { x: 0, y: 0, z: 0 },
        abilities: [
          { abilityId: 'primary_attack', cooldown: 0, available: true },
          { abilityId: 'special_ability', cooldown: 10000, available: true },
        ],
        characterId: 'default',
      });
    });

    this.gameStates.set(session.id, initialGameState);

    setTimeout(async () => {
      await this.updateStatus(session.id, 'active');
    }, 5000);

    return session;
  }

  static async updateStatus(
    sessionId: string,
    status: 'waiting' | 'in_progress' | 'finished'
  ): Promise<GameSession | null> {
    const session = await GameSessionModel.updateStatus(sessionId, status);
    return session;
  }

  private static async handlePlayerAction(
    socket: Socket,
    io: Server,
    data: PlayerAction
  ): Promise<void> {
    // Validate player is in session
    // Update game state
    // Broadcast to all players in session
    console.log('Player action:', data);
  }

  private static async handleGameEnded(
    socket: Socket,
    io: Server,
    data: { sessionId: string; surrender?: boolean }
  ): Promise<void> {
    try {
      const session = await GameSessionModel.findById(data.sessionId);
      if (!session) {
        socket.emit('game:error', { message: 'Session not found' });
        return;
      }

      const isPlayerInSession = await GameSessionModel.isPlayerInSession(
        data.sessionId,
        socket.data.userId
      );

      if (!isPlayerInSession) {
        socket.emit('game:error', { message: 'Not authorized for this session' });
        return;
      }

      const gameState = this.gameStates.get(data.sessionId);
      if (!gameState) {
        socket.emit('game:error', { message: 'Game state not found' });
        return;
      }

      const winnerTeam = this.determineWinner(session, gameState);

      await this.endMatch(session.id, winnerTeam);
      this.gameStates.delete(data.sessionId);

      io.to(`game:${session.id}`).emit('game:ended', {
        sessionId: session.id,
        winnerTeam,
        gameState,
      });

      await this.updatePlayerStats(session, winnerTeam);
    } catch (error) {
      console.error('Error ending game:', error);
      socket.emit('game:error', { message: 'Failed to end game' });
    }
  }

  private static determineWinner(
    session: GameSession,
    gameState: GameState
  ): 'team_a' | 'team_b' | 'draw' {
    const teamAAlive = gameState.players
      .filter(p => session.team_a_ids.includes(p.userId))
      .some(p => p.health > 0);

    const teamBAlive = gameState.players
      .filter(p => session.team_b_ids.includes(p.userId))
      .some(p => p.health > 0);

    if (teamAAlive && !teamBAlive) return 'team_a';
    if (teamBAlive && !teamAAlive) return 'team_b';
    return 'draw';
  }

  static async endMatch(
    sessionId: string,
    winnerTeam: 'team_a' | 'team_b' | 'draw'
  ): Promise<void> {
    await GameSessionModel.saveMatchResult(sessionId, winnerTeam);
  }

  static async updatePlayerStats(
    session: GameSession,
    winnerTeam: 'team_a' | 'team_b' | 'draw'
  ): Promise<void> {
    const winnerIds =
      winnerTeam === 'team_a' ? session.team_a_ids : session.team_b_ids;

    const allPlayerIds = [...session.team_a_ids, ...session.team_b_ids];

    for (const userId of allPlayerIds) {
      const isWinner = winnerIds != null && winnerIds.includes(userId);
      const killCount = Math.floor(Math.random() * 5);
      const deathCount = Math.random() > 0.5 ? 1 : 0;

      try {
        await PlayerStatsModel.updateAfterMatch(userId, {
          winner: Boolean(isWinner),
          kills: killCount,
          deaths: deathCount,
        });
      } catch (error) {
        console.error(`Failed to update stats for ${userId}:`, error);
      }
    }
  }

  static getActiveSessions(): any[] {
    return Array.from(this.gameStates.keys()).map(sessionId => ({
      sessionId,
      players: this.gameStates.get(sessionId)?.players.length || 0,
    }));
  }

  private static async handlePlayerDisconnect(socket: Socket, io: Server): Promise<void> {
    const rooms = Array.from(socket.rooms);
    const gameRoom = rooms.find(room => room.startsWith('game:'));

    if (gameRoom) {
      socket.to(gameRoom).emit('game:player:disconnect', {
        userId: socket.data.userId,
        message: 'Player disconnected',
      });
    }
  }

  static async getSessionWithDetails(sessionId: string): Promise<any> {
    const session = await GameSessionModel.findById(sessionId);
    if (!session) {
      return null;
    }

    const allUserIds = [...session.team_a_ids, ...session.team_b_ids];
    const userProfiles = await Promise.all(
      allUserIds.map(async userId => {
        const profile = await UserProfileModel.getFullProfile(userId);
        const stats = await PlayerStatsModel.findByUserId(userId);
        return { ...profile, stats };
      })
    );

    return {
      ...session,
      players: userProfiles,
    };
  }
}