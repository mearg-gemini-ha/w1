import { Router, Response } from 'express';
import { MatchmakingService } from '../services/matchmakingService';
import { authenticateToken, AuthRequest } from '../middleware/auth';
import { ApiResponse } from '../types';

const router = Router();

router.get('/status', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      res.status(401).json({
        success: false,
        error: 'Unauthorized',
      } as ApiResponse);
      return;
    }

    const queueSize = MatchmakingService.getQueueSize();
    const position = MatchmakingService.getPlayerPosition(userId);

    res.json({
      success: true,
      data: {
        inQueue: position > 0,
        position,
        queueSize,
      },
    } as ApiResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to get matchmaking status',
    } as ApiResponse);
  }
});

export default router;
