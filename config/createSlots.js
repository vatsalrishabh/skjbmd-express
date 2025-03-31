const DateBookings = require("../models/DateBookings");
const User = require("../models/User");

/**
 * Function to create slots for upcoming 60 days if not already created.
 * Also ensures new doctors are added to existing slots.
 */
const createSlotsForSixtyDays = async () => {
  try {
    const doctors = await User.find({ role: "doctor" }, { userId: 1, name: 1 });
    const today = new Date();

    for (let i = 0; i < 60; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      const formattedDate = targetDate
        .toLocaleDateString("en-GB")
        .split("/")
        .join("-");

      const existingDateBooking = await DateBookings.findOne({ date: formattedDate });

      if (!existingDateBooking) {
        const slots = [];
        for (let hour = 8; hour < 23; hour++) {
          const startHour = hour.toString().padStart(2, "0");
          const endHour = (hour + 1).toString().padStart(2, "0");

          const bookingId = `BK${targetDate.getFullYear()}${(targetDate.getMonth() + 1)
            .toString()
            .padStart(2, "0")}${targetDate
            .getDate()
            .toString()
            .padStart(2, "0")}${startHour}00`;

          const timeSlot = `${startHour}:00 - ${endHour}:00`;

          // Creating slot with doctors
          const doctorsSlots = doctors.map((doc) => ({
            doctorId: doc.userId,
            status: "available",
            bookingId: `${bookingId}-${doc.userId}`, // Booking ID for each doctor
            bookedBy: "NA", // Initial state for bookedBy
          }));

          slots.push({
            bookingId,
            time: timeSlot,
            doctors: doctorsSlots, // Only include the doctors with the booking details
          });
        }

        // Create new booking entry for the date
        const newDateBooking = new DateBookings({
          date: formattedDate,
          slots: slots,
        });

        await newDateBooking.save();
        console.log(`Created slots for date: ${formattedDate}`);
      } else {
        // If date exists, check for missing doctors and update
        for (const slot of existingDateBooking.slots) {
          for (const doc of doctors) {
            const doctorExists = slot.doctors.some(
              (existingDoc) => existingDoc.doctorId === doc.userId
            );

            if (!doctorExists) {
              // Add new doctor to the slot if not already there
              slot.doctors.push({
                doctorId: doc.userId,
                status: "available",
                bookingId: `${slot.bookingId}-${doc.userId}`,
                bookedBy: "NA", // Initial state for bookedBy
              });
            }
          }
        }

        await existingDateBooking.save();
        console.log(`Updated slots for date: ${formattedDate} with new doctors.`);
      }
    }
  } catch (error) {
    console.error("Error creating or updating slots:", error);
  }
};

module.exports = { createSlotsForSixtyDays };
