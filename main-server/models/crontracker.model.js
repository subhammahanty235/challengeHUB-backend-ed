const mongoose = require('mongoose');

const CronTrackerSchemaForInActive = mongoose.Schema({
    datetime:{
        type:Date,
        default:new Date()
    },
    response:{
        type:JSON,
    }

})

const CronTrackerForNotParticipatingSchema = mongoose.Schema({
    datetime:{
        type:Date,
        default:new Date()
    },
    response:{
        type:JSON,
    }

})
const CronTrackerForCuDataCheckSchema = mongoose.Schema({
    datetime:{
        type:Date,
        default:new Date()
    },
    response:{
        type:JSON,
    }

})

const CronTrackerInactive = mongoose.model('crontrackerinactive' , CronTrackerSchemaForInActive)
const CronTrackerForNotParticipating = mongoose.model('crontrackernonparticipating' , CronTrackerForNotParticipatingSchema)
const CronTrackerForCuDataCheck= mongoose.model('crontrackercudatacheck' , CronTrackerForCuDataCheckSchema)

module.exports = {CronTrackerForNotParticipating , CronTrackerInactive, CronTrackerForCuDataCheck}