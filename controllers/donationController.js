const Razorpay = require('razorpay');
const { validateWebhookSignature } = require('razorpay/dist/utils/razorpay-utils');
const Donation = require('../models/Donation');
const { handleErrorWrapper } = require('../middleware/errorHandler');
const User = require('../models/User');

// Initialize Razorpay

console.log(process.env.RAZORPAY_KEY_ID);
console.log(process.env.RAZORPAY_KEY_SECRET);
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // Use environment variables
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Function to create an order
const createOrder = handleErrorWrapper(async (req, res) => {
    console.log("hit the api create order")
  const { amount, currency, receipt, notes } = req.body;

  // Check if receipt already exists
  const existingDonation = await Donation.findOne({ receipt });
  if (existingDonation) {
    return res.status(400).json({ error: 'Receipt ID already exists.' });
  }
  console.log("")
  const options = {
    amount: 200 * 100, // Convert amount to paise
    currency:'INR',
    receipt:{},
    notes:{},
  };

  const order = await razorpay.orders.create(options);

  // Save order details in database
  await Donation.create({
    donationAmount: amount,
    donorName: notes.donorName || 'Anonymous',
    donorEmail: notes.donorEmail || '',
    paymentStatus: 'pending',
    razorpayId: order.id,
    receipt,
  });

  res.json(order);
});

// @Method-POST
// @access-donor
// @Route-api/donations/verifyPayment
const verifyPayment = handleErrorWrapper(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, payment_status } = req.body;
  console.log(`Payment Status: ${payment_status}`);

  // Validate Razorpay signature
  const isValidSignature = validateWebhookSignature(
    `${razorpay_order_id}|${razorpay_payment_id}`,
    razorpay_signature,
    process.env.RAZORPAY_KEY_SECRET
  );

  if (!isValidSignature) {
    return res.status(400).json({ status: 'verification_failed', message: 'Invalid signature' });
  }

  // Find the donation record associated with the order
  const donationRecord = await Donation.findOne({ razorpayId: razorpay_order_id });

  if (!donationRecord) {
    return res.status(404).json({ error: 'Donation record not found' });
  }

  // Determine payment status (use Razorpay's response)
  const status = payment_status === 'failed' ? 'failed' : 'completed';

  // Update the donation collection with payment status & transaction ID
  const updatedDonation = await Donation.findOneAndUpdate(
    { razorpayId: razorpay_order_id }, // Find donation by Razorpay Order ID
    {
      paymentStatus: status,
      transactionId: razorpay_payment_id, // Store Razorpay payment ID as transaction ID
      paymentDate: new Date(),
    },
    { new: true } // Return the updated document
  );

  console.log(`Donation updated successfully:`, updatedDonation);

  // Send response back to frontend
  res.status(200).json({
    status: 'ok',
    message: 'Payment verification successful',
    updatedDonation,
  });
});


// @Method-POST
// @access-donor
// @Route-api/donations/paymentSuccess
const paymentSuccess = (req, res) => {
    console.log("git the api sycess payment")
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <title>Payment Success</title>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; margin: 50px; }
        .success-message { color: green; font-size: 24px; margin-top: 20px; }
        .thank-you { font-size: 20px; }
      </style>
    </head>
    <body>
      <h1>Payment Successful!</h1>
      <p class="success-message">Thank you for your donation.</p>
      <p class="thank-you">Your transaction was completed successfully.</p>
    </body>
    </html>
  `);
};

// @Method-GET
// @access-Admin,donor
// @Route-api/donations/donorDetails
const donorDetails = async (req, res) => {
  try {
    const { userId } = req.query; // Extract from query parameters
    if (!userId) {
      const everyTran = await Donation.find({});
      return res.status(200).json({ message: "Data of all the users", everyTran });
    }

// FIND ALL TRANSACTIONS 
const allTransactions = await Donation.find({ userId });
const monthNames = [
  "", "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const transactions = await Donation.aggregate([
  {
    $match: { userId: userId } // match all the documents of this userId similar to find({userId})
  },
  {
    $project: {
      _id: 0,
      amount: "$donationAmount",
      monthIndex: { $toInt: { $dateToString: { format: "%m", date: "$donationDate" } } },
      day: { $dateToString: { format: "%d", date: "$donationDate" } },
      year: { $dateToString: { format: "%Y", date: "$donationDate" } },
      status: {
        $cond: {
          if: { $eq: ["$paymentStatus", "pending"] },
          then: "Pending",
          else: "Completed"
        }
      },
      transactionId: { $concat: ["#", "$transactionId"] }
    }
  }
]);

// **Map month index to full month name in JavaScript**
transactions.forEach(t => {
  t.date = `${t.day} ${monthNames[t.monthIndex]}, ${t.year}`;
  delete t.day;
  delete t.monthIndex;
  delete t.year;
});

console.log(transactions);





// FIND ALL TRANSACTIONS ENDS

    let donor = await User.findOne({ userId });
    donor = donor.toObject(); // Convert Mongoose document to a plain object
    delete donor.password;

    if (!donor) {
      return res.status(404).json({ message: "Donor not found or unauthorized." });
    }

    res.status(200).json({
      message: "Donor details fetched successfully",
      donor,
      transactions,allTransactions
    });
  } catch (error) {
    console.error("Error fetching donor details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// @Method-POST
// @access-donor
// @Route-api/donations/donateNow
const donateNow = async (req, res) => {
  try {
    const { userId, amount, name ,dob ,email, mobile, address, pancard,pincode, city,state, country} = req.body; // Extract from query parameters
    
    // Build the update object dynamically
    const updateFields = {};
    if (pancard) updateFields.pancard = pancard;
    if (mobile) updateFields.mobile = mobile;
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (dob) updateFields.dob = dob;
    
    // Update nested address fields only if provided
    if (address || pincode || city || state || country) {
      updateFields.address = {};
      if (address) updateFields.address.street = address;
      if (pincode) updateFields.address.zipCode = pincode;
      if (city) updateFields.address.city = city;
      if (state) updateFields.address.state = state;
      if (country) updateFields.address.country = country;
    }
    
    // const userDetail = await User.findOneAndUpdate(
    //   { userId }, // Find user by userId
    //   { $set: updateFields }, // Only update provided fields
    //   { new: true, upsert: true } // Return updated document & create if not found
    // );

    const options = {
      amount: amount * 100, // Convert amount to paise
      currency:"INR",
      receipt:"REC0012",
      notes:{
        userId,
      },
    }; //. razorpay 111111111111111111111111111111111111111111
    const order = await razorpay.orders.create(options);
    console.log(order+"content of order");
   // Get the count of donations to generate transaction ID
   const donationCount = await Donation.countDocuments();
   const transactionId = `TRN${donationCount + 1}`;

   // Save the donation details
   const donation = new Donation({
     donorName: name || "Anonymous",
     donorEmail: email || "NA",
     donationAmount: amount,
     donationDate: Date.now(),
     donationMessage: "Donation for trust",
     paymentStatus: "pending",
     anonymous: userId ? false : true,
     razorpayId: order?.id,
     userId: userId,
     transactionId: transactionId,
     pancard:pancard,
   });

   await donation.save();
   console.log(order); 
    res.json(order);  //{id:'order_sDfsdfsf' status:'created' it has offer_id:'' which can be learnt about } mainly two things are sent 

    
  } catch (error) {
    console.error("Error fetching donor details:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};



// @Method - GET
// @access - donor
// @Route - /api/donations/donationReceipt or /donationReceipt/:transactionId

const donationReceipt = async (req, res) => {
  try {
    const { transactionId } = req.params;
    const { email } = req.query; // Assuming you pass email in the frontend query
// console.log(email)
// console.log(transactionId)

    if (transactionId) {
      const receipt = await Donation.findOne({ razorpayId: transactionId });
      if (!receipt) return res.status(404).json({ message: "Receipt not found." });
     

   
   
      // await sendReceiptToCx(["dkleanhealthcare@gmail.com",receipt.donorEmail], receipt);
      return res.status(200).json(receipt);
    }

  
    
    const userReceipts = await Donation.find({ donorEmail: email }).sort({ donationDate: -1 });
   
 

    return res.status(200).json(userReceipts);
  } catch (error) {
    console.error("Error fetching donation receipt(s):", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};


// @Method - POST
// @access - donor
// @Route - /api/donations/paymentrzp 

const paymentrzp = async (req, res) => {
  console.log(req.body);
};



// Export functions
module.exports = {
  createOrder,
  verifyPayment,
  paymentSuccess,
  donorDetails,
  donateNow,
  donationReceipt,
  paymentrzp,
};
