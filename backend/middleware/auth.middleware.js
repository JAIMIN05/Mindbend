const jwt = require('jsonwebtoken');
const { responseFormatter } = require('../utils/responseFormatter');
require('dotenv').config();

exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // Check for token in cookies
    if (req.cookies && req.cookies.jwt_token) {
      token = req.cookies.jwt_token;
    }
    
    // If no cookie token, check Authorization header
    if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return responseFormatter(res, 401, false, "Not authorized, no token");
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Add user info to request
      req.user = {
        id: decoded.id,
        role: decoded.role
      };
      
      next();
    } catch (error) {
      console.error("Token verification error:", error);
      return responseFormatter(res, 401, false, "Not authorized, token failed");
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return responseFormatter(res, 500, false, "Server error", null, error.message);
  }
}; 