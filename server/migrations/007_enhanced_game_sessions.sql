-- Enhance game_sessions table with team info and map tracking as described in the ticket
ALTER TABLE game_sessions 
ADD COLUMN IF NOT EXISTS team_a_ids UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS team_b_ids UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS winner_team VARCHAR(10) CHECK (winner_team IN ('team_a', 'team_b', 'draw')),
ADD COLUMN IF NOT EXISTS map_id VARCHAR(100) DEFAULT 'default_arena',
ADD COLUMN IF NOT EXISTS started_at TIMESTAMP WITH TIME ZONE;

-- Create GIN indexes for array queries
CREATE INDEX IF NOT EXISTS idx_game_sessions_team_a_ids ON game_sessions USING GIN (team_a_ids);
CREATE INDEX IF NOT EXISTS idx_game_sessions_team_b_ids ON game_sessions USING GIN (team_b_ids);
CREATE INDEX IF NOT EXISTS idx_game_sessions_started_at ON game_sessions(started_at);