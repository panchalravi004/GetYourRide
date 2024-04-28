const mongoose = require('mongoose')

const paymentHistorySchema = new mongoose.Schema(
    {
        RideSharing:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'rideSharing'
        },
        User:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'user'
        },
        PaymentId:{
            type:String
        },
        PaymentLinkId:{
            type:String
        },
        Amount:{
            type:Number
        },
        Type:{
            type:String,
            enum:['Online','Cash'],
            default:'Online'
        },
        Status:{
            type:String,
            enum:['Faild','In Progress','Success']
        }
    },
    {timestamps:true}
)

const PaymentHistory = mongoose.model('paymentHistory', paymentHistorySchema)

module.exports = PaymentHistory