const mongoose = require("mongoose");
const CUConnectionSchema = mongoose.Schema({
    challengeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "challenges"
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    startDate: {
        type: Date
    },
    includeStartDate: {
        type: Boolean,
        default: false
    },
    expectedEnd: {
        type: Date,
        default: function () {
            if (this.startDate && this.totalnoOfDays) {
                let endDate = new Date(this.startDate);
                if (this.includeStartDate === true) {
                    endDate.setDate(endDate.getDate() + this.totalnoOfDays - 1);
                } else {
                    endDate.setDate(endDate.getDate() + this.totalnoOfDays);
                }
                return endDate;
            }
        }
    },
    totalnoOfDays: {
        type: Number,
    },
    completedTotaldays: {
        type: Number,
        default: 0
    },
    DayWisecompletedOn: [
        {
            date: {
                type: Date,
            },
            dayNumber: {
                type: Number
            },
            status: {
                type: Boolean,
                default: false
            },
            notes:{
                type:String,
            }

        }
    ],

    challengeStatus: {
        status: {
            type: Number,
            default: 0,   //0 ---> Ongoing , 1:Completed , 2:Failed
        },
        statusChanged: {
            type: Date
        },
        score:{
            type:Number,
        }
    },
    selectedLevel:{
        type:String,
        enum:{
            values:["Easy" , "Medium" , "Hard" , "Custom"]
        },
        default:"Medium"
    }



})



const CUConnection = mongoose.model("cu_connections", CUConnectionSchema);


module.exports = CUConnection;
