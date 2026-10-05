const express = require("express");

const {
    getLearnerGrowth
} = require("../controllers/learnerGrowthController");

const router = express.Router();

router.get("/", getLearnerGrowth);

module.exports = router;