const express = require("express");
const comment = express.Router();
const CommentModel = require("../models/comment");
const validatorComment = require("../middlewares/validatorComment");
const verifyToken = require("../middlewares/verifyToken");

//GET SINGOLO COMMENTO DI UNO SPECIFICO POST da provare con tests.http

comment.get("/blogPosts/:idPost/comments/:idComment", async (req, res) => {
  const { idPost, idComment } = req.params;

  const specificPostBlogSingleComment = await CommentModel.find({
    postId: idPost,
    _id: idComment,
  });

  if (!specificPostBlogSingleComment) {
    res.status(404).send({
      statusCode: 404,
      message: "Comment not found",
    });
  }

  try {
    res.status(200).send({
      statusCode: 200,
      message: "single comment of a specific post finded",
      specificPostBlogSingleComment,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Server internal error",
    });
  }
});

//GET COMMENTI DI UN SINGOLO POST

comment.get("/blogPosts/:idPost/comments", verifyToken, async (req, res) => {
  const { idPost } = req.params;
  const findComments = await CommentModel.find({ postId: idPost }).populate({
    path: "author",
    select: "_id name lastName email avatar",
  });
  if (!findComments) {
    return res.status(404).send({
      statusCode: 404,
      message: "No comments on this post",
    });
  }
  try {
    res.status(200).send({
      statusCode: 200,
      message: "comment finded",
      findComments,
    });
  } catch (error) {
    res.status(500).send({
      statusCode: 500,
      message: "Server internal error",
    });
  }
});

//POST CON ID BLOGPOST

comment.post(
  "/blogPosts/:idPost",
  validatorComment,
  verifyToken,
  async (req, res) => {
    const { idPost } = req.params;
    const addComment = new CommentModel({
      commentText: req.body.commentText,
      rate: Number(req.body.rate),
      postId: idPost,
      author: req.body.author,
    });
    try {
      const comment = await addComment.save();

      res.status(200).send({
        statusCode: 200,
        message: "comment saved successfully",
        payload: comment,
      });
    } catch (error) {
      res.status(500).send({
        statusCode: 500,
        message: "Server internal error",
        error,
      });
    }
  }
);

//AGGIORNO CON CRUD PATCH UN COMMENTO SPECIFICO DI UN POST SPECIFICO

comment.patch(
  "/blogPosts/:idPost/comments/:idComment",
  validatorComment,
  verifyToken,
  async (req, res) => {
    const { idPost, idComment } = req.params;
    const specificPostBlogSingleComment = await CommentModel.find({
      postId: idPost,
      _id: idComment,
    });

    if (!specificPostBlogSingleComment) {
      res.status(404).send({
        statusCode: 404,
        message: "Comment not found",
      });
    }

    try {
      const dataToUpdate = req.body;
      const options = { new: true };
      const result = await CommentModel.findByIdAndUpdate(
        idComment,
        dataToUpdate,
        options
      );

      res.status(200).send({
        statusCode: 200,
        message: "Comment edited correctly",
        result,
      });
    } catch (error) {
      res.status(500).send({
        statusCode: 500,
        message: "Server internal error",
        error,
      });
    }
  }
);

//ELIMINO COMMENTO DI UNO SPECIFICO POST

comment.delete(
  "/blogPosts/:idPost/comments/:idComment",
  verifyToken,
  async (req, res) => {
    const { idPost, idComment } = req.params;
    const specificPostBlogSingleComment = await CommentModel.find({
      postId: idPost,
      _id: idComment,
    });

    if (!specificPostBlogSingleComment) {
      res.status(404).send({
        statusCode: 404,
        message: "Comment not found",
      });
    }
    try {
      const commentToDelete = await CommentModel.findByIdAndDelete(idComment);

      res.status(200).send({
        statusCode: 200,
        message: "COMMENT correctly deleted",
        commentToDelete,
      });
    } catch (error) {
      res.status(500).send({
        statusCode: 500,
        message: "Server internal error",
        error,
      });
    }
  }
);

module.exports = comment;
