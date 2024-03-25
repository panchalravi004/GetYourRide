const mongoose = require('mongoose')

const rideSharingSchema = new mongoose.Schema(
    {
        Ride:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'ride'
        },
        Seeker:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'user'
        },
        Provider:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'user'
        },
        Pickup:{
            text:{ type:String },
            cord:{}
        },
        DropOff:{
            text:{ type:String },
            cord:{}
        },
        Distance:{
            type:Number
        },
        Duration:{
            type:Number,
        },
        Status:{
            type:String,
            enum:[
                'Pending','Cancel By Seeker','Cancel By Provider',
                'Payment Pending','Not Pickup','Pickup',
                'Dropped'
            ]
        },
    },
    {timestamps:true}
)

const RideSharing = mongoose.model('rideSharing', rideSharingSchema)

module.exports = RideSharing