const DateBookings = require('../models/DateBookings');
const User = require('../models/User')
const { handleErrorWrapper } = require('../middleware/errorHandler');

// @desc - Get list of all 60 days bookings
// @method - GET /api/bookings/allBookings
// @access - user, admin, doctor, subadmin
const allBookings = handleErrorWrapper(async (req, res) => {
  try {
    // Fetch all DateBookings and all users with the role of 'doctor'
    const allBooking = await DateBookings.find();
    const doctors = await User.find({ role: 'doctor' });

    // Map doctorId to an object containing doctor's name and blocked status
    const doctorMap = doctors.reduce((acc, doctor) => {
      acc[doctor.userId] = {
        doctorName: doctor.name,
        blocked: doctor.blocked, // Include blocked status
      };
      return acc;
    }, {});

    // Map through all the bookings and add the doctor's name and blocked status
    const list = allBooking.map(booking => ({
      date: booking.date,
      slots: booking.slots.map(slot => ({
        time: slot.time,
        doctors: slot.doctors.map(doctor => ({
          doctorId: doctor.doctorId,
          doctorName: doctorMap[doctor.doctorId]?.doctorName || 'Unknown', // Add the doctor's name if found
          blocked: doctorMap[doctor.doctorId]?.blocked ?? false, // Default to false if doctor not found
          status: doctor.status,
          bookedBy: doctor.bookedBy,
          bookingId: doctor.bookingId,
        }))
      }))
    }));

    // Send the response with the data
    res.status(200).json({ message: 'success', data: list });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching bookings' });
  }
});



module.exports = {
  allBookings,
};
