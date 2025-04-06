const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: function () {
      return !this.googleId; // Password required only if not using Google auth
    },
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  mobile: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (v) {
        return /^\d{10}$/.test(v);
      },
      message: "Mobile number must be 10 digits",
    },
  },
  location: {
    state: {
      type: String,
      required: true,
      trim: true,
    },
    district: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
  },
  latlon: {
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
  },
  guardian_emails: [String],
  other_contact: [String],
  googleId: {
    type: String,
    sparse: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  type: {
    type: String,
    required: true,
    default: "user",
  },
});

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
      next();
    } catch (err) {
      next(err);
    }
  } else {
    next();
  }
});

// Method to check password
// UserSchema.methods.comparePassword = async function (candidatePassword) {
//   return await bcrypt.compare(candidatePassword, this.password);
// };

module.exports = mongoose.model("User", UserSchema);