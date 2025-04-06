const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const requestSchema = new mongoose.Schema({
  latlon: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  title: {
    type: String,
    enum: [
      "Roadside Assistance",
      "Towing",
      "Flat-Tyre",
      "Battery-Jumpstart",
      "Starting Problem",
      "Key-Unlock-Assistance",
      "Fuel-Delivery",
      "Other",
    ],
    required: true,
  },
  describe_problem: String,
  vehical_info: {
    type: { type: String, enum: ["bike", "car"], required: true },
    number: String,
    name: String,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "closed"],
    default: "pending",
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  service_provider: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceProvider",
  }],
  selected_provider:{type:mongoose.Schema.Types.ObjectId,ref:"ServiceProvider"},
  advance: Number,
});

// Add this after your schema definition
requestSchema.index({ latlon: "2dsphere" });
module.exports = mongoose.model("Request", requestSchema);
