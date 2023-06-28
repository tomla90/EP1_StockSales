const express = require("express");
const jsend = require("jsend");
const router = express.Router();
const CartService = require("../services/CartService");
const db = require("../models");
const cartService = new CartService(db);
const authenticateJWT = require("../middleware/authenticateJWT");
const authorizeRoles = require("../middleware/authorizeRoles");

router.use(jsend.middleware);

router.post(
  "/",
  authenticateJWT,
  authorizeRoles("Admin", "User"),
  async (req, res) => {
    try {
      const { itemId, quantity } = req.body;
      const newCartItem = await cartService.addItemToCart(
        req.user.id,
        itemId,
        quantity
      );
      res.jsend.success({ newCartItem });
    } catch (error) {
      res.jsend.error(error.message);
    }
  }
);

router.put(
  "/:id",
  authenticateJWT,
  authorizeRoles("Admin", "User"),
  async (req, res) => {
    try {
      const { quantity } = req.body;
      const updatedCartItem = await cartService.updateCartItem(
        req.user.id,
        req.params.id,
        quantity
      );
      res.jsend.success({ updatedCartItem });
    } catch (error) {
      res.jsend.error(error.message);
    }
  }
);

router.delete(
  "/:id",
  authenticateJWT,
  authorizeRoles("Admin", "User"),
  async (req, res) => {
    try {
      await cartService.deleteCartItem(req.user.id, req.params.id);
      res.jsend.success({ message: "Cart item deleted" });
    } catch (error) {
      res.jsend.error(error.message);
    }
  }
);

module.exports = router;
