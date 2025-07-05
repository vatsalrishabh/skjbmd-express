const mongoose = require('mongoose');

const smartphoneOtpSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    match: /^[0-9]{10}$/,
  },
  otp: {
    type: String,
    required: true,
    match: /^[0-9]{6}$/,
  },
  ip: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const SmartphoneOtp = mongoose.model('SmartphoneOtp', smartphoneOtpSchema);
module.exports = SmartphoneOtp;
