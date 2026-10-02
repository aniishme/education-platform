const express = require("express");
const {
    getUsers,
    updateUser,
    updateUserStatus
} = require("../controllers/userController");

const router = express.Router();

router.get("/", getUsers);
router.put("/:id", updateUser);
router.put("/:id/status", updateUserStatus);

module.exports = router;