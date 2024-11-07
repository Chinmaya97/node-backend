require('dotenv').config()
const express = require('express');
const app = express()
app.set('view engine', 'ejs')
app.set('views', './views')
let connectDB = require('./db/index')

const userRoute = require('./routes/user.routes')
app.use('/api', userRoute)

const authRoute = require('./routes/auth.route')
app.use('/', authRoute)

connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️ Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err) => {
    console.log("MONGO db connection failed !!! ", err);
})

