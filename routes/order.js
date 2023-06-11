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



router.post('/:itemId?', authenticateJWT, authorizeRoles('Admin', 'User'), async (req, res) => {
  const { itemId } = req.params;

  try {
    let newOrder;
    if (itemId) {
      newOrder = await orderService.createOrder(req.user.id, itemId);
    } else {
      newOrder = await orderService.createOrder(req.user.id, null);
    }
    
    if (newOrder) {
      res.jsend.success(newOrder);
    } else {
      throw new Error('Order creation failed.');
    }
    
  } catch (error) {
    res.jsend.fail({ error: error.message });
  }
});

router.put('/:id', authenticateJWT, authorizeRoles('Admin'), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedOrder = await orderService.updateOrderStatus(id, status);
    res.jsend.success({ updatedOrder });
  } catch (error) {
    res.jsend.fail({ error: error.message });
  }
});

module.exports = router;