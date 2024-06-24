const jwt = require("jsonwebtoken");
const { emailinUserTable } = require("../../models/auth");

function verifyAuth(cookie) {
  const decodedEmail = jwt.verify(cookie, "secret_key");

  return decodedEmail.user_email;
}

const verifyAuth1 = async (req, res, next) => {
  try {

    if (!req.cookies.emp_login) return res.redirect('/login');
    const decodedEmail = jwt.verify(req.cookies.emp_login, "secret_key");

    let user = await emailinUserTable(decodedEmail.user_email);
    req.session.user_email = user[0].email;
    req.session.user_name = user[0].user_name;
    req.session.user_data = user[0];

    next();
  } catch (error) {
    // Token is invalid or expired
    console.error(error.message);
  }
};

function requireAdmin(req, res, next) {
  try {

    // Check if emp_login cookie and user_data in session exist
    if (!req.cookies.emp_login || !req.session.user_data) {
      return res.redirect("/");
    }

    // Parse the JSON string from user_data.p1
    const parsedObject = JSON.parse(req.session.user_data.p1);

    // Check if the parsed object has 'LeavesAdmin' or 'MasterAdmin' property
    if (
      parsedObject &&
      (parsedObject.LeavesAdmin || parsedObject.MasterAdmin || parsedObject.ReadAdmin)
    ) {
      // If either 'LeavesAdmin' or 'MasterAdmin' property exists, proceed to the next middleware
      return next();
    } else {
      // If neither 'LeavesAdmin' nor 'MasterAdmin' property exists, redirect to "/"
      return res.redirect("/");
    }
  } catch (error) {
    // Handle JSON parsing error
    console.error("Error parsing JSON:", error+'ad');
    return res.status(500).send("Internal Server Error");
  }
};

function requireMasterAdmin(req, res, next) {
  try {

    // Check if emp_login cookie and user_data in session exist
    if (!req.cookies.emp_login || !req.session.user_data) {
    //   return res.redirect("/");
    }

    // Parse the JSON string from user_data.p1
    const parsedObject = JSON.parse(req.session.user_data.p1);

    // Check if the parsed object has the 'MasterAdmin' property
    if (parsedObject && parsedObject.MasterAdmin) {
      // If 'MasterAdmin' property exists, proceed to the next middleware
      return next();
    } else {
      // If 'MasterAdmin' property doesn't exist, redirect to "/"
      return res.redirect("/");
    }
  } catch (error) {
    // Handle JSON parsing error
    console.error("Error parsing JSON:", error+'ma');
    return res.status(500).send("Internal Server Error");
  }
};

function isEmpEnabled(req, res, next) {

  try {

    // Check if emp_login cookie and user_data in session exist
    if (!req.cookies.emp_login || !req.session.user_data) {
      return res.redirect("/");
    }

    // Parse the JSON string from user_data.p1
    const parsedObject = JSON.parse(req.session.user_data.p1);

    // Check if the parsed object has the 'employee' property
    if (parsedObject && parsedObject.Employee) {
      // If 'MasterAdmin' property exists, proceed to the next middleware
      return next();
    } else {
      // If 'MasterAdmin' property doesn't exist, redirect to "/"
      return res.redirect("/");
      return res.send('Unauthorized access!');
    }
    
  } catch (error) {
    // Handle JSON parsing error
    console.error("Error parsing JSON:", error+'emp');
    return res.status(500).send("Internal Server Error emp");
  }
};

module.exports = {
  verifyAuth,
  verifyAuth1,
  requireAdmin,
  requireMasterAdmin,
  isEmpEnabled
};
