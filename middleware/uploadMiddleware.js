const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define the path for uploads
const uploadDir = path.join(__dirname, '../uploads');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Check if folder exists; if not, create it
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true }); // recursively creates nested folders
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const number = req.body.number || Date.now(); // use number from form or fallback to timestamp
    const ext = path.extname(file.originalname);
    cb(null, `${number}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!['.jpg', '.jpeg', '.png'].includes(ext)) {
      return cb(new Error('Only JPG, JPEG, PNG files are allowed'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // max 5MB
  }
});

module.exports = upload;
