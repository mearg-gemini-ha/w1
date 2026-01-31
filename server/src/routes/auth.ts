import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { AuthRequest, authenticate } from '../middleware/auth';
import { z } from 'zod';

const router = Router();

const registerSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(6),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

router.post('/register', async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, email, password } = registerSchema.parse(req.body);

    const result = await AuthService.register(username, email, password);

    res.status(201).json({
      success: true,
      data: result,
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

    res.status(400).json({
      success: false,
      message: error instanceof Error ? error.message : 'Registration failed',
    });
  }
});

router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const result = await AuthService.login(email, password);

    res.status(200).json({
      success: true,
      data: result,
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

    res.status(401).json({
      success: false,
      message: error instanceof Error ? error.message : 'Login failed',
    });
  }
});

router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const user = await AuthService.getCurrentUser(userId);

    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to get user',
    });
  }
});

export default router;