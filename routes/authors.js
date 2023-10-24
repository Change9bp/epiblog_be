const express = require("express");
const author = express.Router();
const bcrypt = require("bcrypt");
const AuthorModel = require("../models/author");
const validatorAuthor = require("../middlewares/validatorAuthor");
const verifyToken = require("../middlewares/verifyToken");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const crypto = require("crypto");
require("dotenv").config();

//adesso che cripti le password ricordati di droppare il db degli utenti e rifarlo

//CLOUDINARY
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

//oggetto di configurazione middleware per cloudinary
const cloudStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "cartella_cloud",
    format: async (req, file) => "png",
    public_id: (req, file) => file.name,
  },
});

const cloudUpload = multer({ storage: cloudStorage });

author.post(
  "/authors/cloudUpload",
  cloudUpload.single("avatar"),
  async (req, res) => {
    //non mi interessa gestire altro se ne occupa cloudinary
    try {
      res.status(200).json({ avatar: req.file.path });
    } catch (error) {
      res.status(500).send({
        statusCode: 500,
        message: "internal server error",
      });
    }
  }
);

//FINE CLOUDINARY

//esprimo le rotte

// GET da provare con tests.http
author.get("/authors", async (req, res) => {
  const authors = await AuthorModel.find();
  try {
    res.status(200).send({
      statusCode: 200,
      authors,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Server internal error",
    });
  }
});

// GET BY ID da provare con tests.http
author.get("/authors/:_id", async (req, res) => {
  const { _id } = req.params;

  const author = await AuthorModel.findById(_id);

  if (!author) {
    return res.status(404).send({
      statusCode: 404,
      message: "this author does not exist",
    });
  }

  try {
    res.status(200).send({
      statusCode: 200,
      author,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Server internal error",
    });
  }
});

// POST
author.post("/authors", validatorAuthor, async (req, res) => {
  //imposto un lvl di criptazione 10
  const salt = await bcrypt.genSalt(10);
  //costante che cripta la password accetta due parametri, il primo cosa deve criptare ed il secondo con che metodo deve criptare
  const hashedPassword = await bcrypt.hash(req.body.password, salt);

  const newAuthor = new AuthorModel({
    name: req.body.name,
    lastName: req.body.lastName,
    email: req.body.email,
    dateOfBirth: req.body.dateOfBirth,
    avatar: req.body.avatar,
    password: hashedPassword, //passiamo la password criptata
  });
  try {
    const author = await newAuthor.save();

    res.status(200).send({
      statusCode: 200,
      message: "Author saved successfully",
      payload: author,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Server internal error",
    });
  }
});

//PUT

author.patch(
  "/authors/:_id",
  validatorAuthor,
  verifyToken,
  async (req, res) => {
    const { _id } = req.params;

    const authorExists = await AuthorModel.findById(_id);

    console.log("esiste l'autore??", authorExists);

    if (!authorExists) {
      return res.status(404).send({
        statusCode: 404,
        message: "Author does not exists",
      });
    }

    try {
      const dataToUpdate = req.body;
      const options = { new: true };

      const result = await AuthorModel.findByIdAndUpdate(
        _id,
        dataToUpdate,
        options
      );
      console.log("il try lo fa la patch?", result);
      res.status(200).send({
        statusCode: 200,
        message: "Author correctly updated",
        result,
      });
    } catch (error) {
      res.status(500).send({
        statusCode: 500,
        message: "Server internal error",
        error: error,
      });
    }
  }
);

//DELETE provare con tests.http

author.delete("/authors/:_id", verifyToken, (req, res) => {
  const { _id } = req.params;
  console.log(_id);
  try {
    const authorToDelete = AuthorModel.findByIdAndDelete(_id);
    if (!authorToDelete) {
      return res.status(404).send({
        statusCode: 404,
        message: "author dosent exists or already deleted",
      });
    }
    res.status(200).send({
      statusCode: 200,
      message: "author correctly deleted",
      authorToDelete,
    });
  } catch (error) {}
  res.status(500).send({
    statusCode: 500,
    message: "Server internal error",
  });
});

module.exports = author;
