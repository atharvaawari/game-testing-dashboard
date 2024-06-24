const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const mariadb = require("mariadb");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const app = express();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require('cors');

const {
  emailinUserTable,
  addLeaves,
  getLeavsData,
  getAllLeavsData,
  updateJWTToken,
  executeDynamicSQLByTable,
  executeDynamicSQL,
  removeLeaves,
  pendingLeaves,
} = require("./models/auth");

const { groupedByEmail } = require("./controller/utils/groupedByEmail");
const { checkLeaveStatus } = require("./controller/utils/getLeaveStatus");
const { verifyAuth, verifyAuth1, isEmpEnabled } = require("./controller/utils/verify-cookies");
const { weekYearData, moveItemsToBottom, getTarfetDoneCount } = require("./controller/utils/date-time");
const { getIdeaInnovation } = require("./controller/ideas-innovation-controller");

// Use EJS as templating engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Enable CORS for all routes

app.use(
  session({
    secret: "mySecretKey", // Use a strong secret key in production
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // Set this to true if serving over HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 1 day in milliseconds
    },
  })
);

app.use("/static", express.static("public"));
app.use(express.static("txt_file"));

// ____________________ Routers _____________________________

const gameRouter = require("./routes/game-router");
const authRouter = require("./routes/auth-router");
const empRouter = require("./routes/emp-router");
const leaveRouter = require("./routes/leave-router");
const contentUploadsRouter = require("./routes/content-uploads-route");
const ideasRouter = require("./routes/ideas-innovation-router");
const testingRouter = require("./routes/testing-router");
const attendanceRouter = require("./routes/attendance-router");

app.use(authRouter);
app.use(gameRouter);
app.use(empRouter);
app.use(leaveRouter);
app.use(contentUploadsRouter);
app.use(ideasRouter);
app.use(testingRouter);
app.use(attendanceRouter);

// ____________________ Routers _____________________________

app.get("/", async (req, res) => {
  if (req.cookies.emp_login) {
    return res.redirect("/home-page");
  }

  return res.redirect("/login");

});

app.get("/home-page", verifyAuth1, isEmpEnabled, async (req, res) => {

  try {

    if (req.cookies.emp_login) {
      const email = verifyAuth(req.cookies.emp_login);
      const adminData = await emailinUserTable(email);
      const leaveStatuData = await checkLeaveStatus();

      return res.render("home-page", {
        todayLeaveData: leaveStatuData.todayLeaveData,
        tomorrowLeaveData: leaveStatuData.tomorrowLeaveData,
        adminData: adminData[0]
      });
    }

    return res.redirect("/login");

  } catch (error) {
    res.send(error)
  }


});

app.get("/content-data", async (req, res) => {

  try {

    let data

    if (req.query.category == "game-videos") {
      data = await executeDynamicSQLByTable(`SELECT * 
      FROM game_video 
      WHERE channel = 'game-videos'`);

    } else if (req.query.category == "insta-fb-content") {
      data = await executeDynamicSQLByTable(`SELECT * 
        FROM insta_fb_content `);
    } else {
      data = await executeDynamicSQLByTable(`SELECT * 
      FROM content_house 
      WHERE channel = '${req.query.category}'`);
    }

    res.json(data);

  } catch (error) {
    console.error('Error sending data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});

app.post("/submit", async (req, res) => {

  try {

    if (req.body.channel == "game-videos") {

      await executeDynamicSQLByTable(`
      INSERT INTO game_video (
          title, 
          hindi_complete, hindi_published, 
          english_complete, english_published, 
          bangla_complete, bangla_published, 
          portuguese_complete,portuguese_published,
          channel
      ) 
      VALUES (
          '${req.body.title}',
          '${req.body.hindi_complete}', '${req.body.hindi_published}',
          '${req.body.english_complete}', '${req.body.english_published}',
          '${req.body.bangla_complete}', '${req.body.bangla_published}',
          '${req.body.portuguese_complete}', '${req.body.portuguese_published}',
          '${req.body.channel}'
      )
  `)


    } else {

      await executeDynamicSQLByTable(`
    INSERT INTO content_house (
        title, 
        hindi_complete, hindi_published, 
        english_complete, english_published, 
        bangla_complete, bangla_published, 
        telugu_complete, telugu_published, 
        tamil_complete, tamil_published, 
        malayalam_complete, malayalam_published, 
        portuguese_complete, portuguese_published, 
        spanish_complete, spanish_published, 
        kannada_complete,kannada_published,
        odia_complete,odia_published,
        insta_complete,insta_published,
        fb_complete,fb_published ,
        channel
    ) 
    VALUES (
        '${req.body.title}',
        '${req.body.hindi_complete}', '${req.body.hindi_published}',
        '${req.body.english_complete}', '${req.body.english_published}',
        '${req.body.bangla_complete}', '${req.body.bangla_published}',
        '${req.body.telugu_complete}', '${req.body.telugu_published}',
        '${req.body.tamil_complete}', '${req.body.tamil_published}',
        '${req.body.malayalam_complete}', '${req.body.malayalam_published}',
        '${req.body.portuguese_complete}', '${req.body.portuguese_published}',
        '${req.body.spanish_complete}', '${req.body.spanish_published}',
        '${req.body.kannada_complete}', '${req.body.kannada_published}',
        '${req.body.odia_complete}','${req.body.odia_published}',
        '${req.body.insta_complete}','${req.body.insta_published}',
        '${req.body.fb_complete}','${req.body.fb_published}',
        '${req.body.channel}'
    )
`);

    }

    res.status(200).json({ message: 'success' });

  } catch (error) {
    console.error('Error sending data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});

app.post("/submit-child", async (req, res) => {

  try {

    await executeDynamicSQLByTable(`
    INSERT INTO child_content_hub (
        title, 
        hindi_complete, hindi_published, 
        english_complete, english_published, 
        bangla_complete, bangla_published, 
        telugu_complete, telugu_published, 
        tamil_complete, tamil_published, 
        malayalam_complete, malayalam_published, 
        portuguese_complete, portuguese_published, 
        spanish_complete, spanish_published, 
        kannada_complete,kannada_published,
        odia_complete,odia_published,
        insta_complete,insta_published,
        fb_complete,fb_published,
        parent_id
    ) 
    VALUES (
        '${req.body.title}',
        '${req.body.hindi_complete}', '${req.body.hindi_published}',
        '${req.body.english_complete}', '${req.body.english_published}',
        '${req.body.bangla_complete}', '${req.body.bangla_published}',
        '${req.body.telugu_complete}', '${req.body.telugu_published}',
        '${req.body.tamil_complete}', '${req.body.tamil_published}',
        '${req.body.malayalam_complete}', '${req.body.malayalam_published}',
        '${req.body.portuguese_complete}', '${req.body.portuguese_published}',
        '${req.body.spanish_complete}', '${req.body.spanish_published}',
        '${req.body.kannada_complete}', '${req.body.kannada_published}',
        '${req.body.odia_complete}','${req.body.odia_published}',
        '${req.body.insta_complete}','${req.body.insta_published}',
        '${req.body.fb_complete}','${req.body.fb_published}',
        '${req.body.parent_id}'
       
    )
`);


    await executeDynamicSQLByTable(`UPDATE content_house SET child_count = child_count + 1 WHERE id = ${req.body.parent_id}`);

    res.status(200).json({ message: 'success' });

  } catch (error) {
    console.error('Error sending data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});

app.post("/update-content", async (req, res) => {

  try {

    if (req.body.channel == "game-videos") {

      await executeDynamicSQLByTable(`
    UPDATE game_video 
    SET 
      title = '${req.body.title}', 
      hindi_complete = '${req.body.hindi_complete}', 
      hindi_published = '${req.body.hindi_published}', 
      english_complete = '${req.body.english_complete}', 
      english_published = '${req.body.english_published}', 
      bangla_complete = '${req.body.bangla_complete}', 
      bangla_published = '${req.body.bangla_published}', 
      portuguese_complete = '${req.body.portuguese_complete}', 
      portuguese_published = '${req.body.portuguese_published}'
    WHERE id = ${req.body.id}
  `);

    } else {

      await executeDynamicSQLByTable(`
    UPDATE content_house 
    SET 
      title = '${req.body.title}', 
      hindi_complete = '${req.body.hindi_complete}', 
      hindi_published = '${req.body.hindi_published}', 
      english_complete = '${req.body.english_complete}', 
      english_published = '${req.body.english_published}', 
      bangla_complete = '${req.body.bangla_complete}', 
      bangla_published = '${req.body.bangla_published}', 
      telugu_complete = '${req.body.telugu_complete}', 
      telugu_published = '${req.body.telugu_published}', 
      tamil_complete = '${req.body.tamil_complete}', 
      tamil_published = '${req.body.tamil_published}',
      malayalam_complete = '${req.body.malayalam_complete}', 
      malayalam_published = '${req.body.malayalam_published}',
      portuguese_complete = '${req.body.portuguese_complete}', 
      portuguese_published = '${req.body.portuguese_published}',
      spanish_complete = '${req.body.spanish_complete}', 
      spanish_published = '${req.body.spanish_published}',
      kannada_complete = '${req.body.kannada_complete}', 
      kannada_published = '${req.body.kannada_published}',
      odia_complete = '${req.body.odia_complete}', 
      odia_published = '${req.body.odia_published}',
      insta_complete = '${req.body.insta_complete}', 
      insta_published = '${req.body.insta_published}',
      fb_complete = '${req.body.fb_complete}', 
      fb_published = '${req.body.fb_published}',
      timestamp = '${req.body.timestamp}'
    WHERE id = '${req.body.id}'
  `);

    }

    console.log(req.body)



    res.status(200).json({ message: 'success' });

  } catch (error) {
    console.error('Error sending data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});

app.post("/update-content-child", async (req, res) => {

  try {

    await executeDynamicSQLByTable(`
    UPDATE child_content_hub
    SET 
      title = '${req.body.title}', 
      hindi_complete = '${req.body.hindi_complete}', 
      hindi_published = '${req.body.hindi_published}', 
      english_complete = '${req.body.english_complete}', 
      english_published = '${req.body.english_published}', 
      bangla_complete = '${req.body.bangla_complete}', 
      bangla_published = '${req.body.bangla_published}', 
      telugu_complete = '${req.body.telugu_complete}', 
      telugu_published = '${req.body.telugu_published}', 
      tamil_complete = '${req.body.tamil_complete}', 
      tamil_published = '${req.body.tamil_published}',
      malayalam_complete = '${req.body.malayalam_complete}', 
      malayalam_published = '${req.body.malayalam_published}',
      portuguese_complete = '${req.body.portuguese_complete}', 
      portuguese_published = '${req.body.portuguese_published}',
      spanish_complete = '${req.body.spanish_complete}', 
      spanish_published = '${req.body.spanish_published}',
      kannada_complete = '${req.body.kannada_complete}', 
      kannada_published = '${req.body.kannada_published}',
      odia_complete = '${req.body.odia_complete}', 
      odia_published = '${req.body.odia_published}',
      insta_complete = '${req.body.insta_complete}', 
      insta_published = '${req.body.insta_published}',
      fb_complete = '${req.body.fb_complete}', 
      fb_published = '${req.body.fb_published}'
    WHERE id = '${req.body.id}'
  `);
    res.status(200).json({ message: 'success' });

  } catch (error) {
    console.error('Error sending data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});

app.get("/get-content-child-data", async (req, res) => {

  try {
    console.log(req.query.id)
    const data = await executeDynamicSQLByTable(`SELECT * FROM child_content_hub WHERE parent_id = ${Number(req.query.id)}`);

    res.status(200).json(data);

  } catch (error) {
    console.error('Error sending data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});


// _____________________________________________________


// app.get("/get-testing-data",async (req,res) => {

//   try {
//     console.log(req.query.sheetId)
//     const data = await executeDynamicSQLByTable(`SELECT * FROM game_testers_data WHERE tester_id = ${Number(req.query.testerId)} AND sheet_id = ${Number(req.query.sheetId)}`);

//     res.status(200).json(data);

//   } catch (error) {
//       console.error('Error sending data:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//   }

// });

// app.get("/get-testing-data",async (req,res) => {

//   try {
//     console.log(req.query.sheetId)
//     const data = await executeDynamicSQLByTable(SELECT * FROM game_testers_data WHERE tester_id = ${Number(req.query.testerId)} AND sheet_id = ${Number(req.query.sheetId)});

//     res.status(200).json(data);

//   } catch (error) {
//       console.error('Error sending data:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//   }

// });

app.get("/get-gaming-sheets", async (req, res) => {

  try {
    const data = await executeDynamicSQLByTable(`SELECT * FROM game_testing`);

    res.status(200).json(data);

  } catch (error) {
    console.error('Error sending data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});

app.post("/add-game-testing-sheet", async (req, res) => {

  try {


    for (const item of req.body.totalTesters) {
      await executeDynamicSQLByTable(`INSERT INTO game_testers_data(tester_id, sheet_id, data) VALUES (${item.id}, ${req.body.sheets}, '${JSON.stringify(req.body.data)}')`);
    }

    res.status(200).json(data);

  } catch (error) {
    console.error('Error sending data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});

app.get("/get-game-version", async (req, res) => {

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

});

app.post("/add-game-version", async (req, res) => {

  try {

    await executeDynamicSQLByTable(`INSERT INTO game_version(game_id , version_name, version_date) VALUES ('${Number(req.body.game)}','${req.body.version_name}',${JSON.stringify(req.body.release_date)})`);

    res.status(200).json({ message: 'success' });

  } catch (error) {
    console.error('Error sending data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});

app.get("/get-current-version-data", async (req, res) => {

  try {
    const data = await executeDynamicSQLByTable(`
    SELECT * FROM game_changes WHERE version_id = ${Number(req.query.version)}`);

    res.status(200).json(data);

  } catch (error) {
    console.error('Error sending data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});

app.post("/add-file-data", async (req, res) => {

  try {
    const data = await executeDynamicSQLByTable(`INSERT INTO game_changes(game_id, version_id, data) VALUES (${parseInt(req.body.selectedGame)}, ${parseInt(req.body.selectedVersion)}, '${JSON.stringify(req.body.filesColsData)}')`);

    const insertId = Number(data.insertId)
    res.status(200).json({ insertId: insertId });

  } catch (error) {
    console.error('Error sending data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});

app.get("/get-changes-data", async (req, res) => {

  try {
    const data = await executeDynamicSQLByTable(`
    SELECT * FROM game_changes WHERE version_id = ${Number(req.query.version)}`);

    res.status(200).json(data);

  } catch (error) {
    console.error('Error sending data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});

app.get("/get-testing-data", async (req, res) => {

  try {
    const data = await executeDynamicSQLByTable(`
    SELECT * FROM game_testers_data WHERE version_id = ${Number(req.query.version)}`);

    res.status(200).json(data);

  } catch (error) {
    console.error('Error sending data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});

app.post("/add-testing-file-data", async (req, res) => {

  try {
    const data = await executeDynamicSQLByTable(`INSERT INTO game_testers_data( version_id, data) VALUES (${parseInt(req.body.selectedVersion)}, '${JSON.stringify(req.body.filesColsData)}')`);

    const insertId = Number(data.insertId)
    res.status(200).json({ insertId: insertId });

  } catch (error) {
    console.error('Error sending data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }

});

app.post("/update-changes-data", async (req, res) => {
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
});

app.post("/update-testing-data", async (req, res) => {
  try {
    const TesterId = parseInt(req.body.testerId)
    const updatedTesterDataString = JSON.stringify(req.body.updatedData)
    const currVersionId = parseInt(req.body.versionId)
    
    // console.log(`Updating game_testers_data for tester_id=${TesterId} and version_id=${currVersionId} with data=${updatedTesterDataString}`);

    const data = await executeDynamicSQLByTable(
       `UPDATE game_testers_data SET data='${updatedTesterDataString}' WHERE tester_id =${TesterId} AND version_id =${currVersionId}`
    );

    res.status(200).json({ message: 'Data Request arvied' });
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// ___________________


// Serve static files from the 'client/build' directory
app.use(express.static(path.join(__dirname, 'client/game-testing')));

// Catch-all handler to serve index.html for any other routes
app.get('/game-testing-dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/game-testing', 'index.html'));
});

// Serve static files from the 'client/build' directory
app.use(express.static(path.join(__dirname, 'client/build')));

// Catch-all handler to serve index.html for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});


app.listen(3001, () => {
  console.log("Server running on http://localhost:3001");
});




