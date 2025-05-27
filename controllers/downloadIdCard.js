const { handleErrorWrapper } = require('../middleware/errorHandler');
const User = require('../models/User');
const Otp = require('../models/Otp');
const IdCardPayment = require("../models/IdCardPayment");
const { sendOtpEmail } = require('../utils/mailer');
const {sendWhatsappMessage } = require('../controllers/whatsappController');
const Razorpay = require('razorpay'); 
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils');



// Initialize Razorpay
const razorpay = new Razorpay({
  // key_id: 'rzp_live_1MxULmQnXguann', 
  // key_secret: '8WyMGYphteSpi3rBUw6zD8fC', 
  
  key_id:process.env.RAZORPAY_KEY_ID, 
  key_secret: process.env.RAZORPAY_KEY_SECRET, 
});


const SUBJECT = "Your OTP for SKJBMD.";

const generateOtp = () => Math.floor(100000 + Math.random() * 900000);

// @Method-POST
// @access-public
// @Route- /api/download/identityCard  
//post -mobile, docType
const identityCard = handleErrorWrapper(async(req ,res)=>{
 const { mobile, docType}  = req.body;
 

  if (!mobile || !docType) {
    return res.status(400).json({ status: "error", message: "Missing fields" });
  }

  const user = await User.findOne({ contact: mobile });

  if (!user) {
    return res.status(404).json({ status: "not-found", message: "यूज़र नहीं मिला कृपया रजिस्टर करें " });
  }

  // Let's say user.paidDocs = { idcard: true, certificate: false }

  const hasPaid = await IdCardPayment.findOne({paymentStatus:"success",  contact: mobile.toString(),}) ;
 
  if (!hasPaid) {
    // Return amount required for this docType let him pay first 
    const amount = docType === "idcard" ? 20 : 30; // Customize this logic as needed
    return res.status(200).json({
      status: "requirePayment",
      amount,
    });
  }

 // Send OTP via WhatsApp
  const generatedOtp = generateOtp();
       const otp = await Otp.findOneAndUpdate(
         { contactNumber: mobile },
         {  otp: generatedOtp },
         { upsert: true, new: true, setDefaultsOnInsert: true }
       );
           const sanitizedNumber = mobile.replace(/\D/g, ''); // remove non-digits
      const mobileNumber = `91${sanitizedNumber}`;
      const whatsappMessage = `🔐 SKJBMD IDCARD download OTP\n\nYour OTP is: *${generatedOtp}*\n\nPlease do not share it with anyone.`;
      const result = await sendWhatsappMessage(mobileNumber, whatsappMessage);
      console.log(result)
  if (result.success) {
    return res.status(200).json({ status: "otp-sent", message: "OTP भेज दिया गया है" });
  } else {
    return res.status(500).json({ status: "error", message: "OTP भेजने में समस्या हुई" });
  }

});


// @Method-POST
// @access-public
// @Route- /api/download/verifyOtp  
//post -mobile,doctype, otp
const verifyOtp = handleErrorWrapper(async (req, res) => {
  const { mobile, otp } = req.body;

  if (!mobile || !otp) {
    return res.status(400).json({ message: "मोबाइल और ओटीपी दोनों आवश्यक हैं" });
  }

  const result = await Otp.findOne({ contactNumber: mobile, otp });

  if (!result) {
    return res.status(404).json({ message: "गलत OTP" });
  }
const data = await User.findOne({ contact: mobile }).select('-password');//get user detail withou password
  return res.status(200).json({ message: "सत्यापन सफल हुआ", success: true,data:data });
});




// @Method-POST
// @access-public
// @Route- /api/download/initiatePayment   
//post -mobile,doctype, otp
const initiatePayment  = handleErrorWrapper(async(req ,res)=>{
     console.log(req.body);
     
 const { mobile, docType } = req.body;
     const amount = docType === "idcard" ? 20 : 30; // Customize as needed

 
    const order = await razorpay.orders.create({
      amount: amount * 100, // paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

     // Save order details in DB
  await IdCardPayment.create({
    contact:mobile,
    razorOrderId: order.id,
    amountPaid:amount,
    paymentStatus: 'pending',
    createdAt: new Date(),
  });

    return res.status(200).json({
      orderId: order.id,
      amount,
    });
});





// @Method-POST
// @access-public
// @Route- /api/download/verifyPayment   
//post -
const verifyPayment = handleErrorWrapper(async (req, res)=>{
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature, payment_status,mobile } = req.body;

  // Validate the required fields
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !payment_status) {
    return res.status(400).json({ status: 'error', message: 'Missing required fields' });
  }

  console.log(`Order ID: ${razorpay_order_id}, Payment ID: ${razorpay_payment_id}, Signature: ${razorpay_signature}, Status: ${payment_status}`);

  const secret = process.env.RAZORPAY_KEY_SECRET;  // Ensure your secret key is securely stored as an environment variable
  const body = razorpay_order_id + '|' + razorpay_payment_id;

  const isValidSignature = validateWebhookSignature(body, razorpay_signature, secret);

  if (isValidSignature) {
    const paymentRecord = await IdCardPayment.findOne({ razorOrderId: razorpay_order_id });

    if (paymentRecord) {
     
        // Update payment status based on payment result
        if (payment_status === 'failed') {
          await IdCardPayment.updateOne(
            { razorOrderId: razorpay_order_id },
            { 
              $set: { 
                razorPaymentId: razorpay_payment_id, 
                paymentStatus: 'failed', 
                updatedAt: Date.now() 
              } 
            }
          );
        } else {
          await IdCardPayment.updateOne(
            { razorOrderId: razorpay_order_id },
            { 
              $set: { 
                razorPaymentId: razorpay_payment_id, 
                paymentStatus: 'success', 
                updatedAt: Date.now() 
              } 
            }
          );
        }
const data = await User.findOne({ contact: mobile }).select('-password');
 // Send OTP via WhatsApp
  const generatedOtp = generateOtp();
       const otp = await Otp.findOneAndUpdate(
         { contactNumber: mobile },
         {  otp: generatedOtp },
         { upsert: true, new: true, setDefaultsOnInsert: true }
       );
         const sanitizedNumber = mobile.replace(/\D/g, ''); // remove non-digits
      const mobileNumber = `91${sanitizedNumber}`;
      const whatsappMessage = `🔐 SKJBMD IDCARD download OTP\n\nYour OTP is: *${generatedOtp}*\n\nPlease do not share it with anyone.`;
      const result = await sendWhatsappMessage(mobileNumber, whatsappMessage);
      
    res.status(200).json({ success: true, message: 'Payment verification successful',data:data });
        console.log("Payment verification successful");

      
    } else {
 res.status(404).json({ success: false, message: 'Payment record not found' });
      console.log("Payment record not found");
    }
  } else {
 res.status(400).json({ success: false, message: 'Verification failed' });
    console.log("Payment verification failed");
  }
})

  
  



module.exports = {
 identityCard,
 verifyOtp,
 initiatePayment,
 verifyPayment,
};