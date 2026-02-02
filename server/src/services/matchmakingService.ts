import { MatchmakingPlayer, MatchFound } from '../types';
import { GameSessionModel } from '../models/GameSession';

class MatchmakingQueue {
  private queue: MatchmakingPlayer[] = [];
  private readonly MATCH_SIZE = 6; // 3v3

  addPlayer(player: MatchmakingPlayer): void {
    const existingIndex = this.queue.findIndex((p) => p.userId === player.userId);
    if (existingIndex !== -1) {
      this.queue[existingIndex] = player;
    } else {
      this.queue.push(player);
    }
  }

  removePlayer(userId: string): boolean {
    const initialLength = this.queue.length;
    this.queue = this.queue.filter((p) => p.userId !== userId);
    return this.queue.length < initialLength;
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  getPlayerPosition(userId: string): number {
    const index = this.queue.findIndex((p) => p.userId === userId);
    return index === -1 ? -1 : index + 1;
  }

  async tryMatchPlayers(): Promise<MatchFound | null> {
    if (this.queue.length < this.MATCH_SIZE) {
      return null;
    }

    const sortedQueue = [...this.queue].sort((a, b) => {
      const rankDiff = Math.abs(a.rankPoints - b.rankPoints);
      if (rankDiff < 100) {
        return a.joinedQueueAt.getTime() - b.joinedQueueAt.getTime();
      }
      return rankDiff;
    });

    const selectedPlayers = sortedQueue.slice(0, this.MATCH_SIZE);

    const teamA: MatchmakingPlayer[] = [];
    const teamB: MatchmakingPlayer[] = [];

    const sortedByRank = [...selectedPlayers].sort((a, b) => b.rankPoints - a.rankPoints);

    for (let i = 0; i < sortedByRank.length; i++) {
      if (i % 2 === 0) {
        teamA.push(sortedByRank[i]);
      } else {
        teamB.push(sortedByRank[i]);
      }
    }

    const session = await GameSessionModel.create('waiting');

    for (const player of teamA) {
      await GameSessionModel.addPlayer(session.id, player.userId, 'A');
      this.removePlayer(player.userId);
    }

    for (const player of teamB) {
      await GameSessionModel.addPlayer(session.id, player.userId, 'B');
      this.removePlayer(player.userId);
    }

    await GameSessionModel.updateStatus(session.id, 'in_progress');

    return {
      sessionId: session.id,
      teamA,
      teamB,
    };
  }

  clear(): void {
    this.queue = [];
  }
}

export class MatchmakingService {
  private static queue = new MatchmakingQueue();

  static addToQueue(player: MatchmakingPlayer): void {
    this.queue.addPlayer(player);
  }

  static removeFromQueue(userId: string): boolean {
    return this.queue.removePlayer(userId);
  }

  static getQueueSize(): number {
    return this.queue.getQueueSize();
  }

  static getPlayerPosition(userId: string): number {
    return this.queue.getPlayerPosition(userId);
  }

  static async attemptMatch(): Promise<MatchFound | null> {
    return this.queue.tryMatchPlayers();
  }

  static clearQueue(): void {
    this.queue.clear();
  }
}
