const express = require('express');
const router = express.Router();
const jsend = require('jsend');
const db = require("../models");
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

router.use(jsend.middleware);

router.post("/", async (req, res) => {
  const { fullname, username, email, password } = req.body;
  if (!fullname) {
    return res.jsend.fail({ fullname: "Fullname is required." });
  }
  if (!username) {
    return res.jsend.fail({ username: "Username is required." });
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
      fullname: fullname,
      username: username,
      email: email,
      EncryptedPassword: hashedPassword,
      Salt: salt
    });

    const totalUsers = await db.User.count();

    let adminRole = await db.Role.findOne({ where: { name: 'Admin' } });
    let userRole = await db.Role.findOne({ where: { name: 'User' } });
    
    if (!adminRole) {
      adminRole = await db.Role.create({ name: 'Admin' });
    }
    if (!userRole) {
      userRole = await db.Role.create({ name: 'User' });
    }

    
    if (totalUsers === 1) {
      await newUser.setRoles([adminRole]);
      return res.jsend.success({
        id: newUser.id,
        result: "You created an account with Admin role."
      });
    }

    await newUser.setRoles([userRole]);
    res.jsend.success({
      id: newUser.id,
      result: "You created an account with User role."
    });
  } catch (error) {
    if (error.name === 'SequelizeUniqueConstraintError') {
      const duplicateField = error.errors[0].path;
      if (duplicateField === 'username') {
        return res.jsend.fail({ username: 'Username already exists.' });
      }
    }
    console.error(error);
    res.jsend.error("Something went wrong with the signup process");
  }
});

module.exports = router;