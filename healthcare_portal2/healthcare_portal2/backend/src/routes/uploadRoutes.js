const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const { uploadSinglePdf } = require('../middlewares/uploadMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/report/upload', authMiddleware, uploadSinglePdf, uploadController.uploadPdf);

module.exports = router;
