const express = require('express');
const router = express.Router();
const jsend = require('jsend');
const db = require("../models");
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

router.use(jsend.middleware);

router.post("/login", async (req, res) => {
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

router.post("/signup", async (req, res) => {
    const { username, email, password } = req.body;
    if (!username) {
      return res.jsend.fail({ username: "username is required." });
    }
    if (!email) {
      return res.jsend.fail({ email: "Email is required." });
    }
    if (!password) {
      return res.jsend.fail({ password: "Password is required." });
    }
  
    try {
      const salt = crypto.randomBytes(16);
      const hashedPassword = crypto.pbkdf2Sync(
        password,
        salt,
        310000,
        32,
        'sha256'
      );
  
      const newUser = await db.User.create({
        username: username,
        email: email,
        EncryptedPassword: hashedPassword,
        Salt: salt
      });
  
      
      const defaultRoles = ["User", "Admin"];
      const roles = await Promise.all(defaultRoles.map((roleName) => {
        return db.Role.findOrCreate({ where: { name: roleName } });
      }));
  
      const userRole = roles.find((role) => role[0].name === 'User');
      await newUser.setRoles(userRole[0]);
  
      res.jsend.success({ result: "You created an account." });
    } catch (error) {
      res.jsend.error("Something went wrong with the signup process");
    }
  });

module.exports = router;