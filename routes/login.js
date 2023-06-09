const express = require('express');
const router = express.Router();
const jsend = require('jsend');
const db = require("../models");
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

router.use(jsend.middleware);

router.post("/", async (req, res) => {
  const { username, password } = req.body;
  if (!username) {
    return res.jsend.fail({ username: "username is required." });
  }
  if (!password) {
    return res.jsend.fail({ password: "Password is required." });
  }

  try {
    const user = await db.User.findOne({ where: { username: username } });

    if (!user) {
      return res.jsend.fail({ result: "Incorrect username or password" });
    }

    const hashedPassword = crypto.pbkdf2Sync(
      password,
      user.Salt,
      310000,
      32,
      'sha256'
    );

    if (!crypto.timingSafeEqual(user.EncryptedPassword, hashedPassword)) {
      return res.jsend.fail({ result: "Incorrect username or password" });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.SECRET,
      { expiresIn: "1h" }
    );

    res.jsend.success({
      result: "You are logged in",
      id: user.id,
      username: user.username,
      token: token
    });
  } catch (error) {
    res.jsend.error("Something went wrong with the login process");
  }
});



module.exports = router;