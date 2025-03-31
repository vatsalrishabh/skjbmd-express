const jwt = require('jsonwebtoken');
const SECRET_KEY = process.env.JWT_SECRET; // Replace with your actual secret key

// Middleware to verify JWT
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
console.log(req.headers)
  if (!authHeader) {
    return res.status(403).json({ message: 'Authorization header missing' });
  }

  const token = authHeader.split(' ')[1];
  
const tokenWithoutQuotes = token.replace(/"/g, ''); // Removes all double quotes

  jwt.verify(tokenWithoutQuotes, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }
    req.user = user;
    next();
  });
};

// Middleware for role-based access
const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};

module.exports = { authenticateJWT, authorizeRoles };
