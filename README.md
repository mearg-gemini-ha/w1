# W Game - 3v3 Real-Time Multiplayer Battle Arena

A Gen Z-focused 3v3 real-time multiplayer web game built with modern web technologies.

## 🚀 Tech Stack

### Frontend

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool and dev server
- **Phaser 3** - Game engine for 2D gameplay
- **TailwindCSS** - Utility-first CSS framework
- **Socket.io Client** - Real-time WebSocket communication
- **Zustand** - State management
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend

- **Node.js** - Runtime environment
- **Express** - Web framework
- **TypeScript** - Type safety
- **Socket.io** - Real-time WebSocket server
- **PostgreSQL** - Relational database
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
w-game/
├── client/                 # Frontend application
│   ├── public/            # Static assets
│   ├── src/
│   │   ├── components/    # React UI components
│   │   ├── pages/         # Page components
│   │   ├── game/          # Phaser game engine
│   │   │   └── scenes/    # Game scenes
│   │   ├── services/      # API & Socket.io clients
│   │   ├── hooks/         # Custom React hooks
│   │   ├── store/         # Zustand state management
│   │   ├── types/         # TypeScript type definitions
│   │   ├── styles/        # Global styles
│   │   ├── App.tsx        # Main App component
│   │   └── main.tsx       # Entry point
│   ├── tests/             # Frontend tests
│   └── package.json
│
├── server/                # Backend application
│   ├── src/
│   │   ├── config/        # Configuration files
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   ├── services/      # Business logic
│   │   ├── models/        # Data models
│   │   ├── types/         # TypeScript type definitions
│   │   └── server.ts      # Entry point
│   ├── migrations/        # Database migrations
│   ├── tests/             # Backend tests
│   └── package.json
│
├── .github/               # GitHub configuration
│   └── workflows/         # CI/CD workflows
├── package.json           # Root package.json (workspaces)
└── README.md
```

## 🛠️ Setup Instructions

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL >= 14

### 1. Clone the Repository

```bash
git clone <repository-url>
cd w-game
```

### 2. Install Dependencies

```bash
# Install root dependencies and all workspace dependencies
npm install
```

### 3. Environment Configuration

#### Server (.env)

Create `server/.env` based on `server/.env.example`:

```bash
cp server/.env.example server/.env
```

Edit `server/.env`:

```env
NODE_ENV=development
PORT=3001
DATABASE_URL=postgresql://user:password@localhost:5432/w_game_db
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173
SOCKET_PORT=3002
```

#### Client (.env)

Create `client/.env` based on `client/.env.example`:

```bash
cp client/.env.example client/.env
```

Edit `client/.env`:

```env
VITE_API_URL=http://localhost:3001
VITE_WS_URL=http://localhost:3002
VITE_NODE_ENV=development
```

### 4. Database Setup

#### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE w_game_db;

# Exit psql
\q
```

#### Run Migrations

```bash
# Navigate to server directory
cd server

# Run migrations in order
psql $DATABASE_URL -f migrations/001_create_users_table.sql
psql $DATABASE_URL -f migrations/002_create_user_profiles_table.sql
psql $DATABASE_URL -f migrations/003_create_auth_tokens_table.sql
psql $DATABASE_URL -f migrations/004_create_game_sessions_table.sql
psql $DATABASE_URL -f migrations/005_create_player_stats_table.sql
psql $DATABASE_URL -f migrations/006_create_characters_table.sql
```

## 🚀 Development

### Start Development Servers

```bash
# Start both frontend and backend concurrently
npm run dev

# Or start individually:
npm run dev:server   # Backend only (port 3002)
npm run dev:client   # Frontend only (port 5173)
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **WebSocket**: http://localhost:3002

## 🧪 Testing

```bash
# Run all tests
npm test

# Run server tests only
npm run test --workspace=server

# Run client tests only
npm run test --workspace=client
```

## 🎨 Code Quality

### Linting

```bash
# Lint all workspaces
npm run lint

# Lint specific workspace
npm run lint --workspace=server
npm run lint --workspace=client
```

### Formatting

```bash
# Format all files
npm run format

# Check formatting without changes
npm run format:check
```

## 🏗️ Build for Production

```bash
# Build all workspaces
npm run build

# Build specific workspace
npm run build:server
npm run build:client
```

## 🗄️ Database Schema

### Tables

- **users** - User authentication and identification
- **user_profiles** - Extended user information
- **auth_tokens** - JWT token tracking
- **game_sessions** - Real-time game session management
- **player_stats** - Player performance and rankings
- **characters** - Available game characters

See `server/migrations/README.md` for detailed schema documentation.

## 🔒 Security

- Helmet.js for HTTP security headers
- CORS configuration
- JWT-based authentication
- bcrypt password hashing
- Input validation with Zod
- Environment variable protection

## 📝 Development Workflow

1. Create a feature branch from `main`
2. Make your changes
3. Run linting and tests
4. Commit with descriptive messages
5. Push and create a pull request
6. Wait for CI checks to pass
7. Request code review

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🎮 Game Features (Planned)

- 3v3 real-time battles
- Multiple characters with unique abilities
- Matchmaking system
- Ranking and leaderboards
- Character progression
- Team-based gameplay
- Real-time chat
- Spectator mode

## 🛣️ Roadmap

- [x] Phase 1: Foundation
- [x] Phase 2: Authentication & User Management
- [x] Phase 3: Matchmaking System
- [ ] Phase 4: Game Engine & Physics
- [ ] Phase 5: Character System
- [ ] Phase 6: Combat Mechanics
- [ ] Phase 7: Progression & Rewards
- [ ] Phase 8: Polish & Optimization

## 📞 Support

For issues and questions, please open an issue on GitHub.

---

Built with ❤️ for Gen Z gamers
