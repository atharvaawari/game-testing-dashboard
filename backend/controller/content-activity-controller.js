const { getISOWeek,format, getMonth } = require('date-fns');

const {
  executeDynamicSQL,
  executeDynamicSQLByTable,
  emailinUserTable,
} = require("../models/auth");
const { verifyAuth } = require("./utils/verify-cookies");
const { weekYearData, getCurrentYear } = require("./utils/date-time");

const { checkPrivilegeLevel } = require("./utils/adminPrivilege");

const loadYoutubeHomePage = async (req, res) => {
  try {
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

    let is_yt_admin = false;

    if (req.session.user_data.privileges.includes("yt_admin")) {
      is_yt_admin = true;
    }

    //_____________________ get category list __________________________

    var getCategorySql = ``;

    switch (req.params.category) {
      case 'youtube':
         getCategorySql = `SELECT DISTINCT category FROM youtube_channels `;

        break;
    
      case 'instagram':
         getCategorySql = `SELECT DISTINCT category FROM instagram_channels `;

        break;
    
        case 'facebook':
           getCategorySql = `SELECT DISTINCT category FROM facebook_channels `;

        break;
        
        case 'website':
           getCategorySql = `SELECT DISTINCT category FROM website_post_category `;
           break;

        case 'animation':
           
           break;   
        
      default:
        // Code to execute if variable doesn't match any of the cases
    }

    const categoryData = await executeDynamicSQLByTable(getCategorySql);

    //_____________________ get category list __________________________

    const finalData = [];

    for (let i = 0; i < categoryData.length; i++) {
      const entry = categoryData[i];
      var data = [];

      if (req.params.category == "youtube") {
        data = await generateUploadData(req, entry.category);
      } else if (req.params.category == "instagram") {
        data = await generateUploadInstData(req, entry.category);
      } else if (req.params.category == "facebook") {
        data = await generateUploadFbData(req, entry.category);
      } else if (req.params.category == "website") {
        data = await generateUploadWebsiteData(req, entry.category);
      }

      finalData.push(data);

    };

    const currYear = getCurrentYear()

    const { startDate, endDate } = getStartAndEndDate(
      currYear.currentYear,
      finalData[0].currentWeek
    );

    // ___________________________________________________________________________________________________________________________

    var countSql = ``;

    switch (req.params.category) {
      case 'youtube':
         countSql = `SELECT SUM(youtube_uploads.video) AS total_video, SUM(youtube_uploads.shorts) AS total_shorts, SUM(youtube_uploads.post) AS total_post, SUM(youtube_uploads.polls) AS total_polls, SUM(youtube_uploads.comments) AS total_comments FROM youtube_uploads JOIN youtube_channels ON youtube_uploads.channel_id = youtube_channels.channels_id WHERE youtube_channels.social_media_categories = '${req.params.category}' AND youtube_uploads.week = ${finalData[0].currentWeek}`;
         countSql1 = `SELECT SUM(video_target) AS total_video, SUM(shorts_target) AS total_shorts, SUM(post_target) AS total_post, SUM(polls_target) AS total_polls, SUM(comments_target) AS total_comments FROM youtube_channels  `;

        break;
    
      case 'instagram':
        countSql = `SELECT SUM(instagram_uploads.reel) AS total_reel, SUM(instagram_uploads.post) AS total_post, SUM(instagram_uploads.story) AS total_story, SUM(instagram_uploads.highlights) AS total_highlights ,SUM(instagram_uploads.poll_or_quiz) AS total_poll_or_quiz, SUM(instagram_uploads.comments) AS total_comments FROM instagram_uploads JOIN instagram_channels ON instagram_uploads.channel_id = instagram_channels.channels_id WHERE instagram_channels.social_media_categories = '${req.params.category}' AND instagram_uploads.week = ${finalData[0].currentWeek}`;

        break;
    
        case 'facebook':
          countSql = `SELECT SUM(facebook_uploads.video) AS total_video, SUM(facebook_uploads.reel) AS total_reels, SUM(facebook_uploads.post) AS total_post, SUM(facebook_uploads.story) AS total_story, SUM(facebook_uploads.comments) AS total_comments FROM facebook_uploads JOIN facebook_channels ON facebook_uploads.channel_id = facebook_channels.channels_id WHERE facebook_channels.social_media_categories = '${req.params.category}' AND facebook_uploads.week =  ${finalData[0].currentWeek}`;

        break;
        
        case 'website':
           countSql = `SELECT SUM(website_uploads.monday) AS monday, SUM(website_uploads.tuesday) AS tuesday, SUM(website_uploads.wednesday) AS wednesday, SUM(website_uploads.thursday) AS thursday, SUM(website_uploads.friday) AS friday, SUM(website_uploads.saturday) AS saturday, SUM(website_uploads.sunday ) AS sunday FROM website_uploads  JOIN website_post_category ON website_uploads.post_category_id  = website_post_category.post_category_id WHERE website_post_category.social_media_categories =  '${req.params.category}' AND website_uploads.week = ${finalData[0].currentWeek}`;
           break;
        
      default:
        // Code to execute if variable doesn't match any of the cases
    }

    const countData = await executeDynamicSQLByTable(countSql);

    const countDataArray = Object.entries(countData[0]);

    let totalPostCountWeek = 0;

    for (let i = 0; i < countDataArray.length; i++) {
      totalPostCountWeek += Number(countDataArray[i][1]);
    }

    // ___________________________________________________________________________________________________________________________

    //_____________________ get Weekly Targets list __________________________

    const weeklyTargetsSql = `SELECT * FROM week_targets WHERE category_name = '${req.params.category.trim()}'`

    const getWeeklyTargets = await executeDynamicSQLByTable(weeklyTargetsSql);

    //_____________________ get Weekly Targets list __________________________

    // ____________________ check user is master admin ________________

    let isMasterAdmin = await checkPrivilegeLevel(req.session.user_data,'master_admin');
      
    // ____________________ check user is master admin ________________

    res.render("all-uploads/content-activity-dynamic-page", {
      data: finalData,
      prevWeek: finalData[0].prevWeek,
      nextWeek: finalData[0].nextWeek,
      currentWeek: finalData[0].currentWeek,
      user_email: req.session.user_email,
      is_yt_admin: is_yt_admin,
      startDate: `${startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} ${startDate.getFullYear()}`,
      endDate: `${endDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      })} ${endDate.getFullYear()}`,
      parentCategory: req.params.category,
      totalPostCountWeek: totalPostCountWeek,
      getWeeklyTargets:getWeeklyTargets,
      isMasterAdmin:isMasterAdmin,
      privilegeData:privilegeData,
      adminData:req.session.user_data
    });

  } catch (error) {
    console.error(error);
    // If an error occurs, send the error details in the response
    const errorMessage = error.message;
    const statusCode = 500;

    res.status(statusCode).send({ error: errorMessage });
  };
};

const uploadYtData = async (req, res) => {

  try {
    
    var table = '';
    var idColumn = '';
    var message = '';

    switch (req.body[0].category) {
      case 'youtube':

        table = 'youtube_uploads';
        idColumn = 'channel_id';
         
        break;
    
      case 'instagram':

        table = 'instagram_uploads'
        idColumn = 'channel_id';
         
        break;
    
        case 'facebook':

        table = 'facebook_uploads';
        idColumn = 'channel_id';
           
        break;
        
        case 'website':

        table = 'website_uploads';
        idColumn = 'post_category_id';
           
        break;
        
      default:
        // Code to execute if variable doesn't match any of the cases
    }

    if (req.cookies.emp_login) {
      const email = verifyAuth(req.cookies.emp_login);
      let user = await emailinUserTable(email);
      req.session.user_email = user[0].email;
    }

    if(Number(req.body[0].data)===-1){

      const sql2 = `DELETE FROM ${table} WHERE week = ? AND user_name = ? AND ${req.body[0].contentType} = 1 AND ${idColumn} = ? ORDER BY ${idColumn} DESC LIMIT 1`;

      const values2 = [
        Number(req.body[0].week),
        req.session.user_email,
        req.body[0].channelId
      ];
      
      let qr = await executeDynamicSQL(sql2, values2);

      if(qr.affectedRows > 0){
        message = `1 activity remove for ${req.body[0].contentType}`;
      } else {

      message = `something went wrong please try again`;

      }

    }

    if(Number(req.body[0].data)===1){

      const sql2 = `INSERT INTO ${table}(${idColumn},week, user_name,${req.body[0].contentType}) VALUES (?,?,?,?)`;

      const values2 = [
        Number(req.body[0].channelId),
        Number(req.body[0].week),
        req.session.user_email,
        Number(req.body[0].data),
      ];

      let qr = await executeDynamicSQL(sql2, values2);

      message = `1 activity added for ${req.body[0].contentType} `

    }

    res.status(200).json({
      Success: 'message',
    });

  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Error -- ", error });
  }
};

const addNotes = async (req, res) => {

  let getCategorySql = '';

  switch (req.body[0].category.trim()) {
    case 'youtube':
       getCategorySql = `UPDATE youtube_channels SET notes = ? WHERE channels_id = ? `;

      break;
  
    case 'instagram':
       getCategorySql = `UPDATE instagram_channels SET notes = ? WHERE channels_id = ? `;

      break;
  
      case 'facebook':
       getCategorySql = `UPDATE facebook_channels SET notes = ? WHERE channels_id = ? `;

      break;
      
      case 'website':
       getCategorySql = `UPDATE website_post_category SET notes = ? WHERE post_category_id = ? `;
         break;
      
    default:
      // Code to execute if variable doesn't match any of the cases
  }

  let qr = await executeDynamicSQL(getCategorySql,[req.body[0].data.trim(),req.body[0].channelId]);

  if(qr.affectedRows > 0){

    message = `Note updated`;

  } else {

  message = `something went wrong please try again`;

  }

  res.status(200).json({
    Success: message
  });

};

const addWeeklyTarget = async (req, res) => {
  console.log(req.body[0])
  let sql = '';
  let values = [];

  switch (req.body[0].targets_category) {
    case 'weekly':

       sql = `INSERT INTO week_targets(category_name, task_owner, task_details,priority,week, email, more_details, deadline) VALUES (?,?,?,?,?,?,?,?)`;
       values = [req.body[0].category.trim(),req.body[0].task_owner.trim(),req.body[0].task_details.trim(),req.body[0].priority,req.body[0].week,req.body[0].taskOwnerEmail, req.body[0].moreDetails, req.body[0].dateRangeValue];

      break;
  
    case 'every-week':

       sql = `INSERT INTO every_week_targets(category_name, task_owner, task_details,priority,week, email, more_details, deadline) VALUES (?,?,?,?,?,?,?,?)`;
       values = [req.body[0].category.trim(),req.body[0].task_owner.trim(),req.body[0].task_details.trim(),req.body[0].priority,req.body[0].week,req.body[0].taskOwnerEmail, req.body[0].moreDetails, req.body[0].dateRangeValue];

      //  values1 = [req.body[0].category.trim(),req.body[0].task_owner.trim(),req.body[0].task_details.trim(),req.body[0].priority,req.body[0].week];

      break;
  
    case 'monthly':

       sql = `INSERT INTO monthly_targets(category_name, task_owner, task_details, month,priority, email, more_details, deadline) VALUES (?,?,?,?,?,?,?,?)`;
       values = [req.body[0].category.trim(),req.body[0].task_owner.trim(),req.body[0].task_details.trim(),req.body[0].current_month,req.body[0].priority,req.body[0].taskOwnerEmail, req.body[0].moreDetails, req.body[0].dateRangeValue];

      break;

    case 'movable':

      sql = `INSERT INTO movable_targets(category_name, task_owner, task_details,priority, week, email, more_details) VALUES (?,?,?,?,?,?,?)`;
      values = [req.body[0].category.trim(),req.body[0].task_owner.trim(),req.body[0].task_details.trim(),req.body[0].priority,req.body[0].week,req.body[0].taskOwnerEmail, req.body[0].moreDetails];
 
     break;  
      
    default:
      // Code to execute if variable doesn't match any of the cases
  }


  let qr = await executeDynamicSQL(sql,values);

  if(qr.affectedRows > 0){

    message = `Target updated`;

  } else {

    message = `something went wrong please try again`;

  }

  res.status(200).json({
    Success: message
  });

};

const weeklyTargetChecked = async (req, res) => {

  let sql = '';
  let values = [];
  
  switch (req.body[0].targets_category) {
    case 'weekly':

       sql = `UPDATE week_targets SET is_complete = ? WHERE id = ? AND category_name = ?`;
       values = [req.body[0].isChecked,req.body[0].id,req.body[0].category.trim()]

      break;
  
    case 'every-week':

       sql = `UPDATE every_week_targets SET is_complete = ? WHERE id = ? AND category_name = ?`;
       values = [req.body[0].isChecked,req.body[0].id,req.body[0].category.trim()]

      //  __________________________________________________________

      const checkDataDb = `SELECT * FROM every_week_targets WHERE category_name = '${req.body[0].category}' AND week = ${Number(req.body[0].week)+1}`;
      let ewtData = await executeDynamicSQLByTable(checkDataDb);

      if(ewtData.length<1){

        const createCopy = `
        INSERT INTO every_week_targets (category_name, task_owner, task_details, is_complete, priority, week, email, more_details)
        SELECT category_name, task_owner, task_details, is_complete, priority, ${Number(req.body[0].week) + 1}, email, more_details
        FROM every_week_targets 
        WHERE category_name = '${req.body[0].category}' AND week = ${Number(req.body[0].week)}
      
        `;
        let ewtData1 = await executeDynamicSQLByTable(createCopy);

      }
      
      // ___________________________________________________________

      break;
  
    case 'monthly':

       sql = `UPDATE monthly_targets SET is_complete = ? WHERE id = ? AND category_name = ?`;
       values = [req.body[0].isChecked,req.body[0].id,req.body[0].category.trim()]

      break;

    case 'movable':

      sql = `UPDATE movable_targets SET is_complete = ? WHERE id = ? AND category_name = ?`;
      values = [req.body[0].isChecked,req.body[0].id,req.body[0].category.trim()]
 
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

const weeklyTargetEdit = async (req, res) => { 

  console.log(req.body[0].dateRangeValue)

  let sql = '';
  let values = [];

  switch (req.body[0].targets_category) {
    case 'weekly':

      sql = `UPDATE week_targets SET task_owner = ?,priority = ?,task_details = ?, more_details = ? , email = ? , deadline = ?  WHERE id = ? AND category_name = ? AND week = ?  `;
      values = [req.body[0].task_owner.trim(),req.body[0].priority,req.body[0].task_details.trim(),req.body[0].moreDetails.trim(),req.body[0].taskOwnerEmail.trim(),req.body[0].dateRangeValue,req.body[0].task_id.trim(),req.body[0].category.trim(),req.body[0].week];

     break;
  
    case 'every-week':

       sql = `UPDATE every_week_targets SET task_owner = ?,priority = ?,task_details = ?, more_details = ?, email = ?  WHERE id = ? AND category_name = ? AND deadline = ?`;
       values = [req.body[0].task_owner.trim(),req.body[0].priority,req.body[0].task_details.trim(),req.body[0].moreDetails.trim(),req.body[0].taskOwnerEmail.trim(),req.body[0].task_id.trim(),req.body[0].category.trim(),req.body[0].dateRangeValue];
      break;
  
    case 'monthly':

       sql = `UPDATE monthly_targets SET task_owner = ?,priority = ?,task_details = ?, more_details = ?, email = ?  WHERE id = ? AND category_name = ? AND deadline = ?`;
       values = [req.body[0].task_owner.trim(),req.body[0].priority,req.body[0].task_details.trim(),req.body[0].moreDetails.trim(),req.body[0].taskOwnerEmail.trim(),req.body[0].task_id.trim(),req.body[0].category,req.body[0].dateRangeValue];

      break;

    case 'movable':

     sql = `UPDATE movable_targets SET task_owner = ?,priority = ?,task_details = ?, more_details = ?, email = ?  WHERE id = ? AND category_name = ?`;
       values = [req.body[0].task_owner.trim(),req.body[0].priority,req.body[0].task_details.trim(),req.body[0].moreDetails.trim(),req.body[0].taskOwnerEmail.trim(), req.body[0].task_id.trim(),req.body[0].category.trim()];
       break;  

    case 'game':

     sql = `UPDATE games_tasks SET task_owner = ?,priority = ?,task_details = ?, more_details = ?, email = ? WHERE id = ?`;
       values = [req.body[0].task_owner.trim(),req.body[0].priority,req.body[0].task_details.trim(),req.body[0].moreDetails.trim(),req.body[0].taskOwnerEmail.trim(),req.body[0].task_id.trim()];
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

const loadTasks = async (req, res, next) => {
    
 try {

  if (req.params.category !== 'uploads' && req.params.category !== 'animation' && req.params.category !== 'website') {
    return next()
  }

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

  const { currentWeek, prevWeek, nextWeek} = weekYearData(req);

  const currYear = getCurrentYear()

  const { startDate, endDate } = getStartAndEndDate(currYear.currentYear,currentWeek);

  //_____________________ get Weekly Targets list __________________________

  const weeklyTargetsSql = `SELECT week_targets.deadline, week_targets.id,week_targets.category_name,week_targets.task_owner,week_targets.task_details,week_targets.is_complete,week_targets.week,week_targets.priority,week_targets.email,week_targets.more_details FROM week_targets JOIN myl_employee ON week_targets.email = myl_employee.email WHERE week_targets.category_name = '${req.params.category.trim()}' AND week_targets.week = ${currentWeek} AND JSON_CONTAINS(myl_employee.p1, '{"Employee":true}', '$') = 1 ORDER BY week_targets.task_owner, week_targets.priority`;

  let getWeeklyTargets = await executeDynamicSQLByTable(weeklyTargetsSql);

  //_____________________ get Weekly Targets list __________________________
  //_____________________ get every Weekly Targets list __________________________

  const everyWeekTargetsSql = `SELECT every_week_targets.id,every_week_targets.category_name,every_week_targets.task_owner,every_week_targets.task_details,every_week_targets.is_complete,every_week_targets.week,every_week_targets.priority,every_week_targets.email,every_week_targets.more_details FROM every_week_targets JOIN myl_employee ON every_week_targets.email = myl_employee.email WHERE every_week_targets.category_name = '${req.params.category.trim()}' AND JSON_CONTAINS(myl_employee.p1, '{"Employee":true}', '$') = 1 AND every_week_targets.week = ${currentWeek}  ORDER BY every_week_targets.task_owner, every_week_targets.priority`;

  let everyWeekTargets = await executeDynamicSQLByTable(everyWeekTargetsSql);
    
  //_____________________ get every Weekly Targets list __________________________
  //_____________________ __________________________

  const empListSql = `SELECT name,email FROM myl_employee WHERE JSON_CONTAINS(myl_employee.p1, '{"Employee":true}', '$') = 1  ORDER BY name ASC`;

  let empList = await executeDynamicSQLByTable(empListSql);

      
  //_____________________ __________________________
  //_____________________ get Monthly Targets list __________________________
  //_____________________ get task sheet list __________________________

  const taskSheetSQL = `SELECT * FROM task_sheet WHERE category_name = '${req.params.category.trim()}' ORDER BY title`;

  let taskSheetData = await executeDynamicSQLByTable(taskSheetSQL);
    
  //_____________________ get task sheet list __________________________
  //_____________________ get Monthly Targets list __________________________

  let currentMonth = getMonthOfYear();
  
  const startDateMonthNumber = getMonth(startDate)+1;

  if(Number(req.query.w)){

    currentMonth = startDateMonthNumber;

  }

  const monthlyTargetsSql = `SELECT monthly_targets.id,monthly_targets.category_name,monthly_targets.task_owner,monthly_targets.task_details,monthly_targets.is_complete,monthly_targets.priority,monthly_targets.email,monthly_targets.more_details,monthly_targets.month FROM monthly_targets JOIN myl_employee ON monthly_targets.email = myl_employee.email WHERE monthly_targets.category_name = '${req.params.category.trim()}' AND month = ${currentMonth} AND JSON_CONTAINS(myl_employee.p1, '{"Employee":true}', '$') = 1 ORDER BY monthly_targets.task_owner, monthly_targets.priority`;
  let monthlyTargets= await executeDynamicSQLByTable(monthlyTargetsSql);

  //_____________________ get Monthly Targets list __________________________
  //_____________________ get movable Weekly Targets list __________________________

  const movableTargetsSql = `SELECT movable_targets.id,movable_targets.category_name,movable_targets.task_owner,movable_targets.task_details,movable_targets.is_complete,movable_targets.week,movable_targets.priority,movable_targets.email,movable_targets.more_details FROM movable_targets JOIN myl_employee ON movable_targets.email = myl_employee.email WHERE movable_targets.category_name = '${req.params.category.trim()}' AND movable_targets.week = ${currentWeek} AND JSON_CONTAINS(myl_employee.p1, '{"Employee":true}', '$') = 1 ORDER BY movable_targets.task_owner, movable_targets.priority`;
  let movableTargets = await executeDynamicSQLByTable(movableTargetsSql);
    
  //_____________________ get movable Weekly Targets list __________________________

  getWeeklyTargets = moveItemsToBottom(getWeeklyTargets, 'is_complete', 1);
  everyWeekTargets = moveItemsToBottom(everyWeekTargets, 'is_complete', 1);
  monthlyTargets = moveItemsToBottom(monthlyTargets, 'is_complete', 1);
  movableTargets = moveItemsToBottom(movableTargets, 'is_complete', 1);

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
    FROM week_targets
    WHERE week = ${currentWeek} AND category_name = '${req.params.category.trim()}'
    UNION ALL 
    SELECT task_owner, is_complete, email
    FROM every_week_targets
    WHERE week = ${currentWeek} AND category_name = '${req.params.category.trim()}'
    UNION ALL 
    SELECT task_owner, is_complete, email
    FROM monthly_targets
    WHERE month = ${currentMonth} AND category_name = '${req.params.category.trim()}'
    UNION ALL 
    SELECT task_owner, is_complete, email
    FROM movable_targets
    WHERE week = ${currentWeek} AND category_name = '${req.params.category.trim()}'
  ) AS combined_data
  GROUP BY task_owner, email  -- Include email in the GROUP BY clause
) AS combined_data
JOIN myl_employee ON combined_data.email = myl_employee.email
WHERE JSON_CONTAINS(myl_employee.p1, '{"Employee":true}', '$') = 1
ORDER BY combined_data.task_owner ASC;


`;

  let empTaskStatus = await executeDynamicSQLByTable(empTaskStatusSql);

  //_____________________ employee task status list __________________________

  return res.render("all-uploads/[taks]", {
    prevWeek:prevWeek,
    nextWeek:nextWeek,
    currentWeek:currentWeek,
    currentMonth:currentMonth,
    user_email: req.session.user_email,
    startDate: `${startDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} ${startDate.getFullYear()}`,
    endDate: `${endDate.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    })} ${endDate.getFullYear()}`,
    parentCategory: req.params.category,
    getWeeklyTargets:getWeeklyTargets,
    everyWeekTargets:everyWeekTargets,
    monthlyTargets:monthlyTargets,
    movableTargets:movableTargets,
    taskSheetData:taskSheetData,
    privilegeData:privilegeData,
    empList:empList,
    empTaskStatus:empTaskStatus,
    adminData:req.session.user_data
  });
  
} catch (error) {
    console.error(error);
    // If an error occurs, send the error details in the response
    const errorMessage = error.message;
    const statusCode = 500;

    res.status(statusCode).send({ error: errorMessage });
  }

};

const deleteTask = async (req, res) => {

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
      sql = `DELETE FROM task_sheet WHERE id = ? `;
      values = [Number(req.body.task_id)];

    default:
      // Code to execute if variable doesn't match any of the cases
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

const taskCount = async (req, res) => {

  const currWeek = getCurrentWeekNumber();

  const currMonth = getMonthOfYear();

  // ______________________________ tesk count ________________________________________

  const animationTaskCount = await getTaskCountByCategory("animation", currWeek, currMonth);

  const gameTaskCount = await getTaskCountByCategory("game", currWeek, currMonth);

  const uploadsTaskCount = await getTaskCountByCategory("uploads", currWeek, currMonth);

  const websiteTaskCount = await getTaskCountByCategory("website", currWeek, currMonth);

  // ______________________________ tesk count ________________________________________
  // ______________________________ content count ________________________________________

  const youtubeCount = await getContentCountByCategory('youtube',currWeek);
  const instagramCount = await getContentCountByCategory('instagram',currWeek);
  const facebookCount = await getContentCountByCategory('facebook',currWeek);
  const websiteCount = await getContentCountByCategory('website',currWeek);

  // ______________________________ content count ________________________________________

  res.status(200).json({
    animationTaskCount: animationTaskCount,
    gameTaskCount: gameTaskCount,
    uploadsTaskCount:uploadsTaskCount,
    websiteTaskCount:websiteTaskCount,
    youtubeCount:youtubeCount,
    instagramCount:instagramCount,
    facebookCount:facebookCount,
    websiteCount:websiteCount
  });

};

const moveTask = async (req, res) => {

  // ______________________________ tesk count ________________________________________

  const sql = `
  INSERT INTO ${req.body.moveTask}
  SELECT * FROM movable_targets
  WHERE id=${req.body.tastId}`;

  const sql1 = `
  DELETE FROM movable_targets
  WHERE id=${req.body.tastId};`

  await executeDynamicSQLByTable(sql);

  await executeDynamicSQLByTable(sql1);

  // ______________________________ content count ________________________________________

  res.status(200).json({
    success:'success'
  });

};

function getCurrentWeekNumber() {
  const today = new Date();
  const currentWeekNumber = getISOWeek(today);
  return currentWeekNumber;
};

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
};

async function generateUploadData(req, category) {

  const { currentWeek, prevWeek, nextWeek } = weekYearData(req);

  const sql = `SELECT 
  ypc.channels_name,
  ypc.channels_id,
  yu.week,
  yu.user_name,
  yu.video,
  yu.shorts,
  yu.post,
  yu.polls,
  yu.comments,
  ypc.video_target,
  ypc.shorts_target,
  ypc.post_target,
  ypc.polls_target,
  ypc.comments_target,
  ypc.notes,
  yu.time_stamp,
  yu.uploads_id,
  yu.channel_id 
 FROM
  youtube_channels ypc
 LEFT JOIN
  ( SELECT * FROM youtube_uploads WHERE week = ? )
 yu ON yu.channel_id = ypc.channels_id WHERE ypc.category = ?`;
  const channelData1 = await executeDynamicSQL(sql, [currentWeek,category]);

  // Initialize objects to store counts and user data
  let channelData = {};
  let weeklyTargetDone = 0


  // Iterate through the array
  channelData1.forEach((entry) => {
    const {
      channels_name,
      channels_id,
      video,
      shorts,
      post,
      polls,
      comments,
      user_name,
      time_stamp,
      video_target,
      shorts_target,
      post_target,
      polls_target,
      comments_target,
      notes 
    } = entry;

    // Calculate counts for each channel_name
    if (!channelData[channels_name]) {
      channelData[channels_name] = {
        counts: {
          video: 0,
          shorts: 0,
          post: 0,
          polls: 0,
          comments: 0,
        },
        userData: {
          video: [],
          shorts: [],
          post: [],
          polls: [],
          comments: [],
        },
        target:{
          video_target:video_target,
          shorts_target:shorts_target,
          post_target:post_target,
          polls_target:polls_target,
          comments_target:comments_target
        },
        notes:{
          notes:notes
        },
        channels_id:{
          channels_id:channels_id
        }
      };
    }

    // Update counts
    channelData[channels_name].counts.video += video;
    channelData[channels_name].counts.shorts += shorts;
    channelData[channels_name].counts.post += post;
    channelData[channels_name].counts.polls += polls;
    channelData[channels_name].counts.comments += comments;

    weeklyTargetDone += video;
    weeklyTargetDone += shorts;
    weeklyTargetDone += post;
    weeklyTargetDone += polls;
    weeklyTargetDone += comments;

  
    // Add user data to corresponding arrays
    if (video > 0) {
      channelData[channels_name].userData.video.push({
        user_name,
        time_stamp,
        count: video
      });
    }

    if (shorts > 0) {
      channelData[channels_name].userData.shorts.push({
        user_name,
        time_stamp,
        count: shorts
      });
    }

    if (post > 0) {
      channelData[channels_name].userData.post.push({
        user_name,
        time_stamp,
        count: post
      });
    }

    if (polls > 0) {
      channelData[channels_name].userData.polls.push({
        user_name,
        time_stamp,
        count: polls
      });
    }

    if (comments > 0) {
      channelData[channels_name].userData.comments.push({
        user_name,
        time_stamp,
        count: comments
      });
    }

  });

  const categoryTargetCount = calTargetTotalCount(channelData);
  

  const dataArray2 = Object.entries(channelData);

  //_____________________ get channel list __________________________

  const sql1 = `SELECT * FROM youtube_channels WHERE category = '${category}'`;

  const channelsData = await executeDynamicSQLByTable(sql1);

  //_____________________ get channel list __________________________

  return {
    dataArray2,
    ChannelsData: channelsData,
    category,
    currentWeek,
    prevWeek,
    nextWeek,
    weeklyTargetDone,
    categoryTargetCount
  };
};

async function generateUploadInstData(req, category) {

  const { currentWeek, prevWeek, nextWeek} = weekYearData(req)

  const sql = `SELECT 
  ipc.channels_name,
  ipc.channels_id,
  iu.week,
  iu.user_name,
  iu.reel,
  iu.post ,
  iu.story ,
  iu.highlights,
  iu.poll_or_quiz,
  iu.comments,
  ipc.reel_target,
  ipc.post_target ,
  ipc.story_target ,
  ipc.highlights_target,
  ipc.poll_or_quiz_target,
  ipc.comments_target,
  ipc.notes,
  iu.time_stamp,
  iu.uploads_id,
  iu.channel_id 
FROM 
  instagram_channels ipc 
LEFT JOIN
  ( SELECT * FROM instagram_uploads WHERE week = ? )
iu ON iu.channel_id = ipc.channels_id WHERE ipc.category = ?`;
  const channelData1 = await executeDynamicSQL(sql, [currentWeek,category]);
  // Initialize objects to store counts and user data
  let channelData = {};
  let weeklyTargetDone = 0

  // Iterate through the array
  channelData1.forEach((entry) => {
    const {
      channels_name,
      channels_id,
      reel,
      post,
      story,
      highlights,
      poll_or_quiz,
      comments,
      reel_target,
      post_target,
      story_target,
      highlights_target,
      poll_or_quiz_target,
      comments_target,
      notes,
      user_name,
      time_stamp,
    } = entry;

    // Calculate counts for each channel_name
    if (!channelData[channels_name]) {
      channelData[channels_name] = {
        counts: {
          reel: 0,
          post: 0,
          story: 0,
          highlights: 0,
          poll_or_quiz: 0,
          comments: 0,
        },
        userData: {
          reel: [],
          post: [],
          story: [],
          highlights: [],
          poll_or_quiz: [],
          comments: [],
        },
        target:{
          reel_target:reel_target,
          post_target:post_target,
          story_target:story_target,
          highlights_target:highlights_target,
          poll_or_quiz_target:poll_or_quiz_target,
          comments_target:comments_target
        },
        notes:{
          notes:notes
        },
        channels_id:{
          channels_id:channels_id
        }
        
      };
    }

    // Update counts
    channelData[channels_name].counts.reel += reel;
    channelData[channels_name].counts.post += post;
    channelData[channels_name].counts.story += story;
    channelData[channels_name].counts.highlights += highlights;
    channelData[channels_name].counts.poll_or_quiz += poll_or_quiz;
    channelData[channels_name].counts.comments += comments;


    weeklyTargetDone += reel;
    weeklyTargetDone += post;
    weeklyTargetDone += story;
    weeklyTargetDone += highlights;
    weeklyTargetDone += poll_or_quiz;
    weeklyTargetDone += comments;

    // Add user data to corresponding arrays
    if (reel > 0) {
      channelData[channels_name].userData.reel.push({
        user_name,
        time_stamp,
        count: reel,
      });
    }

    if (post > 0) {
      channelData[channels_name].userData.post.push({
        user_name,
        time_stamp,
        count: post,
      });
    }

    if (story > 0) {
      channelData[channels_name].userData.story.push({
        user_name,
        time_stamp,
        count: story,
      });
    }

    if (highlights > 0) {
      channelData[channels_name].userData.highlights.push({
        user_name,
        time_stamp,
        count: highlights,
      });
    }

    if (poll_or_quiz > 0) {
      channelData[channels_name].userData.poll_or_quiz.push({
        user_name,
        time_stamp,
        count: poll_or_quiz,
      });
    }

    if (comments > 0) {
      channelData[channels_name].userData.comments.push({
        user_name,
        time_stamp,
        count: comments,
      });
    }
  });

  const dataArray2 = Object.entries(channelData);

  const categoryTargetCount = calTargetTotalCount(channelData);

  //_____________________ get channel list __________________________

  const sql1 = `SELECT * FROM instagram_channels WHERE category = '${category}'`;

  const channelsData = await executeDynamicSQLByTable(sql1);

  //_____________________ get channel list __________________________

  return {
    dataArray2,
    ChannelsData: channelsData,
    category,
    currentWeek,
    prevWeek,
    nextWeek,
    weeklyTargetDone,
    categoryTargetCount
  };
};

async function generateUploadFbData(req, category) {

  const { currentWeek, prevWeek, nextWeek} = weekYearData(req)

  const sql = `
  SELECT
  fpc.channels_name,
  fpc.channels_id,
  fu.week,
  fu.user_name,
  fu.post,
  fu.reel,
  fu.video,
  fu.story,
  fu.comments,
  fpc.post_target,
  fpc.reel_target,
  fpc.video_target,
  fpc.story_target,
  fpc.comments_target,
  fpc.notes,
  fu.time_stamp,
  fu.uploads_id,
  fu.channel_id
FROM
  facebook_channels fpc
LEFT JOIN
  ( SELECT * FROM facebook_uploads WHERE week = ? )
fu ON fu.channel_id = fpc.channels_id WHERE fpc.category = ?
`;
  const channelData1 = await executeDynamicSQL(sql, [currentWeek,category]);
  // Initialize objects to store counts and user data
  let channelData = {};
  let weeklyTargetDone = 0

  // Iterate through the array
  channelData1.forEach((entry) => {
    const {
      channels_name,
      channels_id,
      post,
      reel,
      video,
      story,
      comments,
      post_target,
      reel_target,
      video_target,
      story_target,
      comments_target,
      notes ,
      user_name,
      time_stamp,
    } = entry;

    // Calculate counts for each channel_name
    if (!channelData[channels_name]) {
      channelData[channels_name] = {
        counts: {
          post: 0,
          reel: 0,
          video: 0,
          story: 0,
          comments: 0,
        },
        userData: {
          post: [],
          reel: [],
          video: [],
          story: [],
          comments: [],
        },
        target:{
          post_target:post_target,
          reel_target:reel_target,
          video_target:video_target,
          story_target:story_target,
          comments_target:comments_target,
        },
        notes:{
          notes:notes
        },
        channels_id:{
          channels_id:channels_id
        }
      };
    }

    // Update counts
    channelData[channels_name].counts.post += post;
    channelData[channels_name].counts.reel += reel;
    channelData[channels_name].counts.video += video;
    channelData[channels_name].counts.story += story;
    channelData[channels_name].counts.comments += comments;

    // Add user data to corresponding arrays
    if (post > 0) {
      channelData[channels_name].userData.post.push({
        user_name,
        time_stamp,
        count: post,
      });
    }

    if (reel > 0) {
      channelData[channels_name].userData.reel.push({
        user_name,
        time_stamp,
        count: reel,
      });
    }

    if (video > 0) {
      channelData[channels_name].userData.video.push({
        user_name,
        time_stamp,
        count: video,
      });
    }

    if (story > 0) {
      channelData[channels_name].userData.story.push({
        user_name,
        time_stamp,
        count: story,
      });
    }

    if (comments > 0) {
      channelData[channels_name].userData.comments.push({
        user_name,
        time_stamp,
        count: comments,
      });
    }
  });

  const dataArray2 = Object.entries(channelData);

  const categoryTargetCount = calTargetTotalCount(channelData);

  //_____________________ get channel list __________________________

  const sql1 = `SELECT * FROM facebook_channels WHERE category = '${category}'`;

  const channelsData = await executeDynamicSQLByTable(sql1);

  //_____________________ get channel list __________________________

  return {
    dataArray2,
    ChannelsData: channelsData,
    category,
    currentWeek,
    prevWeek,
    nextWeek,
    weeklyTargetDone,
    categoryTargetCount
  };
};

async function generateUploadWebsiteData(req, category) {

  const { currentWeek, prevWeek, nextWeek} = weekYearData(req)

  const sql = `
  SELECT 
   wpc.post_category_id AS post_category_id1,
   wpc.post_category_name,
   wu.week, 
   wu.user_name,
   wu.monday, 
   wu.tuesday, 
   wu.wednesday, 
   wu.thursday, 
   wu.friday, 
   wu.saturday, 
   wu.sunday, 
   wpc.monday_target, 
   wpc.tuesday_target, 
   wpc.wednesday_target, 
   wpc.thursday_target, 
   wpc.friday_target, 
   wpc.saturday_target, 
   wpc.sunday_target, 
   wpc.notes,
   wu.time_stamp, 
   wu.uploads_id, 
   wu.post_category_id 
  FROM 
   website_post_category wpc
  LEFT JOIN ( SELECT * FROM website_uploads WHERE week = ? ) wu ON wu.post_category_id = wpc.post_category_id WHERE wpc.category = ?`;
  const channelData1 = await executeDynamicSQL(sql, [currentWeek,category]);


  // Initialize objects to store counts and user data
  let channelData = {};
  let weeklyTargetDone = 0

  // Iterate through the array
  channelData1.forEach((entry) => {
    const {
      post_category_name,
      post_category_id1,
      uploads_id,
      monday,
      tuesday,
      wednesday,
      thursday,
      friday,
      saturday,
      sunday,
      monday_target,
      tuesday_target,
      wednesday_target,
      thursday_target,
      friday_target,
      saturday_target,
      sunday_target,
      notes ,
      user_name,
      time_stamp,
    } = entry;

    // Calculate counts for each channel_name
    if (!channelData[post_category_name]) {
      channelData[post_category_name] = {
        counts: {
          monday : 0,
          tuesday : 0,
          wednesday : 0,
          thursday : 0,
          friday : 0,
          saturday : 0,
          sunday : 0,
        },
        userData: {
          monday :[],
          tuesday :[],
          wednesday :[],
          thursday :[],
          friday :[],
          saturday :[],
          sunday :[],
        },
        target:{
          monday_target:monday_target,
          tuesday_target:tuesday_target,
          wednesday_target:wednesday_target,
          thursday_target:thursday_target,
          friday_target:friday_target,
          saturday_target:saturday_target,
          sunday_target:sunday_target,
        },
        notes:{
          notes:notes
        },
        post_category_id:{
          post_category_id:post_category_id1
        }
      };
    }

    // Update counts
    channelData[post_category_name].counts.monday += monday ;
    channelData[post_category_name].counts.tuesday += tuesday ;
    channelData[post_category_name].counts.wednesday += wednesday ;
    channelData[post_category_name].counts.thursday += thursday ;
    channelData[post_category_name].counts.friday += friday ;
    channelData[post_category_name].counts.saturday += saturday ;
    channelData[post_category_name].counts.sunday += sunday ;

    // Add user data to corresponding arrays
    if (monday > 0) {
      for (let i = 0; i < monday; i++) {
        channelData[post_category_name].userData.monday.push({
          user_name,
          time_stamp,
          count: 1,
          uploads_id:uploads_id
        });
      }
    }

    if (tuesday > 0) {
      channelData[post_category_name].userData.tuesday.push({
        user_name,
        time_stamp,
        count: tuesday,
        uploads_id:uploads_id
      });
    }

    if (wednesday > 0) {
      channelData[post_category_name].userData.wednesday.push({
        user_name,
        time_stamp,
        count: wednesday,
        uploads_id:uploads_id
      });
    }

    if (thursday > 0) {
      channelData[post_category_name].userData.thursday.push({
        user_name,
        time_stamp,
        count: thursday,
        uploads_id:uploads_id
      });
    }

    if (friday > 0) {
      channelData[post_category_name].userData.friday.push({
        user_name,
        time_stamp,
        count: friday,
        uploads_id:uploads_id
      });
    }

    if (saturday > 0) {
      channelData[post_category_name].userData.saturday.push({
        user_name,
        time_stamp,
        count: saturday,
        uploads_id:uploads_id
      });
    }

    if (sunday > 0) {
      channelData[post_category_name].userData.sunday.push({
        user_name,
        time_stamp,
        count: sunday,
        uploads_id:uploads_id
      });
    }

  });

  const dataArray2 = Object.entries(channelData);

  const categoryTargetCount = calTargetTotalCount(channelData);

  //_____________________ get channel list __________________________

  const sql1 = `SELECT * FROM website_post_category `;

  const channelsData = await executeDynamicSQLByTable(sql1);

  //_____________________ get channel list __________________________

  return {
    dataArray2,
    ChannelsData: channelsData,
    category,
    currentWeek,
    prevWeek,
    nextWeek,
    weeklyTargetDone,
    categoryTargetCount
  };
};

function getWeeksInYear(year) {
  const january4th = new Date(year, 0, 4);
  const weekStartAdjustment = january4th.getDay() > 0 ? january4th.getDay() - 1 : 6;
  january4th.setDate(january4th.getDate() - weekStartAdjustment);
  return Math.floor((new Date(year + 1, 0, 1) - january4th) / (7 * 24 * 60 * 60 * 1000));
};

function calTargetTotalCount(data) {
  let totalCount = 0;

  Object.values(data).forEach((channel) => {
    Object.keys(channel.target).forEach((targetType) => {
      totalCount += (channel.target[targetType] || 0);
    });
  });

  return totalCount;
};

function getMonthOfYear(){

  // Get the current date
  const currentDate = new Date();

  // Get the month number (0-indexed, where January is 0 and December is 11)
  return getMonth(currentDate)+1;

};

function moveItemsToBottom(arr, conditionProperty, conditionValue) {
  let conditionMetItems = arr.filter(item => item[conditionProperty] === conditionValue);
  let otherItems = arr.filter(item => item[conditionProperty] !== conditionValue);
  return otherItems.concat(conditionMetItems);
};

async function getTaskCountByCategory(category,week,month) {
  const weekCountSql = `
SELECT
    combined_data.category_name,
    COUNT(CASE WHEN combined_data.is_complete = 1 THEN 1 END) AS completed_count,
    COUNT(CASE WHEN combined_data.is_complete = 0 THEN 1 END) AS not_completed_count
FROM (
    SELECT category_name, is_complete, email
    FROM week_targets
    WHERE week = ${week} AND category_name = '${category}'
    UNION ALL
    SELECT category_name, is_complete, email
    FROM every_week_targets
    WHERE week = ${week} AND category_name = '${category}'
    UNION ALL
    SELECT category_name, is_complete, email
    FROM monthly_targets
    WHERE month = ${month} AND category_name = '${category}'
) AS combined_data
JOIN myl_employee ON combined_data.email = myl_employee.email
WHERE JSON_CONTAINS(myl_employee.p1, '{"Employee":true}', '$') = 1
GROUP BY combined_data.category_name;

         `;

  const count = await executeDynamicSQLByTable(weekCountSql);
  if(count.length<1){
    return { category, weekCountResult : {
      completed_count: 0,
      not_completed_count:0
    } };
  }


  // Convert BigInt values to strings before logging or sending in the response
  const weekCountResult = {
    completed_count: Number(count[0].completed_count),
    not_completed_count: Number(count[0].not_completed_count),
  };

  return { category, weekCountResult };
};

async function getContentCountByCategory(category,week) {
  
 let countSql = ''
 let countSql1 = ''
 
 switch (category) {
  case 'youtube':
    countSql = `SELECT SUM(youtube_uploads.video) AS total_video, SUM(youtube_uploads.shorts) AS total_shorts, SUM(youtube_uploads.post) AS total_post, SUM(youtube_uploads.polls) AS total_polls, SUM(youtube_uploads.comments) AS total_comments FROM youtube_uploads JOIN youtube_channels ON youtube_uploads.channel_id = youtube_channels.channels_id WHERE youtube_uploads.week = ${week}`;
    countSql1 = `SELECT SUM(video_target) AS total_video, SUM(shorts_target) AS total_shorts, SUM(post_target) AS total_post, SUM(polls_target) AS total_polls, SUM(comments_target) AS total_comments FROM youtube_channels`;  
    break;

  case 'instagram':
    countSql = `SELECT SUM(instagram_uploads.reel) AS total_reel, SUM(instagram_uploads.post) AS total_post, SUM(instagram_uploads.story) AS total_story, SUM(instagram_uploads.highlights) AS total_highlights ,SUM(instagram_uploads.poll_or_quiz) AS total_poll_or_quiz, SUM(instagram_uploads.comments) AS total_comments FROM instagram_uploads JOIN instagram_channels ON instagram_uploads.channel_id = instagram_channels.channels_id WHERE instagram_uploads.week = '${week}'`;
    countSql1 = `SELECT SUM(reel_target) AS total_video, SUM(post_target) AS total_shorts, SUM(story_target) AS total_post, SUM(highlights_target) AS total_polls, SUM(poll_or_quiz_target ) AS poll_or_quiz_target, SUM(comments_target) AS total_comments FROM instagram_channels`;  
    break;

  case 'facebook':
    countSql = `SELECT SUM(facebook_uploads.post) AS total_post , SUM(facebook_uploads.reel ) AS total_reel , SUM(facebook_uploads.video ) AS total_video , SUM(facebook_uploads.story) AS total_story ,SUM(facebook_uploads.comments) AS total_comments FROM facebook_uploads JOIN facebook_channels ON facebook_uploads.channel_id = facebook_channels.channels_id WHERE facebook_uploads.week = '${week}'`;
    countSql1 = `SELECT SUM(post_target) AS total_post, SUM(reel_target) AS total_reel , SUM(video_target) AS total_video, SUM(story_target) AS total_story , SUM(comments_target) AS comments  FROM facebook_channels`;  
    break; 
    
  case 'website':
    countSql = `SELECT SUM(monday ) AS monday , SUM(tuesday ) AS tuesday, SUM(wednesday ) AS wednesday , SUM(thursday) AS thursday ,SUM(friday) AS friday , SUM(saturday ) AS saturday, SUM(sunday ) AS sunday FROM website_uploads WHERE week = '${week}'`;
    countSql1 = `SELECT SUM(monday_target) AS monday_target, SUM(tuesday_target) AS tuesday_target , SUM(wednesday_target) AS wednesday_target , SUM(thursday_target ) AS thursday_target , SUM(friday_target ) AS friday_target  , SUM(saturday_target) AS saturday_target , SUM(sunday_target) AS sunday_target FROM website_post_category`;  
  break;  

  default:
    // Code to execute if variable doesn't match any of the cases
}

  const ytContentCount = await executeDynamicSQLByTable(countSql);
  const ytTargetCount = await executeDynamicSQLByTable(countSql1);

  if(ytContentCount.length<1 || ytTargetCount.length<1){
    return 0
  }

  const countDataArray = Object.entries(ytContentCount[0]);

  const countDataArray1 = Object.entries(ytTargetCount[0]);

  let totalPostCountWeek = 0;
  let totalPostCountWeek1 = 0;

  for (let i = 0; i < countDataArray.length; i++) {
    totalPostCountWeek += Number(countDataArray[i][1]);
  }

  for (let i = 0; i < countDataArray1.length; i++) {
   totalPostCountWeek1 += Number(countDataArray1[i][1]);
 }

  return { targetDone:totalPostCountWeek, target:totalPostCountWeek1 };

};

module.exports = {
  loadYoutubeHomePage,
  uploadYtData,
  addNotes,
  addWeeklyTarget,
  weeklyTargetChecked,
  weeklyTargetEdit,
  loadTasks,
  deleteTask,
  taskCount,
  moveTask,
  getStartAndEndDate,
  weekYearData,
  moveItemsToBottom
};
