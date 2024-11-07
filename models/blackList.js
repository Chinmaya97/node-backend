const mongoose = require('mongoose')

let blacklistSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true
    }
    
    
},{timestamps: true})

module.exports = mongoose.model('Blacklist', blacklistSchema)