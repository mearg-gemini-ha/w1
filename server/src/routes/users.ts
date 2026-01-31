import { Router, Request, Response } from 'express';
import { AuthRequest, authenticate } from '../middleware/auth';
import { UserProfileModel } from '../models/UserProfile';
import { PlayerStatsModel } from '../models/PlayerStats';
import { z } from 'zod';

const router = Router();

const updateProfileSchema = z.object({
  display_name: z.string().min(1).max(50).optional(),
  bio: z.string().max(500).optional(),
});

router.get('/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    const userProfile = await UserProfileModel.getFullProfile(userId);
    if (!userProfile) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        profile: userProfile,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get user profile',
    });
  }
});

router.put('/:userId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const authenticatedUserId = req.userId;

    if (userId !== authenticatedUserId) {
      res.status(403).json({ success: false, message: 'Not authorized to update this profile' });
      return;
    }

    const { display_name, bio } = updateProfileSchema.parse(req.body);

    const updatedProfile = await UserProfileModel.updateProfile(userId, {
      display_name,
      bio,
    });

    res.status(200).json({
      success: true,
      data: {
        profile: updatedProfile,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
      return;
    }

    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update profile',
    });
  }
});

export default router;