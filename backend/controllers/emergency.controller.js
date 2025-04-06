const User = require("../models/user.model");
const Emergency = require("../models/emergency.model");
const ServiceProvider = require("../models/serviceProvider.model");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { responseFormatter } = require("../utils/responseFormatter");
const Admin = require("../models/admin.model");
require("dotenv").config();
const mongoose = require("mongoose");
const { sendEmergencyNotification } = require("../utils/mailer");

exports.saveemergency = async (req, res) => {
    try {
        const { latitude, longitude, userid } = req.body;
        console.log('Received emergency request:', { latitude, longitude, userid });

        if (!latitude || !longitude || !userid) {
            return res.status(400).json(responseFormatter(false, "Missing required fields"));
        }

        // Validate userid
        if (!mongoose.Types.ObjectId.isValid(userid)) {
            return res.status(400).json(responseFormatter(false, "Invalid user ID format"));
        }

        // Check for existing emergency requests in the last hour
        const oneHourAgo = new Date(Date.now() - 1000); // 1 hour ago
        const existingRequest = await Emergency.findOne({
            user: new mongoose.Types.ObjectId(userid),
            // created_at: { $gte: oneHourAgo },
            status: { $in: ['pending', 'accepted'] }
        });

        if (existingRequest) {
            console.log('Found existing request:', existingRequest);
            const timeDiff = Math.floor((Date.now() - existingRequest.created_at.getTime()) / (1000 * 60));
            return res.status(200).json({
              success: false,
                message: `You already have an active emergency request. Please wait ${60 - timeDiff} minutes before creating a new request.`,
            });
        }

        // Create emergency request
        const emergencyReq = new Emergency({
            latlon: { 
                type: "Point", 
                coordinates: [longitude, latitude] 
            },
            user: new mongoose.Types.ObjectId(userid),
            status: "pending",
            created_at: new Date()
        });

        console.log('Saving emergency request:', emergencyReq);
        await emergencyReq.save();
        console.log('Emergency request saved successfully');

        // Fetch the user to get guardian emails and send notifications
        const user = await User.findById(userid);
        if (user && user.guardian_emails && user.guardian_emails.length > 0) {
            try {
                await sendEmergencyNotification(user, emergencyReq);
                console.log('Emergency notifications sent to guardians');
            } catch (emailError) {
                console.error('Failed to send guardian notifications:', emailError);
                // Continue with the response even if email sending fails
            }
        } else {
            console.log('No guardian emails found for this user');
        }

        return res.status(200).json({
            success: true,
            message: "Emergency request created successfully",
            data: emergencyReq,
        });
    } catch (error) {
        console.error("Error saving emergency request:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};


exports.showreqtohos = async (req, res) => {
  try {
      const token = req.cookies.jwt_signup || req.cookies.jwt_login;
      if (!token) {
          return res.status(401).json({ message: "Unauthorized" });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userId = decoded.id;

      const serviceProvider = await ServiceProvider.findById(userId);
      if (!serviceProvider) {
          return res.status(404).json({ message: "Service provider not found" });
      }

      console.log('Service Provider Location:', serviceProvider.latlon);

      // If not Hospital, return empty array
      if (serviceProvider.type !== "Hospital") {
          return res.status(200).json({
              success: true,
              message: "No requests for this provider type",
              data: []
          });
      }

      if (!serviceProvider.latlon || !Array.isArray(serviceProvider.latlon.coordinates)) {
          return res.status(400).json({ message: "Invalid location data for service provider" });
      }

      const [longitude, latitude] = serviceProvider.latlon.coordinates;
      console.log('Provider coordinates:', { longitude, latitude });

      const requests = await Emergency.find({
          status: 'pending',
          latlon: {
              $near: {
                  $geometry: {
                      type: 'Point',
                      coordinates: [longitude, latitude]
                  },
                  $maxDistance: 10000000 // 10 km
              }
          }
      }).populate('user', 'name mobile');

      console.log('Filtered Requests:', requests);

      return res.status(200).json({
          success: true,
          message: requests.length ? "Requests retrieved successfully" : "No requests found",
          data: requests
      });

  } catch (error) {
      console.error("Error fetching emergency requests:", error);
      return res.status(500).json({ message: "Internal server error" });
  }
};


        exports.acceptEmergency = async (req, res) => {
            try {
              const token = req.cookies.jwt_signup || req.cookies.jwt_login;
              if (!token) {
                  return res.status(401).json({
                      success: false,
                      message: "Unauthorized",
                  });
              }
          
              const decoded = jwt.verify(token, process.env.JWT_SECRET);
              const serviceProviderId = decoded.id;
          
              const { requestId } = req.body;
              if (!requestId) {
                return res.status(400).json({
                  success: false,
                  message: "Missing required fields",
                });
              }
          
              const emergencyRequest = await Emergency.findById(requestId);
              
              if (!emergencyRequest) {
                return res.status(404).json({
                  success: false,
                  message: "Request not found",
                });
              }
          
              if (emergencyRequest.status !== "pending") {
                return res.status(400).json({
                  success: false,
                  message: "Request is not in a state to be accepted",
                });
              }
          
              emergencyRequest.status = "accepted";
              emergencyRequest.service_provider = serviceProviderId;
              await emergencyRequest.save();
          
              return res.status(200).json({
                success: true,
                message: "Request accepted successfully",
                data: emergencyRequest,
              });
            } catch (error) {
              console.error(error);
              return res.status(500).json({
                success: false,
                message: "Internal server error",
              });
            }
          };
          exports.getAcceptedEmergency = async (req, res) => {
            try {
              const token = req.cookies.jwt_signup || req.cookies.jwt_login;
              if (!token) {
                  return res.status(401).json({
                      success: false,
                      message: "Unauthorized",
                  });
              }
          
              const decoded = jwt.verify(token, process.env.JWT_SECRET);
              const serviceProviderId = decoded.id;
          
              const acceptedRequests = await Emergency.find({
                status: "accepted",
                service_provider: serviceProviderId,
              }).populate("user");
          
              return res.status(200).json({
                success: true,
                message: "Accepted requests retrieved successfully",
                data: acceptedRequests,
              });
            } catch (error) {
              console.error(error);
              return res.status(500).json({
                success: false,
                message: "Internal server error",
              });
            }
          };
          
          // Controller to mark a request as done
          exports.markEmergencyAsDone = async (req, res) => {
            try {
              const token = req.cookies.jwt_signup || req.cookies.jwt_login;
              if (!token) {
                  return res.status(401).json({
                      success: false,
                      message: "Unauthorized",
                  });
              }
          
              const decoded = jwt.verify(token, process.env.JWT_SECRET);
              const serviceProviderId = decoded.id;
          
              const { requestId } = req.body;
              if (!requestId) {
                return res.status(400).json({
                  success: false,
                  message: "Missing required fields",
                });
              }
          
              const emergencyRequest = await Emergency.findOne({
                _id: requestId,
                service_provider: serviceProviderId,
              });
          
              if (!emergencyRequest) {
                return res.status(404).json({
                  success: false,
                  message: "Request not found or not assigned to you",
                });
              }
          
              emergencyRequest.status = "closed";
              await emergencyRequest.save();
          
              return res.status(200).json({
                success: true,
                message: "Request marked as done successfully",
              });
            } catch (error) {
              console.error(error);
              return res.status(500).json({
                success: false,
                message: "Internal server error",
              });
            }
          };
          
          // Controller to show all done requests for a particular hospital
          exports.getDoneRequests = async (req, res) => {
            try {
              const token = req.cookies.jwt_signup || req.cookies.jwt_login;
              if (!token) {
                  return res.status(401).json({
                      success: false,
                      message: "Unauthorized",
                  });
              }
          
              const decoded = jwt.verify(token, process.env.JWT_SECRET);
              const serviceProviderId = decoded.id;
          
              const doneRequests = await Emergency.find({
                status: "closed",
                service_provider: serviceProviderId,
              }).populate("user");
          
              return res.status(200).json({
                success: true,
                message: "Done requests retrieved successfully",
                data: doneRequests,
              });
            } catch (error) {
              console.error(error);
              return res.status(500).json({
                success: false,
                message: "Internal server error",
              });
            }
          };
          
          exports.getUserEmergencyRequests = async (req, res) => {
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
          
              // Find all emergency requests for the user and populate service provider details
              const requests = await Emergency.find({ user: userId })
                .populate({
                  path: 'service_provider',
                  select: 'name type rating contact location'
                })
                .populate('user', 'name mobile location')
                .sort({ created_at: -1 });
          
              return res.status(200).json({
                success: true,
                message: "User emergency requests retrieved successfully",
                data: requests
              });
            } catch (error) {
              console.error("Error fetching user emergency requests:", error);
              return res.status(500).json({
                success: false,
                message: "Internal server error"
              });
            }
          };
          
          exports.deleteEmergencyRequest = async (req, res) => {
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
          
              const { requestId } = req.params;
              if (!requestId) {
                return res.status(400).json({
                  success: false,
                  message: "Request ID is required"
                });
              }
          
              const emergencyRequest = await Emergency.findById(requestId);
              if (!emergencyRequest) {
                return res.status(404).json({
                  success: false,
                  message: "Emergency request not found"
                });
              }
          
              // Check if the request belongs to the user
              if (emergencyRequest.user.toString() !== userId) {
                return res.status(403).json({
                  success: false,
                  message: "Not authorized to delete this request"
                });
              }
          
              if (emergencyRequest.status === "accepted") {
                // If request is accepted, mark it as deleted by user
                emergencyRequest.status = "deleted_by_user";
                await emergencyRequest.save();
              } else {
                // If request is pending, remove it completely
                await Emergency.findByIdAndDelete(requestId);
              }
          
              return res.status(200).json({
                success: true,
                message: "Emergency request deleted successfully"
              });
            } catch (error) {
              console.error("Error deleting emergency request:", error);
              return res.status(500).json({
                success: false,
                message: "Internal server error"
              });
            }
          };
          
          exports.getAllEmergencyLocations = async (req, res) => {
            try {
              const token = req.cookies.jwt_signup || req.cookies.jwt_login;
              if (!token) {
                return res.status(401).json({
                  success: false,
                  message: "Unauthorized"
                });
              }
          
              const decoded = jwt.verify(token, process.env.JWT_SECRET);
              const serviceProviderId = decoded.id;
          
              // Get service provider's location
              const serviceProvider = await ServiceProvider.findById(serviceProviderId);
              if (!serviceProvider) {
                return res.status(404).json({
                  success: false,
                  message: "Service provider not found"
                });
              }
          
              // Find all emergency requests within 10km radius
              const emergencyRequests = await Emergency.find({
                latlon: {
                  $near: {
                    $geometry: {
                      type: 'Point',
                      coordinates: serviceProvider.latlon.coordinates
                    },
                    $maxDistance: 1000000 // 1000 km radius
                  }
                }
              }).populate('user', 'name mobile location');
          
              // Separate pending and accepted requests
              const pendingRequests = emergencyRequests.filter(req => req.status === 'pending');
              const acceptedRequests = emergencyRequests.filter(req => req.status === 'accepted');
          
              return res.status(200).json({
                success: true,
                data: {
                  serviceProvider: {
                    location: serviceProvider.latlon,
                    name: serviceProvider.name
                  },
                  pendingRequests,
                  acceptedRequests
                }
              });
            } catch (error) {
              console.error("Error fetching emergency locations:", error);
              return res.status(500).json({
                success: false,
                message: "Internal server error"
              });
            }
          };
                    