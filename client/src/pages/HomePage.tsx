import { useNavigate } from 'react-router-dom';

function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white">
      <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
        W GAME
      </h1>
      <p className="text-xl mb-8 text-gray-300">3v3 Real-Time Multiplayer Battle Arena</p>
      <div className="flex gap-4">
        <button
          onClick={() => navigate('/game')}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition-colors"
        >
          Play Now
        </button>
        <button className="px-8 py-3 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold transition-colors">
          How to Play
        </button>
      </div>
    </div>
  );
}

export default HomePage;
