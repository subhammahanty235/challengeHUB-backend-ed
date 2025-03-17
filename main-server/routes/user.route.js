const express = require("express")
const {verifyToken} = require('../middlewares/verifyToken')
const router = express.Router();
const {createProfile , getuser} = require('../controllers/user.controller')

router.put('/profile/create' ,verifyToken, createProfile)
router.get('/profile/get' , verifyToken , getuser)

module.exports = router