const express = require('express')
const router = express.Router();
const {paymentrzp } = require("../controllers/donationController");


// @Method - POST
// @access - donor
// @Route - /api/donations/paymentrzp 
router.post('/paymentrzp',paymentrzp);




module.exports=router;