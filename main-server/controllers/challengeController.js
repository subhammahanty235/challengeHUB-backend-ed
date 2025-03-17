const { default: mongoose } = require('mongoose');
const Challenge = require('../models/challenge.model')
const User = require("../models/user.model")
const UCConnection = require('../models/challenge_user_connection.model')
const SecurityKey = require('../models/security_passwords.model')
const { dayDifferenceCalculator, checkExceeded, UTCtoIST } = require('../utils/dateHelpers');
const { performanceCalcAlgorithm } = require('../utils/performanceCalculator');
const moment = require('moment');
const { joinedChallengeEmail } = require('../emailSystem/challengeEmail');



exports.createChallenge = async (req, res) => {
    try {
        const { challengeData, includeStartDate } = req.body;
        const createdBy = req.user.id;
        if (challengeData.name === '') {
            return res.status(400).json({ success: false, message: "Please provide a name" })
        }

        const tempData = {
            name: challengeData.name,
            description: challengeData.description !== null ? challengeData.description : '',
            noOfdays: challengeData.noOfdays !== null ? challengeData.noOfdays : 1,
            created: new Date(),
            visibility: challengeData.visibility,
            creator: createdBy
        }

        const result = await Challenge.create(tempData);

        if (result) {
            //store the challenge in user challenge connection model also
            await UCConnection.create({
                challengeId: result.id,
                userId: createdBy,
                startDate: new Date(),
                totalnoOfDays: result.noOfdays,
                includeStartDate: includeStartDate
            })

            res.status(200).json({ success: true, message: 'Challenge created successfully' })
        } else {
            res.status(400).json({ success: false, message: "Can't create the challenge" })
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

exports.findAllChallenges = async (req, res) => {
    try {
        //it will only fetch the public and protected challenges,
        const userId = req.user.id

        // const challenges = await Challenge.find({ visibility: { $ne: 'Private' } })
        const challenges = await Challenge.aggregate([
            {
                $match: {
                    visibility: { $ne: 'Private' }
                },

            },
            {
                $lookup: {
                    from: 'cu_connections',
                    localField: '_id',
                    foreignField: 'challengeId',
                    as: 'connections'
                }
            },
            {
                $match: {
                    'connections.userId': { $ne: mongoose.Types.ObjectId.createFromHexString(userId) }
                }
            },
            {
                $project: {
                    connections: 0
                }
            },
            {
                $sort: {
                    challengePriority: 1  // Sort in ascending order based on the 'priority' field
                }
            }
        ])
        if (challenges) {
            return res.status(200).json({ success: true, challenges: challenges, message: 'Challenges Fetched Successfully' })
        } else {
            res.status(400).json({ success: false, message: "Can't fetch the challenge" })
        }
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
}

exports.findChallengesofUser = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await UCConnection.aggregate([
            {
                $match: { userId: mongoose.Types.ObjectId.createFromHexString(userId) }
            },
            {
                $lookup: {
                    from: 'challenges',
                    localField: 'challengeId',
                    foreignField: '_id',
                    as: 'challenge'
                }
            },
            {
                $unwind: '$challenge'
            },
            {
                $project: {
                    _id: 0,
                    challenge: 1,
                    challengeStatus: '$challengeStatus',
                    completedTotaldays: '$completedTotaldays',
                    DayWisecompletedOn: '$DayWisecompletedOn',
                    expectedEnd: '$expectedEnd',
                    startDate: '$startDate',
                    includeStartDate: '$includeStartDate'
                }
            }
        ]).sort({ startDate: -1 }).exec()

        const challenges = result.map((item) => {
            const challengeData = item.challenge;
            challengeData.challengeStatus = item.challengeStatus;
            challengeData.completedTotaldays = item.completedTotaldays;
            challengeData.DayWisecompletedOn = item.DayWisecompletedOn;
            challengeData.expectedEnd = item.expectedEnd;
            challengeData.startDate = item.startDate;
            challengeData.includeStartDate = item.includeStartDate
            challengeData.performanceScore = performanceCalcAlgorithm({

                startDate: item.startDate,
                includeStartDate: item.includeStartDate,
                DayWisecompletedOn: item.DayWisecompletedOn,
                totalnoOfDays: item.challenge.noOfdays,
                name: item.challenge.name,

            })
            return challengeData;
        });
        res.status(200).json({ success: true, challenges: challenges, message: "Challenges fetched successfully" })
    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
}

exports.marktaskasDone = async (req, res) => {
    try {
        const challengeId = req.params.cId;
        const userId = req.user.id
        const { notes } = req.body;



        //get the data from the db using the relevant cuId

        const cuData = await UCConnection.findOne({ $and: [{ userId: userId }, { challengeId: challengeId }] })
        if (!cuData) {


            return res.status(400).json({ success: false, message: "Can't find the relevant Challenge" })
        }
        let startDate = cuData.startDate;
        let nextDate = new Date(cuData.startDate);      //if includeStartDate is false
        let stdDay = new Date(startDate)
        nextDate.setDate(stdDay.getDate() + 1);





        let dayDifference = dayDifferenceCalculator(cuData.includeStartDate === true ? startDate : nextDate);

        // startDate = new Date(startDate);
        // const timeDifference = currentDate - startDate;
        // const dayDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24))

        // check if data with the same day number already exists or no t

        const checkData = await UCConnection.findOne({
            $and: [
                { _id: cuData._id },
                { "DayWisecompletedOn.dayNumber": dayDifference }
            ]
        });

        if (!checkData) {
            await UCConnection.findByIdAndUpdate(cuData._id, {
                $push: {
                    DayWisecompletedOn: {
                        date: new Date(),
                        dayNumber: dayDifference,
                        status: true,
                        notes: !notes ? '' : notes
                    }
                }
            })

            const response = await UCConnection.findOne(
                {
                    _id: cuData._id,
                    "DayWisecompletedOn.dayNumber": dayDifference
                },
                {
                    "DayWisecompletedOn.$": 1
                }
            );

            res.status(200).json({ success: true, message: "Marked as Complted", newData: response.DayWisecompletedOn[0] })
        } else {
            res.status(400).json({ success: false, message: "Already Marked!" })
        }

    } catch (error) {
        res.status(400).json({ success: false, message: error.message })
    }
}

exports.addNote = async (req, res) => {
    try {

        const challengeId = req.params.cuId;
        const userId = req.user.id;
        const { note } = req.body;
        const cuData = await UCConnection.findOne({ $and: [{ userId: userId }, { challengeId: challengeId }] })
        if (!cuData) {
            return res.status(400).json({ success: false, message: "Can't find the relevant Challenge" })
        }
       

        let startDate = cuData.startDate;
        let nextDate = new Date(cuData.startDate);      //if includeStartDate is false
        let stdDay = new Date(startDate)
        nextDate.setDate(stdDay.getDate() + 1);


        let dayDifference = dayDifferenceCalculator(cuData.includeStartDate === true ? startDate : nextDate);
        // let dayDifference = dayDifferenceCalculator(startDate)

        const ucc = await UCConnection.findOneAndUpdate(
            {
                userId: userId,
                challengeId: challengeId,
                "DayWisecompletedOn.dayNumber": dayDifference,
            },
            {
                $set: {
                    "DayWisecompletedOn.$.notes": note,
                }
            },
            { new: true },
        )

        
        res.status(200).json({ success: true, data: ucc.DayWisecompletedOn });


    } catch (error) {

    }
}

exports.getCUData = async (req, res) => {
    const userId = req.params.id;
    const resp = await UCConnection.find({ userId: userId });
    res.send(resp);
}

exports.joinChallenge = async (req, res) => {
    try {
        const { data } = req.body;
        const userID = req.user.id;

        //check if user has already taken the challenge
        const checkUser = await UCConnection.findOne({ $and: [{ userId: userID }, { challengeId: data.challengeId }] });
        if (checkUser) {
            return res.status(400).json({ success: false, message: "You have already participated" })
        }

        //get the data of user
        const user = await User.findOne({_id:userID})

        //fetch the challenge to check if challenge is protected, then we will do varifications
        const challenge = await Challenge.findOne({ _id: data.challengeId });
        if (!challenge) {
            return res.status(404).json({ success: false, message: "Challenge not found" })
        }

        let isProtected = false;
        if (challenge.visibility === 'Protected') {
            isProtected = true;
        }
        
        let verified = false;
        if (isProtected) {
            const security = await SecurityKey.findOne({ challengeId: data.challengeId });
            if (!data.securityKey) {
                return res.status(404).json({ success: false, message: "Please provide a security key" })
            }
            if (security.securityKey === data.securityKey) {
                verified = true;
            } else {
                return res.status(400).json({ success: false, message: "Wrong Key!" })
            }
        }

        if (((isProtected === false && verified === false) || (isProtected === true && verified === true))) {
            await UCConnection.create({
                challengeId: data.challengeId,
                userId: userID,
                startDate: challenge.datewise === true ? challenge.fixstartDate : new Date(),
                totalnoOfDays: data.totalnoOfDays,
                includeStartDate:challenge.datewise === true? true : data.includeStartDate,
            })

            //update the challenge's total participants

            await Challenge.findByIdAndUpdate(data.challengeId, {
                $inc: {
                    totalCrowd: 1
                }
            })


            joinedChallengeEmail(user.name , user.emailId , challenge)

            res.status(200).json({ success: true, message: "Successfully Joined" })
        }

    } catch (error) {

    }
}

exports.checkChallenges = async (req, res) => {
    try {
        const userID = req.user.id;
        // const userID = req.params.id

        //fetch all data from CUConnections whose completion status is inprogress;
        const cudata = await UCConnection.find({
            userId: userID,
            'challengeStatus.status': 0
        })

        // now Traverse the cudata and check if currentData exceeded any of the expectedEnds;
        let dataArr = [];
        for (var i = 0; i < cudata.length; i++) {


            if (checkExceeded(cudata[i].expectedEnd) === 2) {
                //check the performance to mark the challenge with correct status
                let score = await performanceCalcAlgorithm(cudata[i]);

                if (score > 60) {
                    await UCConnection.findByIdAndUpdate(cudata[i]._id, {
                        challengeStatus: {
                            status: 1,
                            statusChanged: moment(cudata.expectedEnd).add(1, 'days'),
                            score: score,
                        }
                    })
                    dataArr.push({ id: cudata[i]._id, score: score, status: "Passed" })
                }
                else {
                    await UCConnection.findByIdAndUpdate(cudata[i]._id, {
                        challengeStatus: {
                            status: 2,
                            statusChanged: moment(cudata.expectedEnd).add(1, 'days'),
                            score: score,
                        }
                    },
                    )
                    dataArr.push({ id: cudata[i]._id, score: score, status: "Passed" })
                }
            } else {

            }
        }

        res.send(dataArr)
    } catch (error) {
        console.log(error)
    }
}

exports.getDetailedDWCData = async (req, res) => {
    try {
        const userId = req.user.id;
        const challengeId = req.params.cid;
        const cuData = await UCConnection.findOne({ $and: [{ userId: userId }, { challengeId: challengeId }] });
        if (!cuData) {
            return res.status(400).json({ success: false, message: "You have already participated" })
        }


        const startDate = UTCtoIST(cuData.startDate);

      

        const currentDate = UTCtoIST(new Date());
        const includeStartDay = cuData.includeStartDate;
        const dwcDatas = cuData.DayWisecompletedOn;
        const totalNoDays = cuData.totalnoOfDays;

       

        if ((startDate === currentDate) && includeStartDay === false) {
            res.status(200).json({ success: true, dataStatus: false, message: "No Data yet" })
        }

        

        // // now calculate how many days from the startDate to currentDate user has completed the tasks
        const dayNumbers = new Set(dwcDatas.map((obj) => obj.dayNumber));
        // console.log("1")

       
       
        const nextDay = startDate.clone().add(1, 'day');
        // console.log(cuData.startDate.getDate() + 1);
        const nextDate = new Date(cuData.startDate);
        const stdday = new Date(cuData.startDate);
        nextDate.setDate(stdday.getDate() + 1);
       

        
        
        const sdTocd = dayDifferenceCalculator(includeStartDay === true ? new Date(cuData.startDate) : nextDate);  //startDate to currentdate difference
        // const sdTocd = dayDifferenceCalculator(includeStartDay === true ? "Con 1":"con2");  //startDate to currentdate difference
        
     
        let allDates = [];
        let date = includeStartDay === true ? startDate : nextDay;
        
        const stdr = startDate.toISOString().split('T')[0];
        
        const formattedDatew = date.toISOString().split('T')[0];
        
        const formattedDatee = nextDay.toISOString().split('T')[0];
       

    
        
        for (let i = 0; i < (sdTocd < totalNoDays ? sdTocd + 1 : totalNoDays + 1); i++) {

            const formattedDate = date.toISOString().split('T')[0];
            
            const dwcData = dwcDatas.find((data) => data.dayNumber === i)
            // console.log("2.1")
            let notes;
            if (dwcData !== undefined) {
                notes = dwcData.notes;
                // console.log("2.2 if-true")
            } else {
                notes = null;
                // console.log("2.2 if-false")
            }

            allDates.push({ date: formattedDate, dayStatus: dayNumbers.has(i) ? 1 : 0, index: i, notes: notes });
            // console.log("2.4")
            date = date.clone().add(1, 'day')
            // date.setDate(date.getDate() + 1);
        }
       

        res.status(200).json({ success: true, dataStatus: true, message: "Data processed", dates: allDates })

    } catch (error) {

    }
}

