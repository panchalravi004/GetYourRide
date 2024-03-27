const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const { Server } = require('socket.io');
const { createServer } = require('node:http');

const {connect} = require('./connection')
const {logRequest, verifyToken} = require('./middleware')
const userRouter = require('./routes/user')
const rideRouter = require('./routes/ride')
const rideSharingRouter = require('./routes/rideSharing')
const paymentHistoryRouter = require('./routes/paymentHistory')
const messageHistoryRouter = require('./routes/messageHistory');
const { connection } = require('./controllers/socket');
const { sendContactUsEmail } = require('./controllers/nodemailer');

// Init Server
const app = express();
const PORT = 8000;
const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
        methods:['GET','POST'],
        credentials:true
    }
});

// Connection with MongoDB
connect('mongodb://127.0.0.1:27017/GetYourRide')

// Middlerware use
app.use(cors())
app.use(cookieParser())
app.use(bodyParser.json())
app.use(logRequest('log.txt'))

// Routes
app.use('/api/v1/user', userRouter)
app.use('/api/v1/ride', rideRouter)
app.use('/api/v1/ridesharing', rideSharingRouter)
app.use('/api/v1/paymenthistory', paymentHistoryRouter)
app.use('/api/v1/messagehistory', messageHistoryRouter)
app.use('/api/v1/sendemail', verifyToken, sendContactUsEmail)

io.on('connection', connection);

// Server Listener
server.listen(PORT,()=>{
    console.log(`Server started at: ${PORT}`);
})