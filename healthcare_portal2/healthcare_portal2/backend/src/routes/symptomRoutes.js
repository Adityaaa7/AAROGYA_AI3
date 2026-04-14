const express = require('express');
const router = express.Router();
const symptomController = require('../controllers/symptomController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/checker', authMiddleware, symptomController.checkSymptoms);

module.exports = router;
