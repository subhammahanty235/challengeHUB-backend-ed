const router = require("express").Router();
const {CheckInactiveUsers, getinaciveOrFailingUser, checkAllChallengesOfUser} = require('../controllers/adminControllers')
router.get('/inactive' ,CheckInactiveUsers )   //logged in but not participated in any challenge

router.get("/gincfailing",getinaciveOrFailingUser );

router.get("/checkAllChallengesOfUser" , checkAllChallengesOfUser)


module.exports = router