import { Router, Request, Response } from 'express';
import { AuthRequest, authenticate } from '../middleware/auth';
import { MatchmakingService } from '../services/MatchmakingService';

const router = Router();

router.post('/join', authenticate, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const queueStatus = MatchmakingService.getQueueStatus();
    
    res.status(200).json({
      success: true,
      data: {
        message: 'Joining matchmaking queue',
        queueStatus,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to join matchmaking',
    });
  }
});

router.post('/cancel', authenticate, (req: AuthRequest, res: Response): void => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    MatchmakingService.removePlayer(userId);
    
    res.status(200).json({
      success: true,
      data: {
        message: 'Removed from matchmaking queue',
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to cancel matchmaking',
    });
  }
});

router.get('/queue-status', (req: Request, res: Response): void => {
  try {
    const queueStatus = MatchmakingService.getQueueStatus();
    
    res.status(200).json({
      success: true,
      data: queueStatus,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get queue status',
    });
  }
});

export default router;