const express = require("express");
const mongoose = require("mongoose");
const authorRoute = require("./routes/authors");
const postRoute = require("./routes/posts");
const commentRoute = require("./routes/comments");
const emailRoute = require("./routes/sendEmail");
const loginRoute = require("./routes/login");
const gitRoute = require("./routes/github");
const cors = require("cors");
const path = require("path");
const PORT = 5050;

const app = express();

app.use("/public", express.static(path.join(__dirname, "./public")));

//MIDDLEWARE
app.use(express.json());
app.use(cors());
app.use("/", authorRoute);
app.use("/", postRoute);
app.use("/", commentRoute);
app.use("/", emailRoute);
app.use("/", loginRoute);
app.use("/", gitRoute);

mongoose.connect(
  "mongodb+srv://alecontestabile:Hadoken!@epicluster0.ottjc9x.mongodb.net/",
  { useNewUrlParser: true, useUnifiedTopology: true }
);

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Errore during db connection"));
db.once("open", () => console.log("database successfully connected"));
app.listen(PORT, () => console.log(`server up and running on port ${PORT}`));
