const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { cloudinary } = require('../config/cloudinaryConfig');

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'pdf_reports',
    resource_type: 'raw', // Required for PDFs and other non-image
    allowed_formats: ['pdf'],
  },
});

const upload = multer({ storage });

module.exports = { uploadSinglePdf: upload.single('report') };
