const { db } = require("../config/connection");

// Function to get product data from the database
function getProductData(req, res) {
  // Query to select product data from the 'frontproduct' table
  db.query(
    "SELECT product_id, name, photo, review, percent_off, rupees, stockStatus, delivery_charges, emi_per_month, emi_month, address, delivery_time FROM frontproduct",
    async (error, results, fields) => {
      if (error) {
        // Handle error if query fails
        console.error("Error querying MySQL: " + error);
        res
          .status(500)
          .json({ error: "Internal server error occurred in insecticide" });
        return;
      }

      try {
        // Fetch cart data from the database
        const cartData = await fetchCartData();

        // Convert BLOB image data to base64 and send the updated results as JSON response
        const updatedResults = results.map((result) => {
          const imageData = Buffer.from(result.photo, "binary").toString(
            "base64"
          );
          // Check if the product is in the cart
          const isInCart = cartData.some(
            (item) => item.product_id === result.product_id
          );
          return {
            ...result,
            photo: `data:image/jpeg;base64,${imageData}`,
            inCart: isInCart,
          };
        });

        res.json(updatedResults);
      } catch (fetchError) {
        console.error("Error fetching cart data:", fetchError);
        res.status(500).json({
          error: "Internal server error occurred while fetching cart data",
        });
      }
    }
  );
}

// Function to fetch cart data from the database
async function fetchCartData() {
  return new Promise((resolve, reject) => {
    // Query to select cart data from the 'cart' table
    db.query("SELECT product_id FROM cart", (error, results, fields) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(results);
    });
  });
}

// Function to get cart data from the database
function getCartData(req, res) {
  // Query to select cart data from the 'cart' table
  db.query(
    "SELECT product_id, name, photo, review, percent_off, rupees, stockStatus, quantity, delivery_charges, emi_per_month, emi_month, address, delivery_time FROM cart",
    (error, results, fields) => {
      if (error) {
        // Handle error if query fails
        console.error("Error querying MySQL: " + error);
        res.status(500).json({
          error:
            "Internal server error occurred in while getting data from cart",
        });
        return;
      }

      // Convert BLOB image data to base64 and send the updated results as JSON response
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

// Function to insert data into the cart table
function insertCartData(req, res) {
  try {
    const newItem = req.body;
    console.log("Received request to add to cart:", newItem);
    const binaryImage = newItem.photo
      ? Buffer.from(newItem.photo.split(",")[1], "base64")
      : null;

    // Query to insert or update cart item data
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

    // Execute the query with the provided parameters
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
          // Handle error if query execution fails
          console.error("Error inserting or updating cart item:", err);
          return res
            .status(500)
            .json({ error: "Internal server error in Cart" });
        }
        // Send the updated cart item data as JSON response
        res.json({ ...newItem });
      }
    );
  } catch (error) {
    // Handle unexpected errors
    console.error("Unexpected error in insertCartData:", error);
    res.status(500).json({ error: "Internal server error in Cart" });
  }
}

// Function to delete data from the cart table
function deleteFromCart(req, res) {
  try {
    const productId = req.params.id;
    const deleteQuery = "DELETE FROM cart WHERE product_id = ?";

    // Execute the delete query with the provided productId
    db.query(deleteQuery, [productId], (err, results) => {
      if (err) {
        // Handle error if query execution fails
        console.error("Error deleting cart item: ", err);
        return res.status(500).json({
          error: "Internal server error in cart while deleting item from Cart",
        });
      }
      // Send success message as JSON response
      res.json({ message: "Cart item deleted successfully" });
    });
  } catch (error) {
    // Handle unexpected errors
    console.error("Unexpected error in deleteCart Item: ", error);
    res.status(500).json({ error: "Internal server error in Cart" });
  }
}

// Function to update address in cart item data
function UpdateAddressFromCart(req, res) {
  try {
    const { productId } = req.params;
    const { address } = req.body;
    const fullAddress = `${address.pincode}, ${address.locality}, ${address.city}, ${address.state}, ${address.landmark}, ${address.addressType}`;
    const updateQuery = "UPDATE frontproduct SET address = ? ";
    console.log(req.params);
    console.log(address);
    // Execute the update query with the provided productId and address
    db.query(updateQuery, [fullAddress, productId], (err, results) => {
      if (err) {
        // Handle error if query execution fails
        console.error("Error updating address in cart item: ", err);
        return res.status(500).json({
          error: "Internal server error while updating address in cart item",
        });
      }
      // Send success message as JSON response
      res.json({ message: "Address updated successfully in cart item" });
    });
  } catch (error) {
    // Handle unexpected errors
    console.error("Unexpected error in updating address in cart item: ", error);
    res.status(500).json({ error: "Internal server error in Cart" });
  }
}

// Exporting all functions to be used in other parts of the application
module.exports = {
  getProductData,
  getCartData,
  insertCartData,
  deleteFromCart,
  UpdateAddressFromCart,
};
