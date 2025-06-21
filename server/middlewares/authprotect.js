import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export const protect = (req, res, next) => {
  try {
    let token;

    // 1. Check cookie (for browser)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('Token from cookie:', token);
    } 
    // 2. Check header (for React Native)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('Token from header:', token);
    }

    // No token
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log('Decoded token:', decoded);

    req.user = {
      id: decoded.userId,
      role: decoded.role || 'user'
    };

    next();
  } catch (err) {
    console.error('Protect middleware error:', err);
    res.status(401).json({ message: 'Token is not valid' });
  }
};
