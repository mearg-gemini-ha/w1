import { pool } from '../config/database';
import { PlayerStats } from '../types';

export class PlayerStatsModel {
  static async findByUserId(userId: string): Promise<PlayerStats | null> {
    const query = 'SELECT * FROM player_stats WHERE user_id = $1';
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  }

  static async create(userId: string): Promise<PlayerStats> {
    const query = `
      INSERT INTO player_stats (user_id, matches_played, wins, losses, rank_points)
      VALUES ($1, 0, 0, 0, 1000)
      RETURNING *
    `;

    const result = await pool.query(query, [userId]);
    return result.rows[0];
  }

  static async getOrCreate(userId: string): Promise<PlayerStats> {
    let stats = await this.findByUserId(userId);
    if (!stats) {
      stats = await this.create(userId);
    }
    return stats;
  }

  static async updateStats(
    userId: string,
    data: {
      matches_played?: number;
      wins?: number;
      losses?: number;
      rank_points?: number;
    }
  ): Promise<PlayerStats | null> {
    const fields = Object.keys(data)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');
    const values = Object.values(data);

    const query = `
      UPDATE player_stats
      SET ${fields}, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [userId, ...values]);
    return result.rows[0] || null;
  }

  static async incrementMatches(userId: string, won: boolean): Promise<PlayerStats | null> {
    const query = `
      UPDATE player_stats
      SET matches_played = matches_played + 1,
          ${won ? 'wins = wins + 1' : 'losses = losses + 1'},
          rank_points = rank_points + $2,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = $1
      RETURNING *
    `;

    const rankChange = won ? 25 : -15;
    const result = await pool.query(query, [userId, rankChange]);
    return result.rows[0] || null;
  }
}
