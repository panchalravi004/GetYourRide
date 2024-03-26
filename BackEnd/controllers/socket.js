const MessageHistory = require("../models/messageHistory");

function connection(socket) {

    // const token = socket.handshake.query.token;
    // try {
    //     if (!token) throw new Error("TOKEN NOT FOUND")
    //     jwt.verify(token,'secret') 
    // } catch (error) {
    //     console.log('VERIFICATION FAILED')
    //     socket.disconnect()
    // }

    // console.log('User connected ', socket.id);

    socket.on('joinroom', (data)=>{
        // console.log('Join Room ', data);
        socket.join(data)
    })
    
    socket.on('sendmessage', (data)=>{
        // console.log('Send Message ', data);
        // create messsage history record
        socket.to(data.RideSharing).emit('receivemessage', data)

        if(data){
            const { RideSharing, Sender, Receiver, Message, SendTime } = data;
            let messageHistory = new MessageHistory({
                RideSharing,
                Sender,
                Receiver,
                Message,
                SendTime
            });
            messageHistory.save();
        }
    })
    
    socket.broadcast.emit('welcome', 'data')
    // socket.on('riderequestnotification',(data)=>{
    //     console.log('User connected ', socket.id);
    //     socket.broadcast.emit('notificationreceived', data)
    // })
    
    // socket.on('riderequestupdates',(data)=>{
    //     console.log('riderequestupdates ', socket.id);
    //     socket.broadcast.emit('riderequestupdates', data)
    // })
    
}

module.exports = {
    connection
}