import { pool } from '../config/database';
import { GameSession, GameSessionPlayer } from '../types';

export class GameSessionModel {
  static async create(
    status: 'waiting' | 'in_progress' | 'finished' = 'waiting'
  ): Promise<GameSession> {
    const query = `
      INSERT INTO game_sessions (status)
      VALUES ($1)
      RETURNING *
    `;

    const result = await pool.query(query, [status]);
    return result.rows[0];
  }

  static async findById(id: string): Promise<GameSession | null> {
    const query = 'SELECT * FROM game_sessions WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  static async updateStatus(
    id: string,
    status: 'waiting' | 'in_progress' | 'finished'
  ): Promise<GameSession | null> {
    const query = `
      UPDATE game_sessions
      SET status = $1, finished_at = CASE WHEN $1 = 'finished' THEN CURRENT_TIMESTAMP ELSE finished_at END
      WHERE id = $2
      RETURNING *
    `;

    const result = await pool.query(query, [status, id]);
    return result.rows[0] || null;
  }

  static async addPlayer(
    sessionId: string,
    userId: string,
    team: 'A' | 'B'
  ): Promise<GameSessionPlayer | null> {
    try {
      const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);

      if (userCheck.rows.length === 0) {
        console.warn(`User ${userId} not found in database, skipping player insertion`);
        return null;
      }

      const query = `
        INSERT INTO game_session_players (game_session_id, user_id, team)
        VALUES ($1, $2, $3)
        RETURNING *
      `;

      const result = await pool.query(query, [sessionId, userId, team]);
      return result.rows[0];
    } catch (error) {
      console.error('Error adding player to session:', error);
      return null;
    }
  }

  static async getPlayers(sessionId: string): Promise<GameSessionPlayer[]> {
    const query = `
      SELECT gsp.*, u.username
      FROM game_session_players gsp
      JOIN users u ON gsp.user_id = u.id
      WHERE gsp.game_session_id = $1
      ORDER BY gsp.joined_at
    `;

    const result = await pool.query(query, [sessionId]);
    return result.rows;
  }

  static async removePlayer(sessionId: string, userId: string): Promise<boolean> {
    const query = `
      DELETE FROM game_session_players
      WHERE game_session_id = $1 AND user_id = $2
    `;

    const result = await pool.query(query, [sessionId, userId]);
    return (result.rowCount ?? 0) > 0;
  }

  static async deleteSession(id: string): Promise<boolean> {
    const query = 'DELETE FROM game_sessions WHERE id = $1';
    const result = await pool.query(query, [id]);
    return (result.rowCount ?? 0) > 0;
  }
}
