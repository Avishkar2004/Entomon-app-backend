const express = require("express");
const app = express();
const PORT = 8000;
const cors = require("cors");
const bodyParser = require("body-parser");
const { db } = require("./connection");

app.use(cors());
app.use(bodyParser.json());

//this is a middleware or plugin
app.use(express.urlencoded({ extended: false }));
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

//gettind
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

// For inserting data
app.post("/cart/:id", (req, res) => {
  try {
    const newItem = req.body;
    console.log("Received request to add to cart:", newItem);
    // Convert base64 image to buffer
    const binaryImage = newItem.image
      ? Buffer.from(newItem.image, "base64")
      : null;

    const insertOrUpdateQuery = `
      INSERT INTO cart (id, name, price, image)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      price = VALUES(price),
      image = VALUES(image)
      `;
    db.query(
      insertOrUpdateQuery,
      [newItem.id, newItem.name, newItem.price, binaryImage],
      (err, results) => {
        if (err) {
          console.error("Error inserting or updating cart item:", err);
          return res
            .status(500)
            .json({ error: "Internal server error in Cart" });
        }
        res.json({ ...newItem });
      }
    );
  } catch (error) {
    console.error("Unexpected error in /cart route:", error);
    res.status(500).json({ error: "Internal server error in Cart" });
  }
});

app.listen(PORT, () => {
  console.log("Server is running on 8000");
});
