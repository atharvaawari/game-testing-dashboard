// const express = require("express");
// const routes = express.Router();
const router = require("express").Router();

const {getGammingSheet, 
    addGameTestingSheet, 
    getGameVersion, 
    addGameVersion, 
    getCurrentVersionData, 
    addFileData, 
    getChangesData, 
    getTestingData, 
    addTestingFileData, 
    updateChangesData, 
    updateTestingData} = require('../controller/gameDashBoard-controller')

router.route('/get-gaming-sheets').get(getGammingSheet)
router.route('/add-game-testing-sheet').post(addGameTestingSheet)
router.route('/get-game-version').get(getGameVersion)
router.route('/add-game-version').post(addGameVersion)
router.route('/get-current-version-data').get(getCurrentVersionData)
router.route('/add-file-data').post(addFileData)
router.route('/get-changes-data').get(getChangesData)
router.route('/get-testing-data').get(getTestingData)
router.route('/add-testing-file-data').post(addTestingFileData)
router.route('/update-changes-data').post(updateChangesData)
router.route('/update-testing-data').post(updateTestingData)

// routes.get('/get-gaming-sheets', getGammingSheet)
// routes.post('/add-game-testing-sheet', addGameTestingSheet)
// routes.get('/get-game-version', getGameVersion)
// routes.post('/add-game-version', addGameVersion)
// routes.get('/get-current-version-data', getCurrentVersionData)
// routes.post('/add-file-data', addFileData)
// routes.get('/get-changes-data', getChangesData)
// routes.get('/get-testing-data', getTestingData)
// routes.post('/add-testing-file-data', addTestingFileData)
// routes.post('/update-changes-data', updateChangesData)
// routes.post('/update-testing-data', updateTestingData)

module.exports = router;