const mongoose = require('mongoose')

const rideSchema = new mongoose.Schema(
    {
        User:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'user'
        },
        Source:{
            text:{ type:String },
            cord:{}
        },
        Destination:{
            text:{ type:String },
            cord:{}
        },
        Distance:{
            type:Number
        },
        ChargePerMile:{
            type:Number,
        },
        AvailableSeat:{
            type:Number,
            min:1
        },
        Status:{
            type:String,
            enum:['Not Started','Started','Complete']
        },
        SeekerCount:{
            type:Number,
            default:0
        },
        StartDateTime:{
            type:Date,
        },
        Duration:{
            type:Number,
        }
    },
    {timestamps:true}
)

const Ride = mongoose.model('ride', rideSchema)

module.exports = Ride