const mongoose = require("mongoose");

const PostSchema = mongoose.Schema(
  {
    category: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    cover: {
      type: String,
      required: true,
    },
    readTime: {
      value: { type: Number, required: false, default: "1" },
      unit: { type: String, required: false, default: "minutes" },
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthorModel",
    },
    content: { type: String, required: true },
  },
  { timestamps: true, strict: true }
);

module.exports = mongoose.model("PostModel", PostSchema, "posts");
