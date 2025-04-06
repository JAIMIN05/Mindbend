const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

// Profile routes
router.get('/profile', protect, userController.getUserProfile);
router.put('/profile', protect, userController.updateUserProfile);
router.get('/getalldata', userController.forextension);

router.post("/update-guardian-emails", userController.updateGuardianEmails);

module.exports = router; 