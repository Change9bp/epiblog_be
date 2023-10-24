const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
  {
    commentText: {
      type: String,
      required: true,
    },

    rate: {
      type: String,
      required: true,
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PostModel",
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthorModel",
    },
  },
  { timestamps: true, strict: true }
);

module.exports = mongoose.model("CommentModel", CommentSchema, "comments");
