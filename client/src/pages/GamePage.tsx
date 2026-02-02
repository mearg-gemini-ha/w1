import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { initGame } from '../game/gameSetup';

interface StoredMatchInfo {
  sessionId: string;
  team?: 'A' | 'B';
}

function GamePage() {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<'A' | 'B' | undefined>(undefined);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      navigate('/');
      return;
    }
    setUserId(storedUserId);

    const storedMatch = localStorage.getItem('lastMatch');
    if (storedMatch) {
      try {
        const parsed = JSON.parse(storedMatch) as StoredMatchInfo;
        if (parsed.sessionId === sessionId) {
          setTeam(parsed.team);
        }
      } catch (error) {
        console.warn('Failed to parse stored match info', error);
      }
    }
  }, [navigate, sessionId]);

  useEffect(() => {
    if (!sessionId || !userId) {
      return;
    }

    if (gameContainerRef.current) {
      const game = initGame(gameContainerRef.current, sessionId, userId, team);
      return () => {
        game.destroy(true);
      };
    }
  }, [sessionId, userId, team]);

  return (
    <div className="w-full h-screen">
      <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-4 py-2 rounded-lg">
        <p className="text-sm">Session: {sessionId}</p>
        {team && <p className="text-xs text-white/70">Team: {team}</p>}
      </div>
      <div ref={gameContainerRef} className="w-full h-full" />
    </div>
  );
}

export default GamePage;
