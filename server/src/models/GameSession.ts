import { pool } from '../config/database';
import { GameSession } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class GameSessionModel {
  static async create(teams: {
    team_a_ids: string[];
    team_b_ids: string[];
    map_id?: string;
  }): Promise<GameSession> {
    const sessionId = uuidv4();
    const result = await pool.query(
      `INSERT INTO game_sessions 
       (id, team_a_ids, team_b_ids, map_id, status) 
       VALUES ($1, $2, $3, $4, 'starting') RETURNING *`,
      [sessionId, teams.team_a_ids, teams.team_b_ids, teams.map_id || 'default_arena']
    );
    return result.rows[0];
  }

  static async findById(sessionId: string): Promise<GameSession | null> {
    const result = await pool.query('SELECT * FROM game_sessions WHERE id = $1', [sessionId]);
    return result.rows[0] || null;
  }

  static async findActiveByPlayerId(playerId: string): Promise<GameSession[] | null> {
    const result = await pool.query(
      `SELECT * FROM game_sessions 
       WHERE (team_a_ids @> ARRAY[$1] OR team_b_ids @> ARRAY[$1]) 
       AND status IN ('starting', 'active')`,
      [playerId]
    );
    return result.rows.length > 0 ? result.rows : null;
  }

  static async updateStatus(
    sessionId: string,
    status: 'starting' | 'active' | 'finished'
  ): Promise<GameSession | null> {
    const query =
      status === 'active'
        ? 'UPDATE game_sessions SET status = $1, started_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *'
        : status === 'finished'
        ? 'UPDATE game_sessions SET status = $1, finished_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *'
        : 'UPDATE game_sessions SET status = $1 WHERE id = $2 RETURNING *';

    const result = await pool.query(query, [status, sessionId]);
    return result.rows[0] || null;
  }

  static async getActiveSessions(): Promise<GameSession[]> {
    const result = await pool.query(
      'SELECT * FROM game_sessions WHERE status IN (\'starting\', \'active\') ORDER BY created_at DESC'
    );
    return result.rows;
  }

  static async saveMatchResult(
    sessionId: string,
    winnerTeam: 'team_a' | 'team_b' | 'draw'
  ): Promise<GameSession | null> {
    const result = await pool.query(
      'UPDATE game_sessions SET winner_team = $1, status = $2, finished_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [winnerTeam, 'finished', sessionId]
    );
    return result.rows[0] || null;
  }

  static async isPlayerInSession(sessionId: string, playerId: string): Promise<boolean> {
    const result = await pool.query(
      `SELECT EXISTS(
        SELECT 1 FROM game_sessions 
        WHERE id = $1 AND (team_a_ids @> ARRAY[$2] OR team_b_ids @> ARRAY[$2])
      ) as exists`,
      [sessionId, playerId]
    );
    return result.rows[0].exists;
  }
}