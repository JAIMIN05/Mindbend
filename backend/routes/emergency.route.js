const express = require("express");
const router = express.Router();

const emergencyController = require("../controllers/emergency.controller");

router.post("/save-emergency", emergencyController.saveemergency);
router.get("/show-emergency", emergencyController.showreqtohos);
router.post("/accept-emergency", emergencyController.acceptEmergency);
router.get("/get-accepted-emergency", emergencyController.getAcceptedEmergency);
router.post("/mark-as-done", emergencyController.markEmergencyAsDone);
router.get("/done-emergencies", emergencyController.getDoneRequests);
router.get("/user-emergencies", emergencyController.getUserEmergencyRequests);
router.delete("/delete-emergency/:requestId", emergencyController.deleteEmergencyRequest);
router.get("/map-locations", emergencyController.getAllEmergencyLocations);

module.exports = router;
