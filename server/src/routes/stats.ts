import { Router, Request, Response } from 'express';
import { StatsService } from '../services/StatsService';

const router = Router();

router.get('/players/:userId/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const playerStats = await StatsService.getPlayerStats(userId);

    res.status(200).json({
      success: true,
      data: {
        playerStats,
      },
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message: error instanceof Error ? error.message : 'Player stats not found',
    });
  }
});

router.get('/leaderboards/global', async (req: Request, res: Response): Promise<void> => {
  try {
    const leaderboard = await StatsService.getLeaderboard();

    res.status(200).json({
      success: true,
      data: {
        leaderboard,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get global leaderboard',
    });
  }
});

router.get('/leaderboards/season/:seasonId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { seasonId } = req.params;

    const leaderboard = await StatsService.getLeaderboard(seasonId);

    res.status(200).json({
      success: false,
      message: 'Season leaderboards not yet implemented',
    });
    
    // TODO: Implement season-based leaderboards
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get season leaderboard',
    });
  }
});

export default router;