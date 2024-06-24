const express = require("express");
const routes = express.Router();

const { addIdeaInnovation, addLikeDislike, ideasInnovation, getIdeaInnovation } = require("../controller/ideas-innovation-controller");
const { verifyAuth1, requireAdmin , isEmpEnabled } = require("../controller/utils/verify-cookies");

routes.get("/ideas-and-innovation", verifyAuth1, isEmpEnabled,getIdeaInnovation);

routes.post("/add-idea-innovation",verifyAuth1, addIdeaInnovation);

routes.post("/idea-like-dislike", addLikeDislike);

routes.get('/get-idea-innovation', isEmpEnabled, verifyAuth1, ideasInnovation);


module.exports = routes
