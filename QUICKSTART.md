# Quick Start Guide

Get W Game running locally in 5 minutes!

## Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL 14+
- Git

## Installation Steps

### 1. Install Dependencies

```bash
npm install
```

This will install all dependencies for both client and server workspaces.

### 2. Set Up Environment Variables

#### Server

```bash
cp server/.env.example server/.env
```

Edit `server/.env` and update the database connection:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/w_game_db
JWT_SECRET=change-this-to-a-secure-random-string
```

#### Client

```bash
cp client/.env.example client/.env
```

The default values should work for local development.

### 3. Set Up Database

```bash
# Create the database
createdb w_game_db

# Quick way - Run all migrations at once
cd server/migrations
./run-all.sh postgresql://user:password@localhost:5432/w_game_db
cd ../..

# Or manually run each migration
cd server
psql $DATABASE_URL -f migrations/001_create_users_table.sql
psql $DATABASE_URL -f migrations/002_create_user_profiles_table.sql
psql $DATABASE_URL -f migrations/003_create_auth_tokens_table.sql
psql $DATABASE_URL -f migrations/004_create_game_sessions_table.sql
psql $DATABASE_URL -f migrations/005_create_player_stats_table.sql
psql $DATABASE_URL -f migrations/006_create_characters_table.sql
cd ..
```

### 4. Start Development Servers

```bash
npm run dev
```

This starts both:

- Frontend at http://localhost:5173
- Backend at http://localhost:3002

Or start them separately:

```bash
# Terminal 1 - Backend
npm run dev:server

# Terminal 2 - Frontend
npm run dev:client
```

## Verify Installation

1. Open http://localhost:5173 in your browser
2. You should see the W Game homepage
3. Click "Play Now" to see the game screen
4. Check the browser console and server terminal for connection logs

## Common Commands

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:client       # Start frontend only
npm run dev:server       # Start backend only

# Building
npm run build            # Build both projects
npm run build:client     # Build frontend only
npm run build:server     # Build backend only

# Code Quality
npm run lint             # Lint all code
npm run format           # Format all code
npm run format:check     # Check formatting
npm test                 # Run all tests

# Cleanup
npm run clean            # Remove all node_modules and build artifacts
```

## Troubleshooting

### Database Connection Issues

```bash
# Check PostgreSQL is running
pg_isready

# Verify database exists
psql -l | grep w_game_db

# Test connection
psql $DATABASE_URL -c "SELECT 1;"
```

### Port Already in Use

If ports 3002 or 5173 are in use:

```bash
# Find and kill process using port
lsof -ti:3002 | xargs kill -9
lsof -ti:5173 | xargs kill -9
```

Or change ports in environment variables.

### TypeScript Errors

```bash
# Clean and reinstall
npm run clean
npm install

# Rebuild
npm run build
```

### Module Not Found

```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Check [ARCHITECTURE.md](ARCHITECTURE.md) to understand the system design
- See [CONTRIBUTING.md](CONTRIBUTING.md) for development guidelines
- Start building features! 🚀

## Need Help?

- Check the issue tracker
- Read the documentation
- Ask in discussions

Happy coding! 🎮
