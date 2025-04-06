const User = require("../models/user.model");
const ServiceProvider = require("../models/serviceProvider.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { responseFormatter } = require("../utils/responseFormatter");
const Admin = require("../models/admin.model");
require("dotenv").config();

// Generate JWT token
const generateToken = (user, role) => {
    const secret = process.env.JWT_SECRET || "fallback_secret_key_for_development";
    return jwt.sign({ 
      id: user._id,
      role: role || "user"
    }, secret, {
      expiresIn: '24h'
    });
};

// Cookie configuration
const cookieConfig = {
    httpOnly: false,
    secure: true,
    sameSite: 'none',
    path: '/',
    maxAge: 24 * 60 * 60 * 1000,
    domain: '.vercel.app'
};

// Register a new user
exports.register = async (req, res) => {
  try {
    const { email, password, name, mobile, location, latlon, guardian_emails, other_contact } =
      req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return responseFormatter(res, 400, false, "User already exists");
    }
    
    // Create new user with plain text password
    const user = new User({
      email,
      password, // Will be hashed by pre-save hook
      name,
      mobile,
      location,
      latlon,
      guardian_emails: guardian_emails || [],
      other_contact: other_contact || [],
    });

    await user.save();

    // Generate token with role
    const token = generateToken(user, "user");

    // Set token in cookie
    res.cookie('jwt_token', token, cookieConfig);

    return responseFormatter(res, 201, true, "User registered successfully", {
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: "user",
        token: token // Send token in response as well
      },
    });
  } catch (err) {
    console.error("Registration error:", err);
    return responseFormatter(
      res,
      500,
      false,
      "Server error",
      null,
      err.message
    );
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    let user;
    let role;

    // Check in User model first
    user = await User.findOne({email});
    if (user) {
      role = 'user';
    }

    // If not found in User, check in ServiceProvider
    if (!user) {
      user = await ServiceProvider.findOne({ "contact.email": email });
      if (user) {
        role = 'service_provider';
      }
    }
    
    // If not found in ServiceProvider, check in Admin
    if (!user) {
      user = await Admin.findOne({ email });
      if (user) {
        role = 'admin';
      }
    }

    // If user not found in any model
    if (!user) {
      return responseFormatter(res, 400, false, "Invalid email or password");
    }

    let isequal = await bcrypt.compare(password, user.password);
    if (!isequal) {
      return responseFormatter(res, 400, false, "Invalid email or password");
    }

    // Generate token with role
    const token = generateToken(user, role);

    // Set token in cookie
    res.cookie('jwt_token', token, cookieConfig);

    // Format user data based on role
    let userData;
    if (role === 'user') {
      userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: role,
        mobile: user.mobile,
        location: user.location,
        other_contact: user.other_contact,
        latlon: user.latlon,
        token: token // Send token in response
      };
    } else if (role === 'service_provider') {
      userData = {
        id: user._id,
        name: user.name,
        email: user.contact.email,
        role: role,
        contact: user.contact,
        location: user.location,
        type: user.type,
        rating: user.rating,
        service_count: user.service_count,
        latlon: user.latlon,
        token: token // Send token in response
      };
    } else {
      userData = {
        id: user._id,
        name: user.name,
        email: user.email,
        role: role,
        token: token // Send token in response
      };
    }

    return responseFormatter(res, 200, true, "Login successful", {
      user: userData
    });
  } catch (err) {
    console.error("Login error:", err);
    return responseFormatter(
      res,
      500,
      false,
      "Server error",
      null,
      err.message
    );
  }
};

// Logout user
exports.logout = async (req, res) => {
  try {
    res.cookie('jwt_token', '', {
      ...cookieConfig,
      expires: new Date(0)
    });
    
    return responseFormatter(res, 200, true, "Logged out successfully");
  } catch (err) {
    console.error("Logout error:", err);
    return responseFormatter(
      res,
      500,
      false,
      "Server error",
      null,
      err.message
    );
  }
};
