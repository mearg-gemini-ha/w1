# Development Guide

This guide covers detailed information for developers working on the W Game project.

## Tech Stack Deep Dive

### Frontend Stack

- **React 18**: Modern React with hooks and concurrent features
- **TypeScript**: Static typing for better code quality
- **Vite**: Lightning-fast dev server and build tool
- **Phaser 3**: Industry-standard 2D game engine
- **TailwindCSS**: Utility-first CSS framework
- **Socket.io Client**: Real-time bidirectional communication
- **Zustand**: Lightweight state management
- **Axios**: Promise-based HTTP client

### Backend Stack

- **Node.js**: JavaScript runtime
- **Express**: Minimal web framework
- **TypeScript**: Type-safe server code
- **Socket.io**: WebSocket server for real-time features
- **PostgreSQL**: Relational database
- **JWT**: JSON Web Tokens for authentication
- **bcryptjs**: Secure password hashing
- **Helmet**: Security middleware
- **Zod**: Schema validation

## Project Architecture

### Monorepo Structure

The project uses npm workspaces to manage multiple packages in a single repository:

```
w-game/
├── client/          # Frontend React application
├── server/          # Backend Node.js application
└── package.json     # Root workspace configuration
```

Benefits:

- Shared dependencies
- Consistent tooling
- Single command deployment
- Easy cross-package refactoring

### Client Architecture

```
client/src/
├── components/      # Reusable UI components
├── pages/          # Route-level page components
├── game/           # Phaser game engine
│   └── scenes/     # Game scenes (menu, gameplay, etc.)
├── services/       # External service integrations
│   ├── api.ts      # REST API client
│   └── socket.ts   # WebSocket client
├── hooks/          # Custom React hooks
├── store/          # Global state management
├── types/          # TypeScript type definitions
└── styles/         # Global styles and Tailwind config
```

#### State Management

Using **Zustand** for global state:

- Lightweight (< 1kb)
- Simple API
- No boilerplate
- TypeScript friendly

Example:

```typescript
const useGameStore = create<GameState>((set) => ({
  players: [],
  setPlayers: (players) => set({ players }),
}));
```

#### Real-time Communication

Socket.io client connects to the backend WebSocket server:

- Automatic reconnection
- Room-based messaging
- Event-driven architecture

### Server Architecture

```
server/src/
├── config/         # Configuration and environment variables
├── middleware/     # Express middleware
│   ├── auth.ts     # JWT authentication
│   ├── errorHandler.ts
│   └── logger.ts
├── routes/         # API route handlers
│   ├── auth.ts     # Authentication routes
│   └── index.ts    # Route aggregator
├── services/       # Business logic layer
│   └── authService.ts
├── models/         # Database models
│   └── User.ts
├── types/          # TypeScript interfaces
└── server.ts       # Main entry point
```

#### Layered Architecture

1. **Routes Layer**: Handle HTTP requests and responses
2. **Service Layer**: Business logic and validation
3. **Model Layer**: Database interactions
4. **Types Layer**: Shared type definitions

#### Authentication Flow

1. User registers/logs in via `/api/auth/register` or `/api/auth/login`
2. Password hashed with bcryptjs
3. JWT token generated and returned
4. Client stores token in localStorage
5. Token included in subsequent requests via Authorization header
6. Auth middleware validates token on protected routes

#### WebSocket Architecture

Socket.io provides:

- Real-time player position updates
- Game state synchronization
- Matchmaking events
- Chat messages

Events structure:

```typescript
// Client -> Server
socket.emit('game:action', { action, data });

// Server -> Client
socket.on('game:update', (state) => { ... });
```

## Database Schema

### Users Table

```sql
id            UUID PRIMARY KEY
username      VARCHAR(50) UNIQUE
email         VARCHAR(255) UNIQUE
password_hash VARCHAR(255)
created_at    TIMESTAMP
updated_at    TIMESTAMP
```

### User Profiles Table

```sql
user_id       UUID PRIMARY KEY (FK to users)
display_name  VARCHAR(100)
avatar        VARCHAR(500)
bio           TEXT
created_at    TIMESTAMP
updated_at    TIMESTAMP
```

### Player Stats Table

```sql
user_id         UUID PRIMARY KEY (FK to users)
matches_played  INTEGER
wins            INTEGER
losses          INTEGER
rank_points     INTEGER
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

See `server/migrations/README.md` for complete schema documentation.

## Development Workflow

### Daily Development

```bash
# Start development
npm run dev

# Make changes
# - Frontend: Hot Module Replacement (HMR) updates automatically
# - Backend: tsx watch restarts server on file changes

# Check code quality
npm run lint
npm run format:check

# Run tests
npm test
```

### Adding New Features

1. **Create Feature Branch**

   ```bash
   git checkout -b feature/my-new-feature
   ```

2. **Develop Feature**
   - Write code
   - Add types
   - Create tests
   - Update documentation

3. **Quality Checks**

   ```bash
   npm run lint
   npm run format
   npm test
   npm run build
   ```

4. **Commit and Push**

   ```bash
   git add .
   git commit -m "feat: add new feature"
   git push origin feature/my-new-feature
   ```

5. **Create Pull Request**
   - Pre-commit hooks run automatically
   - CI/CD runs tests
   - Request code review

### Adding API Endpoints

1. **Define Route Handler** (`server/src/routes/`)

   ```typescript
   router.post('/endpoint', async (req, res) => {
     const data = await service.doSomething(req.body);
     res.json({ success: true, data });
   });
   ```

2. **Create Service Logic** (`server/src/services/`)

   ```typescript
   export class MyService {
     static async doSomething(input: Input): Promise<Output> {
       // Business logic here
     }
   }
   ```

3. **Add Model Methods** (`server/src/models/`)

   ```typescript
   static async findSomething(id: string) {
     const result = await pool.query('SELECT * FROM ...');
     return result.rows[0];
   }
   ```

4. **Update Client** (`client/src/services/api.ts`)
   ```typescript
   export const fetchSomething = () => apiService.get('/endpoint');
   ```

### Adding Game Scenes

1. **Create Scene Class** (`client/src/game/scenes/`)

   ```typescript
   export class MyScene extends Phaser.Scene {
     constructor() {
       super({ key: 'MyScene' });
     }

     preload() {
       /* Load assets */
     }
     create() {
       /* Initialize */
     }
     update() {
       /* Game loop */
     }
   }
   ```

2. **Register Scene** (`client/src/game/gameSetup.ts`)
   ```typescript
   scene: [MainScene, MyScene];
   ```

## Testing

### Unit Tests

**Backend** (Jest):

```typescript
describe('AuthService', () => {
  it('should hash passwords', async () => {
    const hash = await AuthService.hashPassword('password');
    expect(hash).toBeDefined();
  });
});
```

**Frontend** (Vitest):

```typescript
describe('Button', () => {
  it('renders correctly', () => {
    render(<Button>Click</Button>);
    expect(screen.getByText('Click')).toBeInTheDocument();
  });
});
```

### Integration Tests

Test API endpoints with supertest:

```typescript
describe('POST /api/auth/register', () => {
  it('creates a new user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ username, email, password });
    expect(response.status).toBe(201);
  });
});
```

## Code Style

### TypeScript

- Use explicit types for function parameters and return values
- Prefer interfaces over types for object shapes
- Use type inference for variables when obvious
- Enable strict mode in tsconfig

### React

- Use functional components with hooks
- Extract custom hooks for reusable logic
- Keep components small and focused
- Use TypeScript for props

### Naming Conventions

- Components: PascalCase (`MyComponent.tsx`)
- Hooks: camelCase with 'use' prefix (`useMyHook.ts`)
- Services: PascalCase (`AuthService.ts`)
- Utils: camelCase (`formatDate.ts`)
- Constants: UPPER_SNAKE_CASE (`API_URL`)

## Performance

### Frontend Optimization

- Code splitting with dynamic imports
- Lazy loading routes
- Memoize expensive computations
- Optimize Phaser assets (compress images, audio)
- Use React.memo for pure components

### Backend Optimization

- Connection pooling for database
- Caching with Redis (future)
- Rate limiting
- Gzip compression
- Query optimization with indexes

## Security

### Current Measures

- Helmet.js security headers
- CORS configuration
- JWT authentication
- Password hashing (bcrypt)
- Input validation (Zod)
- SQL injection prevention (parameterized queries)

### Best Practices

- Never commit secrets to git
- Rotate JWT secrets regularly
- Use environment variables
- Validate all user input
- Sanitize database queries
- Keep dependencies updated

## Deployment

### Building for Production

```bash
# Build both projects
npm run build

# Test production builds locally
npm run preview  # Frontend
node server/dist/server.js  # Backend
```

### Environment Variables

Production requires:

- `DATABASE_URL`: Production database connection
- `JWT_SECRET`: Strong random secret
- `NODE_ENV=production`
- `CORS_ORIGIN`: Production frontend URL

### CI/CD

GitHub Actions workflow:

1. Install dependencies
2. Run linters
3. Run tests
4. Build projects
5. Deploy (manual trigger)

## Troubleshooting

### Common Issues

**TypeScript Errors**

- Clear build cache: `rm -rf dist/ .tsbuildinfo`
- Reinstall types: `npm install`

**WebSocket Connection Failed**

- Check CORS settings
- Verify port is not blocked
- Check firewall rules

**Database Connection Issues**

- Verify PostgreSQL is running
- Check DATABASE_URL format
- Ensure database exists

## Resources

- [React Documentation](https://react.dev)
- [Phaser 3 Documentation](https://phaser.io/phaser3)
- [Socket.io Documentation](https://socket.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## Getting Help

- Check existing issues
- Read documentation
- Ask in team chat
- Create detailed bug reports

Happy coding! 🚀
