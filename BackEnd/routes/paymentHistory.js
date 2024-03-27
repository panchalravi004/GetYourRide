const express = require('express');

const {
    handleCreatePaymentHistory, 
    handleGetAllPaymentHistories,
    handleGetPaymentHistoryById, 
    handleUpdatePaymentHistoryById, 
    handleDeletePaymentHistoryById,
    handleUpdatePaymentHistory,
    handleGetAllPaymentTotalByUserId
} = require('../controllers/paymentHistory');

const { verifyToken } = require('../middleware');

const router = express.Router();

router
.route('/')
.all(verifyToken)
.get(handleGetAllPaymentHistories)
.post(handleCreatePaymentHistory)

router.post('/status/:id', verifyToken, handleUpdatePaymentHistory)
router.get('/walletamount', verifyToken, handleGetAllPaymentTotalByUserId)

router
.route("/:id")
.all(verifyToken)
.get(handleGetPaymentHistoryById)
.patch(handleUpdatePaymentHistoryById)
.delete(handleDeletePaymentHistoryById);

module.exports = router;