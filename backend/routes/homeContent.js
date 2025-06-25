const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const HomeContent = require("../models/HomeContent");

// A simple admin check middleware
function isAdmin(req, res, next) {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

// @route   GET api/home-content
// @desc    Get the home page content
// @access  Public
router.get("/", async (req, res) => {
  try {
    let content = await HomeContent.findOne();
    if (!content) {
      // If no content exists, create it with default values
      content = new HomeContent();
      await content.save();
    }
    res.json(content);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route   PUT api/home-content
// @desc    Update the home page content
// @access  Private (Admin)
router.put("/", auth, isAdmin, async (req, res) => {
  const { title, subtitle, image, text, buttonText, buttonLink } = req.body;

  const contentFields = {};
  if (title !== undefined) contentFields.title = title;
  if (subtitle !== undefined) contentFields.subtitle = subtitle;
  if (image !== undefined) contentFields.image = image;
  if (text !== undefined) contentFields.text = text;
  if (buttonText !== undefined) contentFields.buttonText = buttonText;
  if (buttonLink !== undefined) contentFields.buttonLink = buttonLink;

  try {
    let content = await HomeContent.findOneAndUpdate(
      {}, // find one and only document
      { $set: contentFields },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    res.json(content);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
