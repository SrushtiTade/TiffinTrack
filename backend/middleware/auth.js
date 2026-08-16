import jwt from 'jsonwebtoken';
import Owner from '../models/Owner.js';
import Mess from '../models/Mess.js';

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Owner.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }
    req.user = user;
    req.owner = user.role === 'OWNER' ? user : undefined;

    if (user.role === 'OWNER') {
      req.mess = await Mess.findOne({ ownerId: user._id });
    }

    next();
  } catch {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

export const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: 'Not authorized for this action' });
  }
  next();
};

export const requireMess = async (req, res, next) => {
  if (req.user.role !== 'OWNER') {
    return res.status(403).json({ message: 'Owner access required' });
  }
  if (!req.mess) {
    return res.status(404).json({ message: 'Mess profile not found. Update settings first.' });
  }
  next();
};
