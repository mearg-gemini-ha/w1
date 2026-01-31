import express, { Application } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { config } from './config';
import { setupSocketEvents } from './config/socket';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();

const app: Application = express();
const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: config.corsOrigin,
    methods: ['GET', 'POST'],
  },
});

app.use(helmet());
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/api', routes);

setupSocketEvents(io);

app.use(errorHandler);

const SOCKET_PORT = config.socketPort || config.port;

httpServer.listen(SOCKET_PORT, () => {
  console.info(`Server running on port ${SOCKET_PORT}`);
  console.info(`Environment: ${config.nodeEnv}`);
  console.info(`WebSocket server ready`);
});

export { app, io };
