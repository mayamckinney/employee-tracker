const mysql = require('mysql');
const inquirer = require('inquirer');
const cTable = require('console.table');
require('dotenv').config();


const host = mysql.createConnection(
    {
        host: 'localhost',
        port: 3306,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    }
);

host.connect(function(err) {
    if (err) {
      console.error('Error connecting: ' + err.stack);
      return;
    }
  
    console.log('Connected as ID: ' + host.threadId);
    init();
  });


init = () => {
    console.log("  ___            _                    _____            _           ");
    console.log(" | __|_ __  _ __| |___ _  _ ___ ___  |_   __ _ __ _ __| |_____ _ _ ");
    console.log(" | _|| '  \| '_ | / _ | || / -_/ -_)   | || '_/ _` / _| / / -_| '_|");
    console.log(" |___|_|_|_| .__|_\___/\_, \___\___|   |_||_| \__,_\__|_\_\___|_|  ");
    console.log("           |_|         |__/                                        ");

    showOptions();
};

showOptions = () => {
    inquirer.prompt([{
        type: 'list',
        name: 'choices',
        message: 'What would you like to do?',
        choices: ['View all employees',
            'View all departments',
            'View all roles',
            'Add a role',
            'Update an employee by role',
            'Add an employee',
            'Add department',
            'Exit']
    }])
        .then((answers) => {
            const { choices } = answers;

            switch (choices) {
                case "View all employees":
                    showEmployees();
                    break;
                case "View all departments":
                    showDepartments();
                    break;
                case "Update an employee by role":
                    updateEmployee();
                    break;
                case "View all roles":
                    showRoles();
                    break;
                case "Add a role":
                    addRole();
                    break;
                case "Add an employee":
                    addEmployee();
                    break;
                case "Add department":
                    addDepartment();
                    break;
                case "Exit":
                    process.exit();
            }
        });
};

showEmployees = () => {
    host.query("SELECT employee.first_name, employee.last_name, role.title, role.salary, department.name, CONCAT(e.first_name, ' ' , e.last_name) AS manager FROM employee INNER JOIN role on role.id = employee.role_id INNER JOIN department on department.id = role.department_id LEFT JOIN employee e on employee.manager_id = e.id;",

    function (err, res) {
        if (err) throw err;
        console.table(res);
        showOptions();
    });
};

showDepartments = () => {
    host.query("SELECT employee.first_name, employee.last_name, department.name AS department FROM employee JOIN role ON employee.role_id = role.id JOIN department ON role.department_id = department.id ORDER BY employee.id;",

    function (err, res) {
        if (err) throw err;
        console.table(res);
        showOptions();
    });
};

selectRole = () => {
    var roleArray = [];
    host.query("SELECT * FROM role",
    
    function(err, res) {
            if (err) throw err;
            for (var i = 0; i < res.length; i++) {
                roleArray.push(res[i].title);
            };
        });
    
    return roleArray;
};

selectManager = () => {
    managersArray = [];
    host.query("SELECT first_name, last_name FROM employee WHERE manager_id IS NULL",
    (err, res) => {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            managersArray.push(res[i].first_name);
        };
    });
};



updateEmployee = () => {
        host.query("SELECT * FROM employee", 
        (err, res) => {
          const employeeChoice = [];
          if (err) throw err;
          res.forEach(({ first_name, last_name, id }) => {
            employeeChoice.push({
              name: first_name + " " + last_name,
              value: id
            });
          });
          
          //get all the role list to make choice of employee's role
          host.query("SELECT * FROM role", 
          (err, res) => {
            const roleChoice = [];
            if (err) throw err;
            res.forEach(({ title, id }) => {
              roleChoice.push({
                name: title,
                value: id
                });
              });
           
            let questions = [
              {
                type: 'list',
                name: 'id',
                choices: employeeChoice,
                message: "Which employee's role would you like to update?"
              },
              {
                type: 'list',
                name: 'role_id',
                choices: roleChoice,
                message: "What is the employee's new role?"
              }
            ]
        
            inquirer.prompt(questions)
              .then(response => {
                const query = `UPDATE EMPLOYEE SET ? WHERE ?? = ?;`;
                host.query(query, [
                  {role_id: response.role_id},
                  "id",
                  response.id
                ], (err, res) => {
                  if (err) throw err;
                  
                  console.log("Successfully updated employee's role!");
                  showOptions();
                });
              })
              .catch(err => {
                console.error(err);
              });
            })
        });
      };

showRoles = () => {
    host.query("SELECT employee.first_name, employee.last_name, role.title AS title FROM employee JOIN role ON employee.role_id = role.id;",
    
    function(err, res) {
        if (err) throw err;
        console.table(res);
        showOptions();
    });
};

addRole = () => {
    host.query("SELECT role.title AS title, role.salary AS salary FROM role",
    
    function(err, res) {
        inquirer.prompt([
            {
                name: 'title',
                type: 'input',
                message: "What is the title of the role?"
            },
            {
                name: 'salary',
                type: 'input',
                message: "What is the salary of the role?"
            },
        ]).then(function(res) {
            host.query("INSERT INTO role SET ?",
            {
                title: res.title,
                salary: res.salary,
            },
            function(err) {
                if (err) throw err;
                console.table(res);
                showOptions();
            });
        });
    });
};

addEmployee = () => {
  host.query("SELECT * FROM employee", (err, res) => {
    if (err) throw err;
    const employeeChoice = [
      {
        name: 'none',
        value: 0
      }
    ]; //an employee could have no manager
    res.forEach(({ first_name, last_name, id }) => {
      employeeChoice.push({
        name: first_name + " " + last_name,
        value: id
      });
    });
    
    //get all the role list to make choice of employee's role
    host.query("SELECT * FROM ROLE", (err, res) => {
      if (err) throw err;
      const roleChoice = [];
      res.forEach(({ title, id }) => {
        roleChoice.push({
          name: title,
          value: id
          });
        });
     
      let questions = [
        {
          type: "input",
          name: "first_name",
          message: "What is the employee's first name?"
        },
        {
          type: "input",
          name: "last_name",
          message: "What is the employee's last name?"
        },
        {
          type: "list",
          name: "role_id",
          choices: roleChoice,
          message: "What is the employee's role?"
        },
        {
          type: "list",
          name: "manager_id",
          choices: employeeChoice,
          message: "Who is the employee's manager? (can be null)"
        }
      ]
  
      inquirer.prompt(questions)
        .then(response => {
          const query = `INSERT INTO EMPLOYEE (first_name, last_name, role_id, manager_id) VALUES (?)`;
          let manager_id = response.manager_id !== 0? response.manager_id: null;
          host.query(query, [[response.first_name, response.last_name, response.role_id, manager_id]], (err, res) => {
            if (err) throw err;
            console.log(`Successfully inserted employee ${response.first_name} ${response.last_name} with id ${res.insertId}!`);
            showOptions();
          });
        })
        .catch(err => {
          console.error(err);
        });
    });
  });
};

addDepartment = () => {
    inquirer.prompt([
        {
            name: 'name',
            type: 'input',
            message: "What is the name of the department?"
        },
    ]).then(function(res) {
        var sql = host.query("INSERT INTO department SET ?",
        {
            name: res.name
        },
        
        function(err) {
            if (err) throw err;
            console.table(res);
            showOptions();
        });
    });
};