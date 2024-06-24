const express = require("express");
const routes = express.Router();

const {
    addGameScore,
    upadetGameScore,
    gamesScore
 } = require("../controller/games-controller");
 const { verifyAuth1, isEmpEnabled } = require("../controller/utils/verify-cookies");

routes.post('/add-game-score', verifyAuth1, addGameScore);

routes.post('/upadet-game-score',verifyAuth1, upadetGameScore);

routes.get("/games-score", verifyAuth1, isEmpEnabled,  gamesScore);


module.exports = routes
