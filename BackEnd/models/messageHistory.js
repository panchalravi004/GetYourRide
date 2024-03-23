const mongoose = require('mongoose')

const messageHistorySchema = new mongoose.Schema(
    {
        Ride:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'ride'
        },
        Sender:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'user'
        },
        Receiver:{
            type:String
        },
        Message:{
            type:Number
        }
    },
    {timestamps:true}
)

const MessageHistory = mongoose.model('messageHistory', messageHistorySchema)

module.exports = MessageHistory