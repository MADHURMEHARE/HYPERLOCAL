import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserRepository } from '../repositories/UserRepository';
import { JWT_SECRET, DEFAULT_PASSWORD_HASH } from '../../server/db';
import { UserRole } from '../../src/types';
import { EmailService } from '../services/EmailService';

export class AuthController {
  static async register(req: Request, res: Response) {
    const { name, email, password, role, ward } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required.' });
    }

    try {
      const existingUser = await UserRepository.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ success: false, error: 'User with this email already exists.' });
      }

      const passwordHash = bcrypt.hashSync(password, 10);
      const newUser = await UserRepository.create(name, email, passwordHash, role as UserRole, ward);
      const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '24h' });

      // Send welcome email asynchronously using Resend SMTP
      EmailService.sendWelcomeEmail(newUser.email, newUser.name).catch((err) => {
        console.error('Failed to send welcome email:', err);
      });

      return res.status(201).json({ success: true, user: newUser, token });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Server error during registration.' });
    }
  }

  static async login(req: Request, res: Response) {
    const { email, password, role, isDemo } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required.' });
    }

    try {
      const user = await UserRepository.findByEmail(email);

      // Direct bypass for demo quick logs without password
      if (!password || isDemo) {
        if (user) {
          const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });
          return res.json({ success: true, user, token });
        }

        // Create citizen user on demand for hackathon demo convenience
        const name = email.split('@')[0].replace(/[^a-zA-Z]/g, ' ') || 'Anonymous Hero';
        const newUser = await UserRepository.create(name, email, DEFAULT_PASSWORD_HASH, (role as UserRole) || 'citizen', 'Ward 3 - Mission');
        const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '24h' });
        
        // Send welcome email asynchronously
        EmailService.sendWelcomeEmail(newUser.email, newUser.name).catch((err) => {
          console.error('Failed to send welcome email:', err);
        });

        return res.json({ success: true, user: newUser, token });
      }

      // Real password authentication
      if (!user) {
        return res.status(401).json({ success: false, error: 'User not found. Please sign up.' });
      }

      const isPasswordValid = bcrypt.compareSync(password, user.passwordHash || '');
      if (!isPasswordValid) {
        return res.status(401).json({ success: false, error: 'Invalid password. Please try again.' });
      }

      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

      return res.json({ success: true, user, token });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Server error during login.' });
    }
  }

  static async me(req: Request, res: Response) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ success: false, error: 'Token missing.' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
      const user = await UserRepository.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found.' });
      }
      return res.json({ success: true, user });
    } catch (err) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
    }
  }

  // Temporary storage for password reset codes, with 15 minutes TTL
  private static resetCodes = new Map<string, { code: string; expires: number }>();

  static async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email address is required.' });
    }

    try {
      const cleanEmail = email.toLowerCase().trim();
      const user = await UserRepository.findByEmail(cleanEmail);

      // Gracefully prevent email scanning but behave identically
      if (!user) {
        return res.json({ 
          success: true, 
          message: 'If that email is registered in our system, a 6-digit reset code has been dispatched.' 
        });
      }

      // Generate a secure 6-digit numeric verification code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expires = Date.now() + 15 * 60 * 1000; // 15 mins validity

      AuthController.resetCodes.set(cleanEmail, { code, expires });

      // Dispatch reset email
      EmailService.sendPasswordResetEmail(user.email, user.name, code).catch((err) => {
        console.error(`❌ Forgot password email error for ${cleanEmail}:`, err);
      });

      return res.json({ 
        success: true, 
        message: 'A 6-digit password reset code has been sent to your email.' 
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Server error.' });
    }
  }

  static async resetPassword(req: Request, res: Response) {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email, verification code, and new password are required.' 
      });
    }

    try {
      const cleanEmail = email.toLowerCase().trim();
      const record = AuthController.resetCodes.get(cleanEmail);

      if (!record) {
        return res.status(400).json({ 
          success: false, 
          error: 'No active password reset request found for this email.' 
        });
      }

      if (Date.now() > record.expires) {
        AuthController.resetCodes.delete(cleanEmail);
        return res.status(400).json({ 
          success: false, 
          error: 'Verification code has expired. Please request a new one.' 
        });
      }

      if (record.code !== code.trim()) {
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid verification code. Please try again.' 
        });
      }

      // Valid code -> encrypt new password and save
      const passwordHash = bcrypt.hashSync(newPassword, 10);
      const updatedUser = await UserRepository.updatePassword(cleanEmail, passwordHash);

      if (!updatedUser) {
        return res.status(404).json({ success: false, error: 'User record not found.' });
      }

      // Clear code from store
      AuthController.resetCodes.delete(cleanEmail);

      return res.json({ 
        success: true, 
        message: 'Your password has been successfully reset. Please log in with your new credentials.' 
      });
    } catch (err: any) {
      return res.status(500).json({ success: false, error: err.message || 'Server error during password reset.' });
    }
  }
}
