const { default: mongoose } = require('mongoose');
const { RAZORPAY_API_KEY, RAZORPAY_API_SECRET } = require('../config');
const PaymentHistory = require('../models/paymentHistory');
const RideSharing = require('../models/rideSharing');

async function handleCreatePaymentHistory(req, res) {
    try {
        const { CurrentDomain, RideSharing, User, Amount, Status, Name, Email, Phone } = req.body;

        let paymentHistory = new PaymentHistory({
            RideSharing,
            User,
            Amount,
            Status
        });

        const doc = await paymentHistory.save();

        let expiredTime = new Date()
        expiredTime.setHours(expiredTime.getHours()+5)

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", `Basic ${btoa(RAZORPAY_API_KEY+':'+RAZORPAY_API_SECRET)}`);

        const raw = JSON.stringify({
            "amount": Amount*100,
            "currency": "USD",
            "expire_by": expiredTime.getTime(),
            "reference_id": new Date().getTime()+':'+RideSharing,
            "description": "Payment For Your Ride Sharing Request",
            "customer": {
                "name": Name,
                "contact": Phone.toString(),
                "email": Email
            },
            "notify": {
                "sms": false,
                "email": false
            },
            "reminder_enable": false,
            "notes": {
                "policy_name": "Jeevan Bima"
            },
            "callback_url": `${CurrentDomain}/paymentredirect/${RideSharing}/${doc._id}`,
            "callback_method": "get"
        });

        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
        };

        var razorpayPromise = await fetch("https://api.razorpay.com/v1/payment_links", requestOptions)
        var razorpayPromiseResult = await razorpayPromise.json()
        if(razorpayPromiseResult){
            let paymentLinkShortURL = razorpayPromiseResult.short_url
            let paymentLinkId = razorpayPromiseResult.id
            
            await PaymentHistory.findByIdAndUpdate(doc._id, {
                PaymentLinkId:paymentLinkId,
            });

            return res.status(200).json({
                status: 'Success',
                message: 'Payment history created successfully!',
                id: doc._id,
                shortURL: paymentLinkShortURL
            });
        }else{

            return res.status(500).json({
                status: 'Error',
                message: 'Faild to create payment link, try again later!',
            });
        }
        

    } catch (error) {
        return res.status(500).json({
            status: 'Error',
            message: 'Failed to create payment history!'
        });
    }
}

async function handleGetAllPaymentHistories(req, res) {
    const paymentHistories = await PaymentHistory.find();
    return res.json(paymentHistories);
}

async function handleGetAllPaymentTotalByUserId(req, res) {
    
    // Places.find({location: { $in: [location ids] }}).then(places => {...})
    let allRideSharing = await RideSharing.find({ Provider: req.userId }).select('_id');

    allRideSharing = allRideSharing.map((ele)=> ele._id)
    
    // Find payment histories related to the retrieved ride sharing records
    const paymentHistories = await PaymentHistory.aggregate([
        {$match : {RideSharing: { $in: [...allRideSharing]}}},
        {$group : {_id:null, totalAmount:{$sum:"$Amount"}}}
    ]);
    
    // console.log('paymentHistories ', paymentHistories.length);

    // Retrieve the total amount from the result
    const totalAmount = paymentHistories.length > 0 ? paymentHistories[0].totalAmount : 0;

    return res.json({status:'Success',message:'Payment Fetch Successfully!',totalAmount});
}

async function handleGetPaymentHistoryById(req, res) {
    const paymentHistory = await PaymentHistory.findById(req.params.id);
    if (!paymentHistory) return res.status(404).json({
        error: 'Payment history Not Found'
    });
    return res.json(paymentHistory);
}

async function handleUpdatePaymentHistoryById(req, res) {
    try {
        const {
            PaymentId,
            PaymentLinkId,
            Amount,
            Status
        } = req.body;

        await PaymentHistory.findByIdAndUpdate(req.params.id, {
            PaymentId,
            PaymentLinkId,
            Amount,
            Status
        });

        return res.json({
            status: 'Success',
            message: 'Payment history updated successfully!'
        });
    } catch (error) {
        return res.status(500).json({
            status: 'Error',
            message: 'Failed to update payment history!'
        });
    }
}

async function handleUpdatePaymentHistory(req, res) {
    try {
        const {
            PaymentId,
            Status
        } = req.body;

        await PaymentHistory.findByIdAndUpdate(req.params.id, {
            PaymentId,
            Status
        });

        return res.json({
            status: 'Success',
            message: 'Payment history updated successfully!'
        });
    } catch (error) {
        return res.status(500).json({
            status: 'Error',
            message: 'Failed to update payment history!'
        });
    }
}

async function handleDeletePaymentHistoryById(req, res) {
    try {
        await PaymentHistory.findByIdAndDelete(req.params.id);
        return res.json({
            status: 'Success',
            message: 'Payment history removed successfully!'
        });
    } catch (error) {
        return res.status(500).json({
            status: 'Error',
            message: 'Failed to remove payment history!'
        });
    }
}

module.exports = {
    handleCreatePaymentHistory,
    handleGetAllPaymentHistories,
    handleGetPaymentHistoryById,
    handleUpdatePaymentHistoryById,
    handleDeletePaymentHistoryById,
    handleUpdatePaymentHistory,
    handleGetAllPaymentTotalByUserId
};
