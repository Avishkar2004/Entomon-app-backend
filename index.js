const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const status = require("express-status-monitor");
const compression = require("compression");
const startCluster = require("./Cluster/cluster");

const {
  getProductData,
  getCartData,
  insertCartData,
  deleteFromCart,
  UpdateAddressFromCart,
} = require("./controllers/user");

const PORT = 8000;

const startServer = () => {
  //! middleware is used to handle req, res cycle
  app.use(cors());

  app.use(bodyParser.json());
  //! to check our server status "localhost:8000/status"
  app.use(status());
  //! Compress all HTTP responses
  app.use(compression());

  //! This is a middleware/plugin
  app.use(express.urlencoded({ extended: false }));

  //! Router's
  app.get("/", (req, res) => {
    res.send("Hello world");
  });

  //! Route to print cluster PID
  app.get("/cluster-pid", (req, res) => {
    res.send(`Cluster PID: ${process.pid}`);
  });

  //! Getting data(on Home Page)
  app.get("/api/productData", getProductData);

  //! Getting cart data
  app.get("/api/cart", getCartData);

  //! For inserting data
  app.post("/cart/:id", insertCartData);

  //! From deleting cart
  app.delete("/cart/:id", deleteFromCart);

  //! For Update add in cart table
  app.put("/cart/:id", UpdateAddressFromCart);

  //! Server is Up
  app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
  });
};

startCluster(startServer);
