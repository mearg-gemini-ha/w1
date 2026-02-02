# Matchmaking System Documentation

## Overview

The W Game matchmaking system is a real-time 3v3 player matching service that finds opponents of similar skill levels and creates balanced teams for competitive matches.

## Features

- **Real-time Queue Management**: Players join a queue and receive live updates on their position and estimated wait time
- **Skill-based Matching**: Players are matched based on rank points to ensure balanced games
- **Team Balancing**: The system distributes players evenly across Team A and Team B based on skill
- **Socket.io Integration**: Real-time bidirectional communication for instant match notifications
- **Flexible User Support**: Works with both authenticated users and temporary guest IDs

## Architecture

### Backend Components

#### 1. MatchmakingService (`server/src/services/matchmakingService.ts`)

Core service that manages the matchmaking queue and matching algorithm.

**Key Methods:**

- `addToQueue(player)`: Add a player to the matchmaking queue
- `removeFromQueue(userId)`: Remove a player from the queue
- `attemptMatch()`: Try to create a match from queued players
- `getQueueSize()`: Get current number of players in queue
- `getPlayerPosition(userId)`: Get a player's position in the queue

**Matching Algorithm:**

1. Requires 6 players minimum (3v3)
2. Sorts players by rank points and queue time
3. Groups players with similar skill levels
4. Distributes players alternately to Team A and Team B
5. Creates a game session in the database
6. Removes matched players from the queue

#### 2. Socket.io Handlers (`server/src/sockets/matchmakingHandlers.ts`)

Real-time event handlers for matchmaking communication.

**Events Handled:**

- `matchmaking:join`: Player joins the queue
- `matchmaking:leave`: Player leaves the queue
- `disconnect`: Automatically removes player from queue

**Events Emitted:**

- `matchmaking:joined`: Confirmation with queue position
- `matchmaking:left`: Confirmation of leaving queue
- `matchmaking:found`: Match found with team assignments
- `matchmaking:queue-update`: Queue size updates
- `matchmaking:error`: Error messages

#### 3. Models

**GameSessionModel** (`server/src/models/GameSession.ts`)

- Creates game sessions
- Manages session status (waiting, in_progress, finished)
- Adds/removes players from sessions
- Tracks team assignments

**PlayerStatsModel** (`server/src/models/PlayerStats.ts`)

- Retrieves player rank points
- Updates match statistics
- Creates default stats for new players

#### 4. API Routes (`server/src/routes/matchmaking.ts`)

REST endpoints for matchmaking status:

- `GET /api/matchmaking/status`: Get current queue status for authenticated user

### Frontend Components

#### 1. MatchmakingStore (`client/src/store/matchmakingStore.ts`)

Zustand store managing matchmaking state:

- Queue status (in/out)
- Position in queue
- Queue size
- Estimated wait time
- Match found data
- Error messages

#### 2. useMatchmaking Hook (`client/src/hooks/useMatchmaking.ts`)

Custom React hook providing matchmaking functionality:

- `joinQueue()`: Join the matchmaking queue
- `leaveQueue()`: Leave the queue
- Real-time event listeners
- State management

#### 3. MatchmakingPage (`client/src/pages/MatchmakingPage.tsx`)

UI component with three states:

1. **Idle**: "Join Queue" button with current queue size
2. **In Queue**: Loading animation with position, queue size, and wait time
3. **Match Found**: Success message before redirect to game

## Database Schema

### game_sessions Table

```sql
id          UUID PRIMARY KEY
status      VARCHAR(20) -- 'waiting', 'in_progress', 'finished'
created_at  TIMESTAMP
finished_at TIMESTAMP
```

### game_session_players Table

```sql
id              UUID PRIMARY KEY
game_session_id UUID REFERENCES game_sessions(id)
user_id         UUID REFERENCES users(id)
team            VARCHAR(1) -- 'A' or 'B'
joined_at       TIMESTAMP
```

## Data Flow

### Joining Queue

```
1. User clicks "Join Queue" button
2. Frontend emits 'matchmaking:join' event with userId
3. Backend validates user (or accepts guest ID)
4. Backend adds player to queue
5. Backend emits 'matchmaking:joined' with position and wait time
6. Backend broadcasts 'matchmaking:queue-update' to all clients
7. Backend attempts to find a match
```

### Match Finding

```
1. Queue reaches 6+ players
2. Backend sorts players by rank and queue time
3. Backend creates balanced teams (3v3)
4. Backend creates game session in database
5. Backend adds players to session with team assignments
6. Backend emits 'matchmaking:found' to each player
7. Frontend redirects players to game page
```

### Leaving Queue

```
1. User clicks "Leave Queue" button
2. Frontend emits 'matchmaking:leave' event
3. Backend removes player from queue
4. Backend emits 'matchmaking:left' confirmation
5. Backend broadcasts updated queue size
```

## Usage Example

### Frontend

```typescript
import { useMatchmaking } from '../hooks/useMatchmaking';

function MyComponent() {
  const userId = localStorage.getItem('userId');
  const {
    isInQueue,
    queuePosition,
    matchFound,
    joinQueue,
    leaveQueue,
  } = useMatchmaking(userId);

  return (
    <div>
      {!isInQueue && <button onClick={joinQueue}>Find Match</button>}
      {isInQueue && <p>Position: {queuePosition}</p>}
      {matchFound && <p>Match found! Session: {matchFound.sessionId}</p>}
    </div>
  );
}
```

### Backend

```typescript
// Socket.io event
socket.emit('matchmaking:join', { userId: 'user123' });

// Listen for match
socket.on('matchmaking:found', (data) => {
  console.log('Session ID:', data.sessionId);
  console.log('Your team:', data.yourTeam);
  console.log('Team A:', data.teamA);
  console.log('Team B:', data.teamB);
});
```

## Configuration

### Queue Settings

Edit `server/src/services/matchmakingService.ts`:

```typescript
private readonly TEAM_SIZE = 3;        // Players per team
private readonly MATCH_SIZE = 6;       // Total players (3v3)
```

### Rank Point System

Default starting rank: 1000 points

Match results:

- Win: +25 points
- Loss: -15 points

## Future Enhancements

- [ ] MMR (Matchmaking Rating) algorithm improvements
- [ ] Region-based matchmaking
- [ ] Party/group matchmaking
- [ ] Match acceptance system (ready check)
- [ ] Queue dodge penalties
- [ ] Preferred role selection
- [ ] Ranked vs Casual queues
- [ ] Match history and replay system

## Troubleshooting

### Players stuck in queue

- Check if queue has minimum 6 players
- Verify Socket.io connection is active
- Check server logs for matching errors

### Match not starting

- Verify game session was created in database
- Check if all players received 'matchmaking:found' event
- Ensure frontend routing is configured for `/game/:sessionId`

### Queue size inconsistent

- Disconnect handlers should remove players
- Check for duplicate userId entries in queue
- Clear queue with `MatchmakingService.clearQueue()` if needed

## Testing

### Manual Testing

1. Open 6 browser tabs/windows
2. Generate unique userId for each
3. Join matchmaking queue in all tabs
4. Verify match is created when 6th player joins
5. Check team assignments and session ID

### Load Testing

```bash
# Install artillery
npm install -g artillery

# Run load test (coming soon)
artillery run matchmaking-load-test.yml
```

## API Reference

### Socket.io Events

#### Client → Server

| Event               | Payload              | Description             |
| ------------------- | -------------------- | ----------------------- |
| `matchmaking:join`  | `{ userId: string }` | Join matchmaking queue  |
| `matchmaking:leave` | `{ userId: string }` | Leave matchmaking queue |

#### Server → Client

| Event                      | Payload                                      | Description              |
| -------------------------- | -------------------------------------------- | ------------------------ |
| `matchmaking:joined`       | `{ position, queueSize, estimatedWaitTime }` | Queue join confirmation  |
| `matchmaking:left`         | -                                            | Queue leave confirmation |
| `matchmaking:found`        | `{ sessionId, teamA, teamB, yourTeam }`      | Match found notification |
| `matchmaking:queue-update` | `{ queueSize }`                              | Queue size update        |
| `matchmaking:error`        | `{ message }`                                | Error notification       |

### REST API

#### GET /api/matchmaking/status

**Authentication**: Required (JWT)

**Response**:

```json
{
  "success": true,
  "data": {
    "inQueue": true,
    "position": 3,
    "queueSize": 5
  }
}
```

---

For more information, see the main [DEVELOPMENT.md](./DEVELOPMENT.md) guide.
