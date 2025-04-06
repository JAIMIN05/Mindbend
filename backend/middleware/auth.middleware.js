const jwt = require('jsonwebtoken');
const { responseFormatter } = require('../utils/responseFormatter');
require('dotenv').config();

exports.protect = async (req, res, next) => {
  try {
    // Get token from cookies
    const token = req.cookies.jwt_signup || req.cookies.jwt_login;
    
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