const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Order = require("../models/Order");

const COMPANY_CITY = "ibadan";
const WITHIN_CITY_FEE = 2000;
const OUTSIDE_CITY_FEE = 4000;
const LARGE_ORDER_THRESHOLD = 100000;
const LARGE_ORDER_DISCOUNT_PERCENTAGE = 0.35;

router.post("/calculate", auth, async (req, res) => {
  try {
    const { city, subtotal } = req.body;
    const userId = req.user.id;

    if (!city || subtotal === undefined) {
      return res
        .status(400)
        .json({ message: "City and subtotal are required." });
    }

    const userOrders = await Order.find({ user: userId });
    const isFirstOrder = userOrders.length === 0;
    const isWithinCity = city.toLowerCase().trim() === COMPANY_CITY;

    let deliveryFee = isWithinCity ? WITHIN_CITY_FEE : OUTSIDE_CITY_FEE;

    // Rule 1: First order in the company's city is free.
    if (isFirstOrder && isWithinCity) {
      deliveryFee = 0;
    }
    // Rule 2: 35% discount on delivery fee for orders over 100,000 NGN.
    // This does not apply if the fee is already 0.
    else if (subtotal > LARGE_ORDER_THRESHOLD) {
      const discount = deliveryFee * LARGE_ORDER_DISCOUNT_PERCENTAGE;
      deliveryFee -= discount;
    }

    res.json({ deliveryFee });
  } catch (error) {
    console.error("Delivery fee calculation error:", error);
    res
      .status(500)
      .json({ message: "Server error while calculating delivery fee." });
  }
});

module.exports = router;
