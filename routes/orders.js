const express = require('express');
const router = express.Router();
const jsend = require('jsend');
const db = require('../models');
const OrderService = require('../services/OrderService');
const orderService = new OrderService(db);
const CartService = require('../services/CartService');
const cartService = new CartService(db);
const authenticateJWT = require('../middleware/authenticateJWT');
const authorizeRoles = require('../middleware/authorizeRoles');

router.use(jsend.middleware);

router.get('/', authenticateJWT, authorizeRoles('Admin', 'User'), async (req, res) => {
  try {
    if (req.user.roles.includes('Admin')) {
      const orders = await orderService.getAllOrders();
      res.jsend.success({ orders });
    } else if (req.user.roles.includes('User')) {
      const orders = await orderService.getUserOrders(req.user.id);
      res.jsend.success({ orders });
    } else {
      res.jsend.fail({ message: 'Not authorized.' });
    }
  } catch (error) {
    res.jsend.fail({ error: error.message });
  }
});

module.exports = router;