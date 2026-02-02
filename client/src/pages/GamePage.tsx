import { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { initGame } from '../game/gameSetup';

function GamePage() {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!sessionId) {
      navigate('/');
      return;
    }

    if (gameContainerRef.current) {
      const game = initGame(gameContainerRef.current);
      return () => {
        game.destroy(true);
      };
    }
  }, [sessionId, navigate]);

  return (
    <div className="w-full h-screen">
      <div className="absolute top-4 left-4 z-10 bg-black/50 text-white px-4 py-2 rounded-lg">
        <p className="text-sm">Session: {sessionId}</p>
      </div>
      <div ref={gameContainerRef} className="w-full h-full" />
    </div>
  );
}

export default GamePage;
