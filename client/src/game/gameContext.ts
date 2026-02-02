export interface GameContext {
  sessionId: string;
  userId: string;
  team?: 'A' | 'B';
}

let gameContext: GameContext | null = null;

export const setGameContext = (context: GameContext): void => {
  gameContext = context;
};

export const getGameContext = (): GameContext => {
  if (!gameContext) {
    throw new Error('Game context not set');
  }

  return gameContext;
};
