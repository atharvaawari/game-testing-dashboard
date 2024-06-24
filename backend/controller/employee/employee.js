// const { verifyAuth1 } = require("../utils/verify-cookies");
const jwt = require("jsonwebtoken");

const {
    executeDynamicSQL,
    executeDynamicSQLByTable,
    emailinUserTable,
  } = require("../../models/auth");

  const {
    getCurrentYear
  } = require("../utils/date-time");  

const addEmployee = async (req, res) => {

    try {

        const privileges = {
          "UploadsAdmin": false,
          "GameAdmin": false,
          "AnimationAdmin": false,
          "LeavesAdmin": false,
          "MasterAdmin": false,
          "Employee": true
        };
        
        const userPrivileges = req.body[3].Privileges;
         
        userPrivileges.forEach(privilege => {
      
          if (privileges.hasOwnProperty(privilege)) {
            privileges[privilege] = true;
     
          }
        });

        // First query
        let sql1 = 'INSERT INTO `myl_employee`(`name`, `email`, `total_leaves`, `p1`) VALUES (?,?,?,?)';
        let values1 = [req.body[0].Name, req.body[1].Email, req.body[2].Totalleaves, privileges];
        
        let result1 = await executeDynamicSQL(sql1, values1);
        
        // Second query using the obtained ID
        let sql2 = 'INSERT INTO `emp_annual_records`(`emp_id`, `extra_leaves`, `total_leaves`, `penalty`, `year`) VALUES (?,?,?,?,?)';
        let values2 = [result1.insertId, 0, req.body[2].Totalleaves, 0, 2023];
        
        let result2 = await executeDynamicSQL(sql2, values2);

        res.status(200).send({ message: "Success" });
      
    } catch (error) {
      console.log(error)
      res.status(400).send({ message: "Error -- ", error });
    }
  
}; 

const editEmployee = async (req, res) => {

  try {

      const privileges = {
        "UploadsAdmin": false,
        "GameAdmin": false,
        "AnimationAdmin": false,
        "LeavesAdmin": false,
        "MasterAdmin": false,
        "Employee": false
      };

      const userPrivileges = req.body[3].Privileges;
       
      userPrivileges.forEach(privilege => {
    
        if (privileges.hasOwnProperty(privilege)) {
          privileges[privilege] = true;
   
        }
      });

      console.log(req.body)


    const currYear = getCurrentYear()

    let checkUserYearSQL = `SELECT * FROM emp_annual_records WHERE email=?`;
    let checkUserYear = await executeDynamicSQL(checkUserYearSQL,req.body[1].Email);

    console.log(privileges)
    if(!checkUserYear.length>0){

      const addSQL = `INSERT INTO emp_annual_records(extra_leaves,total_leaves,penalty,year,email) VALUES (?,?,?,?,?)`;
      const addValues = [req.body[4].Extraleaves,req.body[2].Totalleaves,req.body[5].Penalty,currYear.currentYear,req.body[1].Email];

      await executeDynamicSQL(addSQL,addValues);

      
      const updateSQL1 = `UPDATE myl_employee SET p1=? WHERE email=?` 
      const updateValues1 = [privileges,req.body[1].Email];

      await executeDynamicSQL(updateSQL1,updateValues1);

    }else{

      const updateSQL = `UPDATE emp_annual_records SET extra_leaves=?,total_leaves=?,penalty=?,year=? WHERE email=?` 
      const updateValues = [req.body[4].Extraleaves,req.body[2].Totalleaves,req.body[5].Penalty,currYear.currentYear,req.body[1].Email];

      let a = await executeDynamicSQL(updateSQL,updateValues);


      const updateSQL1 = `UPDATE myl_employee SET p1=? WHERE email=?` 
      const updateValues1 = [privileges,req.body[1].Email];

      await executeDynamicSQL(updateSQL1,updateValues1);

    }

      res.status(200).send({ message: "Success" });
    
  } catch (error) {
    console.log(error)
    res.status(400).send({ message: "Error -- ", error });
  }

}; 

const adminDasboard = async (req, res) => {

    try {

      const currYear = getCurrentYear()

        let sql = `SELECT 
        DISTINCT myl_employee.email,
         myl_employee.id,
         myl_employee.name,
        myl_employee.privileges,
        myl_employee.p1,
        emp_annual_records.total_leaves,
        emp_annual_records.extra_leaves,
        emp_annual_records.penalty
    FROM 
        myl_employee
    LEFT JOIN 
        emp_annual_records ON myl_employee.email = emp_annual_records.email AND emp_annual_records.year = ${currYear.currentYear}
    ORDER BY 
        myl_employee.name ASC`;

        let empList = await executeDynamicSQL(sql);

        res.render('ms-admin/admin-main-page',{
            empList:empList,
            adminData:req.session.user_data
        })
      
    } catch (error) {
      res.send(error)
    }
  
};  

const updateEmployeeStatus = async (req, res) => {

}

module.exports = {
    addEmployee,
    adminDasboard,
    editEmployee
}


