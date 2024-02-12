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

app.get("/api/productData", (req, res) => {
  db.query(
    "SELECT product_id, name, photo, color, review, percent_off, rupees, delivery_charges, emi_per_month, emi_month, address, delivery_time FROM frontproduct",
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
        const imageData = Buffer.from(result.photo, "binary").toString(
          "base64"
        );
        return {
          ...result,
          photo: `data:image/jpeg;base64,${imageData}`,
        };
      });

      res.json(updatedResults);
    }
  );
});

//getting cart data
app.get("/api/cart", (req, res) => {
  db.query(
    "SELECT product_id, name, photo, rupees, quantity FROM cart",
    (error, results, fields) => {
      if (error) {
        console.error("Error querying MySQL: " + error);
        res
          .status(500)
          .json({
            error:
              "Internal server error occurred in while getting data from cart",
          });
        return;
      }
      // Convert BLOB image data to base64
      const updatedResults = results.map((result) => {
        const imageData = Buffer.from(result.photo, "binary").toString(
          "base64"
        );
        return {
          ...result,
          photo: `data:image/jpeg;base64,${imageData}`,
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
      INSERT INTO cart (product_id, name, photo, rupees, quantity)
      VALUES (?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      photo = VALUES(photo),
      rupees = VALUES(rupees),
      quantity = VALUES(quantity)
    `;
    db.query(
      insertOrUpdateQuery,
      [
        req.params.id,
        newItem.name,
        binaryImage,
        newItem.rupees,
        newItem.quantity,
      ],
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
