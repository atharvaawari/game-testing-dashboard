const express = require("express");
const routes = express.Router();

const {
  markAttendance,
  getAttendance
} = require("../controller/attendance-controller");

const { verifyAuth1, requireAdmin } = require("../controller/utils/verify-cookies");


routes.post("/mark-attendance",verifyAuth1, markAttendance);

routes.get("/get-attendance",verifyAuth1, getAttendance);


module.exports = routes;
