const nodemailer = require('nodemailer');
const { pool } = require('../config/database');
const authHelpers = require('./authHelpers');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter based on environment
   */
  initializeTransporter() {
    if (process.env.NODE_ENV === 'production') {
      // Production email configuration (e.g., SendGrid, AWS SES)
      this.transporter = nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD
        }
      });
    } else {
      // Development/test configuration using Ethereal Email
      this.transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
          user: process.env.EMAIL_USER || 'ethereal.user@ethereal.email',
          pass: process.env.EMAIL_PASSWORD || 'ethereal.pass'
        }
      });
    }
  }

  /**
   * Send email verification
   * @param {Object} user - User object
   * @returns {Promise<Object>} Send result
   */
  async sendEmailVerification(user) {
    try {
      const token = authHelpers.generateSecureToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours

      // Store verification token in database
      await this.storeVerificationToken(user.id, token, expiresAt, 'email_verification');

      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@storerating.com',
        to: user.email,
        subject: 'Verify Your Email Address',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to Store Rating App!</h2>
            <p>Hi ${user.firstName || user.username},</p>
            <p>Thank you for registering with Store Rating App. Please verify your email address by clicking the button below:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Verify Email Address
              </a>
            </div>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p><a href="${verificationUrl}">${verificationUrl}</a></p>
            <p>This verification link will expire in 24 hours.</p>
            <p>If you didn't create an account with us, please ignore this email.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              This is an automated message, please do not reply to this email.
            </p>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId,
        token: process.env.NODE_ENV !== 'production' ? token : undefined
      };

    } catch (error) {
      console.error('Email verification send error:', error);
      throw new Error('Failed to send verification email');
    }
  }

  /**
   * Send password reset email
   * @param {Object} user - User object
   * @returns {Promise<Object>} Send result
   */
  async sendPasswordReset(user) {
    try {
      const token = authHelpers.generateSecureToken();
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour

      // Store reset token in database
      await this.storeVerificationToken(user.id, token, expiresAt, 'password_reset');

      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`;

      const mailOptions = {
        from: process.env.EMAIL_FROM || 'noreply@storerating.com',
        to: user.email,
        subject: 'Reset Your Password',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Password Reset Request</h2>
            <p>Hi ${user.firstName || user.username},</p>
            <p>We received a request to reset your password for your Store Rating App account.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" 
                 style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
                Reset Password
              </a>
            </div>
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <p><strong>This reset link will expire in 1 hour.</strong></p>
            <p>If you didn't request a password reset, please ignore this email. Your password will remain unchanged.</p>
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              This is an automated message, please do not reply to this email.
            </p>
          </div>
        `
      };

      const result = await this.transporter.sendMail(mailOptions);
      
      return {
        success: true,
        messageId: result.messageId,
        token: process.env.NODE_ENV !== 'production' ? token : undefined
      };

    } catch (error) {
      console.error('Password reset email send error:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  /**
   * Store verification token in database
   * @param {number} userId - User ID
   * @param {string} token - Verification token
   * @param {Date} expiresAt - Expiration date
   * @param {string} type - Token type
   * @returns {Promise<void>}
   */
  async storeVerificationToken(userId, token, expiresAt, type) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // First, clean up any existing tokens of the same type for this user
      await client.query(
        'DELETE FROM verification_tokens WHERE user_id = $1 AND type = $2',
        [userId, type]
      );

      // Insert new token
      await client.query(
        `INSERT INTO verification_tokens (user_id, token, type, expires_at)
         VALUES ($1, $2, $3, $4)`,
        [userId, token, type, expiresAt]
      );

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Verify token and get user
   * @param {string} token - Verification token
   * @param {string} type - Token type
   * @returns {Promise<Object|null>} User object or null
   */
  async verifyToken(token, type) {
    try {
      const query = `
        SELECT vt.user_id, vt.expires_at, u.id, u.username, u.email, u.role,
               u.first_name, u.last_name, u.phone, u.is_active, u.email_verified
        FROM verification_tokens vt
        JOIN users u ON vt.user_id = u.id
        WHERE vt.token = $1 AND vt.type = $2 AND vt.expires_at > NOW()
      `;

      const result = await pool.query(query, [token, type]);

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        username: row.username,
        email: row.email,
        role: row.role,
        firstName: row.first_name,
        lastName: row.last_name,
        phone: row.phone,
        isActive: row.is_active,
        emailVerified: row.email_verified
      };

    } catch (error) {
      console.error('Token verification error:', error);
      return null;
    }
  }

  /**
   * Remove used token
   * @param {string} token - Token to remove
   * @param {string} type - Token type
   * @returns {Promise<void>}
   */
  async removeToken(token, type) {
    try {
      await pool.query(
        'DELETE FROM verification_tokens WHERE token = $1 AND type = $2',
        [token, type]
      );
    } catch (error) {
      console.error('Token removal error:', error);
    }
  }

  /**
   * Clean up expired tokens
   * @returns {Promise<void>}
   */
  async cleanupExpiredTokens() {
    try {
      const result = await pool.query(
        'DELETE FROM verification_tokens WHERE expires_at <= NOW()'
      );
      
      if (result.rowCount > 0) {
        console.log(`Cleaned up ${result.rowCount} expired tokens`);
      }
    } catch (error) {
      console.error('Token cleanup error:', error);
    }
  }
}

module.exports = new EmailService();