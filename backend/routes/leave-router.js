const express = require("express");
const routes = express.Router();

const {
    officeLeave,
    viewLeaves,
    removeEmpLeaves, 
    submitLeaves 
 } = require("../controller/leave-controller");
 const { verifyAuth1, requireAdmin, isEmpEnabled } = require("../controller/utils/verify-cookies");


routes.get('/office-leaves',isEmpEnabled , verifyAuth1, officeLeave);

routes.get('/view-leave',isEmpEnabled , verifyAuth1,requireAdmin, viewLeaves);

routes.post('/submit-leaves',submitLeaves);

routes.post('/remove-leaves', removeEmpLeaves);


module.exports = routes
