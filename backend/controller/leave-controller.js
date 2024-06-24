const {
  emailinUserTable,
  addLeaves,
  getLeavsData,
  getAllLeavsData,
  updateJWTToken,
  executeDynamicSQLByTable,
  executeDynamicSQL,
  removeLeaves,
  pendingLeaves,
} = require("../models/auth");
const { groupedByEmail } = require("../controller/utils/groupedByEmail");
const { checkLeaveStatus } = require("../controller/utils/getLeaveStatus");
const { verifyAuth,  } = require("../controller/utils/verify-cookies");
const { getCurrentYear } = require("../controller/utils/date-time");


const officeLeave = async (req, res) => {
  try {
    if (req.cookies.emp_login) {
      const email = verifyAuth(req.cookies.emp_login);
      
      const yearVal = getCurrentYear(req.query.y);

      const getLeavsSql = `SELECT DISTINCT employee_leaves.sno , employee_leaves.emp_id, employee_leaves.email, employee_leaves.emp_leave_date, employee_leaves.day_type, myl_employee.name, emp_annual_records.total_leaves, emp_annual_records.extra_leaves FROM employee_leaves INNER JOIN myl_employee ON employee_leaves.emp_id = myl_employee.id INNER JOIN emp_annual_records ON myl_employee.email = emp_annual_records.email WHERE leave_approved = true AND myl_employee.email = ? AND emp_annual_records.year=${yearVal.currentYear} AND emp_leave_date LIKE '__-__-${yearVal.currentYear}' ORDER BY myl_employee.name ASC`;
      let LeavsData = await executeDynamicSQL(getLeavsSql, email);
      
      const getleavDataCount = `SELECT * FROM emp_annual_records WHERE email = ? AND year = ${yearVal.currentYear}`;
      let leavDataCount = await executeDynamicSQL(getleavDataCount,email);

      let fullDayCount = 0;
      let halfDayCount = 0;

      LeavsData.forEach((record) => {
        if (record.day_type === "full-day") {
          fullDayCount += 1;
        } else if (record.day_type === "half-day") {
          halfDayCount += 1;
        }
      });

      if(LeavsData.length < 1){

        LeavsData = [
          {
            sno: 0,
            emp_id: leavDataCount[0].emp_id,
            email: leavDataCount[0].email,
            emp_leave_date: '',
            day_type: '',
            name: leavDataCount[0].name,
            total_leaves: leavDataCount[0].total_leaves,
            extra_leaves: leavDataCount[0].extra_leaves
          }
        ]

      }

      let totalLeaveTakenCount = fullDayCount + halfDayCount / 2;
      let remainingLeaves = leavDataCount.length < 1 ? 0 : leavDataCount[0].total_leaves + leavDataCount[0].extra_leaves - totalLeaveTakenCount;
      


      res.render("leavePage", {
        email: email,
        LeavsData: LeavsData,
        totalLeaveTakenCount: totalLeaveTakenCount,
        remainingLeaves: remainingLeaves,
        adminData: req.session.user_data,
        yearVal: yearVal,
      });
      
    } else {
      res.redirect("/login");
    }
  } catch (error) {
    console.error(error)
    res.send(error);
  }
};

const viewLeaves = async (req, res) => {
  try {
    if (req.cookies.emp_login) {

      let privilegeData ='';
      if (req.session.user_data && req.session.user_data.p1) {
        privilegeData = JSON.parse(req.session.user_data.p1);
      } else {
        console.log('Data not present or undefined.');
      }

      const email = verifyAuth(req.cookies.emp_login);
      const yearVal = getCurrentYear(req.query.y);

      // let LeavsData = await getLeavsData(email);
      const getLeavsSql = `SELECT employee_leaves.sno, employee_leaves.emp_id, employee_leaves.email, employee_leaves.emp_leave_date, employee_leaves.day_type , myl_employee.total_leaves , myl_employee.extra_leaves, myl_employee.name  FROM employee_leaves INNER JOIN myl_employee ON employee_leaves.emp_id =  myl_employee.id WHERE leave_approved = true AND myl_employee.email = ? AND emp_leave_date LIKE '__-__-${yearVal.currentYear}' ORDER BY myl_employee.name ASC`;
      let LeavsData = await executeDynamicSQL(getLeavsSql, email);

      let leavDataCount = await emailinUserTable(email);
      let is_admin;

      let fullDayCount = 0;
      let halfDayCount = 0;

      LeavsData.forEach((record) => {
        if (record.day_type === "full-day") {
          fullDayCount += 1;
        } else if (record.day_type === "half-day") {
          halfDayCount += 1;
        }
      });

      let totalLeaveTakenCount = fullDayCount + halfDayCount / 2;

      let remainingLeaves =
        leavDataCount[0].total_leaves - totalLeaveTakenCount;

      let isUserExist = await emailinUserTable(email);

      if (
        isUserExist[0].is_admin == "admin" ||
        isUserExist[0].is_admin == "read_only_admin" ||
        privilegeData.ReadAdmin == true
      ) {
        let allLeavsData = await getAllLeavsData(yearVal.currentYear);

        const dataGroupedByEmail = allLeavsData.reduce((acc, user) => {
          if (!acc[user.email]) {
            acc[user.email] = [];
          }
          acc[user.email].push(user);

          return acc;
        }, {});

        allLeavsData = generateLeveCount(dataGroupedByEmail);

        // ___________________ Pending Leaves _______________________________

        const pendingLeavesSql = `SELECT employee_leaves.sno, employee_leaves.emp_id, employee_leaves.email, employee_leaves.emp_leave_date, employee_leaves.day_type , myl_employee.total_leaves , myl_employee.extra_leaves, myl_employee.name FROM employee_leaves INNER JOIN myl_employee ON employee_leaves.emp_id =  myl_employee.id WHERE leave_approved = false`;
        let empPendingLeaves = await executeDynamicSQLByTable(pendingLeavesSql);
        empPendingLeaves = groupedByEmail(empPendingLeaves);

        // ___________________ Pending Leaves _______________________________

        // ___________________ Pending Leaves _______________________________

        const cancellationLeavesSql = `SELECT employee_leaves.sno, employee_leaves.emp_id, employee_leaves.email, employee_leaves.emp_leave_date, employee_leaves.day_type , myl_employee.total_leaves , myl_employee.extra_leaves, myl_employee.name  FROM employee_leaves INNER JOIN myl_employee ON employee_leaves.emp_id =  myl_employee.id WHERE leave_approved = -1`;
        let empCancellationLeaves = await executeDynamicSQLByTable(
          cancellationLeavesSql
        );
        empCancellationLeaves = groupedByEmail(empCancellationLeaves);

        // ___________________ Pending Leaves _______________________________

        // Loop through the outer object
        for (const key in dataGroupedByEmail) {
          // Access the nested array
          const nestedArray = dataGroupedByEmail[key];

          // Loop through the nested array
          nestedArray.sort((a, b) => {
            // Check if emp_leave_date is present and not null/undefined
            if (a.emp_leave_date && b.emp_leave_date) {
              const dayA = parseInt(a.emp_leave_date.split("-")[0], 10);
              const dayB = parseInt(b.emp_leave_date.split("-")[0], 10);

              return dayA - dayB;
            }

            // Handle the case where emp_leave_date is missing or null/undefined
            // You might want to customize this based on your requirements
            return 0;
          });
        }

        // Loop through the outer object
        for (const key in dataGroupedByEmail) {
          // Access the nested array
          const nestedArray = dataGroupedByEmail[key];

          // Loop through the nested array
          nestedArray.sort((a, b) => {
            // Check if emp_leave_date is present and not null/undefined
            if (a.emp_leave_date && b.emp_leave_date) {
              const dayA = parseInt(a.emp_leave_date.split("-")[1], 10);
              const dayB = parseInt(b.emp_leave_date.split("-")[1], 10);

              return dayA - dayB;
            }

            // Handle the case where emp_leave_date is missing or null/undefined
            // You might want to customize this based on your requirements
            return 0;
          });
        }

        return res.render("view-leave", {
          login_email: email,
          LeavsData: LeavsData,
          totalLeaveTakenCount: totalLeaveTakenCount,
          remainingLeaves: remainingLeaves + leavDataCount[0].extra_leaves,
          allLeavsData: dataGroupedByEmail,
          admin: isUserExist[0],
          empPendingLeaves: empPendingLeaves,
          empCancellationLeaves: empCancellationLeaves,
          adminData: req.session.user_data,
          yearVal: yearVal,
          privilegeData:privilegeData
        });
      }

      return res.render("view-leave", {
        login_email: email,
        LeavsData: LeavsData,
        totalLeaveTakenCount: totalLeaveTakenCount,
        remainingLeaves: remainingLeaves + leavDataCount[0].extra_leaves,
        admin: false,
        allLeavsData: "",
        adminData: req.session.user_data,
        yearVal: yearVal,
        privilegeData:privilegeData
      });
    } else {
      return res.redirect("/login");
    }
  } catch (error) {
    console.log(error);
    return res.status(400).json({ error });
  }
};

const submitLeaves = async (req, res) => {
  try {
    const DATA = req.body.data;
    const USER_EMAIL = req.body.user_email;

    let isUserExist = await emailinUserTable(req.body.user_email);
    let LeavsData = await pendingLeaves(req.body.user_email);

    const foundDates = DATA.filter((checkDate) =>
      LeavsData.some((entry) => entry.emp_leave_date === checkDate.date)
    );

    // Filter DATA to only have dates that aren't in foundDates
    const submittableDates = DATA.filter(
      (checkDate) =>
        !foundDates.some((foundDate) => foundDate.date === checkDate.date)
    );

    if (submittableDates.length > 0) {
      const r = await addLeaves(
        submittableDates,
        USER_EMAIL,
        isUserExist[0].id
      );
    }

    res.status(200).json(foundDates);
  } catch (error) {
    console.error("Error processing /submit-leaves:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const removeEmpLeaves = async (req, res) => {
  try {
    const DATA = req.body.data;
    const USER_EMAIL = req.body.user_email;
    let message = "";

    let isUserExist = await emailinUserTable(req.body.user_email);

    const sql = `SELECT employee_leaves.sno, employee_leaves.emp_id, employee_leaves.email, employee_leaves.emp_leave_date, employee_leaves.day_type , myl_employee.total_leaves , myl_employee.extra_leaves, myl_employee.name  FROM employee_leaves INNER JOIN myl_employee ON employee_leaves.emp_id =  myl_employee.id WHERE leave_approved = 1 AND myl_employee.email = ?`;

    let LeavsData = await executeDynamicSQL(sql, USER_EMAIL);

    const removableDates = DATA.filter((checkDate) =>
      LeavsData.some((entry) => entry.emp_leave_date === checkDate.date)
    );

    const nonExistDates = DATA.filter(
      (checkDate) =>
        !removableDates.some((foundDate) => foundDate.date === checkDate.date)
    );

    if (removableDates.length > 0) {
      const r = await removeLeaves(
        removableDates,
        USER_EMAIL,
        isUserExist[0].id
      );

      message = `Cancellation request submitted`;
    } else {
      message = `The leave you're trying to cancel does not exist`;
    }

    return res.status(200).json({ dates: nonExistDates, message: message });
  } catch (error) {
    console.error("Error processing /submit-leaves:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

function generateLeveCount(data) {
  Object.keys(data).forEach((email) => {
    let fullDayCount = 0;
    let halfDayCount = 0;

    data[email].forEach((record) => {
      if (record.day_type === "full-day") {
        fullDayCount += 1;
      } else if (record.day_type === "half-day") {
        halfDayCount += 1;
      }
    });

    if (data[email].length > 0) {
      let totalLeaveTakenCount = fullDayCount + halfDayCount / 2;
      let remainingLeaves = data[email][0].total_leaves - totalLeaveTakenCount;

      data[email]["totalLeaveTakenCount"] = totalLeaveTakenCount;
      data[email]["remainingLeaves"] =
        remainingLeaves + data[email][0].extra_leaves;
      data[email]["totalLeaves"] = data[email][0].total_leaves;
      data[email]["extraLeaves"] = data[email][0].extra_leaves;
    }
  });

  return data;
}

module.exports = { officeLeave, viewLeaves, removeEmpLeaves, submitLeaves };
