const express = require('express');
const jsend = require('jsend');
const router = express.Router();
const ItemService = require('../services/ItemService');
const db = require('../models');
const itemService = new ItemService(db);
const attachUser = require('../middleware/attachUser');


router.use(jsend.middleware);

router.get('/', attachUser, async (req, res) => {
  try {
    const items = await itemService.getAllItems(!!req.user);
    res.jsend.success({ items });
  } catch (error) {
    res.jsend.fail({ error: error.message });
  }
});




module.exports = router;