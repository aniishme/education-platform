const express = require("express");

const {
    getEnrolments,
    createEnrolment
} = require("../controllers/enrolmentController");

const router = express.Router();

router.get("/", getEnrolments);
router.post("/", createEnrolment);

module.exports = router;