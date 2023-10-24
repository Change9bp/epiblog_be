const express = require("express");
const { createTransport } = require("nodemailer");
const email = express.Router();

//config node mailer
const transporter = createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "lia.price@ethereal.email",
    pass: "6x9hEAQr6CYZBx6FJS",
  },
});

email.post("/send-email", (req, res) => {
  const { recipient, subject, text } = req.body;

  const mailOptions = {
    from: "noreply@miodominio.it",
    to: "tu@mailchericeve.it",
    subject,
    text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error(error);
      res.status(500).send("Error while sending mail");
    } else {
      console.log("email sended");
      res.status(200).send("Mail sended correctly");
    }
  });
});

module.exports = email;
