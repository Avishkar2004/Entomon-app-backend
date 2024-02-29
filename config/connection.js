// Importing the mysql2 module for interacting with MySQL databases
const mysql2 = require("mysql2");

// Creating a connection object to the MySQL database
const db = mysql2.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "ento-app",
});

// Connecting to the MySQL database
db.connect((err) => {
  if (err) {
    // Logging an error message if connection fails
    console.error("Error occurred while connecting to MySQL: " + err);
  }
  // Logging a success message if connection is successful
  console.log("Successfully connected to MySQL database");
});

// Exporting the db object to be used in other parts of the application
module.exports = { db };
