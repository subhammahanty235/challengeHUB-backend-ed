//it will include the controllers that are required from admin end. those controllers will not be directly implemented in the frontend application
const CUConnections = require('../models/challenge_user_connection.model')
const User = require('../models/user.model')
// const Challenge = require('../models/challenge.model')
const { sendInactiveMail, sendNotParticipatinMail } = require('../emailSystem/sendtestEmail')
const moment = require('moment');
const { dayDifferenceCalculator, checkExceeded, UTCtoIST } = require('../utils/dateHelpers');
const { performanceCalcAlgorithm } = require('../utils/performanceCalculator');

const {CronTrackerInactive, CronTrackerForCuDataCheck , CronTrackerForNotParticipating} = require('../models/crontracker.model')

exports.CheckInactiveUsers = async (req, res) => {     // this is for the users who logged in but not participated in any challenge
    try {
        const response = await User.aggregate([

            {
                $lookup: {
                    from: "cu_connections",
                    localField: "_id",
                    foreignField: "userId",
                    as: "challenges"
                }
            },
            {
                $match: {
                    challenges: { $size: 0 } // Filter users with no challenges
                }
            },
            {
                $project: {
                    _id: 1,
                    name: 1,
                    emailId: 1
                }
            }

        ])

        if (response.length > 0) {
            for (let i = 0; i < response.length; i++) {
                //for backend log tracking
                console.log("--------------------------------->")
                console.log("Sending inactive mail to");
                console.log(response[i].emailId);
                console.log("Date" + new Date());
                console.log("<---------------------------------")
                sendInactiveMail(response[i]);
            }
        }

        await CronTrackerInactive.create({
            response:{
                success:true,
                jsonData: response
            },
        })

        res.send(response)
    } catch (error) {

    }
}

exports.getinaciveOrFailingUser = async (req, res) => {
    const response = await CUConnections.aggregate([
        {
            $match: {
                challengeStatus: { $eq: { status: 0 } }  // Filter for status 0
            }
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
            $lookup: {
                from: 'users',
                localField: 'userId',
                foreignField: '_id',
                as: 'users'
            }
        },
        {
            $unwind:"$users"
        },
        // { $unwind: "$user" },  // Deconstruct the "user" array
        
        {
            $project: {
                // user:1,
                name:"$users.name",
                emailId:"$users.emailId",
                challengename:"$challenge.name",
                dwcData:"$DayWisecompletedOn",
                startDate: '$startDate',

            }
        }
    ]);


    

    const filteredData = response.filter((res)=> {
        const data = res.dwcData
        let lastdwc;
        if(data.length !==0){
            lastdwc =  data[data.length-1].date;
        }

      return  data.length !== 0 ? dayDifferenceCalculator(lastdwc) >= 3 && dayDifferenceCalculator(lastdwc) % 3 === 0  : dayDifferenceCalculator(res.startDate) >= 3 && dayDifferenceCalculator(res.startDate) % 3 === 0
    }
    );

    //send mail to the filtered users

    for(let i=0;i<filteredData.length;i++){
        const data = filteredData[i].dwcData

        let lastdwc;
        if(data.length !==0){
            lastdwc =  data[data.length-1].date;

        }
        console.log("--------------------------------->")
        console.log("Sending not participating mail to")
        console.log(response[i].emailId)
        console.log("Date" + new Date());
        console.log("<---------------------------------")

        sendNotParticipatinMail({
            name:filteredData[i].name,
            emailId:filteredData[i].emailId,
            challengeName:filteredData[i].challengename,
            totalInactiveDays:data.length !== 0 ? dayDifferenceCalculator(lastdwc) : dayDifferenceCalculator(filteredData[i].startDate)
        })
    }
    
    await CronTrackerForNotParticipating.create({
        response:{
            success:true,
            jsonData: filteredData
        },
    })
    

    res.send(filteredData)
    // const fd = filteredData[2];

    // const data = fd.dwcData
    // if(data.length !== 0){
    //     res.send(data[data.length-1].date)

    // }else{
    //     res.send("Data not avaialable")
    // }
    




}


exports.checkAllChallengesOfUser = async(req,res) =>{
    try {
        const cudata = await CUConnections.find({
            
            'challengeStatus.status': 0
        })

        // console.log(cudata)

        

        if(cudata.length === 0){
            return res.send("No user ")
        }

        // now Traverse the cudata and check if currentData exceeded any of the expectedEnds;
        let dataArr = [];
        for (var i = 0; i < cudata.length; i++) {
            
            if(!cudata[i].expectedEnd){
               
                continue;
            }
            
            if (checkExceeded(cudata[i].expectedEnd) === 2) {
               
                //check the performance to mark the challenge with correct status
                let score = await performanceCalcAlgorithm(cudata[i]);

                if (score > 60) {
                   
                    await CUConnections.findByIdAndUpdate(cudata[i]._id, {
                        challengeStatus: {
                            status: 1,
                            statusChanged: moment(cudata[i].expectedEnd).add(1, 'days'),
                            score: score,
                        }
                    })
                    dataArr.push({ id: cudata[i]._id, score: score, status: "Passed" })
                }
                else {
                    

                    await CUConnections.findByIdAndUpdate(cudata[i]._id, {
                        challengeStatus: {
                            status: 2,
                            statusChanged: moment(cudata[i].expectedEnd).add(1, 'days'),
                            score: score,
                        }
                    },
                    )
                    dataArr.push({ id: cudata[i]._id, score: score, status: "Passed" })
                }
            } else {
            
            }


        }

        await CronTrackerForCuDataCheck.create({
            response:{
                success:true,
                jsonData: dataArr
            },
        })


        res.send(dataArr)
   
    } catch (error) {
        res.send(error)
    }
}