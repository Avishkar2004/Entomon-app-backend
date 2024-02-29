const { db } = require("../config/connection");

function getProductData(req, res) {
  db.query(
    "SELECT product_id, name, photo, review, percent_off, rupees, stockStatus, delivery_charges, emi_per_month, emi_month, address, delivery_time FROM frontproduct",
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
}

function getCartData(req, res) {
  db.query(
    "SELECT product_id, name, photo, review, percent_off, rupees,stockStatus, quantity, delivery_charges, emi_per_month, emi_month, address, delivery_time FROM cart",
    (error, results, fields) => {
      if (error) {
        console.error("Error querying MySQL: " + error);
        res.status(500).json({
          error:
            "Internal server error occurred in while getting data from cart",
        });
        return;
      }
      // Convert BLOB image data to base64
      const updatedResults = results.map((result) => {
        let imageData = null;
        if (result.photo) {
          imageData = Buffer.from(result.photo, "binary").toString("base64");
        }
        return {
          ...result,
          photo: imageData ? `data:image/jpeg;base64,${imageData}` : null,
        };
      });
      res.json(updatedResults);
    }
  );
}

function insertCartData(req, res) {
  try {
    console.log(req.body);
    const newItem = req.body;
    console.log("Received request to add to cart:", newItem);
    // Convert base64 image to buffer
    const binaryImage = newItem.photo
      ? Buffer.from(newItem.photo.split(",")[1], "base64")
      : null;

      const insertOrUpdateQuery = `
      INSERT INTO cart (product_id, name, photo, rupees, stockStatus, quantity, review, percent_off, delivery_charges, delivery_time, emi_per_month, emi_month, address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
      name = VALUES(name),
      photo = VALUES(photo),
      rupees = VALUES(rupees),
      stockStatus = VALUES(stockStatus),
      quantity = VALUES(quantity),
      review = VALUES(review),
      percent_off = VALUES(percent_off),
      delivery_charges = VALUES(delivery_charges),
      delivery_time = VALUES(delivery_time),
      emi_per_month = VALUES(emi_per_month),
      emi_month = VALUES(emi_month),
      address = VALUES(address)
    `;
    

    db.query(
      insertOrUpdateQuery,
      [
        req.params.id,
        newItem.name,
        binaryImage,
        newItem.rupees,
        newItem.stockStatus,
        newItem.quantity,
        newItem.review,
        newItem.percent_off,
        newItem.delivery_charges,
        newItem.delivery_time,
        newItem.emi_per_month,
        newItem.emi_month,
        newItem.address,
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
    console.error("Unexpected error in insertCartData:", error);
    res.status(500).json({ error: "Internal server error in Cart" });
  }
}

function deleteFromCart(req, res) {
  try {
    const productId = req.params.id;
    const deleteQuery = "DELETE FROM cart WHERE product_id = ?";
    db.query(deleteQuery, [productId], (err, results) => {
      if (err) {
        console.error("Error deleting cart item: ", err);
        return res.status(500).json({
          error: "Internal server error in cart while deleting item from Cart",
        });
      }
      res.json({ message: "Cart item deleted successfully" });
    });
  } catch (error) {
    console.error("Unexpected error in deleteCart Item: ", error);
    res.status(500).json({ error: "Internal server error in Cart" });
  }
}

function UpdateAddressFromCart(req, res) {
  try {
    const { productId } = req.params; // Extract productId from request params
    const { address } = req.body; // Extract address object from request body

    const fullAddress = `${address.pincode}, ${address.locality}, ${address.city}, ${address.state}, ${address.landmark}, ${address.addressType}`;
    const updateQuery =
      "UPDATE frontproduct SET address = ? WHERE product_id = ?";
    // "UPDATE frontproduct SET address = ?";
    console.log(fullAddress); // Check if the fullAddress is correct
    console.log(res.name);

    db.query(updateQuery, [fullAddress, productId], (err, results) => {
      if (err) {
        console.error("Error updating address in cart item: ", err);
        return res.status(500).json({
          error: "Internal server error while updating address in cart item",
        });
      }
      res.json({ message: "Address updated successfully in cart item" });
    });
  } catch (error) {
    console.error("Unexpected error in updating address in cart item: ", error);
    res.status(500).json({ error: "Internal server error in Cart" });
  }
}

module.exports = {
  getProductData,
  getCartData,
  insertCartData,
  deleteFromCart,
  UpdateAddressFromCart,
};
