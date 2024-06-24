const {
  executeDynamicSQL,
  getLeavsData,
  getAllLeavsData,
  executeDynamicSQLByTable,
} = require("./../../models/auth");
const { getCurrentYear } = require("./date-time");

const checkLeaveStatus = async () => {
  const todayLeaveData = await getTodayLeaves();

  const tomorrowLeaveData = await getNext14DaysLeaves();

  return { todayLeaveData, tomorrowLeaveData };
};

async function getNext14DaysLeaves() {
  const tomorrowDateValue = tomorrowDate();

  const next14Dates = getNext14Dates(tomorrowDateValue);

  const yearVal = getCurrentYear();

  const sql = `
  SELECT DISTINCT myl_employee.name,myl_employee.email
FROM employee_leaves
INNER JOIN myl_employee ON myl_employee.email = employee_leaves.email 
WHERE employee_leaves.emp_leave_date IN (?,?,?,?,?,?,?,?,?,?,?,?,?,?) AND employee_leaves.emp_leave_date LIKE '__-__-${yearVal.currentYear}' AND JSON_CONTAINS(myl_employee.p1, '{"Employee":true}', '$') = 1 AND employee_leaves.leave_approved = 1 ORDER BY myl_employee.name ASC`;

  const leaveData = await executeDynamicSQL(sql, next14Dates);

  const getLeaveDataSql = `SELECT employee_leaves.sno, employee_leaves.emp_id, employee_leaves.email, employee_leaves.emp_leave_date, employee_leaves.day_type , myl_employee.total_leaves , myl_employee.extra_leaves, myl_employee.name, myl_employee.penalty FROM employee_leaves INNER JOIN myl_employee ON employee_leaves.emp_id = myl_employee.id WHERE employee_leaves.leave_approved = true AND employee_leaves.emp_leave_date LIKE '__-__-${yearVal.currentYear}' AND JSON_CONTAINS(myl_employee.p1, '{"Employee":true}', '$') = 1`;

  let allLeavsData = await executeDynamicSQLByTable(getLeaveDataSql);

  const dataGroupedByEmail = allLeavsData.reduce((acc, user) => {
    if (!acc[user.email]) {
      acc[user.email] = [];
    }
    acc[user.email].push(user);

    return acc;
  }, {});

  const matchingData = [];

  leaveData.forEach((emailInfo) => {
    const dataForEmail = dataGroupedByEmail[emailInfo.email];
    if (dataForEmail) {
      matchingData.push({
        [emailInfo.name]: dataForEmail,
      });
    }
  });

  // Sort by day
  sortByDatePart(matchingData, 0);

  // Sort by month
  sortByDatePart(matchingData, 1);

  // Sort by year
  sortByDatePart(matchingData, 2);

  return matchingData;
}

async function getTodayLeaves() {
  const todayDateValue = todayDate();

  const sql = `
  SELECT employee_leaves.emp_leave_date, employee_leaves.day_type , myl_employee.name
  FROM employee_leaves
  INNER JOIN myl_employee ON myl_employee.email = employee_leaves.email
  WHERE employee_leaves.emp_leave_date IN (?) AND JSON_CONTAINS(myl_employee.p1, '{"Employee":true}', '$') = 1 AND employee_leaves.leave_approved = 1 ORDER BY myl_employee.name ASC
  `;

  return await executeDynamicSQL(sql, [todayDateValue]);
}

function tomorrowDate() {
  const currentDate = new Date();
  currentDate.setDate(currentDate.getDate() + 1);

  const day = String(currentDate.getDate()).padStart(2, "0");
  const month = String(currentDate.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so add 1
  const year = currentDate.getFullYear();

  return `${year}-${month}-${day}`;
}

function todayDate() {
  const currentDate = new Date();
  return formatDate(currentDate);
}

function formatDate(date) {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based, so add 1
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

function getNext14Dates(startDate) {
  const dates = [];
  const formattedDates = [];
  const currentDate = new Date(startDate);

  for (let i = 0; i < 14; i++) {
    const nextDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() + i
    );
    dates.push(nextDate);
  }

  for (const date of dates) {
    const day = String(date.getDate()).padStart(2, "0"); // Ensure double-digit day
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Ensure double-digit month
    const formattedDate = `${day}-${month}-${date.getFullYear()}`;
    formattedDates.push(formattedDate);
  }

  return formattedDates;
}

function sortByDatePart(entries, partIndex) {
  entries.forEach((entry) => {
    Object.keys(entry).forEach((key) => {
      entry[key].sort((a, b) => {
        const datePartA = parseInt(a.emp_leave_date.split("-")[partIndex], 10);
        const datePartB = parseInt(b.emp_leave_date.split("-")[partIndex], 10);
        return datePartA - datePartB;
      });
    });
  });
}

module.exports = {
  checkLeaveStatus,
};
