import { Router } from 'express';
import authRouter from './auth';
import matchmakingRouter from './matchmaking';

const router = Router();

router.use('/auth', authRouter);
router.use('/matchmaking', matchmakingRouter);

export default router;
