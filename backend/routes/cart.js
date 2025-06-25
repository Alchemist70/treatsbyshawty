const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const User = require("../models/User");
const Product = require("../models/Product");

// @route   GET api/cart
// @desc    Get user's cart
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("cart.product");
    res.json(user.cart);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   POST api/cart
// @desc    Add item to cart
// @access  Private
router.post("/", auth, async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ msg: "Product not found" });
    }

    const user = await User.findById(req.user.id);
    const cartItemIndex = user.cart.findIndex(
      (item) => item.product.toString() === productId
    );

    if (cartItemIndex > -1) {
      user.cart[cartItemIndex].quantity = quantity;
    } else {
      user.cart.push({ product: productId, quantity });
    }

    await user.save();
    const populatedUser = await User.findById(req.user.id).populate(
      "cart.product"
    );
    res.json(populatedUser.cart);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/cart
// @desc    Update cart (batch operation)
// @access  Private
router.put("/", auth, async (req, res) => {
  const { cartItems } = req.body;
  try {
    const user = await User.findById(req.user.id);
    const newCart = cartItems.map((item) => ({
      product: item.product._id,
      quantity: item.quantity,
    }));
    user.cart = newCart;
    await user.save();

    const populatedUser = await User.findById(req.user.id).populate(
      "cart.product"
    );
    res.json(populatedUser.cart);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/cart
// @desc    Clear entire cart
// @access  Private
router.delete("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.cart = [];
    await user.save();
    res.json(user.cart);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

// @route   DELETE api/cart/:productId
// @desc    Remove item from cart
// @access  Private
router.delete("/:productId", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.cart = user.cart.filter(
      (item) => item.product.toString() !== req.params.productId
    );
    await user.save();
    const populatedUser = await User.findById(req.user.id).populate(
      "cart.product"
    );
    res.json(populatedUser.cart);
  } catch (error) {
    console.error(error.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
