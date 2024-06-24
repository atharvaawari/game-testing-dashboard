const { getISOWeek,format, getMonth, getYear } = require('date-fns');

function weekYearData(req) {

  let currentWeek;
  let prevWeek;
  let nextWeek;

  const currYear = getCurrentYear()

  const weeksInCurrentYear = getWeeksInYear(currYear.currentYear);

  if (req.query.w) {
    currentWeek = req.query.w;
    prevWeek = Number(currentWeek) - 1;
    nextWeek = Number(currentWeek) + 1;
  } else {
    currentWeek = getCurrentWeekNumber();
    prevWeek = Number(currentWeek) - 1;
    nextWeek = Number(currentWeek) + 1;
  }

  let currentWeek1 = getCurrentWeekNumber();

  if (0 > prevWeek) {
    prevWeek = currentWeek1;
  }

  if (
    Number(currentWeek) > weeksInCurrentYear ||
    Number(nextWeek) > weeksInCurrentYear
  ) {
    nextWeek = weeksInCurrentYear;
    currentWeek = weeksInCurrentYear;
  }

  return { currentWeek, prevWeek, nextWeek };
}

function getWeeksInYear(year) {
  const january4th = new Date(year, 0, 4);
  const weekStartAdjustment =
    january4th.getDay() > 0 ? january4th.getDay() - 1 : 6;
  january4th.setDate(january4th.getDate() - weekStartAdjustment);

  return Math.floor(
    (new Date(year + 1, 0, 1) - january4th) / (7 * 24 * 60 * 60 * 1000)
  );
}

function getCurrentWeekNumber() {
  const today = new Date();
  const currentWeekNumber = getISOWeek(today);
  return currentWeekNumber;
}

function getStartAndEndDate(year, week) {
  const startDate = new Date(year, 0, 1 + (week - 1) * 7);
  const endDate = new Date(year, 0, 1 + (week - 1) * 7 + 6);

  // Adjust to Monday of the week
  startDate.setDate(startDate.getDate() - startDate.getDay() + 1);
  endDate.setDate(endDate.getDate() - endDate.getDay() + 7);

  return {
    startDate,
    endDate,
  };
}

function moveItemsToBottom(arr, conditionProperty, conditionValue) {
    let conditionMetItems = arr.filter(item => item[conditionProperty] === conditionValue);
    let otherItems = arr.filter(item => item[conditionProperty] !== conditionValue);
    return otherItems.concat(conditionMetItems);
}

function getTarfetDoneCount(data) {

    let weeklyTargetDone = 0

    data.forEach((entry) => {

      const {
        video,
        shorts,
        post,
        polls,
        comments

      } = entry;
  

      weeklyTargetDone += video;
      weeklyTargetDone += shorts;
      weeklyTargetDone += post;
      weeklyTargetDone += polls;
      weeklyTargetDone += comments;

     });

  
    return weeklyTargetDone;
}

function getCurrentYear(userProvedYear) {
  const currentDate = new Date();
  const currentYear = userProvedYear ? Number(userProvedYear) : getYear(currentDate);
  return {currentYear:currentYear,prevYear:currentYear-1,nextYear:currentYear+1};
}


module.exports = { weekYearData, moveItemsToBottom, getTarfetDoneCount, getCurrentYear}