import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

const generateToken = (id: number, role: string) => {
  return jwt.sign({ id, role }, (process.env.JWT_SECRET || 'super_secret_jwt_key') as string, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as any,
  });
};

export const registerUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      res.status(400).json({ success: false, message: 'Please provide all fields' });
      return;
    }

    const userExists = await User.findByEmail(email);
    if (userExists) {
      res.status(400).json({ success: false, message: 'User already exists' });
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const userId = await User.create(name, email, hashedPassword);
    const token = generateToken(userId, 'customer');

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { id: userId, name, email, role: 'customer', token }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide email and password' });
      return;
    }

    const user = await User.findByEmail(email);
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
      return;
    }

    const token = generateToken(user.id, user.role);

    res.json({
      success: true,
      message: 'Logged in successfully',
      data: { id: user.id, name: user.name, email: user.email, role: user.role, token }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAuthConfig = async (_req: Request, res: Response): Promise<void> => {
  res.json({
    success: true,
    data: {
      googleClientId: process.env.GOOGLE_CLIENT_ID || process.env.VITE_GOOGLE_CLIENT_ID || ''
    }
  });
};

export const googleAuth = async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : req.body?.token || req.body?.credential;

    if (!token) {
      res.status(400).json({ success: false, message: 'Google authorization token or credential is required' });
      return;
    }

    let email = '';
    let name = '';
    let picture = '';

    // 1. Try verifying as Google ID Token if formatted as JWT
    if (token.split('.').length === 3) {
      try {
        const verifyRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`);
        if (verifyRes.ok) {
          const payload = await verifyRes.json();
          if (payload.email) {
            email = payload.email;
            name = payload.name || payload.given_name || email.split('@')[0];
            picture = payload.picture || '';
          }
        }
      } catch (err: any) {
        console.warn('Google ID token verification error:', err.message);
      }
    }

    // 2. Try verifying as OAuth2 Access Token via Google userinfo endpoint
    if (!email) {
      try {
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (userInfoRes.ok) {
          const userInfo = await userInfoRes.json();
          if (userInfo.email) {
            email = userInfo.email;
            name = userInfo.name || userInfo.given_name || email.split('@')[0];
            picture = userInfo.picture || '';
          }
        }
      } catch (err: any) {
        console.warn('Google userinfo fetch error:', err.message);
      }
    }

    if (!email) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired Google authentication token. Please try again.'
      });
      return;
    }

    // Check if user already exists
    let user = await User.findByEmail(email);
    let userId: number;

    if (!user) {
      // Create new user account for Google sign-up
      const randomSecret = Math.random().toString(36).substring(2) + Date.now().toString(36);
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(randomSecret, salt);

      userId = await User.create(name, email, hashedPassword);
      user = { id: userId, name, email, role: 'customer' };
    } else {
      userId = user.id;
    }

    const sessionToken = generateToken(userId, user.role || 'customer');

    res.json({
      success: true,
      message: 'Signed in with Google successfully',
      data: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role || 'customer',
        picture: picture || undefined,
        token: sessionToken
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Error processing Google sign-in' });
  }
};

export const getMe = async (req: any, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }
    res.json({ success: true, data: user });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
