import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMatchmaking } from '../hooks/useMatchmaking';
import { socketService } from '../services/socket';
import Button from '../components/Button';

const MatchmakingPage = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);

  const {
    isInQueue,
    queuePosition,
    queueSize,
    estimatedWaitTime,
    matchFound,
    error,
    joinQueue,
    leaveQueue,
    clearError,
  } = useMatchmaking(userId);

  useEffect(() => {
    socketService.connect();

    const storedUserId = localStorage.getItem('userId');
    if (!storedUserId) {
      navigate('/');
      return;
    }
    setUserId(storedUserId);
  }, [navigate]);

  useEffect(() => {
    return () => {
      if (isInQueue && userId) {
        leaveQueue();
      }
    };
  }, [isInQueue, userId, leaveQueue]);

  useEffect(() => {
    if (matchFound) {
      navigate(`/game/${matchFound.sessionId}`);
    }
  }, [matchFound, navigate]);

  const handleJoinQueue = () => {
    clearError();
    joinQueue();
  };

  const handleLeaveQueue = () => {
    leaveQueue();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-indigo-900 to-blue-900 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <h1 className="text-4xl font-bold text-white mb-8 text-center">🎮 Matchmaking</h1>

          {error && (
            <div className="bg-red-500/20 border border-red-500 text-white px-4 py-3 rounded-lg mb-6">
              <p>{error}</p>
              <button onClick={clearError} className="text-sm underline mt-2">
                Dismiss
              </button>
            </div>
          )}

          {!isInQueue && !matchFound && (
            <div className="text-center space-y-6">
              <p className="text-white/80 text-lg">
                Ready to battle? Find opponents for a 3v3 match!
              </p>

              <div className="bg-white/5 rounded-lg p-6">
                <p className="text-white/70 text-sm mb-2">Current Queue</p>
                <p className="text-3xl font-bold text-white">{queueSize} players</p>
              </div>

              <Button onClick={handleJoinQueue} className="w-full py-4 text-xl">
                Join Queue
              </Button>
            </div>
          )}

          {isInQueue && (
            <div className="text-center space-y-6">
              <div className="animate-pulse">
                <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center">
                  <svg
                    className="w-10 h-10 text-white animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                </div>
                <p className="text-2xl font-bold text-white mb-2">Finding Match...</p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/70 text-sm mb-1">Position</p>
                  <p className="text-2xl font-bold text-white">{queuePosition}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/70 text-sm mb-1">Queue Size</p>
                  <p className="text-2xl font-bold text-white">{queueSize}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-4">
                  <p className="text-white/70 text-sm mb-1">Est. Wait</p>
                  <p className="text-2xl font-bold text-white">{estimatedWaitTime}s</p>
                </div>
              </div>

              <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-4">
                <p className="text-white/90 text-sm">
                  💡 We're matching you with players of similar skill level
                </p>
              </div>

              <Button onClick={handleLeaveQueue} variant="secondary" className="w-full py-3">
                Leave Queue
              </Button>
            </div>
          )}

          {matchFound && (
            <div className="text-center space-y-6">
              <div className="text-green-400 text-6xl mb-4">✓</div>
              <h2 className="text-3xl font-bold text-white mb-4">Match Found!</h2>
              <p className="text-white/80">Redirecting to game...</p>
            </div>
          )}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-white/60 hover:text-white transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default MatchmakingPage;
