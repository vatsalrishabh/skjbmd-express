// services/externalWhatsapp.js
const axios = require("axios");

const API_URL = "http://198.38.87.182/api/whatsapp/send-bulk"; // Updated endpoint
const API_KEY = process.env.WHATSAPP_API_KEY;

const sendWhatsappBulkMessage = async (numbers, message) => {
  try {
    // Ensure numbers is always an array of strings
    const formattedNumbers = Array.isArray(numbers)
      ? numbers.map(String)
      : [String(numbers)];

    const body = {
      numbers: formattedNumbers,
      message,
    };

    console.log("📤 Request Body:", body);
    console.log("🔑 Using API Key:", API_KEY);

    const response = await axios.post(API_URL, body, {
      headers: {
        "x-api-key": API_KEY,
        "Content-Type": "application/json",
      },
    });

    console.log("✅ WhatsApp Bulk Message Sent:", response.data);
    return response.data;
  } catch (error) {
    console.error(
      "❌ Error sending WhatsApp bulk message:",
      error.response?.data || error.message
    );
    throw error;
  }
};

module.exports = { sendWhatsappBulkMessage };









// // services/externalWhatsapp.js
// const axios = require("axios");

// const API_URL = "http://198.38.87.182/api/whatsapp/send";
// const API_KEY = process.env.WHATSAPP_API_KEY;

// const sendWhatsappMessage = async (numbers, message) => {
//   try {
//     // Ensure numbers is always an array of strings
//     const formattedNumbers = Array.isArray(numbers)
//       ? numbers.map(String)
//       : [String(numbers)];

//     const body = {
//       numbers: formattedNumbers,
//       message,
//     };

//     console.log("📤 Request Body:", body);
//     console.log(API_KEY);
//     const response = await axios.post(API_URL, body, {
//       headers: {
//         "x-api-key": API_KEY,
//         "Content-Type": "application/json",
//       },
//     });


//     console.log("✅ WhatsApp Message Sent:", response.data);
//     return response.data;
//   } catch (error) {
//     console.error(
//       "❌ Error sending WhatsApp message:",
//       error.response?.data || error.message
//     );
//     throw error;
//   }
// };


// module.exports = { sendWhatsappMessage };
