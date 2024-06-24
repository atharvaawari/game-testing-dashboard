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
} = require("../models/auth");
const {format} = require('date-fns');

const addIdeaInnovation = async (req, res) => {
  try {

    addTasksql = `INSERT INTO idea_innovation(email, idea) VALUES (?,?)`;
    addTaskValues = [req.session.user_data.email, req.body[0].YourIdea.trim()];

    let qr = await executeDynamicSQL(addTasksql, addTaskValues);

    if (qr.affectedRows > 0) {
      message = `idea added`;
    } else {
      message = `something went wrong please try again`;
    }

    res.status(200).json({
      Success: message,
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error -- ", error });
  }
};

const addLikeDislike = async (req, res) => {
  try {

    const currentDate = format(new Date(), 'dd-MM-yyyy');

    let action = req.body[0];
    let actionCount = 0;

    if (action == "like") {
      actionCount = 1;
    } else if(action == 'dislike') {
      actionCount = -1;
    }else{
      actionCount = 0;
    }

    const checkSql = `SELECT * FROM idea_inno_likes WHERE email = ? AND idea_id = ? `;
    let user = await executeDynamicSQL(checkSql, [req.body[2], req.body[1]]);

    if (user.length > 0) {
      let updateLikeDataSql = `UPDATE idea_inno_likes SET vote = ? WHERE email = ? AND idea_id = ? `;

        await executeDynamicSQL(updateLikeDataSql, [
          actionCount,
          req.body[2],
          req.body[1]
        ]);
     
    } else {
      const addLikeDataSql = `INSERT INTO idea_inno_likes(idea_id, vote, email, date) VALUES (?,?,?,?)`;
      await executeDynamicSQL(addLikeDataSql, [
        req.body[1],
        actionCount,
        req.body[2],
        currentDate
      ]);
    }

    res.status(200).json({
      Success: "Success",
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error -- ", error });
  }
};

const ideasInnovation = async (req, res) => {
  const ideaInnoSql = `
  SELECT
    i.id AS idea_id,
    i.idea,
    COUNT(il.id) AS likes_count,
    COALESCE(MAX(CASE WHEN il.email = '${req.session.user_data.email}' THEN il.vote END), 0) AS user_vote
  FROM
    idea_innovation i
  LEFT JOIN
    idea_inno_likes il ON i.id = il.idea_id
    LEFT JOIN
    myl_employee ON myl_employee.email = i.email WHERE JSON_CONTAINS(myl_employee.p1, '{"Employee":true}', '$') = 1    
  GROUP BY
    i.id, i.idea
`;

  const ideasInnovation = await executeDynamicSQLByTable(ideaInnoSql);

  // Convert BigInt to string before sending the response
  const ideasInnovationStringified = ideasInnovation.map((idea) => ({
    ...idea,
    likes_count: Number(idea.likes_count),
    user_vote: Number(idea.user_vote) ? Number(idea.user_vote) : null,
  }));

  res.status(200).json({
    ideasInnovation: ideasInnovationStringified,
  });
};

const getIdeaInnovation = async (req, res) => {
  try {
    const getIdeaInnoSql = `
SELECT
  i.id AS idea_id,
  i.idea,
  COUNT(il.id) AS likes_count,
  MAX(CASE WHEN il.email = '${req.session.user_data.email}'  THEN il.vote END) AS vote,
  CASE
    WHEN MAX(CASE WHEN il.email = '${req.session.user_data.email}'  THEN il.vote END) > 0 THEN '1'
    WHEN MAX(CASE WHEN il.email = '${req.session.user_data.email}'  THEN il.vote END) < 0 THEN '-1'
      WHEN MAX(CASE WHEN il.email = '${req.session.user_data.email}'  THEN il.vote END) = 0 THEN '0'
    ELSE 'No Vote'
  END AS user_vote
FROM
  idea_innovation i
LEFT JOIN
  idea_inno_likes il ON i.id = il.idea_id
LEFT JOIN
    myl_employee ON myl_employee.email = i.email WHERE JSON_CONTAINS(myl_employee.p1, '{"Employee":true}', '$') = 1  
GROUP BY
  i.id, i.idea;
`;

    const ideasInnovation = await executeDynamicSQLByTable(getIdeaInnoSql);
    
    const ideasInnovationStringified = ideasInnovation.map((idea) => ({
      ...idea,
      likes_count: Number(idea.likes_count),
      vote: Number(idea.vote) ? Number(idea.vote) : -1,
    }));
    
    res.render('ideas-innovation/ideas-innovation', {
      ideasInnoData: ideasInnovationStringified,
      adminData: req.session.user_data
    });

  } catch (error) {
    res.send(error.message);

  }
};

module.exports = {
  ideasInnovation,
  addIdeaInnovation,
  addLikeDislike,
  getIdeaInnovation,
};
