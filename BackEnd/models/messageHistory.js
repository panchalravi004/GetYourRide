const mongoose = require('mongoose')

const messageHistorySchema = new mongoose.Schema(
    {
        RideSharing:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'rideSharing'
        },
        Sender:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'user'
        },
        Receiver:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'user'
        },
        Message:{
            type:String
        },
        SendTime:{
            type:Number
        }
    },
    {timestamps:true}
)

const MessageHistory = mongoose.model('messageHistory', messageHistorySchema)

module.exports = MessageHistory