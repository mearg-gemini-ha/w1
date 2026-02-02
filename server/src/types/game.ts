export interface GamePlayerState {
  userId: string;
  x: number;
  y: number;
  team?: 'A' | 'B';
}

export interface GameSessionState {
  sessionId: string;
  players: GamePlayerState[];
}
