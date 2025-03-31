const express = require('express');
const router = express.Router();
const {   registerUser,
    verifyOtp,
    loginUser,
    updatePassword,
    updatePasswordOtp,
    addDoctor, 
    apprDoctor,
    getAllDoctors} = require('../controllers/authController');
const {authenticateJWT, authorizeRoles} = require('../middleware/rbacMiddleware')

// Register user
router.post('/registerUser', registerUser); // api/auth/registerUser

// Register user
router.post('/verifyOtp', verifyOtp); // api/auth/verifyOtp

router.post('/loginUser', loginUser); // api/auth/loginUser

router.post('/updatePassword', updatePassword); // api/auth/updatePassword

router.post('/updatePasswordOtp', updatePasswordOtp); // api/auth/updatePasswordOtp

router.post('/admin/addDoctor',authenticateJWT,authorizeRoles('admin'),addDoctor); // api/auth/admin/addDoctor

router.post('/admin/apprDoctor',authenticateJWT,authorizeRoles('admin'),apprDoctor); // api/auth/admin/apprDoctor

router.get('/admin/getAllDoctors',authenticateJWT,authorizeRoles('admin'),getAllDoctors); // api/auth/admin/getAllDoctors



module.exports = router;
