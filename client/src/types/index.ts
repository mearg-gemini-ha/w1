export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatar?: string;
}

export interface GameSession {
  id: string;
  status: 'waiting' | 'in_progress' | 'finished';
  players: Player[];
  createdAt: Date;
}

export interface Player {
  id: string;
  userId: string;
  username: string;
  team: 'A' | 'B';
  character?: Character;
  position?: Position;
}

export interface Character {
  id: string;
  name: string;
  abilities: string[];
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface Position {
  x: number;
  y: number;
}

export interface GameState {
  sessionId: string;
  players: Player[];
  status: 'lobby' | 'playing' | 'finished';
}

export interface SocketEvent {
  type: string;
  payload: unknown;
}
