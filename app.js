
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');
const express = require('express'); //  1. express server 
const http = require('http'); // 2. http server 
const { Server } = require('socket.io'); //
const app = express();
const server = http.createServer(app);  // 4. express ke app ko http me ghusao aur chhota server banao


const io = new Server(
  server,
  {
    cors: {
      origin: "*",
    }
  }
) // 5. create io 


// Export io so other modules (like controllers) can use it .
module.exports.io = io;
const { initWhatsAppSocket } = require('./controllers/whatsappController');
initWhatsAppSocket(io);

// Optionally export app and server if needed elsewhere
module.exports.app = app;
module.exports.server = server;


// Load environment variables
dotenv.config();



// Middleware setup
app.use(cors()); // Allow cross-origin requests

app.use(morgan('dev')); // Logging HTTP requests in development mode
app.use(bodyParser.json()); // Parse JSON request bodies
app.use(bodyParser.urlencoded({ extended: true })); // URL encoded data parsing

// MongoDB connection
require('./config/db');
// const { createSlotsForSixtyDays } = require("./config/createSlots");
// createSlotsForSixtyDays();



// Import routes
const authRoutes = require('./routes/authRoutes');
const serviceRoutes = require('./routes/serviceRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const donationRoutes = require('./routes/donationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const downloadRoutes = require('./routes/downloadRoutes');
const rolesRoutes = require('./routes/rolesRoutes');
const androidRoutes = require("./routes/androidRoutes");

const { env } = require('process');
// const dashboardRoutes = require('./routes/dashboardRoutes');

// Use routes
app.use('/api/donations', donationRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/download',downloadRoutes);

app.use('/api/admin',rolesRoutes);


 app.use('/api/expoGo', androidRoutes);

 // app.use(express.static(path.join(__dirname, 'dist'))); Change 'build' to your frontend folder if needed

// Serve static images from /uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Redirect all requests to the index.html file system monolithic  

app.get("*", (req, res) => {
  return res.sendFile(path.join(__dirname, 'out', 'index.html'));
});

// core functionality - dice roll , 2-4 / 15000 acive / 1 room 4 log hash for the game(table), no of players (table indexing),table (moves- userId, diceroll ,game engine-, gameId)
// 15000 x 4 - reddis / kafka - zomato real time locaiton ()

// Set port and listen
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
