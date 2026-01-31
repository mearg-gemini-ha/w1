import { Router, Request, Response } from 'express';
import { AuthRequest, authenticate } from '../middleware/auth';
import { GameSessionService } from '../services/GameSessionService';
import { GameSessionModel } from '../models/GameSession';

const router = Router();

router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const sessions = await GameSessionModel.getActiveSessions();
    const sessionsWithDetails = await Promise.all(
      sessions.map(async (session) => {
        return GameSessionService.getSessionWithDetails(session.id);
      })
    );

    res.status(200).json({
      success: true,
      data: {
        sessions: sessionsWithDetails,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get active sessions',
    });
  }
});

router.get('/:sessionId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const session = await GameSessionService.getSessionWithDetails(sessionId);
    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        session,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get session',
    });
  }
});

router.post('/:sessionId/result', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { winner } = req.body;

    if (!sessionId || !winner) {
      res.status(400).json({ success: false, message: 'Session ID and winner are required' });
      return;
    }

    const session = await GameSessionModel.findById(sessionId);
    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found' });
      return;
    }

    await GameSessionService.endMatch(sessionId, winner);
    await GameSessionService.updatePlayerStats(session, winner);

    res.status(200).json({
      success: true,
      data: {
        message: 'Match result recorded',
        sessionId,
        winner,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to submit match result',
    });
  }
});

export default router;