const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const dotenv = require('dotenv').config();

const cors = require("cors");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// app.use(cors());

const PORT = 3000;

const mysql = require("mysql");
const pass = '12345678910111213'

// const connection = mysql.createConnection({
//   host: "35.195.17.158",
//   socketPath: '/cloudsql/test-project-307413:europe-west1:test-test-test',
//   // host: '35.228.187.188',
//   // socketPath:`/cloudsql/mercurial-ruler-307320:europe-west3:real-test-real`,
//   user: "user",
//   database: "mysql",
//   password: "123456",
//   port:'3306'
// });


const connection = mysql.createConnection({host: "95.163.180.235", user: "user", password: process.env.DATABASE_PASS, database: "MySQL-test", port: 3306});

// const connection = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   database: "rolling_retention",
//   password: "password",
// });

connection.connect(function (err) {
  if (err) {
    return console.error("Ошибка: " + err.message);
  } else {
    console.log("Подключение к серверу MySQL успешно установлено");
  }
});

app.post("/api/users", (req, res) => {
  const data = req.body.inputList;
  let dataArray = [];
  
  data.forEach(async element => {
    let arr = [];
    arr.push(element.userId);
    arr.push(element.dateRegistration);
    arr.push(element.dateLastActivity);
    await dataArray.push(arr)
  });

  const sql = `INSERT INTO users5(userId, dateRegistration, dateLastActivity) VALUES ?`;

  connection.query(sql, [dataArray], function (err, results) {
    if(err) throw err;
    console.log(results);
    console.log(123);
    res.status(200).end();
  });
});

app.get('/api/retention', (req, res) => {
  // Rolling Retention X day = 
  // (количество пользователей, вернувшихся в систему в X-ый день или позже) / 
  // (количество пользователей, установивших приложение X дней назад или раньше) * 100%.
  let sql = "SELECT * FROM users5";
  let query = connection.query(sql, (err, result) => {
    if (err) throw err;

    let nowTime = new Date().getFullYear()  + '.' + (new Date().getMonth() + 1) + '.' + new Date().getDate()
    let sevenDaysBefore = new Date (new Date(nowTime) - (1000 * 60 * 60 * 24 * 7) ) ;
    let oldUser = 0;
    let activeUser = 0;

    result.forEach(el => {
      let yearMonthDay = el.dateLastActivity.split('.').reverse();
      let realDateReg = new Date( el.dateRegistration.split('.').reverse() );
      let realDateLastActive = new Date( el.dateLastActivity.split('.').reverse() );

      if(realDateReg < sevenDaysBefore ) {
        oldUser += 1;
        if (realDateLastActive > sevenDaysBefore) activeUser += 1;
      }
    })
    let answer = (activeUser/oldUser) * 100 + '%'
    console.log(answer);
    res.json({ answer });
  });
})

app.get('/', (req, res) => {
  res.send('all work is good')
})

// app.get("/createdb", (req, res) => {
//   let sql = "create database nodemysql";
//   connection.query(sql, (err, result) => {
//     if (err) throw err;
//     // console.log(result);
//     res.send("database created...");
//   });
// });

// app.get("/createpoststable", (req, res) => {
//   let sql =
//     "CREATE TABLE users5(userId int, dateRegistration TEXT, dateLastActivity TEXT )";
//   connection.query(sql, (err, result) => {
//     if (err) throw err;
//     // console.log(result);
//     res.send("Posts table created...");
//   });
// });

app.listen(process.env.PORT, () => {
  console.log(`work at port - ${PORT}`);
});
