const ob = require("../models/auth");
const { getISOWeek,format, getMonth } = require('date-fns');
const { verifyAuth } = require("../controller/utils/verify-cookies");
const { weekYearData, getStartAndEndDate, getTaskCountByCategory, moveItemsToBottom } = require("../controller/content-activity-controller");
const {  getCurrentYear } = require("./utils/date-time");

const {
  executeDynamicSQL,
  executeDynamicSQLByTable,
  emailinUserTable
} = require("../models/auth");

const addTaskSheet = async (req, res) => {

  let sql = '';
  let values = '';

  // ______________________________ tesk count ________________________________________

  if(req.body[2].category == 'game'){

    sql = `INSERT INTO task_sheet(title, link, category_name ) VALUES (?,?,?)`;
    values = [req.body[0].Tasksheettitle,req.body[1].Link,req.body[2].category];

  }else{

    sql = `INSERT INTO task_sheet(title, link, week, category_name ) VALUES (?,?,?,?)`;
    values = [req.body[0].Tasksheettitle,req.body[1].Link,req.body[2].CurrentWeek,req.body[3].category];

  }

  await executeDynamicSQL(sql,values);

  // ______________________________ content count ________________________________________

  res.status(200).json({
    success: "success",
  });

};

const deleteTask = async (req, res) =>{

    if (req.cookies.emp_login) {
      const email = verifyAuth(req.cookies.emp_login);
      let user = await emailinUserTable(email);
      req.session.user_email = user[0].email;
      req.session.user_name = user[0].user_name;
      req.session.user_data = user[0];
    }
  
    let privilegeData ='';
    if (req.session.user_data && req.session.user_data.p1) {
      privilegeData = JSON.parse(req.session.user_data.p1);
    } else {
      console.log('Data not present or undefined.');
    }

    console.log(req.body)

  
    let sql = '';
    let values = [];
    
    switch (req.body.targets_category) {
      case 'weekly':
  
         sql = `DELETE FROM week_targets WHERE id = ? AND category_name = ?`;
         values = [Number(req.body.task_id),req.body.category.trim()];
  
        break;
    
      case 'every-week':
  
         sql = `DELETE FROM every_week_targets WHERE id = ? AND category_name = ?`;
         values = [Number(req.body.task_id),req.body.category.trim()];
  
        break;
    
      case 'monthly':
  
         sql = `DELETE FROM monthly_targets WHERE id = ? AND category_name = ?`;
  
         values = [Number(req.body.task_id),req.body.category.trim()];
  
        break;
      
      case 'movable':
  
        sql = `DELETE FROM movable_targets WHERE id = ? AND category_name = ?`;
        values = [Number(req.body.task_id),req.body.category.trim()];
   
        break;  
  
      case 'task-sheet':
        console.log(req.body.targets_category)
        sql = `DELETE FROM task_sheet WHERE id = ? `;
        values = [Number(req.body.task_id)];

      case 'game':
        sql = `DELETE FROM games_tasks WHERE id = ? `;
        values = [Number(req.body.task_id)];  
  
      default:
        console.log(req.body.targets_category)
        sql = `DELETE FROM task_sheet WHERE id = ? `;
        values = [Number(req.body.task_id)];
    }
  
    let qr = await executeDynamicSQL(sql,values);

  
  
    if(qr.affectedRows > 0){
  
      message = `delete`;
  
    } else {
  
      message = `something went wrong please try again`;
  
    }
  
    res.status(200).json({
      Success: message
    });
  
  
};

const getMyTasks = async (req, res) => {

  const { currentWeek, prevWeek, nextWeek} = weekYearData(req);

  const currYear = getCurrentYear()

  const { startDate, endDate } = getStartAndEndDate(currYear.currentYear,currentWeek);

    //_____________________ get Weekly Targets list __________________________

    const weeklyTargetsSql = `SELECT * FROM week_targets WHERE  week = ${currentWeek} AND email= '${req.session.user_data.email }'ORDER BY task_owner ,priority`;

    let getWeeklyTargets = await executeDynamicSQLByTable(weeklyTargetsSql);
  
    //_____________________ get Weekly Targets list __________________________
    //_____________________ get every Weekly Targets list __________________________
  
    const everyWeekTargetsSql = `SELECT * FROM every_week_targets WHERE week = ${currentWeek} AND email= '${req.session.user_data.email }'ORDER BY task_owner ,priority`;
  
    let everyWeekTargets = await executeDynamicSQLByTable(everyWeekTargetsSql);
      
    //_____________________ get every Weekly Targets list __________________________

    let currentMonth = getMonthOfYear();
    
    const startDateMonthNumber = getMonth(startDate)+1;

    if(Number(req.query.w)){

      currentMonth = startDateMonthNumber;

    }

    const monthlyTargetsSql = `SELECT * FROM monthly_targets WHERE month = ${currentMonth} AND email= '${req.session.user_data.email }' ORDER BY task_owner ,priority`;
    let monthlyTargets= await executeDynamicSQLByTable(monthlyTargetsSql);

    //_____________________ get Monthly Targets list __________________________

  
  //_____________________ get movable Weekly Targets list __________________________

  getWeeklyTargets = moveItemsToBottom(getWeeklyTargets, 'is_complete', 1);
  everyWeekTargets = moveItemsToBottom(everyWeekTargets, 'is_complete', 1);
  monthlyTargets = moveItemsToBottom(monthlyTargets, 'is_complete', 1);

  //_____________________ employee task status list __________________________

  //_____________________ get every Weekly Targets list __________________________
  
    const empListSql = `SELECT name,email FROM myl_employee ORDER BY name ASC`;

    let empList = await executeDynamicSQLByTable(empListSql);
  
    //_____________________ get every Weekly Targets list __________________________

    //_____________________ get Games task list __________________________

  const releaseSQL = `SELECT * FROM games_tasks WHERE email= '${req.session.user_data.email }' `;

  let releaseGames = await executeDynamicSQLByTable(releaseSQL);

  releaseGames = moveItemsToBottom(releaseGames, 'is_complete', 1);
  //_____________________ get Games task list __________________________


  res.render('task/my-tasks',{
    adminData:req.session.user_data,
    startDate:startDate,
    endDate:endDate,
    prevWeek:prevWeek,
    nextWeek:nextWeek,
    currentWeek:currentWeek,
    everyWeekTargets:everyWeekTargets,
    getWeeklyTargets:getWeeklyTargets,
    monthlyTargets:monthlyTargets,
    releaseGames:releaseGames,
    empList:empList
  });

};

const checkedMyTask = async (req, res) => {

  
  let sql = '';
  let values = [];
  
  switch (req.body[0].targets_category) {
    case 'weekly':

       sql = `UPDATE week_targets SET is_complete = ? WHERE id = ? `;
       values = [req.body[0].isChecked,req.body[0].id]

      break;
  
    case 'every-week':

       sql = `UPDATE every_week_targets SET is_complete = ? WHERE id = ? `;
       values = [req.body[0].isChecked,req.body[0].id]

      break;
  
    case 'monthly':

       sql = `UPDATE monthly_targets SET is_complete = ? WHERE id = ? `;
       values = [req.body[0].isChecked,req.body[0].id]

      break;

    case 'movable':

      sql = `UPDATE movable_targets SET is_complete = ? WHERE id = ? `;
      values = [req.body[0].isChecked,req.body[0].id]
 
     break;  
      
    case 'game':

     sql = `UPDATE games_tasks SET is_complete = ? WHERE id = ? `;
     values = [req.body[0].isChecked,req.body[0].id,req.body[0].category.trim()]
 
    break;  

    default:
      // Code to execute if variable doesn't match any of the cases
  }

  let qr = await executeDynamicSQL(sql,values);

  if(qr.affectedRows > 0){

    message = `updated`;

  } else {

    message = `something went wrong please try again`;

  }

  res.status(200).json({
    Success: message
  });

};

const getMyTaskCountStatus = async (req, res) => {

  const { currentWeek } = weekYearData(req);

  const currentMonth = getMonthOfYear();

  const count = await getTaskCountByCategory(currentWeek,currentMonth,req.session.user_data.email)

  async function getTaskCountByCategory(week,month,email) {
    const weekCountSql = `
  SELECT
      combined_data.category_name,
      COUNT(CASE WHEN combined_data.is_complete = 1 THEN 1 END) AS completed_count,
      COUNT(CASE WHEN combined_data.is_complete = 0 THEN 1 END) AS not_completed_count
  FROM (
      SELECT category_name, is_complete, email
      FROM week_targets
      WHERE week = ${week} AND email = '${email}'
      UNION ALL
      SELECT category_name, is_complete, email
      FROM every_week_targets
      WHERE week = ${week} AND email = '${email}'
      UNION ALL
      SELECT category_name, is_complete, email
      FROM monthly_targets
      WHERE month = ${month} AND email = '${email}'

      UNION ALL
      SELECT release_title AS category_name, is_complete, email
      FROM games_tasks
      WHERE email = '${email}'

  ) AS combined_data
  JOIN myl_employee ON combined_data.email = myl_employee.email
  WHERE JSON_CONTAINS(myl_employee.p1, '{"Employee":true}', '$') = 1
  GROUP BY combined_data.category_name;
  `;
  
    const count = await executeDynamicSQLByTable(weekCountSql);

    if(count.length<1){
      return { weekCountResult : {
        completed_count: 0,
        not_completed_count:0
      } };
    }
  
    const newArray = count.map((e) => ({
      category_name: Number(e.category_name),
      completed_count: Number(e.completed_count),
      not_completed_count: Number(e.not_completed_count)
    }));
    
    const totals = newArray.reduce((acc, curr) => {
      acc.completed_count += curr.completed_count;
      acc.not_completed_count += curr.not_completed_count;
      return acc;
    }, { completed_count: 0, not_completed_count: 0 });
    
    return totals;

  };
  
  res.status(200).json({
    count: count
  });
    
};

const moveTaskByWeek = async (req, res) => {

  const { week, tastId, category, parentCategory,movetoWeek} = req.body

  let sql = '';
  let values = [];
  
  switch (category) {
    case 'weekly':

       sql = `UPDATE week_targets SET week = ? WHERE id = ? AND category_name = ? AND week = ?`;
       values = [Number(movetoWeek),Number(tastId),parentCategory,Number(week)];

      break;
  
    case 'every-week':

       sql = `DELETE FROM every_week_targets WHERE id = ? AND category_name = ?`;
       values = [Number(req.body.task_id),req.body.category.trim()];

      break;
  
    case 'monthly':

      sql = `UPDATE monthly_targets SET month = ? WHERE id = ? AND category_name = ? AND month = ?`;
      values = [Number(movetoWeek),Number(tastId),parentCategory,Number(week)];
      console.log(values)

      break;
    
    case 'movable':

      sql = `DELETE FROM movable_targets WHERE id = ? AND category_name = ?`;
      values = [Number(req.body.task_id),req.body.category.trim()];
 
      break;  

    case 'task-sheet':
      sql = `DELETE FROM task_sheet WHERE id = ? `;
      values = [Number(req.body.task_id)];

    default:
      // Code to execute if variable doesn't match any of the cases
  }

  let qr = await executeDynamicSQL(sql,values);

  res.status(200).json({
    Success: 'message'
  });
    
};

const loadGamesTask = async (req, res) => {

  try {

    const { currentWeek, prevWeek, nextWeek} = weekYearData(req);

    const currYear = getCurrentYear();
  
    let currentMonth = getMonthOfYear();
  
    const { startDate, endDate } = getStartAndEndDate(currYear.currentYear,currentWeek);
  
    //_____________________ get Games task list __________________________
  
    const releaseSQL = `SELECT * FROM games_tasks `;
  
    let releaseGames = await executeDynamicSQLByTable(releaseSQL);

    releaseGames = moveItemsToBottom(releaseGames, 'is_complete', 1);
  
    let groupedData = releaseGames.reduce((acc, current) => {
      const key = current.release_title; 
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(current);
      return acc;
    }, {});
  
    //_____________________ get Games task list __________________________
  
    const empListSql = `SELECT name,email FROM myl_employee WHERE JSON_CONTAINS(myl_employee.p1, '{"Employee":true}', '$') = 1  ORDER BY name ASC`;
  
    let empList = await executeDynamicSQLByTable(empListSql);
    
    //_____________________ __________________________


    //_____________________ get task sheet list __________________________

    const taskSheetSQL = `SELECT * FROM task_sheet WHERE category_name = 'game' ORDER BY title`;

    let taskSheetData = await executeDynamicSQLByTable(taskSheetSQL);
    
    //_____________________ get task sheet list __________________________

      //_____________________ employee task status list __________________________

  const empTaskStatusSql = `

  SELECT
  combined_data.task_owner,
  combined_data.completed_tasks,
  combined_data.not_completed_tasks,
  myl_employee.email
FROM (
  SELECT
    task_owner,
    email,
    SUM(CASE WHEN is_complete = '1' THEN 1 ELSE 0 END) AS completed_tasks,
    SUM(CASE WHEN is_complete = '0' THEN 1 ELSE 0 END) AS not_completed_tasks
  FROM (
    SELECT task_owner, is_complete, email
    FROM games_tasks
  ) AS combined_data
  GROUP BY task_owner, email  -- Include email in the GROUP BY clause
) AS combined_data
JOIN myl_employee ON combined_data.email = myl_employee.email
WHERE JSON_CONTAINS(myl_employee.p1, '{"Employee":true}', '$') = 1
ORDER BY combined_data.task_owner ASC;


`;

  let empTaskStatus = await executeDynamicSQLByTable(empTaskStatusSql);

  //_____________________ employee task status list __________________________
  
      let resultArray = Object.values(groupedData);

    
    let privilegeData ='';
    if (req.session.user_data && req.session.user_data.p1) {
      privilegeData = JSON.parse(req.session.user_data.p1);
    } else {
      console.log('Data not present or undefined.');
    }
  
    return res.render("task/games-tasks", {
      prevWeek:prevWeek,
      nextWeek:nextWeek,
      currentWeek:currentWeek,
      parentCategory:'game',
      adminData:req.session.user_data,
      privilegeData:privilegeData,
      currentMonth:currentMonth,
      startDate: `${startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} ${startDate.getFullYear()}`,
      endDate: `${endDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} ${endDate.getFullYear()}`,
      empList:empList,
      releaseGames:resultArray,
      taskSheetData:taskSheetData,
      empTaskStatus:empTaskStatus
    });
    
  } catch (error) {

    console.error(error)
    
  }

}

const addGamesRelease = async (req, res) => {

  let sql = '';
  let values = [];

      sql = `INSERT INTO games_tasks(release_title) VALUES (?)`;
      values = [req.body[0].releaseTitle];
      let qr = await executeDynamicSQL(sql,values);

      res.status(200).json({
        Success: 'Release Added !'
      });

};

const addGamesTask = async (req, res) => {

  let sql = '';
  let values = [];

      sql = `INSERT INTO games_tasks(release_title, task_owner, task_details, priority,email, more_details) VALUES
      (?,?,?,?,?,?)`;
      values = [req.body[0].releaseGame,req.body[0].taskOwner,req.body[0].targetTitle,req.body[0].priority,req.body[0].taskOwnerEmail,req.body[0].moreDetails];
      let qr = await executeDynamicSQL(sql,values);

      res.status(200).json({
        Success: 'Task Added !'
      });

};

function getMonthOfYear(){

  // Get the current date
  const currentDate = new Date();

  // Get the month number (0-indexed, where January is 0 and December is 11)
  return getMonth(currentDate)+1;

};

module.exports = {
    addTaskSheet,
    deleteTask,
    getMyTasks,
    checkedMyTask,
    getMyTaskCountStatus,
    moveTaskByWeek,
    loadGamesTask,
    addGamesRelease,
    addGamesTask
};
