const {executeDynamicSQLByTable} = require('../models/auth')


const getGammingSheet = async (req, res) => {

    try {
        const data = await executeDynamicSQLByTable(`SELECT * FROM game_testing`);

        res.status(200).json(data);

    } catch (error) {
        console.error('Error sending data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const addGameTestingSheet = async (req, res) => {

    try {
        for (const item of req.body.totalTesters) {
            await executeDynamicSQLByTable(`INSERT INTO game_testers_data(tester_id, sheet_id, data) VALUES (${item.id}, ${req.body.sheets}, '${JSON.stringify(req.body.data)}')`);
        }

        res.status(200).json(data);

    } catch (error) {
        console.error('Error sending data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getGameVersion = async (req, res) => {
    try {
        const data = await executeDynamicSQLByTable(`SELECT * 
      FROM game_version 
      WHERE game_id = ${Number(req.query.game)} 
      ORDER BY id DESC
      LIMIT 5;
      `);

        res.status(200).json(data);

    } catch (error) {
        console.error('Error sending data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const addGameVersion =  async (req, res) => {

    try {
  
      await executeDynamicSQLByTable(`INSERT INTO game_version(game_id , version_name, version_date) VALUES ('${Number(req.body.game)}','${req.body.version_name}',${JSON.stringify(req.body.release_date)})`);
  
      res.status(200).json({ message: 'success' });
  
    } catch (error) {
      console.error('Error sending data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  const getCurrentVersionData = async (req, res) => {

    try {
      const data = await executeDynamicSQLByTable(`
      SELECT * FROM game_changes WHERE version_id = ${Number(req.query.version)}`);
  
      res.status(200).json(data);
  
    } catch (error) {
      console.error('Error sending data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  const addFileData = async (req, res) => {

    try {
      const data = await executeDynamicSQLByTable(`INSERT INTO game_changes(game_id, version_id, data) VALUES (${parseInt(req.body.selectedGame)}, ${parseInt(req.body.selectedVersion)}, '${JSON.stringify(req.body.filesColsData)}')`);
  
      const insertId = Number(data.insertId)
      res.status(200).json({ insertId: insertId });
  
    } catch (error) {
      console.error('Error sending data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  const getChangesData = async (req, res) => {

    try {
      const data = await executeDynamicSQLByTable(`
      SELECT * FROM game_changes WHERE version_id = ${Number(req.query.version)}`);
  
      res.status(200).json(data);
  
    } catch (error) {
      console.error('Error sending data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  const getTestingData =  async (req, res) => {

    try {
      const data = await executeDynamicSQLByTable(`
      SELECT * FROM game_testers_data WHERE version_id = ${Number(req.query.version)}`);
  
      res.status(200).json(data);
  
    } catch (error) {
      console.error('Error sending data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  const addTestingFileData = async (req, res) => {

    try {
      const data = await executeDynamicSQLByTable(`INSERT INTO game_testers_data( version_id, data) VALUES (${parseInt(req.body.selectedVersion)}, '${JSON.stringify(req.body.filesColsData)}')`);
  
      const insertId = Number(data.insertId)
      res.status(200).json({ insertId: insertId });
  
    } catch (error) {
      console.error('Error sending data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }  
  };

  const updateChangesData = async (req, res) => {
    try {
      const NumselectedVersion = parseInt(req.body.selectedVersion)
      const updatedChangesDataString = JSON.stringify(req.body.updatedChangesData)
  
      // console.log(`Updating game_changes for version_id=${NumselectedVersion} with data=${updatedDataString}`);
      console.log("NumselectedVersion", NumselectedVersion)
      const data = await executeDynamicSQLByTable(`UPDATE game_changes SET data='${updatedChangesDataString}' WHERE version_id =${NumselectedVersion}`);
  
  
      res.status(200).json({ message: 'Data Request arvied' });
    } catch (error) {
      console.error('Error updating data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  const updateTestingData = async (req, res) => {
    try {
      const TesterId = parseInt(req.body.testerId)
      const updatedTesterDataString = JSON.stringify(req.body.updatedData)
      const currVersionId = parseInt(req.body.versionId)
  
      const data = await executeDynamicSQLByTable(
         `UPDATE game_testers_data SET data='${updatedTesterDataString}' WHERE version_id =${currVersionId} AND tester_id =${TesterId} `
      );
  
      res.status(200).json({ message: 'Data Request arvied' });
    } catch (error) {
      console.error('Error updating data:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

  module.exports = {
    getGammingSheet, 
    addGameTestingSheet, 
    getGameVersion, 
    addGameVersion, 
    getCurrentVersionData, 
    addFileData, 
    getChangesData, 
    getTestingData, 
    addTestingFileData, 
    updateChangesData, 
    updateTestingData
  };