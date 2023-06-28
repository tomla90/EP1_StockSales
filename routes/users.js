const express = require("express");
const router = express.Router();
const jsend = require("jsend");
const UserService = require("../services/UserService");
const db = require("../models");
const authenticateJWT = require("../middleware/authenticateJWT");
const authorizeRoles = require("../middleware/authorizeRoles");

const userService = new UserService(db);

router.use(jsend.middleware);

router.delete(
  "/:userId",
  authenticateJWT,
  authorizeRoles("Admin"),
  async (req, res) => {
    const { userId } = req.params;

    if (!userId) {
      return res.jsend.fail({ userId: "User ID is required." });
    }

    try {
      const deletedUser = await userService.deleteUser(userId);

      if (!deletedUser) {
        return res.jsend.fail({ result: "User not found." });
      }

      return res.jsend.success({
        result: "User deleted successfully",
      });
    } catch (error) {
      console.error(error);
      res.jsend.error("Something went wrong with the deletion process");
    }
  }
);

module.exports = router;
