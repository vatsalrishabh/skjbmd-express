const mongoose = require("mongoose");

const idCardPaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  contact: { type: String, required: true },
  amountPaid: { type: Number, default: 0 },
  paymentStatus: { type: String, enum: ["success", "failed", "pending"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
  razorOrderId:String,
});


const IdCardPayment = mongoose.model('IdCardPayment', idCardPaymentSchema);
module.exports = IdCardPayment;