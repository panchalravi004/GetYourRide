const express = require('express');

const {
    handleCreateRideSharing, 
    handleGetAllRideSharings,
    handleGetAllRideSharingsForSeeker,
    handleGetAllRideSharingsForProvider, 
    handleGetRideSharingById, 
    handleUpdateRideSharingById, 
    handleDeleteRideSharingById,
    handleUpdateRideSharingStatusById
} = require('../controllers/rideSharing');

const { verifyToken } = require('../middleware');

const router = express.Router();

router
.route('/')
.all(verifyToken)
.get(handleGetAllRideSharings)
.post(handleCreateRideSharing)

router.get('/seeker',verifyToken,handleGetAllRideSharingsForSeeker)
router.get('/provider',verifyToken,handleGetAllRideSharingsForProvider)

router.post('/status/:id',verifyToken,handleUpdateRideSharingStatusById)

router
.route("/:id")
.all(verifyToken)
.get(handleGetRideSharingById)
.patch(handleUpdateRideSharingById)
.delete(handleDeleteRideSharingById);

module.exports = router;