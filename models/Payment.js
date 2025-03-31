const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  receipt: {
    type: String,
    required: true,
  },
  razorOrderId: {
    type: String,
    required: true,
    unique: true,
  },
  razorPaymentId: {
    type: String,
    unique: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'success', 'failed'],
    default: 'pending',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  patientId: {
    type: String,
  },
  patientName: {
    type: String,
  },
  patientEmail: {
    type: String,
  },
  serviceId: {
    type: String,
  },
  serviceName: {
    type: String,
  },
  doctorId: {
    type: String,
  },
  doctorName: {
    type: String,
  },
  date: {
    type: String,
  },
  time: {
    type: String,
  },
  googleMeet: {
    type: String,
    default: "Na",
  },
});

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
