const express = require("express");
const jsend = require("jsend");
const router = express.Router();
const CategoryService = require("../services/CategoryService");
const db = require("../models");
const categoryService = new CategoryService(db);

router.use(jsend.middleware);

router.get("/", async (req, res, next) => {
  try {
    const categories = await categoryService.getAllCategories();
    res.jsend.success({ categories });
  } catch (error) {
    res.jsend.fail({ error: error.message });
  }
});

module.exports = router;
