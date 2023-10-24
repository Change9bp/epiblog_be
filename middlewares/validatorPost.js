const validatorPost = (req, res, next) => {
  const errors = [];

  const { title, category, content, readTime } = req.body;

  if (title && typeof title !== "string") {
    errors.push("Title must be a String");
  }

  if (category && typeof category !== "string") {
    errors.push("category must be a String");
  }

  if (content && typeof content !== "string") {
    errors.push("content must be a String");
  }

  if (
    readTime.hasOwnProperty("value") &&
    readTime.value !== undefined &&
    typeof readTime.value !== "number"
  ) {
    errors.push("read time value must be a Number");
  }

  if (
    readTime.hasOwnProperty("unit") &&
    readTime.unit !== undefined &&
    typeof readTime.unit !== "string"
  ) {
    errors.push("read time unit must be a String");
  }

  if (errors.length > 0) {
    res.status(400).send({ errors });
  } else {
    next();
  }
};

module.exports = validatorPost;
