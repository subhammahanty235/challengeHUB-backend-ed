const express = require('express');

const router = express.Router();
const {findAllChallenges , findChallengesofUser , createChallenge, marktaskasDone, joinChallenge, checkChallenges, getCUData, addNote, getDetailedDWCData} = require('../controllers/challengeController');
const { verifyToken } = require('../middlewares/verifyToken');
const { performanceCalcAlgorithm2 } = require('../utils/performanceCalculator');

router.get('/getAll' ,verifyToken, findAllChallenges);
router.get('/getmyChallenges' ,verifyToken, findChallengesofUser)
router.post('/create' ,verifyToken, createChallenge )
router.post('/markasdone/:cId' ,verifyToken, marktaskasDone)
router.post('/join' , verifyToken , joinChallenge)
router.get('/check' ,verifyToken, checkChallenges )
router.get('/getCU/:id' , checkChallenges);
router.post('/addnote/:cuId',verifyToken, addNote)
router.post('/getdwcdetailed/:cid' ,verifyToken , getDetailedDWCData )

router.post('/temperf/:cid' , performanceCalcAlgorithm2);
module.exports = router