const mongoose = require('mongoose')

let otpSchema = new mongoose.Schema({
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    otp: {
        type: Number,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now, 
        get: (timestamp) => timestamp.getTime(),
        set: (timestamp) => new Date(timestamp)
    }
    
    
})

module.exports = mongoose.model('Otp', otpSchema)