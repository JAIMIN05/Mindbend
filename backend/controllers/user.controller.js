const User = require("../models/user.model");
const { responseFormatter } = require("../utils/responseFormatter");
const axios = require('axios');
const jwt = require('jsonwebtoken');

// Chat with ai
exports.AskToAI = async (req, res) => {
  const { Groq } = require("groq-sdk");

  const groq = new Groq({ apiKey: process.env.GROQ_KEY });

  let respose = await main(req.body.input_value);
  res.status(200).send({ message: respose });
  async function main(query) {
    const chatCompletion = await getGroqChatCompletion(query);
    // Print the completion returned by the LLM.
    console.log(chatCompletion.choices[0]?.message?.content || "");
    return chatCompletion.choices[0]?.message?.content || "Sorry I can't Provide data for your query";
  }

  async function getGroqChatCompletion(query) {
    return groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: `
          This is a user query: ${query}. Answer the query if and only if user can solve his problem by his own. Answer user's query if and only if query is related to car or bike problem.
          If issue is major then tell user to contact service provider. If you answer user's query then also add youtube video link related to user's problem.
          `,
        },
      ],
      model: "llama3-8b-8192",
    });
  }
  // const { LangflowClient } = await import("@datastax/langflow-client");
  // let { input_value } = req.body; // Insert input value here
  // const langflowId = "9f2e8c22-bb2f-4fa4-84e8-804825a6738f";
  // const flowId = "3c34fc25-bf1d-41bb-9876-929fdb067199";
  // const apikey = process.env.APPLICATION_TOKEN;

  // const client = new LangflowClient({ langflowId, apiKey: apikey });
  // const flow = client.flow(flowId);

  // const result = await flow.run(input_value);
  // console.log(result.chatOutputText());
  // return res.json({message: result.chatOutputText()});
};

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      return responseFormatter(res, 404, false, "User not found");
    }

    return responseFormatter(res, 200, true, "User profile retrieved successfully", { user });
  } catch (err) {
    console.error("Get profile error:", err);
    return responseFormatter(res, 500, false, "Server error", null, err.message);
  }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
  try {
    // Get user ID from JWT token (set by auth middleware)
    const userId = req.user?.id;
    if (!userId) {
      return responseFormatter(res, 401, false, "Authentication required");
    }

    const { name, mobile, location, other_contact, guardian_emails } = req.body;
    
    // Create update data object
    const updateData = {};

    // Only update fields that are provided
    if (name) updateData.name = name;
    if (mobile) {
      // Validate mobile number format if provided
      if (!/^\d{10}$/.test(mobile)) {
        return responseFormatter(res, 400, false, "Mobile number must be 10 digits");
      }
      
      // Check if mobile number is already in use by another user
      const existingUser = await User.findOne({ mobile, _id: { $ne: userId } });
      if (existingUser) {
        return responseFormatter(res, 400, false, "Mobile number already in use");
      }
      
      updateData.mobile = mobile;
    }
    
    if (location) {
      updateData.location = location;
    }
    
    if (other_contact) {
      updateData.other_contact = other_contact;
    }
    
    // Handle guardian emails if provided
    if (guardian_emails) {
      // Validate email format for each entry
      for (const email of guardian_emails) {
        if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
          return responseFormatter(res, 400, false, `Invalid email format: ${email}`);
        }
      }
      
      // Limit to 5 emails
      if (guardian_emails.length > 5) {
        return responseFormatter(res, 400, false, "Maximum 5 guardian emails allowed");
      }
      
      updateData.guardian_emails = guardian_emails;
    }

    // Update user and return updated document
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select('-password');

    if (!user) {
      return responseFormatter(res, 404, false, "User not found");
    }

    return responseFormatter(res, 200, true, "Profile updated successfully", { user });
  } catch (err) {
    console.error("Update profile error:", err);
    return responseFormatter(res, 500, false, "Server error", null, err.message);
  }
};

// Change password
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return responseFormatter(res, 404, false, "User not found");
    }

    // Check if current password matches
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return responseFormatter(res, 400, false, "Current password is incorrect");
    }

    // Hash new password and update
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return responseFormatter(res, 200, true, "Password changed successfully");
  } catch (err) {
    console.error("Change password error:", err);
    return responseFormatter(res, 500, false, "Server error", null, err.message);
  }
};

// Delete user account
exports.deleteAccount = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user.id);
    
    if (!user) {
      return responseFormatter(res, 404, false, "User not found");
    }

    // Clear the JWT cookie
    res.cookie('jwt', '', {
      httpOnly: true,
      expires: new Date(0)
    });

    return responseFormatter(res, 200, true, "Account deleted successfully");
  } catch (err) {
    console.error("Delete account error:", err);
    return responseFormatter(res, 500, false, "Server error", null, err.message);
  }
};

// Get all users (Admin only)
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    return responseFormatter(res, 200, true, "Users retrieved successfully", { users });
  } catch (err) {
    console.error("Get all users error:", err);
    return responseFormatter(res, 500, false, "Server error", null, err.message);
  }
};

// Get user by ID (Admin only)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return responseFormatter(res, 404, false, "User not found");
    }

    return responseFormatter(res, 200, true, "User retrieved successfully", { user });
  } catch (err) {
    console.error("Get user by ID error:", err);
    return responseFormatter(res, 500, false, "Server error", null, err.message);
  }
};

// Add a method to update guardian emails
exports.updateGuardianEmails = async (req, res) => {
  try {
    const token = req.cookies.jwt_signup || req.cookies.jwt_login;
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: "Unauthorized" 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const { guardian_emails } = req.body;
    
    if (!Array.isArray(guardian_emails)) {
      return res.status(400).json({
        success: false,
        message: "Guardian emails must be an array"
      });
    }
    
    // Validate email format
    for (const email of guardian_emails) {
      if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        return res.status(400).json({
          success: false,
          message: `Invalid email format: ${email}`
        });
      }
    }
    
    // Limit to 5 emails
    if (guardian_emails.length > 5) {
      return res.status(400).json({
        success: false,
        message: "Maximum 5 guardian emails allowed"
      });
    }

    // Update the user
    const user = await User.findByIdAndUpdate(
      userId,
      { guardian_emails },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    return res.status(200).json({
      success: true,
      message: "Guardian emails updated successfully",
      data: {
        guardian_emails: user.guardian_emails
      }
    });
  } catch (error) {
    console.error("Error updating guardian emails:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

exports.forextension = async (req, res) => {
  try {
    const Emergency = require("../models/emergency.model");
    const Request = require("../models/request.model");
    
    // Get coordinates from the request
    const { longitude, latitude } = req.query;
    
    if (!longitude || !latitude) {
      return responseFormatter(res, 400, false, "Longitude and latitude are required");
    }
    
    // Convert to numbers
    const lon = parseFloat(longitude);
    const lat = parseFloat(latitude);
    
    // Define the 50km radius query (50000 meters)
    const radiusInMeters = 50000;
    
    // Find pending emergencies within 50km
    const pendingEmergencies = await Emergency.find({
      status: "pending",
      latlon: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lon, lat]
          },
          $maxDistance: radiusInMeters
        }
      }
    }).populate('user', 'email name');
    
    // Find pending requests within 50km
    const pendingRequests = await Request.find({
      status: "pending",
      latlon: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lon, lat]
          },
          $maxDistance: radiusInMeters
        }
      }
    }).populate('user', 'email name');
    
    // Format the response data
    const emergencyData = pendingEmergencies.map(emergency => ({
      id: emergency._id,
      type: 'emergency',
      latlon: emergency.latlon,
      user: {
        id: emergency.user._id,
        email: emergency.user.email,
        name: emergency.user.name
      },
      created_at: emergency.created_at
    }));
    
    const requestData = pendingRequests.map(request => ({
      id: request._id,
      type: 'request',
      title: request.title,
      latlon: request.latlon,
      user: {
        id: request.user._id,
        email: request.user.email,
        name: request.user.name
      },
      vehical_info: request.vehical_info
    }));
    
    return responseFormatter(res, 200, true, "Retrieved pending requests successfully", {
      emergencies: emergencyData,
      requests: requestData
    });
    
  } catch (error) {
    console.error("forextension error:", error);
    return responseFormatter(res, 500, false, "Server error", null, error.message);
  }
}
