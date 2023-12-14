const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  price: {
    type: String,
  },
  
  image: {
    type: String,
  },
 
});

const Product = mongoose.model("Product", ProductSchema);

module.exports = Product;
