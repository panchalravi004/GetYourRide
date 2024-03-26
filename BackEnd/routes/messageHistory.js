const express = require('express');

const {
    handleCreateMessageHistory, 
    handleGetAllMessageHistories,
    handleGetMessageHistoryById, 
    handleUpdateMessageHistoryById, 
    handleDeleteMessageHistoryById,
    handleGetAllMessageHistoriesForRideSharing
} = require('../controllers/messageHistory');

const { verifyToken } = require('../middleware');

const router = express.Router();

router
.route('/')
.all(verifyToken)
.get(handleGetAllMessageHistories)
.post(handleCreateMessageHistory)

router.post('/ridesharing', verifyToken, handleGetAllMessageHistoriesForRideSharing)

router
.route("/:id")
.all(verifyToken)
.get(handleGetMessageHistoryById)
.patch(handleUpdateMessageHistoryById)
.delete(handleDeleteMessageHistoryById);

module.exports = router;