const express = require("express")
const router = express.Router()
const {generateOtp , verifyOtp} = require("../controllers/auth.controller")
const { performanceCalcAlgorithm2 } = require("../utils/performanceCalculator")


router.post("/generateotp" , generateOtp);
router.post("/verifyotp" , verifyOtp);
router.get("/cudata/:cid" , performanceCalcAlgorithm2);

module.exports = router