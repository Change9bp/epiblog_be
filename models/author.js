const mongoose = require("mongoose");

const AuthorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    dateOfBirth: { type: String, required: true },
    avatar: {
      type: String,
      default:
        "https://ukpsf.com/wp-content/uploads/2019/09/Avatar-Default-300x300.png",
      required: false,
    },
  },
  { timestamps: true, strict: true }
);

module.exports = mongoose.model("AuthorModel", AuthorSchema, "authors");
