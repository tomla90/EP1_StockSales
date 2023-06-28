const express = require("express");
const jsend = require("jsend");
const router = express.Router();
const CartService = require("../services/CartService");
const db = require("../models");
const cartService = new CartService(db);
const authenticateJWT = require("../middleware/authenticateJWT");
const authorizeRoles = require("../middleware/authorizeRoles");

router.use(jsend.middleware);

router.get("/", authenticateJWT, authorizeRoles("Admin"), async (req, res) => {
  try {
    const carts = await cartService.getAllCarts();
    res.jsend.success({ carts });
  } catch (error) {
    res.jsend.error(error.message);
  }
});

module.exports = router;
