const express = require("express");

const {
    getActivities,
    createActivity
} = require("../controllers/activityController");

const router = express.Router();

router.get("/", getActivities);
router.post("/", createActivity);

module.exports = router;