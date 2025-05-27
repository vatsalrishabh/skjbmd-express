const express = require("express")
const router = express.Router();
const {identityCard,verifyOtp, initiatePayment, verifyPayment} = require("../controllers/downloadIdCard");


router.post("/identityCard",identityCard); // api/download/identityCard
router.post("/verifyOtp",verifyOtp); // api/download/verifyOtp
router.post("/initiatePayment",initiatePayment); // api/download/initiatePayment
router.post("/verifyPayment",verifyPayment); // api/download/verifyPayment


module.exports = router;