export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface UserProfile {
  user_id: string;
  display_name: string;
  avatar?: string;
  bio?: string;
  created_at: Date;
  updated_at: Date;
}

export interface AuthToken {
  id: string;
  user_id: string;
  token: string;
  expires_at: Date;
  created_at: Date;
}

export interface GameSession {
  id: string;
  status: 'waiting' | 'in_progress' | 'finished';
  created_at: Date;
  finished_at?: Date;
}

export interface PlayerStats {
  user_id: string;
  matches_played: number;
  wins: number;
  losses: number;
  rank_points: number;
  created_at: Date;
  updated_at: Date;
}

export interface Character {
  id: string;
  name: string;
  abilities: string[];
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  created_at: Date;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
