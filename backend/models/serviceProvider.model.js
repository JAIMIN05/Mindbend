const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const serviceProviderSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["Hospital", "Mechanical"],
    required: true,
  },
  name: { type: String, unique: true, required: true },
  password: {type: String, unique: true, required: true},
  contact: {
    mobile: String,
    email: String,
  },
  location: {
    state: String,
    district: String,
    city: String,
  },
  latlon: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      default: [0, 0]
    }
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  rating: { type: Number, default: 0, min: 0, max: 5 },
  service_count: { type: Number, default: 0 },
});

// Create the 2dsphere index
serviceProviderSchema.index({ latlon: "2dsphere" });

module.exports = mongoose.model("ServiceProvider", serviceProviderSchema);