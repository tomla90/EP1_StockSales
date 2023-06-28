const express = require("express");
const jsend = require("jsend");
const router = express.Router();
const db = require("../models");
const UtilityService = require("../services/UtilityService");

const utilityService = new UtilityService(db);

router.use(express.json());
router.use(jsend.middleware);

router.post("/", async (req, res, next) => {
  try {
    const items = await utilityService.searchItems(req.body);
    res.jsend.success(items);
  } catch (error) {
    console.error(error);
    res.jsend.fail({ message: error.message });
  }
});

module.exports = router;
