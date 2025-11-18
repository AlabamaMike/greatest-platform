import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { DatabaseService } from '../services/database.service';
import { RedisService } from '../services/redis.service';
import { KafkaService } from '../services/kafka.service';
import { logger } from '../utils/logger';

const dbService = new DatabaseService();
const redisService = new RedisService();
const kafkaService = new KafkaService();

export class AuthController {
  /**
   * Register a new user
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, fullName, phoneNumber, countryCode } = req.body;

      // Check if user already exists
      const existingUser = await dbService.query(
        'SELECT id FROM users WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        res.status(400).json({
          success: false,
          error: 'User with this email already exists',
        });
        return;
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, config.bcryptRounds);

      // Create user
      const result = await dbService.query(
        `INSERT INTO users (email, password_hash, full_name, phone_number, country_code)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, email, full_name, created_at`,
        [email, passwordHash, fullName, phoneNumber || null, countryCode || null]
      );

      const user = result.rows[0];

      // Assign default role
      await dbService.query(
        'INSERT INTO user_roles (user_id, role) VALUES ($1, $2)',
        [user.id, 'user']
      );

      // Generate JWT tokens
      const { accessToken, refreshToken } = await this.generateTokens(user.id);

      // Publish user registered event
      await kafkaService.publishUserRegistered(user.id, email, fullName);

      // Log audit event
      await this.logAuditEvent(user.id, 'user.registered', {}, req);

      logger.info('User registered successfully', { userId: user.id, email });

      res.status(201).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            createdAt: user.created_at,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      logger.error('Registration error', error);
      res.status(500).json({
        success: false,
        error: 'Registration failed',
      });
    }
  }

  /**
   * Login user
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Get user
      const result = await dbService.query(
        `SELECT id, email, password_hash, full_name, is_active,
                failed_login_attempts, locked_until
         FROM users WHERE email = $1`,
        [email]
      );

      if (result.rows.length === 0) {
        res.status(401).json({
          success: false,
          error: 'Invalid email or password',
        });
        return;
      }

      const user = result.rows[0];

      // Check if account is locked
      if (user.locked_until && new Date(user.locked_until) > new Date()) {
        res.status(403).json({
          success: false,
          error: 'Account is temporarily locked due to multiple failed login attempts',
        });
        return;
      }

      // Check if account is active
      if (!user.is_active) {
        res.status(403).json({
          success: false,
          error: 'Account is deactivated',
        });
        return;
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password_hash);

      if (!isPasswordValid) {
        // Increment failed login attempts
        const newFailedAttempts = (user.failed_login_attempts || 0) + 1;
        const lockUntil =
          newFailedAttempts >= config.maxLoginAttempts
            ? new Date(Date.now() + config.lockoutDuration)
            : null;

        await dbService.query(
          'UPDATE users SET failed_login_attempts = $1, locked_until = $2 WHERE id = $3',
          [newFailedAttempts, lockUntil, user.id]
        );

        await this.logAuditEvent(user.id, 'login.failed', { email }, req);

        res.status(401).json({
          success: false,
          error: 'Invalid email or password',
        });
        return;
      }

      // Reset failed login attempts
      await dbService.query(
        'UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login = NOW() WHERE id = $1',
        [user.id]
      );

      // Generate tokens
      const { accessToken, refreshToken } = await this.generateTokens(user.id);

      // Publish login event
      await kafkaService.publishUserLoggedIn(
        user.id,
        req.ip || 'unknown',
        req.get('user-agent') || 'unknown'
      );

      // Log audit event
      await this.logAuditEvent(user.id, 'user.logged_in', {}, req);

      logger.info('User logged in successfully', { userId: user.id, email });

      res.status(200).json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
          },
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      logger.error('Login error', error);
      res.status(500).json({
        success: false,
        error: 'Login failed',
      });
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(req: Request, res: Response): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        res.status(400).json({
          success: false,
          error: 'Refresh token is required',
        });
        return;
      }

      // Verify refresh token
      let decoded: any;
      try {
        decoded = jwt.verify(refreshToken, config.jwtSecret);
      } catch (error) {
        res.status(401).json({
          success: false,
          error: 'Invalid or expired refresh token',
        });
        return;
      }

      // Check if token is blacklisted
      const isBlacklisted = await redisService.isTokenBlacklisted(refreshToken);
      if (isBlacklisted) {
        res.status(401).json({
          success: false,
          error: 'Token has been revoked',
        });
        return;
      }

      // Generate new tokens
      const tokens = await this.generateTokens(decoded.userId);

      res.status(200).json({
        success: true,
        data: tokens,
      });
    } catch (error) {
      logger.error('Token refresh error', error);
      res.status(500).json({
        success: false,
        error: 'Token refresh failed',
      });
    }
  }

  /**
   * Logout user
   */
  async logout(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;
      const token = req.headers.authorization?.replace('Bearer ', '');

      if (token) {
        // Blacklist the token
        const decoded: any = jwt.decode(token);
        if (decoded && decoded.exp) {
          const ttl = decoded.exp - Math.floor(Date.now() / 1000);
          if (ttl > 0) {
            await redisService.blacklistToken(token, ttl);
          }
        }
      }

      if (userId) {
        // Delete session
        await redisService.deleteSession(userId);

        // Publish logout event
        await kafkaService.publishUserLoggedOut(userId);

        // Log audit event
        await this.logAuditEvent(userId, 'user.logged_out', {}, req);
      }

      res.status(200).json({
        success: true,
        message: 'Logged out successfully',
      });
    } catch (error) {
      logger.error('Logout error', error);
      res.status(500).json({
        success: false,
        error: 'Logout failed',
      });
    }
  }

  /**
   * Get current user profile
   */
  async getProfile(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.userId;

      const result = await dbService.query(
        `SELECT u.id, u.email, u.full_name, u.phone_number, u.country_code,
                u.language_preference, u.timezone, u.email_verified, u.phone_verified,
                u.created_at, u.last_login,
                ARRAY_AGG(DISTINCT ur.role) as roles
         FROM users u
         LEFT JOIN user_roles ur ON u.id = ur.user_id
         WHERE u.id = $1
         GROUP BY u.id`,
        [userId]
      );

      if (result.rows.length === 0) {
        res.status(404).json({
          success: false,
          error: 'User not found',
        });
        return;
      }

      const user = result.rows[0];

      res.status(200).json({
        success: true,
        data: {
          id: user.id,
          email: user.email,
          fullName: user.full_name,
          phoneNumber: user.phone_number,
          countryCode: user.country_code,
          languagePreference: user.language_preference,
          timezone: user.timezone,
          emailVerified: user.email_verified,
          phoneVerified: user.phone_verified,
          roles: user.roles.filter((r: any) => r !== null),
          createdAt: user.created_at,
          lastLogin: user.last_login,
        },
      });
    } catch (error) {
      logger.error('Get profile error', error);
      res.status(500).json({
        success: false,
        error: 'Failed to get profile',
      });
    }
  }

  /**
   * Generate JWT access and refresh tokens
   */
  private async generateTokens(userId: string): Promise<{ accessToken: string; refreshToken: string }> {
    const accessTokenOptions: SignOptions = {
      expiresIn: config.jwtExpiry as any,
    };

    const refreshTokenOptions: SignOptions = {
      expiresIn: config.refreshTokenExpiry as any,
    };

    const accessToken = jwt.sign({ userId, type: 'access' }, config.jwtSecret, accessTokenOptions);
    const refreshToken = jwt.sign({ userId, type: 'refresh' }, config.jwtSecret, refreshTokenOptions);

    return { accessToken, refreshToken };
  }

  /**
   * Log audit event
   */
  private async logAuditEvent(
    userId: string,
    eventType: string,
    eventData: any,
    req: Request
  ): Promise<void> {
    try {
      await dbService.query(
        `INSERT INTO audit_log (user_id, event_type, event_data, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          userId,
          eventType,
          JSON.stringify(eventData),
          req.ip || null,
          req.get('user-agent') || null,
        ]
      );
    } catch (error) {
      logger.error('Failed to log audit event', error);
    }
  }
}

export const authController = new AuthController();
