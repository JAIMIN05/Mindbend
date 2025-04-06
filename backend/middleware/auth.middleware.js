const jwt = require('jsonwebtoken');
const { responseFormatter } = require('../utils/responseFormatter');
require('dotenv').config();

exports.protect = async (req, res, next) => {
  try {
    let token;
    
    // 1. Check Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    // 2. Check for token in cookies
    else if (req.cookies && req.cookies.jwt_token) {
      token = req.cookies.jwt_token;
    }
    // 3. Check query parameter (for development/testing)
    else if (req.query && req.query.token) {
      token = req.query.token;
    }

    if (!token) {
      console.log('No token found in:', {
        headers: req.headers.authorization ? 'Present' : 'Not present',
        cookies: req.cookies ? 'Present' : 'Not present',
        query: req.query ? 'Present' : 'Not present'
      });
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

      // For debugging
      console.log('Token verified successfully:', {
        userId: decoded.id,
        role: decoded.role
      });
      
      next();
    } catch (error) {
      console.error("Token verification error:", {
        error: error.message,
        token: token.substring(0, 10) + '...' // Log part of token for debugging
      });
      return responseFormatter(res, 401, false, "Not authorized, token failed");
    }
  } catch (error) {
    console.error("Auth middleware error:", error);
    return responseFormatter(res, 500, false, "Server error", null, error.message);
  }
}; 