# W Game Architecture

## Overview

W Game is a real-time 3v3 multiplayer web game built using a modern monorepo architecture with separate frontend and backend services.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (React)                        │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   React UI  │  │ Phaser Game  │  │  State Manager   │  │
│  │  Components │  │    Engine    │  │    (Zustand)     │  │
│  └─────────────┘  └──────────────┘  └──────────────────┘  │
│         │                 │                    │             │
│         └─────────────────┴────────────────────┘             │
│                          │                                   │
│              ┌───────────┴──────────┐                       │
│              │                      │                       │
│         HTTP API              WebSocket                     │
└─────────────┼──────────────────────┼───────────────────────┘
              │                      │
              ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    Server (Node.js)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   Express    │  │  Socket.IO   │  │   Game Logic     │  │
│  │  REST API    │  │   Server     │  │   & Services     │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
│         │                 │                    │             │
│         └─────────────────┴────────────────────┘             │
│                          │                                   │
│                          ▼                                   │
│              ┌────────────────────┐                         │
│              │    PostgreSQL      │                         │
│              │     Database       │                         │
│              └────────────────────┘                         │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend

- **React 18**: Component-based UI framework
- **TypeScript**: Type-safe JavaScript
- **Phaser 3**: 2D game engine for gameplay rendering
- **Vite**: Fast build tool and dev server
- **TailwindCSS**: Utility-first CSS framework
- **Socket.io Client**: Real-time bidirectional communication
- **Zustand**: Lightweight state management
- **React Router**: Client-side routing
- **Axios**: Promise-based HTTP client

### Backend

- **Node.js**: JavaScript runtime
- **Express**: Web application framework
- **TypeScript**: Type-safe JavaScript
- **Socket.io**: Real-time WebSocket server
- **PostgreSQL**: Relational database
- **JWT**: Token-based authentication
- **bcryptjs**: Password hashing
- **Helmet**: Security middleware
- **CORS**: Cross-origin resource sharing

## Core Components

### Client Architecture

#### 1. UI Layer (React)

- **Components**: Reusable UI elements
- **Pages**: Top-level route components
- **Routing**: React Router for navigation

#### 2. Game Layer (Phaser)

- **Scenes**: Game states (menu, gameplay, etc.)
- **Game Objects**: Players, characters, effects
- **Physics**: Collision detection and movement
- **Input**: Keyboard/mouse/touch handling

#### 3. State Management

- **Zustand Stores**: Global application state
- **Local State**: Component-specific state
- **Server State**: Cached API responses

#### 4. Services

- **API Service**: HTTP requests to backend
- **Socket Service**: WebSocket communication
- **Auth Service**: Authentication handling

### Server Architecture

#### 1. API Layer

- **Routes**: RESTful API endpoints
- **Controllers**: Request handlers
- **Validation**: Input validation and sanitization

#### 2. Business Logic

- **Services**: Core game logic
- **Game Manager**: Session and match management
- **Matchmaking**: Player pairing algorithm

#### 3. Real-time Communication

- **Socket.io**: WebSocket server
- **Event Handlers**: Game event processing
- **Broadcasting**: Real-time updates to clients

#### 4. Data Layer

- **Models**: Database entity definitions
- **Repositories**: Data access patterns
- **Migrations**: Database schema versioning

## Data Flow

### Authentication Flow

```
1. User enters credentials → Client
2. Client sends POST /auth/login → Server
3. Server validates credentials → Database
4. Server generates JWT token → Client
5. Client stores token → LocalStorage
6. Client includes token in subsequent requests
```

### Game Session Flow

```
1. Client requests matchmaking → Server
2. Server adds player to queue
3. Server finds 6 players (3v3)
4. Server creates game session → Database
5. Server notifies all players via WebSocket
6. Clients connect to game session
7. Real-time game state sync via Socket.io
8. Server processes game events
9. Server updates database with results
```

### Real-time Update Flow

```
1. Player action (move, attack) → Client
2. Client sends event via WebSocket → Server
3. Server validates action
4. Server updates game state
5. Server broadcasts update to all players
6. Clients update local game state
7. Phaser renders updated visuals
```

## Security Considerations

### Authentication

- JWT tokens with expiration
- Secure password hashing (bcrypt)
- Token refresh mechanism
- Session management

### API Security

- CORS configuration
- Rate limiting
- Input validation
- SQL injection prevention
- XSS protection

### WebSocket Security

- Connection authentication
- Message validation
- Rate limiting on events
- Namespace isolation

## Scalability Considerations

### Current Architecture

- Single server instance
- Direct database connections
- In-memory game state

### Future Improvements

- Horizontal scaling with load balancer
- Redis for session storage
- Message queue (RabbitMQ/Redis)
- Database connection pooling
- CDN for static assets
- Microservices for game logic

## Database Schema

### Core Tables

- `users`: Authentication and user data
- `user_profiles`: Extended user information
- `auth_tokens`: JWT token tracking
- `game_sessions`: Active and historical games
- `player_stats`: Performance metrics
- `characters`: Game character definitions

### Relationships

- User → UserProfile (1:1)
- User → AuthTokens (1:N)
- User → PlayerStats (1:1)
- GameSession → Players (1:6)
- Character → Players (1:N)

## Performance Optimization

### Frontend

- Code splitting
- Lazy loading
- Asset optimization
- Phaser sprite atlases
- WebSocket connection pooling

### Backend

- Database indexing
- Query optimization
- Connection pooling
- Caching strategies
- Efficient WebSocket broadcasting

## Monitoring & Logging

### Metrics to Track

- API response times
- WebSocket latency
- Database query performance
- Error rates
- Active users/sessions

### Logging

- Structured logging
- Error tracking
- Performance monitoring
- User action logging

## Development Workflow

1. **Local Development**: Run both services locally
2. **Testing**: Unit and integration tests
3. **Linting**: ESLint for code quality
4. **Formatting**: Prettier for consistency
5. **CI/CD**: GitHub Actions for automation
6. **Deployment**: Separate frontend/backend deployments

## Future Enhancements

- [ ] Redis for caching and sessions
- [ ] Message queue for async processing
- [ ] Microservices architecture
- [ ] Advanced matchmaking algorithm
- [ ] Replay system
- [ ] Spectator mode
- [ ] Mobile app support
- [ ] GraphQL API option
