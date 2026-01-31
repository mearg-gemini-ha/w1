import { pool } from '../config/database';
import { PlayerStats } from '../types';

export class PlayerStatsModel {
  static async findByUserId(userId: string): Promise<PlayerStats | null> {
    const result = await pool.query('SELECT * FROM player_stats WHERE user_id = $1', [userId]);
    return result.rows[0] || null;
  }

  static async create(userId: string): Promise<PlayerStats> {
    const result = await pool.query(
      `INSERT INTO player_stats 
       (user_id, matches_played, wins, losses, kills_total, deaths_total, win_rate, current_mmr) 
       VALUES ($1, 0, 0, 0, 0, 0, 0, 1500) RETURNING *`,
      [userId]
    );
    return result.rows[0];
  }

  static async updateAfterMatch(
    userId: string,
    matchData: {
      winner: boolean;
      kills: number;
      deaths: number;
    }
  ): Promise<PlayerStats | null> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const currentStats = await this.findByUserId(userId);
      if (!currentStats) {
        throw new Error('Player stats not found');
      }

      let mmrChange = 25;

      if (matchData.winner) {
        mmrChange = Math.round(25 + Math.random() * 10);
      } else {
        mmrChange = -Math.round(25 - Math.random() * 10);
      }

      const newMatchesPlayed = currentStats.matches_played + 1;
      const newWins = currentStats.wins + (matchData.winner ? 1 : 0);
      const newLosses = currentStats.losses + (matchData.winner ? 0 : 1);
      const newKills = (currentStats.kills_total || 0) + matchData.kills;
      const newDeaths = (currentStats.deaths_total || 0) + matchData.deaths;
      const newWinRate = Math.round((newWins / newMatchesPlayed) * 100);
      const newMmr = Math.max(0, (currentStats.current_mmr || 1500) + mmrChange);

      const result = await client.query(
        `UPDATE player_stats 
         SET 
           matches_played = $1,
           wins = $2,
           losses = $3,
           kills_total = $4,
           deaths_total = $5,
           win_rate = $6,
           current_mmr = $7,
           most_played_character_id = COALESCE($8, most_played_character_id),
           updated_at = CURRENT_TIMESTAMP
         WHERE user_id = $9 RETURNING *`,
        [
          newMatchesPlayed,
          newWins,
          newLosses,
          newKills,
          newDeaths,
          newWinRate,
          newMmr,
          null,
          userId,
        ]
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getTopPlayers(limit: number = 100): Promise<any[]> {
    const result = await pool.query(
      `SELECT 
        u.id,
        u.username,
        u.avatar_url,
        ps.current_mmr,
        ps.win_rate,
        ps.matches_played
       FROM users u
       JOIN player_stats ps ON u.id = ps.user_id
       ORDER BY ps.current_mmr DESC
       LIMIT $1`,
      [limit]
    );
    return result.rows;
  }

  static async getLeaderboard(season?: string): Promise<any[]> {
    const query = season
      ? `SELECT 
          u.id,
          u.username,
          u.avatar_url,
          ps.current_mmr,
          ps.win_rate,
          ps.matches_played
         FROM users u
         JOIN player_stats ps ON u.id = ps.user_id
         ORDER BY ps.current_mmr DESC`
      : `SELECT 
          u.id,
          u.username,
          u.avatar_url,
          ps.current_mmr,
          ps.win_rate,
          ps.matches_played
         FROM users u
         JOIN player_stats ps ON u.id = ps.user_id
         ORDER BY ps.current_mmr DESC`;

    const result = await pool.query(query);
    return result.rows;
  }

  static async getKillDeathRatio(userId: string): Promise<number> {
    const result = await pool.query(
      `SELECT 
         CASE 
           WHEN deaths_total = 0 THEN kills_total
           ELSE kills_total::FLOAT / deaths_total::FLOAT 
         END as kd_ratio
       FROM player_stats 
       WHERE user_id = $1`,
      [userId]
    );
    return result.rows[0]?.kd_ratio || 0;
  }
}