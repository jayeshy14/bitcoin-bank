import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    console.log('Authorization Header:', req.headers.authorization);
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      console.log('No token found');
      return res.status(401).json({
        error: 'Not authorized to access this route'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Decoded Token:', decoded);

    // Get user from token
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      console.log('User not found');
      return res.status(401).json({
        error: 'User not found'
      });
    }

    req.user = user;
    console.log('Authenticated User:', req.user);
    next();
  } catch (error) {
    console.error('Authorization Error:', error);
    return res.status(401).json({
      error: 'Not authorized to access this route'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    console.log('User Role:', req.user.role);
    console.log('Required Roles:', roles);
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
}; 