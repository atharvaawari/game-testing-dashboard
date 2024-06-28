const ob = require("../models/auth");
const { format } = require('date-fns');

const {
  emailinUserTable,
  addLeaves,
  getLeavsData,
  getAllLeavsData,
  insertNewUser,
  updatePassword,
  updateJWTToken,
  executeDynamicSQL,
  executeDynamicSQLByTable,
  pendingLeaves
} = require("../models/auth");


const markAttendance = async (req, res) => {
  try {

    const currentDate = format(new Date(), 'dd-MM-yyyy');

    // ____________________ check data is already present or not _____________________

    const dateCheckSQL = `SELECT * FROM attendance WHERE date = ? AND emp_email = ?`;
    const dateCheckValue = [currentDate, req.session.user_data.email];

    const qr = await executeDynamicSQL(dateCheckSQL, dateCheckValue);

    // ____________________ check data is already present or not _____________________

    if (!qr.length > 0) {

      const voteData = await voteStatusAttendance(req.session.user_data.email, currentDate);


      // console.log(" vote data ",voteData)

      if (!voteData.length > 0) {

        const markAttSQL = `INSERT INTO attendance(emp_email, date, attendance_status) VALUES (?,?,?)`;
        const markAttValue = [req.session.user_data.email, currentDate, 1];

        const qr = await executeDynamicSQL(markAttSQL, markAttValue);

        if (qr.affectedRows > 0) {
          message = `Attendance marked`;
        } else {
          message = `something went wrong please try again`;
        }

        return res.status(200).json({
          Success: message
        });

      } else {

        return res.status(200).json({
          Success: 'Vote for all ideas to mark attendance'
        });
      }

    } else {

      return res.status(200).json({
        Success: `something went wrong please try again`
      });

    }

  } catch (error) {
    console.error(error);
    res.status(400).send({ message: "Error -- ", error });
  }
};

const getAttendance = async (req, res) => {
  try {

    const currentDate = format(new Date(), 'dd-MM-yyyy');

    const getAttSQL = `SELECT * FROM attendance WHERE date = ? AND emp_email = ?`;
    const getAttValue = [currentDate, req.session.user_data.email];
    const attendanceData = await executeDynamicSQL(getAttSQL, getAttValue);

    // ------------------------- get count who not like ideas ----------------------------

    const alllikesCountByEmailSql = `
      SELECT
      myl_employee.name,
      myl_employee.email,
      CASE
          WHEN COUNT(attendance.emp_email) > 0 THEN 1
          ELSE 0
      END AS attendance_status
  FROM
      myl_employee
  LEFT JOIN
      attendance ON myl_employee.email = attendance.emp_email AND attendance.date = '${currentDate}'
  GROUP BY
      myl_employee.name, myl_employee.email;
  `;
    let countUsersWithNoLikes = await executeDynamicSQLByTable(alllikesCountByEmailSql);

    countUsersWithNoLikes = countUsersWithNoLikes.filter(row => row.attendance_status === 0);

    console.log(countUsersWithNoLikes)

    // ------------------------- get count who not like ideas ----------------------------

    return res.status(200).json({ data: attendanceData, countUsersWithNoLikes: countUsersWithNoLikes });

  } catch (error) {
    console.error(error);
    res.status(400).send({ message: "Error -- ", error });
  }
};

const voteStatusAttendance = async (userEmail, currentDate) => {

  try {
    const getIdeaInnoSql = `
    SELECT
      i.id AS idea_id,
      i.idea,
      COUNT(il.id) AS likes_count,
      MAX(CASE WHEN il.email = '${userEmail}'  THEN il.vote END) AS vote,
      CASE
        WHEN MAX(CASE WHEN il.email = '${userEmail}'  THEN il.vote END) > 0 THEN '1'
        WHEN MAX(CASE WHEN il.email = '${userEmail}'  THEN il.vote END) < 0 THEN '-1'
          WHEN MAX(CASE WHEN il.email = '${userEmail}'  THEN il.vote END) = 0 THEN '0'
        ELSE 'No Vote'
      END AS user_vote
    FROM
      idea_innovation i
    LEFT JOIN
      idea_inno_likes il ON i.id = il.idea_id
    GROUP BY
      i.id, i.idea;
    `;

    const ideasInnovation = await executeDynamicSQLByTable(getIdeaInnoSql);

    const ideasInnovationStringified = ideasInnovation.map((idea) => ({
      ...idea,
      likes_count: Number(idea.likes_count),
      vote: Number(idea.vote) ? Number(idea.vote) : null,
    }));

    // Filter the array to get only objects where vote is null
    const objectsWithNullVote = ideasInnovationStringified.filter(item => item.user_vote === 'No Vote');
    return objectsWithNullVote

  } catch (error) {
    console.error(error.message);

  }

}

module.exports = {
  markAttendance,
  getAttendance
};