const express = require('express');
const jsend = require('jsend');
const router = express.Router();
const CategoryService = require('../services/CategoryService');
const db = require('../models');
const categoryService = new CategoryService(db);
const authenticateJWT = require('../middleware/authenticateJWT');
const authorizeRoles = require('../middleware/authorizeRoles');

router.use(jsend.middleware);


router.get('/:categoryId', async (req, res, next) => {
  const { categoryId } = req.params;

  try {
    const category = await categoryService.getCategoryById(categoryId);
    res.jsend.success({ category });
  } catch (error) {
    res.jsend.fail({ error: error.message });
  }
});

router.post('/',authenticateJWT,authorizeRoles('Admin'), async (req, res, next) => {
  const { category } = req.body;

  try {
    const newCategory = await categoryService.createCategory(category);
    res.jsend.success({ newCategory });
  } catch (error) { 
    res.jsend.fail({ error: error.message });
  }
});

router.put('/:categoryId', authenticateJWT,authorizeRoles('Admin'), async (req, res, next) => {
  const { categoryId } = req.params;
  const { category } = req.body;

  try {
    const updatedCategory = await categoryService.updateCategory(categoryId, category);
    res.jsend.success({ updatedCategory });
  } catch (error) {
    res.jsend.fail({ error: error.message });
  }
});

router.delete('/:categoryId', authenticateJWT,authorizeRoles('Admin'), async (req, res, next) => {
  const { categoryId } = req.params;

  try {
    await categoryService.deleteCategory(categoryId);
    res.jsend.success({ message: 'Category deleted' });
  } catch (error) {
    res.jsend.fail({ error: error.message });
  }
});

module.exports = router;