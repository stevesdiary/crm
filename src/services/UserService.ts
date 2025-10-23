import { User } from '../models/User';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

export class UserService {
  /**
   * Find a user by email
   * @param email User's email
   * @returns User object or null if not found
   */
  async findByEmail(email: string): Promise<User | null> {
    return await User.findOne({ where: { email } });
  }

  /**
   * Find a user by ID
   * @param id User's ID
   * @returns User object or null if not found
   */
  async findById(id: string): Promise<User | null> {
    return await User.findByPk(id);
  }

  /**
   * Create a new user
   * @param userData User data
   * @returns Created user object
   */
  async createUser(userData: {
    email: string;
    password: string;
    fullName: string;
    tenantId: string;
  }): Promise<User> {
    const passwordHash = await bcrypt.hash(userData.password, 10);
    
    return await User.create({
      id: randomBytes(16).toString('hex'),
      email: userData.email,
      passwordHash,
      fullName: userData.fullName,
      tenantId: userData.tenantId,
    });
  }

  /**
   * Validate user credentials
   * @param email User's email
   * @param password User's password
   * @returns User object if valid, null otherwise
   */
  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (user && await bcrypt.compare(password, user.passwordHash)) {
      return user;
    }
    return null;
  }

  /**
   * Update user's last login time
   * @param userId User's ID
   */
  async updateLastLogin(userId: string): Promise<void> {
    await User.update(
      { lastLogin: new Date() },
      { where: { id: userId } }
    );
  }
}