const mongoose = require('mongoose')

const paymentHistorySchema = new mongoose.Schema(
    {
        Ride:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'ride'
        },
        User:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'user'
        },
        PaymentId:{
            type:String
        },
        Amount:{
            type:Number
        },
        Status:{
            type:String,
            enum:['Faild','Success']
        }
    },
    {timestamps:true}
)

const PaymentHistory = mongoose.model('paymentHistory', paymentHistorySchema)

module.exports = PaymentHistory