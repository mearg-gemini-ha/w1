import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GamePage from './pages/GamePage';
import MatchmakingPage from './pages/MatchmakingPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/matchmaking" element={<MatchmakingPage />} />
          <Route path="/game/:sessionId" element={<GamePage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
