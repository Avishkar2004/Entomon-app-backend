const express = require("express");
const mysql2 = require("mysql2");
const app = express();
const PORT = 8000;
const cors = require("cors");
const { db } = require("./connection");

app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello world");
});

app.get("/insecticide", (req, res) => {
  db.query(
    "SELECT id, name, salePrice AS price, description, image FROM insecticide",
    (error, results, fields) => {
      if (error) {
        console.error("Error querying MySQL: " + error);
        res
          .status(500)
          .json({ error: "Internal server error occurred in insecticide" });
        return;
      }

      // Convert BLOB image data to base64
      const updatedResults = results.map((result) => {
        const imageData = Buffer.from(result.image, "binary").toString(
          "base64"
        );
        return {
          ...result,
          image: `data:image/jpeg;base64,${imageData}`,
        };
      });

      res.json(updatedResults);
    }
  );
});

app.get("/cart", (req, res) => {
  db.query(
    "SELECT id, name, price, image FROM cart",
    (error, results, fields) => {
      if (error) {
        console.error("Error querying MySQL: " + error);
        res
          .status(500)
          .json({ error: "Internal server error occurred in cart" });
        return;
      }

      // Convert BLOB image data to base64
      const updatedResults = results.map((result) => {
        const imageData = Buffer.from(result.image, "binary").toString(
          "base64"
        );
        return {
          ...result,
          image: `data:image/jpeg;base64,${imageData}`,
        };
      });

      res.json(updatedResults);
    }
  );
});

app.listen(PORT, () => {
  console.log("Server is running on 8000");
});
