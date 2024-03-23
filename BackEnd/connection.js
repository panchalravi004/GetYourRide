const mongoose = require('mongoose');

async function connect(url){
    return mongoose.connect(url).then(()=> console.log('MongoDB Connected...'));
}

module.exports = {
    connect
}