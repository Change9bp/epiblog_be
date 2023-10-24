const validatorAuthor = (req, res, next) => {
  const errors = [];

  const { name, lastName, email, password, dateOfBirth } = req.body;

  if (name && typeof name !== "string") {
    errors.push("Name must be a String");
  }
  if (lastName && typeof lastName !== "string") {
    errors.push("lastName must be a String");
  }
  if (password && typeof password !== "string") {
    errors.push("password must be a String");
  }
  if (email && typeof email !== "string") {
    errors.push("email must be a String");
  }
  if (dateOfBirth && typeof dateOfBirth !== "string") {
    errors.push("date o birth must be a String");
  }

  if (errors.length > 0) {
    res.status(400).send({ errors });
  } else {
    next();
  }
};

module.exports = validatorAuthor;
