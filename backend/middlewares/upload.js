const multer = require('multer');
const path = require('path');
const fs = require('fs');

// تأكد من وجود مجلد uploads
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

// إعداد التخزين
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir); // حفظ الملف داخل مجلد uploads
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // اسم فريد للملف
  }
});

// تهيئة multer
const upload = multer({ storage: storage });

module.exports = upload;


