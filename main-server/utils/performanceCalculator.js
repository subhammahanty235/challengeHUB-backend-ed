const CUConnection = require('../models/challenge_user_connection.model')
const { UTCtoIST, dayDifferenceCalculator } = require('../utils/dateHelpers')
// const moment = require('moment-timezone');

exports.performanceCalcAlgorithm = (cuData) => {
   
    try {
     
        // calculate total days passed from join date;
       
        const includeStartDay = cuData.includeStartDate;
        const dayWiseCompleted = cuData.DayWisecompletedOn
        
        const totalnoOfDays = cuData.totalnoOfDays;

        const sdTocd = dayDifferenceCalculator(cuData.startDate);
       

        //base case 1 : if startDate === currentDate and also includeStartDate is false, then we can show user 0% performance ;
        if ((sdTocd == 0) && includeStartDay === false) {
            return 0;
        }

        //base case 2 : if startDate === currentDate and includeStartDate is true, then there's will be two cases:
        //case 1: user has marked respected as as completed,then we can show user 100 points
        //case 2: user has not marked respectedDate as completed, then point will be 0,

        if ((sdTocd == 0) && includeStartDay === true) {
            //get the first element or data from daywiseCompleted,
            const firstData = dayWiseCompleted[0];
            
            if (!firstData) {
                return 0;
            } else {
                //check if index 0 holds the currentDate
                const completedDate = UTCtoIST(firstData.date);
                if (dayDifferenceCalculator(completedDate) === 0) {
                    return 100;
                }

            }
        }

        //now normal cases to calculate the score based on date and days


        // now calculate how many days from the startDate to currentDate user has completed the tasks
        const dayNumbers = new Set(dayWiseCompleted.map((obj) => obj.dayNumber));
        //initialize the result array to store o and 1 to indicate if complted or not
        const counts = { 0: 0, 1: 0 };

        
        let c = 0;
        for (var i = 0; i < (sdTocd < totalnoOfDays ? sdTocd : totalnoOfDays); i++) {

            dayNumbers.has(i) ? counts[1]++ : counts[0]++;
            c++;



        }
        // calculate the score based on the number of 0 and 1;
        const num1 = counts[1];
        const num0 = counts[0];
       
        let finalScore;
        if (num1 === num0) {
            finalScore = 50;
        } else if (num0 > num1 && num1 === 0) {
            finalScore = 0;
        }
        else {

            const max_score_till_day = 100/(Math.min(sdTocd, totalnoOfDays));

            

            let score1 = max_score_till_day * num1;
            let score2 = num0 * (max_score_till_day * 0.25);
            if (num0 >= 2 * num1) {
                
                
                let calculatedScore = score1 ;
                return Math.round(calculatedScore)
                // score2 = num0 * (max_score_till_day * 0.8);
            } else if (num0 > num1) {
                
                score2 = num0 * (max_score_till_day * 0.4)
            }

            finalScore = Math.round(Math.abs(score1 - score2));
            
        }

        
        return finalScore;
        // res.json({ score: finalScore, resultArray: counts, startDate: startDate, currentDate: currentDate, expectedEnd: expectedEnd, dayWise: dayWiseCompleted });

    } catch (error) {
        console.log(error.message)
    }
}


exports.performanceCalcAlgorithm2 = async (req, res) => {
    try {
        const cuid = req.params.cid;
        const cuData = await CUConnection.findOne({ _id: cuid });
        
        // calculate total days passed from join date;
        const startDate = UTCtoIST(cuData.startDate);
        const expectedEnd = UTCtoIST(cuData.expectedEnd);
        const currentDate = UTCtoIST(new Date());
        const includeStartDay = cuData.includeStartDate;
        const dayWiseCompleted = cuData.DayWisecompletedOn;
        const totalnoOfDays = cuData.totalnoOfDays;

        const sdTocd = dayDifferenceCalculator(cuData.startDate);


        //base case 1 : if startDate === currentDate and also includeStartDate is false, then we can show user 100% performance ;
        if ((startDate === currentDate) && includeStartDay === false) {
            res.send("100")
        }

        //base case 2 : if startDate === currentDate and includeStartDate is true, then there's will be two cases:
        //case 1: user has marked respected as as completed,then we can show user 100 points
        //case 2: user has not marked respectedDate as completed, then point will be 0,

        if ((startDate === currentDate) && includeStartDay === true) {
            //get the first element or data from daywiseCompleted,
            const firstData = dayWiseCompleted[0] && null;
            if (!firstData) {
                return 0;
            } else {
                //check if index 0 holds the currentDate
                const completedDate = UTCtoIST(firstData.date);
                if (completedDate === currentDate) {
                    res.send(100);
                }

            }
        }

        //now normal cases to calculate the score based on date and days


        // now calculate how many days from the startDate to currentDate user has completed the tasks
        const dayNumbers = new Set(dayWiseCompleted.map((obj) => obj.dayNumber));



        //initialize the result array to store o and 1 to indicate if complted or not
        const counts = { 0: 0, 1: 0 };

        // testing code -----> 
        const nextDay = new Date(startDate);
        nextDay.setDate(startDate.getDate() + 1);
        
        let dates = [];
         // const includeStartDay = true;
        let date = includeStartDay ? startDate : nextDay;
        

        // <----------
        for (var i = 0; i < (sdTocd < totalnoOfDays ? sdTocd : totalnoOfDays); i++) {
            dayNumbers.has(i) ? counts[1]++ : counts[0]++;
            // test code ---------------->

            
            const formattedDate = date.toISOString().split('T')[0];
            const dwcData = dayWiseCompleted.find((data) => data.dayNumber === i)

            let notes;
            if (dwcData !== undefined) {
                notes = dwcData.notes;
            } else {
                notes = null;
            }

            dates.push({ date: formattedDate, dayStatus: dayNumbers.has(i) ? 1 : 0, index: i, notes: notes });
            date.setDate(date.getDate() + 1);
            //  <-------------------------

        }
        // calculate the score based on the number of 0 and 1;
        const num1 = counts[1];
        const num0 = counts[0];
        let finalScore;
        if (num1 === num0) {
            finalScore = 50;
        } else if (num0 > num1 && num1 === 0) {
            finalScore = 0;
        }
        else {

            const max_score_till_day = 100 / Math.min(sdTocd, totalnoOfDays);

            let score1 = max_score_till_day * num1;
            let score2 = num0 * (max_score_till_day * 0.8);
            if (num0 >= 2 * num1) {
                
                score2 = num0 * (max_score_till_day * 0.1);
            } else if (num0 > num1) {
                
                score2 = num0 * (max_score_till_day * 0.4)
            }



            finalScore = Math.round(Math.abs(score1 - score2));
        }

        res.json({ dates: dates, score: finalScore, resultArray: counts, startDate: startDate.toISOString().split('T')[0], currentDate: currentDate.toISOString().split('T')[0], expectedEnd: expectedEnd, dayWise: dayWiseCompleted });

    } catch (error) {
        console.log(error.message)
    }
}
