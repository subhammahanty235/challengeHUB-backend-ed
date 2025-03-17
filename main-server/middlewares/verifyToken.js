const jwt = require("jsonwebtoken")

exports.verifyToken = (req,res,next) => {
    const authToken = req.header("token");

    // console.log(authToken)
    if(!authToken){
        res.status(404).json({success:false, message:"Please provide a token"})
    }
    try {
        const data = jwt.verify(authToken , "jwt67689797979")
        req.user = data.user;
        next();
    } catch (error) {
        res.status(401).json({success:false, message: "please authenticte using a valid token" })
    }
} 