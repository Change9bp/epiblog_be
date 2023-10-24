const validatorComment = (req, res, next) => {
  const errors = [];

  const { commentText, rate } = req.body;

  if (commentText && typeof commentText !== "string") {
    errors.push("comment must be a String");
  }
  if (rate && typeof rate !== "number") {
    errors.push("rate must be a Number");
  }

  if (errors.length > 0) {
    res.status(400).send({ errors });
  } else {
    next();
  }
};

module.exports = validatorComment;
