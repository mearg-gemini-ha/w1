import { create } from 'zustand';

interface Player {
  userId: string;
  username: string;
  rankPoints: number;
}

interface MatchFound {
  sessionId: string;
  teamA: Player[];
  teamB: Player[];
  yourTeam: 'A' | 'B';
}

interface MatchmakingState {
  isInQueue: boolean;
  queuePosition: number;
  queueSize: number;
  estimatedWaitTime: number;
  matchFound: MatchFound | null;
  error: string | null;
  setInQueue: (inQueue: boolean) => void;
  setQueueInfo: (position: number, size: number, waitTime: number) => void;
  setQueueSize: (size: number) => void;
  setMatchFound: (match: MatchFound | null) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

export const useMatchmakingStore = create<MatchmakingState>((set) => ({
  isInQueue: false,
  queuePosition: 0,
  queueSize: 0,
  estimatedWaitTime: 0,
  matchFound: null,
  error: null,
  setInQueue: (inQueue) => set({ isInQueue: inQueue }),
  setQueueInfo: (position, size, waitTime) =>
    set({
      queuePosition: position,
      queueSize: size,
      estimatedWaitTime: waitTime,
    }),
  setQueueSize: (size) => set({ queueSize: size }),
  setMatchFound: (match) => set({ matchFound: match }),
  setError: (error) => set({ error }),
  reset: () =>
    set({
      isInQueue: false,
      queuePosition: 0,
      queueSize: 0,
      estimatedWaitTime: 0,
      matchFound: null,
      error: null,
    }),
}));
