const express = require("express");
const routes = express.Router();

const {
    officeLeave,
    viewLeaves,
    removeEmpLeaves, 
    submitLeaves 
 } = require("../controller/leave-controller");

const sitemapGen = require("../controller/testing-controller") 


 routes.get("/generate-sitemap-for", (req, res) => {

    sitemapGen.addUpdateSitemap(req.query.category)

    res.send(`<a href="http://localhost:3002/main-sitemap.xml">${req.query.category}</a>`);

});



module.exports = routes