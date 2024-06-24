
const {
    emailinUserTable,
    addLeaves,
    getLeavsData,
    getAllLeavsData,
    insertNewUser,
    updatePassword,
    updateJWTToken,
    executeDynamicSQL,
    executeDynamicSQLByTable
  } = require("../models/auth");
  const { verifyAuth } = require("./utils/verify-cookies") 


const gamesMainPage = async (req, res) => {

    try {
  
  
        const sql = `SELECT * FROM games_score `;
        const empGamesData = await executeDynamicSQLByTable(sql);

        const sql1 = `SELECT games.page_link ,games.video_link,games.description, games.game_name, MAX(games_score.score) AS highest_score
        FROM games
        INNER JOIN games_score ON games.game_name = games_score.game
        GROUP BY games.game_name ORDER BY games.sno;
        `;
        const gamesData = await executeDynamicSQLByTable(sql1);

        
        // Calculate total scores and individual game scores for each user
        const userScores = empGamesData.reduce((acc, curr) => {
            if (!acc[curr.challengers]) {
                acc[curr.challengers] = { 
                    emp_id:curr.emp_id,
                    name: curr.name, 
                    challengers: curr.challengers,
                    total: 0,
                    games: {}
                };
            }
            if (!acc[curr.challengers].games[curr.game]) {
                acc[curr.challengers].games[curr.game] = 0;
            }
            acc[curr.challengers].games[curr.game] += parseInt(curr.score);
            acc[curr.challengers].total += parseInt(curr.score);
            return acc;
        }, {});
        
        // Sort users by total score from highest to lowest
        const sortedUsers = Object.values(userScores).sort((a, b) => b.total - a.total);
  
        const uniqueGames = [...new Set(empGamesData.map(data => data.game))];

        res.render('games/games-main-page',{uniqueGames:gamesData,sortedUsers:sortedUsers})
        
      
    } catch (error) {
      console.log(error)
      res.status(400).send({ message: "Error -- ", error });
    }
  
  };



const gamesPage = async (req, res) => {

    try {

        const sql = `SELECT * FROM games WHERE page_link = ?`;
        const gamesData = await executeDynamicSQL(sql,req.params.gameLink);

        const sql1 = `SELECT * FROM games_score WHERE game=? ORDER BY score DESC; `;
        const ranksData = await executeDynamicSQL(sql1,gamesData[0].game_name);

        res.render('games/game-page',{gamesData:gamesData,ranksData:ranksData})
        
      
    } catch (error) {
      console.log(error)
      res.status(400).send({ message: "Error -- ", error });
    }
  
  };



const playerPage = async (req, res) => {

    try {


      const sql = `SELECT * FROM games_score`
      const empGamesData = await executeDynamicSQLByTable(sql);
      
      // Calculate total scores and individual game scores for each user
      const userScores = empGamesData.reduce((acc, curr) => {
          if (!acc[curr.challengers]) {
              acc[curr.challengers] = { 
                  emp_id:curr.emp_id,
                  name: curr.name, 
                  challengers: curr.challengers,
                  total: 0,
                  games: {}
              };
          }
          if (!acc[curr.challengers].games[curr.game]) {
              acc[curr.challengers].games[curr.game] = 0;
          }
          acc[curr.challengers].games[curr.game] += parseInt(curr.score);
          acc[curr.challengers].total += parseInt(curr.score);
          return acc;
      }, {});
      
// Sort the users by total score in descending order
const rankedUsers = Object.values(userScores).sort((a, b) => b.total - a.total);

let rank = 1
for (const user of rankedUsers) {
  user.rank = rank
  rank++
}

const playerProfile = rankedUsers.find(emp => emp.emp_id === +req.params.playerID)

      res.render('games/player-profile',{playerProfile:playerProfile})
        
      
    } catch (error) {
      console.log(error)
      res.status(400).send({ message: "Error -- ", error });
    }
  
  };  


const gamesRanking = async (req, res) => {

  try {


      if (req.cookies.emp_login) {
  
        const email =  verifyAuth(req.cookies.emp_login)
        const sql = `SELECT * FROM games_score`
        const empGamesData = await executeDynamicSQLByTable(sql);
        
        // Calculate total scores and individual game scores for each user
        const userScores = empGamesData.reduce((acc, curr) => {
            if (!acc[curr.challengers]) {
                acc[curr.challengers] = { 
                    emp_id:curr.emp_id,
                    name: curr.name, 
                    challengers: curr.challengers,
                    total: 0,
                    games: {}
                };
            }
            if (!acc[curr.challengers].games[curr.game]) {
                acc[curr.challengers].games[curr.game] = 0;
            }
            acc[curr.challengers].games[curr.game] += parseInt(curr.score);
            acc[curr.challengers].total += parseInt(curr.score);
            return acc;
        }, {});
        
        // Sort users by total score from highest to lowest
        const sortedUsers = Object.values(userScores).sort((a, b) => b.total - a.total);
  
        const uniqueGames = [...new Set(empGamesData.map(data => data.game))];

        
        res.render('games/ranking-page',
        {
          email:email,
          sortedUsers:sortedUsers,
          uniqueGames:uniqueGames
        })

        
  
      }
  
    } catch (error) {
      console.log(error)
      res.status(400).send({ message: "Error -- ", error });
    }

}



const addGameScore = async (req, res) => {

  try {

    const email =  verifyAuth(req.cookies.emp_login)
    const gameScoreData = req.body;

    for (var i = 0; i < gameScoreData.length; i++) {

      let gameScore = +gameScoreData[i].score 

      if (isNaN(gameScore)) {
        gameScore = 0
      }

    const values = [gameScoreData[i].id ,gameScoreData[i].name.trim() ,gameScoreData[i].gamingName.trim() ,gameScoreData[i].gameName.trim(), Number(gameScore) ];
    const sql = `INSERT INTO games_score(emp_id, name, challengers, game, score) VALUES (?,?,?,?,?)`;
    await executeDynamicSQL(sql,values);

    }

    return res.status(200).json({
      Success: 'Data Added Successfully',
   });

    
  } catch (error) {
    console.log(error)
    res.status(400).send({ message: "Error -- ", error });
  }

};

const upadetGameScore = async (req, res) => {

  try {

    const { id, challengers, allUserGameScore } = req.body;

    for (var i = 0; i < allUserGameScore.length; i++) {

      const sql = `SELECT * FROM games_score WHERE game = ? AND emp_id = ?`;
      let isExist = await executeDynamicSQL(sql, [allUserGameScore[i].game,Number(id)]);

      if(isExist.length <1){

        const sql = `INSERT INTO games_score(emp_id,challengers, game, score) VALUES (?,?,?,?)`;
        let r = await executeDynamicSQL(sql, [Number(id),challengers,allUserGameScore[i].game,Number(allUserGameScore[i].score)]);

      }else{

        const sql = `UPDATE games_score SET score = ? , challengers = ? WHERE game = ? AND emp_id = ?`;
        let r = await executeDynamicSQL(sql, [
          Number(allUserGameScore[i].score),
          challengers,
          allUserGameScore[i].game,
          Number(id)
        ]);

        console.log(r)
      }

    }

    return res.status(200).json({
      Success: 'Data Updated Successfully',
   });

    
  } catch (error) {
    console.log(error)
    res.status(400).send({ message: "Error -- ", error });
  }

};


const gamesScore = async (req, res) => {

  try {

    if (req.cookies.emp_login) {


      let is_admin = false;

      const email =  verifyAuth(req.cookies.emp_login)

      const ISADMIN = await emailinUserTable(email);

      if(ISADMIN[0].is_admin=="admin" || ISADMIN[0].is_admin=="read_only_admin"){
        is_admin = true
      }

      const sql = `SELECT 
      gs.sno, 
      gs.emp_id, 
      me.name, 
      gs.challengers, 
      me.email, 
      gs.game, 
      gs.score,
      me.id 
    FROM 
      myl_employee me
    LEFT JOIN 
      games_score gs ON gs.emp_id = me.id 
    WHERE 
      JSON_CONTAINS(me.p1, '{"Employee":true}', '$') = 1 ;
    
    `;
      const empGamesData = await executeDynamicSQLByTable(sql);
      
      // Calculate total scores and individual game scores for each user
      const userScores = empGamesData.reduce((acc, curr) => {
          if (!acc[curr.name]) {
              acc[curr.name] = { 
                  emp_id:curr.emp_id,
                  id:curr.id,
                  name: curr.name, 
                  challengers: curr.challengers,
                  total: 0,
                  games: {}
              };
          }
          if (!acc[curr.name].games[curr.game]) {
              acc[curr.name].games[curr.game] = 0;
          }
          acc[curr.name].games[curr.game] += Number(curr.score);
          acc[curr.name].total += Number(curr.score);
          return acc;
      }, {});
      
      // Sort users by total score from highest to lowest
      const sortedUsers = Object.values(userScores).sort((a, b) => b.total - a.total);

      let uniqueGames = [...new Set(empGamesData.map(data => data.game))];

      uniqueGames = uniqueGames.filter(value => value !== null);

      let privilegeData ='';
      if (req.session.user_data && req.session.user_data.p1) {
        privilegeData = JSON.parse(req.session.user_data.p1);
      } else {
        console.log('Data not present or undefined.');
      }


      res.render('games-score',
      {
        email:email,
        sortedUsers:sortedUsers,
        uniqueGames:uniqueGames,
        privilegeData:privilegeData,
        adminData: req.session.user_data
      })

    }

  } catch (error) {
    console.log(error)
    res.status(400).send({ message: "Error -- ", error });
  }

};


const isAdmin = async (req, res, next) => {
  // Implement your authentication logic here
  // For simplicity, assuming the user is an admin

  const email =  verifyAuth(req.cookies.emp_login)

  const isAdmin = await emailinUserTable(email)

  if (isAdmin[0].is_admin == 'admin' ||isAdmin[0].is_admin == 'read_only_admin') {
    next();
  } else {
    res.status(403).json({ error: 'Unauthorized' });
  }
};

  module.exports = {
    gamesMainPage,
    gamesPage,
    playerPage,
    gamesRanking,
    addGameScore,
    upadetGameScore,
    gamesScore
  }