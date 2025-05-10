import '../config.js';
import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { OAuth2Client } from 'google-auth-library';
import { GOOGLE_CLIENT_ID, JWT_SECRET } from '../config.js';



const router = express.Router();

// POST /api/auth/google (token-based, for SPA)
router.post('/google', async (req, res) => {
  const { tokenId } = req.body;
  try {
    const client = new OAuth2Client(GOOGLE_CLIENT_ID);
    const ticket = await client.verifyIdToken({
      idToken: tokenId,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    let user = await User.findOne({ googleId: payload.sub });
    if (!user) {
      user = await User.create({
        googleId: payload.sub,
        name: payload.name,
        email: payload.email,
        role: 'user',
      });
    }
    const token = jwt.sign({ userId: user._id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(401).json({ message: 'Google auth failed' });
  }
});

// GET /api/auth/me - Verify the current user
router.get('/me', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) return res.status(401).json({ message: 'No token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(payload.userId);
    if (!user) return res.status(401).json({ message: 'User not found' });
    res.json({ user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

export default router; 