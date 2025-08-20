const { handleErrorWrapper } = require('../middleware/errorHandler');
const User = require('../models/User');
const Otp = require('../models/Otp');
const IdCardPayment = require("../models/IdCardPayment");
const { sendOtpEmail } = require('../utils/mailer');
//const { sendWhatsappMessage } = require('../controllers/whatsappController'); //internal api
const { sendWhatsappMessage } = require("../services/externalWhatsapp"); // external api

const Razorpay = require('razorpay'); 
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils');
const { default: SmartphoneOtp } = require('../models/SmartphoneOtp');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const generateOtp = () => Math.floor(100000 + Math.random() * 900000);

const identityCard = handleErrorWrapper(async (req, res) => {
  const { mobile, docType } = req.body;

  if (!mobile || !docType) {
    return res.status(400).json({ status: "error", message: "Missing fields" });
  }

  const user = await User.findOne({ contact: mobile });

  if (!user) {
    return res.status(404).json({ status: "not-found", message: "यूज़र नहीं मिला कृपया रजिस्टर करें " });
  }

  const hasPaid = await IdCardPayment.findOne({ paymentStatus: "success", contact: mobile.toString() });

  if (!hasPaid) {
    const amount = docType === "idcard" ? 20 : 30;
    return res.status(200).json({ status: "requirePayment", amount });
  }

  const generatedOtp = generateOtp();
  await Otp.findOneAndUpdate(
    { contactNumber: mobile },
    { otp: generatedOtp },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const mobileNumber = `91${mobile.replace(/\D/g, '')}`;
  const message = `\uD83D\uDD10 SKJBMD IDCARD download OTP\n\nYour OTP is: *${generatedOtp}*\n\nPlease do not share it with anyone.`;
  //const result = await sendWhatsappMessage(mobileNumber, message); // internal api to send message we will not use it from now on
  const result = await sendWhatsappMessage(mobileNumber, message)
  if (result.success) {
    return res.status(200).json({ status: "otp-sent", message: "OTP भेज दिया गया है" });
  } else {
    return res.status(500).json({ status: "error", message: result.message });
  }
});

const verifyOtp = handleErrorWrapper(async (req, res) => {
  const { mobile, otp } = req.body;

  if (!mobile || !otp) {
    return res.status(400).json({ message: "मोबाइल और ओटीपी दोनों आवश्यक हैं" });
  }

  const result = await Otp.findOne({ contactNumber: mobile, otp });

  if (!result) {
    return res.status(404).json({ message: "गलत OTP" });
  }

  const data = await User.findOne({ contact: mobile }).select('-password');
  return res.status(200).json({ message: "सत्यापन सफल हुआ", success: true, data });
});

const initiatePayment = handleErrorWrapper(async (req, res) => {
  const { mobile, docType } = req.body;
  const amount = docType === "idcard" ? 20 : 30;

  const order = await razorpay.orders.create({
    amount: amount * 100,
    currency: "INR",
    receipt: `receipt_${Date.now()}`,
  });

  await IdCardPayment.create({
    contact: mobile,
    razorOrderId: order.id,
    amountPaid: amount,
    paymentStatus: 'pending',
    createdAt: new Date(),
  });

  return res.status(200).json({ orderId: order.id, amount });
});

const verifyPayment = handleErrorWrapper(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, payment_status, mobile } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !payment_status) {
    return res.status(400).json({ status: 'error', message: 'Missing required fields' });
  }

  const body = razorpay_order_id + '|' + razorpay_payment_id;
  const isValidSignature = validateWebhookSignature(body, razorpay_signature, process.env.RAZORPAY_KEY_SECRET);

  if (!isValidSignature) {
    return res.status(400).json({ success: false, message: 'Verification failed' });
  }

  const paymentRecord = await IdCardPayment.findOne({ razorOrderId: razorpay_order_id });
  if (!paymentRecord) {
    return res.status(404).json({ success: false, message: 'Payment record not found' });
  }

  await IdCardPayment.updateOne(
    { razorOrderId: razorpay_order_id },
    {
      $set: {
        razorPaymentId: razorpay_payment_id,
        paymentStatus: payment_status === 'failed' ? 'failed' : 'success',
        updatedAt: Date.now()
      }
    }
  );

  const data = await User.findOne({ contact: mobile }).select('-password');
  const generatedOtp = generateOtp();
  await Otp.findOneAndUpdate(
    { contactNumber: mobile },
    { otp: generatedOtp },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  const mobileNumber = `91${mobile.replace(/\D/g, '')}`;
  const message = `\uD83D\uDD10 SKJBMD IDCARD download OTP\n\nYour OTP is: *${generatedOtp}*\n\nPlease do not share it with anyone.`;
  const result = await sendWhatsappMessage(mobileNumber, message);

  if (result.success) {
    return res.status(200).json({ success: true, message: 'Payment verification successful', data });
  } else {
    return res.status(500).json({ success: false, message: result.message });
  }
});

const smartPhoneChat = handleErrorWrapper(async (req, res) => {
  const { name, phone } = req.body;
  const ip = req.ip;
  const otp = generateOtp().toString();

  const user = await SmartphoneOtp.findOne({ phone });
  const mobileNumber = `91${phone.replace(/\D/g, '')}`;
  const message = `\uD83D\uDD10 SKJBMD Chat registration OTP\n\nYour OTP is: *${otp}*\n\nPlease do not share it with anyone.`;

  if (!user) {
    await SmartphoneOtp.create({ name, phone, otp, ip });
    const result = await sendWhatsappMessage(mobileNumber, message);
    return res.status(200).json({ message: 'New user created. OTP sent successfully.' });
  } else {
    user.otp = otp;
    user.ip = ip;
    user.createdAt = new Date();
    await user.save();
    const result = await sendWhatsappMessage(mobileNumber, message);
    return res.status(200).json({ message: 'User already exists. OTP re-sent.', user });
  }
});

const verifyOtpSmartphoneChat = handleErrorWrapper(async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ message: 'Phone and OTP are required.' });
  }

  const user = await SmartphoneOtp.findOne({ phone: phone.replace(/\D/g, '') });

  if (!user) {
    return res.status(404).json({ message: 'Phone number is not registered.' });
  }

  if (user.otp !== otp) {
    return res.status(401).json({ message: 'Incorrect OTP.' });
  }

  return res.status(200).json({ isLoggedIn: true, name: user.name, phone: user.phone });
});

module.exports = {
  identityCard,
  verifyOtp,
  initiatePayment,
  verifyPayment,
  smartPhoneChat,
  verifyOtpSmartphoneChat,
};