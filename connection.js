const mysql2 = require("mysql2");

const db = mysql2.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "agrisite",
});
db.connect((err) => {
  if (err) {
    console.error("Error occured while connecting to MySQL " + err);
  }
  console.log("Successfully connected");
});

module.exports = { db };
