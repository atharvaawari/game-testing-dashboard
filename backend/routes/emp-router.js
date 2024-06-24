const express = require("express");
const routes = express.Router();

const {
    addEmployee,
    adminDasboard,
    editEmployee
 } = require("../controller/employee/employee");

 const { verifyAuth1, requireMasterAdmin } = require("../controller/utils/verify-cookies");

routes.get('/admin-dasboard',verifyAuth1,requireMasterAdmin, adminDasboard);

routes.post('/add-employee', addEmployee);

routes.post('/edit-employee', editEmployee);

module.exports = routes
