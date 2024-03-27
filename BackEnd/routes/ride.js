const express = require('express');

const {
    handleCreateRide, 
    handleGetAllRides, 
    handleGetRideById, 
    handleUpdateRideById, 
    handleDeleteRideById, 
    handleUpdateRideStatusById, 
    handleGetRidePlanning,
    handleUpdateRideSeekerCount
} = require('../controllers/ride');

const { verifyToken } = require('../middleware');

const router = express.Router();

router
.route('/')
.all(verifyToken)
.get(handleGetAllRides)
.post(handleCreateRide)

router.post('/status/:id',verifyToken,handleUpdateRideStatusById)
router.post('/planning',verifyToken,handleGetRidePlanning)
router.post('/seekercount',verifyToken,handleUpdateRideSeekerCount)

router
.route("/:id")
.all(verifyToken)
.get(handleGetRideById)
.patch(handleUpdateRideById)
.delete(handleDeleteRideById);

module.exports = router;