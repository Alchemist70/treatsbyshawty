const mongoose = require("mongoose");

const HomeContentSchema = new mongoose.Schema(
  {
    storyTitle: { type: String, default: "Our Story" },
    storySubtitle: { type: String, default: "" },
    storyImage: { type: String, default: "" }, // image URL or path
    storyText: { type: String, default: "" },
    storyButtonText: { type: String, default: "Read More" },
    storyButtonLink: { type: String, default: "/about" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HomeContent", HomeContentSchema);
