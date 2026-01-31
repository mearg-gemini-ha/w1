-- Add stats columns to user_profiles as described in the ticket
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS total_matches INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_wins INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS mmr INTEGER DEFAULT 1500;

-- Add avatar column if not present
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS avatar VARCHAR(500) DEFAULT 'https://fastly.picsum.photos/200/200?grayscale';