# Database Migrations

This folder contains SQL migration files for the W Game database schema.

## Running Migrations

### Using psql

```bash
# Connect to your PostgreSQL database
psql $DATABASE_URL

# Run migrations in order
\i migrations/001_create_users_table.sql
\i migrations/002_create_user_profiles_table.sql
\i migrations/003_create_auth_tokens_table.sql
\i migrations/004_create_game_sessions_table.sql
\i migrations/005_create_player_stats_table.sql
\i migrations/006_create_characters_table.sql
```

### Using node-pg-migrate (recommended for production)

```bash
npm install -g node-pg-migrate

# Create a new migration
node-pg-migrate create migration-name

# Run all pending migrations
node-pg-migrate up
```

## Migration Order

Migrations must be run in numerical order to maintain referential integrity:

1. `001_create_users_table.sql` - Base users table
2. `002_create_user_profiles_table.sql` - User profile information
3. `003_create_auth_tokens_table.sql` - Authentication tokens
4. `004_create_game_sessions_table.sql` - Game session tracking
5. `005_create_player_stats_table.sql` - Player statistics and rankings
6. `006_create_characters_table.sql` - Game characters

## Schema Overview

- **users**: Core user authentication and identification
- **user_profiles**: Extended user information (display name, avatar, bio)
- **auth_tokens**: JWT token tracking and expiration
- **game_sessions**: Real-time game session management
- **player_stats**: Player performance metrics and ranking
- **characters**: Available game characters and their properties
