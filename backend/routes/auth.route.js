// src/routes/authRoutes.js
const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");

router.post("/signup", authController.register);
router.post("/login", authController.login);
// router.post("/verifyOtp", authController.verifyOtp);
// router.post("/forgot-password", authController.forgotPassword);
// router.post("/reset-password/:token", authController.resetPassword);
// router.get("/allusers", authController.getAllUsers);    
//router.post("/checkAdmin", authController.checkAdmin);

module.exports = router;
