import { pool } from '../config/database';
import { UserProfile } from '../types';

export class UserProfileModel {
  static async findByUserId(userId: string): Promise<UserProfile | null> {
    const result = await pool.query('SELECT * FROM user_profiles WHERE user_id = $1', [userId]);
    return result.rows[0] || null;
  }

  static async create(userId: string, data: Partial<UserProfile> = {}): Promise<UserProfile> {
    const { display_name, bio } = data;
    const result = await pool.query(
      `INSERT INTO user_profiles (user_id, display_name, bio) 
       VALUES ($1, $2, $3) RETURNING *`,
      [userId, display_name, bio]
    );
    return result.rows[0];
  }

  static async getFullProfile(userId: string): Promise<any> {
    const result = await pool.query(
      `SELECT 
        u.*,
        up.display_name,
        up.bio,
        up.total_matches,
        up.total_wins,
        up.mmr,
        up.created_at as profile_created_at,
        up.updated_at as profile_updated_at,
        ps.matches_played,
        ps.wins,
        ps.losses,
        ps.kills_total,
        ps.deaths_total,
        ps.win_rate,
        ps.current_mmr,
        ps.most_played_character_id
       FROM users u
       LEFT JOIN user_profiles up ON u.id = up.user_id
       LEFT JOIN player_stats ps ON u.id = ps.user_id
       WHERE u.id = $1`,
      [userId]
    );
    return result.rows[0] || null;
  }

  static async updateProfile(
    userId: string,
    data: {
      display_name?: string;
      bio?: string;
    }
  ): Promise<UserProfile | null> {
    const result = await pool.query(
      `UPDATE user_profiles 
       SET 
         display_name = COALESCE($1, display_name),
         bio = COALESCE($2, bio),
         updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $3 RETURNING *`,
      [data.display_name, data.bio, userId]
    );
    return result.rows[0] || null;
  }

  static async updateStats(
    userId: string,
    stats: {
      total_matches?: number;
      total_wins?: number;
      mmr?: number;
    }
  ): Promise<UserProfile | null> {
    const result = await pool.query(
      `UPDATE user_profiles 
       SET 
         total_matches = COALESCE($1, total_matches),
         total_wins = COALESCE($2, total_wins),
         mmr = COALESCE($3, mmr),
         updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $4 RETURNING *`,
      [stats.total_matches, stats.total_wins, stats.mmr, userId]
    );
    return result.rows[0] || null;
  }
}