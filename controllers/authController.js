const formidable = require('formidable');
const { sendOtpEmail } = require('../utils/mailer');
const { sendOtpEmailForgot } = require('../utils/forgotOtpmail');
const {sendWhatsappMessage } = require('../services/externalWhatsapp');
const User = require('../models/User');
const Otp = require('../models/Otp');
const IdCardPayment  = require('../models/IdCardPayment')
const { generateUniqueId } = require('./uniqueIdGenerator');
const { handleErrorWrapper } = require('../middleware/errorHandler');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { makeJwtToken } = require('../utils/jwtToken');




const SUBJECT = "Your OTP for SKJBMD.";

const generateOtp = () => Math.floor(100000 + Math.random() * 900000);

//@desc- find email and role exist or not and send otp
//@ method POST api/auth/registerUser
//@ access - PUBLIC
const registerUser = handleErrorWrapper(async (req, res) => {
    const form = new formidable.IncomingForm({ keepExtensions: true });
  
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('❌ Form parsing error:', err);
        return res.status(500).json({ error: 'Form parsing failed' });
      }
  
     
      // console.log('📸 Files:', files);
  
      const email = fields.email[0];
      const contactNumber = fields.contactNumber[0];
  
      const sanitizedNumber = contactNumber.replace(/\D/g, ''); // remove non-digits
      const mobileNumber = `91${sanitizedNumber}`;
  
      // Check if the user already exists
      if (await User.findOne({ $and: [{ email: email }, { role: "member" }] })) {
        return res.status(400).json({ message: 'User already registered. Please log in.' });
      }
  
      // Generate OTP
      const generatedOtp = generateOtp();
      const otp = await Otp.findOneAndUpdate(
        { contactNumber: contactNumber },
        { email: email, otp: generatedOtp },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
  
      // Send OTP email
      await sendOtpEmail(email, generatedOtp, "To verify your account, use this OTP.", SUBJECT);
  
      // Send OTP via WhatsApp
      const whatsappMessage = `🔐 SKJBMD Registration OTP\n\nYour OTP is: *${generatedOtp}*\n\nPlease do not share it with anyone.`;
      const result = await sendWhatsappMessage(mobileNumber, whatsappMessage);
  
      // Respond with success
      res.status(200).json({ message: 'Registration initiated. OTP sent to email and WhatsApp.' });
    });
  });
  
  



//@desc - Verify OTP and register user
//@route - POST api/auth/verifyOtp
//@access - PUBLIC
const verifyOtp = handleErrorWrapper(async (req, res) => {
  const form = new formidable.IncomingForm({ keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error("❌ Form parsing error:", err);
      return res.status(400).json({ error: "Invalid form data" });
    }

    const {
      email,
      otp,
      fullName,
      password,
      contactNumber,
      age,
      gender,
      fatherOrHusband,
      aadhaarNumber,
      pancard,
      state,
      district,
      streetAddress,
      pincode,
    } = Object.fromEntries(
      Object.entries(fields).map(([key, val]) => [key, val[0]])
    );

    try {
      // 1️⃣ Verify OTP before proceeding
      const validOtp = await Otp.findOneAndDelete({ email, otp });
      if (!validOtp) {
        return res.status(400).json({ message: "Invalid or expired OTP" });
      }

      // 2️⃣ Check if user already exists
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(409).json({ message: "Email already registered" }); // 409 Conflict
      }

      // 3️⃣ Handle profile photo upload (optional)
      let savedFilePath = null;
      const profileFile = files.profilePhoto?.[0];
      if (profileFile) {
        const tempPath = profileFile.filepath;
        const ext = path.extname(profileFile.originalFilename).toLowerCase();
        const uniqueName = `${contactNumber || Date.now()}${ext}`;
        const uploadPath = path.join(__dirname, "../uploads");

        if (!fs.existsSync(uploadPath)) {
          fs.mkdirSync(uploadPath, { recursive: true });
        }

        const finalPath = path.join(uploadPath, uniqueName);
        fs.copyFileSync(tempPath, finalPath);
        savedFilePath = `/uploads/${uniqueName}`;
      }

      // 4️⃣ Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // 5️⃣ Build address object
      const address = {
        street: streetAddress || "",
        city: district || "",
        state: state || "",
        zipCode: pincode || "",
        country: "India",
      };

      // 6️⃣ Create and save user
      const newUser = new User({
        userId: await generateUniqueId(),
        name: fullName,
        fatherName: fatherOrHusband,
        age: Number(age),
        contact: contactNumber,
        email,
        password: hashedPassword,
        gender,
        role: "member",
        address,
        aadharCard: aadhaarNumber,
        pancard: pancard || "",
        blocked: false,
        dpUrl: savedFilePath || null,
      });

      await newUser.save();

      return res.status(201).json({ message: "Registration successful" });
    } catch (error) {
      console.error("❌ Registration error:", error);

      if (error.code === 11000) {
        // Mongo duplicate key error
        return res.status(409).json({ message: "User already exists" });
      }

      return res.status(500).json({ message: "Internal Server Error" });
    }
  });
});

  
  

//@desc- get username password and role and sent jwt and userdata
//@ method POST api/auth/loginUser
//@ access - PUBLIC
const loginUser = handleErrorWrapper(async (req, res) => {
    console.log(req.body)
    const { email, password, role  } = req.body;
   
    const user = await User.findOne({ email,role });
    if(!user){
        return res.status(404).json({message:'User not found! Please register.'})
    }
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(400).json({ message: 'Invalid email or password.' });
    }
    
     // Convert to plain object and delete password
  const userObj = user.toObject();
  delete userObj.password;

  // Create token using safe object
  const token = makeJwtToken({ user: userObj });

  res.status(200).json({
    message: 'Login successful.',
    token,
    email: user.email,
    name: user.name,
    userId: user.userId,
  });
});


//@desc- take username, sent otp, 
//@ method POST api/auth/updatePassword
//@ access - PUBLIC
const updatePassword = handleErrorWrapper(async (req, res) => {
    console.log(req.body)

    const {  email,role } = req.body;
    const user = await User.findOne({ email , role});

    if (!user) return res.status(400).json({ message: 'User not found. Register first.' });

    const otp = await Otp.findOneAndUpdate(
        { email },
        { otp: generateOtp() },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await sendOtpEmailForgot(email, otp.otp, "Use this OTP to reset your password.", SUBJECT);
    res.status(200).json({ message: 'OTP sent to reset password.' });
});


//@desc- get details with otp verify and update
//@ method POST api/auth/updatePasswordOtp
//@ access - PUBLIC
const updatePasswordOtp = handleErrorWrapper(async (req, res) => {
    console.log(req.body)
    const { email, password, otp,role } = req.body;

    const validOtp = await Otp.findOneAndDelete({ email, otp });
    if (!validOtp) return res.status(400).json({ message: 'Invalid OTP. Try again.' });

    const user = await User.findOne({ email ,role});
    if (!user) return res.status(400).json({ message: 'User not found.' });

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.status(200).json({ message: 'Password updated successfully.' });
});


//@desc- add a doctor without otp
//@ method POST api/auth/admin/addDoctor
//@ access - Admin
const addDoctor = handleErrorWrapper(async (req, res) => {
    const { doctorEmail, doctorPassword, license, doctorName, doctorSex, doctorMobile, role, address } = req.body;
    const existingDoctor = await User.findOne({ 
        $or: [{ email: doctorEmail }, { license: license }] 
    });
//swagger - validation api . 

    if (existingDoctor) {
        return res.status(400).json({ message: "Doctor with the same email or license already exists." });
    }

    const hashedPassword = await bcrypt.hash(doctorPassword, 10);

    const newUser = new User({
        userId: await generateUniqueId(),
        name: doctorName,
        email: doctorEmail,
        mobile: doctorMobile,
        password: hashedPassword,
        license,
        age: null, // Fix: Set age to null instead of "NA"
        gender: doctorSex.toLowerCase(), // Fix: Convert to lowercase
        role: role === 'physio' ? 'doctor' : role, // Fix: Map 'physio' to 'doctor'
        address: address || { street: "NA", city: "NA", state: "NA", zipCode: "NA", country: "NA" }
    });

    await newUser.save();
    res.status(200).json({ message: 'Doctor added successfully.' });
});


//@desc- change blocked to true or false 
//@ method POST api/auth/admin/apprDoctor
//@ access - Admin
const apprDoctor = handleErrorWrapper(async (req, res) => {
    const { userId, role, blocked } = req.body;

    // Check if the user exists and is a doctor
    const doctor = await User.findOne({ userId, role: 'doctor' });

    if (!doctor) {
        return res.status(404).json({ message: "Doctor not found." });
    }

    // Update the blocked status
    doctor.blocked = blocked;
    await doctor.save();
    const allDoctors = await User.find({role: 'doctor'})
    res.status(200).json({ message: `Doctor ${blocked ? 'blocked' : 'approved'} successfully.`, data:allDoctors });
});

//@desc- get a list of all users
//@ method GET api/auth/admin/getAllDoctors
//@ access - Admin
const getAllDoctors = handleErrorWrapper(async (req, res) => {
   const allDoctors = await User.find({}).select("-password");
    res.status(200).json({ message: "All docotrs fetched " , data:allDoctors });
});

// @desc    Update user role
// @route   PUT /api/auth/admin/updateRole/:id
// @access  Admin
const updateUserRole = async (req, res) => {
  try {
    console.log(req.params.userId)
     console.log(req.body.role)
    const updatedUser = await User.findOneAndUpdate(
      { userId: req.params.userId },
      { role: req.body.role },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};



// @desc    Update user role
// @route   PUT /api/auth/admin/getAllIdCardPayment/:id
// @access  Admin
const getAllIdCardPayment = async (req, res) => {
  try {
    const { userId, contact } = req.query;

    let filter = {};

    if (userId) {
      filter.userId = userId; // {userId:11111111}
    } else if (contact) {
      filter.contact = contact; // {userId:8123573669}
    }

     // Find the user first
    const user = await User.findOne(filter);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Use user's _id to fetch payments
    const payments = await IdCardPayment.find(filter);

    if (!payments || payments.length === 0) {
      return res.status(404).json({ message: "No matching records found" });
    }

    // Attach user's name to each payment
    const enrichedPayments = payments.map(payment => ({
      ...payment.toObject(),
      userName: user.name
    }));

    res.status(200).json({ data: enrichedPayments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};




module.exports = {
    registerUser,
    verifyOtp,
    loginUser,
    updatePassword,
    updatePasswordOtp,
    addDoctor,
    apprDoctor,
    getAllDoctors,
    updateUserRole,
    getAllIdCardPayment,
};
