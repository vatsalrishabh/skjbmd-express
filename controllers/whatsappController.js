const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

let ioInstance;
let latestQr = null;
let isReady = false;
let client;

const puppeteerConfig = {
  headless: true,
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-accelerated-2d-canvas',
    '--no-first-run',
    '--no-zygote',
    '--single-process',
    '--disable-gpu',
  ],
};

function createClient() {
  client = new Client({
    authStrategy: new LocalAuth({ clientId: 'client-one' }),
    puppeteer: puppeteerConfig
  });

  client.on('qr', async (qr) => {
    latestQr = await qrcode.toDataURL(qr);
    ioInstance.emit('qr', latestQr);
  });

  client.on('authenticated', () => {
    console.log("🔐 WhatsApp authenticated.");
    ioInstance.emit('status', 'authenticated');
  });

  client.on('ready', () => {
    isReady = true;
    console.log("✅ WhatsApp is ready.");
    ioInstance.emit('status', 'ready');
  });

  client.on('disconnected', async (reason) => {
    isReady = false;
    console.log("❌ WhatsApp disconnected:", reason);
    ioInstance.emit('status', 'disconnected');
    try {
      await client.destroy();
      console.log("🧹 Cleaned up old client. Restarting in 5s...");
    } catch (err) {
      console.error("Error destroying client:", err.message);
    }
    setTimeout(() => {
      console.log("♻️ Reinitializing WhatsApp...");
      createClient();
      client.initialize();
    }, 5000);
  });

  client.initialize();
}

function initWhatsAppSocket(io) {
  ioInstance = io;
  createClient();

  io.on('connection', (socket) => {
    console.log("🟢 Client connected to Socket.io:", socket.id);
    socket.emit('message', 'Connecting to WhatsApp...');
    if (latestQr) socket.emit('qr', latestQr);
    if (isReady) socket.emit('status', 'ready');

    socket.on('disconnect', () => {
      console.log("🔴 Client disconnected:", socket.id);
    });
  });
}

const sendWhatsappMessage = async (mobileNumber, text) => {
  try {
    if (!client || !isReady) {
      throw new Error("WhatsApp client is not ready.");
    }

    const numberId = `${mobileNumber}@c.us`;
    const isRegistered = await client.isRegisteredUser(numberId);

    if (!isRegistered) {
      throw new Error("Number is not registered on WhatsApp.");
    }

    await client.sendMessage(numberId, text);
    console.log(`📤 Message sent to ${mobileNumber}: ${text}`);
    return { success: true, message: `Message sent to ${mobileNumber}` };
  } catch (err) {
    console.error(`❌ Failed to send message to ${mobileNumber}:`, err.message);
    return { success: false, message: err.message };
  }
};

process.on('unhandledRejection', (reason, p) => {
  console.error('Unhandled Rejection at:', p, 'reason:', reason);
});
process.on('uncaughtException', err => {
  console.error('Uncaught Exception:', err);
});

module.exports = { initWhatsAppSocket, sendWhatsappMessage };
