const express = require('express');
const router = express.Router();
const { authenticateJWT, authorizeRoles } = require("../middleware/rbacMiddleware");

const { allBookings } = require('../controllers/bookingController');


// get all bookings
router.get('/allBookings', allBookings); // api/bookings/allBookings




module.exports = router;
