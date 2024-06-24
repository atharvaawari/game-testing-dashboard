// const jwt = require("jsonwebtoken");


function groupedByEmail(data) {

    return data.reduce((acc, user) => {
        if (!acc[user.email]) {
          acc[user.email] = [];
        }
        acc[user.email].push(user);
        return acc;

    }, {});
}


module.exports = {
    groupedByEmail
};

