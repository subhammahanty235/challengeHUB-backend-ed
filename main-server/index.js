require('dotenv').config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors");
const publishEmailRequest = require('./publishers/mailPublishers');
const redis = require('./redisClient');
const app = express();

mongoose.connect(process.env.MONGODB_URI,
    console.log("DB connected successfully")
);

app.use(cors())
app.use(express.json());


app.use("/api/auth", require('./routes/auth.route'))
app.use('/api/user', require('./routes/user.route'))
app.use('/api/challenge', require('./routes/challenge.route'))

app.use('/api/admin', require('./routes/adminroutes.routes'))


//temp
app.use("/api/email", require("./emailSystem/sendtestEmail").router)

app.get("/test", (req, res) => {

    const emailData = {
        templateId: 'otp_sent_mail',
        recipient: "subhammahanty235@gmail.com",
        subject: 'Your Verification Code',
        data: {
            name: "Subham",
            otp: 220022,
            purpose: 'OTP verification ',
            otpExpiry: 15  // Using default from schema
        }
    };
    publishEmailRequest('authentication', emailData)
    res.send("Email Sent, Now fuck you bitchhyyyyy");
});



app.get('/health', async (req, res) => {
    console.log("checking heslth ----------> ")
    return res.status(200).send('OK');
})

app.listen(5000, () => {
    console.log("--------------- main server  App is running ----------------")
})


