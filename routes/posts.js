const express = require("express");
const post = express.Router();
const PostModel = require("../models/post");
const validatorPost = require("../middlewares/validatorPost");
const verifyToken = require("../middlewares/verifyToken");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const crypto = require("crypto");
require("dotenv").config();

//LA PARTE CON CLOUDINARY

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

//NUOVA POST CON CLOUDINARY

post.post(
  "/blogPosts/cloudUpload",
  cloudUpload.single("cover"),
  async (req, res) => {
    //non mi interessa gestire altro se ne occupa cloudinary
    try {
      res.status(200).json({ cover: req.file.path });
    } catch (error) {
      res.status(500).send({
        statusCode: 500,
        message: "internal server error",
      });
    }
  }
);

//LA PARTE SENZA CLOUDINARY
const internalStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    //posizione in cui salvare i file
    cd(null, "public");
  },
  //filename gestisce i nomi univoco ai file che vengono caricati, a prescindere dal nome di partenza del file
  filename: (req, file, cb) => {
    //gestisco il nome, il suffisso
    const uniqueSuffix = `${Date.now()}-${crypto.randomUUID()}`;
    //gestisco l'estenzione del file
    const fileExtension = file.originalname.split(".").pop();
    //eseguimo la callback con il titolo completo
    cb(null, `${file.fieldname}-${uniqueSuffix}.${fileExtension}`);
  },
});

const upload = multer({ storage: internalStorage });

//POST DI PROVA DI SOLO FILE IMAGE PER MIDDLEWARE MULTER

post.post("/blogPosts/uploads", upload.single("cover"), async (req, res) => {
  //rendo la rotta dinamica, recupero il dominio automaticamente
  const url = `${req.protocol}://${req.get("host")}`; //http://localhost:5050

  try {
    const imgUrl = req.file.filename; //il file che ci arriva dalla request
    res.status(200).json({ cover: `${url}/public/${imgUrl}` });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "internal server error",
    });
  }
});

//GET con pagination
post.get("/blogPosts", verifyToken, async (req, res) => {
  const { page, pageSize } = req.query;
  console.log("page", page, "pagesize", pageSize);
  const posts = await PostModel.find()
    .populate({ path: "author", select: "_id name lastName email avatar" })
    .limit(pageSize)
    .skip((page - 1) * pageSize);

  const totalPosts = await PostModel.count();

  try {
    res.status(200).send({
      statusCode: 200,
      currentPage: Number(page),
      totalPages: Math.ceil(totalPosts / pageSize),
      posts,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "internal server error",
    });
  }
});

//da provare con tests.http
//GET BY TITLE CON QUERY:
post.get("/blogPosts/search", async (req, res) => {
  const { title } = req.query;
  try {
    const postByTitle = await PostModel.find({
      title: {
        $regex: title,
        $options: "i",
      },
    });

    res.status(200).send(postByTitle);
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Server internal error",
      error,
    });
  }
  console.log("ciao pino");
});

//GET BY ID

post.get("/blogPosts/:_id", async (req, res) => {
  const { _id } = req.params;

  const post = await PostModel.findById(_id);
  if (!post) {
    return res.status(404).send({
      statusCode: 404,
      message: "ID post dosent exists",
    });
  }

  try {
    res.status(200).send({
      statusCode: 200,
      message: "post finded",
      post,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Server internal error",
    });
  }
});

//POST
post.post("/blogPosts", verifyToken, validatorPost, async (req, res) => {
  const addPost = new PostModel({
    category: req.body.category,
    title: req.body.title,
    cover: req.body.cover,
    readTime: { value: req.body.readTime.value, unit: req.body.readTime.unit },
    author: req.body.author,
    content: req.body.content,
  });

  try {
    const post = await addPost.save();

    res.status(200).send({
      statusCode: 200,
      message: "post saved successfully",
      payload: post,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Server internal error",
      error,
    });
  }
});

//PATCH

post.patch("/blogPosts/:_id", verifyToken, validatorPost, async (req, res) => {
  const { _id } = req.params;
  const postExists = await PostModel.findById(_id);
  if (!postExists) {
    return res.status(404).send({
      statusCode: 404,
      message: "Post dosent exsists or already deleted",
    });
  }

  try {
    const dataToUpdate = req.body;
    const options = { new: true };
    const result = await PostModel.findByIdAndUpdate(
      _id,
      dataToUpdate,
      options
    );

    res.status(200).send({
      statusCode: 200,
      message: "Post edited correctly",
      result,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Server internal error",
      error,
    });
  }
});

//DELETE

post.delete("/blogPosts/:_id", verifyToken, validatorPost, async (req, res) => {
  const { _id } = req.params;

  const delPost = await PostModel.findById(_id);
  if (!delPost) {
    return res.status(404).send({
      statusCode: 404,
      message: "Post dosent exsists or already deleted",
    });
  }
  try {
    const postToDelete = await PostModel.findByIdAndDelete(_id);

    res.status(200).send({
      statusCode: 200,
      message: "post correctly deleted",
      postToDelete,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Server internal error",
      error,
    });
  }
});

module.exports = post;
