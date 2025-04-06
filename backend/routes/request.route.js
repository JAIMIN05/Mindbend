const express = require('express');
const router = express.Router();
const requestController = require('../controllers/request.controller');
const userController = require('../controllers/user.controller');
// const { protect } = require('../middleware/auth.middleware');

// User routes
router.get('/checkacceptedrequest', requestController.checkAcceptedRequest);
router.post('/createRequest', requestController.createRequest);
router.get('/my-requests',  requestController.getUserRequests);
router.get('/:id',  requestController.updateRequest);
// router.delete('/:id',  requestController.cancelRequest);
router.post('/accept-provider', requestController.userAcceptedProvider);
router.delete('/delete/:id',  requestController.cancelRequest);
router.post('/complete-request', requestController.completeRequest);

// Service Provider routes
router.get('/provider/requests', requestController.getRequestToServiceProvider);
router.post('/accept-request', requestController.providerAcceptRequest);
// router.get('/nearby',  requestController.getNearbyRequests);

// Chat with AI
router.post('/chat', userController.AskToAI);

// Map routes
router.get('/map/:requestId', requestController.getRequestLocationMap);

module.exports = router;