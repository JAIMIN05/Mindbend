const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
// const authMiddleware = require('../middleware/auth.middleware');
// const isAdmin = require('../middleware/isAdmin.middleware');

// Service Provider Management Routes
router.post('/add-service-provider', adminController.addServiceProvider);
router.get('/service-providers',  adminController.getAllServiceProviders);
router.put('/service-provider/:id',  adminController.updateServiceProviderStatus);
router.delete('/service-provider/:id',  adminController.deleteServiceProvider);

module.exports = router;