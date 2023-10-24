const express = require("express");
const login = express.Router();
const AuthorModel = require("../models/author");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//faremo una sola rotta, la post

login.post("/login", async (req, res) => {
  //ora che facciamo il login dobbiamo recuperare l'utente che stiamo cercando, lo cerchiamo per email:
  const author = await AuthorModel.findOne({ email: req.body.email });

  if (!author) {
    return res.status(404).send({
      statusCode: 404,
      message: "Author not find",
    });
  }

  //compariamo la validità della password, accetta due parametri il primo è la password inviata tramite login
  //il secondo è la password che abbiamo trovato nel modello Author

  const validPassword = await bcrypt.compare(
    req.body.password,
    author.password
  );
  if (!validPassword) {
    return res.status(400).send({
      statusCode: 400,
      message: "invalid email or password",
    });
  }

  //genero il token ed indico quali informazioni il token deve criptare
  const token = jwt.sign(
    {
      name: author.name,
      lastName: author.lastName,
      email: author.email,
      id: author._id,
    },
    process.env.JWT_SECRET,
    { expiresIn: "24h" }
  ); //accetta tre parametri, il primo un oggetto che contiene ciò che voglio criptare nel token
  //il secondo è la stringa segreta nel file .env
  //il terzo gli diciamo quanto vogliamo che questo token duri, dopo 24h in questo caso il token sarà scaduto, dopodichè dovrrà rieffettuare il login per ottenere un nuovo token valido

  //infine restituiamo il token nell'header:

  res.header("Authorization", token).status(200).send({
    message: "you are logged in correctly",
    statusCode: 200,
    token,
  });
});

module.exports = login;
