const express = require("express");
const routes = express.Router();

const {
    loadYoutubeHomePage,
    uploadYtData,
    addNotes,
    addWeeklyTarget,
    weeklyTargetChecked,
    weeklyTargetEdit,
    loadTasks,
    taskCount,
    moveTask
 } = require("../controller/content-activity-controller");
 const { addTaskSheet, deleteTask, getMyTasks, checkedMyTask, getMyTaskCountStatus, moveTaskByWeek, loadGamesTask, addGamesTask, addGamesRelease } = require("../controller/task-controller");
 const { verifyAuth1, isEmpEnabled } = require("../controller/utils/verify-cookies");

routes.get('/uploads-:category',verifyAuth1,isEmpEnabled, loadYoutubeHomePage);

routes.get('/tasks-:category', verifyAuth1, isEmpEnabled,loadTasks);

routes.post('/test-1', uploadYtData);

routes.post('/add-note', addNotes);

routes.post('/add-wekkly-target', addWeeklyTarget);

routes.post('/wekkly-target-is-checked', weeklyTargetChecked);

routes.post('/wekkly-target-is-edit', weeklyTargetEdit);

routes.post('/delete-task', deleteTask);

routes.get('/get-task-count', taskCount);

routes.post('/move-task', moveTask);

routes.post('/add-task-sheet', addTaskSheet);

routes.get('/my-tasks',verifyAuth1, isEmpEnabled,  getMyTasks);

routes.post('/my-tasks-checked',verifyAuth1,isEmpEnabled, checkedMyTask);

routes.get('/get-task-count-1',verifyAuth1 , getMyTaskCountStatus);

routes.post('/move-task-by-week',verifyAuth1 , moveTaskByWeek);

routes.get('/tasks-game',verifyAuth1 , isEmpEnabled, loadGamesTask);

routes.post('/add-game-release',verifyAuth1 , isEmpEnabled, addGamesRelease);

routes.post('/add-game-tasks',verifyAuth1 , isEmpEnabled, addGamesTask);


module.exports = routes