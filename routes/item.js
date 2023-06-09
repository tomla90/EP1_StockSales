const express = require('express');
const jsend = require('jsend');
const router = express.Router();
const ItemService = require('../services/ItemService');
const db = require('../models');
const itemService = new ItemService(db);
const authenticateJWT = require('../middleware/authenticateJWT');
const authorizeRoles = require('../middleware/authorizeRoles');

router.use(jsend.middleware);


router.post('/', authenticateJWT,authorizeRoles('Admin'), async (req, res, next) => {
  const { item_name, price, categoryId, description, sku, stock_quantity } = req.body; 
  const itemData = { item_name, price, description, sku, stock_quantity }; 
  
  try {
    const newItem = await itemService.createItem(itemData, categoryId);
    res.jsend.success({ newItem });
  } catch (error) {
    res.jsend.fail({ error: error.message });
  }
});



router.get('/:itemId', async (req, res, next) => {
  const { itemId } = req.params;
  try {
    const item = await itemService.getItemById(itemId);
    res.jsend.success({ item });
  } catch (error) {
    res.jsend.fail({ error: error.message });
  }
});

router.put('/:itemId', authenticateJWT,authorizeRoles('Admin'), async (req, res, next) => {
  const { itemId } = req.params;
  const { item_name, price, categoryId, description, sku, stock_quantity, img_url } = req.body;
  const updatedData = { item_name, price, description, sku, stock_quantity, img_url };

  try {
    const updatedItem = await itemService.updateItem(itemId, updatedData, categoryId);
    res.jsend.success({ updatedItem });
  } catch (error) {
    res.jsend.fail({ error: error.message });
  }
});

router.delete('/:itemId', authenticateJWT,authorizeRoles('Admin'), async (req, res, next) => {
  const { itemId } = req.params;

  try {
    await itemService.deleteItem(itemId);
    res.jsend.success({ message: 'Item deleted' });
  } catch (error) {
    res.jsend.fail({ error: error.message });
  }
});

module.exports = router;