const Request = require("../models/request.model");
const ServiceProvider = require("../models/serviceProvider.model");
const { responseFormatter } = require("../utils/responseFormatter");
const jwt = require("jsonwebtoken");
require("dotenv").config();

// Create new request
// Create new request
exports.createRequest = async (req, res) => {
  try {
    // Get token from either jwt_signup or jwt_login cookie
    const token = req.cookies.jwt_signup || req.cookies.jwt_login;
    if (!token) {
      return responseFormatter(res, 401, false, "No token, authorization denied");
    }

    // Verify token and get user id
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    
    const {
      longitude,
      latitude,
      title,
      describe_problem,
      vehical_info,
      advance
    } = req.body;

    // Validate coordinates
    const lng = Number(longitude);
    const lat = Number(latitude);
    console.log(lng);
    console.log(lat);

    if (isNaN(lng) || isNaN(lat)) {
      return responseFormatter(res, 400, false, "Invalid coordinates provided");
    }

    // Validate title
    const validTitles = [
      // "Roadside Assistance",
      "Towing",
      "Flat-Tyre",
      "Battery-Jumpstart",
      "Starting Problem",
      "Key-Unlock-Assistance",
      "Fuel-Delivery",
      "Other",
    ];
    if (!validTitles.includes(title)) {
      return responseFormatter(res, 400, false, "Invalid title provided");
    }

    // Validate vehical_info
    if (!vehical_info || !vehical_info.type || !["bike", "car"].includes(vehical_info.type)) {
      return responseFormatter(res, 400, false, "Invalid vehicle type. Must be 'bike' or 'car'");
    }

    
    
    // Updated query for nearby service providers
    const nearbyServiceProviders = await ServiceProvider.find({
      isAvailable: true,
      type: "Mechanical",
      latlon: {
        $nearSphere: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat]
          },
          $maxDistance: 10000000 // 30km in meters
        }
      }
    }).select('_id name contact location rating'); // ✅ Ensure _id is included
    
    // console.log(nearbyServiceProviders);
    console.log("nearbyServiceProviders", nearbyServiceProviders);
    
    const allserviceproviders = []; 
    if (nearbyServiceProviders.length > 0) {
      for (const serviceProvider of nearbyServiceProviders) {
        allserviceproviders.push(serviceProvider._id);
      }
    }
    // console.log(allserviceproviders);

    const request = new Request({
      latlon: {
        type: "Point",
        coordinates: [lng, lat]
      },
      title,
      describe_problem,
      vehical_info: {
        type: vehical_info.type,
        number: vehical_info.number || "",
        name: vehical_info.name || ""
      },
      status: "pending",
      user: userId,
      service_provider: allserviceproviders,
      selected_provider: null,
      advance: advance || 0
    });

    await request.save();
    // console.log(request);
    
    const populatedRequest = await Request.findById(request._id)
      .populate('service_provider');
    console.log(populatedRequest+"populatedRequest");
    
    return responseFormatter(res, 201, true, "Request created successfully", { 
      request,
      nearbyServiceProviders
    });


  } catch (err) {
    console.error("Create request error:", err);
    return responseFormatter(res, 500, false, "Server error", null, err.message);
  }
};

// Get user's requests (for users to see their own requests)
exports.getUserRequests = async (req, res) => {
  try {
    // Get token from either jwt_signup or jwt_login cookie
    const token = req.cookies.jwt_signup || req.cookies.jwt_login;
    // console.log(token);
    
    if (!token) {
      return responseFormatter(res, 401, false, "No token, authorization denied");
    }

    // Verify token and get user id
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const requests = await Request.find({ user: userId })
      .populate('service_provider')
      .sort({ createdAt: -1 });
    // console.log(requests[0].service_provider);
    
    return responseFormatter(res, 200, true, "Requests retrieved successfully", { requests });
  } catch (err) {
    console.error("Get user requests error:", err);
    return responseFormatter(res, 500, false, "Server error", null, err.message);
  }
};

// Get single request details
exports.getRequestById = async (req, res) => {
  try {
    // Get token from either jwt_signup or jwt_login cookie
    const token = req.cookies.jwt_signup || req.cookies.jwt_login;
    if (!token) {
      return responseFormatter(res, 401, false, "No token, authorization denied");
    }

    // Verify token and get user id and role
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const userRole = decoded.role;

    const request = await Request.findById(req.params.id)
      .populate('user', 'name email mobile')
      .populate('service_provider', 'name contact');

    if (!request) {
      return responseFormatter(res, 404, false, "Request not found");
    }

    // Check if the user is authorized to view this request
    if (request.user._id.toString() !== userId && userRole !== 'admin') {
      return responseFormatter(res, 403, false, "Not authorized to view this request");
    }

    return responseFormatter(res, 200, true, "Request retrieved successfully", { request });
  } catch (err) {
    console.error("Get request error:", err);
    return responseFormatter(res, 500, false, "Server error", null, err.message);
  }
};

// Update request (only certain fields can be updated by user)
exports.updateRequest = async (req, res) => {
  try {
    // Get token from either jwt_signup or jwt_login cookie
    const token = req.cookies.jwt_signup || req.cookies.jwt_login;
    if (!token) {
      return responseFormatter(res, 401, false, "No token, authorization denied");
    }

    // Verify token and get user id
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    const request = await Request.findById(req.params.id);

    if (!request) {
      return responseFormatter(res, 404, false, "Request not found");
    }

    // Check if the user owns this request
    if (request.user.toString() !== userId) {
      return responseFormatter(res, 403, false, "Not authorized to update this request");
    }

    // Only allow updates if request is still pending
    if (request.status !== 'pending') {
      return responseFormatter(res, 400, false, "Cannot update request after it has been accepted");
    }

    const allowedUpdates = {
      describe_problem: req.body.describe_problem,
      vehical_info: req.body.vehical_info,
      advance: req.body.advance
    };

    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      { $set: allowedUpdates },
      { new: true }
    ).populate('service_provider', 'name contact');

    return responseFormatter(res, 200, true, "Request updated successfully", { request: updatedRequest });
  } catch (err) {
    console.error("Update request error:", err);
    return responseFormatter(res, 500, false, "Server error", null, err.message);
  }
};

// Cancel request (user can only cancel pending requests)
exports.cancelRequest = async (req, res) => {
  try {
    // Get token from either jwt_signup or jwt_login cookie
    const token = req.cookies.jwt_signup || req.cookies.jwt_login;
    if (!token) {
      return responseFormatter(res, 401, false, "No token, authorization denied");
    }

    // Verify token and get user id
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    console.log("params", req.params.id);
    const request = await Request.findById(req.params.id);
    console.log("request", request);
    if (!request) {
      return responseFormatter(res, 404, false, "Request not found");
    }

    // Check if the user owns this request
    if (request.user.toString() !== userId) {
      return responseFormatter(res, 403, false, "Not authorized to cancel this request");
    }

    // Only allow cancellation if request is still pending
    if (request.status !== 'pending') {
      return responseFormatter(res, 400, false, "Cannot cancel request after it has been accepted");
    }

    await Request.findByIdAndDelete(req.params.id);

    return responseFormatter(res, 200, true, "Request cancelled successfully");
  } catch (err) {
    console.error("Cancel request error:", err);
    return responseFormatter(res, 500, false, "Server error", null, err.message);
  }
};
exports.userAcceptedProvider = async (req, res) => {
  try {
    const token = req.cookies.jwt_signup || req.cookies.jwt_login;
    if (!token) {
      return responseFormatter(res, 401, false, "No token, authorization denied");
    }

    // Verify token and get user id
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;
    const { serviceId, providerId } = req.body;

    // Find the request
    const request = await Request.findById(serviceId);
    
    if (!request) {
      return responseFormatter(res, 404, false, "Request not found");
    }

    // Check if the user owns this request
    if (request.user.toString() !== userId) {
      return responseFormatter(res, 403, false, "Not authorized to update this request");
    }

    // Check if the request is still pending
    if (request.status !== 'pending') {
      return responseFormatter(res, 400, false, "Cannot update request after it has been accepted");
    }

    // Check if the provider is in the list of available providers
    if (!request.service_provider.includes(providerId)) {
      return responseFormatter(res, 400, false, "Selected provider is not available for this request");
    }

    // Update the request with selected provider and change status
    const updatedRequest = await Request.findByIdAndUpdate(
      serviceId,
      {
        $set: {
          selected_provider: providerId,
          status: 'pending'
        }
      },
      { new: true }
    ).populate('selected_provider', 'name contact');
    console.log(updatedRequest);
    return responseFormatter(res, 200, true, "Provider accepted successfully", { request: updatedRequest });
  } catch (err) {
    console.error("Accept provider error:", err);
    return responseFormatter(res, 500, false, "Server error", null, err.message);
  }
};

exports.getRequestToServiceProvider = async (req, res) => {
  try {
    // Get token from either jwt_signup or jwt_login cookie
    console.log("get request to service provider");
    
    const token = req.cookies.jwt_signup || req.cookies.jwt_login;
    if (!token) {
      return responseFormatter(res, 401, false, "No token, authorization denied");
    }

    // Verify token and get service provider id
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const serviceProviderId = decoded.id;

    // Find all requests where this service provider is selected
    const requests = await Request.find({
      selected_provider: serviceProviderId  // This ensures we only get requests where this service provider is selected
    })
    .populate('user', 'name email mobile location latlon other_contact')
    .populate('selected_provider', 'name contact location rating')
    .sort({ createdAt: -1 });
    console.log(requests);

    // Format the requests to include all necessary information
    const formattedRequests = requests.map(request => ({
      id: request._id,
      title: request.title,
      describe_problem: request.describe_problem,
      vehical_info: request.vehical_info,
      status: request.status,
      advance: request.advance,
      createdAt: request.createdAt,
      user: {
        id: request.user._id,
        name: request.user.name,
        email: request.user.email,
        mobile: request.user.mobile,
        location: request.user.location,
        latlon: request.user.latlon,
        other_contact: request.user.other_contact
      },
      service_provider: {
        id: request.selected_provider._id,
        name: request.selected_provider.name,
        contact: request.selected_provider.contact,
        location: request.selected_provider.location,
        rating: request.selected_provider.rating
      },
      latlon: request.latlon
    }));
    // console.log(formattedRequests);
    // Group requests by status for better organization
    const groupedRequests = {
      pending: formattedRequests.filter(req => req.status === 'pending'),
      accepted: formattedRequests.filter(req => req.status === 'accepted'),
      closed: formattedRequests.filter(req => req.status === 'closed')
    };

    return responseFormatter(res, 200, true, "Service provider requests retrieved successfully", { 
      requests: groupedRequests,
      // totalRequests: requests.length
    });
  } catch (err) {
    console.error("Get service provider requests error:", err);
    return responseFormatter(res, 500, false, "Server error", null, err.message);
  }
};

exports.providerAcceptRequest = async (req, res) => {
  try {
    const token = req.cookies.jwt_signup || req.cookies.jwt_login;
    if (!token) {
      return responseFormatter(res, 401, false, "No token, authorization denied");
    }

    // Verify token and get service provider id
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const serviceProviderId = decoded.id;
    const { requestId } = req.body;

    // Find the request
    const request = await Request.findById(requestId);
    
    if (!request) {
      return responseFormatter(res, 404, false, "Request not found");
    }

    // Check if the request is still pending
    // if (request.status !== 'pending') {
    //   return responseFormatter(res, 400, false, "Request has already been accepted or closed");
    // }

    // Check if this service provider is in the list of available providers
    if (!request.service_provider.includes(serviceProviderId)) {
      return responseFormatter(res, 400, false, "You are not available for this request");
    }

    // Update the request with selected provider and change status
    const updatedRequest = await Request.findByIdAndUpdate(
      requestId,
      {
        $set: {
          selected_provider: serviceProviderId,
          status: 'accepted'
        }
      },
      { new: true }
    ).populate('selected_provider', 'name contact')
     .populate('user', 'name email mobile');

    return responseFormatter(res, 200, true, "Request accepted successfully", { request: updatedRequest });
  } catch (err) {
    console.error("Accept request error:", err);
    return responseFormatter(res, 500, false, "Server error", null, err.message);
  }
};

exports.checkAcceptedRequest = async (req, res) => {
  try {
    // Get token from either jwt_signup or jwt_login cookie
    const token = req.cookies.jwt_signup || req.cookies.jwt_login;
    if (!token) {
      return responseFormatter(res, 401, false, "No token, authorization denied");
    }

    // Verify token and get service provider id
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decoded);
    
    const serviceProviderId = decoded.id;
    
    // Find all requests where this service provider is selected and status is accepted
    const acceptedRequests = await Request.find({
      selected_provider: serviceProviderId,
      status: "accepted"
    })
    .populate('user', 'name email mobile location latlon other_contact')
    .populate('selected_provider', 'name contact location rating')
    .sort({ createdAt: -1 });
    
    console.log("Accepted requests:", acceptedRequests);
    
    // Format the requests to include all necessary information
    const formattedRequests = acceptedRequests.map(request => ({
      id: request._id,
      title: request.title,
      describe_problem: request.describe_problem,
      vehical_info: request.vehical_info,
      status: request.status,
      advance: request.advance,
      createdAt: request.createdAt,
      user: {
        id: request.user._id,
        name: request.user.name,
        email: request.user.email,
        mobile: request.user.mobile,
        location: request.user.location,
        latlon: request.user.latlon,
        other_contact: request.user.other_contact
      },
      service_provider: {
        id: request.selected_provider._id,
        name: request.selected_provider.name,
        contact: request.selected_provider.contact,
        location: request.selected_provider.location,
        rating: request.selected_provider.rating
      },
      latlon: request.latlon
    }));
    
    return responseFormatter(res, 200, true, "Accepted requests retrieved successfully", {
      requests: formattedRequests,
      totalAccepted: acceptedRequests.length
    });
  } catch (err) {
    console.error("Get accepted requests error:", err);
    return responseFormatter(res, 500, false, "Server error", null, err.message);
  }
};

// Complete a request (service provider marks a request as completed)
exports.completeRequest = async (req, res) => {
  try {
    // Get token from either jwt_signup or jwt_login cookie
    const token = req.cookies.jwt_signup || req.cookies.jwt_login;
    if (!token) {
      return responseFormatter(res, 401, false, "No token, authorization denied");
    }

    // Verify token and get service provider id
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const serviceProviderId = decoded.id;
    const { requestId } = req.body;

    if (!requestId) {
      return responseFormatter(res, 400, false, "Request ID is required");
    }

    // Find the request
    const request = await Request.findById(requestId);
    
    if (!request) {
      return responseFormatter(res, 404, false, "Request not found");
    }

    // Check if this service provider is the selected provider for this request
    if (request.selected_provider.toString() !== serviceProviderId) {
      return responseFormatter(res, 403, false, "Not authorized to complete this request");
    }

    // Check if the request is in accepted status
    if (request.status !== 'accepted') {
      return responseFormatter(res, 400, false, "Only accepted requests can be completed");
    }

    // Update the request status to closed
    const updatedRequest = await Request.findByIdAndUpdate(
      requestId,
      { $set: { status: 'closed' } },
      { new: true }
    ).populate('selected_provider', 'name contact')
     .populate('user', 'name email mobile');

    return responseFormatter(res, 200, true, "Request completed successfully", { request: updatedRequest });
  } catch (err) {
    console.error("Complete request error:", err);
    return responseFormatter(res, 500, false, "Server error", null, err.message);
  }
}
exports.getRequestLocationMap = async (req, res) => {
  try {
    const token = req.cookies.jwt_signup || req.cookies.jwt_login;
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized"
      });
    }

    const { requestId } = req.params;
    if (!requestId) {
      return res.status(400).json({
        success: false,
        message: "Request ID is required"
      });
    }

    // Find the request and populate user and service providers
    const request = await Request.findById(requestId)
      .populate('user', 'name mobile')
      .populate('service_provider', 'name type contact latlon');

    if (!request) {
      return res.status(404).json({
        success: false,
        message: "Request not found"
      });
    }

    // Format the data for the map view
    const mapData = {
      request: {
        location: request.latlon,
        title: request.title,
        status: request.status,
        vehicleInfo: request.vehical_info,
        user: request.user
      },
      serviceProviders: request.service_provider.map(provider => ({
        id: provider._id,
        name: provider.name,
        type: provider.type,
        contact: provider.contact,
        location: provider.latlon
      }))
    };

    return res.status(200).json({
      success: true,
      message: "Request map data retrieved successfully",
      data: mapData
    });
  } catch (error) {
    console.error("Error fetching request map data:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

