-- Create game_session_players junction table
CREATE TABLE IF NOT EXISTS game_session_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_session_id UUID NOT NULL REFERENCES game_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    team VARCHAR(1) NOT NULL CHECK (team IN ('A', 'B')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(game_session_id, user_id)
);

-- Create indexes for faster lookups
CREATE INDEX idx_game_session_players_session ON game_session_players(game_session_id);
CREATE INDEX idx_game_session_players_user ON game_session_players(user_id);
CREATE INDEX idx_game_session_players_team ON game_session_players(game_session_id, team);
