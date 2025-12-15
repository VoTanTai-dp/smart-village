import jwt from 'jsonwebtoken';
import db from '../models/index.js';

export const authenticate = async (req, res, next) => {
  try {
    const auth = req.headers['authorization'] || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const secret = process.env.JWT_SECRET || 'smartvillage_secret';
    const payload = jwt.verify(token, secret);
    // payload should contain user id; fallback email if present
    const userId = payload.id || payload.userId || payload.sub;
    if (!userId) return res.status(401).json({ success: false, message: 'Invalid token' });

    const user = await db.User.findByPk(userId, { raw: true });
    if (!user) return res.status(401).json({ success: false, message: 'User not found' });

    req.user = user;
    next();
  } catch (e) {
    console.error('auth error', e);
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
};

export const requireAdmin = (req, res, next) => {
  try {
    const groupId = req.user?.groupId;
    if (groupId === 1) return next();
    return res.status(403).json({ success: false, message: 'Forbidden' });
  } catch (e) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }
};
