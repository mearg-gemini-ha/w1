import { useEffect, useRef } from 'react';
import { initGame } from '../game/gameSetup';

function GamePage() {
  const gameContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (gameContainerRef.current) {
      const game = initGame(gameContainerRef.current);
      return () => {
        game.destroy(true);
      };
    }
  }, []);

  return (
    <div className="w-full h-screen">
      <div ref={gameContainerRef} className="w-full h-full" />
    </div>
  );
}

export default GamePage;
