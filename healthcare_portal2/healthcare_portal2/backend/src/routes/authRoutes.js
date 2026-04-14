const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middlewares/inputValidation');

router.post('/register', validateRegister, authController.register);
router.post('/login', validateLogin, authController.login);

// Logout can be handled client-side by removing token
module.exports = router;
