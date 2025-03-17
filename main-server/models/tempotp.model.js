const mongoose = require("mongoose")

const TempOtpSchema = mongoose.Schema({
    email:{
        type:String
    },
    otp:{
        type:Number
    },
    created:{
        type:Date
    },
    expiry:{
        type:Date
    },
    verification_status:{
        type:Boolean,
        default:false
    }
})

const TempOtp = mongoose.model('tempotp' , TempOtpSchema)
module.exports = TempOtp