import { create } from 'zustand';

interface Player {
  id: string;
  username: string;
  team: 'A' | 'B';
}

interface GameState {
  isConnected: boolean;
  isInGame: boolean;
  players: Player[];
  currentPlayer: Player | null;
  setConnected: (connected: boolean) => void;
  setInGame: (inGame: boolean) => void;
  setPlayers: (players: Player[]) => void;
  setCurrentPlayer: (player: Player | null) => void;
}

export const useGameStore = create<GameState>((set) => ({
  isConnected: false,
  isInGame: false,
  players: [],
  currentPlayer: null,
  setConnected: (connected) => set({ isConnected: connected }),
  setInGame: (inGame) => set({ isInGame: inGame }),
  setPlayers: (players) => set({ players }),
  setCurrentPlayer: (player) => set({ currentPlayer: player }),
}));
