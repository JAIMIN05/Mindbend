const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const emergencySchema = new mongoose.Schema({
  latlon: {
    type: {
        type: String,
        enum: ["Point"],
        required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },  
  },
  
 
  status: {
    type: String,
    enum: ["pending", "accepted", "closed","deleted_by_user"],
    default: "pending",
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  service_provider: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ServiceProvider",
  },
  created_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});
emergencySchema.index({ latlon: "2dsphere" });
emergencySchema.index({ user: 1, created_at: -1 });
module.exports = mongoose.model("Emergency", emergencySchema);
