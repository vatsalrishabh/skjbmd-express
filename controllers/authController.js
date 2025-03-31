const { sendOtpEmail } = require('../utils/mailer');
const { sendOtpEmailForgot } = require('../utils/forgotOtpmail');
const User = require('../models/User');
const Otp = require('../models/Otp');
const { generateUniqueId } = require('./uniqueIdGenerator');
const { handleErrorWrapper } = require('../middleware/errorHandler');
const bcrypt = require('bcryptjs');
const { makeJwtToken } = require('../utils/jwtToken');

const SUBJECT = "Your OTP for PulseCare.";

const generateOtp = () => Math.floor(100000 + Math.random() * 900000);

//@desc- find email and role exist or not and send otp
//@ method POST api/auth/registerUser
//@ access - PUBLIC
const registerUser = handleErrorWrapper(async (req, res) => {
    console.log(req.body)
    const { email, mobile, role } = req.body;
    if (await User.findOne({ $and: [{ email }, { role }] })) {
        return res.status(400).json({ message: 'User already registered. Please log in.' });
    }

    const otp = await Otp.findOneAndUpdate(
        { email },
        { otp: generateOtp() },
        { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await sendOtpEmail(email, otp.otp, "To verify your account, use this OTP.", SUBJECT);
    res.status(200).json({ message: 'Registration initiated. OTP sent to email.' });
});


//@desc- get all data along with otp and verify from OTP schema and register
//@ method POST api/auth/verifyOtp
//@ access - PUBLIC
const verifyOtp = handleErrorWrapper(async (req, res) => {
    console.log(req.body)
    const { email, otp, name, mobile, password, age, gender, role, address } = req.body;

    const validOtp = await Otp.findOneAndDelete({ email, otp });
    if (!validOtp) return res.status(400).json({ message: 'Invalid OTP. Try again.' });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
        userId: await generateUniqueId(),
        name,
        email,
        mobile,
        password: hashedPassword,
        age,
        gender,
        role,
        blocked: role === "doctor", 
        address: address || { street: "NA", city: "NA", state: "NA", zipCode: "NA", country: "NA" }
    });
    await newUser.save();

    res.status(200).json({ message: 'Registration successful.' });
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

      const token = makeJwtToken({ email, role: user.role });

    res.status(200).json({
        message: 'Login successful.',
        token: token,
        email,
        name: user.name,
        userId: user.userId
    });
});


//@desc- take username, sent otp, 
//@ method POST api/auth/updatePassword
//@ access - PUBLIC
const updatePassword = handleErrorWrapper(async (req, res) => {
    console.log(req.body)
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

//@desc- get a list of all doctores
//@ method GET api/auth/admin/getAllDoctors
//@ access - Admin
const getAllDoctors = handleErrorWrapper(async (req, res) => {
    const allDoctors = await User.find({role: 'doctor'})
    res.status(200).json({ message: "All docotrs fetched " , data:allDoctors });
});





module.exports = {
    registerUser,
    verifyOtp,
    loginUser,
    updatePassword,
    updatePasswordOtp,
    addDoctor,
    apprDoctor,
    getAllDoctors,
};
