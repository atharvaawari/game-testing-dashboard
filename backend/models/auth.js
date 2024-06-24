const con = require("./db_con");

const emailinUserTable = (Email) => {
    return new Promise((resolve, reject) => {
        con.query("SELECT * FROM `myl_employee` WHERE email = '" + Email + "' ", response = (err, rows) => {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        })
    })
}

const updatePassword = (EMAIL,PASSWORD,TOKEN) => {
    return new Promise((resolve, reject) => {
        con.query(`UPDATE myl_employee SET password='${PASSWORD}',jwt_token='${TOKEN}' WHERE email = '${EMAIL}'`, response = (err, rows) => {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        })
    })
}

const addLeaves = (DATA,EMP_EMAIL,EMP_ID) => {
    return new Promise((resolve, reject) => {

        for (let i = 0; i < DATA.length; i++) { 

            console.log(DATA[i])

        con.query(`INSERT INTO employee_leaves(sno, emp_id, email, emp_leave_date ,day_type ) VALUES (0,${EMP_ID},'${EMP_EMAIL}','${DATA[i].date}','${DATA[i].type}') `, response = (err, rows) => {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        })

        }  

    })
}

const removeLeaves = (DATA,EMP_EMAIL,EMP_ID) => {
    return new Promise((resolve, reject) => {

        for (let i = 0; i < DATA.length; i++) { 

        con.query(`UPDATE employee_leaves SET leave_approved = -1 WHERE emp_leave_date = '${DATA[i].date}' AND day_type = '${DATA[i].type}' AND email = '${EMP_EMAIL}' AND emp_id = '${EMP_ID}'  `, response = (err, rows) => {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        })

        }  

    })
}

const getLeavsData = (Email) => {
    return new Promise((resolve, reject) => {
        con.query("SELECT employee_leaves.sno, employee_leaves.emp_id, employee_leaves.email, employee_leaves.emp_leave_date, employee_leaves.day_type , myl_employee.total_leaves , myl_employee.extra_leaves, myl_employee.name  FROM employee_leaves INNER JOIN myl_employee ON employee_leaves.emp_id =  myl_employee.id WHERE leave_approved = true AND myl_employee.email = '" + Email + "' ", response = (err, rows) => {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        })
    })
}

const pendingLeaves = (Email) => {
    return new Promise((resolve, reject) => {
        con.query("SELECT employee_leaves.sno, employee_leaves.emp_id, employee_leaves.email, employee_leaves.emp_leave_date, employee_leaves.day_type , myl_employee.total_leaves , myl_employee.extra_leaves, myl_employee.name  FROM employee_leaves INNER JOIN myl_employee ON employee_leaves.emp_id =  myl_employee.id WHERE leave_approved = false AND myl_employee.email = '" + Email + "' ", response = (err, rows) => {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        })
    })
}

const getAllLeavsData = (yearVal) => {
    return new Promise((resolve, reject) => {
        con.query(`
        SELECT DISTINCT employee_leaves.sno, myl_employee.id, myl_employee.email, myl_employee.name, employee_leaves.emp_id, employee_leaves.emp_leave_date, employee_leaves.day_type, emp_annual_records.total_leaves, emp_annual_records.extra_leaves, emp_annual_records.penalty FROM myl_employee LEFT JOIN employee_leaves ON myl_employee.id = employee_leaves.emp_id AND employee_leaves.leave_approved = true AND employee_leaves.emp_leave_date LIKE '__-__-${yearVal}' LEFT JOIN emp_annual_records ON myl_employee.email = emp_annual_records.email AND emp_annual_records.year = ${yearVal} WHERE JSON_CONTAINS(myl_employee.p1, '{"Employee":true}', '$') = 1 ORDER BY myl_employee.name ASC; 
      `, response = (err, rows) => {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        })
    })
}


const insertNewUser = (user_name,user_email,hashedPassword,token) => {
    return new Promise((resolve, reject) => {
        con.query(`INSERT INTO myl_employee (name, email , password , jwt_token, total_leaves  ) VALUES (?, ?, ?,?,?)`, [user_name ,user_email, hashedPassword, token,18], response = (err, rows) => {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        })
    })
}

const updateJWTToken = (EMAIL,TOKEN) => {
    return new Promise((resolve, reject) => {
        con.query(`UPDATE myl_employee SET jwt_token='${TOKEN}' WHERE email = '${EMAIL}'`, response = (err, rows) => {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        })
    })
}

const executeDynamicSQL = (sqlquery,values) => {
    return new Promise((resolve, reject) => {
        con.query(sqlquery , values, response = (err, rows) => {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        })
    })
}

const executeDynamicSQLByTable = (SQLQUERY) => {
    return new Promise((resolve, reject) => {
        con.query(SQLQUERY , response = (err, rows) => {
            if (err) {
                reject(err)
            } else {
                resolve(rows)
            }
        })
    })
}


module.exports = { emailinUserTable,addLeaves,getLeavsData,getAllLeavsData,insertNewUser, updatePassword, updateJWTToken, executeDynamicSQL, executeDynamicSQLByTable, pendingLeaves,removeLeaves }