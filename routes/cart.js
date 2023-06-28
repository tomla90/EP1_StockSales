const express = require("express");
const jsend = require("jsend");
const router = express.Router();
const CartService = require("../services/CartService");
const db = require("../models");
const cartService = new CartService(db);
const authenticateJWT = require("../middleware/authenticateJWT");
const authorizeRoles = require("../middleware/authorizeRoles");

router.use(jsend.middleware);

router.get(
  "/",
  authenticateJWT,
  authorizeRoles("Admin", "User"),
  async (req, res) => {
    try {
      const cart = await cartService.getCart(req.user.id);
      res.jsend.success({ cart });
    } catch (error) {
      res.jsend.error(error.message);
    }
  }
);

router.delete(
  "/:cartId",
  authenticateJWT,
  authorizeRoles("Admin", "User"),
  async (req, res) => {
    try {
      const { cartId } = req.params;
      const userId = req.user.id;
      await cartService.deleteCart(cartId, userId);
      res.jsend.success({ message: "Cart deleted" });
    } catch (error) {
      res.jsend.error(error.message);
    }
  }
);

module.exports = router;
