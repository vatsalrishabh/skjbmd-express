const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

let ioInstance;
let latestQr = null; // Store QR for later
let isReady = false;

function initWhatsAppSocket(io) {
  ioInstance = io;

  const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: { headless: true },
  });

  client.on('qr', async (qr) => {
    console.log("📲 QR Code received.");
    latestQr = await qrcode.toDataURL(qr); // Save to variable

    // Emit QR to all connected sockets
    io.emit('qr', latestQr);
  });

  client.on('ready', () => {
    isReady = true;
    console.log("✅ WhatsApp is ready.");
    io.emit('status', 'ready');
  });

  client.on('authenticated', () => {
    console.log("🔐 WhatsApp authenticated.");
    io.emit('status', 'authenticated');
  });

  client.on('disconnected', (reason) => {
    isReady = false;
    console.log("❌ WhatsApp disconnected:", reason);
    io.emit('status', 'disconnected');

    // Reinitialize the client
    client.initialize();
  });

  io.on('connection', (socket) => {
    console.log("🟢 Client connected to Socket.io:", socket.id);

    socket.emit('message', 'Connecting to WhatsApp...');

    // If QR was already generated, send it now
    if (latestQr) {
      socket.emit('qr', latestQr);
    }

    // If WhatsApp was already ready, send status
    if (isReady) {
      socket.emit('status', 'ready');
    }

    socket.on('disconnect', () => {
      console.log("🔴 Client disconnected from Socket.io:", socket.id);
    });
  });

  client.initialize();
}

module.exports = { initWhatsAppSocket };
