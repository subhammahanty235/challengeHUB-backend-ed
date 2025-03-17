const { startOfDay, differenceInDays, isFriday, isDate } = require('date-fns');
const { utcToZonedTime } = require('date-fns-tz');
const moment = require('moment-timezone')
exports.dayDifferenceCalculator = (startDate) => {
  // console.log(" day diff--------------------------------->>>>>>>>>>>>>>>>>>>>>")
  // console.log(startDate)
  // console.log(" day diff<<<<<<<<<<<<<<<--------------------------------->>>>>")

  const startDateUTC = new Date(startDate);
  const currentDateUTC = new Date();
  // console.log(startDate)


  // Convert to Asia/Kolkata time zone
  const timeZoneIST = 'Asia/Kolkata';
  const startDateIST = utcToZonedTime(startDateUTC, timeZoneIST);
  // const startDateIST = startDateUTC
  const currentDateIST = utcToZonedTime(currentDateUTC, timeZoneIST);

  // console.log("inside day difference function")
  // console.log("startDateIst"+ startDateIST);
  // console.log("cuurent"+ currentDateIST)
  // console.log("day differnce function complteed")


  // Set time components to zero for both dates
  const startDateISTStartOfDay = startOfDay(startDateIST);
  const currentDateISTStartOfDay = startOfDay(currentDateIST);


  const dayDifferenceIST = differenceInDays(currentDateISTStartOfDay, startDateISTStartOfDay);
  //   console.log(dayDifferenceIST);
  return dayDifferenceIST;
};

exports.UTCtoIST = (date) => {
  const dateIST = moment(date).tz('Asia/Kolkata');
  // const utcDate = new Date(date);
  // //convert to Asia/Kolkata time zone
  // const timeZoneIST = 'Asia/Kolkata';
  // const dateIST = utcToZonedTime(utcDate, timeZoneIST);
  // console.log(dateIST)
  // const formattedDate = dateIST.format('YYYY-MM-DD HH:mm:ss');
  // return formattedDate;/
  return dateIST
}

exports.checkExceeded =(date) => {
  const istDate = moment(date).tz('Asia/Kolkata');
  const currentDateIST = moment().tz('Asia/Kolkata');
  istDate.set({ hour: 23, minute: 59, second: 59, millisecond: 999 });
  if (currentDateIST.isSameOrAfter(istDate)) {
    return 2;
  } else {
    return 3;
  }
}

