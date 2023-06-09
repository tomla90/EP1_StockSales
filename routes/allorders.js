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


router.get('/', authenticateJWT, authorizeRoles('Admin'), async (req, res) => {
    try {
      const orders = await orderService.getAllOrders();
      res.jsend.success({ orders });
    } catch (error) {
      res.jsend.fail({ error: error.message });
    }
  });


  router.get('/:orderId', authenticateJWT, authorizeRoles('Admin'), async (req, res) => {
    try {
        const order = await orderService.getOrderById(req.params.orderId);
        if (!order) {
            return res.jsend.fail({ message: 'Order not found.' });
        }
        res.jsend.success({ order });
    } catch (error) {
        res.jsend.fail({ error: error.message });
    }
});





  module.exports = router;