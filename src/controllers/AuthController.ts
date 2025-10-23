import { Request, Response } from 'express';
import { UserService } from '../services/UserService';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';

export class AuthController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * User signup
   * @param req Express request
   * @param res Express response
   */
  async signup(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, fullName } = req.body;
      
      // Check if user already exists
      const existingUser = await this.userService.findByEmail(email);
      if (existingUser) {
        res.status(400).json({ message: 'User already exists' });
        return;
      }

      // For now, we'll create a default tenant
      // In a real application, you'd want to handle this properly
      const tenantId = randomBytes(16).toString('hex');
      
      // Create user
      const user = await this.userService.createUser({
        email,
        password,
        fullName,
        tenantId,
      });

      res.status(201).json({ 
        message: 'User created successfully',
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          tenantId: user.tenantId,
        }
      });
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  /**
   * User login
   * @param req Express request
   * @param res Express response
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      
      // Validate user credentials
      const user = await this.userService.validateUser(email, password);
      if (!user) {
        res.status(401).json({ message: 'Invalid credentials' });
        return;
      }

      // Update last login
      await this.userService.updateLastLogin(user.id);

      // Generate JWT token
      const token = jwt.sign(
        { 
          sub: user.id, 
          email: user.email,
          tenantId: user.tenantId,
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '1h' }
      );

      res.json({ 
        message: 'Login successful',
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
          fullName: user.fullName,
          tenantId: user.tenantId,
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}