const dotenv = require('dotenv')
const mongoose = require('mongoose')
const DB_NAME = require('../constants')

 const connectDB = async () => {
    try {
        const connectionString = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n Mongodb connected !! DB HOST: ${connectionString.connection.host}`)
        
    } catch (error) {
        console.log("MONGODB connection FAILED ", error);
        // process.exit(1)
        
    }

}

module.exports = connectDB