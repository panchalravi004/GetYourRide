const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')

const {connect} = require('./connection')
const {logRequest, verifyToken} = require('./middleware')
const userRouter = require('./routes/user')
const rideRouter = require('./routes/ride')
const rideSharingRouter = require('./routes/rideSharing')

// Init Server
const app = express();
const PORT = 8000;

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

// Server Listener
app.listen(PORT,()=>{
    console.log(`Server started at: ${PORT}`);
})