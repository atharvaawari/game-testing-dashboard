const express = require("express");
const routes = express.Router();

const {
  signupAuth,
  renderSignupPage,
  empCodeVerification,
  renderEmpCodeVerificationPage,
  submitUpdatedPassword,
  renderPasswordCodeVerification,
  passwordCodeVerification,
  renderPassword,
  editEmpInfo,
  // gamesScore,
  leaveApproval,
  leaveCancel,
  login,
} = require("../controller/auth-controller");

routes.get("/emp-code-verification", renderEmpCodeVerificationPage);

routes.post("/emp-code-verification", empCodeVerification);

routes.get("/signup", renderSignupPage);

routes.post("/signup", signupAuth);

routes.get(
  "/password-update-code-verification",
  renderPasswordCodeVerification
);

routes.get("/password-update", renderPassword);

routes.post("/password-update", submitUpdatedPassword);

routes.post("/password-update-code-verification", passwordCodeVerification);

routes.post("/edit-userinfo", editEmpInfo);

routes.post("/approve-leave", leaveApproval);

routes.post("/cancel-leave", leaveCancel);

routes.post("/login", login);

routes.get("/login", async (req, res) => {
  return res.render("login", { message: `` });
});

routes.get("/logout", (req, res) => {

  req.session.destroy((err) => {
    if (err) {
      console.error('Error destroying session:', err);
      res.status(500).send('Internal Server Error');
    } else {
      // Clear the session cookie
      res.clearCookie('emp_login');  // Use the cookie name directly
  
      // If you want to log the cookies after clearing
      console.log(req.cookies);
  
      // Redirect after clearing the cookie
      return res.redirect('/home-page');
    }
  });
  

});

module.exports = routes;
