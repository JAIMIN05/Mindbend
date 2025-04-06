const ServiceProvider = require('../models/serviceProvider.model');
const { responseFormatter } = require("../utils/responseFormatter");
const bcrypt = require("bcryptjs");
require("dotenv").config();

// Add a new service provider

exports.addServiceProvider = async (req, res) => {
    try {
        const {
            type,
            name,
            password, // Add password to destructuring
            contact: {
                mobile,
                email
            },
            location: {
                state,
                district,
                city
            },
            latlon: {
                latitude,
                longitude
            }
        } = req.body;

        // Check if service provider already exists
        const existingProvider = await ServiceProvider.findOne({ name });
        if (existingProvider) {
            return responseFormatter(res, 400, false, "Service provider with this name already exists");
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new service provider
        const newServiceProvider = new ServiceProvider({
            type,
            name,
            password: hashedPassword, // Store hashed password
            contact: {
                mobile,
                email
            },
            location: {
                state,
                district,
                city
            },
            latlon: {
                // latitude,
                // longitude
                coordinates: [longitude, latitude]
            },
            rating: 0,        // Default value
            service_count: 0   // Default value
        });

        // Save to database
        const savedServiceProvider = await newServiceProvider.save();

        // Remove sensitive information before sending response
        const providerData = {
            id: savedServiceProvider._id,
            type: savedServiceProvider.type,
            name: savedServiceProvider.name,
            contact: savedServiceProvider.contact,
            location: savedServiceProvider.location,
            latlon: savedServiceProvider.latlon,
            rating: savedServiceProvider.rating,
            service_count: savedServiceProvider.service_count
            // Note: password is intentionally excluded from response
        };

        return responseFormatter(
            res, 
            201, 
            true, 
            "Service provider added successfully",
            { serviceProvider: providerData }
        );

    } catch (error) {
        console.error("Add service provider error:", error);
        return responseFormatter(
            res,
            500,
            false,
            "Server error",
            null,
            error.message
        );
    }
};

// Get all service providers
exports.getAllServiceProviders = async (req, res) => {
    try {
        const serviceProviders = await ServiceProvider.find()
            .select('-password -documents'); // Exclude sensitive information

        return responseFormatter(
            res,
            200,
            true,
            "Service providers retrieved successfully",
            { serviceProviders }
        );

    } catch (error) {
        console.error("Get service providers error:", error);
        return responseFormatter(
            res,
            500,
            false,
            "Server error",
            null,
            error.message
        );
    }
};

// Update service provider status
exports.updateServiceProviderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { isAvailable, status } = req.body;

        const updatedProvider = await ServiceProvider.findByIdAndUpdate(
            id,
            { 
                $set: { 
                    isAvailable: isAvailable,
                    status: status 
                } 
            },
            { new: true }
        ).select('-password -documents');

        if (!updatedProvider) {
            return responseFormatter(res, 404, false, "Service provider not found");
        }

        return responseFormatter(
            res,
            200,
            true,
            "Service provider updated successfully",
            { serviceProvider: updatedProvider }
        );

    } catch (error) {
        console.error("Update service provider error:", error);
        return responseFormatter(
            res,
            500,
            false,
            "Server error",
            null,
            error.message
        );
    }
};

// Delete service provider
exports.deleteServiceProvider = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedProvider = await ServiceProvider.findByIdAndDelete(id);
        
        if (!deletedProvider) {
            return responseFormatter(res, 404, false, "Service provider not found");
        }

        return responseFormatter(
            res,
            200,
            true,
            "Service provider deleted successfully"
        );

    } catch (error) {
        console.error("Delete service provider error:", error);
        return responseFormatter(
            res,
            500,
            false,
            "Server error",
            null,
            error.message
        );
    }
};