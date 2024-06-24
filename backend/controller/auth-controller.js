const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
const { verifyAuth } = require("./utils/verify-cookies");

const { checkLeaveStatus } = require("../controller/utils/getLeaveStatus");


const renderSignupPage = async (req, res) => {
  if (req.session.isValiVerificationCode) {
    message = "";

    return res.render("signup");
  }

  res.redirect("/emp-code-verification");
};

const signupAuth = async (req, res) => {
  try {
    const { user_password, user_email, user_name } = req.body;
    // check if the user exists
    let isUserExist = await emailinUserTable(req.body.user_email);

    if (isUserExist.length > 0) {
      message = "This email is already in use";

      return res.render("signup", { message });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(user_password, 10);

    // Sign JWT for the new user
    const token = jwt.sign({ user_email }, "secret_key", { expiresIn: "1y" });


    const leaveStatuData =  await checkLeaveStatus();


    res.cookie("emp_login", token, {
      httpOnly: true,
      secure: true,
      expires: new Date(Date.now() + 60 * 60 * 24 * 60 * 1000),
    });

    await insertNewUser(user_name, user_email, hashedPassword, token)

    delete req.session.isValiVerificationCode;

    return res.render("home-page",{
      todayLeaveData:leaveStatuData.todayLeaveData,
      tomorrowLeaveData:leaveStatuData.tomorrowLeaveData
    });
  } catch (error) {
    res.status(400).send({ message: "Error registering user.", error });
  }
};

const renderEmpCodeVerificationPage = async (req, res) => {

  message = "";
  return res.render("emp-code-verification", { message });

};

const empCodeVerification = async (req, res) => {
  try {
    const { verification_code } = req.body;

    const VERIFICATION_CODE = "Games101Animation101";
    req.session.isValiVerificationCode = false;

    if (VERIFICATION_CODE === verification_code) {
      req.session.isValiVerificationCode = true;

      return res.redirect("/signup");
    }

    // Store the flash message in the session storage
    message = "Invalid code!";

    return res.render("emp-code-verification", { message });
  } catch (error) {
    res.status(400).send({ message: "Error registering user.", error });
  }
};

const renderPasswordCodeVerification = async (req, res) => {
  message = "";
  return res.render("passwordCodeVerification", { message });
};

const renderPassword = async (req, res) => {
  
  if(req.session.isPasswordCodeVeri){
    message = "";
    return res.render("password-update", { message });
  }

  return res.render("passwordCodeVerification", { message:'' });

};

const passwordCodeVerification = async (req, res) => {
  try {
    const { verification_code } = req.body;

    const VERIFICATION_CODE = "Games121Animation121";
    req.session.isPasswordCodeVeri = false;

    if (VERIFICATION_CODE === verification_code) {
      req.session.isPasswordCodeVeri = true;

      return res.redirect("/password-update");
    }

    // Store the flash message in the session storage
    message = "Invalid code!";

    return res.render("passwordCodeVerification", { message });
  } catch (error) {
    res.status(400).send({ message: "Error registering user.", error });
  }
};

const submitUpdatedPassword = async (req, res) => {

  const { updated_password, email } = req.body;

  let isUserExist = await emailinUserTable(email);

  if (isUserExist.length == 0) {
    message = "This email is already in use";

    return  res.render("password-update",{ message});
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(updated_password, 10);

  // JWT token
  const token = jwt.sign({ email }, "secret_key", { expiresIn: "1y" });

  res.cookie("emp_login", token, {
    httpOnly: true,
    secure: true,
    expires: new Date(Date.now() + 60 * 60 * 24 * 60 * 1000),
  });

  await updatePassword(email, hashedPassword, token);

  return res.render("password-update", { message:'Password Updated Successfully' });
};

const editEmpInfo = async (req, res) => {

  console.log(req.body)

  try {
    const {emp_email,admin_email,emp_name,total_leaves,penalty,extra_leaves,currYear} = req.body

    const ISADMIN = await emailinUserTable(admin_email);

    if(!ISADMIN[0].is_admin){
      return
    }

    const ISEMPEXIST = await emailinUserTable(emp_email);

    if(!ISEMPEXIST.length > 0){
      return
    }


    let checkUserYearSQL = `SELECT * FROM emp_annual_records WHERE email=? AND year=?`;
    let checkUserYear = await executeDynamicSQL(checkUserYearSQL,[req.body.emp_email,currYear]);
    if(!checkUserYear.length>0){

      const addSQL = `INSERT INTO emp_annual_records(extra_leaves,total_leaves,penalty,year,email) VALUES (?,?,?,?,?)`
      const addValues = [extra_leaves,total_leaves,penalty,currYear,emp_email];

      await executeDynamicSQL(addSQL,addValues);

    }else{

      const updateSQL = `UPDATE emp_annual_records SET extra_leaves=?,total_leaves=?,penalty=? WHERE email=? AND year=?` 
      const updateValues = [extra_leaves,total_leaves,penalty,emp_email,currYear];

      await executeDynamicSQL(updateSQL,updateValues);

    }

    res.status(200).json({
      status: 'success',
  });
 
  } catch (error) {
    console.log(error)
    res.status(400).send({ message: "Error registering user.", error });
  }

};

const leaveApproval = async (req, res) => {

  try {


    const leave_id = req.body.leave_id;
    const action = req.body.action;
    let sql;
    let message 

    // Check if leaveId exists and action is valid
    if (!leave_id || (action !== 'approve' && action !== 'cancel')) {
        // return res.status(400).send('Invalid request');
        console.log('Invalid request')
    }


    if (action === 'approve') {
      sql = `UPDATE employee_leaves SET leave_approved=1 WHERE sno = ${leave_id}`
      console.log('approve')
      message = `The request has been approved by you `;
    } else if (action === 'cancel') {
      sql = `DELETE FROM employee_leaves WHERE sno = ${leave_id}`
      console.log('cancelled')
      message = `The request has been cancelled by you`;
    }

    const result =  await executeDynamicSQLByTable(sql)

    res.status(200).json({
      message
  });


  } catch (error) {
    console.log(error)
    res.status(400).send({ message: "Error -- ", error });
  }

};

const leaveCancel = async (req, res) => {

  try {

    const email =  verifyAuth(req.cookies.emp_login);

    const leave_id = req.body.leave_id;
    const action = req.body.action;
    let sql;
    let message 

    // Check if leaveId exists and action is valid
    if (!leave_id || (action !== 'approve' && action !== 'cancel')) {
        console.log('Invalid request')
    }

    if (action === 'approve') {
      sql = `DELETE FROM employee_leaves WHERE sno = ${leave_id}`;
      console.log('approve')
      message = `The request has been approved by you`;
    } else if (action === 'cancel') {

      sql = `UPDATE employee_leaves SET leave_approved=1 WHERE sno = ${leave_id}`;
      console.log('cancelled')
      message = `The request has been cancelled by you`;

    }

    const result =  await executeDynamicSQLByTable(sql)

    res.status(200).json({
      message
    });


  } catch (error) {
    console.log(error)
    res.status(400).send({ message: "Error -- ", error });
  }

};

const login = async (req, res) => {
  try {
    const user_email = req.body.user_email;

    // check if the user exists
    let isUserExist = await emailinUserTable(req.body.user_email);

    let LeavsData = await getLeavsData(req.body.user_email);

    const leaveStatuData = await checkLeaveStatus();

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

   let annualLeaves = 18;
   let remainingLeaves = annualLeaves - totalLeaveTakenCount;

   if (isUserExist.length > 0) {
     // Compare hashed password with the provided one
     const isMatch = await bcrypt.compare(
       req.body.user_password,
       isUserExist[0].password
     );

     if (!isMatch) {
       // return res.status(400).send({ message: "Invalid password!" });
       return res.render("login", {
         message: `Invalid password!`,
       });
     }

     if (isMatch) {
       // Sign JWT for the new user
       const token = jwt.sign({ user_email }, "secret_key", {
         expiresIn: "1y",
       });

       res.cookie("emp_login", token, {
         httpOnly: true,
         secure: true,
         expires: new Date(Date.now() + 60 * 60 * 24 * 60 * 1000),
       });

       await updateJWTToken(user_email, token);

       req.session.email = isUserExist[0].email;

      return res.redirect("/home-page");

     } else {
       return res.render("login", {
         message: `Password doesn't match`,
         Name: "",
         todayLeaveData: leaveStatuData.todayLeaveData,
         tomorrowLeaveData: leaveStatuData.tomorrowLeaveData,
         adminData:adminData[0]
       });
     }
   } else {
     return res.render("login", {
       message: `User doesn't exist`,
       Name: "",
       adminData:adminData[0]
     });
   }
 } catch (error) {
   console.log(error);
   res.send(error);
 }
}

module.exports = {
  signupAuth,
  renderSignupPage,
  empCodeVerification,
  renderEmpCodeVerificationPage,
  renderPasswordCodeVerification,
  passwordCodeVerification,
  renderPassword,
  submitUpdatedPassword,
  editEmpInfo,
  leaveApproval,
  leaveCancel,
  login
};


