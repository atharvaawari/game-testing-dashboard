

const mariadb =require("mariadb/callback");

const con = mariadb.createConnection({
    host: 'localhost', 
    database: 'leavedb',
    user:'root', 
    password: ''

});

con.connect(err => {
    if (err) return console.error("Failed to connect");
    console.error(`Successfully connected to mariadb server: ${con.serverVersion()}`);
});

module.exports = con;


