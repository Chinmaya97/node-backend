const mongoose = require('mongoose')

let userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    mobile: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    is_verified: {
        type: Number,
        default: 0 // 1 is verified
    },
    image: {
        type: String,
        required: true
    }
    
},{timestamps: true})

module.exports = mongoose.model('User', userSchema)