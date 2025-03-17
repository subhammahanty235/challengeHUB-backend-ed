const mongoose = require('mongoose')

const Security_Key = mongoose.Schema({
    challengeId:{
        type:mongoose.Types.ObjectId,
        ref:'challenges'
    },
    securityKey:{
        type:String,
    }
})

const SecurityKey = mongoose.model('securitykeys' , Security_Key);
module.exports = SecurityKey;