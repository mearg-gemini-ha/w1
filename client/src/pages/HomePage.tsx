import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

function HomePage() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    let storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      storedUserId = `user_${Math.random().toString(36).substring(2, 15)}`;
      localStorage.setItem('userId', storedUserId);
    }
    setUserId(storedUserId);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white">
      <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
        W GAME
      </h1>
      <p className="text-xl mb-8 text-gray-300">3v3 Real-Time Multiplayer Battle Arena</p>
      {userId && <p className="text-sm mb-4 text-gray-400">Player ID: {userId}</p>}
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/matchmaking')}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
        >
          Find Match
        </button>
        <button className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors">
          How to Play
        </button>
      </div>
    </div>
  );
}

export default HomePage;
