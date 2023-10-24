const jwt = require("jsonwebtoken");
const express = require("express");
const mongoose = require("mongoose");
const AuthorModel = require("../models/author");

module.exports = async function (req, res, next) {
  //ottengo il token dalla request
  const token = req.header("Authorization");
  console.log("token del middleware backend?", token);
  if (!token) {
    return res.status(401).send({
      errorType: "Token not found",
      statusCode: 401,
      message: "if you want to use this endpoint token is required",
    });
  }

  try {
    console.log("arriva il token qui?");
    //verifichiamo il token che sia corretto
    //decodifica all'inverso ed accetta due parametri il primo il token ed il secondo la stringa segreta di codifica
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    console.log("verifico il verified del token decriptato", verified);

    const author = await AuthorModel.findById(verified.id);

    console.log("hai trovato author tramite id del token?", author);
    if (author) {
      next();
    }
  } catch (error) {
    return res.status(404).send({
      errorType: "Token error",
      statusCode: 404,
      message: "Token is not valid",
    });
  }
};
