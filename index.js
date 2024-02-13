const express = require("express");
const app = express();
const PORT = 8000;
const cors = require("cors");
const bodyParser = require("body-parser");
const {
  getProductData,
  getCartData,
  insertCartData,
} = require("./controllers/user");

app.use(cors());
app.use(bodyParser.json());

//this is a middleware or plugin
app.use(express.urlencoded({ extended: false }));
app.get("/", (req, res) => {
  res.send("Hello world");
});

app.get("/api/productData", getProductData);

//getting cart data
app.get("/api/cart", getCartData);

// For inserting data
app.post("/cart/:id", insertCartData);

app.listen(PORT, () => {
  console.log("Server is running on 8000");
});
