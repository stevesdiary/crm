import { Router, Request, Response } from 'express';
import { AuthController } from '../controllers/AuthController';

const router: Router = Router();
const authController = new AuthController();

/**
 * @route POST /api/v1/auth/signup
 * @desc User signup
 * @access Public
 */
router.post('/signup', (req: Request, res: Response) => authController.signup(req, res));

/**
 * @route POST /api/v1/auth/login
 * @desc User login
 * @access Public
 */
router.post('/login', (req: Request, res: Response) => authController.login(req, res));

export default router;