const mongoose = require("mongoose")

const UserSchema = mongoose.Schema({
    name:{
        type:String,
    },
    emailId:{
        type:String,
    },
    mobileNumber:{
        type:String,
    },
    profileCreated:{
        type:Boolean,
        default:false
    },
    dateOfBirth:{
        type:Date
    },
    gender:{
        type:String,
    },
    profilePic:{
        type:String
    },
    joined:{
        type:Date
    },
})

const user = mongoose.model("user" , UserSchema);
module.exports = user;