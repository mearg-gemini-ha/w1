import { Router } from 'express';
import authRouter from './auth';
import usersRouter from './users';
import matchmakingRouter from './matchmaking';
import sessionsRouter from './sessions';
import statsRouter from './stats';

const router = Router();

router.use('/auth', authRouter);
router.use('/users', usersRouter);
router.use('/matchmaking', matchmakingRouter);
router.use('/sessions', sessionsRouter);
router.use('/stats', statsRouter);

export default router;
