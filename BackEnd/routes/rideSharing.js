const express = require('express');

const {
    handleCreateRideSharing, 
    handleGetAllRideSharings,
    handleGetAllRideSharingsForSeeker,
    handleGetAllRideSharingsForProvider, 
    handleGetRideSharingById, 
    handleUpdateRideSharingById, 
    handleDeleteRideSharingById,
    handleUpdateRideSharingStatusById,
    handleRideSharingCashReceived
} = require('../controllers/rideSharing');

const { verifyToken } = require('../middleware');

const router = express.Router();

router
.route('/')
.all(verifyToken)
.get(handleGetAllRideSharings)
.post(handleCreateRideSharing)

router.get('/seeker',verifyToken,handleGetAllRideSharingsForSeeker)
router.post('/provider',verifyToken,handleGetAllRideSharingsForProvider)

router.post('/status/:id',verifyToken,handleUpdateRideSharingStatusById)
router.post('/cashreceived/:id',verifyToken,handleRideSharingCashReceived)

router
.route("/:id")
.all(verifyToken)
.get(handleGetRideSharingById)
.patch(handleUpdateRideSharingById)
.delete(handleDeleteRideSharingById);

module.exports = router;