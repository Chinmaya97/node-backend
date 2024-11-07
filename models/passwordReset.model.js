const mongoose = require('mongoose')

let passwordResetSchema = new mongoose.Schema({
    user_id: {
        type: String,
        required: true,
        ref: 'User'
    },
    token: {
        type: String,
        required: true
    }
    
    
},{timestamps: true})

module.exports = mongoose.model('passwordReset', passwordResetSchema)